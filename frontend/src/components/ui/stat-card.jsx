/**
 * Sparkline for a stat card.
 *
 * This used to draw one of two hardcoded curves picked by a `trend` prop, so
 * every card showed a confident rise or fall regardless of the number beside
 * it — "Churned Users 0" came with a falling red line, and a dead backend still
 * produced a climbing green one. It now plots `series` and renders nothing
 * without it, so a trend is only ever drawn from real values.
 *
 * No endpoint returns per-period history yet (see BACKEND_GAPS.md), so nothing
 * passes `series` today and the cards render without a chart.
 */
export function MiniChart({ series, color = '#10b981' }) {
  if (!Array.isArray(series) || series.length < 2) return null;

  const values = series.map(Number).filter((n) => Number.isFinite(n));
  if (values.length < 2) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const stepX = 112 / (values.length - 1);
  const d = values
    .map((v, i) => {
      const x = (i * stepX).toFixed(2);
      const y = (30 - ((v - min) / span) * 28).toFixed(2);
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 112 32" className="w-full h-10 mt-2" fill="none">
      <path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The same dash-instead-of-zero rule, for the hand-rolled cards on the admin
 * pages that lay out their own markup instead of using <StatCard>.
 */
export function StatValue({ value, format, className = '' }) {
  if (value === null || value === undefined || value === '') {
    return (
      <span className={`text-slate-300 ${className}`} title="Not loaded">
        &mdash;
      </span>
    );
  }
  const shown =
    typeof value === 'number'
      ? (format ? format(value) : value.toLocaleString('en-IN'))
      : value;
  return <span className={className}>{shown}</span>;
}

export default function StatCard({
  title,
  value,
  color = '#10b981',
  series,
  prefix = '',
  periodLabel = 'This Month',
  changeLabel,
  changeColor,
}) {
  // No value means the fetch failed or has not landed. Showing 0 there would
  // assert something false, and the trend line would corroborate it — so the
  // card falls back to a dash and drops the chart and the change label.
  const unknown = value === null || value === undefined || value === '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-700">{title}</span>
         <select
          defaultValue={periodLabel}
          className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-4xl px-3 py-1.5 outline-none cursor-pointer"
        >
          <option>This Month</option>
          <option>This Week</option>
          <option>Today</option>
          <option>This Year</option>
        </select>
      </div>
      <div className="text-3xl font-bold text-slate-900 mt-2">
        {unknown ? (
          <span className="text-slate-300" title="Not loaded">&mdash;</span>
        ) : (
          <>
            {prefix}
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </>
        )}
      </div>
      {changeLabel && !unknown && (
        <p className={`text-xs mt-1 ${changeColor || 'text-emerald-600'}`}>
          {changeLabel}
        </p>
      )}
      {!unknown && <MiniChart series={series} color={color} />}
    </div>
  );
}
