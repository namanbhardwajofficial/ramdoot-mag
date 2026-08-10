import { useState, useEffect } from 'react';
import { CHART_COLORS, GRAPH_THEMES } from '@/config/theme';
import { paymentsApi, listOf } from '@/lib/api';

const CHART_H = 220;
const CHART_W = 700;
const PAD = { top: 20, right: 20, bottom: 30, left: 50 };

function toPath(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
}

// There is no GET /payments/chart — build the monthly series client-side from
// the caller's payment rows. Only COMPLETED payments count as revenue; `payout`
// has no source on this endpoint (payouts live under /earnings/payouts, which is
// influencer-scoped), so that series stays flat at 0 until an admin-wide
// payouts endpoint exists. See BACKEND_GAPS.md.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toMonthlySeries(payments) {
  // Last 12 months, oldest first, so the x-axis reads left-to-right.
  const now = new Date();
  const buckets = [];
  const index = new Map();
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    index.set(key, buckets.length);
    buckets.push({ month: MONTHS[d.getMonth()], revenue: 0, payout: 0 });
  }

  payments.forEach((p) => {
    if (String(p.status).toUpperCase() !== 'COMPLETED') return;
    const d = new Date(p.createdAt);
    const slot = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (slot === undefined) return;
    buckets[slot].revenue += Number(p.amount || 0);
  });

  return buckets;
}

export default function PaymentsChart() {
  const [data, setData] = useState([]);
  const [active, setActive] = useState({ revenue: true, payout: true });

  useEffect(() => {
    let alive = true;
    paymentsApi
      .mine()
      .then((res) => alive && setData(toMonthlySeries(listOf(res))))
      .catch((err) => console.warn('paymentsChart', err.message));
    return () => {
      alive = false;
    };
  }, []);

  if (!data.length) return null;

  // Floor at 1 so a month with no completed payments doesn't divide by zero.
  const maxVal = Math.max(1, ...data.map((d) => Math.max(d.revenue, d.payout)));
  const yScale = (v) => PAD.top + (1 - v / maxVal) * (CHART_H - PAD.top - PAD.bottom);
  const xScale = (i) => PAD.left + (i / (data.length - 1)) * (CHART_W - PAD.left - PAD.right);

  const revPts = data.map((d, i) => ({ x: xScale(i), y: yScale(d.revenue) }));
  const payPts = data.map((d, i) => ({ x: xScale(i), y: yScale(d.payout) }));
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Payments</h3>
          <p className="text-xs text-slate-400">You will find everything about users in this platform.</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: GRAPH_THEMES.revenue.stroke }} />
            <input type="checkbox" className="sr-only" checked={active.revenue} onChange={() => setActive((p) => ({ ...p, revenue: !p.revenue }))} />
            {GRAPH_THEMES.revenue.label}
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: GRAPH_THEMES.payout.stroke }} />
            <input type="checkbox" className="sr-only" checked={active.payout} onChange={() => setActive((p) => ({ ...p, payout: !p.payout }))} />
            {GRAPH_THEMES.payout.label}
          </label>
        </div>
      </div>

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" fill="none">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={CHART_W - PAD.right} y1={yScale(t)} y2={yScale(t)} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={PAD.left - 8} y={yScale(t) + 4} textAnchor="end" className="text-[10px] fill-slate-400">{(t / 1000).toFixed(0)}k</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={d.month} x={xScale(i)} y={CHART_H - 6} textAnchor="middle" className="text-[10px] fill-slate-400">{d.month}</text>
        ))}
        {active.revenue && <path d={toPath(revPts)} stroke={GRAPH_THEMES.revenue.stroke} strokeWidth="2" strokeLinecap="round" />}
        {active.payout && <path d={toPath(payPts)} stroke={GRAPH_THEMES.payout.stroke} strokeWidth="2" strokeLinecap="round" />}
      </svg>
    </div>
  );
}
