'use client';
import { useState } from 'react';
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
  return <div className="space-y-8">
    <h1 className="text-3xl font-bold">{t.pageAdminTitle}</h1>
    {canImport && <section className="p-6 bg-slate-900 rounded-2xl border border-slate-700 space-y-4">
      <h2 className="text-xl font-bold">Obyektlarni CSV orqali yuklash</h2>
      <p>UTF-8 CSV, 90 KB gacha, 500 qatorgacha. Mavjud ID yangilanadi. MFY bazada bo‘lishi kerak. Excel faylini avval CSV formatida saqlang.</p>
      <button className="underline" onClick={() => downloadCsv('obyektlar_namuna.csv', [
        ['id', 'name', 'mfyId', 'type', 'address', 'coordsLat', 'coordsLng', 'responsibleOrg'],
        ['obj-yangi', 'Yangi obyekt', mfys[0]?.id || 'mfy-1', 'enterprise', 'Manzil', 42.63, 59.14, 'Tashkilot nomi'],
      ])}>CSV namunasini yuklab olish</button>
      <input aria-label="CSV fayl" type="file" accept=".csv,text/csv" disabled={busy} onChange={e => setFile(e.target.files?.[0] || null)} className="block" />
      <button className="bg-blue-700 px-4 py-2 rounded-xl disabled:opacity-50" disabled={!file || busy} onClick={() => void importFile()}>{busy ? 'Yuklanmoqda…' : 'Bazaga yuklash'}</button>
      {result && <p role="status">{result}</p>}
    </section>}
    {canAudit ? <section className="space-y-4">
      <h2 className="text-xl font-bold">{t.auditTitle} — oxirgi 200 amal</h2>
      <input aria-label="Audit qidiruvi" value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish" className="bg-slate-900 border border-slate-600 p-3 rounded-xl" />
      <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr><th>Vaqt</th><th>Foydalanuvchi</th><th>Amal</th><th>Obyekt</th></tr></thead>
        <tbody>{logs.map(log => <tr key={log.id} className="border-t border-slate-700"><td className="py-3">{log.timestamp}</td><td>{log.userName} ({log.userRole})</td><td>{log.action}</td><td>{log.entityName}</td></tr>)}</tbody>
      </table></div>{!logs.length && <p>Audit yozuvlari yo‘q.</p>}
    </section> : <p>Bu bo‘lim uchun ruxsat yo‘q.</p>}
  </div>;
}
