import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { NextRequest } from 'next/server';
const require = createRequire(import.meta.url);
const directory = mkdtempSync(join(tmpdir(), 'shomanay-test-'));
process.env.DATABASE_URL = `file:${join(directory, 'test.db').replaceAll('\\', '/')}`;
process.env.APP_ORIGIN = 'https://app.example';
const accounts = [
  { username: 'admin', role: 'admin', organization: 'Office' },
  { username: 'executor', role: 'organization', organization: 'Org A' },
  { username: 'other', role: 'organization', organization: 'Org B' },
  { username: 'inspector', role: 'inspector', organization: 'Inspection' },
].map(user => ({ ...user, name: user.username, password: 'test-only-password-1234' }));
process.env.AUTH_USERS = JSON.stringify(accounts);
execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], { env: process.env, stdio: 'pipe' });
function req(user: string, method: string, body?: unknown) {
  return new NextRequest('https://app.example/api/tasks', { method, headers: { 'content-type': 'application/json', origin: 'https://app.example', authorization: 'Basic ' + Buffer.from(`${user}:test-only-password-1234`).toString('base64') }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
}
test('database workflow enforces roles, state transitions, atomic audit and failed imports', async () => {
  const { prisma } = await import('../src/lib/prisma');
  const { POST: create } = await import('../src/app/api/tasks/route');
  const { PATCH: change } = await import('../src/app/api/tasks/[id]/route');
  const { POST: importObjects } = await import('../src/app/api/import/route');
  try {
    await prisma.mFY.create({ data: { id: 'mfy-1', name: 'Test', code: 'T1', population: 1, areaSqKm: 1, centerLat: 42, centerLng: 59, leaderName: 'Test', phone: '' } });
    await prisma.issue.create({ data: { id: 'issue-1', code: 'ISS-1', title: 'Issue', description: 'Needs repair', category: 'gas', priority: 'high', mfyId: 'mfy-1', reportedDate: new Date().toISOString(), reportedBy: 'Test' } });
    const body = { title: 'Repair', actionDescription: 'Fix the pipe', mainExecutorOrg: 'Org A', executorPerson: 'Executor', inspectorOrg: 'Inspection', inspectorPerson: 'Inspector', deadline: new Date(Date.now() + 86400000).toISOString(), expectedResult: 'Working pipe', verificationMethod: 'Inspection', priority: 'high', mfyId: 'mfy-1', issueId: 'issue-1' };
    assert.equal((await create(req('executor', 'POST', body))).status, 403);
    assert.equal((await create(req('admin', 'POST', { ...body, title: '' }))).status, 400);
    const created = await create(req('admin', 'POST', body));
    assert.equal(created.status, 201); const task = await created.json();
    const context = { params: Promise.resolve({ id: task.id }) };
    assert.equal((await change(req('other', 'PATCH', { action: 'start' }), context)).status, 403);
    assert.equal((await change(req('executor', 'PATCH', { action: 'review', accepted: true, notes: 'Self approval' }), context)).status, 403);
    assert.equal((await change(req('executor', 'PATCH', { action: 'start' }), context)).status, 200);
    assert.equal((await change(req('executor', 'PATCH', { action: 'start' }), context)).status, 409);
    assert.equal((await change(req('executor', 'PATCH', { action: 'evidence', evidence: { comment: 'Fixed', photos: [], documents: [] } }), context)).status, 200);
    assert.equal((await change(req('inspector', 'PATCH', { action: 'review', accepted: true, notes: 'Verified' }), context)).status, 200);
    assert.equal((await prisma.issue.findUniqueOrThrow({ where: { id: 'issue-1' } })).status, 'resolved');
    assert.equal(await prisma.auditLog.count(), 4);
    const row = { id: 'obj-1', name: 'Object', mfyId: 'mfy-1', type: 'enterprise', address: 'Address', coordsLat: '42', coordsLng: '59', responsibleOrg: 'Org A' };
    assert.equal((await importObjects(req('executor', 'POST', [row]))).status, 403);
    assert.equal((await importObjects(req('admin', 'POST', [row, { ...row, id: 'obj-2', mfyId: 'missing' }]))).status, 400);
    assert.equal(await prisma.districtObject.count(), 0);
    assert.equal((await importObjects(req('admin', 'POST', [row]))).status, 200);
    assert.equal(await prisma.districtObject.count(), 1);
    // A restart/client reconnection must retain accepted status and the server audit.
    await prisma.$disconnect();
    assert.equal((await prisma.task.findUniqueOrThrow({ where: { id: task.id } })).status, 'accepted');
    assert.equal(await prisma.auditLog.count(), 5);
  } finally { await prisma.$disconnect(); }
});
test('legacy SQLite migration preserves every existing task', async () => {
  const { PrismaClient } = await import('@prisma/client');
  const legacyPath = join(directory, 'legacy.db');
  const url = `file:${legacyPath.replaceAll('\\', '/')}`;
  const db = new PrismaClient({ datasourceUrl: url });
  try {
    const initialSql = readFileSync('prisma/migrations/202609300001_initial/migration.sql', 'utf8');
    for (const statement of initialSql.split(';').filter(value => value.trim())) await db.$executeRawUnsafe(statement);
    await db.task.create({ data: { id: 'legacy-1', code: 'LEGACY-1', mfyId: 'mfy-1', title: 'Existing task', actionDescription: 'Preserve me', mainExecutorOrg: 'Org A', executorPerson: 'A', inspectorOrg: 'Inspection', inspectorPerson: 'B', createdDate: '2026-01-01', deadline: '2027-01-01', expectedResult: 'Result', verificationMethod: 'Review' } });
    const before = await db.task.findMany({ orderBy: { id: 'asc' } });
    await db.$disconnect();
    const cli = require.resolve('prisma/build/index.js');
    const env = { ...process.env, DATABASE_URL: url };
    execFileSync(process.execPath, [cli, 'migrate', 'resolve', '--applied', '202609300001_initial'], { env, stdio: 'pipe' });
    execFileSync(process.execPath, [cli, 'migrate', 'deploy'], { env, stdio: 'pipe' });
    assert.deepEqual(await db.task.findMany({ orderBy: { id: 'asc' } }), before);
    assert.equal(await db.auditLog.count(), 0);
    assert.equal(await db.dataset.count(), 0);
  } finally { await db.$disconnect(); }
});
