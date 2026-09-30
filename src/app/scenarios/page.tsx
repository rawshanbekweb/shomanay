'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BarChart3, TrendingUp, Cpu, AlertTriangle, Zap, Flame, RotateCcw, Sparkles } from 'lucide-react';

export default function ScenariosPage() {
  const { t } = useApp();

  // Scenario parameters
  const [investGrowth, setInvestGrowth] = useState<number>(15); // +15%
  const [newProjectsCount, setNewProjectsCount] = useState<number>(3);
  const [powerLimitMwt, setPowerLimitMwt] = useState<number>(5.5);
  const [gasLimitM3h, setGasLimitM3h] = useState<number>(2000);

  // Baseline 2026 Shumanay economic statistics
  const baseIndustryMln = 368500;   // 368.5 mlrd som
  const baseJobs = 1580;            // 1580 ta ish o'rni
  const baseRetailTradeMln = 198000; // 198.0 mlrd som
  const baseTaxesMln = 73200;       // 73.2 mlrd som

  // Elasticity coefficients from 1-TZ and 2-TZ FR-16:
  // Industry: 0.70, Employment: 0.60, Income: 0.65, Retail: 0.55, Taxes: 0.45
  const elasticityIndustry = 0.70;
  const elasticityEmployment = 0.60;
  const elasticityRetail = 0.55;
  const elasticityTaxes = 0.45;

  // Impact calculations
  const industryDeltaPercent = investGrowth * elasticityIndustry;
  const employmentDeltaPercent = investGrowth * elasticityEmployment;
  const retailDeltaPercent = investGrowth * elasticityRetail;
  const taxesDeltaPercent = investGrowth * elasticityTaxes;

  const newIndustryVolume = Math.round(baseIndustryMln * (1 + industryDeltaPercent / 100));
  const newJobsCreated = Math.round(baseJobs * (employmentDeltaPercent / 100)) + newProjectsCount * 65;
  const newTaxesVolume = Math.round(baseTaxesMln * (1 + taxesDeltaPercent / 100));
  const newRetailVolume = Math.round(baseRetailTradeMln * (1 + retailDeltaPercent / 100));

  // Infrastructure demand from new projects
  const requiredPowerMwt = newProjectsCount * 1.8;
  const requiredGasM3h = newProjectsCount * 850;

  const isPowerDeficit = requiredPowerMwt > powerLimitMwt;
  const isGasDeficit = requiredGasM3h > gasLimitM3h;

  const handleReset = () => {
    setInvestGrowth(15);
    setNewProjectsCount(3);
    setPowerLimitMwt(5.5);
    setGasLimitM3h(2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-cyan-300" />
            {t.scenarioTitle}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {t.scenarioSubtitle} (FR-16)
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2.5 rounded-2xl bg-[#081324] hover:bg-slate-800/60 text-slate-200 text-xs font-bold border border-blue-900/50 shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <span>Boshlang&apos;ich parametrlar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Controls in Crisp White (5 cols) */}
        <div className="lg:col-span-5 p-8 rounded-3xl bg-[#081324] border border-blue-900/50 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-blue-900/40 pb-4">
            <Cpu className="w-5 h-5 text-cyan-300" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Ssenariy Parametrleri
            </h2>
          </div>

          {/* Slider 1: Investment Growth */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-200 font-bold">{t.investGrowthLabel}</span>
              <span className="text-cyan-300 font-mono font-black text-sm">
                {investGrowth > 0 ? `+${investGrowth}%` : `${investGrowth}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="50"
              step="1"
              value={investGrowth}
              onChange={(e) => setInvestGrowth(parseInt(e.target.value))}
              className="w-full accent-cyan-300 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>-20% (qısqarıw)</span>
              <span>0% (baza)</span>
              <span>+50% (maksimal)</span>
            </div>
          </div>

          {/* Slider 2: New Projects */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-200 font-bold">{t.newProjectsCountLabel}</span>
              <span className="text-emerald-400 font-mono font-black text-sm">
                {newProjectsCount} joybar
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={newProjectsCount}
              onChange={(e) => setNewProjectsCount(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0 joybar</span>
              <span>5 joybar</span>
              <span>10 joybar</span>
            </div>
          </div>

          {/* Slider 3: Available Power Limit */}
          <div className="space-y-2 pt-3 border-t border-blue-900/40">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-200 font-bold">{t.electricityCapLabel}</span>
              <span className="text-amber-400 font-mono font-black text-sm">
                {powerLimitMwt} MWt
              </span>
            </div>
            <input
              type="range"
              min="2.0"
              max="12.0"
              step="0.5"
              value={powerLimitMwt}
              onChange={(e) => setPowerLimitMwt(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Slider 4: Available Gas Limit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-200 font-bold">{t.gasCapLabel}</span>
              <span className="text-red-400 font-mono font-black text-sm">
                {gasLimitM3h} m³/saat
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={gasLimitM3h}
              onChange={(e) => setGasLimitM3h(parseInt(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          {/* Elasticity Reference Table */}
          <div className="p-4 rounded-2xl bg-[#0b1b33] border border-blue-900/50 text-xs space-y-2">
            <span className="font-bold text-slate-200 block">Metodikalıq Bog‘liqlik Koeffitsientleri:</span>
            <div className="flex justify-between text-slate-300">
              <span>Sanoat ishlab chiqarishi:</span>
              <span className="font-mono font-bold text-cyan-300">+0.70</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Bandlik va ish o&apos;rinlari:</span>
              <span className="font-mono font-bold text-emerald-400">+0.60</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Aholi real daromadlari:</span>
              <span className="font-mono font-bold text-blue-700">+0.65</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Mahalliy byudjet soliqlari:</span>
              <span className="font-mono font-bold text-amber-400">+0.45</span>
            </div>
          </div>
        </div>

        {/* Right: Calculated Impact & Bottleneck Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-8 rounded-3xl bg-[#081324] border border-blue-900/50 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-300" />
                {t.impactResultsTitle}
              </h2>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-950/40 text-cyan-300 border border-blue-800/50">
                Prognoz: 2026-2027
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Industry Result */}
              <div className="p-5 rounded-2xl bg-[#0b1b33] border border-blue-900/50 space-y-1.5">
                <span className="text-xs text-slate-400 font-medium">{t.impactIndustry}</span>
                <div className="text-2xl font-black text-white">
                  {(newIndustryVolume / 1000).toFixed(1)} mlrd som
                </div>
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {industryDeltaPercent > 0 ? `+${industryDeltaPercent.toFixed(1)}%` : `${industryDeltaPercent.toFixed(1)}%`} ósim
                </div>
              </div>

              {/* Jobs Result */}
              <div className="p-5 rounded-2xl bg-[#0b1b33] border border-blue-900/50 space-y-1.5">
                <span className="text-xs text-slate-400 font-medium">{t.impactEmployment}</span>
                <div className="text-2xl font-black text-emerald-400">
                  +{newJobsCreated.toLocaleString()} nafar
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {employmentDeltaPercent.toFixed(1)}% tábiyiy o‘sish + joybarlar
                </div>
              </div>

              {/* Retail Result */}
              <div className="p-5 rounded-2xl bg-[#0b1b33] border border-blue-900/50 space-y-1.5">
                <span className="text-xs text-slate-400 font-medium">{t.impactRetail}</span>
                <div className="text-2xl font-black text-white">
                  {(newRetailVolume / 1000).toFixed(1)} mlrd som
                </div>
                <div className="text-xs font-bold text-blue-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{retailDeltaPercent.toFixed(1)}% aylanba
                </div>
              </div>

              {/* Taxes Result */}
              <div className="p-5 rounded-2xl bg-[#0b1b33] border border-blue-900/50 space-y-1.5">
                <span className="text-xs text-slate-400 font-medium">{t.impactTaxes}</span>
                <div className="text-2xl font-black text-amber-400">
                  {(newTaxesVolume / 1000).toFixed(1)} mlrd som
                </div>
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{taxesDeltaPercent.toFixed(1)}% tushum
                </div>
              </div>
            </div>

            {/* Infrastructure Bottleneck Check */}
            <div className="p-5 rounded-2xl bg-[#0b1b33] border border-blue-900/50 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                {t.resourceBottlenecks}
              </h3>

              <div className="space-y-2.5 text-xs">
                {/* Electricity constraint */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#081324] border border-blue-900/50">
                  <div className="flex items-center gap-2 font-medium">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Elektr quwatı talabı: <strong className="text-white">{requiredPowerMwt.toFixed(1)} MWt</strong> (Mavjud: {powerLimitMwt} MWt)</span>
                  </div>
                  {isPowerDeficit ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950/40 text-red-400 border border-red-800/50">
                      DEFITSIT! (-{(requiredPowerMwt - powerLimitMwt).toFixed(1)} MWt)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-400">
                      JETKILIKLI
                    </span>
                  )}
                </div>

                {/* Gas constraint */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#081324] border border-blue-900/50">
                  <div className="flex items-center gap-2 font-medium">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span>Tábiyiy gaz talabı: <strong className="text-white">{requiredGasM3h} m³/saat</strong> (Mavjud: {gasLimitM3h} m³/saat)</span>
                  </div>
                  {isGasDeficit ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950/40 text-red-400 border border-red-800/50">
                      DEFITSIT! (-{requiredGasM3h - gasLimitM3h} m³/saat)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/40 text-emerald-400">
                      JETKILIKLI
                    </span>
                  )}
                </div>
              </div>

              {(isPowerDeficit || isGasDeficit) && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-400 font-medium leading-relaxed">
                  <strong>Xulosа:</strong> Belgilengen ssenariy boyınsha {newProjectsCount} jańa joybardı tolıq quwatqa qosıw ushın
                  infrastruktura jónelisi boyınsha qosımsha podstanciya yamasa gaz trubası rekonstruktsiyası tapsırması beriliwi shárt.
                </div>
              )}
            </div>

            {/* FR-16 Disclaimer */}
            <div className="text-xs text-slate-400 italic border-t border-blue-900/40 pt-4">
              Rásmiy eskertiw (FR-16): Ushbu ssenariy hisob-kitoblari ssenariy modeli hisoblanadi va amaldagi rásmiy statistika faktlarin ózgertpeydi.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
