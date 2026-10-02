import type { DistrictObject, InvestmentProject, IndustrialZone, Issue, SectorIndicator, Task } from '@/types';

export type Severity = 'critical' | 'warning' | 'positive' | 'info';

export interface Insight {
  id: string;
  severity: Severity;
  title: string;
  text: string;
  /** Qorıtındı qaysı faktorlarǵa tiykarlanǵanı (TZ: "AI xulosasining asosiy omillari") */
  factors: string[];
  /** Ma'lumot manbası */
  source: string;
  href?: string;
  objectId?: string;
}

interface Input {
  tasks: Task[];
  issues: Issue[];
  investments: InvestmentProject[];
  zones: IndustrialZone[];
  objects: DistrictObject[];
  indicators: SectorIndicator[];
  now?: number;
}

const DAY = 86_400_000;
const days = (ms: number) => Math.max(1, Math.round(ms / DAY));
const fmtDate = (iso: string) => iso.slice(0, 10).split('-').reverse().join('.');
const RANK: Record<Severity, number> = { critical: 0, warning: 1, info: 2, positive: 3 };

/**
 * Qaǵıydalarǵa tiykarlanǵan analitika (model emes): hár bir qorıtındı anıq faktlar hám derekke baylanısqan.
 * Tizim TZ boyınsha qorıtındınıń derekleri hám faktorların kórsetedi.
 */
