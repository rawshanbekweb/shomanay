'use client';
import { useState } from 'react';
import { Database, Download, Search, Upload } from 'lucide-react';
import { PageHero } from '@/components/PageKit';
import { apiRequest, useApp } from '@/context/AppContext';
import { downloadCsv, parseCsv } from '@/lib/csv';
import { INDICATOR_CSV_HEADERS } from '@/lib/indicator-import';
export default function AdminPage() {
  const { auditLogs, currentUser, refreshData, t, mfys } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [kind, setKind] = useState<'objects' | 'indicators'>('objects');
  const [issues, setIssues] = useState<{ row: number; message: string }[]>([]);
  const [search, setSearch] = useState('');
  const canImport = ['admin', 'statistician'].includes(currentUser.role);
  const canAudit = ['admin', 'statistician', 'hokim'].includes(currentUser.role);
  const importFile = async () => {
    if (!file || busy) return;
    setBusy(true); setResult(''); setIssues([]);
    try {
      if (file.size > 90000) throw new Error('Fayl 90 KB dan kichik bo‘lishi kerak.');
      const rows = parseCsv(await file.text());
      if (kind === 'indicators') {
        const data = await apiRequest<{ accepted: number; created: number; updated: number; issues: { row: number; message: string }[] }>('import?kind=indicators', { method: 'POST', body: JSON.stringify(rows) });
        setResult(`${data.accepted} ta qator qabul qilindi: ${data.created} ta yangi, ${data.updated} ta yangilangan ko‘rsatkich.${data.issues.length ? ` ${data.issues.length} ta qatorda xatolik.` : ''}`);
        setIssues(data.issues);
      } else {
        const data = await apiRequest<{ imported: number }>('import', { method: 'POST', body: JSON.stringify(rows) });
        setResult(`${data.imported} ta obyekt bazaga saqlandi.`);
      }
      await refreshData();
    } catch (error) { setResult(error instanceof Error ? error.message : 'Import bajarilmadi.'); }
    finally { setBusy(false); }
  };
  const logs = auditLogs.filter(log => `${log.userName} ${log.entityName} ${log.action}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="sc-stack">
    <PageHero
      icon={Database}
      eyebrow={t.navAdmin}
      title={t.pageAdminTitle}
      subtitle={t.pageAdminSubtitle}
      color="#b88cff"
      tiles={[
        { label: 'Audit jazıwları', value: auditLogs.length, color: '#b88cff' },
        { label: 'MPJlar', value: mfys.length, color: '#2bb5d6' },
        { label: 'Filtrlengen', value: logs.length, color: '#4bd8a6' },
      ]}
    />

    {canImport && <section className="sc-panel">
      <div className="sc-panel-heading">
        <div>
          <div className="sc-eyebrow"><i /> CSV</div>
          <h2>{kind === 'objects' ? 'Obyektlarni CSV orqali yuklash' : 'Ko‘rsatkichlarni CSV orqali yuklash'}</h2>
        </div>
        <div className="sc-actions">
        <select aria-label="Import turi" value={kind} onChange={e => { setKind(e.target.value as 'objects' | 'indicators'); setResult(''); setIssues([]); }} className="sc-input" style={{ width: 'auto' }}>
          <option value="objects">Obyektlar</option><option value="indicators">Statistik ko‘rsatkichlar</option>
        </select>
        {kind === 'indicators' ? <button className="sc-button" onClick={() => downloadCsv('korsatkichlar_namuna.csv', [
          INDICATOR_CSV_HEADERS,
          ['IND-SAN-01', 'industry', 'Sanoat', 'Sanoat ishlab chiqarish hajmi', 'mlrd so‘m', 2026, 368.5, 'Statistika bo‘limi'],
          ['IND-SAN-01', 'industry', 'Sanoat', 'Sanoat ishlab chiqarish hajmi', 'mlrd so‘m', 2025, 324, 'Statistika bo‘limi'],
        ])}><Download size={15} /> CSV namunasini yuklab olish</button> : <button className="sc-button" onClick={() => downloadCsv('obyektlar_namuna.csv', [
          ['id', 'name', 'mfyId', 'type', 'address', 'coordsLat', 'coordsLng', 'responsibleOrg'],
          ['obj-yangi', 'Yangi obyekt', mfys[0]?.id || 'mfy-1', 'enterprise', 'Manzil', 42.63, 59.14, 'Tashkilot nomi'],
        ])}><Download size={15} /> CSV namunasini yuklab olish</button>}
        </div>
      </div>
      <p className="sc-muted" style={{ marginBottom: 18 }}>{kind === 'objects'
        ? 'UTF-8 CSV, 90 KB gacha, 500 qatorgacha. Mavjud ID yangilanadi. MFY bazada bo‘lishi kerak. Excel faylini avval CSV formatida saqlang.'
        : 'Har qator = bitta ko‘rsatkichning bitta yil qiymati (code, sectorKey, sectorName, name, unit, year, value, source). Mavjud code yangilanadi, o‘sish foizi avtomatik hisoblanadi, xato qatorlar protokolda ko‘rsatiladi, har import oldin eski nusxa saqlanadi.'}</p>
      <div className="sc-actions">
        <input aria-label="CSV fayl" type="file" accept=".csv,text/csv" disabled={busy} onChange={e => setFile(e.target.files?.[0] || null)} className="sc-input" style={{ maxWidth: 420 }} />
        <button className="sc-button sc-primary" disabled={!file || busy} onClick={() => void importFile()}><Upload size={15} /> {busy ? 'Yuklanmoqda…' : 'Bazaga yuklash'}</button>
      </div>
      {result && <p role="status" className="sc-muted" style={{ marginTop: 16 }}>{result}</p>}
      {issues.length > 0 && <ul className="sc-error" style={{ marginTop: 12, display: 'grid', gap: 4, listStyle: 'none' }}>
        {issues.slice(0, 20).map(item => <li key={`${item.row}-${item.message}`}>{item.row}-qator: {item.message}</li>)}
        {issues.length > 20 && <li>… yana {issues.length - 20} ta xatolik</li>}
      </ul>}
    </section>}

    {canAudit ? <section className="sc-panel">
      <div className="sc-panel-heading">
        <div>
          <div className="sc-eyebrow"><i /> Audit</div>
          <h2>{t.auditTitle} — oxirgi 200 amal</h2>
        </div>
        <label className="relative block w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d9ab2]" />
          <input aria-label="Audit qidiruvi" value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish" className="sc-input" style={{ paddingLeft: 36 }} />
        </label>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-left text-[13px]">
        <thead><tr className="text-[11px] text-[#8d9ab2]"><th className="p-3 font-normal">Vaqt</th><th className="p-3 font-normal">Foydalanuvchi</th><th className="p-3 font-normal">Amal</th><th className="p-3 font-normal">Obyekt</th></tr></thead>
        <tbody>{logs.map(log => <tr key={log.id} className="border-t border-[#a3b4df1c]"><td className="p-3 tabular-nums">{log.timestamp}</td><td className="p-3">{log.userName} ({log.userRole})</td><td className="p-3">{log.action}</td><td className="p-3">{log.entityName}</td></tr>)}</tbody>
      </table></div>{!logs.length && <p className="sc-muted" style={{ paddingTop: 12 }}>Audit yozuvlari yo‘q.</p>}
    </section> : <p className="sc-muted">Bu bo‘lim uchun ruxsat yo‘q.</p>}
  </div>;
}
