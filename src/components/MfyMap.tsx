'use client';

import React, { useMemo, useState } from 'react';
import { Briefcase, Compass, MapPin, TriangleAlert, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fmtNum } from '@/components/charts';
import gridModel from '@/data/shumanay_grid_model.json';
import type { Language, ObjectStatus } from '@/types';

type Site = { id: string; name: string; code: string; x: number; y: number; textPos?: string };
type Metric = 'population' | 'projects' | 'issues' | 'objects';

const W = 650;
const H = 500;
const BOX: [number, number][] = [[0, 0], [W, 0], [W, H], [0, H]];

const COPY: Record<Language, Record<string, string>> = {
  qq: { title: 'Shomanay rayonı · MPJlar kartası', population: 'Aholi', projects: 'Joybarlar', issues: 'Mashqalalar', objects: 'Obyektler', total: 'Rayon boyınsha', people: 'adam', pcs: 'dana', leader: 'Baslıq', hint: 'MPJ ni tańlań', gis: 'Lokal GIS kartası', objectsList: 'Obyektler', none: 'Obyekt joq', share: 'Rayon aholisinıń úlesi', reset: 'Bárin kórsetiw' },
  uz: { title: 'Shumanay tumani · MFY xaritasi', population: 'Aholi', projects: 'Loyihalar', issues: 'Muammolar', objects: 'Obyektlar', total: 'Tuman bo‘yicha', people: 'kishi', pcs: 'ta', leader: 'Rais', hint: 'MFYni tanlang', gis: 'Lokal GIS xaritasi', objectsList: 'Obyektlar', none: 'Obyekt yo‘q', share: 'Tuman aholisidagi ulushi', reset: 'Hammasini ko‘rsatish' },
  ru: { title: 'Шуманайский район · карта МСГ', population: 'Население', projects: 'Проекты', issues: 'Проблемы', objects: 'Объекты', total: 'По району', people: 'чел.', pcs: 'шт.', leader: 'Руководитель', hint: 'Выберите МСГ', gis: 'Локальная ГИС', objectsList: 'Объекты', none: 'Нет объектов', share: 'Доля населения района', reset: 'Показать все' },
};

const METRIC_ICONS = { population: Users, projects: Briefcase, issues: TriangleAlert, objects: MapPin } as const;
const METRIC_HUE: Record<Metric, string> = { population: '139,114,255', projects: '43,181,214', issues: '224,103,156', objects: '75,216,166' };
const STATUS_COLOR: Record<ObjectStatus, string> = { active: '#4bd8a6', in_progress: '#6b8cff', planned: '#b88cff', paused: '#e59a45', risk: '#ff7a8a' };

type Poly = [number, number][];

