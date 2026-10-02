import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { HttpError } from './auth';

export function apiError(error: unknown) {
  if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof z.ZodError || error instanceof SyntaxError) return NextResponse.json({ error: 'Kiritilgan ma’lumot noto‘g‘ri.' }, { status: 400 });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Yozuv topilmadi.' }, { status: 404 });
    if (error.code === 'P2002') return NextResponse.json({ error: 'Bunday yozuv mavjud.' }, { status: 409 });
  }
  console.error('API request failed:', error);
  return NextResponse.json({ error: 'Server ma’lumotni saqlay olmadi. Qayta urinib ko‘ring.' }, { status: 500 });
}

export async function readBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (Buffer.byteLength(text) > 100_000) throw new HttpError(413, 'So‘rov juda katta.');
  return JSON.parse(text);
}

const text = z.string().trim().min(1).max(5000);
const optionalText = z.string().trim().max(5000).optional();
export const priority = z.enum(['low', 'medium', 'high', 'critical']);
export const date = z.string().refine(value => Number.isFinite(Date.parse(value)), 'Invalid date');
export const issueInput = z.object({
  title: text, description: text, category: z.enum(['electricity', 'gas', 'water', 'road_transport', 'finance_credit', 'land_permit', 'labor_skills', 'equipment']),
  priority, mfyId: text, objectId: optionalText, objectName: optionalText,
  source: z.enum(['manual', 'auto_rule', 'statistic_alert', 'citizen_appeal']).default('manual'),
  relatedIndicator: optionalText, evidenceNotes: optionalText,
});
export const taskInput = z.object({
  title: text, actionDescription: text, mainExecutorOrg: text, executorPerson: text,
  inspectorOrg: text, inspectorPerson: text, deadline: date, expectedResult: text,
  verificationMethod: text, priority, mfyId: text, issueId: optionalText, objectId: optionalText, objectName: optionalText,
});
export const taskAction = z.discriminatedUnion('action', [
  z.object({ action: z.literal('start') }),
  z.object({ action: z.literal('evidence'), evidence: z.object({
    comment: text, numericResult: z.number().finite().optional(), unit: optionalText,
    photos: z.array(z.url().refine(url => url.startsWith('https://'))).max(20),
    documents: z.array(z.object({ name: text, size: text, type: text })).max(20),
  }) }),
  z.object({ action: z.literal('review'), accepted: z.boolean(), notes: text }),
  z.object({ action: z.literal('extend'), deadline: date, reason: text }),
]);

export const objectType = z.enum(['enterprise', 'investment_project', 'industrial_zone', 'infrastructure', 'social']);
export const objectStatus = z.enum(['active', 'in_progress', 'planned', 'paused', 'risk']);
export const objectInput = z.object({
  name: text, type: objectType, mfyId: text, address: text,
  lat: z.number().min(40).max(46), lng: z.number().min(55).max(63),
  responsibleOrg: text, curator: text, status: objectStatus, description: optionalText,
});
export const objectPatch = z.object({
  status: objectStatus.optional(), description: optionalText, curator: text.optional(),
  responsibleOrg: text.optional(), address: text.optional(),
}).refine((value) => Object.keys(value).length > 0, 'Empty patch');
