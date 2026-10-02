'use client';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Language, User, DistrictObject, MFY, Issue, Task, InvestmentProject, IndustrialZone, AuditLogItem, SectorIndicator, TaskEvidence } from '@/types';
import { translations } from '@/lib/i18n';

export type ActionResult = { success: boolean; message: string };
type NewIssue = Omit<Issue, 'id' | 'code' | 'reportedDate' | 'status'>;
type NewTask = Omit<Task, 'id' | 'code' | 'createdDate' | 'status' | 'extensions' | 'isOverdue'>;
interface AppContextType {
  language: Language; setLanguage: (value: Language) => void; t: typeof translations.qq;
  currentUser: User; objects: DistrictObject[]; mfys: MFY[]; issues: Issue[]; tasks: Task[];
  investments: InvestmentProject[]; industrialZones: IndustrialZone[]; indicators: SectorIndicator[]; auditLogs: AuditLogItem[];
  isBackendConnected: boolean; isLoading: boolean; isSaving: boolean; error: string | null; isDemo: boolean;
  refreshData: () => Promise<void>;
  selectedPassportObject: DistrictObject | null; openObjectPassport: (object: DistrictObject | string) => void; closeObjectPassport: () => void;
  createIssue: (issue: NewIssue) => Promise<ActionResult>; createTask: (task: NewTask) => Promise<ActionResult>;
  createObject: (object: NewObject) => Promise<ActionResult>; updateObject: (id: string, patch: ObjectPatch) => Promise<ActionResult>;
  startTask: (id: string) => Promise<ActionResult>;
  submitEvidence: (id: string, evidence: TaskEvidence) => Promise<ActionResult>;
  reviewTask: (id: string, accepted: boolean, notes?: string) => Promise<ActionResult>;
  extendDeadline: (id: string, deadline: string, reason: string) => Promise<ActionResult>;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
export type NewObject = { name: string; type: DistrictObject['type']; mfyId: string; address: string; lat: number; lng: number; responsibleOrg: string; curator: string; status: DistrictObject['status']; description?: string };
export type ObjectPatch = Partial<Pick<DistrictObject, 'status' | 'description' | 'curator' | 'responsibleOrg' | 'address'>>;
export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  // GET so'rovlar Neon "uyqudan" uyg'onayotganda 5xx berishi mumkin — 2 marta qayta uriniladi.
  const isRead = !options?.method || options.method === 'GET';
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`/api/${path}`, { ...options, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...options?.headers } });
    const data = await response.json().catch(() => ({}));
    if (response.ok) return data as T;
    if (isRead && response.status >= 500 && attempt < 2) { await new Promise((r) => setTimeout(r, 1500 * (attempt + 1))); continue; }
    throw new Error(data.error || `So‘rov bajarilmadi (${response.status}).`);
  }
}
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isPublicPage = usePathname().startsWith('/login');
  const [language, setLanguageState] = useState<Language>('qq');
  const [currentUser, setCurrentUser] = useState<User>({ id: '', name: '', title: '', role: 'statistician', organization: '' });
  const [objects, setObjects] = useState<DistrictObject[]>([]);
  const [mfys, setMfys] = useState<MFY[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [investments, setInvestments] = useState<InvestmentProject[]>([]);
  const [industrialZones, setIndustrialZones] = useState<IndustrialZone[]>([]);
  const [indicators, setIndicators] = useState<SectorIndicator[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [selectedPassportObject, setSelectedPassportObject] = useState<DistrictObject | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const session = await apiRequest<{ user: User; demo: boolean }>('session');
      setCurrentUser(session.user); setIsDemo(session.demo);
      const [taskData, issueData, objectData, mfyData, investmentData, indicatorData, zoneData, logs] = await Promise.all([
        apiRequest<Task[]>('tasks'), apiRequest<Issue[]>('issues'), apiRequest<DistrictObject[]>('objects'), apiRequest<MFY[]>('mfys'),
        apiRequest<InvestmentProject[]>('investments'), apiRequest<SectorIndicator[]>('indicators'), apiRequest<IndustrialZone[]>('zones'),
        ['admin', 'hokim', 'statistician'].includes(session.user.role) ? apiRequest<AuditLogItem[]>('audit') : Promise.resolve([]),
      ]);
      setTasks(taskData); setIssues(issueData); setObjects(objectData); setMfys(mfyData);
      setInvestments(investmentData); setIndicators(indicatorData); setIndustrialZones(zoneData); setAuditLogs(logs);
      setIsBackendConnected(true); setError(null);
    } catch (err) {
      setIsBackendConnected(false);
      setError(err instanceof Error ? err.message : 'Serverga ulanib bo‘lmadi.');
    } finally { setIsLoading(false); }
  }, []);
  useEffect(() => {
    // Login sahifasida sessiya yo'q — API'ga so'rov yuborilmaydi.
    if (isPublicPage) return;
    void Promise.resolve().then(refreshData).then(() => {
      try {
        const saved = localStorage.getItem('shm_lang');
        if (saved === 'qq' || saved === 'uz' || saved === 'ru') setLanguageState(saved);
      } catch { /* Storage may be disabled. */ }
    });
  }, [refreshData, isPublicPage]);
  const setLanguage = (value: Language) => {
    setLanguageState(value);
    try { localStorage.setItem('shm_lang', value); } catch { /* Optional preference. */ }
  };
  const mutate = async <T,>(path: string, body: unknown, apply: (result: T) => void, method = 'PATCH'): Promise<ActionResult> => {
    if (saving.current) return { success: false, message: 'Oldingi so‘rov tugashini kuting.' };
    saving.current = true; setIsSaving(true); setError(null);
    try {
      const result = await apiRequest<T>(path, { method, body: JSON.stringify(body) });
      apply(result);
      await refreshData();
      return { success: true, message: 'Saqlandi.' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Saqlanmadi. Qayta urinib ko‘ring.';
      setError(message);
      return { success: false, message };
    } finally { saving.current = false; setIsSaving(false); }
  };
  const updateTask = (id: string, body: unknown) => mutate<Task>(`tasks/${encodeURIComponent(id)}`, body, updated => setTasks(previous => previous.map(task => task.id === id ? updated : task)));
  const createTask = (body: NewTask) => mutate<Task>('tasks', body, task => setTasks(previous => [task, ...previous]), 'POST');
  const createIssue = (body: NewIssue) => mutate<Issue>('issues', body, issue => setIssues(previous => [issue, ...previous]), 'POST');
  const createObject = (body: NewObject) => mutate<DistrictObject>('objects', body, object => setObjects(previous => [object, ...previous]), 'POST');
  const updateObject = (id: string, body: ObjectPatch) => mutate<DistrictObject>(`objects/${encodeURIComponent(id)}`, body, updated => { setObjects(previous => previous.map(object => object.id === id ? updated : object)); setSelectedPassportObject(current => current?.id === id ? updated : current); });
  const openObjectPassport = (object: DistrictObject | string) => setSelectedPassportObject(typeof object === 'string' ? objects.find(item => item.id === object) || null : object);
  return <AppContext.Provider value={{
    language, setLanguage, t: translations[language], currentUser, objects, mfys, issues, tasks, investments, industrialZones, indicators, auditLogs,
    isBackendConnected, isLoading, isSaving, error, isDemo, refreshData, selectedPassportObject, openObjectPassport, closeObjectPassport: () => setSelectedPassportObject(null),
    createTask, createIssue, createObject, updateObject, startTask: id => updateTask(id, { action: 'start' }),
    submitEvidence: (id, evidence) => updateTask(id, { action: 'evidence', evidence }),
    reviewTask: (id, accepted, notes) => updateTask(id, { action: 'review', accepted, notes: notes || 'Tekshiruv yakunlandi.' }),
    extendDeadline: (id, deadline, reason) => updateTask(id, { action: 'extend', deadline, reason }),
  }}>
    {children}
  </AppContext.Provider>;
};
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
