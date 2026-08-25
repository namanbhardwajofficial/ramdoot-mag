/**
 * CSV export for the admin tables.
 *
 * The Toolbar's Export button was wired to `onExport={() => {}}` on the payment
 * and payout lists — it looked live and did nothing. There is no export endpoint
 * on the backend, but these pages already hold every row they display, so the
 * file can be built in the browser from exactly what the user is looking at.
 */

// Escape one cell. Anything containing a comma, quote or newline has to be
// quoted, and embedded quotes are doubled — that is the whole of RFC 4180.
function cell(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * @param columns [{ key, label, value? }] — `value(row)` overrides `row[key]`
 *                for columns whose display value is computed.
 */
export function toCsv(columns, rows) {
  const header = columns.map((c) => cell(c.label ?? c.key)).join(',');
  const body = rows.map((row) =>
    columns.map((c) => cell(c.value ? c.value(row) : row[c.key])).join(','),
  );
  return [header, ...body].join('\r\n');
}

/** Build the CSV and hand it to the browser as a download. */
export function downloadCsv(filename, columns, rows) {
  const csv = toCsv(columns, rows);
  // The BOM makes Excel read it as UTF-8 — without it the rupee sign in the
  // amount columns comes out as mojibake.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking immediately can cancel the download in some browsers; one tick is
  // enough for the navigation to have started.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** `payments-2026-08-25.csv` */
export function stampedName(prefix) {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
}

export default downloadCsv;
