import { authorize } from '@/lib/auth';
import { apiError, readBody, objectInput } from '@/lib/api';
import { audit } from '@/lib/task-service';
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

export async function POST(req: NextRequest) {
  try {
    const user = authorize(req, ['admin', 'hokim', 'coordinator', 'statistician']);
    const { lat, lng, description, ...body } = objectInput.parse(await readBody(req));
    const created = await prisma.$transaction(async (tx) => {
      await tx.mFY.findUniqueOrThrow({ where: { id: body.mfyId } });
      const object = await tx.districtObject.create({
        data: {
          ...body, id: `obj-${crypto.randomUUID().slice(0, 8)}`, coordsLat: lat, coordsLng: lng,
          description: description ?? '', source: 'manual', updatedDate: new Date().toISOString().slice(0, 10),
        },
      });
      await audit(tx, user, 'object', object.id, object.name, 'create', null, parseObject(object));
      return object;
    });
    return NextResponse.json(parseObject(created), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
