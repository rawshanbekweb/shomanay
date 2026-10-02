'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Languages } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Language } from '@/types';

const COPY: Record<Language, { brand: string; title: string; lead: string; login: string; pass: string; show: string; hide: string; submit: string; checking: string; unknown: string; network: string; lang: string }> = {
  qq: { brand: 'Shomanay Rayonı Hákimligi', title: 'Platformaǵa kiriw', lead: 'Maǵlıwmatlar menen jumıs bul jerden baslanadı.', login: 'Login', pass: 'Parol', show: 'Parolni kórsetiw', hide: 'Parolni jasırıw', submit: 'Platformaǵa kiriw', checking: 'Tekserilmekte…', unknown: 'Belgisiz qátelik júz berdi.', network: 'Tarmoq qátesi. Qayta urınıp kóriń.', lang: 'Til tańlaw' },
  uz: { brand: 'Shumanay tumani hokimligi', title: 'Platformaga kirish', lead: 'Ma’lumotlar bilan ishlash shu yerdan boshlanadi.', login: 'Login', pass: 'Parol', show: 'Parolni ko‘rsatish', hide: 'Parolni yashirish', submit: 'Platformaga kirish', checking: 'Tekshirilmoqda…', unknown: 'Noma’lum xatolik yuz berdi.', network: 'Tarmoq xatosi. Qayta urinib ko‘ring.', lang: 'Tilni tanlash' },
  ru: { brand: 'Хокимият Шуманайского района', title: 'Вход в платформу', lead: 'Работа с данными начинается здесь.', login: 'Логин', pass: 'Пароль', show: 'Показать пароль', hide: 'Скрыть пароль', submit: 'Войти в платформу', checking: 'Проверка…', unknown: 'Произошла неизвестная ошибка.', network: 'Ошибка сети. Повторите попытку.', lang: 'Выбор языка' },
};
const LANGS: { code: Language; label: string }[] = [{ code: 'qq', label: 'QQ' }, { code: 'uz', label: 'UZ' }, { code: 'ru', label: 'RU' }];

// Faqat sayt ichidagi yo'llarga qaytariladi (open-redirect'dan himoya).
function safeRedirect(value: string | null): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

// useSearchParams() Suspense boundary ichida bo'lishi shart
function LoginForm() {
  const router = useRouter();
  const { language, setLanguage } = useApp();
  const c = COPY[language];
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { usernameRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (res.ok) {
        router.replace(safeRedirect(params.get('from')));
        router.refresh();
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? c.unknown);
      }
    } catch {
      setError(c.network);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="sc-login-page">
      <section className="sc-login-card">
        <div className="sc-login-tools" role="group" aria-label={c.lang} title={c.lang}>
          <Languages size={15} aria-hidden="true" />
          {LANGS.map((l) => (
            <button key={l.code} type="button" data-active={language === l.code} onClick={() => setLanguage(l.code)}>{l.label}</button>
          ))}
        </div>
        <div className="sc-login-mark" aria-hidden="true">SH</div>
        <div className="sc-login-brand">
          {language === 'ru' ? 'Республика Каракалпакстан' : language === 'uz' ? 'Qoraqalpog‘iston Respublikasi' : 'Qaraqalpaqstan Respublikası'}<br />
          {c.brand}
        </div>
        <h1>{c.title}</h1>
        <p>{c.lead}</p>

        <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
          <label htmlFor="username">
            {c.login}
            <input
              id="username"
              ref={usernameRef}
              name="username"
              autoComplete="username"
              maxLength={50}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label htmlFor="password">
            {c.pass}
            <span className="relative block">
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                maxLength={128}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? c.hide : c.show}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg text-[#8d9ab2] hover:text-white"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>

          {error && (
            <div role="alert" className="sc-error">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button className="sc-button sc-primary" type="submit" disabled={loading || !username.trim() || !password}>
            {loading ? c.checking : `${c.submit} →`}
          </button>
        </form>

        <div className="sc-login-footer">FERGA · SHOMANAY</div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="sc-login-page" />}>
      <LoginForm />
    </Suspense>
  );
}
