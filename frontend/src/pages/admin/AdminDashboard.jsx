import React, { useState, useEffect } from 'react';
import StatCard, { MiniChart } from '@/components/ui/stat-card';
import DataTable from '@/components/ui/data-table';
import { CHART_COLORS } from '@/config/theme';
import { ORG } from '@/config/constants';
import Button from "@/components/Button.jsx";
import { adminApi, magazinesApi, listOf } from '@/lib/api';

// Dummy data for the big campaign chart
export default function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const [magRows, setMagRows] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const dash = await adminApi.dashboard();
        if (alive) setCounts(dash?.counts || null);
      } catch (err) { console.warn('admin dashboard', err.message); }
      try {
        const a = await adminApi.analytics();
        if (alive) setAnalytics(a || null);
      } catch (err) { console.warn('admin analytics', err.message); }
      try {
        const res = await adminApi.auditLogs({ limit: 6 });
        if (alive) setLogs(listOf(res));
      } catch (err) { console.warn('audit logs', err.message); }
      try {
        const mags = listOf(await magazinesApi.list({ limit: 5 })).map((m) => ({
          id: m.id,
          name: m.title,
          clicks: m.viewsCount ?? 0,
          conversions: m.readsCount ?? 0,
          revenue: Number(m.price ?? 0),
          published: m.publishedAt
            ? new Date(m.publishedAt).toLocaleDateString('en-IN')
            : '—',
        }));
        if (alive) setMagRows(mags);
      } catch (err) { console.warn('dashboard magazines', err.message); }
    })();
    return () => { alive = false; };
  }, []);

  const inr = (n) => `${ORG.currencySymbol} ${Number(n || 0).toLocaleString('en-IN')}`;

  // Magazines Table Columns - Matching your user list style
  const magazineColumns = [
    {
      key: 'name', label: 'Magazines',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" /> {/* Placeholder Image */}
          <div>
            <div className="font-medium text-slate-800">{v}</div>
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live
            </div>
          </div>
        </div>
      ),
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Revenue" value={counts ? inr(counts.revenueYTD) : '₹ 0'} color={CHART_COLORS.success} trend="up" isCurrency />
        <StatCard title="Active Subscriptions" value={counts ? counts.activeSubscriptions.toLocaleString('en-IN') : '0'} color={CHART_COLORS.success} trend="up" />
        <div className="bg-white rounded-xl border border-slate-200 p-5">
           <div className="flex items-center justify-between mb-1">
             <span className="text-sm font-medium text-slate-700">Magazine Sales</span>
             <span className="text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">This Month</span>
           </div>
           <div className="flex items-baseline gap-2 mt-2">
             <span className="text-3xl font-bold text-slate-900">{counts ? counts.totalMagazines.toLocaleString('en-IN') : '0'}</span>
             <span className="text-xs text-slate-500">magazines</span>
           </div>
           <MiniChart color={CHART_COLORS.success} trend="up" />
        </div>
      </div>

      {/* 4. Influencer Campaigns (Chart Section) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-slate-900 text-lg">Influencers Campaigns</h2>
          <div className="flex items-center gap-3">
             <select className="text-xs border border-slate-200 rounded-md px-2 py-1.5 outline-none">
                <option>Revenue</option>
             </select>
             <Button text="Create Campaigns" variant="primary" />
          </div>
        </div>
        {/* No revenue time series exists yet: GET /admin/analytics/dashboard
            returns only { total, thisMonth, pendingPayouts }. This used to draw
            a hardcoded curve, which read as real reporting. */}
        <div className="h-75 w-full flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
          Campaign revenue over time isn&apos;t available yet.
        </div>
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
                    <div className="text-sm font-bold text-slate-900 leading-tight">{counts ? counts.totalUsers.toLocaleString('en-IN') : '0'}</div>
                    <div className="text-[10px] text-slate-400">Total</div>
                  </div>
               </div>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex justify-between text-xs"><span className="text-slate-500">New This Month</span> <span className="font-semibold text-slate-800">{analytics ? analytics.overview.newUsersThisMonth.toLocaleString('en-IN') : '—'}</span></li>
              <li className="flex justify-between text-xs"><span className="text-slate-500">Active Campaigns</span> <span className="font-semibold text-slate-800">{analytics ? analytics.overview.activeCampaigns.toLocaleString('en-IN') : '—'}</span></li>
              <li className="flex justify-between text-xs"><span className="text-slate-500">Active Subscriptions</span> <span className="font-semibold text-slate-800">{analytics ? analytics.overview.subscriptionsActive.toLocaleString('en-IN') : '—'}</span></li>
            </ul>
          </div>
          <Button text="View Details" width="w-full" />
        </div>
      
        {/* Recent Payments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900">Recent Payment Deposits</h3>
                <Button text='View deposits' />
            </div>
            <div className="space-y-4">
                {[1,2,3,4].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-6 bg-slate-100 rounded" />
                            <div>
                                <p className="text-sm font-medium text-slate-800">Visa ending in 1234</p>
                                <p className="text-xs text-slate-400">Expiry 06/2025</p>
                            </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-600">+₹ 49</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* 6. Magazine Publications Table */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Magazines Publications</h2>
            <p className="text-sm text-slate-500">Recently published magazines and how they are performing</p>
        </div>
        <DataTable columns={magazineColumns} data={magRows} />
      </section>

      {/* 7. Recent Activity (audit logs) */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          <p className="text-sm text-slate-500">Latest admin actions across the platform</p>
        </div>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No recent activity</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {(l.action || 'action').replace(/_/g, ' ')}
                    {l.entityType ? <span className="text-slate-400"> · {l.entityType}</span> : null}
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