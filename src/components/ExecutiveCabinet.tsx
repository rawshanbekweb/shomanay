'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, AlertOctagon, Building2, ArrowRight, Sparkles, Compass, FileCheck, Landmark } from 'lucide-react';

export const ExecutiveCabinet: React.FC = () => {
  const { t, tasks, issues, openObjectPassport } = useApp();

  // Calculations for FR-11 Management KPIs
  const totalTasks = tasks.length;
  const acceptedOnTimeTasks = tasks.filter(
    (t) => t.status === 'accepted' && !t.isOverdue
  ).length;
  const onTimePercentage = totalTasks > 0 ? Math.round((acceptedOnTimeTasks / totalTasks) * 100) : 100;

  const overdueTasks = tasks.filter((t) => t.isOverdue && t.status !== 'accepted' && t.status !== 'cancelled');
  const underReviewTasks = tasks.filter((t) => t.status === 'under_review');
  const criticalIssues = issues.filter((i) => i.priority === 'critical' && i.status !== 'resolved');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / District Executive Summary in Prestigious State Blue */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a3d8f] via-[#0e4da4] to-[#1259b8] text-white p-8 lg:p-10 shadow-xl border border-blue-900/20">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-xs">
                <Landmark className="w-3.5 h-3.5 text-amber-300" />
                Shomanay Rayonı Hákimligi Rásmiy Operativ Kabineti (FR-11)
              </span>
              <span className="text-xs text-blue-100 font-mono">30.09.2026</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Tuman Rawajlanıwı & Ijro Intizomi Nazorati
            </h1>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Mashqaladan ➡️ tastıyıqlanǵan nátiyjege shekem tolıq qadaǵalaw sikli. Obyektler pasportı,
              resurs quwatlılıqları, dálilli tapsırmalar hám ǵárezsiz qabıllaw monitoringi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 shrink-0">
            <Link
              href="/tasks"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#0a3d8f] text-xs font-extrabold shadow-lg transition-all flex items-center gap-2"
            >
              <span>{t.btnCreateTask}</span>
              <ArrowRight className="w-4 h-4 text-[#0a3d8f]" />
            </Link>
            <Link
              href="/map"
              className="px-5 py-3 rounded-xl bg-blue-800/60 hover:bg-blue-800 text-white text-xs font-bold border border-white/30 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>GIS Kartaǵa ótiw</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Counters Grid in Command Center Dark Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Tasks on time % */}
        <div className="p-6 rounded-2xl bg-[#081324] border border-blue-900/50 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-3">
            <span>{t.kpiTasksOnTime}</span>
            <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl lg:text-4xl font-black text-white">{onTimePercentage}%</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
            <span className="text-emerald-400 font-bold">{acceptedOnTimeTasks}</span> / {totalTasks} tapsırma óz waqtında
          </div>
        </div>

        {/* KPI 2: Overdue Tasks */}
        <div className="p-6 rounded-2xl bg-[#081324] border border-blue-900/50 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-3">
            <span>{t.kpiOverdueTasks}</span>
            <div className="p-2.5 rounded-xl bg-red-950/80 text-red-400 border border-red-800/50">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl lg:text-4xl font-black ${overdueTasks.length > 0 ? 'text-red-400' : 'text-white'}`}>
            {overdueTasks.length}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            {overdueTasks.length > 0 ? (
              <span className="text-red-400 font-semibold">Toshkent vaqti boyicha muddati o&apos;tgan</span>
            ) : (
              'Keshigiw tirkelmegen'
            )}
          </div>
        </div>

        {/* KPI 3: Under review tasks */}
        <div className="p-6 rounded-2xl bg-[#081324] border border-blue-900/50 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-3">
            <span>{t.kpiUnderReviewTasks}</span>
            <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/50">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl lg:text-4xl font-black text-white">{underReviewTasks.length}</div>
          <div className="text-xs text-amber-400 mt-2 font-medium">
            Dáliller tapsırılǵan, qabıllaw kutilip atır
          </div>
        </div>

        {/* KPI 4: Critical Issues */}
        <div className="p-6 rounded-2xl bg-[#081324] border border-blue-900/50 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-3">
            <span>{t.kpiOpenIssues}</span>
            <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/50">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl lg:text-4xl font-black text-rose-400">
            {criticalIssues.length} <span className="text-xs font-semibold text-slate-400">kritikalıq</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            Jámi: {issues.filter((i) => i.status !== 'resolved').length} ashıq mashqala
          </div>
        </div>
      </div>

      {/* Main Spacious Grid: Urgent Issues & Overdue Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Overdue Tasks & Tasks Under Review */}
        <div className="p-7 rounded-3xl bg-[#081324] border border-blue-900/50 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-950 text-cyan-400 border border-blue-800/50">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Qadaǵalawdaǵı Tapsırmalar</h2>
                <p className="text-xs text-slate-400">Múddetler, ijro dalillari hám tekshiruv navbati</p>
              </div>
            </div>
            <Link
              href="/tasks"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
            >
              Barlıǵı ({tasks.length}) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {tasks.slice(0, 4).map((tsk) => {
              const isOverdue = tsk.isOverdue;
              return (
                <div
                  key={tsk.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isOverdue
                      ? 'bg-red-950/20 border-red-800/60 hover:border-red-600'
                      : tsk.status === 'under_review'
                      ? 'bg-amber-950/20 border-amber-800/60 hover:border-amber-600'
                      : 'bg-[#0b1b33] border-blue-900/40 hover:border-blue-700/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#071324] text-cyan-300 border border-blue-800/50 shadow-2xs">
                          {tsk.code}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 animate-pulse">
                            MÚDDETI ÓTKEN
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            tsk.status === 'accepted'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                              : tsk.status === 'under_review'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                              : 'bg-blue-950 text-cyan-300 border border-blue-800/50'
                          }`}
                        >
                          {tsk.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white leading-snug">{tsk.title}</h3>
                      <p className="text-xs text-slate-300 line-clamp-2">{tsk.actionDescription}</p>

                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                        <span>Orynlawshı: <strong className="text-slate-200">{tsk.mainExecutorOrg}</strong></span>
                        <span>Múddet: <strong className={isOverdue ? 'text-red-400 font-bold' : 'text-slate-200'}>{new Date(tsk.deadline).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    <Link
                      href="/tasks"
                      className="px-4 py-2 text-xs font-bold text-cyan-300 bg-[#0a1f3d] hover:bg-blue-900 rounded-xl shrink-0 border border-blue-700/50 shadow-2xs transition-colors self-start"
                    >
                      Kórip shıǵıw
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Critical Issues & Bottlenecks */}
        <div className="p-7 rounded-3xl bg-[#081324] border border-blue-900/50 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-950 text-red-400 border border-red-800/50">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Kritikalıq Mashqalalar & Riskler</h2>
                <p className="text-xs text-slate-400">Gaz, elektr, transport va infratuzilma to&apos;siqlari</p>
              </div>
            </div>
            <Link
              href="/issues"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
            >
              Barlıǵı ({issues.length}) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {issues.slice(0, 4).map((iss) => (
              <div
                key={iss.id}
                className="p-5 rounded-2xl bg-[#0b1b33] border border-blue-900/40 hover:border-blue-700/60 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-[#071324] text-cyan-300 border border-blue-800/50 shadow-2xs">
                        {iss.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          iss.priority === 'critical'
                            ? 'bg-red-950 text-red-400 border border-red-800/50'
                            : iss.priority === 'high'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {iss.priority}
                      </span>
                      <span className="text-xs text-slate-400">Kategoriya: <strong className="text-slate-200 capitalize">{iss.category}</strong></span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{iss.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{iss.description}</p>

                    {iss.objectName && (
                      <button
                        onClick={() => openObjectPassport(iss.objectId!)}
                        className="text-xs text-cyan-400 hover:underline pt-1 flex items-center gap-1.5 font-semibold"
                      >
                        <Building2 className="w-4 h-4 text-cyan-400" />
                        <span>{iss.objectName} (Pasportti kóriw)</span>
                      </button>
                    )}
                  </div>

                  <Link
                    href={`/tasks?issueId=${iss.id}`}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#0a3d8f] hover:bg-blue-800 rounded-xl shrink-0 shadow-sm transition-colors self-start"
                  >
                    Tapsırma beriw
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Automated Synthesis & District Diagnostic in Dark Cyber Style (FR-17) */}
      <div className="p-8 rounded-3xl bg-[#081324] border border-blue-900/50 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                AI Analitikalıq Túsindirme & Qarar Qabıllaw Tavsiyası (FR-17)
              </h2>
              <p className="text-xs text-slate-400">
                Statistika, keshigiwler hám infratuzilma datchikleri tiykarında avtomatikalıq tahlil
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 font-mono font-bold border border-cyan-800/60">
            Model: Shomanay-LLM-Context
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-[#0b1b33] border border-blue-900/40 space-y-2.5">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              1. Gaz basımı defitsiti (Diyxanabad)
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Gidroponika issıqxanasında gaz basımınıń 0.8 atm bolıwı 14.2 mlrd somlıq ekin ónimin nobud etiw qáwpin tuwdırmaqta.
              «Hududgaz» kárxanasına GRS-3 ten montajdı 2-oktyabrge shekem pitkeriw shárt.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b1b33] border border-blue-900/40 space-y-2.5">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              2. KSZ transformator keshigiwi
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              1.5 MWt podstanciya qurılısınıń keshigiwi sebepli 3 kárxana iske túsiwi toqtap tur.
              Dálil tapsırılǵan, ǵárezsiz tekseriwshi M. Torebaev tárepinen qabıllaw tekseriwi talap etiledi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0b1b33] border border-blue-900/40 space-y-2.5">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              3. Paxta klasteri toqımashılıq kadrları
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              40 nafar jaslardı qısqa kurslarda oqıtıw tapsırması tabıslı orınlanıp qabıl etildi.
              Bul klasterdiń 2-fazası ushın 195 nafar tastıyıqlanǵan jumıs ornın támiyinledi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
