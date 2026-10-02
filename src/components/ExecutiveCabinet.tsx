'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { MfyMap } from '@/components/MfyMap';
import { AreaChart, Columns, Donut, HBars, Sparkline, countBy, cumulativeByMonth, fmtNum, PALETTE } from '@/components/charts';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, AlertOctagon, Building2, ArrowRight, Sparkles, FileCheck } from 'lucide-react';

type Kpi = {
  label: string;
  value: string;
  unit: string;
  note: string;
  tone?: 'positive' | 'negative';
  icon: React.ComponentType<{ size?: number }>;
  href: string;
};


const KPI_COLORS = ['#8b72ff', '#2bb5d6', '#e59a45', '#e0679c'];
const DONUT_COLORS = ['#4bd8a6', '#6b8cff', '#f27fb0', '#f0cf5f', '#b88cff', '#5fd0e8', '#e59a45'];

const statusTone = (status: string) =>
  status === 'accepted' ? 'good' : status === 'under_review' ? 'warn' : 'accent';
const priorityTone = (priority: string) =>
  priority === 'critical' ? 'bad' : priority === 'high' ? 'warn' : 'neutral';

export const ExecutiveCabinet: React.FC = () => {
  const { t, tasks, issues, mfys, investments, openObjectPassport } = useApp();

  const totalTasks = tasks.length;
  const acceptedOnTimeTasks = tasks.filter((task) => task.status === 'accepted' && !task.isOverdue).length;
  const onTimePercentage = totalTasks > 0 ? Math.round((acceptedOnTimeTasks / totalTasks) * 100) : 100;

  const overdueTasks = tasks.filter((task) => task.isOverdue && task.status !== 'accepted' && task.status !== 'cancelled');
  const underReviewTasks = tasks.filter((task) => task.status === 'under_review');
  const criticalIssues = issues.filter((issue) => issue.priority === 'critical' && issue.status !== 'resolved');
  const openIssues = issues.filter((issue) => issue.status !== 'resolved');

  const kpis: Kpi[] = [
    {
      label: t.kpiTasksOnTime, value: `${onTimePercentage}%`, unit: `${acceptedOnTimeTasks} / ${totalTasks} tapsırma óz waqtında`,
      note: onTimePercentage >= 70 ? 'Normadan joqarı' : 'Normadan tómen', tone: onTimePercentage >= 70 ? 'positive' : 'negative',
      icon: CheckCircle2, href: '/tasks',
    },
    {
      label: t.kpiOverdueTasks, value: String(overdueTasks.length), unit: overdueTasks.length > 0 ? 'Múddeti ótken tapsırmalar' : 'Keshigiw tirkelmegen',
      note: overdueTasks.length > 0 ? 'Itibar talap etiledi' : 'Hámmesi tártipte', tone: overdueTasks.length > 0 ? 'negative' : 'positive',
      icon: Clock, href: '/tasks',
    },
    {
      label: t.kpiUnderReviewTasks, value: String(underReviewTasks.length), unit: 'Dáliller tapsırılǵan',
      note: 'Qabıllaw kutilip atır', icon: FileCheck, href: '/tasks',
    },
    {
      label: t.kpiOpenIssues, value: String(criticalIssues.length), unit: 'kritikalıq mashqala',
      note: `Jámi: ${openIssues.length} ashıq`, tone: criticalIssues.length > 0 ? 'negative' : 'positive',
      icon: AlertOctagon, href: '/issues',
    },
  ];

  const now = new Date();
  const today = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
  const monthly = (dates: string[]) => cumulativeByMonth(dates, 8);
  const sparks = [
    monthly(tasks.filter((x) => x.status === 'accepted' && !x.isOverdue).map((x) => x.completedDate ?? x.createdDate)),
    monthly(overdueTasks.map((x) => x.deadline)),
    monthly(underReviewTasks.map((x) => x.createdDate)),
    monthly(criticalIssues.map((x) => x.reportedDate)),
  ];
  const trend = cumulativeByMonth(tasks.map((x) => x.createdDate), 8);
  const statusMap = new Map<string, number>();
  tasks.forEach((x) => statusMap.set(x.status, (statusMap.get(x.status) ?? 0) + 1));
  const donutItems = [...statusMap.entries()].sort((l, r) => r[1] - l[1]).map(([label, value], i) => ({ label, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));

  const populationBars = [...mfys].sort((l, r) => r.population - l.population).map((m, i) => ({
    label: m.name.replace(' MPJ', ''), value: m.population, text: fmtNum(m.population), color: PALETTE[i % PALETTE.length],
  }));
  const stageItems = countBy(investments, (x) => x.stage).map(([label, value], i) => ({ label: label.replace(/_/g, ' '), value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  const issueBars = countBy(issues, (x) => x.category).map(([label, value], i) => ({ label: label.replace(/_/g, ' '), value, color: PALETTE[(i + 2) % PALETTE.length] }));
  const priorityItems = countBy(issues, (x) => x.priority).map(([label, value]) => ({
    label, value, color: label === 'critical' ? '#ff7a8a' : label === 'high' ? '#e59a45' : label === 'medium' ? '#f0cf5f' : '#4bd8a6',
  }));
  const costByMfy = mfys.map((m) => ({
    label: m.name.replace(' MPJ', ''),
    value: Math.round(investments.filter((x) => x.mfyId === m.id).reduce((sum, x) => sum + x.totalCostMlnUzs, 0) / 1000 * 10) / 10,
  }));
  const jobsByMfy = mfys.map((m) => ({
    label: m.name.replace(' MPJ', ''),
    value: investments.filter((x) => x.mfyId === m.id).reduce((sum, x) => sum + x.plannedJobs, 0),
  }));

  return (
    <div className="sc-stack">
      <MfyMap />

      <section className="sc-live-kpis" aria-label="KPI">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} href={kpi.href} className="sc-live-kpi" style={{ ['--sc-order' as string]: index, ['--k' as string]: KPI_COLORS[index % KPI_COLORS.length] }}>
              <span className="sc-live-kpi-label">
                <span>{kpi.label}</span>
                <span className="sc-kpi-badge"><Icon size={16} /></span>
              </span>
              <span className="sc-kpi-row">
                <span className="sc-kpi-main">
                  <strong>{kpi.value}</strong>
                  <span className="sc-live-kpi-unit">{kpi.unit}</span>
                </span>
                <Sparkline values={sparks[index]} color={KPI_COLORS[index % KPI_COLORS.length]} />
              </span>
              <span className="sc-kpi-foot">
                <span>{today}</span>
                <span className="sc-change" data-tone={kpi.tone}>{kpi.note}</span>
              </span>
            </Link>
          );
        })}
      </section>

      <div className="sc-section-title">
        <h2>Tuman haqqında tiykarǵı maǵlıwmat</h2>
        <Link href="/indicators" className="sc-text-link">Kórsetkishler <ArrowRight size={14} /></Link>
      </div>

      <section className="sc-chart-grid">
        <div className="sc-panel">
          <h2>Tapsırmalar dinamikası</h2>
          <p className="sc-muted">Shomanay rayonı · jıynalma · tapsırma</p>
          <div className="sc-chart-figure"><strong>{totalTasks}</strong><span>tapsırma<br />jámi</span></div>
          <AreaChart points={trend} />
        </div>
        <div className="sc-panel">
          <h2>Tapsırmalar qanday jaǵdayda</h2>
          <p className="sc-muted">Statuslar boyınsha úlesi</p>
          <Donut items={donutItems} total={totalTasks} />
        </div>
      </section>

      <section className="sc-chart-grid three">
        <div className="sc-panel">
          <h2>MPJlar boyınsha aholi</h2>
          <p className="sc-muted">Shomanay rayonı · adam</p>
          <HBars items={populationBars} />
        </div>
        <div className="sc-panel">
          <h2>Investiciya bosqıshları</h2>
          <p className="sc-muted">Joybarlar sanı</p>
          <Donut items={stageItems} total={investments.length} caption="joybar" />
        </div>
        <div className="sc-panel">
          <h2>Mashqalalar kategoriyası</h2>
          <p className="sc-muted">Barlıq mashqalalar</p>
          <HBars items={issueBars} />
        </div>
      </section>

      <section className="sc-chart-grid">
        <div className="sc-panel">
          <h2>Investiciya kólemi (MPJ boyınsha)</h2>
          <p className="sc-muted">mlrd som</p>
          <Columns items={costByMfy} color="#2bb5d6" />
        </div>
        <div className="sc-panel">
          <h2>Mashqala basımlılıǵı</h2>
          <p className="sc-muted">Dárejesi boyınsha úlesi</p>
          <Donut items={priorityItems} total={issues.length} caption="mashqala" />
        </div>
      </section>

      <section className="sc-chart-grid">
        <div className="sc-panel">
          <h2>Jaratılatuǵın jumıs orınları</h2>
          <p className="sc-muted">Investiciya joybarları boyınsha, MPJ kesiminde</p>
          <Columns items={jobsByMfy} color="#e59a45" />
        </div>
        <div className="sc-panel">
          <h2>Mashqalalar dinamikası</h2>
          <p className="sc-muted">Jıynalma · mashqala</p>
          <AreaChart points={cumulativeByMonth(issues.map((x) => x.reportedDate), 8)} color="#e0679c" height={260} />
        </div>
      </section>

      <section className="sc-command-grid">
        <div className="sc-panel">
          <div className="sc-panel-heading">
            <div>
              <div className="sc-eyebrow"><i /> Qadaǵalaw</div>
              <h2>Qadaǵalawdaǵı tapsırmalar</h2>
            </div>
            <Link href="/tasks" className="sc-text-link">Barlıǵı ({tasks.length}) <ArrowRight size={14} /></Link>
          </div>

          <div className="grid gap-3">
            {tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="sc-report-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="sc-status" data-tone="accent">{task.code}</span>
                  <span className="sc-status" data-tone={statusTone(task.status)}><i />{task.status}</span>
                  {task.isOverdue && <span className="sc-status" data-tone="bad"><i />MÚDDETI ÓTKEN</span>}
                </div>
                <h3 className="mt-3 text-[15px] font-medium leading-snug">{task.title}</h3>
                <p className="sc-muted line-clamp-2" style={{ fontSize: 12 }}>{task.actionDescription}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8d9ab2]">
                  <span>Orınlawshı: <strong className="font-medium text-[#e2e7f2]">{task.mainExecutorOrg}</strong></span>
                  <span>
                    Múddet: <strong className={`font-medium ${task.isOverdue ? 'text-[#e7ab91]' : 'text-[#e2e7f2]'}`}>{task.deadline.slice(0, 10).split('-').reverse().join('.')}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sc-panel">
          <div className="sc-panel-heading">
            <div>
              <div className="sc-eyebrow"><i /> Risk</div>
              <h2>Kritikalıq mashqalalar</h2>
            </div>
            <Link href="/issues" className="sc-text-link">Barlıǵı ({issues.length}) <ArrowRight size={14} /></Link>
          </div>

          <div className="grid gap-3">
            {issues.slice(0, 4).map((issue) => (
              <div key={issue.id} className="sc-report-card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="sc-status" data-tone="accent">{issue.code}</span>
                  <span className="sc-status" data-tone={priorityTone(issue.priority)}><i />{issue.priority}</span>
                  <span className="text-xs capitalize text-[#8d9ab2]">{issue.category}</span>
                </div>
                <h3 className="mt-3 text-[15px] font-medium leading-snug">{issue.title}</h3>
                <p className="sc-muted" style={{ fontSize: 12 }}>{issue.description}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  {issue.objectName ? (
                    <button type="button" onClick={() => openObjectPassport(issue.objectId!)} className="sc-text-link">
                      <Building2 size={14} /> {issue.objectName}
                    </button>
                  ) : <span />}
                  <Link href={`/tasks?issueId=${issue.id}`} className="sc-text-link">Tapsırma beriw <ArrowRight size={14} /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sc-panel">
        <div className="sc-panel-heading">
          <div className="flex items-center gap-4">
            <span className="sc-icon-tile"><Sparkles size={20} /></span>
            <div>
              <div className="sc-eyebrow"><i /> AI analitika</div>
              <h2>Analitikalıq túsindirme hám qarar qabıllaw usınısı</h2>
            </div>
          </div>
          <span className="sc-status" data-tone="accent">Model: Shomanay-LLM-Context</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: AlertTriangle, tone: '#e7ab91', title: '1. Gaz basımı defitsiti (Diyxanabad)',
              text: 'Gidroponika issıqxanasında gaz basımınıń 0.8 atm bolıwı 14.2 mlrd somlıq ekin ónimin nobud etiw qáwpin tuwdırmaqta. «Hududgaz» kárxanasına GRS-3 ten montajdı 2-oktyabrge shekem pitkeriw shárt.',
            },
            {
              icon: Clock, tone: '#e5ba78', title: '2. KSZ transformator keshigiwi',
              text: '1.5 MWt podstanciya qurılısınıń keshigiwi sebepli 3 kárxana iske túsiwi toqtap tur. Dálil tapsırılǵan, ǵárezsiz tekseriwshi M. Torebaev tárepinen qabıllaw tekseriwi talap etiledi.',
            },
            {
              icon: TrendingUp, tone: '#80dcbc', title: '3. Paxta klasteri toqımashılıq kadrları',
              text: '40 nafar jaslardı qısqa kurslarda oqıtıw tapsırması tabıslı orınlanıp qabıl etildi. Bul klasterdiń 2-fazası ushın 195 nafar tastıyıqlanǵan jumıs ornın támiyinledi.',
            },
          ].map(({ icon: Icon, tone, title, text }) => (
            <div key={title} className="sc-report-card">
              <span className="flex items-center gap-2 text-[13px] font-medium" style={{ color: tone }}>
                <Icon size={15} /> {title}
              </span>
              <p className="sc-muted mt-3" style={{ fontSize: 12 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
