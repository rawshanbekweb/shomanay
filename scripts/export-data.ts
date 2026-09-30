/**
 * SQLite bazasidagi barcha ma'lumotlarni JSON faylga eksport qiladi.
 * Ishlatish: npx tsx scripts/export-data.ts
 */
import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const dbPath = resolve(__dirname, '../prisma/dev.db');

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } },
});

async function safeQuery<T>(name: string, fn: () => Promise<T[]>): Promise<{ name: string; count: number; rows: T[] }> {
  try {
    const rows = await fn();
    return { name, count: rows.length, rows };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('does not exist') || msg.includes('no such table')) {
      console.warn(`  ⚠️  ${name}: jadval topilmadi, o'tkazib yuborildi`);
      return { name, count: 0, rows: [] };
    }
    throw e;
  }
}

async function main() {
  console.log(`\n🔍 Baza: ${dbPath}\n`);

  const results = await Promise.all([
    safeQuery('tasks',      () => prisma.task.findMany()),
    safeQuery('issues',     () => prisma.issue.findMany()),
    safeQuery('objects',    () => prisma.districtObject.findMany()),
    safeQuery('mfys',       () => prisma.mFY.findMany()),
    safeQuery('indicators', () => prisma.indicator.findMany()),
    safeQuery('investments',() => prisma.investment.findMany()),
    safeQuery('datasets',   () => prisma.dataset.findMany()),
    safeQuery('auditLogs',  () => prisma.auditLog.findMany()),
  ]);

  console.log('📊 Bazadagi ma\'lumotlar:');
  for (const r of results) {
    if (r.count > 0) console.log(`  ${r.name.padEnd(15)}: ${r.count} ta yozuv ✅`);
    else             console.log(`  ${r.name.padEnd(15)}: 0 (bo'sh)`);
  }

  const total = results.reduce((s, r) => s + r.count, 0);
  console.log(`\n  Jami: ${total} ta yozuv`);

  if (total === 0) {
    console.log('\n⚠️  Baza bo\'sh yoki faqat demo ma\'lumotlar mavjud.');
    console.log('   Vercelga o\'tganda ma\'lumotlarni yo\'qotish xavfi yo\'q.');
    return;
  }

  const data: Record<string, unknown[]> = {};
  for (const r of results) if (r.count > 0) data[r.name] = r.rows;

  const dump = {
    exportedAt: new Date().toISOString(),
    summary: Object.fromEntries(results.map(r => [r.name, r.count])),
    data,
  };

  const outFile = `prisma/export-${new Date().toISOString().slice(0,19).replace(/[T:]/g, '-')}.json`;
  writeFileSync(outFile, JSON.stringify(dump, null, 2), 'utf8');
  console.log(`\n✅ Eksport saqlandi: ${outFile}`);
  console.log('   Bu faylni Vercel+Neon ga o\'tgandan keyin import qilish uchun saqlab qo\'ying.\n');
}

main()
  .catch(e => { console.error('\n❌ Xato:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
