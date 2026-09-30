import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize, HttpError } from '@/lib/auth';
import { apiError, readBody, taskInput } from '@/lib/api';
import { parseTask } from '@/lib/serializers';
import { audit } from '@/lib/task-service';

export async function GET(req: NextRequest) {
  try {
    authorize(req);
    const query = req.nextUrl.searchParams;
    const tasks = await prisma.task.findMany({ where: { status: query.get('status') || undefined, mfyId: query.get('mfyId') || undefined, priority: query.get('priority') || undefined }, orderBy: { createdDate: 'desc' } });
    return NextResponse.json(tasks.map(parseTask));
  } catch (error) { return apiError(error); }
}
export async function POST(req: NextRequest) {
  try {
    const user = authorize(req, ['hokim', 'coordinator', 'admin']);
    const body = taskInput.parse(await readBody(req));
    if (body.mainExecutorOrg === body.inspectorOrg) throw new HttpError(400, 'Ijrochi va tekshiruvchi mustaqil bo‘lishi kerak.');
    if (Date.parse(body.deadline) <= Date.now()) throw new HttpError(400, 'Muddat kelajakda bo‘lishi kerak.');
    const task = await prisma.$transaction(async tx => {
      await tx.mFY.findUniqueOrThrow({ where: { id: body.mfyId } });
      if (body.objectId) await tx.districtObject.findUniqueOrThrow({ where: { id: body.objectId } });
      const created = await tx.task.create({ data: { ...body, id: crypto.randomUUID(), code: `TAP-${crypto.randomUUID()}`, status: 'assigned', createdDate: new Date().toISOString(), extensions: '[]' } });
      if (body.issueId) await tx.issue.update({ where: { id: body.issueId }, data: { status: 'assigned', assignedTaskId: created.id } });
      await audit(tx, user, 'task', created.id, created.title, 'create', null, parseTask(created));
      return created;
    });
    return NextResponse.json(parseTask(task), { status: 201 });
  } catch (error) { return apiError(error); }
}
