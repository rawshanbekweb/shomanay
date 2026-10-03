export type LngLat = [number, number];
type P = [number, number];

/** Gorizontal masshtab: lng ni cos(lat) ga ko‘paytirib, metrik jihatdan to‘g‘ri tekislik olamiz. */
const KX = Math.cos((42.63 * Math.PI) / 180);
const proj = ([lng, lat]: LngLat): P => [lng * KX, lat];
const unproj = ([x, y]: P): LngLat => [x / KX, y];

function hull(points: P[]): P[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: P, a: P, b: P) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: P[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: P[] = [];
  for (const p of [...pts].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

function chaikin(poly: P[], rounds: number): P[] {
  let pts = poly;
  for (let r = 0; r < rounds; r++) {
    const next: P[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      next.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    pts = next;
  }
  return pts;
}

/** Sutherland–Hodgman: a·x + b·y ≤ c yarım tekisligi bo‘yicha kesish. */
function clip(poly: P[], a: number, b: number, c: number): P[] {
  const out: P[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const fp = a * p[0] + b * p[1] - c;
    const fq = a * q[0] + b * q[1] - c;
    if (fp <= 0) out.push(p);
    if (fp * fq < 0) {
      const t = fp / (fp - fq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  return out;
}

export interface Territories {
  /** MFY id → yopiq halqa [lng, lat][] */
  cells: Record<string, LngLat[]>;
  /** rayonning umumiy chegarasi */
  boundary: LngLat[];
}

/**
 * MFY markazlaridan Voronoi bo‘linmalari quriladi va rayon konturiga kesiladi.
 * Kontur — barcha nuqtalarning qavariq qobig‘i, biroz kengaytirilgan va yumaloqlangan.
 */
export function buildTerritories(sites: { id: string; center: LngLat }[], extra: LngLat[], gap = 0.035, realOutline?: LngLat[]): Territories {
  if (!sites.length) return { cells: {}, boundary: [] };
  const sp = sites.map((s) => ({ id: s.id, p: proj(s.center) }));
  const all: P[] = [...sp.map((s) => s.p), ...extra.map(proj)];
  const cx = all.reduce((s, p) => s + p[0], 0) / all.length;
  const cy = all.reduce((s, p) => s + p[1], 0) / all.length;
  let h = hull(all);
  const span = Math.max(...all.map((p) => p[0])) - Math.min(...all.map((p) => p[0])) || 0.02;
  if (h.length < 3) h = [[cx - span, cy - span], [cx + span, cy - span], [cx + span, cy + span], [cx - span, cy + span]];
  const grown = h.map(([x, y]): P => {
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.hypot(dx, dy) || 1;
    return [cx + dx * 1.22 + (dx / d) * span * 0.08, cy + dy * 1.22 + (dy / d) * span * 0.08];
  });
  // Haqiqiy (OSM) chegara berilsa — shu ishlatiladi, aks holda markazlardan hisoblangan kontur.
  const real = realOutline && realOutline.length > 3 ? realOutline.slice(0, -1).map(proj) : null;
  const outline = real ?? chaikin(grown, 3);

  const cells: Record<string, LngLat[]> = {};
  sp.forEach((s) => {
    let poly: P[] = outline;
    sp.forEach((o) => {
      if (o.id === s.id || !poly.length) return;
      poly = clip(poly, o.p[0] - s.p[0], o.p[1] - s.p[1], (o.p[0] ** 2 + o.p[1] ** 2 - s.p[0] ** 2 - s.p[1] ** 2) / 2);
    });
    if (!poly.length) return;
    const mx = poly.reduce((a, p) => a + p[0], 0) / poly.length;
    const my = poly.reduce((a, p) => a + p[1], 0) / poly.length;
    const shrunk = poly.map(([x, y]): P => [x + (mx - x) * gap, y + (my - y) * gap]);
    const ring = shrunk.map(unproj);
    cells[s.id] = [...ring, ring[0]];
  });
  const b = outline.map(unproj);
  return { cells, boundary: [...b, b[0]] };
}

export function bboxOf(ring: LngLat[]): [LngLat, LngLat] {
  const xs = ring.map((p) => p[0]);
  const ys = ring.map((p) => p[1]);
  return [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
}

/** Chegara bo‘ylab ingichka halqa (tashqi kontur = markazdan biroz kattalashtirilgan) — 3D "devor" uchun. */
export function borderRing(boundary: LngLat[], grow = 1.012): LngLat[][] {
  if (boundary.length < 4) return [];
  let pts = boundary.slice(0, -1);
  // tashqi halqa soat miliga qarshi (CCW), ichki teshik esa teskari bo‘lishi shart
  const area = pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + (p[0] * q[1] - q[0] * p[1]); }, 0);
  if (area < 0) pts = [...pts].reverse();
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const outer = pts.map(([x, y]): LngLat => [cx + (x - cx) * grow, cy + (y - cy) * grow]);
  return [[...outer, outer[0]], [...pts, pts[0]].reverse()];
}

/** Rayondan tashqarini yopuvchi niqob: chegara atrofidagi katta, lekin chekli to‘rtburchak + teshik. */
export function outsideMask(boundary: LngLat[], factor = 6): LngLat[][] {
  if (boundary.length < 4) return [];
  const [[w, s], [e, n]] = bboxOf(boundary);
  const cx = (w + e) / 2;
  const cy = (s + n) / 2;
  const dx = Math.max((e - w) * factor, 1);
  const dy = Math.max((n - s) * factor, 1);
  const area = boundary.reduce((sum, p, i) => { const q = boundary[(i + 1) % boundary.length]; return sum + (p[0] * q[1] - q[0] * p[1]); }, 0);
  const hole = area > 0 ? [...boundary].reverse() : [...boundary]; // teshik tashqi halqaga (CCW) teskari bo‘lishi kerak
  return [[[cx - dx, cy - dy], [cx + dx, cy - dy], [cx + dx, cy + dy], [cx - dx, cy + dy], [cx - dx, cy - dy]], hole];
}
