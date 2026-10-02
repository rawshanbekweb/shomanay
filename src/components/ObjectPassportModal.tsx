'use client';
import Image from 'next/image';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Building2, TrendingUp, Factory, Zap, GraduationCap, MapPin, User, ShieldCheck, AlertTriangle, FileText, CheckCircle2, PlusCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const ObjectPassportModal: React.FC = () => {
  const { selectedPassportObject, closeObjectPassport, t, tasks, issues, mfys, currentUser, updateObject, isSaving } = useApp();
  const canEdit = ['admin', 'hokim', 'coordinator', 'statistician'].includes(currentUser.role);
  const [activeTab, setActiveTab] = useState<'info' | 'capacity' | 'tasks' | 'photos' | 'docs'>('info');

  if (!selectedPassportObject) return null;

  const obj = selectedPassportObject;
  const mfy = mfys.find((m) => m.id === obj.mfyId);
  const relatedTasks = tasks.filter((t) => t.objectId === obj.id);
  const relatedIssues = issues.filter((i) => i.objectId === obj.id);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'enterprise':
        return <Building2 className="w-6 h-6 text-violet-300" />;
      case 'investment_project':
        return <TrendingUp className="w-6 h-6 text-emerald-400" />;
      case 'industrial_zone':
        return <Factory className="w-6 h-6 text-amber-400" />;
      case 'infrastructure':
        return <Zap className="w-6 h-6 text-purple-400" />;
      default:
        return <GraduationCap className="w-6 h-6 text-rose-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">{t.statusActive}</span>;
      case 'in_progress':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-violet-500/15 text-violet-300 border border-violet-400/30">{t.statusInProgress}</span>;
      case 'risk':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/15 text-red-300 border border-red-400/30 animate-pulse">{t.statusRisk}</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/5 text-slate-300 border border-white/10">{t.statusPlanned}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#111620]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0d121b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header in Official Blue */}
        <div className="flex items-start justify-between p-6 sm:p-8 border-b border-white/10 bg-[#0a0e16]">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 rounded-2xl bg-[#0d121b] border border-white/10 shadow-sm">
              {getTypeIcon(obj.type)}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-400/30">
                  {obj.id.toUpperCase()}
                </span>
                {getStatusBadge(obj.status)}
                {canEdit && (
                  <select
                    aria-label="Jaǵdayın ózgertiw"
                    value={obj.status}
                    disabled={isSaving}
                    onChange={(e) => void updateObject(obj.id, { status: e.target.value as typeof obj.status })}
                    className="text-xs rounded-lg bg-[#0a0e16] border border-white/10 text-slate-200 px-2 py-1 focus:outline-none focus:border-violet-400"
                  >
                    <option value="active">Isleydi</option>
                    <option value="in_progress">Qurılıp atır</option>
                    <option value="planned">Rejelestirilgen</option>
                    <option value="paused">Toqtatılǵan</option>
                    <option value="risk">Táwekel</option>
                  </select>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 mt-2 leading-tight">{obj.name}</h2>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center mt-1">
                <MapPin className="w-4 h-4 mr-1 text-violet-400 shrink-0" />
                {mfy?.name || 'Shomanay'}, {obj.address}
              </p>
            </div>
          </div>
          <button
            onClick={closeObjectPassport}
            className="p-2.5 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#0d121b] px-6 sm:px-8 gap-3 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-[#6d57d6] text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            Ulıwma Maǵlıwmat
          </button>
          {obj.capacity && (
            <button
              onClick={() => setActiveTab('capacity')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'capacity'
                  ? 'border-[#6d57d6] text-violet-300'
                  : 'border-transparent text-slate-400 hover:text-slate-100'
              }`}
            >
              Quwatlar & Resurslar
            </button>
          )}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-[#6d57d6] text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            Tapsırmalar & Mashqalalar
            {(relatedTasks.length > 0 || relatedIssues.length > 0) && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-violet-500/15 text-violet-300 font-bold">
                {relatedTasks.length + relatedIssues.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'photos'
                ? 'border-[#6d57d6] text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            Fotolar ({obj.photos.length})
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'docs'
                ? 'border-[#6d57d6] text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            Hújjetler ({obj.documents.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-violet-500/10 border border-violet-400/20">
                <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-2">Túsindirme</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{obj.description}</p>
              </div>

              {/* Grid attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-[#0a0e16] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Juwapkerlik & Basqarıw</h4>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Juwapker shólkem:</span>
                    <span className="text-slate-100 font-bold">{obj.responsibleOrg}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Kurator / Mas&apos;ul:</span>
                    <span className="text-slate-100 font-bold flex items-center gap-1.5">
                      <User className="w-4 h-4 text-violet-300" />
                      {obj.curator}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">MPJ:</span>
                    <span className="text-slate-100 font-semibold">{mfy?.name} ({mfy?.code})</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Koordinatalar:</span>
                    <span className="text-slate-300 font-mono text-xs font-semibold">
                      {obj.coords[0].toFixed(4)} N, {obj.coords[1].toFixed(4)} E
                    </span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0a0e16] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kórsetkishler & Maǵlıwmat</h4>
                  {obj.metrics?.revenueMlnUzs && (
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-400">Jıllıq tushum:</span>
                      <span className="text-emerald-300 font-bold">{obj.metrics.revenueMlnUzs.toLocaleString()} mln som</span>
                    </div>
                  )}
                  {obj.metrics?.jobs && (
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-400">Jumıs orınları:</span>
                      <span className="text-slate-100 font-bold">{obj.metrics.jobs} nafar</span>
                    </div>
                  )}
                  {obj.metrics?.exportVolumeUsd && (
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-400">Eksport kólemi:</span>
                      <span className="text-violet-300 font-bold">${obj.metrics.exportVolumeUsd.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Maǵlıwmat deregi:</span>
                    <span className="text-slate-300 text-xs">{obj.source}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400">Jańalanǵan sáne:</span>
                    <span className="text-slate-300 text-xs font-mono">{obj.updatedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'capacity' && obj.capacity && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0a0e16] border border-white/10 space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{obj.capacity.resourceType}</h3>
                    <p className="text-xs text-slate-400">Juwapkerlik balansı boyınsha rásmiy quwatlılıq</p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-xl bg-violet-500/15 text-violet-300 font-mono font-bold text-sm border border-violet-400/30">
                    Jámi: {obj.capacity.total} {obj.capacity.unit}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-2 font-bold">
                    <span className="text-amber-300">Band etilgen: {obj.capacity.used} {obj.capacity.unit} ({Math.round((obj.capacity.used / obj.capacity.total) * 100)}%)</span>
                    <span className="text-emerald-300">Erkin quwat: {obj.capacity.free} {obj.capacity.unit} ({Math.round((obj.capacity.free / obj.capacity.total) * 100)}%)</span>
                  </div>
                  <div className="h-3.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(obj.capacity.used / obj.capacity.total) * 100}%` }}
                      className="bg-amber-500 h-full"
                    />
                    <div
                      style={{ width: `${(obj.capacity.free / obj.capacity.total) * 100}%` }}
                      className="bg-emerald-600 h-full"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0d121b] text-xs text-slate-400 border border-white/10 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 shrink-0 text-violet-300" />
                  <span>Rásmiy eskertiw: Erkin quwat kórsetkishi jańa investiciyalıq joybarlarǵa qosılıw ushın texnik shárt alıwǵa ruxsat beredi.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {/* Related Issues */}
              <div>
                <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" />
                  Tirkelgen Mashqalalar ({relatedIssues.length})
                </h4>
                {relatedIssues.length === 0 ? (
                  <p className="text-sm text-slate-400 py-3">Ushbu obyekt boyınsha ashıq mashqala tirkelmegen.</p>
                ) : (
                  <div className="space-y-3">
                    {relatedIssues.map((iss) => (
                      <div key={iss.id} className="p-4 rounded-2xl bg-[#0a0e16] border border-white/10 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0d121b] text-slate-300 border border-white/10">{iss.code}</span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-400/30 font-bold">
                              {iss.priority.toUpperCase()}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-slate-100 mt-1.5">{iss.title}</h5>
                          <p className="text-xs text-slate-400 mt-0.5">{iss.description}</p>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-[#0d121b] border border-white/10 font-semibold text-slate-300">
                          {iss.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Related Tasks */}
              <div>
                <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-violet-300" />
                  Baylanıslı Tapsırmalar & Qadaǵalaw ({relatedTasks.length})
                </h4>
                {relatedTasks.length === 0 ? (
                  <p className="text-sm text-slate-400 py-3">Aktiv tapsırma joq.</p>
                ) : (
                  <div className="space-y-3">
                    {relatedTasks.map((tsk) => (
                      <div key={tsk.id} className="p-4 rounded-2xl bg-[#0a0e16] border border-white/10 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0d121b] text-slate-300 border border-white/10">{tsk.code}</span>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              tsk.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300' :
                              tsk.status === 'under_review' ? 'bg-amber-500/15 text-amber-300' :
                              'bg-violet-500/15 text-violet-300'
                            }`}>
                              {tsk.status}
                            </span>
                            {tsk.isOverdue && (
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-300 font-bold border border-red-400/30">
                                Múddeti ótken!
                              </span>
                            )}
                          </div>
                          <h5 className="text-sm font-bold text-slate-100 mt-1.5">{tsk.title}</h5>
                          <div className="text-xs text-slate-400 mt-1 flex items-center gap-4">
                            <span>Orynlawshı: <strong className="text-slate-300">{tsk.mainExecutorOrg}</strong></span>
                            <span>Múddet: <strong className="text-slate-300">{new Date(tsk.deadline).toLocaleDateString()}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {obj.photos.map((url, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border border-white/10 group h-64 bg-white/5 shadow-sm">
                  <Image unoptimized width={800} height={600} src={url} alt={obj.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-xs text-white font-medium">Fikslengen foto dálili #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-3">
              {obj.documents.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#0a0e16] border border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-400/30">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-100">{doc.title}</h5>
                      <span className="text-xs text-slate-400">{doc.date} · {doc.size}</span>
                    </div>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/10">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions in Crisp White */}
        <div className="p-5 border-t border-white/10 bg-[#0a0e16] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            FERGA Yagona Obyekt Identifikatorı: <code className="text-violet-300 font-bold">{obj.id}</code>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tasks"
              onClick={closeObjectPassport}
              className="px-4 py-2 text-xs font-bold text-violet-300 bg-[#0d121b] hover:bg-violet-500/10 border border-white/10 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-4 h-4 text-violet-300" />
              Tapsırma biriktiriw
            </Link>
            <button
              onClick={closeObjectPassport}
              className="px-5 py-2 text-xs font-bold text-white bg-[#6d57d6] hover:bg-violet-500/15 rounded-xl shadow-sm transition-colors"
            >
              {t.btnClose}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
