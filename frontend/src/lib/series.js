/**
 * Helpers for turning /admin/analytics/revenue into something chartable.
 *
 * The endpoint returns only the periods that actually had payments:
 *
 *   GET /admin/analytics/revenue?granularity=month&days=365
 *   -> { granularity: 'month', days: 365, data: [{ period, revenue, transactions }] }
 *
 * With one month of real payments that is a single point, even over a year's
 * window. Charting it as-is would draw a flat line and imply the other eleven
 * months don't exist, rather than that they earned nothing — so fill the gaps
 * before plotting.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDayUTC(d) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function bucketKey(date, granularity) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return granularity === 'month'
    ? `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    : new Date(startOfDayUTC(d)).toISOString().slice(0, 10);
}

/**
 * Expand a sparse series into one entry per period across the whole window,
 * oldest first, with missing periods set to 0.
 *
 * @param res    the endpoint's payload: { granularity, days, data }
 * @param field  which value to read from each row ('revenue' | 'transactions')
 * @param now    injectable clock, for tests
 * @returns [{ key, value }]
 */
export function fillSeries(res, field = 'revenue', now = new Date()) {
  const granularity = res?.granularity === 'month' ? 'month' : 'day';
  const days = Number(res?.days) > 0 ? Number(res.days) : 30;
  const rows = Array.isArray(res?.data) ? res.data : [];

  const byKey = new Map();
  for (const r of rows) {
    const k = bucketKey(r?.period, granularity);
    if (!k) continue;
    // Same bucket twice would mean the server split it; add rather than replace.
    byKey.set(k, (byKey.get(k) || 0) + Number(r?.[field] ?? 0));
  }

  const out = [];
  if (granularity === 'month') {
    // Roughly `days` worth of months, at least 2 so a chart has a line to draw.
    const months = Math.max(2, Math.round(days / 30));
    const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - i, 1));
      const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      out.push({ key: k, value: byKey.get(k) || 0 });
    }
  } else {
    const today = startOfDayUTC(now);
    for (let i = days - 1; i >= 0; i--) {
      const k = new Date(today - i * DAY_MS).toISOString().slice(0, 10);
      out.push({ key: k, value: byKey.get(k) || 0 });
    }
  }
  return out;
}

/** Just the numbers, which is all <MiniChart> needs. */
export function seriesValues(res, field = 'revenue', now = new Date()) {
  return fillSeries(res, field, now).map((p) => p.value);
}
