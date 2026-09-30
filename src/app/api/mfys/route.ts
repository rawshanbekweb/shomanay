import { authorize } from '@/lib/auth';
import { apiError } from '@/lib/api';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockMFYs } from '@/lib/mockData';

export async function GET(req: Request) {
  try {
    authorize(req);
    const mfys = await prisma.mFY.findMany();
    // Combine with GeoJSON polygon from mockMFYs
    const result = mfys.map((m) => {
      const match = mockMFYs.find((mock) => mock.id === m.id);
      return {
        ...m,
        centerCoords: [m.centerLat, m.centerLng] as [number, number],
        polygon: match ? match.polygon : [],
      };
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error);
  }
}
