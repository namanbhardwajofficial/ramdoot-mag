import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatCard, { StatValue } from '@/components/ui/stat-card';
import DataTable from '@/components/ui/data-table';
import ErrorState from '@/components/ui/error-state';
import { CHART_COLORS } from '@/config/theme';
import { ORG } from '@/config/constants';
import Button from "@/components/Button.jsx";
import { adminApi, magazinesApi, listOf } from '@/lib/api';
import { fillSeries, seriesValues } from '@/lib/series';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const inr = (n) => `${ORG.currencySymbol} ${Number(n || 0).toLocaleString('en-IN')}`;

function fmtDateTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [magRows, setMagRows] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [revenue, setRevenue] = useState(null);

  // One key per region, so a failure in the audit log doesn't blank the stat
  // cards. Each loader clears its own key on success and doubles as its
  // section's retry handler.
  const [errors, setErrors] = useState({});
  // Reset on every mount, not just the first: React re-runs mount effects (in
  // StrictMode, and on any navigate-away-and-back), and a guard that only ever
  // flips to false would make every loader bail out before it sets state.
  const alive = useRef(true);

  const mark = useCallback((key, err) => {
    if (!alive.current) return;
    setErrors((prev) => {
      if (!err) {
        if (!(key in prev)) return prev;
        const { [key]: _drop, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: err.message || 'Could not load this' };
    });
  }, []);

  // /admin/dashboard carries the counts and the recent payments together.
  const loadDashboard = useCallback(async () => {
    try {
      const dash = await adminApi.dashboard();
      if (!alive.current) return;
      setCounts(dash?.counts || null);
      setRecentPayments(dash?.recentPayments || []);
      mark('dashboard', null);
    } catch (err) {
      if (!alive.current) return;
      setCounts(null);
      setRecentPayments([]);
      mark('dashboard', err);
    }
  }, [mark]);

  const loadAnalytics = useCallback(async () => {
    try {
      const a = await adminApi.analytics();
      if (!alive.current) return;
      setAnalytics(a || null);
      mark('analytics', null);
    } catch (err) {
      if (!alive.current) return;
      setAnalytics(null);
      mark('analytics', err);
    }
  }, [mark]);

  const loadLogs = useCallback(async () => {
    try {
      const res = await adminApi.auditLogs({ limit: 6 });
      if (!alive.current) return;
      setLogs(listOf(res));
      mark('logs', null);
    } catch (err) {
      if (!alive.current) return;
      setLogs([]);
      mark('logs', err);
    }
  }, [mark]);

  // Monthly revenue for the last year. The endpoint omits months with no
  // payments, so fillSeries pads them back to 0 — otherwise a single paid month
  // would plot as a flat line implying the rest never happened.
  const loadRevenue = useCallback(async () => {
    try {
      const res = await adminApi.revenueSeries({ granularity: 'month', days: 365 });
      if (!alive.current) return;
      setRevenue(res);
      mark('revenue', null);
    } catch (err) {
      if (!alive.current) return;
      setRevenue(null);
      mark('revenue', err);
    }
  }, [mark]);

  const loadMagazines = useCallback(async () => {
    try {
      const mags = listOf(await magazinesApi.list({ limit: 5 })).map((m) => ({
        id: m.id,
        name: m.title,
        status: m.status,
        clicks: m.viewsCount ?? 0,
        conversions: m.readsCount ?? 0,
        revenue: Number(m.price ?? 0),
        published: m.publishedAt
          ? new Date(m.publishedAt).toLocaleDateString('en-IN')
          : '—',
      }));
      if (!alive.current) return;
      setMagRows(mags);
      mark('magazines', null);
    } catch (err) {
      if (!alive.current) return;
      setMagRows([]);
      mark('magazines', err);
    }
  }, [mark]);

  useEffect(() => {
    alive.current = true;
    loadDashboard();
    loadAnalytics();
    loadLogs();
    loadMagazines();
    loadRevenue();
    return () => { alive.current = false; };
  }, [loadDashboard, loadAnalytics, loadLogs, loadMagazines, loadRevenue]);

  const overview = analytics?.overview;

  // Same source, two shapes: labelled points for the chart, bare values for the
  // stat card's sparkline.
  const revenuePoints = revenue
    ? fillSeries(revenue, 'revenue').map((p) => ({
        month: new Date(`${p.key}-01T00:00:00Z`).toLocaleDateString('en-IN', {
          month: 'short',
          timeZone: 'UTC',
        }),
        revenue: p.value,
      }))
    : [];
  const revenueSpark = revenue ? seriesValues(revenue, 'revenue') : undefined;

  // Magazines Table Columns - Matching your user list style
  const magazineColumns = [
    {
      key: 'name', label: 'Magazines',
      render: (v, row) => {
        const live = String(row.status || '').toUpperCase() === 'LIVE';
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" /> {/* Placeholder Image */}
            <div>
              <div className="font-medium text-slate-800">{v}</div>
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                {row.status ? row.status.charAt(0) + row.status.slice(1).toLowerCase() : '—'}
              </div>
            </div>
          </div>
        );
      },
    },
    { key: 'clicks', label: 'Total Clicks', render: (v) => v.toLocaleString() },
    { key: 'conversions', label: 'Conversions', render: (v) => v.toLocaleString() },
    { key: 'revenue', label: 'Revenue', render: (v) => `${ORG.currencySymbol}${v.toLocaleString('en-IN')}` },
    { key: 'published', label: 'Published Date', render: (v) => <span className="text-slate-600">{v}</span> },
    {
      key: '_actions', label: '', align: 'right',
      render: () => (
        <div className="flex items-center justify-end gap-2">
          <button className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md hover:bg-slate-200">Preview</button>
          <button className="text-sm font-medium text-white bg-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-800">View Details</button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-1 overflow-scroll">
      {/* 2. Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Manage all the users, magazines, subscriptions, publications etc.</p>
      </header>

      {/* 3. Top Stats Row */}
      {errors.dashboard && (
        <ErrorState message={errors.dashboard} onRetry={loadDashboard} className="mb-6" />
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Revenue" value={counts ? inr(counts.revenueYTD) : undefined} color={CHART_COLORS.success} series={revenueSpark} />
        <StatCard title="Active Subscriptions" value={counts ? counts.activeSubscriptions : undefined} color={CHART_COLORS.success} />
        <div className="bg-white rounded-xl border border-slate-200 p-5">
           <div className="flex items-center justify-between mb-1">
             <span className="text-sm font-medium text-slate-700">Magazine Sales</span>
             <span className="text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">This Month</span>
           </div>
           <div className="flex items-baseline gap-2 mt-2">
             <StatValue value={counts ? counts.totalMagazines : undefined} className="text-3xl font-bold text-slate-900" />
             <span className="text-xs text-slate-500">magazines</span>
           </div>
        </div>
      </div>

      {/* 4. Influencer Campaigns (Chart Section) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-slate-900 text-lg">Revenue</h2>
          <div className="flex items-center gap-3">
             <span className="text-xs text-slate-400">Last 12 months</span>
             <Button text="Create Campaigns" variant="primary" />
          </div>
        </div>
        {/* Real monthly revenue from GET /admin/analytics/revenue. Before that
            endpoint existed this panel was a placeholder, and before that a
            hardcoded curve that read as real reporting. */}
        {errors.revenue ? (
          <ErrorState message={errors.revenue} onRetry={loadRevenue} />
        ) : !revenue ? (
          <div className="h-75 w-full flex items-center justify-center text-sm text-slate-400">
            Loading revenue&hellip;
          </div>
        ) : (
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenuePoints} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={(v) => `${ORG.currencySymbol}${Number(v).toLocaleString('en-IN')}`}
                />
                <Tooltip
                  formatter={(v) => [inr(v), 'Revenue']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.success}
                  strokeWidth={2}
                  fill="url(#adminRevenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 5. Bottom Row: Users Circle & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Overall Users */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900">Overall Users</h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Live</span>
            </div>
            <div className="flex justify-center mb-6">
               <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-10 border-slate-100 border-t-indigo-500 border-l-indigo-300">
                  <div className="text-center">
                    <StatValue value={counts ? counts.totalUsers : undefined} className="text-sm font-bold text-slate-900 leading-tight block" />
                    <div className="text-[10px] text-slate-400">Total</div>
                  </div>
               </div>
            </div>
            {errors.analytics ? (
              <ErrorState message={errors.analytics} onRetry={loadAnalytics} className="mb-6" />
            ) : (
              <ul className="space-y-2 mb-6">
                <li className="flex justify-between text-xs"><span className="text-slate-500">New This Month</span> <StatValue value={overview?.newUsersThisMonth} className="font-semibold text-slate-800" /></li>
                <li className="flex justify-between text-xs"><span className="text-slate-500">Active Campaigns</span> <StatValue value={overview?.activeCampaigns} className="font-semibold text-slate-800" /></li>
                <li className="flex justify-between text-xs"><span className="text-slate-500">Active Subscriptions</span> <StatValue value={overview?.subscriptionsActive} className="font-semibold text-slate-800" /></li>
              </ul>
            )}
          </div>
          <Button text="View Details" width="w-full" />
        </div>

        {/* Recent Payments — from the same /admin/dashboard response. This block
            used to render four hardcoded rows ("Visa ending in 1234", "+₹ 49")
            while the real `recentPayments` from that call was discarded. */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900">Recent Payment Deposits</h3>
                <Button text='View deposits' />
            </div>
            {errors.dashboard ? (
              <ErrorState message={errors.dashboard} onRetry={loadDashboard} />
            ) : recentPayments.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No payments yet</p>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-slate-100 rounded" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {p.user?.fullName || p.user?.email || 'Unknown user'}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {p.description || (p.paymentMethod || '').replace(/_/g, ' ') || '—'}
                                  {p.createdAt ? ` · ${fmtDateTime(p.createdAt)}` : ''}
                                </p>
                            </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 shrink-0">
                          +{inr(p.amount)}
                        </span>
                    </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* 6. Magazine Publications Table */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Magazines Publications</h2>
            <p className="text-sm text-slate-500">Recently published magazines and how they are performing</p>
        </div>
        <DataTable
          columns={magazineColumns}
          data={magRows}
          error={errors.magazines}
          onRetry={loadMagazines}
        />
      </section>

      {/* 7. Recent Activity (audit logs) */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          <p className="text-sm text-slate-500">Latest admin actions across the platform</p>
        </div>
        {errors.logs ? (
          <ErrorState message={errors.logs} onRetry={loadLogs} />
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No recent activity</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {(l.action || 'action').replace(/_/g, ' ')}
                    {l.entity ? <span className="text-slate-400"> · {l.entity}</span> : null}
                  </p>
                  <p className="text-xs text-slate-400">{l.actor?.fullName || l.actor?.email || 'System'}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {l.createdAt ? new Date(l.createdAt).toLocaleString('en-IN') : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
