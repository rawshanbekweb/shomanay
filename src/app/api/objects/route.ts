import { authorize } from '@/lib/auth';
import { apiError } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { parseObject } from '@/lib/serializers';


export async function GET(req: NextRequest) {
  try {
    authorize(req);
    const { searchParams } = new URL(req.url);
    const mfyId = searchParams.get('mfyId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: Prisma.DistrictObjectWhereInput = {};
    if (mfyId) where.mfyId = mfyId;
    if (type) where.type = type;
    if (status) where.status = status;

    const objects = await prisma.districtObject.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(objects.map(parseObject));
  } catch (error) {
    return apiError(error);
  }
}
