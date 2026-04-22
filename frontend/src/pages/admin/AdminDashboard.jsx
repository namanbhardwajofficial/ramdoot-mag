import React, { useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import StatCard, { MiniChart } from '@/components/ui/stat-card';
import DataTable from '@/components/ui/data-table';
import { CHART_COLORS } from '@/config/theme';
import { ORG } from '@/config/constants';
import Button from "@/components/Button.jsx";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dummy data for the big campaign chart
const campaignData = [
  { name: 'Jan', a: 4000, b: 2400, c: 2400 },
  { name: 'Feb', a: 3000, b: 1398, c: 2210 },
  { name: 'Mar', a: 2000, b: 9800, c: 2290 },
  { name: 'Apr', a: 2780, b: 3908, c: 2000 },
  { name: 'May', a: 1890, b: 4800, c: 2181 },
  { name: 'Jun', a: 2390, b: 3800, c: 2500 },
  { name: 'Jul', a: 3490, b: 4300, c: 2100 },
];

export default function AdminDashboard() {
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

  const dummyMagazines = [
    { id: 1, name: 'Magazines', clicks: 1292129, conversions: 48991, revenue: 275197, published: '12/02/2024' },
    { id: 2, name: 'Magazines', clicks: 1292129, conversions: 48991, revenue: 275197, published: '12/02/2024' },
  ];

  return (
    <div className="p-1 overflow-scroll">
      {/* 1. Breadcrumbs */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>Admin Dashboard</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 2. Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Manage all the users, magazines, subscriptions, publications etc.</p>
      </header>

      {/* 3. Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Revenue" value="₹ 2,75,197" color={CHART_COLORS.success} trend="up" isCurrency />
        <StatCard title="Paid Users" value="1,22,182" color={CHART_COLORS.success} trend="up" />
        <div className="bg-white rounded-xl border border-slate-200 p-5">
           <div className="flex items-center justify-between mb-1">
             <span className="text-sm font-medium text-slate-700">Magazine Sales</span>
             <span className="text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">This Month</span>
           </div>
           <div className="flex items-baseline gap-2 mt-2">
             <span className="text-3xl font-bold text-slate-900">5,368</span>
             <span className="text-xs text-slate-500">copies sold</span>
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
        <div className="h-75 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={campaignData}>
              <defs>
                <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/><stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip />
              <Area type="monotone" dataKey="a" stroke="#4F46E5" fillOpacity={1} fill="url(#colorA)" strokeWidth={2} />
              <Area type="monotone" dataKey="b" stroke="#0EA5E9" fill="transparent" strokeWidth={2} />
              <Area type="monotone" dataKey="c" stroke="#94A3B8" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
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
                    <div className="text-sm font-bold text-slate-900 leading-tight">1.2M</div>
                    <div className="text-[10px] text-slate-400">Total</div>
                  </div>
               </div>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex justify-between text-xs"><span className="text-slate-500">Paid Users</span> <span className="font-semibold text-slate-800">5,48,991 (52%)</span></li>
              <li className="flex justify-between text-xs"><span className="text-slate-500">Unpaid Users</span> <span className="font-semibold text-slate-800">2,75,197 (14%)</span></li>
            </ul>
          </div>
          <Button text="View Details" variant="outline" className="w-full" />
        </div>

        {/* Recent Payments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900">Recent Payment Deposits</h3>
                <button className="text-sm font-medium text-slate-900 bg-slate-100 px-4 py-2 rounded-lg">View deposits &rarr;</button>
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
            <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
        </div>
        <DataTable columns={magazineColumns} data={dummyMagazines} />
      </section>
    </div>
  );
}