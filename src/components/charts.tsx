'use client';

import React from 'react';

export type Point = { label: string; value: number };
export type Slice = { label: string; value: number; color: string };

/** Server va brauzerde birdey (hydration qáte bolmaslıǵı ushın) san formatı. */
export const fmtNum = (n: number) => String(Math.round(n * 10) / 10).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export const PALETTE = ['#8b72ff', '#2bb5d6', '#e59a45', '#e0679c', '#4bd8a6', '#6b8cff', '#f0cf5f'];

/** Oxirgi `n` ay boyınsha jıynalma sanlar (YYYY-MM). */
export function cumulativeByMonth(dates: string[], n: number): Point[] {
  const now = new Date();
  const months = Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).slice(2)}` };
  });
  let run = dates.filter((x) => x && x.slice(0, 7) < months[0].key).length;
  return months.map((m) => {
    run += dates.filter((x) => x && x.slice(0, 7) === m.key).length;
    return { label: m.label, value: run };
  });
}

export function countBy<T>(items: T[], key: (item: T) => string): [string, number][] {
  const map = new Map<string, number>();
  items.forEach((item) => map.set(key(item), (map.get(key(item)) ?? 0) + 1));
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export const Sparkline: React.FC<{ values: { value: number }[]; color: string }> = ({ values, color }) => {
  const w = 120, h = 44;
  const max = Math.max(...values.map((v) => v.value), 1);
  const line = values
    .map((v, i) => `${i ? 'L' : 'M'}${((i / Math.max(values.length - 1, 1)) * w).toFixed(1)},${(h - 4 - (v.value / max) * (h - 10)).toFixed(1)}`)
    .join(' ');
  return (
    <svg className="sc-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={color} opacity="0.14" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

let gradientId = 0;

export const AreaChart: React.FC<{ points: Point[]; color?: string; height?: number; width?: number }> = ({ points, color = '#9a85ff', height = 300, width = 760 }) => {
  const id = React.useMemo(() => `sc-area-${gradientId++}`, []);
  const W = width, H = height, L = 40, B = 34, T = 14, R = 12;
  const max = Math.max(...points.map((p) => p.value), 4);
  const top = Math.ceil(max / 4) * 4;
  const x = (i: number) => L + (i / Math.max(points.length - 1, 1)) * (W - L - R);
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  return (
    <svg className="sc-area" viewBox={`0 0 ${W} ${H}`} role="img">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.5" />
          <stop offset="1" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => {
        const v = (top / 4) * i;
        return (
          <g key={i}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#a3b4df1c" strokeDasharray="3 5" />
            <text x={L - 10} y={y(v) + 4} textAnchor="end" fill="#8d9ab2" fontSize="12">{Math.round(v * 10) / 10}</text>
          </g>
        );
      })}
      <path d={`${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${id})`} className="sc-fade" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="sc-draw" />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.value)} r="3.5" fill="#0b0f17" stroke={color} strokeWidth="2" />
          <text x={x(i)} y={H - 10} textAnchor="middle" fill="#8d9ab2" fontSize="12">{p.label}</text>
        </g>
      ))}
    </svg>
  );
};

export const Donut: React.FC<{ items: Slice[]; total: number; caption?: string }> = ({ items, total, caption }) => {
  const r = 78, c = 2 * Math.PI * r;
  const starts = items.map((_, i) => items.slice(0, i).reduce((sum, x) => sum + x.value, 0));
  return (
    <div className="sc-donut">
      <svg viewBox="0 0 200 200" role="img">
        <g transform="rotate(-90 100 100)">
          <circle cx="100" cy="100" r={r} fill="none" stroke="#a3b4df14" strokeWidth="22" />
          {items.map((it, i) => {
            const len = (it.value / Math.max(total, 1)) * c;
            const el = (
              <circle key={it.label} cx="100" cy="100" r={r} fill="none" stroke={it.color} strokeWidth="22" strokeLinecap="round"
                strokeDasharray={`${Math.max(len - 6, 1)} ${c}`} strokeDashoffset={-(starts[i] / Math.max(total, 1)) * c} className="sc-fade" />
            );
            return el;
          })}
        </g>
        <text x="100" y="106" textAnchor="middle" fill="#e2e7f2" fontSize="30" fontWeight="560">{total}</text>
        {caption && <text x="100" y="126" textAnchor="middle" fill="#8d9ab2" fontSize="11">{caption}</text>}
      </svg>
      <ul>
        {items.map((it) => (
          <li key={it.label}>
            <i style={{ background: it.color }} />
            <span>{it.label}</span>
            <strong>{total ? Math.round((it.value / total) * 100) : 0}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const HBars: React.FC<{ items: { label: string; value: number; color?: string; text?: string }[] }> = ({ items }) => {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="sc-hbars">
      {items.map((it, i) => (
        <li key={it.label} style={{ ['--i' as string]: i }}>
          <span className="sc-hbar-label">{it.label}</span>
          <span className="sc-hbar-track">
            <span style={{ width: `${(it.value / max) * 100}%`, background: `linear-gradient(90deg, ${it.color ?? PALETTE[i % PALETTE.length]}66, ${it.color ?? PALETTE[i % PALETTE.length]})` }} />
          </span>
          <strong>{it.text ?? it.value}</strong>
        </li>
      ))}
    </ul>
  );
};

export const Columns: React.FC<{ items: Point[]; color?: string; unit?: string }> = ({ items, color = '#2bb5d6', unit }) => {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="sc-columns">
      {items.map((it, i) => (
        <div key={it.label} style={{ ['--i' as string]: i }}>
          <em>{it.value}{unit ? ` ${unit}` : ''}</em>
          <span style={{ height: `${Math.max((it.value / max) * 100, 3)}%`, background: `linear-gradient(180deg, ${color}, ${color}33)` }} />
          <small>{it.label}</small>
        </div>
      ))}
    </div>
  );
};
