'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { IssueCategory, IssuePriority } from '@/types';
import {
  AlertOctagon,
  PlusCircle,
  Building2,
  MapPin,
  AlertTriangle,
  Zap,
  Flame,
  Droplets,
  Truck,
  DollarSign,
  Users,
  Search,
  ArrowRight,
} from 'lucide-react';

export default function IssuesPage() {
  const { issues, createIssue, isSaving, error, objects, mfys, t, openObjectPassport } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<IssueCategory>('electricity');
  const [newPriority, setNewPriority] = useState<IssuePriority>('high');
  const [newObjectId, setNewObjectId] = useState('');
  const [newMfyId, setNewMfyId] = useState('mfy-1');

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'electricity':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'gas':
        return <Flame className="w-4 h-4 text-red-500" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'road_transport':
        return <Truck className="w-4 h-4 text-[#0a3d8f]" />;
      case 'finance_credit':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'labor_skills':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredIssues = issues.filter((iss) => {
    const matchesSearch =
      iss.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      iss.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || iss.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || iss.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const result = await createIssue({
      title: newTitle,
      description: newDesc,
      category: newCategory,
      priority: newPriority,
      objectId: newObjectId || undefined,
      objectName: objects.find((o) => o.id === newObjectId)?.name,
      mfyId: newMfyId,
      source: 'manual',
      reportedBy: 'Rayon Koordinatorı',
    });

    if (!result.success) return;
    setCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <AlertOctagon className="w-7 h-7 text-red-600" />
            {t.pageIssuesTitle}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {t.pageIssuesSubtitle}
          </p>
        </div>

        <button
          disabled={isSaving}
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.btnReportIssue}</span>
        </button>
      </div>

      {/* Filters Bar in Crisp White */}
      <div className="p-5 rounded-3xl bg-[#081324] border border-blue-900/50 shadow-sm flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mashqala mazmunı yamasa kodi boyınsha izlew..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#0b1b33] border border-blue-900/50 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-300 focus:bg-[#081324]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 text-xs rounded-xl bg-[#0b1b33] border border-blue-900/50 text-slate-200 focus:outline-none focus:border-cyan-300"
        >
          <option value="all">Barlıq kategoriyalar</option>
          <option value="electricity">Elektr energiyası</option>
          <option value="gas">Tábiyiy gaz</option>
          <option value="water">Suw támiynatı</option>
          <option value="road_transport">Jollar hám transport</option>
          <option value="labor_skills">Kásip-óner & Miynet</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3.5 py-2.5 text-xs rounded-xl bg-[#0b1b33] border border-blue-900/50 text-slate-200 focus:outline-none focus:border-cyan-300"
        >
          <option value="all">Barlıq áhmiyet</option>
          <option value="critical">Kritikalıq</option>
          <option value="high">Bálent</option>
          <option value="medium">Orta</option>
        </select>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIssues.map((iss) => {
          const mfy = mfys.find((m) => m.id === iss.mfyId);
          return (
            <div
              key={iss.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between shadow-sm ${
                iss.priority === 'critical'
                  ? 'bg-[#081324] border-red-800/50 hover:border-red-300'
                  : 'bg-[#081324] border-blue-900/50 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#0b1b33] text-slate-200 border border-blue-900/50">
                      {iss.code}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        iss.priority === 'critical'
                          ? 'bg-red-950/40 text-red-400 border border-red-800/50'
                          : iss.priority === 'high'
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-800/50'
                          : 'bg-[#0b1b33] text-slate-200'
                      }`}
                    >
                      {iss.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    {getCategoryIcon(iss.category)}
                    <span className="capitalize">{iss.category}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{iss.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{iss.description}</p>

                <div className="space-y-2 pt-3 text-xs text-slate-400 border-t border-blue-900/40">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {mfy?.name}
                    </span>
                    <span>Tirkelgen: <strong className="text-slate-200">{iss.reportedDate}</strong></span>
                  </div>

                  {iss.objectName && (
                    <button
          disabled={isSaving}
                      onClick={() => openObjectPassport(iss.objectId!)}
                      className="text-xs text-cyan-300 hover:underline flex items-center gap-1.5 font-bold pt-1"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>{iss.objectName} (Pasportti ashıw)</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-blue-900/40 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Status: <strong className="text-slate-200 capitalize">{iss.status}</strong>
                </span>

                <Link
                  href={`/tasks?issueId=${iss.id}`}
                  className="px-4 py-2 rounded-xl bg-cyan-300 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Tapsırma qosıw</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Issue in White/Blue */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#081324] border border-blue-900/50 rounded-3xl w-full max-w-lg p-8 shadow-2xl space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-red-600" />
              Jańa Mashqala Tirkew (FR-04)
            </h2>
            <form onSubmit={handleCreateIssue} className="space-y-4">
              {error && <p role="alert" className="p-3 bg-red-950 text-red-100 rounded-xl">{error}</p>}
              <div>
                <label className="text-xs font-bold text-slate-200">Mashqala mazmunı</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Mısalı: Podstanciya transformatorı quwatı jetispewshiligi"
                  className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#0b1b33] border border-blue-900/50 text-white focus:bg-[#081324] focus:border-cyan-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200">Tolıq túsindirme</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Sebepleri, oqıbatı hám qáwip dárıjasi..."
                  className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#0b1b33] border border-blue-900/50 text-white focus:bg-[#081324] focus:border-cyan-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-200">Kategoriya</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as IssueCategory)}
                    className="w-full mt-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#0b1b33] border border-blue-900/50 text-white"
                  >
                    <option value="electricity">Elektr támiynatı</option>
                    <option value="gas">Gaz támiynatı</option>
                    <option value="water">Suw támiynatı</option>
                    <option value="road_transport">Jollar hám logistika</option>
                    <option value="labor_skills">Miynet hám kadrlar</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200">Áhmiyetliligi</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as IssuePriority)}
                    className="w-full mt-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#0b1b33] border border-blue-900/50 text-white"
                  >
                    <option value="critical">Kritikalıq</option>
                    <option value="high">Bálent</option>
                    <option value="medium">Orta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-200">Baylanıslı Obyekt</label>
                  <select
                    value={newObjectId}
                    onChange={(e) => setNewObjectId(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#0b1b33] border border-blue-900/50 text-white"
                  >
                    <option value="">Obyekt joq</option>
                    {objects.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200">MPJ Aymaǵı</label>
                  <select
                    value={newMfyId}
                    onChange={(e) => setNewMfyId(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#0b1b33] border border-blue-900/50 text-white"
                  >
                    {mfys.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-blue-900/40">
                <button
          disabled={isSaving}
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Biykar etiw
                </button>
                <button
          disabled={isSaving}
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
                >
                  Mashqalanı saqlaw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
