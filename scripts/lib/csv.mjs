// Minimal CSV read/write. Handles quoted fields, embedded commas, quotes, newlines.

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    if (row.length > 1 || row[0] !== '') rows.push(row);
  }
  return rows;
}

/** parse into array of objects keyed by the header row */
export function readRecords(text) {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const o = {};
    header.forEach((h, i) => (o[h] = r[i] ?? ''));
    return o;
  });
}

const needsQuote = (s) => /[",\n\r]/.test(s);
const esc = (v) => {
  const s = String(v ?? '');
  return needsQuote(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function writeRecords(columns, records) {
  const lines = [columns.join(',')];
  for (const rec of records) lines.push(columns.map((c) => esc(rec[c])).join(','));
  return lines.join('\n') + '\n';
}
