import { NextResponse } from 'next/server';
import { authorize } from '@/lib/auth';
import { apiError } from '@/lib/api';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request) {
  try {
    authorize(req, ['admin', 'hokim', 'statistician']);
    const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 200 });
    return NextResponse.json(logs.map(log => ({ ...JSON.parse(log.data), id: log.id, timestamp: log.timestamp.toISOString() })));
  } catch (error) { return apiError(error); }
}
