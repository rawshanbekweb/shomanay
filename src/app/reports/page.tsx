'use client';
import { useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHero } from '@/components/PageKit';
import { downloadCsv } from '@/lib/csv';
import { reportRows } from '@/lib/reports';
export default function ReportsPage() {
  const { tasks, issues, investments, mfys, t, isLoading } = useApp();
  const [type, setType] = useState('tasks');
  const [mfy, setMfy] = useState('all');
  const [headers, ...rows] = reportRows(type, mfy, { tasks, issues, investments });
  return <div className="sc-stack">
    <PageHero
      icon={FileText}
      eyebrow={t.navReports}
      title={t.pageReportsTitle}
      subtitle={t.pageReportsSubtitle}
      color="#2bb5d6"
      tiles={[
        { label: 'Tapsırmalar', value: tasks.length, color: '#8b72ff' },
        { label: 'Mashqalalar', value: issues.length, color: '#e0679c' },
        { label: 'Joybarlar', value: investments.length, color: '#4bd8a6' },
        { label: 'Tańlanǵan jazıwlar', value: rows.length, color: '#2bb5d6' },
      ]}
    />

    <div className="sc-panel print:hidden">
      <div className="sc-actions">
        <select aria-label="Hisobot turi" value={type} onChange={e => setType(e.target.value)} className="sc-input" style={{ width: 'auto', minWidth: 180 }}>
          <option value="tasks">Topshiriqlar</option><option value="issues">Muammolar</option><option value="investments">Investitsiyalar</option>
        </select>
        <select aria-label="MFY" value={mfy} onChange={e => setMfy(e.target.value)} className="sc-input" style={{ width: 'auto', minWidth: 180 }}>
          <option value="all">Barcha MFYlar</option>{mfys.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <button disabled={isLoading} onClick={() => downloadCsv(`Shomanay_${type}_${mfy}.csv`, [headers, ...rows])} className="sc-button sc-primary"><Download size={15} /> {t.exportCsv}</button>
        <button onClick={() => window.print()} className="sc-button"><Printer size={15} /> {t.printReport}</button>
      </div>
    </div>

    <div className="sc-panel" style={{ padding: 0, overflow: 'hidden' }}>
      <p className="sc-muted" style={{ padding: '18px 24px 6px' }}>{rows.length} ta yozuv · {mfys.find(item => item.id === mfy)?.name || 'Barcha MFYlar'}</p>
      <div className="overflow-x-auto"><table className="w-full text-left text-[13px]">
        <thead><tr>{headers.map((value, i) => <th className="p-3 px-6 text-[11px] font-normal text-[#8d9ab2]" key={i}>{String(value)}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr className="border-t border-[#a3b4df1c]" key={i}>{row.map((value, j) => <td className="p-3 px-6 align-top" key={j}>{String(value ?? '')}</td>)}</tr>)}</tbody>
      </table></div>
      {!rows.length && !isLoading && <p className="sc-muted" style={{ padding: '4px 24px 22px' }}>Tanlangan filtr bo‘yicha yozuv yo‘q.</p>}
    </div>
  </div>;
}
