import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/config/constants';
import { CHART_COLORS, GRAPH_THEMES } from '@/config/theme';

const CHART_H = 220;
const CHART_W = 700;
const PAD = { top: 20, right: 20, bottom: 30, left: 50 };

function toPath(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
}

export default function PaymentsChart() {
  const [data, setData] = useState([]);
  const [active, setActive] = useState({ revenue: true, payout: true });

  useEffect(() => {
    fetch(`${BACKEND_URL}/payments/chart`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data.length) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.payout)));
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
