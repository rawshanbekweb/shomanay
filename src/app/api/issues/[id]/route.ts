import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';
import { apiError, readBody, issueInput } from '@/lib/api';
import { parseIssue } from '@/lib/serializers';
import { audit } from '@/lib/task-service';
type Context = { params: Promise<{ id: string }> };
export async function GET(req: Request, { params }: Context) {
  try {
    authorize(req);
    return NextResponse.json(parseIssue(await prisma.issue.findUniqueOrThrow({ where: { id: (await params).id } })));
  } catch (error) { return apiError(error); }
}
export async function PATCH(req: Request, { params }: Context) {
  try {
    const user = authorize(req, ['hokim', 'coordinator', 'admin']);
    const body = issueInput.pick({ title: true, description: true, priority: true, evidenceNotes: true }).partial().strict().parse(await readBody(req));
    const { id } = await params;
    const updated = await prisma.$transaction(async tx => {
      const previous = await tx.issue.findUniqueOrThrow({ where: { id } });
      const result = await tx.issue.update({ where: { id }, data: body });
      await audit(tx, user, 'issue', id, result.title, 'update', previous, result);
      return result;
    });
    return NextResponse.json(parseIssue(updated));
  } catch (error) { return apiError(error); }
}
export async function DELETE(req: Request, { params }: Context) {
  try {
    const user = authorize(req, ['admin']);
    const { id } = await params;
    await prisma.$transaction(async tx => {
      const issue = await tx.issue.delete({ where: { id } });
      await tx.task.updateMany({ where: { issueId: id }, data: { issueId: null } });
      await audit(tx, user, 'issue', id, issue.title, 'delete', issue, null);
    });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
