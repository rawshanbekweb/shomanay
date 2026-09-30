'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Factory,
  Zap,
  Flame,
  Droplets,
  MapPin,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function IndustrialZonesPage() {
  const { industrialZones, mfys, t } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Factory className="w-7 h-7 text-cyan-300" />
          {t.pageZonesTitle}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          {t.pageZonesSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {industrialZones.map((zone) => {
          const mfy = mfys.find((m) => m.id === zone.mfyId);
          const landFreePercent = Math.round((zone.freeAreaHa / zone.totalAreaHa) * 100);
          const electFreePercent = Math.round((zone.capacities.electricityMwt.free / zone.capacities.electricityMwt.total) * 100);
          const gasFreePercent = Math.round((zone.capacities.gasM3H.free / zone.capacities.gasM3H.total) * 100);
          const waterFreePercent = Math.round((zone.capacities.waterM3Day.free / zone.capacities.waterM3Day.total) * 100);

          return (
            <div
              key={zone.id}
              className="p-8 rounded-3xl bg-[#081324] border border-blue-900/50 shadow-sm space-y-6 hover:shadow-md hover:shadow-blue-900/20 transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-950/40 text-amber-400 border border-amber-800/50 font-mono font-bold">
                    {zone.type}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-2">{zone.name}</h2>
                  <p className="text-xs sm:text-sm text-slate-400 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1 text-cyan-400 shrink-0" />
                    {mfy?.name}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Belsendi kárxanalar</div>
                  <div className="text-2xl font-black text-cyan-300">{zone.activeCompaniesCount} kárxana</div>
                </div>
              </div>

              {/* Area & Jobs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#0b1b33] border border-blue-900/50">
                  <div className="text-xs text-slate-400">Jámi maydan</div>
                  <div className="text-base font-bold text-white mt-1">{zone.totalAreaHa} Ga</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">{zone.freeAreaHa} Ga bos ({landFreePercent}%)</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0b1b33] border border-blue-900/50">
                  <div className="text-xs text-slate-400">Investiciya</div>
                  <div className="text-base font-bold text-cyan-300 mt-1">{zone.totalInvestmentMlnUzs.toLocaleString()} mln</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0b1b33] border border-blue-900/50">
                  <div className="text-xs text-slate-400">Jumıs orınları</div>
                  <div className="text-base font-bold text-white mt-1">{zone.totalJobs} nafar</div>
                </div>
              </div>

              {/* Resource Capacities (FR-03 Balance) */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Resurs Quwatlılıqları Balansı</span>
                  <span className="text-[11px] text-slate-400 font-normal">Tastıyıqlanǵan limitler boyınsha</span>
                </h3>

                {/* Electricity */}
                <div className="p-4 rounded-2xl bg-[#0b1b33] border border-blue-900/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Elektr energiyası
                    </span>
                    <span className="text-slate-400">
                      Jámi: <strong className="text-white">{zone.capacities.electricityMwt.total} MWt</strong> | Bos:{' '}
                      <strong className="text-emerald-400">{zone.capacities.electricityMwt.free} MWt ({electFreePercent}%)</strong>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${100 - electFreePercent}%` }}
                      className="bg-amber-500 h-full"
                    />
                    <div style={{ width: `${electFreePercent}%` }} className="bg-emerald-600 h-full" />
                  </div>
                </div>

                {/* Gas */}
                <div className="p-4 rounded-2xl bg-[#0b1b33] border border-blue-900/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-bold flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-500" />
                      Tábiyiy gaz
                    </span>
                    <span className="text-slate-400">
                      Jámi: <strong className="text-white">{zone.capacities.gasM3H.total} m³/saat</strong> | Bos:{' '}
                      <strong className={gasFreePercent < 15 ? 'text-red-400' : 'text-emerald-400'}>
                        {zone.capacities.gasM3H.free} m³/saat ({gasFreePercent}%)
                      </strong>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${100 - gasFreePercent}%` }}
                      className={gasFreePercent < 15 ? 'bg-red-500 h-full' : 'bg-amber-500 h-full'}
                    />
                    <div style={{ width: `${gasFreePercent}%` }} className="bg-emerald-600 h-full" />
                  </div>
                </div>

                {/* Water */}
                <div className="p-4 rounded-2xl bg-[#0b1b33] border border-blue-900/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-bold flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-500" />
                      Suw támiynatı
                    </span>
                    <span className="text-slate-400">
                      Jámi: <strong className="text-white">{zone.capacities.waterM3Day.total} m³/kún</strong> | Bos:{' '}
                      <strong className="text-emerald-400">{zone.capacities.waterM3Day.free} m³/kún ({waterFreePercent}%)</strong>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${100 - waterFreePercent}%` }}
                      className="bg-cyan-600 h-full"
                    />
                    <div style={{ width: `${waterFreePercent}%` }} className="bg-emerald-600 h-full" />
                  </div>
                </div>
              </div>

              {/* Infrastructure Readiness Icons */}
              <div className="pt-3 border-t border-blue-900/40 flex items-center justify-between text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  {zone.capacities.asphaltRoad ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-500" />}
                  <span>Asfalt jol</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {zone.capacities.sewageAvailable ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-500" />}
                  <span>Kanalizaciya</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {zone.capacities.railwayConnected ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-500" />}
                  <span>Temir jol tarmog‘i</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
