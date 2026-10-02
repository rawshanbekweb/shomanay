import { authorize } from '@/lib/auth';
import { apiError, readBody, objectPatch } from '@/lib/api';
import { audit } from '@/lib/task-service';
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = authorize(req, ['admin', 'hokim', 'coordinator', 'statistician']);
    const { id } = await params;
    const patch = objectPatch.parse(await readBody(req));
    const updated = await prisma.$transaction(async (tx) => {
      const before = await tx.districtObject.findUniqueOrThrow({ where: { id } });
      const object = await tx.districtObject.update({
        where: { id },
        data: { ...patch, description: patch.description ?? undefined, updatedDate: new Date().toISOString().slice(0, 10) },
      });
      await audit(tx, user, 'object', id, object.name, 'update', parseObject(before), parseObject(object));
      return object;
    });
    return NextResponse.json(parseObject(updated));
  } catch (error) {
    return apiError(error);
  }
}
