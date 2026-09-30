import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/auth';
import { apiError, readBody, issueInput } from '@/lib/api';
import { parseIssue } from '@/lib/serializers';
import { audit } from '@/lib/task-service';
export async function GET(req: NextRequest) {
  try {
    authorize(req);
    const q = req.nextUrl.searchParams;
    const issues = await prisma.issue.findMany({ where: { category: q.get('category') || undefined, priority: q.get('priority') || undefined, status: q.get('status') || undefined }, orderBy: { reportedDate: 'desc' } });
    return NextResponse.json(issues.map(parseIssue));
  } catch (error) { return apiError(error); }
}
export async function POST(req: NextRequest) {
  try {
    const user = authorize(req, ['hokim', 'coordinator', 'organization', 'admin']);
    const body = issueInput.parse(await readBody(req));
    const issue = await prisma.$transaction(async tx => {
      await tx.mFY.findUniqueOrThrow({ where: { id: body.mfyId } });
      if (body.objectId) await tx.districtObject.findUniqueOrThrow({ where: { id: body.objectId } });
      const created = await tx.issue.create({ data: { ...body, id: crypto.randomUUID(), code: `MSH-${crypto.randomUUID()}`, status: 'open', reportedDate: new Date().toISOString(), reportedBy: user.name } });
      await audit(tx, user, 'issue', created.id, created.title, 'create', null, parseIssue(created));
      return created;
    });
    return NextResponse.json(parseIssue(issue), { status: 201 });
  } catch (error) { return apiError(error); }
}
