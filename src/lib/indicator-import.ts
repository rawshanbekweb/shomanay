import { z } from 'zod';
import type { SectorIndicator } from '@/types';

const text = z.string().trim().min(1).max(300);
const rowSchema = z.object({
  code: text.regex(/^[A-Za-z0-9_.-]+$/, 'kod: tek latın háripleri, sanlar, - _ .'),
  sectorKey: text.regex(/^[a-z0-9_-]+$/, 'sectorKey: kishi latın háripleri'),
  sectorName: text,
  name: text,
  unit: text,
  year: z.coerce.number().int().min(2000).max(2100),
  value: z.coerce.number().finite(),
  source: z.string().trim().max(300).default(''),
}).strict();

export type ImportIssue = { row: number; message: string };
export type ImportOutcome = { indicators: SectorIndicator[]; created: number; updated: number; issues: ImportIssue[]; accepted: number };

/**
 * CSV qatarları (hár qatar = bir kórsetkish + bir jıl mánisi) bar kórsetkishler dizimine qosıladı.
 * Qáte qatarlar tastıyıqlanbaydı, biraq basqa durıs qatarlar saqlanadı; qáteler protokolǵa jazıladı.
 */
export function mergeIndicatorRows(rawRows: Record<string, string>[], existing: SectorIndicator[], user: string, now = new Date()): ImportOutcome {
  const issues: ImportIssue[] = [];
  const list = existing.map((i) => ({ ...i, historical: { ...i.historical } }));
  const touched = new Set<string>();
  const created = new Set<string>();
  let accepted = 0;

  rawRows.forEach((raw, index) => {
    const rowNo = index + 2; // 1-qatar = sarlavha
    const parsed = rowSchema.safeParse(raw);
    if (!parsed.success) {
      issues.push({ row: rowNo, message: parsed.error.issues.map((i) => `${i.path.join('.') || 'qatar'}: ${i.message}`).join('; ') });
      return;
    }
    const r = parsed.data;
    let indicator = list.find((i) => i.code === r.code);
    if (!indicator) {
      indicator = {
        id: `ind-${r.code.toLowerCase()}`, code: r.code,
        name: { qq: r.name, uz: r.name, ru: r.name },
        sectorKey: r.sectorKey, sectorName: { qq: r.sectorName, uz: r.sectorName, ru: r.sectorName },
        unit: r.unit, historical: {}, trendPercent: 0, isPositiveTrend: true,
      };
      list.push(indicator);
      created.add(r.code);
    } else if (indicator.unit !== r.unit && !created.has(r.code)) {
      issues.push({ row: rowNo, message: `birlik «${r.unit}» bar kórsetkish birligi «${indicator.unit}» ǵa sáykes kelmeydi` });
      return;
    }
    indicator.historical[String(r.year)] = r.value;
    if (r.source) indicator.source = r.source;
    touched.add(r.code);
    accepted++;
  });

  touched.forEach((code) => {
    const ind = list.find((i) => i.code === code)!;
    const years = Object.keys(ind.historical).sort();
    if (years.length >= 2) {
      const last = ind.historical[years[years.length - 1]];
      const prev = ind.historical[years[years.length - 2]];
      ind.trendPercent = prev === 0 ? 0 : Math.round(((last - prev) / Math.abs(prev)) * 1000) / 10;
      ind.isPositiveTrend = last >= prev;
    }
    ind.updatedAt = now.toISOString();
    ind.updatedBy = user;
  });

  return { indicators: list, created: created.size, updated: touched.size - created.size, issues, accepted };
}

export const INDICATOR_CSV_HEADERS = ['code', 'sectorKey', 'sectorName', 'name', 'unit', 'year', 'value', 'source'];
