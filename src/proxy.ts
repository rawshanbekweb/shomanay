import { NextRequest, NextResponse } from 'next/server';
import { authenticateEdge, verifySessionToken, HttpError, SESSION_COOKIE } from '@/lib/edge-auth';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ochiq yo'llar — auth tekshirilmaydi
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 1. Cookie orqali session tekshirish (brauzer foydalanuvchilari)
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    const user = await verifySessionToken(sessionToken);
    if (user) {
      // API route'lar cookie'ni o'zi qayta tekshiradi (src/lib/auth.ts)
      const res = NextResponse.next();
      res.headers.set('Cache-Control', 'private, no-store');
      return res;
    }
    // Token eskirgan — cookie o'chiriladi, login ga redirect
  }

  // 2. Basic Auth tekshirish (API mijozlari uchun)
  const authorization = request.headers.get('authorization') || '';
  if (authorization.startsWith('Basic ')) {
    try {
      await authenticateEdge(request);
      const res = NextResponse.next();
      res.headers.set('Cache-Control', 'private, no-store');
      return res;
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 503;
      // API yo'llari uchun JSON xato qaytariladi
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Login yoki parol noto\'g\'ri.' },
          { status, headers: { 'Cache-Control': 'no-store' } }
        );
      }
    }
  }

  // 3. API so'rovlari — 401 JSON
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Kirish talab qilinadi.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // 4. Sahifalar — /login ga redirect
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  const res = NextResponse.redirect(loginUrl);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|maplibre/).*)'],
};
