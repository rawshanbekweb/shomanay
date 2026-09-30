import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authorize, HttpError } from '@/lib/auth';
import { apiError, readBody } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/task-service';
const text = z.string().trim().min(1).max(1000);
const schema = z.array(z.object({
  id: text, name: text, mfyId: text, address: text, responsibleOrg: text,
  type: z.enum(['enterprise', 'investment_project', 'industrial_zone', 'infrastructure', 'social']),
  coordsLat: z.coerce.number().min(-90).max(90), coordsLng: z.coerce.number().min(-180).max(180),
  description: z.string().max(5000).default(''), curator: z.string().max(1000).default(''),
  status: z.enum(['active', 'in_progress', 'planned', 'paused', 'risk']).default('active'),
}).strict()).min(1).max(500);
export async function POST(req: Request) {
  try {
    const user = authorize(req, ['admin', 'statistician']);
    const rows = schema.parse(await readBody(req));
    if (new Set(rows.map(row => row.id)).size !== rows.length) throw new HttpError(400, 'Faylda ID takrorlangan.');
    await prisma.$transaction(async tx => {
      const mfys = await tx.mFY.findMany({ select: { id: true } });
      if (rows.some(row => !mfys.some(mfy => mfy.id === row.mfyId))) throw new HttpError(400, 'Fayldagi MFY bazada mavjud emas.');
      for (const row of rows) {
        const previous = await tx.districtObject.findUnique({ where: { id: row.id } });
        const data = { ...row, source: 'CSV', updatedDate: new Date().toISOString() };
        const updated = await tx.districtObject.upsert({ where: { id: row.id }, create: data, update: data });
        await audit(tx, user, 'object', row.id, row.name, 'import', previous, updated);
      }
    }, { timeout: 30000 });
    return NextResponse.json({ imported: rows.length });
  } catch (error) { return apiError(error); }
}
