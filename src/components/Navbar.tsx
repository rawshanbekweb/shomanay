'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Language } from '@/types';
import { Globe, Shield, AlertTriangle, ChevronDown, LayoutDashboard, MapPin, CheckSquare, AlertOctagon, TrendingUp, Factory, BarChart3, Layers, FileSpreadsheet, Database, Menu, X, Landmark, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, currentUser, t, tasks, issues } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/login');
      router.refresh();
    }
  }

  // Counters
  const overdueCount = tasks.filter((t) => t.isOverdue && t.status !== 'accepted' && t.status !== 'cancelled').length;
  const underReviewCount = tasks.filter((t) => t.status === 'under_review').length;
  const criticalIssuesCount = issues.filter((i) => i.priority === 'critical' && i.status !== 'resolved').length;


  const navLinks = [
    { href: '/', label: t.navCabinet, icon: LayoutDashboard },
    { href: '/map', label: t.navMap, icon: MapPin },
    { href: '/tasks', label: t.navTasks, icon: CheckSquare, badge: overdueCount + underReviewCount },
    { href: '/issues', label: t.navIssues, icon: AlertOctagon, badge: criticalIssuesCount },
    { href: '/investments', label: t.navInvestments, icon: TrendingUp },
    { href: '/industrial-zones', label: t.navZones, icon: Factory },
    { href: '/scenarios', label: t.navScenarios, icon: BarChart3 },
    { href: '/indicators', label: t.navIndicators, icon: Layers },
    { href: '/reports', label: t.navReports, icon: FileSpreadsheet },
    { href: '/admin', label: t.navAdmin, icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* Top Official State Header Bar */}
      <div className="bg-[#040914] text-white border-b border-blue-900/40">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <Landmark className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <span className="text-blue-100 hidden sm:inline">{t.republic}</span>
            <span className="opacity-40 hidden sm:inline">·</span>
            <span className="text-amber-300 font-semibold">{t.districtName} Hákimligi</span>
            <span className="opacity-40">·</span>
            <span className="text-cyan-300 font-mono">FERGA 2.0</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
              <span>Baza: Ulandı (Prisma + SQLite)</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-slate-400 font-mono">
              {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} (UTC+5)
            </span>
            {overdueCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600/90 text-white font-bold flex items-center gap-1 animate-pulse text-[10px] border border-red-500/50">
                <AlertTriangle className="w-3 h-3" />
                {overdueCount} múddeti ótken!
              </span>
            )}
            {underReviewCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center gap-1 text-[10px]">
                <CheckSquare className="w-3 h-3" />
                {underReviewCount} tekseriwde
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="bg-[#071120] border-b border-slate-800/80">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#0a3d8f] flex items-center justify-center text-white font-extrabold text-sm shadow border border-cyan-400/40 group-hover:bg-blue-800 transition-colors">
              SH
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-black text-white tracking-tight uppercase leading-tight group-hover:text-cyan-300 transition-colors">
                SHOMANAY
              </div>
              <div className="text-[10px] text-cyan-400/80 font-medium leading-tight">
                Operativ Basqarıw
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1.5">
            {navLinks.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-950/80 text-cyan-300 border border-blue-500/50 shadow-inner font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 text-[9px] font-extrabold rounded-full bg-red-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* More dropdown */}
            <div className="relative group">
              <button className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center gap-1 whitespace-nowrap">
                <span>Ko&apos;proq</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block w-52 shadow-2xl rounded-xl bg-[#09152a] border border-blue-900/60 p-1.5 z-50">
                {navLinks.slice(5).map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-lg text-xs flex items-center gap-2.5 transition-colors ${
                        isActive
                          ? 'bg-blue-950 text-cyan-300 font-bold border border-blue-800/60'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Right Tools: Role, Logout & Language Selector */}
          <div className="flex items-center gap-2">
            {currentUser.id ? (
              <div className="flex items-center gap-1.5">
                <div className="text-xs text-slate-200 flex items-center gap-2" title={currentUser.organization}>
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentUser.name}</span>
                  <span className="text-slate-400">({currentUser.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  title="Chiqish"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-900/50 hover:border-red-700/60 text-red-400 hover:text-red-300 transition-all text-[11px] disabled:opacity-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{loggingOut ? '...' : 'Chiqish'}</span>
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <div className="w-3 h-3 border border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                Yuklanmoqda...
              </div>
            )}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0a1830] hover:bg-[#0e2242] border border-blue-900/60 text-[11px] font-bold text-slate-200 uppercase transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 p-1.5 rounded-xl bg-[#09152a] border border-blue-900/60 shadow-2xl z-50">
                  {[
                    { code: 'qq', label: 'Qaraqalpaqsha' },
                    { code: 'uz', label: "O'zbekcha" },
                    { code: 'ru', label: 'Русский' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as Language);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                        language === lang.code ? 'bg-blue-950 text-cyan-300 font-bold border border-blue-800/60' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden p-4 border-b border-blue-900/60 bg-[#09152a] shadow-xl space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-[#0a3d8f] text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-600 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
