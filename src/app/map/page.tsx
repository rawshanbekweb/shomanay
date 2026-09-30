'use client';

import React, { useState } from 'react';
import { ShumanayTerritoryModel } from '@/components/ShumanayTerritoryModel';
import { DistrictMap } from '@/components/DistrictMap';
import { Compass, Radar } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function MapPage() {
  const { t } = useApp();
  // 'shumanay_model' is the 100% Shumanay territory radar model matching mydomen.uz
  const [activeView, setActiveView] = useState<'shumanay_model' | 'gis'>('shumanay_model');

  return (
    <div className="w-full space-y-4">
      {/* If street GIS mode is active, show back button to Shumanay radar model */}
      {activeView === 'gis' && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#081324] border border-blue-900/60 shadow-xl text-white">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-cyan-400" />
            <div>
              <h1 className="text-sm font-black text-white tracking-tight">
                {t.pageMapTitle}
              </h1>
              <p className="text-[11px] text-slate-400">
                {t.pageMapSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('shumanay_model')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/50 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Radar className="w-3.5 h-3.5 text-cyan-300" />
            <span>Shomanay Situacion Modeliga qaytıw</span>
          </button>
        </div>
      )}

      {/* Main View */}
      {activeView === 'shumanay_model' ? (
        <ShumanayTerritoryModel onSwitchToStreetGis={() => setActiveView('gis')} />
      ) : (
        <DistrictMap />
      )}
    </div>
  );
}
