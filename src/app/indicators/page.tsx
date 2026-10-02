'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUpRight, ChevronDown, MapPin, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Language } from '@/types';

const COPY: Record<Language, { search: string; all: string; count: string; period: string; empty: string; district: string; trend: string }> = {
  qq: { search: 'Kórsetkishti izlew', all: 'Barlıq tarawlar', count: 'kórsetkish', period: 'Esabat dáwiri', empty: 'Hesh nárse tabılmadı', district: 'Shomanay rayonı', trend: 'aldıńǵı jılǵa salıstırǵanda' },
  uz: { search: 'Ko‘rsatkichni izlash', all: 'Barcha sohalar', count: 'ko‘rsatkich', period: 'Hisobot davri', empty: 'Hech narsa topilmadi', district: 'Shumanay tumani', trend: 'o‘tgan yilga nisbatan' },
  ru: { search: 'Поиск показателя', all: 'Все отрасли', count: 'показателей', period: 'Отчётный период', empty: 'Ничего не найдено', district: 'Шуманайский район', trend: 'к прошлому году' },
};

const SECTOR_COLORS: Record<string, string> = {
  industry: '#2bb5d6', investments: '#e59a45', agriculture: '#4bd8a6', employment: '#b88cff', services: '#e0679c', budget: '#6b8cff',
};

function Track({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="sc-ind-track" aria-hidden="true">
      {values.map((v, i) => (
        <span key={i} style={{ left: `${values.length > 1 ? (i / (values.length - 1)) * 100 : 0}%`, bottom: `${(v / max) * 100}%`, background: color }} />
      ))}
    </div>
  );
}

function IndicatorsView() {
  const { indicators, language } = useApp();
  const params = useSearchParams();
  const c = COPY[language];
  const [query, setQuery] = useState('');
  const [sectorState, setSectorState] = useState<string | null>(null);
  const sector = sectorState ?? params.get('sector') ?? 'all';

  const sectors = useMemo(() => {
    const map = new Map<string, string>();
    indicators.forEach((i) => map.set(i.sectorKey, i.sectorName[language] || i.sectorName.qq));
    return [...map.entries()];
  }, [indicators, language]);

  const list = indicators.filter((ind) => {
    const name = ind.name[language] || ind.name.qq;
    const q = query.trim().toLowerCase();
    return (sector === 'all' || ind.sectorKey === sector) && (!q || name.toLowerCase().includes(q) || ind.code.toLowerCase().includes(q));
  });

  return (
    <div className="sc-stack">
      <div className="sc-ind-toolbar">
        <label className="sc-ind-search">
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={c.search} />
        </label>
        <label className="sc-ind-select">
          <select value={sector} onChange={(e) => setSectorState(e.target.value)} aria-label={c.all}>
            <option value="all">{c.all}</option>
            {sectors.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <ChevronDown size={16} />
        </label>
        <span className="sc-ind-total">{list.length} {c.count}</span>
      </div>

      {list.length === 0 && <div className="sc-empty">{c.empty}</div>}

      <div className="sc-ind-grid">
        {list.map((ind) => {
          const color = SECTOR_COLORS[ind.sectorKey] ?? '#2bb5d6';
          const years = Object.keys(ind.historical).sort();
          const last = years[years.length - 1];
          const values = years.map((y) => ind.historical[y]);
          return (
            <article key={ind.id} className="sc-ind-card" style={{ ['--k' as string]: color }}>
              <header>
                <span>{ind.sectorName[language] || ind.sectorName.qq}</span>
                <ArrowUpRight size={16} />
              </header>
              <h3>{ind.name[language] || ind.name.qq}</h3>
              <div className="sc-ind-value">
                <strong>{ind.historical[last]?.toLocaleString(language === 'ru' ? 'ru-RU' : 'uz-UZ')}</strong>
                <span>{ind.unit}</span>
                <small>{last}</small>
                <em data-positive={ind.isPositiveTrend}>{ind.isPositiveTrend ? '+' : ''}{ind.trendPercent}% · {c.trend}</em>
              </div>
              <Track values={values} color={color} />
              <div className="sc-ind-period"><span>{c.period}</span><span>{years[0]}–{last}</span></div>
              <footer><MapPin size={13} /> {c.district}</footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function IndicatorsPage() {
  return (
    <Suspense fallback={null}>
      <IndicatorsView />
    </Suspense>
  );
}