export function buildInsights({ tasks, issues, investments, zones, objects, indicators, now = Date.now() }: Input): Insight[] {
  const out: Insight[] = [];
  const objectName = (id?: string, fallback?: string) => fallback ?? objects.find((o) => o.id === id)?.name;

  // 1. Múddeti ótken tapsırmalar
  tasks
    .filter((t) => t.status !== 'accepted' && t.status !== 'cancelled' && (t.isOverdue || Date.parse(t.deadline) < now))
    .forEach((t) => {
      const late = days(now - Date.parse(t.deadline));
      out.push({
        id: `task-overdue-${t.id}`, severity: 'critical',
        title: `${t.code}: múddet ${late} kún ótken`,
        text: `«${t.title}» tapsırması ${fmtDate(t.deadline)} sánesinde orınlanıwı kerek edi. Juwapker: ${t.mainExecutorOrg}.`,
        factors: [`Múddet: ${fmtDate(t.deadline)}`, `Jaǵdayı: ${t.status.replace(/_/g, ' ')}`, `Ahmiyeti: ${t.priority}`, ...(objectName(t.objectId, t.objectName) ? [`Obyekt: ${objectName(t.objectId, t.objectName)}`] : [])],
        source: 'Tapsırmalar reestri', href: '/tasks', objectId: t.objectId,
      });
    });

  // 2. Tekseriwde uzaq turǵan tapsırmalar
  tasks
    .filter((t) => t.status === 'under_review' && t.evidence?.submittedAt && now - Date.parse(t.evidence.submittedAt) > 3 * DAY)
    .forEach((t) => out.push({
      id: `task-review-${t.id}`, severity: 'warning',
      title: `${t.code}: tekseriw ${days(now - Date.parse(t.evidence!.submittedAt))} kún kútilip atır`,
      text: `Dálil tapsırılǵan, biraq ǵárezsiz tekseriwshi (${t.inspectorOrg}) qabıllamaǵan.`,
      factors: [`Dálil tapsırılǵan: ${fmtDate(t.evidence!.submittedAt)}`, `Tekseriwshi: ${t.inspectorPerson}`],
      source: 'Tapsırmalar reestri', href: '/tasks', objectId: t.objectId,
    }));

  // 3. Kritikalıq mashqalalar
  issues
    .filter((i) => i.priority === 'critical' && i.status !== 'resolved' && i.status !== 'closed')
    .forEach((i) => {
      const assigned = tasks.some((t) => t.issueId === i.id && t.status !== 'cancelled');
      out.push({
        id: `issue-${i.id}`, severity: 'critical',
        title: `${i.code}: ${i.title}`,
        text: assigned ? `Kritikalıq mashqala ushın tapsırma berilgen, orınlanıwı baqlanbaqta.` : `Kritikalıq mashqala ushın tapsırma hálı berilmegen — tez arada juwapker belgilew kerek.`,
        factors: [`Kategoriya: ${i.category.replace(/_/g, ' ')}`, `Aytılǵan sáne: ${fmtDate(i.reportedDate)}`, assigned ? 'Tapsırma bar' : 'Tapsırma joq', ...(i.objectName ? [`Obyekt: ${i.objectName}`] : [])],
        source: 'Mashqalalar reestri', href: assigned ? '/issues' : `/tasks?issueId=${i.id}`, objectId: i.objectId,
      });
    });

  // 4. Investiciya joybarları: keshigiw
  investments.forEach((inv) => {
    const lateMilestones = inv.milestones.filter((m) => m.status === 'delayed');
    const launchPassed = !['operational'].includes(inv.stage) && Date.parse(inv.plannedLaunchDate) < now;
    if (inv.stage === 'delayed' || lateMilestones.length || launchPassed) {
      out.push({
        id: `inv-${inv.id}`, severity: launchPassed ? 'critical' : 'warning',
        title: `${inv.name}: keshigiw qáwpi`,
        text: `Joybar ${inv.stage.replace(/_/g, ' ')} bosqıshında, fizikalıq tayarlıq ${inv.physicalProgressPercent}%, moliyalıq ózlestiriw ${inv.financialProgressPercent}%.`,
        factors: [`Rejeli iske túsiriw: ${inv.plannedLaunchDate}`, `Keshikken etaplar: ${lateMilestones.length}`, `Jumıs orınları (reje/tastıyıqlanǵan): ${inv.plannedJobs}/${inv.verifiedJobs}`],
        source: 'Investiciya reestri', href: '/investments', objectId: inv.objectId,
      });
    }
    if (inv.stage === 'operational') {
      out.push({
        id: `inv-ok-${inv.id}`, severity: 'positive',
        title: `${inv.name}: iske túsirilgen`,
        text: `Joybar isleydi, ${inv.verifiedJobs} tastıyıqlanǵan jumıs orını jaratılǵan.`,
        factors: [`Tastıyıqlanǵan jumıs orınları: ${inv.verifiedJobs}`, `Qunı: ${inv.totalCostMlnUzs.toLocaleString('en-US')} mln som`],
        source: 'Investiciya reestri', href: '/investments', objectId: inv.objectId,
      });
    }
  });

  // 5. Zonalarda resurs tapshılıǵı
  zones.forEach((z) => {
    const items = [
      { name: 'Elektr', c: z.capacities.electricityMwt, unit: 'MWt' },
      { name: 'Gaz', c: z.capacities.gasM3H, unit: 'm³/saat' },
      { name: 'Suw', c: z.capacities.waterM3Day, unit: 'm³/kún' },
    ].filter((x) => x.c.total > 0 && x.c.free / x.c.total < 0.15);
    if (items.length) {
      out.push({
        id: `zone-${z.id}`, severity: 'warning',
        title: `${z.name}: resurs tapshılıǵı`,
        text: `Bos quwat 15% tan kem: ${items.map((x) => `${x.name} ${x.c.free} ${x.unit}`).join(', ')}. Jańa kárxanalar ulanıwı shekleniwi múmkin.`,
        factors: items.map((x) => `${x.name}: ${x.c.free}/${x.c.total} ${x.unit} bos`).concat(`Bos maydan: ${z.freeAreaHa} Ga`),
        source: 'Sanaat zonaları', href: '/industrial-zones',
      });
    }
  });

  // 6. Táwekel dárejesindegi obyektler
  objects.filter((o) => o.status === 'risk').forEach((o) => out.push({
    id: `obj-${o.id}`, severity: 'warning',
    title: `${o.name}: «táwekel» statusında`,
    text: `Obyekt boyınsha ${o.relatedIssuesCount} mashqala hám ${o.relatedTasksCount} tapsırma baylanıstırılǵan.`,
    factors: [`Juwapker: ${o.responsibleOrg}`, `Kurator: ${o.curator}`, `Jańalanǵan: ${o.updatedDate}`],
    source: 'Obyektler reestri', href: '/map', objectId: o.id,
  }));

  // 7. Kórsetkishler: teris tendenciya
  indicators.filter((i) => !i.isPositiveTrend || i.trendPercent < 0).forEach((i) => out.push({
    id: `ind-${i.id}`, severity: 'warning',
    title: `${i.name.qq}: tómenlew`,
    text: `Kórsetkish ótken jılǵa salıstırǵanda ${i.trendPercent}% ózgergen.`,
    factors: Object.entries(i.historical).map(([y, v]) => `${y}: ${v} ${i.unit}`),
    source: 'Statistika kórsetkishleri', href: `/indicators?sector=${i.sectorKey}`,
  }));

  return out.sort((a, b) => RANK[a.severity] - RANK[b.severity]);
}
