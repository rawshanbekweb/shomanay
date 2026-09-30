export function toCsv(rows: unknown[][]): string {
  return '\uFEFF' + rows.map(row => row.map(value => {
    let cell = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(cell)) cell = "'" + cell;
    return '"' + cell.replace(/"/g, '""') + '"';
  }).join(',')).join('\r\n');
}
export function parseCsv(input: string): Record<string, string>[] {
  const text = input.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false, closed = false;
  const endCell = () => { row.push(cell); cell = ''; closed = false; };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else { quoted = false; closed = true; }
      } else cell += char;
    } else if (char === ',') endCell();
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      endCell(); if (row.some(value => value !== '')) rows.push(row); row = [];
    } else if (char === '"' && cell === '' && !closed) quoted = true;
    else {
      if (closed || char === '"') throw new Error('CSV qo‘shtirnoqlari noto‘g‘ri.');
      cell += char;
    }
  }
  if (quoted) throw new Error('CSV qo‘shtirnog‘i yopilmagan.');
  endCell(); if (row.some(value => value !== '')) rows.push(row);
  const headers = rows.shift()?.map(value => value.trim());
  if (!headers?.length || headers.some(value => !value) || new Set(headers).size !== headers.length) throw new Error('CSV ustunlari noto‘g‘ri.');
  if (!rows.length || rows.length > 500) throw new Error('CSV 1–500 qator bo‘lishi kerak.');
  return rows.map((values, index) => {
    if (values.length !== headers.length) throw new Error(`${index + 2}-qatorda ustunlar soni noto‘g‘ri.`);
    return Object.fromEntries(headers.map((header, i) => [header, values[i]]));
  });
}
export function downloadCsv(filename: string, rows: unknown[][]) {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
