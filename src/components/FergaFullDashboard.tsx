'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import projectedDistrictsData from '@/data/karakalpakstan_projected.json';
import { LayoutDashboard, Shield, MapPin, GitCompare, BookOpen, Settings, RotateCcw, Sun, Maximize2, Sparkles, ArrowUpRight, ChevronRight, Compass } from 'lucide-react';

interface DistrictItem {
  id: string;
  nameQq: string;
  nameUz: string;
  center: string;
  gdp: number;
  gdpText: string;
  rank: number;
  totalDistricts: number;
  period: string;
  centerCoords: { x: number; y: number };
  svgPath: string;
}

export const FergaFullDashboard: React.FC<{ onSwitchToStreetGis?: () => void }> = ({ onSwitchToStreetGis }) => {
  const { openObjectPassport, objects, language, setLanguage } = useApp();
  
  // Default selected district: Kungrad or Shumanay
  const [selectedId, setSelectedId] = useState<string>('kungrad');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const districts: DistrictItem[] = projectedDistrictsData as DistrictItem[];
  
  // Sort districts by rank
  const sortedDistricts = [...districts].sort((a, b) => a.rank - b.rank);

  // Active district for details (hovered takes precedence, otherwise selected)
  const activeDistrict = districts.find((d) => d.id === (hoveredId || selectedId)) || districts[0];
  const selectedDistrict = districts.find((d) => d.id === selectedId) || districts[0];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-[#070e1b] text-white shadow-2xl font-sans">
      {/* Main Grid: Left Sidebar | Main Map & Top Bar | Right Sidebar */}
      <div className="flex flex-col lg:flex-row min-h-[780px]">

        {/* 1. LEFT SIDEBAR */}
        <aside className="w-full lg:w-64 bg-[#0a1120] border-b lg:border-b-0 lg:border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 z-20">
          <div className="space-y-6">
            {/* Emblem & Portal Brand */}
            <div className="flex items-center space-x-3.5 pb-5 border-b border-slate-800/60">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-900 to-slate-950 border border-blue-500/30 flex items-center justify-center p-1.5 shadow-md">
                {/* Karakalpakstan Parliament/Emblem Vector */}
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-200" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 21h18M4 18h16M5 14h14M6 10h12M12 2l8 5H4l8-5z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 14v4M12 14v4M16 14v4M9 10v4M15 10v4" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100 leading-tight">
                  Qaraqalpaqstan Respublikası
                </h3>
                <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                  Situaciyalıq oray
                </p>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="space-y-1 text-xs font-medium">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Ulıwma kórinis</span>
              </Link>

              <Link
                href="/tasks"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <Shield className="w-4 h-4 text-slate-500" />
                <span>Shtab</span>
              </Link>

              {/* ACTIVE MENU ITEM: Aymaqlar */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#261f46] text-purple-200 font-bold border border-purple-500/30 shadow-inner">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>Aymaqlar</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
              </div>

              <Link
                href="/scenarios"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <GitCompare className="w-4 h-4 text-slate-500" />
                <span>Salıstırıw</span>
              </Link>

              <Link
                href="/indicators"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>Barlıq kórsetkishler</span>
              </Link>
            </nav>

            {/* TARAWLAR Section */}
            <div className="pt-4 border-t border-slate-800/60 space-y-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3">
                TARAWLAR
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30 cursor-pointer">
                  <span>Málimleme texnologiyaları</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">27</span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30 cursor-pointer">
                  <span>Ekonomika</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">23</span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30 cursor-pointer">
                  <span>Jalpı aymaqlıq ónim</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">5</span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30 cursor-pointer">
                  <span>Sanaat</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">13</span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/30 cursor-pointer">
                  <span>Xalıq</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Settings Link */}
          <div className="pt-4 border-t border-slate-800/60">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Sazlawlar</span>
            </Link>
          </div>
        </aside>

        {/* 2. CENTER AREA: TOP BAR + INTERACTIVE KARAKALPAKSTAN MAP */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#070e1b] relative">
          
          {/* Top Bar with Breadcrumb and Action Tools */}
          <header className="h-14 border-b border-slate-800/70 px-6 flex items-center justify-between z-20 bg-[#070e1b]/80 backdrop-blur-md">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Analitika</span>
              <span className="text-slate-600">›</span>
              <span className="text-slate-200 font-bold">{selectedDistrict.nameQq} rayonı</span>
            </div>

            {/* Right Tools */}
            <div className="flex items-center gap-3">
              {/* Region Status indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span>Qaraqalpaqstan</span>
              </div>

              {/* Refresh */}
              <button
                onClick={() => setSelectedId('kungrad')}
                title="Qayta júklew"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Theme (Sun) */}
              <button
                title="Tema almastırıw"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>

              {/* Language Selector */}
              <button
                onClick={() => setLanguage(language === 'qq' ? 'uz' : language === 'uz' ? 'ru' : 'qq')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-300 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700"
              >
                <span className="text-[10px] text-slate-400 font-normal">文A</span>
                <span>{language.toUpperCase()}</span>
                <span className="text-[10px] text-slate-500">▾</span>
              </button>

              {/* Fullscreen Icon */}
              <button
                title="Tolıq ekran"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Purple Glowing AI Button: JI-den soraw */}
              <button
                onClick={() => alert(`Súwret boyınsha JI analizi: ${selectedDistrict.nameQq} rayonı Qaraqalpaqstan boyınsha ${selectedDistrict.rank}-orında (${selectedDistrict.gdpText}).`)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                <span>JI-den soraw</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          </header>

          {/* Map Canvas with Real Karakalpakstan GeoJSON Polygons */}
          <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden min-h-[640px]">
            {/* Background Radar Rings and Crosshairs */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="radarDarkGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.25" />
                  <stop offset="70%" stopColor="#0f172a" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="50%" cy="50%" r="50%" fill="url(#radarDarkGlow)" />
              <circle cx="50%" cy="50%" r="160" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="50%" cy="50%" r="280" fill="none" stroke="#2563eb" strokeWidth="1" strokeDasharray="6 6" />
              <circle cx="50%" cy="50%" r="420" fill="none" stroke="#1d4ed8" strokeWidth="1" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            {/* Vector Map Container */}
            <div className="relative w-full max-w-[800px] aspect-[800/750] flex items-center justify-center">
              <svg
                viewBox="0 0 800 750"
                className="w-full h-full drop-shadow-[0_0_35px_rgba(37,99,235,0.2)]"
              >
                <defs>
                  {/* Glowing Outline Filter */}
                  <filter id="fergaHighlightGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* 17 Real District Polygons */}
                {districts.map((d) => {
                  const isSelected = selectedId === d.id;
                  const isHovered = hoveredId === d.id;
                  const isHighlighted = isSelected || isHovered;

                  return (
                    <g key={d.id} className="transition-all duration-200">
                      <path
                        d={d.svgPath}
                        onClick={() => setSelectedId(d.id)}
                        onMouseEnter={() => setHoveredId(d.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="cursor-pointer transition-all duration-200"
                        fill={
                          isHighlighted
                            ? '#2b4d75'
                            : '#0e1d35'
                        }
                        fillOpacity={isHighlighted ? 0.75 : 0.55}
                        stroke={isHighlighted ? '#ffffff' : '#29548a'}
                        strokeWidth={isHighlighted ? 2.5 : 1.2}
                        strokeOpacity={isHighlighted ? 1 : 0.5}
                        filter={isHighlighted ? 'url(#fergaHighlightGlow)' : undefined}
                      />

                      {/* District Pulsing Center Dot */}
                      <g
                        transform={`translate(${d.centerCoords.x}, ${d.centerCoords.y})`}
                        className="pointer-events-none"
                      >
                        {/* Ping Circle */}
                        <circle
                          r={isHighlighted ? 12 : 7}
                          fill="none"
                          stroke={isHighlighted ? '#60a5fa' : '#38bdf8'}
                          strokeWidth="1.5"
                          strokeOpacity={isHighlighted ? 0.8 : 0.4}
                          className="animate-ping"
                          style={{ animationDuration: isHighlighted ? '2s' : '3.5s' }}
                        />
                        {/* Dot Ring */}
                        <circle
                          r={isHighlighted ? 8 : 4.5}
                          fill={isHighlighted ? '#0284c7' : '#0a1728'}
                          fillOpacity="0.9"
                          stroke={isHighlighted ? '#ffffff' : '#60a5fa'}
                          strokeWidth={isHighlighted ? 2 : 1.2}
                        />
                        {/* Core white center */}
                        <circle
                          r={isHighlighted ? 3 : 1.8}
                          fill="#ffffff"
                        />
                      </g>
                    </g>
                  );
                })}

                {/* Nókis City Label Tag exactly as seen in the screenshot */}
                <g transform="translate(460, 480)">
                  <rect
                    x="0"
                    y="0"
                    width="54"
                    height="24"
                    rx="6"
                    fill="#0a1526"
                    stroke="#1e3a5f"
                    strokeWidth="1.2"
                    className="shadow-lg"
                  />
                  <text
                    x="27"
                    y="16"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="system-ui"
                  >
                    Nókis
                  </text>
                </g>
              </svg>

              {/* Floating Glassmorphism Detail Tooltip (Identical to Screenshot!) */}
              <div
                className="absolute top-1/4 right-8 sm:right-16 w-72 rounded-3xl p-5 bg-[#0a1526]/90 border border-blue-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl z-30 pointer-events-auto transition-all duration-300"
              >
                {/* Blue dot indicator & District Name */}
                <div className="flex items-center gap-2 mb-2 text-slate-300 text-xs font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                  <span className="text-white text-sm font-bold tracking-tight">
                    {activeDistrict.nameQq} rayonı
                  </span>
                </div>

                {/* Big Indicator Number */}
                <div className="mt-2 mb-1">
                  <div className="text-4xl font-black text-white tracking-tight">
                    {activeDistrict.gdp < 1000 ? activeDistrict.gdp.toFixed(1).replace('.', ',') : (activeDistrict.gdp / 1000).toFixed(2).replace('.', ',')}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">
                    {activeDistrict.gdp >= 1000 ? 'trillion' : 'milliard'} som · {activeDistrict.period}
                  </div>
                </div>

                {/* Rayon Orayi */}
                <div className="pt-3 pb-3 border-t border-slate-700/50 mt-4 text-xs">
                  <div className="text-slate-300 font-medium">
                    Rayon orayı:{' '}
                    <strong className="text-white font-bold">{activeDistrict.center}</strong>
                  </div>
                </div>

                {/* Aymaqlar arasindagi orni */}
                <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">
                    Aymaqlar arasındaǵı ornı
                  </span>
                  <span className="text-base font-black text-white font-mono">
                    {activeDistrict.rank}{' '}
                    <span className="text-slate-500 text-xs font-normal">/ {activeDistrict.totalDistricts}</span>
                  </span>
                </div>

                {/* If Shumanay is active, link to its local passport */}
                {activeDistrict.id === 'shumanay' && (
                  <button
                    onClick={() => {
                      if (objects.length > 0) openObjectPassport(objects[0]);
                    }}
                    className="w-full mt-4 py-2 px-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Shomanay Pasportı & Obyektler</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom-right OpenStreetMap attribution like in the screenshot */}
            <div className="absolute bottom-3 right-5 text-[11px] text-slate-500 font-sans tracking-wide">
              © OpenStreetMap · ODbL
            </div>
          </div>
        </div>

        {/* 3. RIGHT SIDEBAR: BIG STAT DISPLAY & 17 DISTRICTS RANKING LIST */}
        <aside className="w-full lg:w-80 bg-[#0a1120] border-t lg:border-t-0 lg:border-l border-slate-800/80 p-5 flex flex-col justify-between shrink-0 z-20">
          <div>
            {/* Top Selected District Big Statistic */}
            <div className="pb-5 border-b border-slate-800/70">
              <div className="text-4xl font-black text-white tracking-tight">
                {selectedDistrict.gdp < 1000 ? selectedDistrict.gdp.toFixed(1).replace('.', ',') : (selectedDistrict.gdp / 1000).toFixed(2).replace('.', ',')}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                {selectedDistrict.gdp >= 1000 ? 'trillion' : 'milliard'} som
              </div>
              <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                <span>Aymaqlar arasındaǵı ornı:</span>
                <strong className="text-white font-mono font-bold">
                  {selectedDistrict.rank} / {selectedDistrict.totalDistricts}
                </strong>
              </div>
            </div>

            {/* 17 Ranked Territories List */}
            <div className="mt-4 space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
              {sortedDistricts.map((d) => {
                const isSelected = selectedId === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/70 border border-blue-500/50 shadow-md text-white font-bold'
                        : 'bg-slate-900/40 hover:bg-slate-850 border border-slate-800/40 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 text-center font-mono font-bold ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                        {d.rank}
                      </span>
                      <span className="truncate max-w-[120px]">{d.nameQq}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 group-hover:text-slate-200">
                      <span>{d.gdpText}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick toggle to Street GIS mode if requested */}
          {onSwitchToStreetGis && (
            <div className="pt-4 border-t border-slate-800/70">
              <button
                onClick={onSwitchToStreetGis}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Lokal GIS Obyektler Kartasına ótiw</span>
              </button>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};
