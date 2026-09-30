import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticate, authorize, HttpError } from '../src/lib/auth';
const account = { username: 'test', password: 'test-only-password-1234', role: 'organization', name: 'Executor', organization: 'Org A' };
function request(password = account.password, method = 'GET', extra: Record<string, string> = {}) {
  return new Request('https://app.example/api/tasks', { method, headers: { authorization: 'Basic ' + Buffer.from(`test:${password}`).toString('base64'), 'content-type': 'application/json', ...extra } });
}
test('accounts fail closed and credentials cannot select a different role', () => {
  process.env.AUTH_USERS = '[]';
  assert.throws(() => authenticate(request()), (e: unknown) => e instanceof HttpError && e.status === 503);
  process.env.AUTH_USERS = JSON.stringify([account]);
  assert.throws(() => authenticate(request('wrong')), (e: unknown) => e instanceof HttpError && e.status === 401);
  assert.equal(authenticate(request()).role, 'organization');
  assert.throws(() => authorize(request(), ['admin']), (e: unknown) => e instanceof HttpError && e.status === 403);
});
test('cross-origin writes and non-JSON writes are rejected', () => {
  process.env.AUTH_USERS = JSON.stringify([account]); process.env.APP_ORIGIN = 'https://app.example';
  assert.throws(() => authorize(request(account.password, 'POST', { origin: 'https://evil.example' })), (e: unknown) => e instanceof HttpError && e.status === 403);
  assert.throws(() => authorize(request(account.password, 'POST', { 'content-type': 'text/plain' })), (e: unknown) => e instanceof HttpError && e.status === 415);
  assert.equal(authorize(request(account.password, 'POST', { origin: 'https://app.example' })).id, 'test');
});
