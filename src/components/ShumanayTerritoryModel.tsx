'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import gridModel from '@/data/shumanay_grid_model.json';
import { Compass, TrendingUp, ChevronRight, Users, Briefcase, Factory, Wheat, Activity } from 'lucide-react';

interface MfyPoint {
  id: string;
  name: string;
  code: string;
  population: string;
  projects: number;
  x: number;
  y: number;
}

export const ShumanayTerritoryModel: React.FC<{ onSwitchToStreetGis?: () => void }> = ({ onSwitchToStreetGis }) => {
  const { openObjectPassport, objects } = useApp();

  // Floating modal card ONLY shows on hover
  const [isDistrictHovered, setIsDistrictHovered] = useState(false);
  const [hoveredMfy, setHoveredMfy] = useState<MfyPoint | null>(null);
  const [selectedMfyId, setSelectedMfyId] = useState<string>('all');

  const { path: shumanayPath, mfys } = gridModel as {
    width: number;
    height: number;
    path: string;
    center: { x: number; y: number };
    mfys: MfyPoint[];
  };

  const isModalVisible = isDistrictHovered || hoveredMfy !== null;
  const activeMfy = hoveredMfy || (selectedMfyId !== 'all' ? mfys.find((m) => m.id === selectedMfyId) : null) || null;

  return (
    <div 
      className="w-full rounded-2xl overflow-hidden border border-blue-900/50 text-white shadow-2xl font-sans"
      style={{ backgroundColor: '#060d17' }}
    >
      {/* 1. Header Bar */}
      <div 
        className="px-6 py-3 border-b border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ backgroundColor: '#081324' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] animate-pulse" />
          <div>
            <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
              SHOMANAY RAYONÍ SITUACIYALÍQ MODELI
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold">
                FERGA 2.0
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Shomanay rayonı rásmiy GeoJSON kartası hám kórsetkishler paneli
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* MFY Selector */}
          <select
            value={selectedMfyId}
            onChange={(e) => setSelectedMfyId(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[11px] text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer border border-blue-800/60"
            style={{ backgroundColor: '#0c1b33' }}
          >
            <option value="all">Barlıq MPJlar (6 ta)</option>
            {mfys.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Toggle to Street GIS */}
          {onSwitchToStreetGis && (
            <button
              onClick={onSwitchToStreetGis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a3d8f] hover:bg-blue-800 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer border border-blue-500/40"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-300" />
              <span>Lokal GIS Kartası</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT: STRICTLY SIDE-BY-SIDE (NEVER WRAPS OR STACKS) */}
      <div 
        className="w-full flex flex-row items-stretch"
        style={{ minHeight: '520px', height: '540px' }}
      >

        {/* ◀️ CHAP QAPTAL: KÓRSETKISHLER PÁNELI (Exact 310px width sidebar) */}
        <div 
          className="p-4 border-r border-blue-900/50 flex flex-col justify-between shrink-0 overflow-y-auto"
          style={{ width: '310px', backgroundColor: '#071324' }}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-blue-900/50">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                  Shomanay Kórsetkishleri
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950 text-cyan-300 border border-blue-800/60 font-bold">
                2026 Jıl
              </span>
            </div>

            {/* The 6 Indicator Cards */}
            <div className="mt-2.5 space-y-2">
              {/* 1. YaHM */}
              <div 
                className="p-2.5 rounded-xl border border-blue-900/50 flex items-center justify-between transition-colors hover:border-cyan-500/40" 
                style={{ backgroundColor: '#09192f' }}
              >
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Jalpı ónim (YaHM)</div>
                  <div className="text-base font-black text-white font-mono mt-0.5">128,1 mlrd som</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                    #16 / 17
                  </span>
                </div>
              </div>

              {/* 2. Sanaat */}
              <div 
                className="p-2 rounded-xl border border-blue-900/50 flex items-center justify-between transition-colors hover:border-cyan-500/40" 
                style={{ backgroundColor: '#09192f' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800/50">
                    <Factory className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Sanaat islep shıǵarıw</div>
                    <div className="text-xs font-bold text-white font-mono">48,6 mlrd som</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 font-mono">+8.4%</span>
              </div>

              {/* 3. Awil xojaligi */}
              <div 
                className="p-2 rounded-xl border border-blue-900/50 flex items-center justify-between transition-colors hover:border-cyan-500/40" 
                style={{ backgroundColor: '#09192f' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/50">
                    <Wheat className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Awıl xojalıǵı</div>
                    <div className="text-xs font-bold text-white font-mono">52,3 mlrd som</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 font-mono">+5.1%</span>
              </div>

              {/* 4. Xizmetler */}
              <div 
                className="p-2 rounded-xl border border-blue-900/50 flex items-center justify-between transition-colors hover:border-cyan-500/40" 
                style={{ backgroundColor: '#09192f' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800/50">
                    <Briefcase className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Xızmetler tarawı</div>
                    <div className="text-xs font-bold text-white font-mono">21,8 mlrd som</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 font-mono">+11.2%</span>
              </div>

              {/* 5. Investiciyalar */}
              <div 
                className="p-2 rounded-xl border border-blue-900/50 flex items-center justify-between transition-colors hover:border-cyan-500/40" 
                style={{ backgroundColor: '#09192f' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800/50">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Investiciyalar</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono">5,4 mlrd som</div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-400">4 joybar</span>
              </div>

              {/* 6. Xaliq sani */}
              <div 
                className="p-2 rounded-xl border border-blue-900/50 flex items-center justify-between transition-colors hover:border-cyan-500/40" 
                style={{ backgroundColor: '#09192f' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 text-slate-300 flex items-center justify-center border border-slate-700/50">
                    <Users className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Xalıq sanı</div>
                    <div className="text-xs font-bold text-white font-mono">56 400 adam</div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-400">6 MPJ</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="pt-2 border-t border-blue-900/50">
            <button
              onClick={() => {
                if (objects.length > 0) openObjectPassport(objects[0]);
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Shomanay Obyekt Pasportı</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 🗺️ O'RTADA / O'NG TÁREP: SHOMANAY RADAR KARTASÍ (Fills remaining width) */}
        <div 
          className="flex-1 relative h-full flex items-center justify-center overflow-hidden cursor-crosshair select-none"
          style={{ backgroundColor: '#060d17', minWidth: '0' }}
        >
          {/* Top Info Banner on the Map */}
          <div className="absolute top-3 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a1728]/80 border border-blue-900/50 text-[11px] text-slate-300 backdrop-blur-md z-10 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Shomanay Rayonı Kartası (WGS-84)</span>
          </div>

          {/* SVG Map Canvas */}
          <svg
            viewBox="0 0 650 500"
            className="w-full h-full drop-shadow-[0_0_25px_rgba(2,132,199,0.22)]"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Radial Glow */}
              <radialGradient id="cyberRadarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0369a1" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#0c2340" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#060d17" stopOpacity="0" />
              </radialGradient>

              {/* Neon Glow Filter */}
              <filter id="shmCyberGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Fill Gradient */}
              <linearGradient id="shmCyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14395d" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0a1d33" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            {/* Solid Dark Background */}
            <rect width="650" height="500" fill="#060d17" />
            <circle cx="325" cy="250" r="230" fill="url(#cyberRadarGlow)" />

            {/* Concentric Radar Rings Centered on Shumanay at (325, 250) */}
            <circle cx="325" cy="250" r="75" fill="none" stroke="#1d4ed8" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="325" cy="250" r="150" fill="none" stroke="#1d4ed8" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
            <circle cx="325" cy="250" r="225" fill="none" stroke="#1e40af" strokeWidth="0.8" opacity="0.5" />
            <circle cx="325" cy="250" r="300" fill="none" stroke="#1e3a8a" strokeWidth="0.8" strokeDasharray="6 6" opacity="0.3" />

            {/* Crosshairs */}
            <line x1="325" y1="20" x2="325" y2="480" stroke="#1e3a5f" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />
            <line x1="20" y1="250" x2="630" y2="250" stroke="#1e3a5f" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.4" />

            {/* Turkmenistan International Border Line */}
            <line
              x1="140"
              y1="90"
              x2="460"
              y2="430"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeDasharray="5 3"
              opacity="0.35"
            />

            {/* SHOMANAY POLYGON (NEAT, PROPORTIONATE, NEVER OVERFLOWS) */}
            <g className="transition-all duration-300">
              <path
                d={shumanayPath}
                fill="url(#shmCyberGrad)"
                stroke={isDistrictHovered ? '#67e8f9' : '#ffffff'}
                strokeWidth={isDistrictHovered ? '2.8' : '2'}
                filter="url(#shmCyberGlow)"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setIsDistrictHovered(true)}
                onMouseLeave={() => setIsDistrictHovered(false)}
              />

              {/* Inner accent stroke */}
              <path
                d={shumanayPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.8"
                strokeOpacity="0.5"
                className="pointer-events-none"
              />
            </g>

            {/* Shumanay Internal MFY Radar Points (STABLE HITBOX, NO JITTER) */}
            {mfys.map((m) => {
              const isMfySelected = selectedMfyId === m.id;
              const isMfyHovered = hoveredMfy?.id === m.id;
              const isHighlighted = isMfySelected || isMfyHovered;
              const isTextLeft = ('textPos' in m ? m.textPos : undefined) === 'left';

              return (
                <g
                  key={m.id}
                  transform={`translate(${m.x}, ${m.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredMfy(m);
                  }}
                  onMouseLeave={() => {
                    setHoveredMfy(null);
                  }}
                  onClick={() => setSelectedMfyId(m.id)}
                >
                  {/* Invisible generous hitbox circle to stably catch hover without jitter */}
                  <circle r="18" fill="transparent" />

                  {/* Ping radar ring */}
                  <circle
                    r={isHighlighted ? 14 : 8}
                    fill="none"
                    stroke={isHighlighted ? '#38bdf8' : '#60a5fa'}
                    strokeWidth="1.2"
                    strokeOpacity="0.75"
                    className="animate-ping pointer-events-none"
                    style={{ animationDuration: isHighlighted ? '1.5s' : '2.8s' }}
                  />

                  {/* Outer glow ring */}
                  <circle
                    r={isHighlighted ? 7.5 : 5}
                    fill={isHighlighted ? '#0284c7' : '#07182f'}
                    fillOpacity="0.95"
                    stroke={isHighlighted ? '#ffffff' : '#38bdf8'}
                    strokeWidth={isHighlighted ? 2 : 1.2}
                    className="pointer-events-none transition-all duration-200"
                  />

                  {/* Core dot */}
                  <circle
                    r={isHighlighted ? 3 : 2}
                    fill="#ffffff"
                    className="pointer-events-none"
                  />

                  {/* MFY Label */}
                  <text
                    x={isTextLeft ? -10 : 10}
                    y="3.5"
                    textAnchor={isTextLeft ? 'end' : 'start'}
                    fill={isHighlighted ? '#38bdf8' : '#94a3b8'}
                    fontSize="9.5"
                    fontWeight={isHighlighted ? 'bold' : 'normal'}
                    fontFamily="system-ui"
                    className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] pointer-events-none select-none transition-colors duration-150"
                  >
                    {m.name.replace(' (Oray)', '')}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* FLOATING MODAL CARD: ONLY SHOWS ON HOVER OVER SHUMANAY */}
          {isModalVisible && (
            <div 
              className="absolute top-8 right-6 w-64 rounded-2xl p-4 border border-blue-500/40 shadow-[0_12px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl z-30 transition-all duration-200 animate-in fade-in zoom-in-95 pointer-events-auto"
              style={{ backgroundColor: 'rgba(10, 23, 44, 0.95)' }}
              onMouseEnter={() => setIsDistrictHovered(true)}
              onMouseLeave={() => setIsDistrictHovered(false)}
            >
              <div className="flex items-center gap-2 mb-1 text-slate-300 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                <span className="text-white text-xs font-bold tracking-tight">
                  {activeMfy ? activeMfy.name : 'Shomanay rayonı'}
                </span>
              </div>

              <div className="mt-1 mb-1">
                <div className="text-3xl font-black text-white tracking-tight font-sans">
                  128,1
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  milliard som · yanvar–iyun 2026
                </div>
              </div>

              <div className="pt-2 pb-2 border-t border-slate-700/50 mt-2.5 text-[11px]">
                <div className="text-slate-300 font-medium">
                  Rayon orayı: <strong className="text-white font-bold">Shomanay</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  Aymaqlar arasındaǵı ornı
                </span>
                <span className="text-sm font-black text-white font-mono">
                  16 <span className="text-slate-500 text-[10px] font-normal">/ 17</span>
                </span>
              </div>

              <button
                onClick={() => {
                  if (objects.length > 0) openObjectPassport(objects[0]);
                }}
                className="w-full mt-3 py-1.5 px-3 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Shomanay Obyekt Pasportı</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Bottom Attribution */}
          <div className="absolute bottom-2 right-4 text-[10px] text-slate-500 font-sans tracking-wide">
            © OpenStreetMap · ODbL
          </div>
        </div>

      </div>
    </div>
  );
};
