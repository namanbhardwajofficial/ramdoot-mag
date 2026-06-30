import React, { useState, useEffect } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import Button from '@/components/Button.jsx';
import { ChevronRightIcon, ChevronDownIcon } from '@/components/ui/icons';
import { CHART_COLORS } from '@/config/theme';
import { ORG } from '@/config/constants';
import { earningsApi, campaignsApi, magazinesApi, listOf } from '@/lib/api';

// Mini trend series for the Earning / Payout cards.
const earningTrend = [10, 14, 11, 18, 16, 24, 21, 30, 27, 38].map((v) => ({ v }));
const payoutTrend = [12, 17, 14, 22, 28, 25, 34, 31, 40, 46].map((v) => ({ v }));

const promoStats = [
  { id: 'links', value: '20', label: 'Live Links' },
  { id: 'codes', value: '03', label: 'Promo Code' },
];

const sponsoredMagazines = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  title: 'Ramdoot August 2026 Edition',
  desc: 'Curated magazine delivering insights, trends and inspiration across technology, culture & lifestyle.',
  clicks: '23K Clicks',
}));

function UpArrow(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function PeriodSelect() {
  return (
    <div className="flex items-center gap-1 text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5">
      This Month
      <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
    </div>
  );
}

function MetricCard({ title, value, change, data, gradientId }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        <PeriodSelect />
      </div>

      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs">
        <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600">
          <UpArrow className="w-3 h-3" />
          {change}
        </span>
        <span className="text-slate-400">vs last month</span>
      </div>

      <div className="h-16 mt-4 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.25} />
                <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={CHART_COLORS.success}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function InfluencerDashboard() {
  const [earnings, setEarnings] = useState(null);
  const [campCount, setCampCount] = useState(null);
  const [mags, setMags] = useState(sponsoredMagazines);

  useEffect(() => {
    let alive = true;
    earningsApi
      .overview()
      .then((res) => { if (alive && res) setEarnings(res); })
      .catch((err) => console.warn('earnings', err.message));
    campaignsApi
      .list({ limit: 100 })
      .then((res) => { if (alive) setCampCount(listOf(res).length); })
      .catch((err) => console.warn('campaigns', err.message));
    magazinesApi
      .list({ status: 'LIVE', limit: 4 })
      .then((res) => {
        const items = listOf(res).map((m) => ({
          id: m.id,
          title: m.title,
          desc: m.shortDescription || m.description || '',
          clicks: `${(m.viewsCount ?? 0).toLocaleString('en-IN')} Clicks`,
        }));
        if (alive && items.length) setMags(items);
      })
      .catch((err) => console.warn('magazines', err.message));
    return () => { alive = false; };
  }, []);

  const inr = (n) => `${ORG.currencySymbol} ${Number(n || 0).toLocaleString('en-IN')}`;
  const liveStats = [
    { id: 'links', value: campCount != null ? String(campCount) : promoStats[0].value, label: 'Live Links' },
    { id: 'codes', value: campCount != null ? String(campCount).padStart(2, '0') : promoStats[1].value, label: 'Promo Code' },
  ];

  return (
    <div className="p-1">
      {/* Page title */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Influencer Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage promo code, earning, and everything needed from one place
        </p>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <MetricCard
          title="Earning"
          value={earnings ? inr(earnings.totalEarnings) : '₹ 0'}
          change="100%"
          data={earningTrend}
          gradientId="earningGradient"
        />
        <MetricCard
          title="Payout"
          value={earnings ? inr(earnings.completedPayouts) : '₹ 0'}
          change="100%"
          data={payoutTrend}
          gradientId="payoutGradient"
        />

        {/* Live Promo Code & Links */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Live Promo Code &amp; Links</h3>
          <div className="space-y-3">
            {liveStats.map((stat) => (
              <button
                key={stat.id}
                type="button"
                className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                  <span className="text-sm text-slate-500">{stat.label}</span>
                </span>
                <ChevronRightIcon className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sponsored Magazines */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Sponsored Magazine</h2>
          <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {mags.map((mag) => (
            <article
              key={mag.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-36 h-36 bg-slate-200 rounded-xl shrink-0" />

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-semibold text-slate-900">{mag.title}</h4>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{mag.clicks}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{mag.desc}</p>

                <div className="mt-auto pt-4 flex items-center gap-4">
                  <Button text="View Details" />
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Share Magazine
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
