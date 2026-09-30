import { authorize } from '@/lib/auth';
import { apiError } from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { parseObject } from '@/lib/serializers';


export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    authorize(_req);
    const { id } = await params;
    const object = await prisma.districtObject.findUnique({ where: { id } });
    if (!object) {
      return NextResponse.json({ error: 'Object not found' }, { status: 404 });
    }
    return NextResponse.json(parseObject(object));
  } catch (error) {
    return apiError(error);
  }
}
