import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authorize, HttpError } from '@/lib/auth';
import { apiError, readBody } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/task-service';
import { mergeIndicatorRows } from '@/lib/indicator-import';
import { mockIndicators } from '@/lib/mockData';
import type { SectorIndicator } from '@/types';
const text = z.string().trim().min(1).max(1000);
const schema = z.array(z.object({
  id: text, name: text, mfyId: text, address: text, responsibleOrg: text,
  type: z.enum(['enterprise', 'investment_project', 'industrial_zone', 'infrastructure', 'social']),
  coordsLat: z.coerce.number().min(-90).max(90), coordsLng: z.coerce.number().min(-180).max(180),
  description: z.string().max(5000).default(''), curator: z.string().max(1000).default(''),
  status: z.enum(['active', 'in_progress', 'planned', 'paused', 'risk']).default('active'),
}).strict()).min(1).max(500);
async function importIndicators(req: Request) {
  const user = authorize(req, ['admin', 'statistician']);
  const body = await readBody(req);
  const rows = z.array(z.record(z.string(), z.string())).min(1).max(500).parse(body);
  const result = await prisma.$transaction(async tx => {
    const stored = await tx.dataset.findUnique({ where: { key: 'indicators' } });
    const base: SectorIndicator[] = stored ? JSON.parse(stored.data) : (process.env.DATA_MODE === 'production' ? [] : mockIndicators);
    const outcome = mergeIndicatorRows(rows, base, user.name);
    if (outcome.accepted === 0) return outcome;
    const data = JSON.stringify(outcome.indicators);
    await tx.dataset.upsert({ where: { key: 'indicators' }, create: { key: 'indicators', data }, update: { data } });
    // Versiyalaw: hár importtan aldın saqlanǵan nusqa (sońǵı 10)
    const history = await tx.dataset.findUnique({ where: { key: 'indicators:history' } });
    const versions: unknown[] = history ? JSON.parse(history.data) : [];
    versions.unshift({ at: new Date().toISOString(), by: user.name, accepted: outcome.accepted, snapshot: base });
    const hdata = JSON.stringify(versions.slice(0, 10));
    await tx.dataset.upsert({ where: { key: 'indicators:history' }, create: { key: 'indicators:history', data: hdata }, update: { data: hdata } });
    await audit(tx, user, 'indicator', 'indicators', 'Statistika kórsetkishleri', 'import', { count: base.length }, { count: outcome.indicators.length, accepted: outcome.accepted, issues: outcome.issues.length });
    return outcome;
  }, { timeout: 30000 });
  const { indicators, ...summary } = result;
  void indicators;
  if (summary.accepted === 0) return NextResponse.json({ error: 'Birde-bir durıs qatar tabılmadı.', ...summary }, { status: 400 });
  return NextResponse.json(summary);
}
export async function POST(req: Request) {
  try {
    if (new URL(req.url).searchParams.get('kind') === 'indicators') return await importIndicators(req);
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
