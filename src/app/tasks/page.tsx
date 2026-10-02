'use client';
import Image from 'next/image';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Task, IssuePriority } from '@/types';
import { CheckSquare, Clock, AlertTriangle, PlusCircle, Upload, Calendar, User, ShieldCheck, Building2, Search } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TasksPage() {
  const {
    tasks,
    currentUser,
    isSaving,
    error,
    t,
    startTask,
    submitEvidence,
    reviewTask,
    extendDeadline,
    createTask,
    objects,
    mfys,
    openObjectPassport,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [evidenceModalTask, setEvidenceModalTask] = useState<Task | null>(null);
  const [reviewModalTask, setReviewModalTask] = useState<Task | null>(null);
  const [extendModalTask, setExtendModalTask] = useState<Task | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskExecutor, setNewTaskExecutor] = useState('Rayon Elektr Tarmaqları Kárxanası');
  const [newTaskInspector, setNewTaskInspector] = useState('Ǵárezsiz Tekseriw & Monitorinq Inspeksiyası');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskPriority] = useState<IssuePriority>('high');
  const [newTaskObjectId, setNewTaskObjectId] = useState('');
  const [newTaskMfyId, setNewTaskMfyId] = useState('');
  const [newTaskExpected] = useState('');
  const [newTaskMethod] = useState('');

  // Evidence submission state
  const [evidenceComment, setEvidenceComment] = useState('');
  const [evidenceNumeric, setEvidenceNumeric] = useState('');
  const [evidenceUnit, setEvidenceUnit] = useState('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('');
  const [evidenceDocName, setEvidenceDocName] = useState('');

  // Review state
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAlert, setReviewAlert] = useState<string | null>(null);

  // Extend deadline state
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [extendReason, setExtendReason] = useState('');

  // Filtering
  const filteredTasks = tasks.filter((tsk) => {
    const matchesSearch =
      tsk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tsk.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tsk.mainExecutorOrg.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tsk.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || tsk.priority === priorityFilter;
    const matchesOverdue = !showOverdueOnly || tsk.isOverdue;

    return matchesSearch && matchesStatus && matchesPriority && matchesOverdue;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const result = await createTask({
      title: newTaskTitle,
      actionDescription: newTaskDesc,
      mainExecutorOrg: newTaskExecutor,
      executorPerson: 'Mas\'ul muhandis',
      inspectorOrg: newTaskInspector,
      inspectorPerson: 'M. Torebaev',
      priority: newTaskPriority,
      deadline: newTaskDeadline + ':00+05:00',
      expectedResult: newTaskExpected || 'Natija dalolatnomasi',
      verificationMethod: newTaskMethod || 'Joyida ko\'zdan kechirish va foto fiksatsiya',
      objectId: newTaskObjectId || undefined,
      objectName: objects.find((o) => o.id === newTaskObjectId)?.name,
      mfyId: objects.find(object => object.id === newTaskObjectId)?.mfyId || newTaskMfyId,
    });

    if (!result.success) return;
    setCreateModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceModalTask) return;

    const result = await submitEvidence(evidenceModalTask.id, {
      submittedAt: new Date().toISOString(),
      submittedBy: `${currentUser.name} (${currentUser.title})`,
      comment: evidenceComment || 'Jumıslar tolıq orınlandı, dálil hújjetleri biriktirildi.',
      numericResult: evidenceNumeric ? parseFloat(evidenceNumeric) : undefined,
      unit: evidenceUnit,
      photos: evidencePhotoUrl ? [evidencePhotoUrl] : [],
      documents: evidenceDocName ? [{ name: evidenceDocName, size: '—', type: 'PDF' }] : [],
    });

    if (!result.success) return;
    setEvidenceModalTask(null);
    setEvidenceComment('');
  };

  const handleReviewAction = async (accepted: boolean) => {
    if (!reviewModalTask) return;

    const res = await reviewTask(reviewModalTask.id, accepted, reviewNotes);
    if (!res.success) {
      setReviewAlert(res.message);
    } else {
      if (accepted) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      setReviewModalTask(null);
      setReviewNotes('');
      setReviewAlert(null);
    }
  };

  const handleExtendDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendModalTask || !newDeadlineDate) return;

    const result = await extendDeadline(extendModalTask.id, newDeadlineDate + ':00+05:00', extendReason);
    if (!result.success) return;
    setExtendModalTask(null);
    setNewDeadlineDate('');
    setExtendReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white flex items-center gap-2.5">
              <CheckSquare className="w-7 h-7 text-violet-300" />
              {t.pageTasksTitle}
            </h1>
            <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 font-bold border border-white/10">
              {tasks.length} {t.tabAllTasks}
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {t.pageTasksSubtitle}
          </p>
        </div>

        <button
                disabled={isSaving || !['admin', 'hokim', 'coordinator'].includes(currentUser.role)}
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#6d57d6] hover:bg-[#7a63e6] text-white text-xs font-bold shadow-md shadow-violet-900/10 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.btnCreateTask}</span>
        </button>
      </div>

      {/* Filters bar in Crisp White */}
      <div className="p-5 rounded-3xl bg-[#111620] border border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchTaskPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-violet-300 focus:bg-[#111620] transition-all"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-slate-200 focus:outline-none focus:border-violet-300"
          >
            <option value="all">Barlıq statuslar</option>
            <option value="assigned">Tapsırıldı (Assigned)</option>
            <option value="in_progress">Jarayonda (In Progress)</option>
            <option value="under_review">Tekseriwde (Under Review)</option>
            <option value="accepted">Qabıl etildi (Accepted)</option>
            <option value="returned_for_revision">Qayta islewge (Revision)</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3.5 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-slate-200 focus:outline-none focus:border-violet-300"
          >
            <option value="all">Barlıq áhmiyet</option>
            <option value="critical">Kritikalıq</option>
            <option value="high">Bálent</option>
            <option value="medium">Orta</option>
            <option value="low">Tómen</option>
          </select>
        </div>

        {/* Overdue checkbox */}
        <label className="flex items-center space-x-2 text-xs text-red-600 font-bold cursor-pointer">
          <input
            type="checkbox"
            checked={showOverdueOnly}
            onChange={(e) => setShowOverdueOnly(e.target.checked)}
            className="rounded border-slate-300 text-red-600 focus:ring-0 w-4 h-4"
          />
          <span>Faqat múddeti ótkenler</span>
        </label>
      </div>

      {/* Tasks Cards List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#111620] border border-white/10 text-slate-400 text-sm">
            Tapsırma tabılmadı.
          </div>
        ) : (
          filteredTasks.map((tsk) => {
            const isOverdue = tsk.isOverdue;
            return (
              <div
                key={tsk.id}
                className={`p-6 rounded-3xl border transition-all ${
                  isOverdue
                    ? 'bg-[#111620] border-red-300 shadow-md'
                    : tsk.status === 'under_review'
                    ? 'bg-[#111620] border-amber-300 shadow-md'
                    : tsk.status === 'accepted'
                    ? 'bg-[#111620] border-emerald-800/50 shadow-sm'
                    : 'bg-[#111620] border-white/10 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-md bg-[#151a26] text-slate-200 border border-white/10">
                        {tsk.code}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                          tsk.status === 'accepted'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/50'
                            : tsk.status === 'under_review'
                            ? 'bg-amber-950/40 text-amber-400 border border-amber-800/50'
                            : tsk.status === 'returned_for_revision'
                            ? 'bg-red-950/40 text-red-400 border border-red-800/50'
                            : 'bg-violet-500/10 text-violet-300 border border-white/10'
                        }`}
                      >
                        {tsk.status}
                      </span>

                      {isOverdue && (
                        <span className="text-xs px-3 py-1 rounded-full bg-red-950/40 text-red-400 font-bold border border-red-800/50 animate-pulse flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          MÚDDETI ÓTKEN (Asia/Tashkent)
                        </span>
                      )}

                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                          tsk.priority === 'critical'
                            ? 'bg-red-950/40 text-red-400 border border-red-800/50'
                            : tsk.priority === 'high'
                            ? 'bg-amber-950/40 text-amber-400 border border-amber-800/50'
                            : 'bg-[#151a26] text-slate-200'
                        }`}
                      >
                        {tsk.priority.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">{tsk.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{tsk.actionDescription}</p>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-violet-300" />
                        <span>Orynlawshı: <strong className="text-slate-200">{tsk.mainExecutorOrg}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Tekseriwshi: <strong className="text-slate-200">{tsk.inspectorOrg}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Múddet: <strong className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-200'}>
                          {new Date(tsk.deadline).toLocaleDateString()} {new Date(tsk.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </strong></span>
                      </div>

                      {tsk.objectName && (
                        <button
                disabled={isSaving}
                          onClick={() => openObjectPassport(tsk.objectId!)}
                          className="flex items-center gap-1.5 text-violet-300 hover:underline font-semibold"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>{tsk.objectName}</span>
                        </button>
                      )}
                    </div>

                    {/* Evidence & Review Notes preview */}
                    {tsk.evidence && (
                      <div className="mt-3 p-4 rounded-2xl bg-[#151a26] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="text-slate-200 font-bold flex items-center gap-2">
                            <Upload className="w-4 h-4 text-emerald-600" />
                            Dálil tapsırılǵan: {tsk.evidence.comment}
                          </div>
                          {tsk.evidence.numericResult !== undefined && (
                            <div className="text-slate-300">
                              Faktik nátiyje: <strong className="text-white">{tsk.evidence.numericResult} {tsk.evidence.unit}</strong>
                            </div>
                          )}
                        </div>

                        {tsk.evidence.photos.length > 0 && (
                          <div className="flex items-center gap-2.5">
                            <Image unoptimized width={800} height={600}
                              src={tsk.evidence.photos[0]}
                              alt="Dalil"
                              className="w-14 h-11 rounded-xl object-cover border border-white/10 shadow-xs"
                            />
                            <span className="text-[11px] text-slate-400 font-medium">({tsk.evidence.documents[0]?.name || 'Hújjet'})</span>
                          </div>
                        )}
                      </div>
                    )}

                    {tsk.review && (
                      <div className={`p-3.5 rounded-2xl text-xs border ${
                        tsk.review.accepted ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400' : 'bg-red-950/40 border-red-800/50 text-red-400'
                      }`}>
                        <strong>Tekseriwshi xulosasi ({tsk.review.reviewedBy}):</strong> {tsk.review.inspectorNotes || tsk.review.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions Column in State Blue */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
                    {tsk.status === 'assigned' && currentUser.role === 'organization' && currentUser.organization === tsk.mainExecutorOrg && (
                      <button
                disabled={isSaving}
                        onClick={() => startTask(tsk.id)}
                        className="px-4 py-2 rounded-xl bg-[#6d57d6] hover:bg-[#7a63e6] text-white text-xs font-bold shadow-sm transition-colors"
                      >
                        Jumıstı baslaw (In Progress)
                      </button>
                    )}

                    {(tsk.status === 'in_progress' || tsk.status === 'returned_for_revision') && currentUser.role === 'organization' && currentUser.organization === tsk.mainExecutorOrg && (
                      <button
                disabled={isSaving}
                        onClick={() => setEvidenceModalTask(tsk)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Dálil tapsırıw</span>
                      </button>
                    )}

                    {tsk.status === 'under_review' && currentUser.role === 'inspector' && currentUser.organization === tsk.inspectorOrg && (
                      <button
                disabled={isSaving}
                        onClick={() => {
                          setReviewModalTask(tsk);
                          setReviewAlert(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Tekseriw & Qabıllaw</span>
                      </button>
                    )}

                    {!['accepted', 'cancelled'].includes(tsk.status) && ['admin', 'hokim', 'coordinator'].includes(currentUser.role) && (
                      <button
                disabled={isSaving}
                        onClick={() => setExtendModalTask(tsk)}
                        className="px-4 py-2 rounded-xl bg-[#151a26] hover:bg-[#1a1f2c]/60 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
                      >
                        Múddetti uzaytıw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Task */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111620]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#111620] border border-white/10 rounded-3xl w-full max-w-xl p-8 shadow-2xl space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-violet-300" />
              Jańa Tapsırma Belgilew (FR-05)
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              {error && <p role="alert" className="p-3 bg-red-950 text-red-100 rounded-xl">{error}</p>}
              <label className="block text-xs font-bold text-slate-200">MFY
                <select required aria-label="Topshiriq MFY" value={objects.find(object => object.id === newTaskObjectId)?.mfyId || newTaskMfyId} disabled={Boolean(newTaskObjectId)} onChange={e => setNewTaskMfyId(e.target.value)} className="block w-full p-3 mt-1 bg-[#111620] border border-white/10 rounded-xl">
                  <option value="">MFYni tanlang</option>{mfys.map(mfy => <option key={mfy.id} value={mfy.id}>{mfy.name}</option>)}
                </select>
              </label>
              <div>
                <label className="text-xs font-bold text-slate-200">Tapsırma mazmunı / Atı</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Mısalı: Diyxanabad issıqxanasına jańa gaz liniyasın tartıw"
                  className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white focus:bg-[#111620] focus:border-violet-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200">Anıq háreket túsindirmesi</label>
                <textarea
                  rows={2}
                  required
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Kerekli texnika, materiallar hám orınlaw boyınsha talaplar..."
                  className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white focus:bg-[#111620] focus:border-violet-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-200">Tiykarǵı Orynlawshı Shólkem</label>
                  <input required aria-label="newTaskExecutor" value={newTaskExecutor} onChange={e => setNewTaskExecutor(e.target.value)} className="w-full mt-1 p-3 text-xs rounded-xl bg-[#111620] border border-white/10" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200">Ǵárezsiz Tekseriwshi</label>
                  <input required aria-label="newTaskInspector" value={newTaskInspector} onChange={e => setNewTaskInspector(e.target.value)} className="w-full mt-1 p-3 text-xs rounded-xl bg-[#111620] border border-white/10" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-200">Múddet (Asia/Tashkent)</label>
                  <input
                    type="datetime-local"
                    required
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-200">Baylanıslı Obyekt</label>
                  <select
                    value={newTaskObjectId}
                    onChange={(e) => setNewTaskObjectId(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white"
                  >
                    <option value="">Obyekt biriktirilmesin</option>
                    {objects.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
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
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#6d57d6] hover:bg-[#7a63e6] rounded-xl shadow-sm"
                >
                  Tapsırma qosıw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Evidence */}
      {evidenceModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111620]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#111620] border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Upload className="w-6 h-6 text-amber-600" />
              Orınlanǵanlıq Dálilin Tapsırıw (FR-07)
            </h2>
            <p className="text-xs text-slate-400">
              Tapsırma: <strong className="text-slate-200">{evidenceModalTask.title}</strong>
            </p>

            <form onSubmit={handleSubmitEvidence} className="space-y-4">
              {error && <p role="alert" className="p-3 bg-red-950 text-red-100 rounded-xl">{error}</p>}
              <div>
                <label className="text-xs font-bold text-slate-200">Orınlaw esabatı / Izoh</label>
                <textarea
                  rows={2}
                  required
                  value={evidenceComment}
                  onChange={(e) => setEvidenceComment(e.target.value)}
                  placeholder="Qanday jumıslar pitkerildi, qashan sınaqtan ótti..."
                  className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white focus:bg-[#111620]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-200">Sanlıq nátiyje (fakt)</label>
                  <input
                    type="number"
                    step="any"
                    value={evidenceNumeric}
                    onChange={(e) => setEvidenceNumeric(e.target.value)}
                    placeholder="Mısalı: 2.2"
                    className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-200">Ólshem birligi</label>
                  <input
                    type="text"
                    value={evidenceUnit}
                    onChange={(e) => setEvidenceUnit(e.target.value)}
                    placeholder="atm, MWt, km..."
                    className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200">Foto dálil (URL)</label>
                <input
                  type="text"
                  value={evidencePhotoUrl}
                  onChange={(e) => setEvidencePhotoUrl(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200">Hujjat nomi (ixtiyoriy)</label>
                <p id="document-note" className="text-xs text-slate-400">Fayl yuklanmaydi; faqat hujjat nomi qayd etiladi.</p>
                <input
                  type="text"
                  aria-describedby="document-note"
                  value={evidenceDocName}
                  onChange={(e) => setEvidenceDocName(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                disabled={isSaving}
                  type="button"
                  onClick={() => setEvidenceModalTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Biykar etiw
                </button>
                <button
                disabled={isSaving}
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
                >
                  Dálillerdi tekseriwge jiberiw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review & Accept Task */}
      {reviewModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111620]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#111620] border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              Ǵárezsiz Tekseriw & Qabıllaw (FR-05, FR-07)
            </h2>
            <p className="text-xs text-slate-300">
              Tapsırma: <strong className="text-white">{reviewModalTask.title}</strong>
            </p>

            {reviewAlert && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-400 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div>{reviewAlert}</div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#151a26] border border-white/10 text-xs space-y-1.5">
              <div className="text-slate-300">
                Házirgi avtorizaciyadan ótken paydalanıwshı: <strong className="text-white">{currentUser.name}</strong> ({currentUser.title})
              </div>
              <div className="text-slate-300">
                Talap etiletuǵın tekseriwshi: <strong className="text-white">{reviewModalTask.inspectorOrg}</strong>
              </div>
              {currentUser.role === 'organization' && (
                <div className="text-red-600 font-bold pt-1">
                  ⚠️ Diqqat: Siz orınlawshı rolindesiz. Orynlawshı óz tapsırmasın ózi qabıl ete almaydı!
                  Joqarıdaǵı menyudan roldi <strong>«Ǵárezsiz Tekseriwshi»</strong> yamasa <strong>«Rayon Hákimi»</strong>ge almastırıń.
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200">Tekseriwshi xulosasi / Eskertpeler</label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Dálil boyınsha dálalatnama tekserildi, obyekttegi gaz/elektr parametrleri sáykes..."
                className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white focus:bg-[#111620]"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                disabled={isSaving}
                type="button"
                onClick={() => setReviewModalTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Jabıw
              </button>
              <div className="flex items-center gap-3">
                <button
                disabled={isSaving}
                  type="button"
                  onClick={() => handleReviewAction(false)}
                  className="px-4 py-2.5 text-xs font-bold text-red-400 bg-red-950/40 hover:bg-red-100 border border-red-800/50 rounded-xl"
                >
                  Qayta islewge qaytarıw
                </button>
                <button
                disabled={isSaving}
                  type="button"
                  onClick={() => handleReviewAction(true)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-700/20"
                >
                  Tapsırmanı Qabıl etiw (Accept)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Extend Deadline */}
      {extendModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111620]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#111620] border border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-violet-300" />
              Múddetti Uzaytıw (FR-06)
            </h2>
            <p className="text-xs text-slate-300">
              Aldınǵı múddet: <strong className="text-white">{new Date(extendModalTask.deadline).toLocaleDateString()}</strong>
            </p>

            <form onSubmit={handleExtendDeadline} className="space-y-4">
              {error && <p role="alert" className="p-3 bg-red-950 text-red-100 rounded-xl">{error}</p>}
              <div>
                <label className="text-xs font-bold text-slate-200">Jańa múddet</label>
                <input
                  type="datetime-local"
                  required
                  value={newDeadlineDate}
                  onChange={(e) => setNewDeadlineDate(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200">Uzaytıw sebebi (Auditke jazıladı)</label>
                <textarea
                  rows={2}
                  required
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  placeholder="Kabel materialları jetkerip beriliwi keshikkenligi sebepli..."
                  className="w-full mt-1 px-4 py-2.5 text-xs rounded-xl bg-[#151a26] border border-white/10 text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                disabled={isSaving}
                  type="button"
                  onClick={() => setExtendModalTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Biykar etiw
                </button>
                <button
                disabled={isSaving}
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#6d57d6] hover:bg-[#7a63e6] rounded-xl"
                >
                  Múddetti saqlaw
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
