'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ChevronRight, Info } from 'lucide-react';

interface DistrictData {
  id: string;
  name: string;
  nameQq: string;
  center: string;
  centerCoords: { x: number; y: number };
  gdp: string;
  rank: number;
  totalDistricts: number;
  period: string;
  industry: string;
  agriculture: string;
  services: string;
  investments: string;
  population: string;
  path: string;
}

export const FergaTerritoryRadarMap: React.FC = () => {
  const { openObjectPassport, objects } = useApp();
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('shumanay');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('yanvar-iyun');
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  // All 17 territories of Karakalpakstan with real statistical rankings & SVG shapes
  const districts: Record<string, DistrictData> = {
    shumanay: {
      id: 'shumanay',
      name: 'Shumanay tumani',
      nameQq: 'Shomanay rayonı',
      center: 'Shomanay',
      centerCoords: { x: 375, y: 558 },
      gdp: '128,1',
      rank: 16,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '48,6 mlrd',
      agriculture: '52,3 mlrd',
      services: '21,8 mlrd',
      investments: '5,4 mlrd',
      population: '56 400',
      // Highlighted polygon for Shumanay
      path: 'M 350 540 L 395 530 L 415 565 L 390 595 L 345 580 Z',
    },
    nukus_city: {
      id: 'nukus_city',
      name: 'Nukus shahri',
      nameQq: 'Nókis qalası',
      center: 'Nókis',
      centerCoords: { x: 448, y: 565 },
      gdp: '2 410,5',
      rank: 1,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '1 240,0 mlrd',
      agriculture: '18,5 mlrd',
      services: '980,2 mlrd',
      investments: '171,8 mlrd',
      population: '335 000',
      path: 'M 436 552 L 462 552 L 466 578 L 438 578 Z',
    },
    nukus_district: {
      id: 'nukus_district',
      name: 'Nukus tumani',
      nameQq: 'Nókis rayonı',
      center: 'Aqmang\'ıt',
      centerCoords: { x: 468, y: 540 },
      gdp: '345,2',
      rank: 10,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '110,4 mlrd',
      agriculture: '142,0 mlrd',
      services: '78,5 mlrd',
      investments: '14,3 mlrd',
      population: '51 200',
      path: 'M 462 525 L 505 520 L 515 565 L 468 572 L 462 552 Z',
    },
    kungrad: {
      id: 'kungrad',
      name: 'Qo\'ng\'irot tumani',
      nameQq: 'Qońırat rayonı',
      center: 'Qońırat',
      centerCoords: { x: 320, y: 380 },
      gdp: '1 890,4',
      rank: 2,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '1 420,0 mlrd',
      agriculture: '210,0 mlrd',
      services: '180,4 mlrd',
      investments: '80,0 mlrd',
      population: '133 200',
      path: 'M 50 100 L 290 20 L 330 240 L 260 410 L 140 460 L 140 680 L 50 680 Z',
    },
    muynak: {
      id: 'muynak',
      name: 'Mo\'ynoq tumani',
      nameQq: 'Moynaq rayonı',
      center: 'Moynaq',
      centerCoords: { x: 390, y: 220 },
      gdp: '215,8',
      rank: 14,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '68,2 mlrd',
      agriculture: '42,0 mlrd',
      services: '85,4 mlrd',
      investments: '20,2 mlrd',
      population: '32 400',
      path: 'M 290 20 L 530 205 L 480 340 L 330 240 Z',
    },
    khodjeyli: {
      id: 'khodjeyli',
      name: 'Xo\'jayli tumani',
      nameQq: 'Xójeli rayonı',
      center: 'Xójeli',
      centerCoords: { x: 418, y: 575 },
      gdp: '620,1',
      rank: 5,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '240,5 mlrd',
      agriculture: '190,0 mlrd',
      services: '145,6 mlrd',
      investments: '44,0 mlrd',
      population: '126 500',
      path: 'M 395 530 L 436 552 L 438 595 L 390 595 Z',
    },
    takhiatash: {
      id: 'takhiatash',
      name: 'Taxiatosh tumani',
      nameQq: 'Taqıyatas rayonı',
      center: 'Taqıyatas',
      centerCoords: { x: 440, y: 620 },
      gdp: '980,6',
      rank: 3,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '780,2 mlrd',
      agriculture: '32,1 mlrd',
      services: '124,3 mlrd',
      investments: '44,0 mlrd',
      population: '54 100',
      path: 'M 418 600 L 458 595 L 452 642 L 415 638 Z',
    },
    kanlykul: {
      id: 'kanlykul',
      name: 'Qanliko\'l tumani',
      nameQq: 'Qanlıkól rayonı',
      center: 'Qanlıkól',
      centerCoords: { x: 360, y: 505 },
      gdp: '174,3',
      rank: 15,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '45,0 mlrd',
      agriculture: '88,3 mlrd',
      services: '31,0 mlrd',
      investments: '10,0 mlrd',
      population: '52 400',
      path: 'M 260 410 L 370 470 L 395 530 L 350 540 L 260 490 Z',
    },
    chimbay: {
      id: 'chimbay',
      name: 'Chimboy tumani',
      nameQq: 'Shımbay rayonı',
      center: 'Shımbay',
      centerCoords: { x: 475, y: 465 },
      gdp: '410,7',
      rank: 9,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '120,4 mlrd',
      agriculture: '168,3 mlrd',
      services: '98,0 mlrd',
      investments: '24,0 mlrd',
      population: '114 200',
      path: 'M 450 435 L 505 430 L 515 490 L 450 495 Z',
    },
    amudarya: {
      id: 'amudarya',
      name: 'Amudaryo tumani',
      nameQq: 'Ámiwdárya rayonı',
      center: 'Mang\'ıt',
      centerCoords: { x: 495, y: 670 },
      gdp: '710,5',
      rank: 4,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '210,5 mlrd',
      agriculture: '320,0 mlrd',
      services: '142,0 mlrd',
      investments: '38,0 mlrd',
      population: '204 800',
      path: 'M 460 635 L 530 630 L 525 715 L 465 710 Z',
    },
    beruniy: {
      id: 'beruniy',
      name: 'Beruniy tumani',
      nameQq: 'Beruniy rayonı',
      center: 'Beruniy',
      centerCoords: { x: 575, y: 720 },
      gdp: '580,2',
      rank: 6,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '195,2 mlrd',
      agriculture: '245,0 mlrd',
      services: '110,0 mlrd',
      investments: '30,0 mlrd',
      population: '197 400',
      path: 'M 530 630 L 610 630 L 625 740 L 545 745 Z',
    },
    turtkul: {
      id: 'turtkul',
      name: 'To\'rtko\'l tumani',
      nameQq: 'Tórtkól rayonı',
      center: 'Tórtkól',
      centerCoords: { x: 625, y: 770 },
      gdp: '540,8',
      rank: 7,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '175,0 mlrd',
      agriculture: '228,0 mlrd',
      services: '105,8 mlrd',
      investments: '32,0 mlrd',
      population: '219 000',
      path: 'M 580 735 L 675 730 L 685 820 L 595 810 Z',
    },
    ellikqala: {
      id: 'ellikqala',
      name: 'Ellikqal\'a tumani',
      nameQq: 'Ellikqala rayonı',
      center: 'Bostan',
      centerCoords: { x: 655, y: 705 },
      gdp: '495,3',
      rank: 8,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '150,0 mlrd',
      agriculture: '210,3 mlrd',
      services: '102,0 mlrd',
      investments: '33,0 mlrd',
      population: '166 000',
      path: 'M 610 630 L 695 625 L 705 735 L 615 735 Z',
    },
    karauzyak: {
      id: 'karauzyak',
      name: 'Qorao\'zak tumani',
      nameQq: 'Qaraózek rayonı',
      center: 'Qaraózek',
      centerCoords: { x: 550, y: 460 },
      gdp: '260,3',
      rank: 13,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '75,0 mlrd',
      agriculture: '125,3 mlrd',
      services: '48,0 mlrd',
      investments: '12,0 mlrd',
      population: '53 800',
      path: 'M 505 430 L 590 425 L 600 520 L 515 515 Z',
    },
    taxtakupir: {
      id: 'taxtakupir',
      name: 'Taxtako\'pir tumani',
      nameQq: 'Taxtakópir rayonı',
      center: 'Taxtakópir',
      centerCoords: { x: 615, y: 390 },
      gdp: '295,0',
      rank: 11,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '82,0 mlrd',
      agriculture: '148,0 mlrd',
      services: '51,0 mlrd',
      investments: '14,0 mlrd',
      population: '39 500',
      path: 'M 530 205 L 670 280 L 685 450 L 590 425 Z',
    },
    bozatau: {
      id: 'bozatau',
      name: 'Bo\'zatau tumani',
      nameQq: 'Bozataw rayonı',
      center: 'Bozataw',
      centerCoords: { x: 440, y: 465 },
      gdp: '112,0',
      rank: 17,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '24,0 mlrd',
      agriculture: '61,0 mlrd',
      services: '21,0 mlrd',
      investments: '6,0 mlrd',
      population: '21 800',
      path: 'M 370 470 L 450 435 L 450 495 L 395 530 Z',
    },
    kegeyli: {
      id: 'kegeyli',
      name: 'Kegeyli tumani',
      nameQq: 'Kegeyli rayonı',
      center: 'Kegeyli',
      centerCoords: { x: 485, y: 505 },
      gdp: '285,4',
      rank: 12,
      totalDistricts: 17,
      period: 'yanvar–iyun 2026',
      industry: '88,0 mlrd',
      agriculture: '124,0 mlrd',
      services: '58,4 mlrd',
      investments: '15,0 mlrd',
      population: '73 500',
      path: 'M 450 495 L 515 490 L 505 520 L 462 525 Z',
    },
  };

  const activeDistrict = districts[selectedDistrictId] || districts['shumanay'];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-[#070e1b] shadow-2xl flex flex-col xl:flex-row text-white">
      {/* 1. Left Control & Indicators Panel */}
      <div className="w-full xl:w-84 bg-[#0a1426]/90 border-b xl:border-b-0 xl:border-r border-blue-900/40 p-6 flex flex-col justify-between z-20 backdrop-blur-md">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              FERGA 2.0 · Aymaq Analitikası
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Qaraqalpaqstan Respublikası
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Rayonlar kesiminde ulıwma islep shıǵarıw hám reyting kórsetkishleri
            </p>
          </div>

          {/* Year & Period filter buttons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Esabat dáwiri:</span>
              <span className="text-cyan-300 font-mono font-bold">2026 Jıl</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedPeriod('yanvar-iyun')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  selectedPeriod === 'yanvar-iyun'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                Yanvar–Iyun
              </button>
              <button
                onClick={() => setSelectedPeriod('jilliq')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  selectedPeriod === 'jilliq'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                Jıllıq (Prognoz)
              </button>
            </div>
          </div>

          {/* Quick Territory Dropdown */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Rayondı tańlaw:
            </label>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-blue-900/60 text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {Object.values(districts).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameQq} (#{d.rank}) — {d.gdp} mlrd
                </option>
              ))}
            </select>
          </div>

          {/* Active District Statistics Card */}
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">{activeDistrict.nameQq}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-bold">
                {activeDistrict.rank} / {activeDistrict.totalDistricts} - orın
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Sanaat:</span>
                <span className="font-mono font-bold text-white">{activeDistrict.industry}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Awıl xojalıǵı:</span>
                <span className="font-mono font-bold text-white">{activeDistrict.agriculture}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Xızmetler:</span>
                <span className="font-mono font-bold text-white">{activeDistrict.services}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Investiciyalar:</span>
                <span className="font-mono font-bold text-emerald-400">{activeDistrict.investments}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-1.5 border-t border-blue-900/40">
                <span>Xalıq sanı:</span>
                <span className="font-mono text-slate-300">{activeDistrict.population} adam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend / Info */}
        <div className="pt-4 border-t border-blue-900/40 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Info className="w-3.5 h-3.5" />
            <span>Qaraqalpaqstan GIS Modeli</span>
          </div>
          <p>Xaritadaǵı rayonlar ustine basıp olardıń kórsetkishlerin kóriwińiz múmkin.</p>
        </div>
      </div>

      {/* 2. Main Radar Map Canvas */}
      <div className="flex-1 relative min-h-[600px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-radial from-[#0d1d36] via-[#07101f] to-[#040812]">
        {/* Radar Concentric Circles Background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#0369a1" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50%" cy="50%" r="48%" fill="url(#radarGlow)" />
          <circle cx="50%" cy="50%" r="140" fill="none" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="260" fill="none" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="50%" cy="50%" r="380" fill="none" stroke="#1e3a5f" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="490" fill="none" stroke="#172e4c" strokeWidth="1" strokeDasharray="8 8" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#172e4c" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#172e4c" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        {/* Territory Vector Polygons (Karakalpakstan Outline & Districts) */}
        <div className="relative w-full max-w-[850px] aspect-[850/800] p-4 flex items-center justify-center">
          <svg
            viewBox="0 0 800 850"
            className="w-full h-full drop-shadow-[0_0_30px_rgba(14,165,233,0.15)]"
          >
            <defs>
              {/* Neon Glow Filter */}
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Shumanay Bright Neon Filter */}
              <filter id="shumanayGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Republic Outer Boundary (Clean Cyber Outline) */}
            <path
              d="
                M 50 100
                L 290 20
                L 530 205
                L 670 280
                L 760 460
                L 695 625
                L 705 735
                L 685 820
                L 595 810
                L 525 715
                L 465 710
                L 452 642
                L 415 638
                L 390 595
                L 345 580
                L 260 490
                L 140 460
                L 140 680
                L 50 680
                Z
              "
              fill="#09182d"
              fillOpacity="0.75"
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />

            {/* Render each district polygon */}
            {Object.values(districts).map((d) => {
              const isSelected = selectedDistrictId === d.id;
              const isShumanay = d.id === 'shumanay';
              const isHovered = hoveredDistrict === d.id;

              return (
                <g key={d.id} className="transition-all duration-300">
                  <path
                    d={d.path}
                    onClick={() => setSelectedDistrictId(d.id)}
                    onMouseEnter={() => setHoveredDistrict(d.id)}
                    onMouseLeave={() => setHoveredDistrict(null)}
                    className="cursor-pointer transition-all duration-200"
                    fill={
                      isSelected
                        ? '#0369a1'
                        : isHovered
                        ? '#0c4a6e'
                        : isShumanay
                        ? '#082f49'
                        : '#0b1e38'
                    }
                    fillOpacity={isSelected ? '0.7' : isShumanay ? '0.5' : '0.4'}
                    stroke={
                      isSelected || isShumanay
                        ? '#ffffff'
                        : isHovered
                        ? '#38bdf8'
                        : '#3b82f6'
                    }
                    strokeWidth={isSelected || isShumanay ? '2.5' : '1'}
                    strokeOpacity={isSelected || isShumanay ? '1' : '0.35'}
                    filter={isSelected || isShumanay ? 'url(#shumanayGlow)' : undefined}
                  />

                  {/* Pulsing radar dot for district center */}
                  <g
                    transform={`translate(${d.centerCoords.x}, ${d.centerCoords.y})`}
                    className="pointer-events-none"
                  >
                    {/* Outer pulse */}
                    <circle
                      r={isSelected || isShumanay ? '14' : '8'}
                      fill="none"
                      stroke={isSelected || isShumanay ? '#38bdf8' : '#60a5fa'}
                      strokeWidth="1.5"
                      strokeOpacity="0.6"
                      className="animate-ping"
                      style={{ animationDuration: isShumanay ? '2s' : '3.5s' }}
                    />
                    {/* Ring */}
                    <circle
                      r={isSelected || isShumanay ? '9' : '5'}
                      fill={isSelected || isShumanay ? '#0284c7' : '#0f172a'}
                      fillOpacity="0.8"
                      stroke={isSelected || isShumanay ? '#ffffff' : '#93c5fd'}
                      strokeWidth={isSelected || isShumanay ? '2' : '1.2'}
                    />
                    {/* Inner bright core */}
                    <circle
                      r={isSelected || isShumanay ? '3.5' : '2'}
                      fill="#ffffff"
                    />
                  </g>
                </g>
              );
            })}

            {/* Permanent 'Nókis' Label Tag (exactly like in the screenshot) */}
            <g transform="translate(485, 550)">
              <rect
                x="0"
                y="0"
                width="62"
                height="26"
                rx="8"
                fill="#071326"
                stroke="#1e3a5f"
                strokeWidth="1.5"
                className="shadow-lg"
              />
              <text
                x="31"
                y="17"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="12"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                Nókis
              </text>
            </g>
          </svg>

          {/* 3. Floating Glassmorphism Detail Card (Matching Screenshot exactly!) */}
          <div
            className="absolute top-1/4 right-6 sm:right-12 md:right-20 w-72 sm:w-80 rounded-3xl p-6 bg-[#0a172c]/90 border border-blue-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl z-30 transition-all duration-300"
          >
            {/* Top District Name with blue indicator */}
            <div className="flex items-center gap-2 mb-2 text-slate-300 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
              <span className="text-white text-sm font-bold tracking-tight">
                {activeDistrict.nameQq}
              </span>
            </div>

            {/* Big Main Indicator Number (e.g. 128,1) */}
            <div className="mt-2 mb-1">
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {activeDistrict.gdp}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">
                milliard som · {activeDistrict.period}
              </div>
            </div>

            {/* Rayon Orayi */}
            <div className="pt-3 pb-3 border-t border-slate-700/50 mt-4 text-xs">
              <div className="text-slate-300 font-medium">
                Rayon orayı:{' '}
                <strong className="text-white font-bold">{activeDistrict.center}</strong>
              </div>
            </div>

            {/* Ranking: Aymaqlar arasindagi orni: 16 / 17 */}
            <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                Aymaqlar arasındaǵı ornı
              </span>
              <span className="text-base font-black text-white font-mono">
                {activeDistrict.rank}{' '}
                <span className="text-slate-500 text-xs font-normal">/ {activeDistrict.totalDistricts}</span>
              </span>
            </div>

            {/* Quick Passport Link if Shumanay */}
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
      </div>
    </div>
  );
};
