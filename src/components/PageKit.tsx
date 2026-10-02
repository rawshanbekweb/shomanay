'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AreaChart, Columns, Donut, HBars, PALETTE, Sparkline, countBy, cumulativeByMonth, fmtNum } from '@/components/charts';

export type Tile = { label: string; value: number; suffix?: string; hint?: string; color: string; spark?: { value: number }[] };

/** Sanǵa 0 den jetip keliwshi animatsiya (prefers-reduced-motion hesapqa alınadı). */
const CountUp: React.FC<{ value: number }> = ({ value }) => {
  const [shown, setShown] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const duration = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 1 : 900;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setShown(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value]);
  return <>{fmtNum(Number.isInteger(value) ? Math.round(shown) : shown)}</>;
};

export const PageHero: React.FC<{
  icon: React.ComponentType<{ size?: number }>;
  eyebrow: string;
  title: string;
  subtitle?: string;
  color?: string;
  actions?: React.ReactNode;
  tiles?: Tile[];
}> = ({ icon: Icon, eyebrow, title, subtitle, color = '#8b72ff', actions, tiles }) => (
  <section className="pk-hero" style={{ ['--k' as string]: color }}>
    <div className="pk-orb" aria-hidden="true" />
    <div className="pk-hero-grid" aria-hidden="true" />
    <div className="pk-hero-top">
      <span className="pk-icon"><Icon size={22} /></span>
      <div className="pk-hero-text">
        <div className="sc-eyebrow"><i /> {eyebrow}</div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="pk-actions">{actions}</div>}
    </div>
    {tiles && tiles.length > 0 && (
      <div className="pk-tiles">
        {tiles.map((tile, i) => (
          <div key={tile.label} className="pk-tile" style={{ ['--k' as string]: tile.color, ['--i' as string]: i }}>
            <span>{tile.label}</span>
            <div className="pk-tile-row">
              <strong><CountUp value={tile.value} />{tile.suffix && <small>{tile.suffix}</small>}</strong>
              {tile.spark && <Sparkline values={tile.spark} color={tile.color} />}
            </div>
            {tile.hint && <em>{tile.hint}</em>}
          </div>
        ))}
      </div>
    )}
  </section>
);

const pretty = (s: string) => s.replace(/_/g, ' ');
const Panel: React.FC<{ title: string; sub?: string; children: React.ReactNode }> = ({ title, sub, children }) => (
  <div className="sc-panel">
    <h2>{title}</h2>
    {sub && <p className="sc-muted">{sub}</p>}
    {children}
  </div>
);

/** Tapsırmalar sahifasınıń tiles hám diagrammaları. */
export function useTaskTiles(): Tile[] {
  const { tasks } = useApp();
  const open = (x: (typeof tasks)[number]) => x.status !== 'accepted' && x.status !== 'cancelled';
  const monthly = (dates: string[]) => cumulativeByMonth(dates, 8);
  return [
    { label: 'Jámi tapsırma', value: tasks.length, color: '#8b72ff', spark: monthly(tasks.map((x) => x.createdDate)) },
    { label: 'Múddeti ótken', value: tasks.filter((x) => x.isOverdue && open(x)).length, color: '#e0679c', spark: monthly(tasks.filter((x) => x.isOverdue && open(x)).map((x) => x.deadline)) },
    { label: 'Tekseriwde', value: tasks.filter((x) => x.status === 'under_review').length, color: '#e59a45', spark: monthly(tasks.filter((x) => x.status === 'under_review').map((x) => x.createdDate)) },
    { label: 'Qabıllandı', value: tasks.filter((x) => x.status === 'accepted').length, color: '#4bd8a6', spark: monthly(tasks.filter((x) => x.status === 'accepted').map((x) => x.completedDate ?? x.createdDate)) },
  ];
}

export const TasksInsights: React.FC = () => {
  const { tasks, mfys } = useApp();
  if (tasks.length === 0) return null;
  const status = countBy(tasks, (x) => x.status).map(([label, value], i) => ({ label: pretty(label), value, color: PALETTE[(i + 4) % PALETTE.length] }));
  const byMfy = mfys.map((m, i) => ({ label: m.name.replace(' MPJ', ''), value: tasks.filter((x) => x.mfyId === m.id).length, color: PALETTE[i % PALETTE.length] }));
  return (
    <section className="sc-chart-grid three">
      <Panel title="Statuslar boyınsha" sub="Tapsırmalar úlesi"><Donut items={status} total={tasks.length} caption="tapsırma" /></Panel>
      <Panel title="MPJlar kesiminde" sub="Tapsırmalar sanı"><HBars items={byMfy} /></Panel>
      <Panel title="Dinamika" sub="Jıynalma · tapsırma"><AreaChart points={cumulativeByMonth(tasks.map((x) => x.createdDate), 8)} height={240} width={380} /></Panel>
    </section>
  );
};

export function useIssueTiles(): Tile[] {
  const { issues } = useApp();
  const open = issues.filter((x) => x.status !== 'resolved' && x.status !== 'closed');
  const monthly = (dates: string[]) => cumulativeByMonth(dates, 8);
  return [
    { label: 'Jámi mashqala', value: issues.length, color: '#e0679c', spark: monthly(issues.map((x) => x.reportedDate)) },
    { label: 'Ashıq', value: open.length, color: '#e59a45', spark: monthly(open.map((x) => x.reportedDate)) },
    { label: 'Kritikalıq', value: open.filter((x) => x.priority === 'critical').length, color: '#ff7a8a', spark: monthly(open.filter((x) => x.priority === 'critical').map((x) => x.reportedDate)) },
    { label: 'Sheshilgen', value: issues.filter((x) => x.status === 'resolved' || x.status === 'closed').length, color: '#4bd8a6', spark: monthly(issues.filter((x) => x.status === 'resolved' || x.status === 'closed').map((x) => x.reportedDate)) },
  ];
}

