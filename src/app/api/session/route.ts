import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { apiError } from '@/lib/api';

export async function GET(req: Request) {
  try {
    return NextResponse.json({ user: authorize(req), demo: process.env.DATA_MODE !== 'production' });
  } catch (error) { return apiError(error); }
}
