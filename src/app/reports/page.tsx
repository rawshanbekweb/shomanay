'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { downloadCsv } from '@/lib/csv';
import { reportRows } from '@/lib/reports';
export default function ReportsPage() {
  const { tasks, issues, investments, mfys, t, isLoading } = useApp();
  const [type, setType] = useState('tasks');
  const [mfy, setMfy] = useState('all');
  const [headers, ...rows] = reportRows(type, mfy, { tasks, issues, investments });
  return <div className="space-y-6">
    <h1 className="text-3xl font-bold">{t.pageReportsTitle}</h1>
    <div className="flex gap-4 flex-wrap print:hidden">
      <select aria-label="Hisobot turi" value={type} onChange={e => setType(e.target.value)} className="bg-slate-900 border border-slate-600 p-3 rounded-xl">
        <option value="tasks">Topshiriqlar</option><option value="issues">Muammolar</option><option value="investments">Investitsiyalar</option>
      </select>
      <select aria-label="MFY" value={mfy} onChange={e => setMfy(e.target.value)} className="bg-slate-900 border border-slate-600 p-3 rounded-xl">
        <option value="all">Barcha MFYlar</option>{mfys.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <button disabled={isLoading} onClick={() => downloadCsv(`Shomanay_${type}_${mfy}.csv`, [headers, ...rows])} className="bg-blue-700 p-3 rounded-xl">{t.exportCsv}</button>
      <button onClick={() => window.print()} className="border border-slate-600 p-3 rounded-xl">{t.printReport}</button>
    </div>
    <p>{rows.length} ta yozuv · {mfys.find(item => item.id === mfy)?.name || 'Barcha MFYlar'}</p>
    <div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full text-sm text-left">
      <thead className="bg-slate-800"><tr>{headers.map((value, i) => <th className="p-3" key={i}>{String(value)}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr className="border-t border-slate-700" key={i}>{row.map((value, j) => <td className="p-3" key={j}>{String(value ?? '')}</td>)}</tr>)}</tbody>
    </table></div>
    {!rows.length && !isLoading && <p>Tanlangan filtr bo‘yicha yozuv yo‘q.</p>}
  </div>;
}
