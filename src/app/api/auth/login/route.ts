import { NextResponse } from 'next/server';
import { verifyCredentials, createSessionToken, SESSION_COOKIE } from '@/lib/edge-auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json() as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json({ error: 'Login va parol kiritilishi shart.' }, { status: 400 });
    }

    const user = await verifyCredentials(username.trim(), password);
    if (!user) {
      // Timing attack dan himoya: qisqa kutish
      await new Promise(r => setTimeout(r, 300));
      return NextResponse.json({ error: 'Login yoki parol noto\'g\'ri.' }, { status: 401 });
    }

    const token = await createSessionToken(user);
    const response = NextResponse.json({ ok: true, user: { name: user.name, role: user.role } });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 soat
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'So\'rov noto\'g\'ri formatda.' }, { status: 400 });
  }
}
