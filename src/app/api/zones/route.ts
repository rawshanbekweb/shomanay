import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';
import { apiError } from '@/lib/api';
import { mockIndustrialZones } from '@/lib/mockData';
export async function GET(req: Request) {
  try {
    authorize(req);
    const dataset = await prisma.dataset.findUnique({ where: { key: 'zones' } });
    // Demo rejimida `Dataset` jadvali bo'sh bo'lsa, namunaviy ma'lumot qaytariladi (bazaga yozilmaydi).
    const fallback = process.env.DATA_MODE === 'production' ? [] : mockIndustrialZones;
    return NextResponse.json(dataset ? JSON.parse(dataset.data) : fallback);
  } catch (error) { return apiError(error); }
}
