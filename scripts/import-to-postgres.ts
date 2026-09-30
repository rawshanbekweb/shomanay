/**
 * SQLite eksportidan PostgreSQL (Neon) bazasiga ma'lumot import qiladi.
 * Ishlatish:
 *   $env:DATABASE_URL="postgresql://..."; $env:DIRECT_URL="postgresql://..."
 *   npx tsx scripts/import-to-postgres.ts prisma/export-XXXX.json
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = process.argv[2];
if (!filePath) {
  console.error('❌  Fayl ko\'rsating: npx tsx scripts/import-to-postgres.ts prisma/export-XXX.json');
  process.exit(1);
}

const dump = JSON.parse(readFileSync(resolve(filePath), 'utf8')) as {
  exportedAt: string;
  summary: Record<string, number>;
  data: {
    tasks?: Record<string, unknown>[];
    issues?: Record<string, unknown>[];
    objects?: Record<string, unknown>[];
    mfys?: Record<string, unknown>[];
    indicators?: Record<string, unknown>[];
    investments?: Record<string, unknown>[];
    datasets?: Record<string, unknown>[];
    auditLogs?: Record<string, unknown>[];
  };
};

console.log(`\n📦 Eksport vaqti: ${dump.exportedAt}`);
console.log('📊 Import qilinadigan yozuvlar:');
for (const [k, v] of Object.entries(dump.summary)) {
  if (v > 0) console.log(`  ${k.padEnd(15)}: ${v} ta`);
}
console.log('');

const prisma = new PrismaClient();

async function main() {
  const { data } = dump;

  if (data.mfys?.length) {
    for (const m of data.mfys as Parameters<typeof prisma.mFY.upsert>[0]['create'][]) {
      await prisma.mFY.upsert({ where: { id: m.id as string }, update: {}, create: m as Parameters<typeof prisma.mFY.create>[0]['data'] });
    }
    console.log(`✅ MFYs: ${data.mfys.length} ta yozildi`);
  }

  if (data.objects?.length) {
    for (const o of data.objects) {
      await prisma.districtObject.upsert({ where: { id: o.id as string }, update: {}, create: o as Parameters<typeof prisma.districtObject.create>[0]['data'] });
    }
    console.log(`✅ Objects: ${data.objects.length} ta yozildi`);
  }

  if (data.issues?.length) {
    for (const i of data.issues) {
      await prisma.issue.upsert({ where: { id: i.id as string }, update: {}, create: i as Parameters<typeof prisma.issue.create>[0]['data'] });
    }
    console.log(`✅ Issues: ${data.issues.length} ta yozildi`);
  }

  if (data.tasks?.length) {
    for (const t of data.tasks) {
      await prisma.task.upsert({ where: { id: t.id as string }, update: {}, create: t as Parameters<typeof prisma.task.create>[0]['data'] });
    }
    console.log(`✅ Tasks: ${data.tasks.length} ta yozildi`);
  }

  if (data.indicators?.length) {
    for (const i of data.indicators) {
      await prisma.indicator.upsert({ where: { id: i.id as string }, update: {}, create: i as Parameters<typeof prisma.indicator.create>[0]['data'] });
    }
    console.log(`✅ Indicators: ${data.indicators.length} ta yozildi`);
  }

  if (data.investments?.length) {
    for (const i of data.investments) {
      await prisma.investment.upsert({ where: { id: i.id as string }, update: {}, create: i as Parameters<typeof prisma.investment.create>[0]['data'] });
    }
    console.log(`✅ Investments: ${data.investments.length} ta yozildi`);
  }

  if (data.datasets?.length) {
    for (const d of data.datasets) {
      await prisma.dataset.upsert({ where: { key: d.key as string }, update: {}, create: d as Parameters<typeof prisma.dataset.create>[0]['data'] });
    }
    console.log(`✅ Datasets: ${data.datasets.length} ta yozildi`);
  }

  if (data.auditLogs?.length) {
    for (const a of data.auditLogs) {
      await prisma.auditLog.upsert({ where: { id: a.id as string }, update: {}, create: { ...a, timestamp: new Date(a.timestamp as string) } as Parameters<typeof prisma.auditLog.create>[0]['data'] });
    }
    console.log(`✅ AuditLogs: ${data.auditLogs.length} ta yozildi`);
  }

  console.log('\n🎉 Import muvaffaqiyatli yakunlandi!\n');
}

main()
  .catch(e => { console.error('\n❌ Xato:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
