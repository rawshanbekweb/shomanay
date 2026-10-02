'use client';
import { useState } from 'react';
import { Download, Search, Upload } from 'lucide-react';
import { apiRequest, useApp } from '@/context/AppContext';
import { downloadCsv, parseCsv } from '@/lib/csv';
export default function AdminPage() {
  const { auditLogs, currentUser, refreshData, t, mfys } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [search, setSearch] = useState('');
  const canImport = ['admin', 'statistician'].includes(currentUser.role);
  const canAudit = ['admin', 'statistician', 'hokim'].includes(currentUser.role);
  const importFile = async () => {
    if (!file || busy) return;
    setBusy(true); setResult('');
    try {
      if (file.size > 90000) throw new Error('Fayl 90 KB dan kichik bo‘lishi kerak.');
      const rows = parseCsv(await file.text());
      const data = await apiRequest<{ imported: number }>('import', { method: 'POST', body: JSON.stringify(rows) });
      setResult(`${data.imported} ta obyekt bazaga saqlandi.`);
      await refreshData();
    } catch (error) { setResult(error instanceof Error ? error.message : 'Import bajarilmadi.'); }
    finally { setBusy(false); }
  };
  const logs = auditLogs.filter(log => `${log.userName} ${log.entityName} ${log.action}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="sc-stack">
    <div className="sc-page-title">
      <div className="sc-eyebrow"><i /> {t.navAdmin}</div>
      <h1>{t.pageAdminTitle}</h1>
      <p>{t.pageAdminSubtitle}</p>
    </div>

    {canImport && <section className="sc-panel">
      <div className="sc-panel-heading">
        <div>
          <div className="sc-eyebrow"><i /> CSV</div>
          <h2>Obyektlarni CSV orqali yuklash</h2>
        </div>
        <button className="sc-button" onClick={() => downloadCsv('obyektlar_namuna.csv', [
          ['id', 'name', 'mfyId', 'type', 'address', 'coordsLat', 'coordsLng', 'responsibleOrg'],
          ['obj-yangi', 'Yangi obyekt', mfys[0]?.id || 'mfy-1', 'enterprise', 'Manzil', 42.63, 59.14, 'Tashkilot nomi'],
        ])}><Download size={15} /> CSV namunasini yuklab olish</button>
      </div>
      <p className="sc-muted" style={{ marginBottom: 18 }}>UTF-8 CSV, 90 KB gacha, 500 qatorgacha. Mavjud ID yangilanadi. MFY bazada bo‘lishi kerak. Excel faylini avval CSV formatida saqlang.</p>
      <div className="sc-actions">
        <input aria-label="CSV fayl" type="file" accept=".csv,text/csv" disabled={busy} onChange={e => setFile(e.target.files?.[0] || null)} className="sc-input" style={{ maxWidth: 420 }} />
        <button className="sc-button sc-primary" disabled={!file || busy} onClick={() => void importFile()}><Upload size={15} /> {busy ? 'Yuklanmoqda…' : 'Bazaga yuklash'}</button>
      </div>
      {result && <p role="status" className="sc-muted" style={{ marginTop: 16 }}>{result}</p>}
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
