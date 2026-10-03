'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Box, Building2, Compass, Crosshair, Factory, Landmark, Layers, Maximize2, Minimize2, Minus, Orbit, Plus, Search, TrendingUp, TriangleAlert, Users, Briefcase, X, Zap } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Map as GLMap, Marker, GeoJSONSource, StyleSpecification } from 'maplibre-gl';
import type { DistrictObject, ObjectType } from '@/types';
import { SHOMANAY_BOUNDARY } from '@/lib/shomanay-boundary';
import { bboxOf, borderRing, buildTerritories, outsideMask, type LngLat } from '@/lib/geo';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/* ───────── asos xaritalar (API kalitsiz) ───────── */
type BaseId = 'hybrid' | 'satellite' | 'terrain' | 'dark' | 'streets';
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
const CARTO = ['a', 'b', 'c', 'd'];
const BASES: Record<BaseId, { label: string; layers: string[]; swatch: string; dark: boolean }> = {
  hybrid: { label: 'Gibrid', layers: ['imagery', 'labels'], swatch: 'linear-gradient(135deg,#2c4a2e,#8a7a4c 55%,#3a5a6a)', dark: true },
  satellite: { label: 'Sun’iy yo‘ldosh', layers: ['imagery'], swatch: 'linear-gradient(135deg,#1f3a24,#6e6a45 60%,#2b4a55)', dark: true },
  terrain: { label: 'Relyef', layers: ['topo'], swatch: 'linear-gradient(135deg,#d6e4c0,#e9dcb6 55%,#b9d4dc)', dark: false },
  dark: { label: 'Tungi', layers: ['night'], swatch: 'linear-gradient(135deg,#0b0f17,#1b2233 60%,#12202a)', dark: true },
  streets: { label: 'Ko‘cha', layers: ['streets'], swatch: 'linear-gradient(135deg,#eae6dc,#f6f3ec 55%,#cfe0e8)', dark: false },
};
const RASTERS: Record<string, { tiles: string[]; maxzoom: number; attribution?: string }> = {
  imagery: { tiles: [`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`], maxzoom: 18, attribution: 'Esri, Maxar, Earthstar Geographics' },
  labels: { tiles: [`${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`], maxzoom: 18 },
  topo: { tiles: [`${ESRI}/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`], maxzoom: 18, attribution: 'Esri, USGS, NOAA' },
  night: { tiles: CARTO.map((s) => `https://${s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`), maxzoom: 19, attribution: '© OpenStreetMap, © CARTO' },
  streets: { tiles: CARTO.map((s) => `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`), maxzoom: 19, attribution: '© OpenStreetMap, © CARTO' },
};

const mapStyle = (): StyleSpecification => ({
  version: 8,
  sources: Object.fromEntries(Object.entries(RASTERS).map(([k, v]) => [k, { type: 'raster', tileSize: 256, ...v }])),
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#0b0f17' } },
    ...Object.keys(RASTERS).map((k) => ({ id: `base-${k}`, type: 'raster' as const, source: k, layout: { visibility: 'none' as const }, paint: { 'raster-fade-duration': 250 } })),
  ],
});

