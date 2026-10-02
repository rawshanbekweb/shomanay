import type { Issue, Task, InvestmentProject } from '@/types';
export function reportRows(type: string, mfyId: string, data: { tasks: Task[]; issues: Issue[]; investments: InvestmentProject[] }, mfyNames: Record<string, string> = {}): unknown[][] {
  const mfy = (id: string) => mfyNames[id] ?? id;
  const matches = (row: { mfyId: string }) => mfyId === 'all' || row.mfyId === mfyId;
  if (type === 'issues') return [
    ['Kod', 'Muammo', 'Toifa', 'MFY', 'Muhimlik', 'Holat'],
    ...data.issues.filter(matches).map(row => [row.code, row.title, row.category, mfy(row.mfyId), row.priority, row.status]),
  ];
  if (type === 'investments') return [
    ['Nomi', 'Investor', 'MFY', 'Qiymati (mln)', 'Ishga tushish', 'Moliyaviy %', 'Jismoniy %'],
    ...data.investments.filter(matches).map(row => [row.name, row.investorName, mfy(row.mfyId), row.totalCostMlnUzs, row.plannedLaunchDate, row.financialProgressPercent, row.physicalProgressPercent]),
  ];
  return [
    ['Kod', 'Topshiriq', 'Tashkilot', 'MFY', 'Muddat', 'Holat', 'Kechikkan'],
    ...data.tasks.filter(matches).map(row => [row.code, row.title, row.mainExecutorOrg, mfy(row.mfyId), row.deadline, row.status, row.isOverdue ? 'Ha' : 'Yo‘q']),
  ];
}
