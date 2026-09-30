import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(join(process.env.APPDATA, 'npm/node_modules/playwright'));
const temporary = mkdtempSync(join(tmpdir(), 'shomanay-browser-'));
const password = randomBytes(24).toString('base64url');
const base = 'http://127.0.0.1:3117';
const env = { ...process.env, NODE_ENV: 'production', DATABASE_URL: `file:${join(temporary, 'app.db').replaceAll('\\', '/')}`, APP_ORIGIN: base, DATA_MODE: 'demo', AUTH_USERS: JSON.stringify([{ username: 'smokeadmin', password, role: 'admin', name: 'Smoke Admin', organization: 'Office' }]) };
execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], { env, stdio: 'pipe' });
execFileSync(process.execPath, [require.resolve('tsx/cli'), 'prisma/seed.ts'], { env, stdio: 'pipe' });
const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', '3117'], { env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
let output = ''; server.stdout.on('data', part => { output += part; }); server.stderr.on('data', part => { output += part; });
let browser;
try {
  for (let i = 0; i < 60; i++) { try { await fetch(base); break; } catch { await delay(250); } }
  for (const path of ['/', '/admin', '/api/health', '/api/tasks']) assert.equal((await fetch(base + path)).status, 401, path);
  const headers = { authorization: 'Basic ' + Buffer.from(`smokeadmin:${password}`).toString('base64') };
  for (const path of ['/api/health', '/api/session', '/api/tasks', '/api/issues', '/api/objects', '/api/mfys', '/api/investments', '/api/indicators', '/api/zones', '/api/audit']) {
    const res = await fetch(base + path, { headers }); assert.equal(res.status, 200, path);
    assert.match(res.headers.get('cache-control'), /no-store/);
  }
  console.log('HTTP: anonymous access denied, authenticated APIs healthy.');
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ httpCredentials: { username: 'smokeadmin', password, origin: base }, viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/', '/tasks', '/issues', '/map', '/investments', '/indicators', '/industrial-zones', '/reports', '/admin', '/scenarios']) {
    const response = await page.goto(base + path); assert.equal(response.status(), 200, path);
    await page.getByText('DEMO — namunaviy ma‘lumotlar', { exact: true }).waitFor({ timeout: 20000 });
    assert.equal(await page.getByRole('alert').count(), 0, path);
  }
  console.log('Browser: all 10 pages loaded without data or runtime errors.');
  await page.goto(base + '/tasks');
  await page.getByText('DEMO — namunaviy ma‘lumotlar', { exact: true }).waitFor();
  const createButton = page.locator('main button').first();
  await createButton.click();
  const form = page.locator('form');
  await form.locator('input[type=text]').first().fill('Browser save test');
  await form.locator('textarea').fill('Verify failed save keeps the form open');
  await form.getByLabel('Topshiriq MFY').selectOption({ index: 1 });
  await form.locator('input[type=datetime-local]').fill('2027-12-20T18:00');
  await page.route('**/api/tasks', async route => {
    if (route.request().method() === 'POST') await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Test: saqlash rad etildi' }) });
    else await route.continue();
  });
  await form.locator('button[type=submit]').click();
  await form.getByRole('alert').waitFor();
  assert.match(await form.getByRole('alert').textContent(), /saqlash rad etildi/);
  assert.equal(await form.locator('input[type=text]').first().inputValue(), 'Browser save test');
  await page.unroute('**/api/tasks');
  await form.locator('button[type=submit]').click();
  await form.waitFor({ state: 'detached' });
  await page.reload();
  await page.getByText('Browser save test', { exact: true }).waitFor();
  console.log('Browser: failed save preserves inputs; successful save survives reload.');
  await page.goto(base + '/reports');
  await page.getByText('DEMO — namunaviy ma‘lumotlar', { exact: true }).waitFor();
  await page.getByLabel('Hisobot turi').selectOption('issues');
  assert.match(await page.locator('thead').textContent(), /Muammo/);
  const selectedMfy = await page.getByLabel('MFY').selectOption({ index: 1 });
  const rows = await page.locator('tbody tr').allTextContents();
  assert.ok(rows.every(row => row.includes(selectedMfy[0])));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/');
  await page.getByText('DEMO — namunaviy ma‘lumotlar', { exact: true }).waitFor();
  await page.screenshot({ path: join(temporary, 'mobile.png'), fullPage: true });
  assert.deepEqual(errors, []);
  console.log('Browser: report filter and mobile page passed.');
  console.log('Artifacts: ' + temporary);
} catch (error) { console.error(output); throw error; }
finally { if (browser) await browser.close(); server.kill(); }
