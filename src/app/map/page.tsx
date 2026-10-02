'use client';

import React, { useState } from 'react';
import { MfyMap } from '@/components/MfyMap';
import { ObjectFormModal } from '@/components/ObjectFormModal';
import { DistrictMap } from '@/components/DistrictMap';
import { Compass, Radar } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function MapPage() {
  const { t, currentUser } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const canEdit = ['admin', 'hokim', 'coordinator', 'statistician'].includes(currentUser.role);
  // 'shumanay_model' is the 100% Shumanay territory radar model matching mydomen.uz
  const [activeView, setActiveView] = useState<'shumanay_model' | 'gis'>('shumanay_model');

  return (
    <div className="w-full space-y-4">
      {/* If street GIS mode is active, show back button to Shumanay radar model */}
      {activeView === 'gis' && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#111620] border border-white/10 shadow-xl text-white">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-violet-400" />
            <div>
              <h1 className="text-sm font-semibold text-white tracking-tight">
                {t.pageMapTitle}
              </h1>
              <p className="text-[11px] text-slate-400">
                {t.pageMapSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('shumanay_model')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 border border-violet-500/50 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Radar className="w-3.5 h-3.5 text-violet-300" />
            <span>Shomanay Situacion Modeliga qaytıw</span>
          </button>
        </div>
      )}

      {/* Main View */}
      {activeView === 'shumanay_model' ? (
        <>
          <MfyMap tall onSwitchToStreetGis={() => setActiveView('gis')} onAddObject={canEdit ? () => setFormOpen(true) : undefined} />
          {formOpen && <ObjectFormModal onClose={() => setFormOpen(false)} />}
        </>
      ) : (
        <DistrictMap />
      )}
    </div>
  );
}