/* ───────── obyekt turlari ───────── */
const TYPE_META: Record<ObjectType, { label: string; color: string; Icon: React.ElementType; path: string }> = {
  enterprise: { label: 'Kárxanalar', color: '#a78bfa', Icon: Factory, path: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>' },
  investment_project: { label: 'Joybarlar', color: '#34d399', Icon: TrendingUp, path: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>' },
  industrial_zone: { label: 'Sanaat zonaları', color: '#fbbf24', Icon: Building2, path: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>' },
  infrastructure: { label: 'Infratuzilma', color: '#60a5fa', Icon: Zap, path: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
  social: { label: 'Sociallıq', color: '#f472b6', Icon: Landmark, path: '<line x1="3" x2="21" y1="22" y2="22"/><polygon points="3 11 12 2 21 11"/><path d="M6 18v4M10 18v4M14 18v4M18 18v4"/>' },
};
const TYPES = Object.keys(TYPE_META) as ObjectType[];

type Metric = 'population' | 'projects' | 'issues';
const METRICS: { id: Metric; label: string; rgb: [number, number, number]; Icon: React.ElementType }[] = [
  { id: 'population', label: 'Aholi', rgb: [139, 114, 255], Icon: Users },
  { id: 'projects', label: 'Joybarlar', rgb: [43, 181, 214], Icon: Briefcase },
  { id: 'issues', label: 'Mashqalalar', rgb: [244, 114, 160], Icon: TriangleAlert },
];
const LOW: [number, number, number] = [38, 44, 78];
const mix = (t: number, hi: [number, number, number]) => `rgb(${LOW.map((l, i) => Math.round(l + (hi[i] - l) * t)).join(',')})`;

const CENTER: LngLat = [59.1432, 42.6312];
const TILT = 58;
const BEARING = -24;
const MAX_H = 1100; // metr

/* ───────── doimiy xarita: sahifalar almashganda qayta yaratilmaydi ───────── */
interface Hooks {
  setCursor: (v: LngLat | null) => void;
  setHover: (v: string | null) => void;
  toggleSelected: (id: string) => void;
  stopOrbit: () => void;
  setView: (v: { zoom: number; pitch: number }) => void;
  setIs3d: (v: boolean) => void;
  compass: HTMLElement | null;
}
interface Persist {
  map: GLMap;
  host: HTMLDivElement;
  gl: typeof import('maplibre-gl');
  markers: Marker[];
  fitted: boolean;
  hooks: Hooks | null;
}
let persist: Persist | null = null;
let pending: Promise<Persist> | null = null;

function acquireMap(): Promise<Persist> {
  if (persist) return Promise.resolve(persist);
  pending ??= (async () => {
    const gl = await import('maplibre-gl');
    // webpack/Turbopack worker faylini topa olmaydi — public/maplibre dan beriladi (npm yangilanganda qayta nusxalang)
    gl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
    const map = new gl.Map({
      container: host,
      style: mapStyle(),
      center: CENTER,
      zoom: 11.6,
      pitch: TILT,
      bearing: BEARING,
      maxPitch: 80,
      minZoom: 9,
      maxZoom: 18,
      attributionControl: false,
      canvasContextAttributes: { antialias: true },
    });
    map.addControl(new gl.AttributionControl({ compact: true }), 'bottom-left');
    map.addControl(new gl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    await new Promise<void>((resolve) => map.once('load', () => resolve()));

    const P: Persist = { map, host, gl, markers: [], fitted: false, hooks: null };
    const empty = { type: 'FeatureCollection' as const, features: [] };
    ['mask', 'wall', 'mfy', 'district', 'links'].forEach((id) => map.addSource(id, { type: 'geojson', data: empty }));
    map.addLayer({ id: 'outside-mask', type: 'fill', source: 'mask', paint: { 'fill-color': '#05070c', 'fill-opacity': 0.88 } });
    map.addLayer({ id: 'district-glow', type: 'line', source: 'district', paint: { 'line-color': '#9d7bff', 'line-width': 26, 'line-blur': 16, 'line-opacity': 0.75 } });
    map.addLayer({ id: 'district-wall', type: 'fill-extrusion', source: 'wall', paint: { 'fill-extrusion-color': '#b79cff', 'fill-extrusion-height': 420, 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.55, 'fill-extrusion-vertical-gradient': true } });
    map.addLayer({ id: 'district-line', type: 'line', source: 'district', paint: { 'line-color': '#ffffff', 'line-width': 3.2 } });
    map.addLayer({
      id: 'mfy-ext', type: 'fill-extrusion', source: 'mfy',
      paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['get', 'h'], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': ['get', 'op'], 'fill-extrusion-vertical-gradient': true },
    });
    map.addLayer({ id: 'mfy-edge', type: 'line', source: 'mfy', paint: { 'line-color': ['get', 'edge'], 'line-width': ['get', 'ew'], 'line-opacity': 0.9 } });
    // Chegara hamma narsaning ustida: qora hoshiya + yorqin chiziq (ustunlar yopib qo‘ymasin)
    map.addLayer({ id: 'district-case', type: 'line', source: 'district', layout: { 'line-join': 'round' }, paint: { 'line-color': '#0b0f17', 'line-width': 8, 'line-opacity': 0.6 } });
    map.addLayer({ id: 'district-top', type: 'line', source: 'district', layout: { 'line-join': 'round' }, paint: { 'line-color': '#ffd23f', 'line-width': 4 } });
    map.addLayer({ id: 'links', type: 'line', source: 'links', paint: { 'line-color': '#ff6b7d', 'line-width': 1.4, 'line-dasharray': [2, 3] } });

    map.on('mousemove', (e) => P.hooks?.setCursor([e.lngLat.lng, e.lngLat.lat]));
    map.on('mouseout', () => P.hooks?.setCursor(null));
    map.on('mousemove', 'mfy-ext', (e) => {
      map.getCanvas().style.cursor = 'pointer';
      P.hooks?.setHover((e.features?.[0]?.properties?.id as string) ?? null);
    });
    map.on('mouseleave', 'mfy-ext', () => { map.getCanvas().style.cursor = ''; P.hooks?.setHover(null); });
    map.on('click', 'mfy-ext', (e) => {
      const id = e.features?.[0]?.properties?.id as string | undefined;
      if (id) P.hooks?.toggleSelected(id);
    });
    const stop = () => P.hooks?.stopOrbit();
    map.on('mousedown', stop);
    map.on('wheel', stop);
    map.on('touchstart', stop);
    map.on('rotate', () => { if (P.hooks?.compass) P.hooks.compass.style.transform = `rotate(${-map.getBearing()}deg)`; });
    map.on('moveend', () => { P.hooks?.setView({ zoom: map.getZoom(), pitch: map.getPitch() }); P.hooks?.setIs3d(map.getPitch() > 8); });
    persist = P;
    return P;
  })();
  return pending;
}

/** Tile keshi (service worker): bir marta yuklangan xarita bo‘laklari qayta tarmoqdan olinmaydi. */
function registerTileCache() {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}

export const DistrictMap: React.FC = () => {
  const { objects, mfys, issues, openObjectPassport } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GLMap | null>(null);
  const glRef = useRef<typeof import('maplibre-gl') | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const compassRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [base, setBase] = useState<BaseId>('hybrid');
  const [baseOpen, setBaseOpen] = useState(false);
  const [metric, setMetric] = useState<Metric>('population');
  const [query, setQuery] = useState('');
  const [selectedMfy, setSelectedMfy] = useState<string | null>(null);
  const [hoverMfy, setHoverMfy] = useState<string | null>(null);
  const [visible, setVisible] = useState<Record<ObjectType, boolean>>({ enterprise: true, investment_project: true, industrial_zone: true, infrastructure: true, social: true });
  const [showMfy, setShowMfy] = useState(true);
  const [showIssues, setShowIssues] = useState(true);
  const [is3d, setIs3d] = useState(true);
  const [orbit, setOrbit] = useState(false);
  const [cursor, setCursor] = useState<LngLat | null>(null);
  const [view, setView] = useState({ zoom: 11.6, pitch: TILT });
  const [fullscreen, setFullscreen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const onPassport = useRef(openObjectPassport);
  useEffect(() => { onPassport.current = openObjectPassport; }, [openObjectPassport]);

  const dark = BASES[base].dark;
  const panel = dark ? 'gm-glass' : 'gm-glass gm-glass-light';

  const territories = useMemo(
    () => buildTerritories(
      mfys.map((m) => ({ id: m.id, center: [m.centerCoords[1], m.centerCoords[0]] as LngLat })),
      [...mfys.flatMap((m) => m.polygon.map((p): LngLat => [p[1], p[0]])), ...objects.map((o): LngLat => [o.coords[1], o.coords[0]])],
      0.035,
      SHOMANAY_BOUNDARY,
    ),
    [mfys, objects],
  );

  const statOf = useCallback((id: string, m: Metric) => {
    const x = mfys.find((v) => v.id === id);
    if (!x) return 0;
    return m === 'population' ? x.population : m === 'projects' ? x.activeProjectsCount : x.openIssuesCount;
  }, [mfys]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return objects.filter((o) => visible[o.type] && (!selectedMfy || o.mfyId === selectedMfy) && (!q || o.name.toLowerCase().includes(q) || o.address.toLowerCase().includes(q)));
  }, [objects, visible, selectedMfy, query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return objects.filter((o) => o.name.toLowerCase().includes(q) || o.address.toLowerCase().includes(q)).slice(0, 6);
  }, [objects, query]);

  const ranking = useMemo(
    () => [...mfys].sort((a, b) => statOf(b.id, metric) - statOf(a.id, metric)).slice(0, 3),
    [mfys, metric, statOf],
  );

  /* ───── to‘liq ekran, Esc, o‘lcham o‘zgarishi ───── */
  useEffect(() => {
    const onFs = () => { setFullscreen(document.fullscreenElement === rootRef.current); mapRef.current?.resize(); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || (e.target as HTMLElement | null)?.tagName === 'INPUT') return;
      setSelectedMfy(null);
      setBaseOpen(false);
    };
    document.addEventListener('fullscreenchange', onFs);
    window.addEventListener('keydown', onKey);
    const ro = new ResizeObserver(() => mapRef.current?.resize());
    if (rootRef.current) ro.observe(rootRef.current);
    return () => { document.removeEventListener('fullscreenchange', onFs); window.removeEventListener('keydown', onKey); ro.disconnect(); };
  }, []);

  /* ───── ulash: xarita bir marta yaratiladi, keyin faqat qayta ulanadi ───── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;
    registerTileCache();
    acquireMap().then((p) => {
      if (cancelled) return;
      glRef.current = p.gl;
      mapRef.current = p.map;
      markersRef.current = p.markers;
      p.hooks = {
        setCursor,
        setHover: setHoverMfy,
        toggleSelected: (id) => setSelectedMfy((cur) => (cur === id ? null : id)),
        stopOrbit: () => { if (orbitRef.current) { orbitRef.current = false; setOrbit(false); } },
        setView,
        setIs3d,
        compass: compassRef.current,
      };
      el.appendChild(p.host);
      p.map.resize();
      if (compassRef.current) compassRef.current.style.transform = `rotate(${-p.map.getBearing()}deg)`;
      setView({ zoom: p.map.getZoom(), pitch: p.map.getPitch() });
      setIs3d(p.map.getPitch() > 8);
      setReady(true);
    });
    return () => {
      cancelled = true;
      orbitRef.current = false;
      if (persist) {
        persist.hooks = null;
        persist.markers.forEach((m) => m.getPopup()?.remove());
        persist.host.remove(); // xarita yo‘q qilinmaydi — keyingi safar shu zahoti qaytadi
      }
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  /* ───── chegara: faqat Shomanay ko‘rinadi ───── */
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !persist || !territories.boundary.length) return;
    const box = bboxOf(territories.boundary);
    const dx = (box[1][0] - box[0][0]) * 0.18;
    const dy = (box[1][1] - box[0][1]) * 0.18;
    map.setMaxBounds([[box[0][0] - dx, box[0][1] - dy], [box[1][0] + dx, box[1][1] + dy]]);
    if (!persist.fitted) {
      map.fitBounds(box, { padding: 70, pitch: TILT, bearing: BEARING, duration: 0 });
      persist.fitted = true;
    }
  }, [ready, territories]);

  /* ───── asos qatlam ───── */
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const on = new Set(BASES[base].layers);
    Object.keys(RASTERS).forEach((k) => map.setLayoutProperty(`base-${k}`, 'visibility', on.has(k) ? 'visible' : 'none'));
    map.setPaintProperty('bg', 'background-color', BASES[base].dark ? '#0b0f17' : '#dfe6ea');
    map.setPaintProperty('district-line', 'line-color', BASES[base].dark ? '#e4dbff' : '#5b3fd0');
    map.setPaintProperty('outside-mask', 'fill-color', BASES[base].dark ? '#05070c' : '#c9d3d9');
    map.setPaintProperty('outside-mask', 'fill-opacity', BASES[base].dark ? 0.88 : 0.8);
  }, [ready, base]);

  /* ───── MFY ustunlari (3D) ───── */
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const meta = METRICS.find((m) => m.id === metric)!;
    const vals = mfys.map((m) => statOf(m.id, metric));
    const vmax = Math.max(...vals, 1);
    const features = showMfy
      ? mfys.filter((m) => territories.cells[m.id]).map((m) => {
          const t = statOf(m.id, metric) / vmax;
          const active = selectedMfy === m.id;
          const hov = hoverMfy === m.id;
          const dim = !!selectedMfy && !active;
          return {
            type: 'Feature' as const,
            properties: {
              id: m.id,
              color: mix(0.25 + t * 0.75, meta.rgb),
              h: is3d ? Math.round((0.12 + t * 0.88) * MAX_H * (active ? 1.15 : hov ? 1.08 : 1)) : 0,
              op: dim ? 0.28 : active || hov ? 0.9 : 0.72,
              edge: active ? '#ffffff' : hov ? '#f4efff' : 'rgba(255,255,255,.55)',
              ew: active ? 3 : hov ? 2.2 : 1.1,
            },
            geometry: { type: 'Polygon' as const, coordinates: [territories.cells[m.id]] },
          };
        })
      : [];
    (map.getSource('mfy') as GeoJSONSource).setData({ type: 'FeatureCollection', features });
    (map.getSource('district') as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: territories.boundary.length ? [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: territories.boundary } }] : [],
    });
    (map.getSource('mask') as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: territories.boundary.length
        ? [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: outsideMask(territories.boundary) } }]
        : [],
    });
    (map.getSource('wall') as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: territories.boundary.length
        ? [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: borderRing(territories.boundary) } }]
        : [],
    });
  }, [ready, mfys, territories, metric, showMfy, selectedMfy, hoverMfy, is3d, statOf]);

  /* ───── pinlar, belgilar, mashqala chiziqlari ───── */
  useEffect(() => {
    const map = mapRef.current;
    const gl = glRef.current;
    if (!ready || !map || !gl) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.length = 0;
    const add = (el: HTMLElement, lngLat: LngLat, anchor: 'bottom' | 'center', popup?: import('maplibre-gl').Popup) => {
      const mk = new gl.Marker({ element: el, anchor }).setLngLat(lngLat);
      if (popup) mk.setPopup(popup);
      mk.addTo(map);
      markersRef.current.push(mk);
    };

    if (territories.boundary.length) {
      const box = bboxOf(territories.boundary);
      const el = document.createElement('div');
      el.className = 'gm3-district';
      el.innerHTML = '<b>SHOMANAY</b><small>RAYONI</small>';
      add(el, [(box[0][0] + box[1][0]) / 2, box[1][1]], 'bottom');
    }

    if (showMfy && view.zoom >= 10.5) {
      mfys.forEach((m) => {
        if (!territories.cells[m.id]) return;
        const el = document.createElement('div');
        el.className = 'gm3-label';
        el.innerHTML = `<span>${escapeHtml(m.name)}</span><small>${statOf(m.id, metric).toLocaleString('ru-RU')}</small>`;
        add(el, [m.centerCoords[1], m.centerCoords[0]], 'center');
      });
    }

    filtered.forEach((obj: DistrictObject) => {
      const meta = TYPE_META[obj.type];
      const risk = obj.status === 'risk';
      const el = document.createElement('div');
      el.className = `gm3-pin${risk ? ' risk' : ''}`;
      el.style.setProperty('--c', risk ? '#ff6b7d' : meta.color);
      el.innerHTML = `<u></u><s></s><b><svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${meta.path}</svg></b><em>${escapeHtml(obj.name)}</em>`;
      const pop = new gl.Popup({ offset: [0, -52], closeButton: false, className: 'gm-popup', maxWidth: '280px' });
      const box = document.createElement('div');
      box.className = 'gm-pop';
      box.innerHTML = `
        <div class="gm-pop-tag" style="--c:${meta.color}">${escapeHtml(meta.label)} · ${escapeHtml(obj.id)}</div>
        <h4>${escapeHtml(obj.name)}</h4>
        <p>${escapeHtml(obj.address)}</p>
        <small>Mas’ul: <b>${escapeHtml(obj.responsibleOrg)}</b></small>
        <button type="button">Obyekt pasporti →</button>`;
      box.querySelector('button')!.addEventListener('click', () => onPassport.current(obj));
      pop.setDOMContent(box);
      add(el, [obj.coords[1], obj.coords[0]], 'bottom', pop);
    });

    const links: GeoJSON.Feature[] = [];
    if (showIssues) {
      issues.forEach((iss) => {
        if (iss.status === 'resolved' || iss.status === 'closed') return;
        const o = objects.find((x) => x.id === iss.objectId);
        if (!o || (selectedMfy && o.mfyId !== selectedMfy)) return;
        const from: LngLat = [o.coords[1], o.coords[0]];
        const to: LngLat = [from[0] + 0.0042, from[1] + 0.0026];
        links.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [from, to] } });
        const el = document.createElement('div');
        el.className = 'gm-alert';
        el.title = `${iss.code} · ${iss.title}`;
        el.innerHTML = '<span></span><b>!</b>';
        add(el, to, 'center');
      });
    }
    (map.getSource('links') as GeoJSONSource).setData({ type: 'FeatureCollection', features: links });
  }, [ready, filtered, issues, objects, mfys, territories, showIssues, showMfy, selectedMfy, metric, statOf, view.zoom >= 10.5]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ───── tanlangan MFYga uchib borish ───── */
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !selectedMfy) return;
    const ring = territories.cells[selectedMfy];
    if (!ring) return;
    map.fitBounds(bboxOf(ring), { padding: { top: 90, bottom: 90, left: 270, right: 360 }, pitch: Math.max(map.getPitch(), 50), bearing: map.getBearing(), duration: 1500, maxZoom: 14.8 });
  }, [ready, selectedMfy, territories]);

  /* ───── aylanma kamera ───── */
  useEffect(() => {
    orbitRef.current = orbit;
    const map = mapRef.current;
    if (!orbit || !map) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      if (!orbitRef.current) return;
      map.setBearing(map.getBearing() + (now - last) * 0.006);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [orbit, ready]);

  const fitAll = () => {
    const map = mapRef.current;
    if (!map || !territories.boundary.length) return;
    setSelectedMfy(null);
    map.fitBounds(bboxOf(territories.boundary), { padding: 80, pitch: TILT, bearing: BEARING, duration: 1500 });
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen?.().catch(() => {});
  };
  const flyToObject = (o: DistrictObject) => {
    setSearchOpen(false);
    mapRef.current?.flyTo({ center: [o.coords[1], o.coords[0]], zoom: 16.2, pitch: 62, duration: 1600 });
    onPassport.current(o);
  };
  const toggle3d = () => mapRef.current?.easeTo({ pitch: is3d ? 0 : TILT, duration: 900 });

  const selected = mfys.find((m) => m.id === selectedMfy) ?? null;
  const selectedObjects = selected ? objects.filter((o) => o.mfyId === selected.id) : [];
  const metricMeta = METRICS.find((m) => m.id === metric)!;
  const [r, g, b] = metricMeta.rgb;
  const riskCount = filtered.filter((o) => o.status === 'risk').length;
  const ctrlRight = selected ? { right: 'calc(min(320px, 100% - 2rem) + 2rem)' } : undefined;

  return (
    <div ref={rootRef} className={`gm-root gm3 relative w-full overflow-hidden ${fullscreen ? 'h-screen' : 'h-[calc(100dvh-170px)] min-h-[600px] rounded-3xl'} border border-white/10 shadow-2xl bg-[#0b0f17]`}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      {!ready && <div className="absolute inset-0 grid place-items-center text-sm text-slate-400">3D karta júklenbekte…</div>}
      <div className="gm-vignette pointer-events-none absolute inset-0" />

      {/* yuqori chap */}
      <div className="absolute left-4 top-4 z-[800] flex w-[min(360px,calc(100%-2rem))] flex-col gap-3">
        <div className="relative">
          <div className={`${panel} flex items-center gap-2 rounded-2xl px-3.5 py-2.5`}>
            <Search className="h-4 w-4 opacity-60" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} placeholder="Obyekt yoki manzil izlew…" className="w-full bg-transparent text-sm outline-none placeholder:opacity-50" />
            {query && <button onClick={() => { setQuery(''); setSearchOpen(false); }} aria-label="Tazalaw"><X className="h-4 w-4 opacity-60" /></button>}
          </div>
          {searchOpen && results.length > 0 && (
            <div className={`${panel} absolute left-0 right-0 top-full z-10 mt-1.5 space-y-0.5 rounded-2xl p-1.5`}>
              {results.map((o) => {
                const m = TYPE_META[o.type];
                return (
                  <button key={o.id} onClick={() => flyToObject(o)} className="gm-row">
                    <span className="gm-dot" style={{ background: o.status === 'risk' ? '#ff6b7d' : m.color }}><m.Icon className="h-3 w-3 text-white" /></span>
                    <span className="min-w-0 flex-1 text-left"><span className="block truncate text-xs">{o.name}</span><span className="block truncate text-[10px] opacity-60">{o.address}</span></span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className={`${panel} flex gap-1 rounded-2xl p-1.5`}>
          {METRICS.map((m) => (
            <button key={m.id} onClick={() => setMetric(m.id)} className={`gm-chip ${metric === m.id ? 'on' : ''}`} style={{ '--c': `rgb(${m.rgb.join(',')})` } as React.CSSProperties}>
              <m.Icon className="h-3.5 w-3.5" />{m.label}
            </button>
          ))}
        </div>
        <div className={`${panel} rounded-2xl px-4 py-3`}>
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider opacity-60">
            <span>Ustun balandligi: {metricMeta.label}</span>
            <button onClick={() => setShowMfy((v) => !v)} className="normal-case underline-offset-2 hover:underline">{showMfy ? 'Jasırıw' : 'Kórsetiw'}</button>
          </div>
          <div className="h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${mix(0.25, metricMeta.rgb)}, rgb(${r},${g},${b}))` }} />
          <div className="mt-1 flex justify-between text-[10px] opacity-60"><span>kem</span><span>kóp</span></div>
          <div className="mt-2.5 space-y-0.5 border-t border-white/10 pt-2">
            {ranking.map((m, i) => (
              <button key={m.id} onClick={() => setSelectedMfy(m.id)} onMouseEnter={() => setHoverMfy(m.id)} onMouseLeave={() => setHoverMfy(null)} className="gm-row">
                <span className="w-4 text-[10px] font-bold opacity-60">{i + 1}</span>
                <span className="flex-1 truncate text-left text-xs">{m.name}</span>
                <span className="text-xs font-semibold tabular-nums">{statOf(m.id, metric).toLocaleString('ru-RU')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* yuqori o'ng: asos */}
      <div className="absolute right-4 top-4 z-[800] flex flex-col items-end gap-2">
        <button onClick={() => setBaseOpen((v) => !v)} className={`${panel} flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-medium`}>
          <Layers className="h-4 w-4" />{BASES[base].label}
        </button>
        {baseOpen && (
          <div className={`${panel} grid grid-cols-5 gap-2 rounded-2xl p-2.5`}>
            {(Object.keys(BASES) as BaseId[]).map((id) => (
              <button key={id} onClick={() => { setBase(id); setBaseOpen(false); }} className={`gm-base ${base === id ? 'on' : ''}`}>
                <span style={{ background: BASES[id].swatch }} />
                <em>{BASES[id].label}</em>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* chap past: qatlamlar */}
      <div className={`${panel} absolute bottom-10 left-4 z-[800] w-[220px] rounded-2xl p-3`}>
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider opacity-60">
          <span>Qatlamlar</span><span>{filtered.length} ta{riskCount ? ` · ${riskCount} xavf` : ''}</span>
        </div>
        <div className="space-y-0.5">
          {TYPES.map((t) => {
            const m = TYPE_META[t];
            const n = objects.filter((o) => o.type === t && (!selectedMfy || o.mfyId === selectedMfy)).length;
            return (
              <button key={t} onClick={() => setVisible((v) => ({ ...v, [t]: !v[t] }))} className={`gm-layer ${visible[t] ? '' : 'off'}`}>
                <span className="gm-dot" style={{ background: m.color }}><m.Icon className="h-3 w-3 text-white" /></span>
                <span className="flex-1 text-left">{m.label}</span><span className="opacity-60">{n}</span>
              </button>
            );
          })}
          <button onClick={() => setShowIssues((v) => !v)} className={`gm-layer ${showIssues ? '' : 'off'}`}>
            <span className="gm-dot" style={{ background: '#ff6b7d' }}><TriangleAlert className="h-3 w-3 text-white" /></span>
            <span className="flex-1 text-left">Mashqalalar</span>
          </button>
        </div>
      </div>

      {/* o'ng: tanlangan MFY */}
      {selected && (
        <aside className={`${panel} gm-slide absolute bottom-10 right-4 top-[72px] z-[800] flex w-[min(320px,calc(100%-2rem))] flex-col rounded-2xl p-4`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[11px] font-mono opacity-60">{selected.code}</div>
              <h3 className="text-lg font-semibold leading-tight">{selected.name}</h3>
            </div>
            <button onClick={() => setSelectedMfy(null)} aria-label="Jabıw"><X className="h-4 w-4 opacity-70" /></button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[['Aholi', selected.population.toLocaleString('ru-RU')], ['Joybar', selected.activeProjectsCount], ['Mashqala', selected.openIssuesCount]].map(([k, v]) => (
              <div key={k as string} className="rounded-xl bg-white/[.07] px-2 py-2"><div className="text-base font-semibold">{v}</div><div className="text-[10px] uppercase opacity-60">{k}</div></div>
            ))}
          </div>
          <p className="mt-3 text-xs opacity-70">Baslıq: <b>{selected.leaderName}</b> · {selected.phone} · {selected.areaSqKm} km²</p>
          <div className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wider opacity-60">Obyektler ({selectedObjects.length})</div>
          <div className="-mr-1 flex-1 space-y-1 overflow-y-auto pr-1">
            {selectedObjects.map((o) => {
              const m = TYPE_META[o.type];
              return (
                <button key={o.id} onClick={() => flyToObject(o)} className="gm-row">
                  <span className="gm-dot" style={{ background: o.status === 'risk' ? '#ff6b7d' : m.color }}><m.Icon className="h-3 w-3 text-white" /></span>
                  <span className="flex-1 truncate text-left text-xs">{o.name}</span>
                </button>
              );
            })}
            {!selectedObjects.length && <div className="text-xs opacity-50">Obyekt joq</div>}
          </div>
        </aside>
      )}

      {/* koordinata */}
      <div className="absolute bottom-3 left-1/2 z-[800] hidden -translate-x-1/2 md:block">
        <div className={`${panel} rounded-full px-3 py-1 font-mono text-[11px]`}>
          {cursor ? `${cursor[1].toFixed(5)}°N  ${cursor[0].toFixed(5)}°E` : 'WGS 84'} · z{view.zoom.toFixed(1)} · {Math.round(view.pitch)}°
        </div>
      </div>

      {/* boshqaruv */}
      <div className="absolute bottom-10 right-4 z-[800] flex flex-col gap-2" style={ctrlRight}>
        <button onClick={toggleFullscreen} title={fullscreen ? 'Ekrandan chiǵıw' : 'Tolıq ekran'} className={`${panel} grid h-10 w-10 place-items-center rounded-xl`}>{fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
        <button onClick={toggle3d} title={is3d ? '2D ko‘rinish' : '3D ko‘rinish'} className={`${panel} grid h-10 w-10 place-items-center rounded-xl text-[11px] font-bold ${is3d ? 'ring-1 ring-violet-400/70' : ''}`}><Box className="h-4 w-4" /></button>
        <button onClick={() => setOrbit((v) => !v)} title="Aylanma kamera" className={`${panel} grid h-10 w-10 place-items-center rounded-xl ${orbit ? 'ring-1 ring-violet-400/70' : ''}`}><Orbit className="h-4 w-4" /></button>
        <button onClick={() => mapRef.current?.easeTo({ bearing: 0, duration: 700 })} title="Shımalǵa" className={`${panel} grid h-10 w-10 place-items-center rounded-xl`}><span ref={compassRef} style={{ display: 'grid', transform: `rotate(${-BEARING}deg)` }}><Compass className="h-4 w-4" /></span></button>
        <button onClick={fitAll} title="Pútkil rayon" className={`${panel} grid h-10 w-10 place-items-center rounded-xl`}><Crosshair className="h-4 w-4" /></button>
        <div className={`${panel} flex flex-col overflow-hidden rounded-xl`}>
          <button onClick={() => mapRef.current?.zoomIn({ duration: 350 })} className="grid h-10 w-10 place-items-center hover:bg-white/10" aria-label="Zoom in"><Plus className="h-4 w-4" /></button>
          <button onClick={() => mapRef.current?.zoomOut({ duration: 350 })} className="grid h-10 w-10 place-items-center border-t border-white/10 hover:bg-white/10" aria-label="Zoom out"><Minus className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
};
