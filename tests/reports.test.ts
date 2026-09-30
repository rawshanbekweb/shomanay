import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, toCsv } from '../src/lib/csv';
import { reportRows } from '../src/lib/reports';
import { mockTasks, mockIssues, mockInvestments } from '../src/lib/mockData';
test('CSV handles quotes, newlines, Unicode and spreadsheet formulas', () => {
  const csv = toCsv([['name', 'address'], ['O‘zbek, "nom"', 'birinchi\nikkinchi'], ['=HYPERLINK("bad")', 'joy']]);
  const parsed = parseCsv(csv);
  assert.equal(parsed[0].name, 'O‘zbek, "nom"');
  assert.equal(parsed[0].address, 'birinchi\nikkinchi');
  assert.equal(parsed[1].name[0], "'");
  assert.throws(() => parseCsv('name,name\na,b'));
  assert.throws(() => parseCsv('name,address\na'));
  assert.throws(() => parseCsv('name\n"unclosed'));
});
test('issues report exports issues and honors MFY filters', () => {
  const data = { tasks: mockTasks, issues: mockIssues, investments: mockInvestments };
  const mfyId = mockIssues[0].mfyId;
  const rows = reportRows('issues', mfyId, data).slice(1);
  assert.ok(rows.length > 0);
  assert.deepEqual(rows.map(row => row[0]), mockIssues.filter(issue => issue.mfyId === mfyId).map(issue => issue.code));
  assert.equal(reportRows('tasks', 'does-not-exist', data).length, 1);
  assert.equal(reportRows('investments', 'all', data).length, mockInvestments.length + 1);
});
