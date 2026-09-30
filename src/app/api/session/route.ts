import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { apiError } from '@/lib/api';
import type { User } from '@/types';

export async function GET(req: Request) {
  try {
    // Proxy tomonidan qo'yilgan X-Auth-* headerlarni tekshirish (cookie session)
    const id = req.headers.get('x-auth-user');
    const role = req.headers.get('x-auth-role') as User['role'] | null;
    const name = req.headers.get('x-auth-name');
    const org = req.headers.get('x-auth-org');

    if (id && role && name && org) {
      const user: User = { id, role, name, title: role, organization: org };
      return NextResponse.json({ user, demo: process.env.DATA_MODE !== 'production' });
    }

    // Fallback: Basic Auth (API mijozlari uchun)
    return NextResponse.json({ user: authorize(req), demo: process.env.DATA_MODE !== 'production' });
  } catch (error) { return apiError(error); }
}
