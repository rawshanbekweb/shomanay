import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';
import { apiError } from '@/lib/api';
export async function GET(req: Request) {
  try {
    authorize(req);
    const dataset = await prisma.dataset.findUnique({ where: { key: 'indicators' } });
    return NextResponse.json(dataset ? JSON.parse(dataset.data) : []);
  } catch (error) { return apiError(error); }
}
