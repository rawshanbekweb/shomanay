import type { Prisma } from '@prisma/client';
import type { AuditLogItem, Task, User } from '@/types';
import { HttpError } from './auth';
import { parseTask } from './serializers';
import { taskAction } from './api';
import type { z } from 'zod';

export async function audit(tx: Prisma.TransactionClient, user: User, entityType: AuditLogItem['entityType'], entityId: string, entityName: string, action: string, before: unknown, after: unknown) {
  const entry: Omit<AuditLogItem, 'id' | 'timestamp'> = {
    userName: user.name, userRole: user.role, entityType, entityId, entityName, action,
    changes: [{ field: action, oldValue: JSON.stringify(before), newValue: JSON.stringify(after) }], ipAddress: '—',
  };
  await tx.auditLog.create({ data: { userId: user.id, data: JSON.stringify(entry) } });
}

export async function updateTask(tx: Prisma.TransactionClient, user: User, id: string, input: z.infer<typeof taskAction>) {
  const stored = await tx.task.findUniqueOrThrow({ where: { id } });
  const task = parseTask(stored);
  const data: Prisma.TaskUpdateInput = {};
  const allow = (roles: User['role'][]) => { if (!roles.includes(user.role)) throw new HttpError(403, 'Bu amal uchun ruxsat yo‘q.'); };
  if (input.action === 'start' || input.action === 'evidence') {
    allow(['organization']);
    if (user.organization !== task.mainExecutorOrg) throw new HttpError(403, 'Topshiriq boshqa tashkilotga tegishli.');
    const states = input.action === 'start' ? ['assigned', 'returned_for_revision'] : ['in_progress', 'returned_for_revision'];
    if (!states.includes(task.status)) throw new HttpError(409, 'Topshiriq holati bu amal uchun mos emas.');
    data.status = input.action === 'start' ? 'in_progress' : 'under_review';
    if (input.action === 'evidence') data.evidence = JSON.stringify({ ...input.evidence, submittedAt: new Date().toISOString(), submittedBy: user.name });
  } else if (input.action === 'review') {
    allow(['inspector']);
    if (user.organization !== task.inspectorOrg || user.organization === task.mainExecutorOrg) throw new HttpError(403, 'Mustaqil tekshiruvchi talab qilinadi.');
    if (task.status !== 'under_review' || !task.evidence) throw new HttpError(409, 'Topshiriq tekshiruvga topshirilmagan.');
    data.status = input.accepted ? 'accepted' : 'returned_for_revision';
    data.completedDate = input.accepted ? new Date().toISOString() : null;
    data.review = JSON.stringify({ reviewedAt: new Date().toISOString(), reviewedBy: user.name, accepted: input.accepted,
      ...(input.accepted ? { inspectorNotes: input.notes } : { rejectionReason: input.notes }) });
  } else {
    allow(['hokim', 'coordinator', 'admin']);
    if (['accepted', 'cancelled'].includes(task.status)) throw new HttpError(409, 'Yopilgan topshiriq muddatini o‘zgartirib bo‘lmaydi.');
    if (Date.parse(input.deadline) <= Math.max(Date.now(), Date.parse(task.deadline))) throw new HttpError(400, 'Yangi muddat oldingi muddatdan va hozirgi vaqtdan keyin bo‘lishi kerak.');
    data.deadline = input.deadline;
    data.extensions = JSON.stringify([...task.extensions, { id: crypto.randomUUID(), oldDeadline: task.deadline, newDeadline: input.deadline,
      reason: input.reason, approvedBy: user.name, approvedDate: new Date().toISOString() }]);
  }
  const updated = await tx.task.update({ where: { id, status: stored.status, deadline: stored.deadline }, data });
  if (task.issueId) {
    const statuses: Partial<Record<Task['status'], string>> = { in_progress: 'in_progress', under_review: 'under_review', accepted: 'resolved', returned_for_revision: 'in_progress' };
    const status = statuses[updated.status as Task['status']];
    if (status) await tx.issue.update({ where: { id: task.issueId }, data: { status } });
  }
  await audit(tx, user, 'task', id, task.title, input.action, task, parseTask(updated));
  return parseTask(updated);
}
