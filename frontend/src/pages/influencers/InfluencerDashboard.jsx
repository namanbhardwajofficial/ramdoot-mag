import React, { useState, useEffect } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@/components/ui/icons';
import { ORG } from '@/config/constants';
import { earningsApi, campaignsApi, magazinesApi, listOf } from '@/lib/api';

function PeriodSelect() {
  return (
    <div className="flex items-center gap-1 text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5">
      This Month
      <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
    </div>
  );
}

// No time series or period-over-period delta exists on GET /earnings, so this
// card shows the figure alone rather than an invented trend line and "+100%".
function MetricCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        <PeriodSelect />
      </div>

      <div className="text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

export default function InfluencerDashboard() {
  const [earnings, setEarnings] = useState(null);
  const [campCount, setCampCount] = useState(null);
  const [mags, setMags] = useState([]);

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
        if (alive) setMags(items);
      })
      .catch((err) => console.warn('magazines', err.message));
    return () => { alive = false; };
  }, []);

  const inr = (n) => `${ORG.currencySymbol} ${Number(n || 0).toLocaleString('en-IN')}`;
  const liveStats = [
    { id: 'links', value: campCount != null ? String(campCount) : '0', label: 'Live Links' },
    { id: 'codes', value: campCount != null ? String(campCount).padStart(2, '0') : '00', label: 'Promo Code' },
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
        />
        <MetricCard
          title="Payout"
          value={earnings ? inr(earnings.completedPayouts) : '₹ 0'}
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
          <p className="text-sm text-slate-500">Magazines you can promote and earn commission on</p>
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

                {/* "View Details" and "Share Magazine" used to sit here with no
                    handlers. Influencers have no magazine-detail route, and
                    sharing is done per-campaign from the campaign page (that is
                    where a promo code exists to attribute the click), so there
                    is nothing for either control to do. Removed rather than
                    left inert. */}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