export const IssuesInsights: React.FC = () => {
  const { issues, mfys } = useApp();
  if (issues.length === 0) return null;
  const color = (p: string) => (p === 'critical' ? '#ff7a8a' : p === 'high' ? '#e59a45' : p === 'medium' ? '#f0cf5f' : '#4bd8a6');
  const prio = countBy(issues, (x) => x.priority).map(([label, value]) => ({ label, value, color: color(label) }));
  const cat = countBy(issues, (x) => x.category).map(([label, value], i) => ({ label: pretty(label), value, color: PALETTE[(i + 1) % PALETTE.length] }));
  const byMfy = mfys.map((m) => ({ label: m.name.replace(' MPJ', ''), value: issues.filter((x) => x.mfyId === m.id).length }));
  return (
    <section className="sc-chart-grid three">
      <Panel title="Basımlılıq" sub="Dárejesi boyınsha"><Donut items={prio} total={issues.length} caption="mashqala" /></Panel>
      <Panel title="Kategoriyalar" sub="Mashqala túrleri"><HBars items={cat} /></Panel>
      <Panel title="MPJlar kesiminde" sub="Mashqalalar sanı"><Columns items={byMfy} color="#e0679c" /></Panel>
    </section>
  );
};

export function useInvestmentTiles(): Tile[] {
  const { investments } = useApp();
  const cost = investments.reduce((s, x) => s + x.totalCostMlnUzs, 0) / 1000;
  const jobs = investments.reduce((s, x) => s + x.plannedJobs, 0);
  const avg = investments.length ? investments.reduce((s, x) => s + x.physicalProgressPercent, 0) / investments.length : 0;
  return [
    { label: 'Joybarlar', value: investments.length, color: '#4bd8a6' },
    { label: 'Jámi qunı', value: Math.round(cost * 10) / 10, suffix: ' mlrd som', color: '#2bb5d6' },
    { label: 'Jumıs orınları', value: jobs, color: '#e59a45' },
    { label: 'Ortasha tayarlıq', value: Math.round(avg), suffix: '%', color: '#b88cff' },
  ];
}

export const InvestmentsInsights: React.FC = () => {
  const { investments, mfys } = useApp();
  if (investments.length === 0) return null;
  const stages = countBy(investments, (x) => x.stage).map(([label, value], i) => ({ label: pretty(label), value, color: PALETTE[(i + 4) % PALETTE.length] }));
  const cost = mfys.map((m) => ({ label: m.name.replace(' MPJ', ''), value: Math.round(investments.filter((x) => x.mfyId === m.id).reduce((s, x) => s + x.totalCostMlnUzs, 0) / 100) / 10 }));
  const progress = investments.map((x, i) => ({ label: x.name, value: x.physicalProgressPercent, text: `${x.physicalProgressPercent}%`, color: PALETTE[i % PALETTE.length] }));
  return (
    <section className="sc-chart-grid three">
      <Panel title="Bosqıshlar" sub="Joybarlar sanı"><Donut items={stages} total={investments.length} caption="joybar" /></Panel>
      <Panel title="Qunı (MPJ boyınsha)" sub="mlrd som"><Columns items={cost} color="#4bd8a6" /></Panel>
      <Panel title="Fizikalıq tayarlıq" sub="Joybarlar boyınsha"><HBars items={progress} /></Panel>
    </section>
  );
};

export function useZoneTiles(): Tile[] {
  const { industrialZones } = useApp();
  const area = industrialZones.reduce((s, x) => s + x.totalAreaHa, 0);
  const used = industrialZones.reduce((s, x) => s + x.occupiedAreaHa, 0);
  return [
    { label: 'Zonalar', value: industrialZones.length, color: '#e59a45' },
    { label: 'Jámi maydan', value: Math.round(area * 10) / 10, suffix: ' Ga', color: '#2bb5d6' },
    { label: 'Iyelengen', value: area ? Math.round((used / area) * 100) : 0, suffix: '%', color: '#8b72ff' },
    { label: 'Kárxanalar', value: industrialZones.reduce((s, x) => s + x.activeCompaniesCount, 0), color: '#4bd8a6' },
  ];
}

export const ZonesInsights: React.FC = () => {
  const { industrialZones } = useApp();
  if (industrialZones.length === 0) return null;
  const occupancy = industrialZones.map((x, i) => ({ label: x.name, value: Math.round((x.occupiedAreaHa / Math.max(x.totalAreaHa, 1)) * 100), text: `${Math.round((x.occupiedAreaHa / Math.max(x.totalAreaHa, 1)) * 100)}%`, color: PALETTE[i % PALETTE.length] }));
  const jobs = industrialZones.map((x) => ({ label: x.name.split(' ')[0], value: x.totalJobs }));
  const free = industrialZones.map((x, i) => ({ label: x.name, value: x.freeAreaHa, color: PALETTE[(i + 2) % PALETTE.length], text: `${x.freeAreaHa} Ga` }));
  return (
    <section className="sc-chart-grid three">
      <Panel title="Maydan iyelewi" sub="Iyelengen úlesi"><HBars items={occupancy} /></Panel>
      <Panel title="Jumıs orınları" sub="Zonalar boyınsha"><Columns items={jobs} color="#e59a45" /></Panel>
      <Panel title="Bos maydan" sub="Ga"><HBars items={free} /></Panel>
    </section>
  );
};
