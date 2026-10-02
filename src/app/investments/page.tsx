'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TrendingUp, CheckCircle2, Clock, AlertTriangle, Search, Users } from 'lucide-react';

export default function InvestmentsPage() {
  const { investments, t, openObjectPassport } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvestments = investments.filter((inv) =>
    inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.investorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.directionSector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-violet-300" />
            {t.pageInvestTitle}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {t.pageInvestSubtitle}
          </p>
        </div>
      </div>

      {/* Search in Crisp White */}
      <div className="p-5 rounded-3xl bg-[#111620] border border-white/10 shadow-sm flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Joybar yamasa investor atın izlew..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 focus:bg-[#111620]"
          />
        </div>
      </div>

      {/* Projects Cards List */}
      <div className="space-y-6">
        {filteredInvestments.map((inv) => {
          const isDelayed = inv.stage === 'delayed' || inv.milestones.some((m) => m.status === 'delayed');
          return (
            <div
              key={inv.id}
              className="p-8 rounded-3xl bg-[#111620] border border-white/10 shadow-sm space-y-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-white/10">
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-white/10 font-bold">
                      {inv.directionSector}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-[#151a26] text-slate-300 font-mono font-bold border border-white/10">
                      Bosqich: {inv.stage.toUpperCase()}
                    </span>
                    {isDelayed && (
                      <span className="text-xs px-3 py-1 rounded-full bg-amber-950/40 text-amber-400 border border-amber-800/50 flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        KESHIGIWE BAR
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-semibold text-white">{inv.name}</h2>
                  <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm text-slate-400">
                    <span>Investor: <strong className="text-slate-200">{inv.investorName}</strong></span>
                    <span>Rejeli iske túsiriw: <strong className="text-slate-200">{inv.plannedLaunchDate}</strong></span>
                  </div>

                  {/* Financial stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
                    <div className="p-4 rounded-2xl bg-[#151a26] border border-white/10">
                      <div className="text-xs text-slate-400 font-medium">Jámi baha</div>
                      <div className="text-base font-semibold text-white mt-1">{inv.totalCostMlnUzs.toLocaleString()} mln som</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#151a26] border border-white/10">
                      <div className="text-xs text-slate-400 font-medium">Sırtqı investiciya</div>
                      <div className="text-base font-semibold text-violet-300 mt-1">${inv.foreignInvestThousandUsd.toLocaleString()} mıń</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#151a26] border border-white/10">
                      <div className="text-xs text-slate-400 font-medium">Eksport potencialı</div>
                      <div className="text-base font-semibold text-emerald-400 mt-1">${inv.exportPotentialThousandUsd.toLocaleString()} mıń/jıl</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#151a26] border border-white/10">
                      <div className="text-xs text-slate-400 font-medium">Jıllıq salıq tushumi</div>
                      <div className="text-base font-semibold text-amber-400 mt-1">{inv.annualTaxPotentialMlnUzs.toLocaleString()} mln som</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openObjectPassport(inv.objectId)}
                  className="px-5 py-2.5 text-xs font-bold text-violet-300 bg-violet-500/10 hover:bg-violet-500/10 border border-white/10 rounded-xl transition-colors shrink-0 self-start"
                >
                  Obyekt Pasportı →
                </button>
              </div>

              {/* Financial Absorption vs Physical Construction Comparison (FR-09) */}
              <div className="py-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-5 rounded-2xl bg-[#151a26] border border-white/10">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-200 font-bold">{t.financialAbsorption}</span>
                    <span className="text-violet-300 font-mono font-semibold text-sm">{inv.financialProgressPercent}%</span>
                  </div>
                  <div className="w-full h-3.5 bg-[#1a1f2c] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${inv.financialProgressPercent}%` }}
                      className="bg-violet-500 h-full rounded-full transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block">
                    Bank kreditleri hám investor qarjılarınıń esap-faktura boyınsha ózlestiriliwi
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#151a26] border border-white/10">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-200 font-bold">{t.physicalProgress}</span>
                    <span className="text-emerald-400 font-mono font-semibold text-sm">{inv.physicalProgressPercent}%</span>
                  </div>
                  <div className="w-full h-3.5 bg-[#1a1f2c] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${inv.physicalProgressPercent}%` }}
                      className="bg-emerald-500 h-full rounded-full transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block">
                    Qurılıs-montaj hám uskunalar ornatılıwınıń orınında tastıyıqlanǵan tayarlıǵı
                  </span>
                </div>
              </div>

              {/* Jobs verification (FR-09) */}
              <div className="p-4 rounded-2xl bg-violet-500/10 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-400" />
                  <span className="text-white font-bold">Jumıs orınları verifikatsiyası (FR-09):</span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-400">Reje:</span>{' '}
                    <strong className="text-white">{inv.plannedJobs} nafar</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Investor esabatı:</span>{' '}
                    <strong className="text-violet-300">{inv.reportedJobs} nafar</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Tastıyıqlanǵan (Fakt):</span>{' '}
                    <strong className="text-emerald-400">{inv.verifiedJobs} nafar</strong>
                  </div>
                </div>
              </div>

              {/* Milestones list (FR-09) */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  {t.milestonesTitle}
                </h4>
                <div className="space-y-2.5">
                  {inv.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-2xl bg-[#151a26] border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        {m.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : m.status === 'delayed' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-500" />
                        )}
                        <div>
                          <span className="text-white font-bold">{m.title}</span>
                          <span className="text-slate-400 ml-2">({m.weightPercent}% salmaq)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-slate-400 font-mono text-[11px]">Reje: {m.plannedDate}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === 'completed'
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50'
                              : m.status === 'delayed'
                              ? 'bg-amber-950/40 text-amber-400 border border-amber-800/50'
                              : 'bg-[#1a1f2c]/50 text-slate-300 border border-white/10'
                          }`}
                        >
                          {m.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