/** Sutherland–Hodgman: yarım tegislik a·x + b·y ≤ c boyınsha kesiw. */
function clipHalfPlane(poly: Poly, a: number, b: number, c: number): Poly {
  const out: Poly = [];
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

function voronoi(sites: Site[]): Record<string, Poly> {
  const cells: Record<string, Poly> = {};
  sites.forEach((s) => {
    let poly: Poly = BOX;
    sites.forEach((o) => {
      if (o.id === s.id || poly.length === 0) return;
      poly = clipHalfPlane(poly, o.x - s.x, o.y - s.y, (o.x * o.x + o.y * o.y - s.x * s.x - s.y * s.y) / 2);
    });
    cells[s.id] = poly;
  });
  return cells;
}

const toPath = (poly: Poly) => (poly.length ? `M${poly.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z` : '');

/** lat/lng → SVG x,y (eng kishi kvadratlar usulı menen). */
function fitLinear(xs: number[], ys: number[]): (v: number) => number {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((s, x) => s + (x - mx) ** 2, 0) || 1;
  const k = num / den;
  return (v) => my + k * (v - mx);
}

export const MfyMap: React.FC<{ onSwitchToStreetGis?: () => void; tall?: boolean }> = ({ onSwitchToStreetGis, tall }) => {
  const { language, mfys, objects, openObjectPassport } = useApp();
  const c = COPY[language];
  const { path, mfys: sites } = gridModel as { path: string; mfys: Site[] };

  const [metric, setMetric] = useState<Metric>('population');
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  const nameOf = (s: Site) => (mfys.find((m) => m.id === s.id)?.name ?? s.name);
  const cells = useMemo(() => voronoi(sites), [sites]);

  const stats = useMemo(() => {
    const map: Record<string, { population: number; projects: number; issues: number; objects: number }> = {};
    sites.forEach((s) => {
      const m = mfys.find((x) => x.id === s.id);
      map[s.id] = {
        population: m?.population ?? 0,
        projects: m?.activeProjectsCount ?? 0,
        issues: m?.openIssuesCount ?? 0,
        objects: objects.filter((o) => o.mfyId === s.id).length,
      };
    });
    return map;
  }, [sites, mfys, objects]);

  const totals = useMemo(() => {
    const t = { population: 0, projects: 0, issues: 0, objects: 0 };
    Object.values(stats).forEach((s) => { t.population += s.population; t.projects += s.projects; t.issues += s.issues; t.objects += s.objects; });
    return t;
  }, [stats]);

  const pins = useMemo(() => {
    const pairs = sites.map((s) => ({ s, m: mfys.find((x) => x.id === s.id) })).filter((p) => p.m);
    if (pairs.length < 3) return [];
    const fx = fitLinear(pairs.map((p) => p.m!.centerCoords[1]), pairs.map((p) => p.s.x));
    const fy = fitLinear(pairs.map((p) => p.m!.centerCoords[0]), pairs.map((p) => p.s.y));
    return objects.map((o) => ({
      id: o.id, name: o.name, status: o.status, mfyId: o.mfyId,
      x: Math.min(Math.max(fx(o.coords[1]), 10), W - 10), y: Math.min(Math.max(fy(o.coords[0]), 10), H - 10),
    }));
  }, [sites, mfys, objects]);

  const values = sites.map((s) => stats[s.id][metric]);
  const vmax = Math.max(...values, 1);
  const vmin = Math.min(...values, 0);
  const fillFor = (id: string, active: boolean) => {
    const t = vmax === vmin ? 0.5 : (stats[id][metric] - vmin) / (vmax - vmin);
    return `rgba(${METRIC_HUE[metric]},${(active ? 0.55 : 0.14 + t * 0.34).toFixed(2)})`;
  };

  const focusId = hovered ?? selected;
  const focus = focusId ? sites.find((s) => s.id === focusId) ?? null : null;
  const focusMfy = focus ? mfys.find((m) => m.id === focus.id) : null;
  const focusObjects = focus ? objects.filter((o) => o.mfyId === focus.id) : [];
  const fmt = fmtNum;
  const unitFor = (m: Metric) => (m === 'population' ? c.people : c.pcs);

  const ranking = [...sites].sort((a, b) => stats[b.id][metric] - stats[a.id][metric]);

  return (
    <section className={`mm-root ${tall ? 'mm-tall' : ''}`}>
      <header className="mm-head">
        <div>
          <span className="mm-live"><i /> LIVE</span>
          <h2>{c.title}</h2>
        </div>
        <div className="mm-tabs" role="tablist">
          {(Object.keys(METRIC_ICONS) as Metric[]).map((m) => {
            const Icon = METRIC_ICONS[m];
            return (
              <button key={m} role="tab" aria-selected={metric === m} data-active={metric === m} onClick={() => setMetric(m)}>
                <Icon size={14} /> {c[m]}
              </button>
            );
          })}
          {onSwitchToStreetGis && (
            <button onClick={onSwitchToStreetGis} className="mm-gis"><Compass size={14} /> {c.gis}</button>
          )}
        </div>
      </header>

      <div className="mm-body">
        <div
          className="mm-stage"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setPointer({ x: e.clientX - r.left, y: e.clientY - r.top });
          }}
          onMouseLeave={() => { setHovered(null); setPointer(null); }}
        >
          <div className="mm-grid" aria-hidden="true" />
          <svg viewBox="150 100 340 300" role="img" aria-label={c.title}>
            <defs>
              <clipPath id="mm-clip"><path d={path} /></clipPath>
              <filter id="mm-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="mm-sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={`rgb(${METRIC_HUE[metric]})`} stopOpacity="0" />
                <stop offset="1" stopColor={`rgb(${METRIC_HUE[metric]})`} stopOpacity="0.38" />
              </linearGradient>
            </defs>

            <path d={path} className="mm-halo" filter="url(#mm-glow)" />

            <g clipPath="url(#mm-clip)">
              <rect width={W} height={H} fill="#0e1422" />
              {sites.map((s, i) => {
                const active = focusId === s.id;
                return (
                  <g key={s.id} className="mm-cell" data-active={active} style={{ ['--i' as string]: i }}
                    role="button" tabIndex={0} aria-label={nameOf(s)} aria-pressed={selected === s.id}
                    onMouseEnter={() => setHovered(s.id)} onFocus={() => setHovered(s.id)} onBlur={() => setHovered(null)}
                    onClick={() => setSelected(selected === s.id ? null : s.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(selected === s.id ? null : s.id); } }}>
                    <path d={toPath(cells[s.id])} fill={fillFor(s.id, active)} />
                  </g>
                );
              })}
              {/* Jaylasıw sızıqları */}
              {sites.map((s) => <path key={`b-${s.id}`} d={toPath(cells[s.id])} className="mm-border" />)}
              {/* Radar sweep */}
              <g className="mm-sweep" style={{ transformOrigin: '325px 250px' }}>
                <path d="M325,250 L-200,170 L-200,330 Z" fill="url(#mm-sweep)" transform="translate(0 0)" />
              </g>
            </g>

            <path d={path} className="mm-outline" pathLength={1} />

            {/* Baylanıs sızıqları: orayǵa */}
            {sites.slice(1).map((s) => (
              <line key={`l-${s.id}`} x1={sites.find((x) => x.id === 'mfy-1')?.x ?? sites[0].x} y1={sites.find((x) => x.id === 'mfy-1')?.y ?? sites[0].y}
                x2={s.x} y2={s.y} className="mm-link" />
            ))}

            {/* Obyektler */}
            {pins.map((p) => (
              <circle key={p.id} cx={p.x} cy={p.y} r={focusId === p.mfyId ? 3.6 : 2.6} fill={STATUS_COLOR[p.status]} className="mm-pin"
                onClick={(e) => { e.stopPropagation(); openObjectPassport(p.id); }}>
                <title>{p.name}</title>
              </circle>
            ))}

            {/* MPJ markerleri */}
            {sites.map((s) => {
              const active = focusId === s.id;
              const left = s.textPos === 'left';
              const tx = s.x + (left ? -11 : 11);
              return (
                <g key={`m-${s.id}`} className="mm-marker" data-active={active} pointerEvents="none">
                  <circle cx={s.x} cy={s.y} r="9" className="mm-pulse" style={{ ['--d' as string]: `${(s.x % 7) * 0.25}s` }} />
                  <circle cx={s.x} cy={s.y} r="4" className="mm-dot" />
                  <text x={tx} y={s.y - 1} textAnchor={left ? 'end' : 'start'} className="mm-label">{nameOf(s).replace(' MPJ', '')}</text>
                  <text x={tx} y={s.y + 11} textAnchor={left ? 'end' : 'start'} className="mm-value">{fmt(stats[s.id][metric])}</text>
                </g>
              );
            })}
          </svg>

          {focus && pointer && (
            <div className="mm-tip" style={{ left: pointer.x + 16, top: pointer.y + 12 }}>
              <strong>{nameOf(focus)}</strong>
              <span>{c[metric]}: {fmt(stats[focus.id][metric])} {unitFor(metric)}</span>
            </div>
          )}

          <ul className="mm-legend" aria-hidden="true">
            {(Object.keys(STATUS_COLOR) as ObjectStatus[]).map((k) => <li key={k}><i style={{ background: STATUS_COLOR[k] }} />{k.replace('_', ' ')}</li>)}
          </ul>
        </div>

        <aside className="mm-side">
          {focus && focusMfy ? (
            <div key={focus.id} className="mm-detail">
              <div className="mm-code">{focus.code}</div>
              <h3>{nameOf(focus)}</h3>
              <dl>
                <div><dt>{c.population}</dt><dd>{fmt(stats[focus.id].population)}</dd></div>
                <div><dt>{c.projects}</dt><dd>{stats[focus.id].projects}</dd></div>
                <div><dt>{c.issues}</dt><dd data-bad={stats[focus.id].issues > 0}>{stats[focus.id].issues}</dd></div>
                <div><dt>{c.objects}</dt><dd>{stats[focus.id].objects}</dd></div>
              </dl>
              <p className="mm-share">{c.share}: <b>{totals.population ? Math.round((stats[focus.id].population / totals.population) * 100) : 0}%</b></p>
              <div className="mm-bar"><span style={{ width: `${totals.population ? (stats[focus.id].population / totals.population) * 100 : 0}%` }} /></div>
              {focusMfy.leaderName && <p className="mm-leader">{c.leader}: <b>{focusMfy.leaderName}</b></p>}
              <h4>{c.objectsList}</h4>
              {focusObjects.length === 0 ? <p className="mm-none">{c.none}</p> : (
                <ul>
                  {focusObjects.map((o) => (
                    <li key={o.id}><button onClick={() => openObjectPassport(o.id)}><i style={{ background: STATUS_COLOR[o.status] }} />{o.name}</button></li>
                  ))}
                </ul>
              )}
              {selected && <button className="mm-reset" onClick={() => setSelected(null)}>{c.reset}</button>}
            </div>
          ) : (
            <div className="mm-detail">
              <div className="mm-code">{c.total}</div>
              <h3>Shomanay</h3>
              <dl>
                <div><dt>{c.population}</dt><dd>{fmt(totals.population)}</dd></div>
                <div><dt>{c.projects}</dt><dd>{totals.projects}</dd></div>
                <div><dt>{c.issues}</dt><dd data-bad={totals.issues > 0}>{totals.issues}</dd></div>
                <div><dt>{c.objects}</dt><dd>{totals.objects}</dd></div>
              </dl>
              <h4>{c[metric]}</h4>
              <ol className="mm-rank">
                {ranking.map((s, i) => (
                  <li key={s.id}>
                    <button onMouseEnter={() => setHovered(s.id)} onMouseLeave={() => setHovered(null)} onClick={() => setSelected(s.id)}>
                      <span>{i + 1}</span>
                      <em>{nameOf(s).replace(' MPJ', '')}</em>
                      <b>{fmt(stats[s.id][metric])}</b>
                      <i style={{ width: `${(stats[s.id][metric] / vmax) * 100}%`, background: `rgb(${METRIC_HUE[metric]})` }} />
                    </button>
                  </li>
                ))}
              </ol>
              <p className="mm-none">{c.hint}</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
};
