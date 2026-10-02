'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { NewObject } from '@/context/AppContext';
import type { DistrictObject } from '@/types';

const TYPES: { value: DistrictObject['type']; label: string }[] = [
  { value: 'enterprise', label: 'Kárxana' },
  { value: 'investment_project', label: 'Investiciya joybarı' },
  { value: 'industrial_zone', label: 'Sanaat zonası' },
  { value: 'infrastructure', label: 'Infratuzilma' },
  { value: 'social', label: 'Sociallıq obyekt' },
];
const STATUSES: { value: DistrictObject['status']; label: string }[] = [
  { value: 'active', label: 'Isleydi' },
  { value: 'in_progress', label: 'Qurılıp atır' },
  { value: 'planned', label: 'Rejelestirilgen' },
  { value: 'paused', label: 'Toqtatılǵan' },
  { value: 'risk', label: 'Táwekel' },
];

export const ObjectFormModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { mfys, createObject, isSaving } = useApp();
  const first = mfys[0];
  const [form, setForm] = useState({
    name: '', type: 'enterprise' as NewObject['type'], mfyId: first?.id ?? '', address: '',
    lat: String(first?.centerCoords[0] ?? ''), lng: String(first?.centerCoords[1] ?? ''),
    responsibleOrg: '', curator: '', status: 'planned' as NewObject['status'], description: '',
  });
  const [error, setError] = useState('');
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickMfy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = mfys.find((x) => x.id === e.target.value);
    setForm((f) => ({ ...f, mfyId: e.target.value, lat: String(m?.centerCoords[0] ?? f.lat), lng: String(m?.centerCoords[1] ?? f.lng) }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) { setError('Koordinatalar san bolıwı kerek.'); return; }
    const result = await createObject({ ...form, lat, lng, description: form.description || undefined });
    if (result.success) onClose(); else setError(result.message);
  }

  return (
    <div className="fm-overlay" role="dialog" aria-modal="true" aria-label="Jańa obyekt" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="fm-card" onSubmit={submit}>
        <header>
          <div>
            <div className="sc-eyebrow"><i /> Reestr</div>
            <h2>Jańa obyekt qosıw</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Jabıw" className="an-icon-button"><X size={16} /></button>
        </header>

        <div className="fm-grid">
          <label className="fm-wide">Atı<input required maxLength={200} value={form.name} onChange={set('name')} autoFocus /></label>
          <label>Túri<select value={form.type} onChange={set('type')}>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
          <label>MPJ<select value={form.mfyId} onChange={pickMfy}>{mfys.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          <label className="fm-wide">Mánzil<input required maxLength={300} value={form.address} onChange={set('address')} /></label>
          <label>Keńlik (lat)<input required inputMode="decimal" value={form.lat} onChange={set('lat')} /></label>
          <label>Uzınlıq (lng)<input required inputMode="decimal" value={form.lng} onChange={set('lng')} /></label>
          <label>Juwapker shólkem<input required maxLength={200} value={form.responsibleOrg} onChange={set('responsibleOrg')} /></label>
          <label>Kurator<input required maxLength={200} value={form.curator} onChange={set('curator')} /></label>
          <label>Jaǵdayı<select value={form.status} onChange={set('status')}>{STATUSES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
          <label className="fm-wide">Sıpatlama<textarea rows={3} maxLength={2000} value={form.description} onChange={set('description')} /></label>
        </div>

        {error && <div role="alert" className="sc-error">{error}</div>}
        <footer>
          <button type="button" className="sc-button" onClick={onClose}>Biykarlaw</button>
          <button type="submit" className="sc-button sc-primary" disabled={isSaving}>{isSaving ? 'Saqlanbaqta…' : 'Saqlaw'}</button>
        </footer>
      </form>
    </div>
  );
};
