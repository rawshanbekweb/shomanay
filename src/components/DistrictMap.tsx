'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Layers, Search, Compass } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Map, LayerGroup } from 'leaflet';
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);


export const DistrictMap: React.FC = () => {
  const { objects, mfys, issues, openObjectPassport, t } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const polygonsLayerRef = useRef<LayerGroup | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMfy, setSelectedMfy] = useState<string>('all');

  // Layer switches
  const [layers, setLayers] = useState({
    mfyBoundaries: true,
    enterprises: true,
    investments: true,
    zones: true,
    infrastructure: true,
    issues: true,
  });

  const [isClient, setIsClient] = useState(false);


  const renderLayers = useCallback((L: typeof import('leaflet')) => {
    if (!mapInstanceRef.current || !polygonsLayerRef.current || !markersLayerRef.current) return;

    const polygonsLayer = polygonsLayerRef.current;
    const markersLayer = markersLayerRef.current;
    polygonsLayer.clearLayers();
    markersLayer.clearLayers();

    // 1. Draw MFY Polygons
    if (layers.mfyBoundaries) {
      mfys.forEach((mfy) => {
        if (selectedMfy !== 'all' && mfy.id !== selectedMfy) return;

        const polygon = L.polygon(mfy.polygon, {
          color: '#6d57d6',
          weight: 2,
          opacity: 0.8,
          fillColor: '#8b72ff',
          fillOpacity: 0.08,
          dashArray: '6, 6',
        });

        polygon.bindTooltip(
          `<div class="font-bold text-xs text-white">${escapeHtml(mfy.name)}</div><div class="text-[10px] text-violet-100">Xalıq: ${mfy.population.toLocaleString()}</div>`,
          { permanent: false, direction: 'center', className: 'custom-map-tooltip' }
        );

        polygonsLayer.addLayer(polygon);
      });
    }

    // 2. Filter Objects
    const filteredObjects = objects.filter((obj) => {
      const matchesSearch =
        obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || obj.type === selectedType;
      const matchesMfy = selectedMfy === 'all' || obj.mfyId === selectedMfy;

      // Layer visibility filter
      if (obj.type === 'enterprise' && !layers.enterprises) return false;
      if (obj.type === 'investment_project' && !layers.investments) return false;
      if (obj.type === 'industrial_zone' && !layers.zones) return false;
      if (obj.type === 'infrastructure' && !layers.infrastructure) return false;

      return matchesSearch && matchesType && matchesMfy;
    });

    // Lucide SVG paths for map markers (inline SVG, no emoji)
    const lucideSvgPaths: Record<string, string> = {
      enterprise:        '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
      investment_project:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
      industrial_zone:   '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
      infrastructure:    '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
      social:            '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="22"/><line x1="10" x2="10" y1="18" y2="22"/><line x1="14" x2="14" y1="18" y2="22"/><line x1="18" x2="18" y1="18" y2="22"/><polygon points="3 11 12 2 21 11"/>',
    };

    // 3. Draw Object Markers
    filteredObjects.forEach((obj) => {
      let iconColor = '#6d57d6';
      let borderColor = '#6d57d6';
      let bgColor = '#f3efff';

      if (obj.type === 'enterprise') {
        iconColor = '#6d57d6'; borderColor = '#6d57d6'; bgColor = '#f3efff';
      } else if (obj.type === 'investment_project') {
        iconColor = '#059669'; borderColor = '#059669'; bgColor = '#f0fdf4';
      } else if (obj.type === 'industrial_zone') {
        iconColor = '#d97706'; borderColor = '#d97706'; bgColor = '#fffbeb';
      } else if (obj.type === 'infrastructure') {
        iconColor = '#7c3aed'; borderColor = '#7c3aed'; bgColor = '#faf5ff';
      } else {
        iconColor = '#e11d48'; borderColor = '#e11d48'; bgColor = '#fff1f2';
      }

      const isRisk = obj.status === 'risk';
      if (isRisk) { borderColor = '#ef4444'; bgColor = '#fef2f2'; }

      const svgPath = lucideSvgPaths[obj.type] ?? lucideSvgPaths['enterprise'];

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="width:34px;height:34px;border-radius:10px;background:${bgColor};border:2px solid ${borderColor};box-shadow:0 2px 8px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>${isRisk ? '<div style="position:absolute;top:-4px;right:-4px;width:10px;height:10px;border-radius:50%;background:#ef4444;border:2px solid white;"></div>' : ''}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker(obj.coords, { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 text-slate-100 font-sans min-w-[220px]';
      popupContent.innerHTML = `
        <div class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 w-fit mb-1 border border-violet-400/30">${escapeHtml(obj.id)}</div>
        <h4 class="font-bold text-sm text-slate-100 leading-snug mb-1">${escapeHtml(obj.name)}</h4>
        <p class="text-xs text-slate-400 mb-2">${escapeHtml(obj.address)}</p>
        <div class="text-xs text-slate-400 mb-3">
          <span>Mas'ul: <strong class="text-slate-300">${escapeHtml(obj.responsibleOrg)}</strong></span>
        </div>
        <button id="btn-open-passport-${escapeHtml(obj.id)}" class="w-full py-2 px-3 text-xs font-bold bg-[#6d57d6] hover:bg-violet-500/15 text-white rounded-xl flex items-center justify-center gap-1 shadow-sm transition-colors cursor-pointer">
          <span>Obyekt Pasporti</span> →
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-open-passport-${escapeHtml(obj.id)}`);
        if (btn) {
          btn.onclick = () => openObjectPassport(obj);
        }
      });

      markersLayer.addLayer(marker);
    });

    // 4. Draw Issue Markers
    if (layers.issues) {
      issues.forEach((iss) => {
        if (iss.status === 'resolved' || iss.status === 'closed') return;
        const targetObj = objects.find((o) => o.id === iss.objectId);
        if (!targetObj) return;

        const offsetCoords: [number, number] = [
          targetObj.coords[0] + 0.003,
          targetObj.coords[1] + 0.003,
        ];

        const issueIcon = L.divIcon({
          className: 'custom-issue-marker',
          html: `<div style="width:28px;height:28px;border-radius:50%;background:#ef4444;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;" title="${escapeHtml(iss.title)}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const issueMarker = L.marker(offsetCoords, { icon: issueIcon });
        issueMarker.bindTooltip(
          `<div class="font-bold text-xs text-red-400">Mashqala: ${escapeHtml(iss.code)}</div><div class="text-xs text-slate-100">${escapeHtml(iss.title)}</div>`,
          { permanent: false, direction: 'top' }
        );

        markersLayer.addLayer(issueMarker);
      });
    }
  }, [objects, mfys, issues, layers, searchQuery, selectedType, selectedMfy, openObjectPassport]);

  // Initialize Map with clean light state portal tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const container = mapContainerRef.current;
    let cancelled = false;



    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (cancelled) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Shumanay center coordinates
      const map = L.map(container, {
        center: [42.6312, 59.1432],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Free OpenStreetMap tiles — no API key required
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      polygonsLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Draw Shumanay district outer boundary (approximate WGS-84 polygon)
      const districtBoundary = L.polygon(
        [
          [42.7050, 58.8800],
          [42.7200, 59.0500],
          [42.7100, 59.2200],
          [42.6800, 59.3500],
          [42.6200, 59.4200],
          [42.5500, 59.3800],
          [42.5000, 59.2500],
          [42.5100, 59.0800],
          [42.5400, 58.9200],
          [42.5900, 58.8300],
          [42.6600, 58.8100],
          [42.7050, 58.8800],
        ],
        {
          color: '#6d57d6',
          weight: 3,
          opacity: 0.9,
          fillColor: '#8b72ff',
          fillOpacity: 0.07,
          dashArray: undefined,
        }
      ).addTo(map);

      districtBoundary.bindTooltip(
        '<div class="font-bold text-xs text-white">Shomanay Rayonı</div><div class="text-[10px] text-violet-100">Qoraqalpogʻiston Respublikasi</div>',
        { permanent: false, direction: 'center', className: 'custom-map-tooltip' }
      );

      setIsClient(true);
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Layers when filter or data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((module) => {
      const L = module.default;
      renderLayers(L);
    });
  }, [isClient, renderLayers]);


  return (
    <div className="relative w-full h-[720px] rounded-3xl overflow-hidden border border-white/10 bg-[#111620] shadow-md flex flex-col md:flex-row">
      {/* Map Filter Controls Sidebar in Clean Crisp White */}
      <div className="w-full md:w-96 bg-[#111620] border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col gap-5 overflow-y-auto z-10">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-violet-300" />
              GIS Basqarıw & Qatlamlar
            </h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-400/30">
              WGS 84
            </span>
          </div>
          <p className="text-xs text-slate-400">Shomanay rayonı obyektleri hám infratuzilma qatlamları</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchObjectPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-[#111620] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Obyekt túri</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-slate-200 focus:outline-none focus:border-violet-400 focus:bg-[#111620]"
          >
            <option value="all">Barlıq túrler ({objects.length})</option>
            <option value="enterprise">Kárxanalar</option>
            <option value="investment_project">Investiciya joybarları</option>
            <option value="industrial_zone">Sanaat zonaları (KSZ)</option>
            <option value="infrastructure">Infrastruktura (Elektr, Gaz, Suw)</option>
            <option value="social">Sociallıq obyektler</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MPJ Aymaǵı</label>
          <select
            value={selectedMfy}
            onChange={(e) => setSelectedMfy(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-slate-200 focus:outline-none focus:border-violet-400 focus:bg-[#111620]"
          >
            <option value="all">Barlıq MPJlar ({mfys.length})</option>
            {mfys.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.code})
              </option>
            ))}
          </select>
        </div>

        {/* Layers toggle */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-violet-300" />
              Karta Qatlamları
            </span>
          </div>

          <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer font-medium hover:text-violet-300">
            <span className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-sm bg-violet-600 border border-white/10" />
              {t.layerMfy}
            </span>
            <input
              type="checkbox"
              checked={layers.mfyBoundaries}
              onChange={(e) => setLayers({ ...layers, mfyBoundaries: e.target.checked })}
              className="rounded border-slate-300 text-violet-300 focus:ring-0 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer font-medium hover:text-violet-300">
            <span className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#6d57d6]" />
              {t.layerEnterprises}
            </span>
            <input
              type="checkbox"
              checked={layers.enterprises}
              onChange={(e) => setLayers({ ...layers, enterprises: e.target.checked })}
              className="rounded border-slate-300 text-violet-300 focus:ring-0 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer font-medium hover:text-violet-300">
            <span className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              {t.layerInvestments}
            </span>
            <input
              type="checkbox"
              checked={layers.investments}
              onChange={(e) => setLayers({ ...layers, investments: e.target.checked })}
              className="rounded border-slate-300 text-violet-300 focus:ring-0 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer font-medium hover:text-violet-300">
            <span className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              {t.layerZones}
            </span>
            <input
              type="checkbox"
              checked={layers.zones}
              onChange={(e) => setLayers({ ...layers, zones: e.target.checked })}
              className="rounded border-slate-300 text-violet-300 focus:ring-0 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer font-medium hover:text-violet-300">
            <span className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-purple-600" />
              {t.layerInfrastructure}
            </span>
            <input
              type="checkbox"
              checked={layers.infrastructure}
              onChange={(e) => setLayers({ ...layers, infrastructure: e.target.checked })}
              className="rounded border-slate-300 text-violet-300 focus:ring-0 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer font-medium hover:text-violet-300">
            <span className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-600" />
              {t.layerIssues}
            </span>
            <input
              type="checkbox"
              checked={layers.issues}
              onChange={(e) => setLayers({ ...layers, issues: e.target.checked })}
              className="rounded border-slate-300 text-violet-300 focus:ring-0 w-4 h-4"
            />
          </label>
        </div>

        {/* Quick Legend */}
        <div className="mt-auto p-4 rounded-2xl bg-violet-500/10 border border-white/10 text-xs text-slate-300 space-y-1">
          <div className="font-bold text-violet-300">Qollanba:</div>
          <div>• Obyekt ústine bassańız, tolıq pasportı ashıladı</div>
          <div>• Qızıl belgiler: Zárúr mashqala noqatları</div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 h-full w-full relative">
        <div ref={mapContainerRef} className="w-full h-full bg-[#151a26]" />
        {!isClient && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111620] text-slate-400 text-sm">
            GIS Karta júklenbekte...
          </div>
        )}
      </div>
    </div>
  );
};
