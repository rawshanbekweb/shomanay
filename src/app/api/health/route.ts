import { authorize } from '@/lib/auth';
import { apiError } from '@/lib/api';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    authorize(req);
    const taskCount = await prisma.task.count();
    const issueCount = await prisma.issue.count();
    const objectCount = await prisma.districtObject.count();
    const mfyCount = await prisma.mFY.count();

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      engine: 'Prisma + SQLite',
      dataSummary: {
        tasks: taskCount,
        issues: issueCount,
        objects: objectCount,
        mfys: mfyCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) { return apiError(error); }
}
