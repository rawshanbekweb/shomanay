'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlertOctagon, BarChart3, CheckSquare, ChevronRight, ChevronUp, Database, Factory, FileSpreadsheet, Languages,
  LayoutDashboard, Layers, LogOut, Maximize2, MapPin, Menu, Minimize2, PanelLeft, PanelLeftClose, RefreshCw, Settings,
  TrendingUp, X, Sparkles, ArrowUpRight, BookOpen, Leaf, Users, Store, Landmark,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Language } from '@/types';

const COPY: Record<Language, Record<string, string>> = {
  qq: {
    platform: 'Platforma', overview: 'Ulıwma kórinis', development: 'Rawajlanıw', control: 'Basqarıw', settings: 'Sazlawlar',
    logout: 'Shıǵıw', refresh: 'Maǵlıwmatlardı jańalaw', fullscreen: 'Tolıq ekran', language: 'Til tańlaw', menu: 'Menyu',
    reports: 'Esabatlar', sectors: 'Tarawlar',
    loading: 'Júklenbekte…', saving: 'Saqlanbaqta…', demo: 'Demo', online: 'Ulanǵan', offline: 'Ulanıw joq',
    footer: 'Qaraqalpaqstan Respublikası · Shomanay Rayonı Hákimligi', version: 'Versiya 2.0 (2026)',
  },
  uz: {
    platform: 'Platforma', overview: 'Umumiy ko‘rinish', development: 'Rivojlanish', control: 'Boshqaruv', settings: 'Sozlamalar',
    logout: 'Chiqish', refresh: 'Ma’lumotlarni yangilash', fullscreen: 'To‘liq ekran', language: 'Tilni tanlash', menu: 'Menyu',
    reports: 'Hisobotlar', sectors: 'Sohalar',
    loading: 'Yuklanmoqda…', saving: 'Saqlanmoqda…', demo: 'Demo', online: 'Ulangan', offline: 'Ulanish yo‘q',
    footer: 'Qoraqalpog‘iston Respublikasi · Shumanay tumani hokimligi', version: 'Versiya 2.0 (2026)',
  },
  ru: {
    platform: 'Платформа', overview: 'Общий обзор', development: 'Развитие', control: 'Управление', settings: 'Настройки',
    logout: 'Выйти', refresh: 'Обновить данные', fullscreen: 'Полный экран', language: 'Выбор языка', menu: 'Меню',
    reports: 'Отчёты', sectors: 'Отрасли',
    loading: 'Загрузка…', saving: 'Сохранение…', demo: 'Демо', online: 'Подключено', offline: 'Нет связи',
    footer: 'Республика Каракалпакстан · Хокимият Шуманайского района', version: 'Версия 2.0 (2026)',
  },
};

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'qq', label: 'Qaraqalpaqsha' },
  { code: 'uz', label: 'Oʻzbekcha' },
  { code: 'ru', label: 'Русский' },
];

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string; size?: number }>; badge?: number; count?: number; color?: string };

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage, currentUser, t, tasks, issues, objects, investments, industrialZones, indicators, refreshData, isLoading, isSaving, isBackendConnected, isDemo, error } = useApp();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const copy = COPY[language];

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (langRef.current && !langRef.current.contains(target)) setLangOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(target)) setSettingsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setLangOpen(false); setSettingsOpen(false); setDrawerOpen(false); } };
    document.addEventListener('fullscreenchange', onFullscreen);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreen);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const overdueCount = tasks.filter((task) => task.isOverdue && task.status !== 'accepted' && task.status !== 'cancelled').length;
  const underReviewCount = tasks.filter((task) => task.status === 'under_review').length;
  const criticalIssuesCount = issues.filter((issue) => issue.priority === 'critical' && issue.status !== 'resolved').length;

  const sectorMeta: Record<string, { icon: NavItem['icon']; color: string }> = {
    industry: { icon: Factory, color: '#2bb5d6' },
    investments: { icon: TrendingUp, color: '#e59a45' },
    agriculture: { icon: Leaf, color: '#4bd8a6' },
    employment: { icon: Users, color: '#b88cff' },
    services: { icon: Store, color: '#e0679c' },
    budget: { icon: Landmark, color: '#6b8cff' },
  };
  const sectorItems: NavItem[] = [];
  indicators.forEach((ind) => {
    const key = ind.sectorKey;
    const existing = sectorItems.find((i) => i.href === `/indicators?sector=${key}`);
    if (existing) { existing.count = (existing.count ?? 0) + 1; return; }
    const meta = sectorMeta[key] ?? { icon: Layers, color: '#8b72ff' };
    sectorItems.push({ href: `/indicators?sector=${key}`, label: ind.sectorName[language] || ind.sectorName.qq, icon: meta.icon, color: meta.color, count: 1 });
  });

  const groups: { label?: string; items: NavItem[] }[] = [
    {
      items: [
        { href: '/', label: t.navCabinet, icon: LayoutDashboard },
        { href: '/map', label: t.navMap, icon: MapPin, count: objects.length },
        { href: '/tasks', label: t.navTasks, icon: CheckSquare, badge: overdueCount + underReviewCount },
        { href: '/issues', label: t.navIssues, icon: AlertOctagon, badge: criticalIssuesCount },
        { href: '/indicators', label: t.navIndicators, icon: BookOpen, count: indicators.length },
      ],
    },
    {
      label: copy.sectors,
      items: sectorItems,
    },
    {
      label: copy.development,
      items: [
        { href: '/investments', label: t.navInvestments, icon: TrendingUp, count: investments.length, color: '#4bd8a6' },
        { href: '/industrial-zones', label: t.navZones, icon: Factory, count: industrialZones.length, color: '#e59a45' },
        { href: '/scenarios', label: t.navScenarios, icon: BarChart3, color: '#6b8cff' },
      ],
    },
    {
      label: copy.control,
      items: [
        { href: '/reports', label: t.navReports, icon: FileSpreadsheet },
        { href: '/admin', label: t.navAdmin, icon: Database },
      ],
    },
  ];

  const currentSector = searchParams.get('sector');
  const isActive = (href: string) => {
    if (href.includes('?')) return pathname === '/indicators' && href.endsWith(`sector=${currentSector}`);
    if (href === '/indicators') return pathname === '/indicators' && !currentSector;
    return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  };
  const currentLabel = groups.flatMap((group) => group.items).find((item) => isActive(item.href))?.label ?? copy.overview;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/login');
      router.refresh();
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try { await refreshData(); } finally { setRefreshing(false); }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  }

  const status = isLoading
    ? { tone: 'warn', text: copy.loading }
    : isSaving
      ? { tone: 'warn', text: copy.saving }
      : !isBackendConnected
        ? { tone: 'bad', text: copy.offline }
        : isDemo
          ? { tone: 'warn', text: copy.demo }
          : { tone: 'ok', text: copy.online };

  return (
    <div className="an-workspace">
      {drawerOpen && <div className="an-scrim" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}

      <aside className="an-sidebar" data-collapsed={collapsed} data-open={drawerOpen} aria-label={copy.platform}>
        <div className="an-sidebar-header">
          <Link href="/" className="an-brand" aria-label="Shomanay">
            <span className="an-brand-mark">SH</span>
            <span className="an-brand-text">
              <strong>SHOMANAY</strong>
              <small>{t.districtName}</small>
            </span>
          </Link>
          <button type="button" className="an-icon-button an-collapse-btn hidden lg:grid" onClick={() => setCollapsed(true)} aria-label={copy.menu} title={copy.menu}>
            <PanelLeftClose size={16} />
          </button>
          <button type="button" className="an-icon-button an-mobile-only" onClick={() => setDrawerOpen(false)} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <nav className="an-sidebar-content" aria-label={copy.platform}>
          {groups.map((group, index) => (
            <React.Fragment key={index}>
              {group.label && <p className="an-nav-label">{group.label}</p>}
              <div className="an-nav-group">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      aria-label={item.label}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setDrawerOpen(false)}
                      className={`an-nav-link ${active ? 'is-active' : ''}`}
                      style={item.color ? ({ ['--ic' as string]: item.color }) : undefined}
                    >
                      <Icon size={17} />
                      <span className="an-nav-text">{item.label}</span>
                      {item.count !== undefined && item.count > 0 && !active && <span className="an-nav-count">{item.count}</span>}
                      {item.badge !== undefined && item.badge > 0 && <span className="an-nav-badge">{item.badge}</span>}
                      {active && <span className="an-nav-active-dot" />}
                    </Link>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </nav>

        <div className="sc-nav-footer" ref={settingsRef}>
          {settingsOpen && (
            <div className="an-popover sc-settings-menu" role="menu">
              <div className="sc-settings-user">
                {currentUser.name || '—'}
                {currentUser.role && <><br />{currentUser.role}{currentUser.organization ? ` · ${currentUser.organization}` : ''}</>}
              </div>
              <button type="button" role="menuitem" onClick={handleLogout} disabled={loggingOut}>
                <LogOut size={15} />
                <span>{loggingOut ? '…' : copy.logout}</span>
              </button>
            </div>
          )}
          <button
            type="button"
            className="sc-settings-trigger"
            aria-haspopup="menu"
            aria-expanded={settingsOpen}
            aria-label={copy.settings}
            title={copy.settings}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <Settings size={16} />
            <span>{copy.settings}</span>
            <ChevronUp size={14} className="sc-settings-chevron" />
          </button>
        </div>
      </aside>

      <div className="an-main-scroll" id="app-scroll">
        <header className="an-topbar">
          <div className="an-breadcrumb">
            <button
              type="button"
              className="an-icon-button"
              onClick={() => (window.matchMedia('(min-width: 1024px)').matches ? setCollapsed((value) => !value) : setDrawerOpen(true))}
              aria-label={copy.menu}
              title={copy.menu}
            >
              {collapsed ? <PanelLeft size={16} /> : <Menu size={16} className="lg:hidden" />}
              {!collapsed && <PanelLeftClose size={16} className="hidden lg:block" />}
            </button>
            <span className="hidden sm:inline">{copy.platform}</span>
            <ChevronRight size={14} className="sep hidden sm:block" />
            <strong>{currentLabel}</strong>
          </div>

          <div className="an-top-actions">
            <span className="an-region-label"><i /> {t.districtName}</span>
            <span className="an-chip" data-tone={status.tone} role="status">
              <i />
              <span className="label">{status.text}</span>
            </span>
            <button type="button" className="an-icon-button" onClick={handleRefresh} aria-label={copy.refresh} title={copy.refresh}>
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>

            <div className="relative" ref={langRef}>
              <button
                type="button"
                className="an-language-toggle"
                aria-haspopup="menu"
                aria-expanded={langOpen}
                aria-label={copy.language}
                title={copy.language}
                onClick={() => setLangOpen((open) => !open)}
              >
                <Languages size={15} />
                <span>{language.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="an-popover absolute right-0 top-full mt-2" role="menu">
                  {LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      role="menuitem"
                      aria-current={language === item.code}
                      onClick={() => { setLanguage(item.code); setLangOpen(false); }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" className="an-icon-button hidden sm:grid" onClick={toggleFullscreen} aria-label={copy.fullscreen} title={copy.fullscreen}>
              {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <Link href="/reports" className="an-ai-button">
              <Sparkles size={16} />
              <span>{copy.reports}</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        <main className="an-content" aria-label={currentLabel}>
          {error && !isLoading && (
            <div role="alert" className="sc-error mb-6">
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => void refreshData()} className="sc-text-link">{copy.refresh}</button>
            </div>
          )}
          {children}
        </main>

        <footer className="an-footer">
          <div className="mx-auto flex max-w-[1640px] flex-col items-center justify-between gap-2 sm:flex-row">
            <span>{copy.footer}</span>
            <span>FERGA · Asia/Tashkent · {copy.version}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
