'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Layers,
  TrendingUp,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function IndicatorsPage() {
  const { indicators, language, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');

  const filteredIndicators = indicators.filter((ind) => {
    const name = ind.name[language] || ind.name.qq;
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'all' || ind.sectorKey === sectorFilter;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Layers className="w-7 h-7 text-cyan-300" />
          {t.pageIndicatorsTitle}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          {t.pageIndicatorsSubtitle}
        </p>
      </div>

      {/* Search & Filter in Crisp White */}
      <div className="p-5 rounded-3xl bg-[#081324] border border-blue-900/50 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kórsetkish atı yamasa kodi boyınsha izlew..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#0b1b33] border border-blue-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:bg-[#081324]"
          />
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-3.5 py-2.5 text-xs rounded-xl bg-[#0b1b33] border border-blue-900/50 text-slate-200 focus:outline-none focus:border-cyan-400"
        >
          <option value="all">Barlıq tarawlar (16 taraw)</option>
          <option value="industry">Sanaat</option>
          <option value="investments">Investiciyalar</option>
          <option value="agriculture">Awıl xojalıǵı</option>
          <option value="employment">Bántlik & Dáramat</option>
          <option value="services">Bazar xızmetleri</option>
          <option value="budget">Jergilikli Byudjet</option>
        </select>
      </div>

      {/* Indicators List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIndicators.map((ind) => {
          const name = ind.name[language] || ind.name.qq;
          const sectorName = ind.sectorName[language] || ind.sectorName.qq;

          return (
            <div
              key={ind.id}
              className="p-6 rounded-3xl bg-[#081324] border border-blue-900/50 hover:border-cyan-900/50 shadow-sm hover:shadow-md transition-all space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#0b1b33] text-slate-300 border border-blue-900/50">
                      {ind.code}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-950/40 text-cyan-300 border border-blue-800/50 font-bold">
                      {sectorName}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-2.5 leading-snug">{name}</h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-black text-white">
                    {ind.historical['2026'].toLocaleString()} {ind.unit}
                  </div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{ind.trendPercent}% (2025 ke salıstırǵanda)
                  </div>
                </div>
              </div>

              {/* Historical Trend Chart Bars */}
              <div className="space-y-2 pt-3 border-t border-blue-900/40">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Jıllar boyınsha dinamika:
                </div>
                <div className="grid grid-cols-4 gap-3 text-center text-xs">
                  {Object.entries(ind.historical).map(([year, val]) => (
                    <div key={year} className="p-3 rounded-2xl bg-[#0b1b33] border border-blue-900/50">
                      <div className="text-xs text-slate-400 font-medium">{year}</div>
                      <div className="font-extrabold text-white mt-1 text-xs">{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Deregi: FERGA & Rayon Statistika Bólimi</span>
                <span className="text-cyan-300 flex items-center gap-1 font-bold">
                  Aniq obyektlerge baylanıslı <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
