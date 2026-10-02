'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { buildInsights, type Severity } from '@/lib/insights';

const LABEL: Record<Severity | 'all', string> = { all: 'Barlıǵı', critical: 'Kritikalıq', warning: 'Itibar', positive: 'Jaqsı', info: 'Maǵlıwmat' };

export const InsightsPanel: React.FC = () => {
  const { tasks, issues, investments, industrialZones, objects, indicators, openObjectPassport } = useApp();
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const insights = useMemo(
    () => buildInsights({ tasks, issues, investments, zones: industrialZones, objects, indicators }),
    [tasks, issues, investments, industrialZones, objects, indicators],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: insights.length };
    insights.forEach((i) => { c[i.severity] = (c[i.severity] ?? 0) + 1; });
    return c;
  }, [insights]);

  const filtered = insights.filter((i) => filter === 'all' || i.severity === filter);
  const visible = showAll ? filtered : filtered.slice(0, 6);

  return (
    <section className="sc-panel ip-root">
      <div className="sc-panel-heading">
        <div className="flex items-center gap-4">
          <span className="sc-icon-tile"><Sparkles size={20} /></span>
          <div>
            <div className="sc-eyebrow"><i /> Analitika</div>
            <h2>Avtomat tahlil hám usınıslar</h2>
            <p className="sc-muted" style={{ margin: 0 }}>Qaǵıydalarǵa tiykarlanǵan tekseriw · hár qorıtındı dereklerge hám faktorlarǵa baylanısqan</p>
          </div>
        </div>
        <div className="ip-filters" role="tablist">
          {(['all', 'critical', 'warning', 'positive'] as const).map((k) => (
            <button key={k} role="tab" aria-selected={filter === k} data-active={filter === k} data-sev={k} onClick={() => { setFilter(k); setShowAll(false); }}>
              {LABEL[k]} <b>{counts[k] ?? 0}</b>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="sc-muted">Bul kategoriyada qorıtındı joq.</p>
      ) : (
        <ul className="ip-list">
          {visible.map((i, idx) => (
            <li key={i.id} className="ip-item" data-sev={i.severity} style={{ ['--i' as string]: idx }}>
              <button className="ip-head" onClick={() => setOpen(open === i.id ? null : i.id)} aria-expanded={open === i.id}>
                <i />
                <span>
                  <strong>{i.title}</strong>
                  <em>{i.text}</em>
                </span>
                <ChevronDown size={16} data-open={open === i.id} />
              </button>
              {open === i.id && (
                <div className="ip-body">
                  <h4>Qorıtındı tiykarı</h4>
                  <ul>{i.factors.map((f) => <li key={f}>{f}</li>)}</ul>
                  <div className="ip-foot">
                    <span>Derek: {i.source}</span>
                    <span className="ip-actions">
                      {i.objectId && <button className="sc-text-link" onClick={() => openObjectPassport(i.objectId!)}>Obyekt pasportı</button>}
                      {i.href && <Link href={i.href} className="sc-text-link">Ashıw <ArrowRight size={14} /></Link>}
                    </span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {filtered.length > 6 && (
        <button className="ip-more" onClick={() => setShowAll(!showAll)}>{showAll ? 'Jasırıw' : `Barlıǵın kórsetiw (${filtered.length})`}</button>
      )}
    </section>
  );
};
