import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';
import { apiError, readBody, taskAction } from '@/lib/api';
import { parseTask } from '@/lib/serializers';
import { audit, updateTask } from '@/lib/task-service';
type Context = { params: Promise<{ id: string }> };
export async function GET(req: Request, { params }: Context) {
  try {
    authorize(req);
    return NextResponse.json(parseTask(await prisma.task.findUniqueOrThrow({ where: { id: (await params).id } })));
  } catch (error) { return apiError(error); }
}
export async function PATCH(req: Request, { params }: Context) {
  try {
    const user = authorize(req);
    const input = taskAction.parse(await readBody(req));
    const { id } = await params;
    return NextResponse.json(await prisma.$transaction(tx => updateTask(tx, user, id, input)));
  } catch (error) { return apiError(error); }
}
export async function DELETE(req: Request, { params }: Context) {
  try {
    const user = authorize(req, ['admin']);
    const { id } = await params;
    await prisma.$transaction(async tx => {
      const task = await tx.task.delete({ where: { id } });
      await tx.issue.updateMany({ where: { assignedTaskId: id }, data: { assignedTaskId: null, status: 'open' } });
      await audit(tx, user, 'task', id, task.title, 'delete', task, null);
    });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
