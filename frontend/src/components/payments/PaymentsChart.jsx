import { useState, useEffect, useCallback, useRef } from 'react';
import { GRAPH_THEMES } from '@/config/theme';
import { ORG } from '@/config/constants';
import { adminApi } from '@/lib/api';
import { fillSeries } from '@/lib/series';
import ErrorState from '@/components/ui/error-state';

const CHART_H = 220;
const CHART_W = 700;
const PAD = { top: 20, right: 20, bottom: 30, left: 64 };

function toPath(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
}

// Compact axis labels: 1448 -> "₹1.4k", 950 -> "₹950". The previous version
// printed `(t / 1000).toFixed(0) + 'k'`, which rendered every tick under 1500 as
// "0k" — the axis read 0k,0k,0k,0k,0k for any realistic revenue.
function axisLabel(v) {
  const n = Number(v) || 0;
  if (n >= 10000000) return `${ORG.currencySymbol}${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${ORG.currencySymbol}${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${ORG.currencySymbol}${(n / 1000).toFixed(1)}k`;
  return `${ORG.currencySymbol}${Math.round(n)}`;
}

function monthLabel(key) {
  return new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-IN', {
    month: 'short',
    timeZone: 'UTC',
  });
}

/**
 * Platform revenue over the last 12 months.
 *
 * Previously this built its series from `paymentsApi.mine()` and counted only
 * rows whose status was 'COMPLETED' — but the backend enum is SUCCESS, so the
 * filter never matched and the chart drew a flat zero line no matter what had
 * been paid. It also read the *admin's own* payments, not the platform's.
 * GET /admin/analytics/revenue now provides the real thing.
 *
 * The "Payout" series is gone: nothing exposes payouts per period, and drawing
 * it flat at zero asserted that nothing had been paid out, which is false.
 */
export default function PaymentsChart() {
  const [points, setPoints] = useState(null);
  const [error, setError] = useState(null);
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.revenueSeries({ granularity: 'month', days: 365 });
      if (!alive.current) return;
      setPoints(fillSeries(res, 'revenue').map((p) => ({ month: monthLabel(p.key), revenue: p.value })));
      setError(null);
    } catch (err) {
      if (!alive.current) return;
      setPoints(null);
      setError(err.message || 'Could not load revenue');
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    return () => { alive.current = false; };
  }, [load]);

  const Frame = ({ children }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Revenue</h3>
          <p className="text-xs text-slate-400">Successful payments across the platform, last 12 months</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: GRAPH_THEMES.revenue.stroke }} />
          {GRAPH_THEMES.revenue.label}
        </div>
      </div>
      {children}
    </div>
  );

  if (error) {
    return (
      <Frame>
        <ErrorState message={error} onRetry={load} />
      </Frame>
    );
  }

  if (!points) {
    return (
      <Frame>
        <div className="h-55 flex items-center justify-center text-sm text-slate-400">Loading&hellip;</div>
      </Frame>
    );
  }

  // Floor at 1 so a year with no revenue doesn't divide by zero.
  const maxVal = Math.max(1, ...points.map((d) => d.revenue));
  const yScale = (v) => PAD.top + (1 - v / maxVal) * (CHART_H - PAD.top - PAD.bottom);
  const xScale = (i) => PAD.left + (i / Math.max(1, points.length - 1)) * (CHART_W - PAD.left - PAD.right);
  const revPts = points.map((d, i) => ({ x: xScale(i), y: yScale(d.revenue) }));
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  return (
    <Frame>
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" fill="none">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={CHART_W - PAD.right} y1={yScale(t)} y2={yScale(t)} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={PAD.left - 8} y={yScale(t) + 4} textAnchor="end" className="text-[10px] fill-slate-400">{axisLabel(t)}</text>
          </g>
        ))}
        {points.map((d, i) => (
          <text key={d.month + i} x={xScale(i)} y={CHART_H - 6} textAnchor="middle" className="text-[10px] fill-slate-400">{d.month}</text>
        ))}
        <path d={toPath(revPts)} stroke={GRAPH_THEMES.revenue.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Frame>
  );
}
