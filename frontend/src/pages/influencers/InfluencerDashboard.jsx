import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRightIcon } from '@/components/ui/icons';
import ErrorState from '@/components/ui/error-state';
import { ORG, API_ORIGIN } from '@/config/constants';
import { earningsApi, campaignsApi, magazinesApi, listOf, MAGAZINE_PLACEHOLDER } from '@/lib/api';

// The "This Month" pill next to each figure was a static div with a chevron —
// it looked like a period selector and nothing behind it could filter by period
// (`GET /earnings` returns lifetime totals only). Removed rather than left
// pretending; the caption below now says plainly what the number covers.

// No time series or period-over-period delta exists on GET /earnings, so this
// card shows the figure alone rather than an invented trend line and "+100%".
// A null value means the fetch failed or has not landed — a dash, since "₹ 0"
// would assert a real balance of zero.
function MetricCard({ title, value, caption }) {
  const unknown = value === null || value === undefined;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        {caption && <span className="text-xs text-slate-400">{caption}</span>}
      </div>

      <div className="text-3xl font-bold text-slate-900">
        {unknown ? <span className="text-slate-300" title="Not loaded">&mdash;</span> : value}
      </div>
    </div>
  );
}

export default function InfluencerDashboard() {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState(null);
  const [campCount, setCampCount] = useState(null);
  const [mags, setMags] = useState([]);
  const [errors, setErrors] = useState({ earnings: null, campaigns: null, magazines: null });

  const setErr = (key, msg) => setErrors((e) => ({ ...e, [key]: msg }));

  const loadEarnings = useCallback(() => {
    setErr('earnings', null);
    return earningsApi
      .overview()
      .then((res) => setEarnings(res || null))
      .catch((err) => setErr('earnings', err.message || 'Could not load earnings'));
  }, []);

  const loadCampaigns = useCallback(() => {
    setErr('campaigns', null);
    return campaignsApi
      .list({ limit: 100 })
      .then((res) => setCampCount(listOf(res).length))
      .catch((err) => setErr('campaigns', err.message || 'Could not load campaigns'));
  }, []);

  const loadMagazines = useCallback(() => {
    setErr('magazines', null);
    return magazinesApi
      .list({ status: 'LIVE', limit: 4 })
      .then((res) =>
        setMags(
          listOf(res).map((m) => ({
            id: m.id,
            title: m.title,
            desc: m.shortDescription || m.description || '',
            cover: m.coverImageUrl
              ? m.coverImageUrl.startsWith('http')
                ? m.coverImageUrl
                : `${API_ORIGIN}${m.coverImageUrl}`
              : MAGAZINE_PLACEHOLDER,
            clicks: `${(m.viewsCount ?? 0).toLocaleString('en-IN')} Clicks`,
          })),
        ),
      )
      .catch((err) => setErr('magazines', err.message || 'Could not load magazines'));
  }, []);

  useEffect(() => {
    loadEarnings();
    loadCampaigns();
    loadMagazines();
  }, [loadEarnings, loadCampaigns, loadMagazines]);

  const inr = (n) => `${ORG.currencySymbol} ${Number(n || 0).toLocaleString('en-IN')}`;
  const liveStats = [
    { id: 'links', value: campCount != null ? String(campCount) : null, label: 'Live Links' },
    { id: 'codes', value: campCount != null ? String(campCount).padStart(2, '0') : null, label: 'Promo Code' },
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
      {errors.earnings && (
        <div className="mb-5">
          <ErrorState message={errors.earnings} onRetry={loadEarnings} />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <MetricCard
          title="Earning"
          caption="Lifetime"
          value={earnings ? inr(earnings.totalEarnings) : null}
        />
        <MetricCard
          title="Payout"
          caption="Paid out"
          value={earnings ? inr(earnings.completedPayouts) : null}
        />

        {/* Live Promo Code & Links — both rows now open the campaigns list,
            which is where the links and promo codes actually live. They were
            inert buttons with a chevron before. */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Live Promo Code &amp; Links</h3>
          {errors.campaigns ? (
            <ErrorState message={errors.campaigns} onRetry={loadCampaigns} className="px-3 py-4" />
          ) : (
            <div className="space-y-3">
              {liveStats.map((stat) => (
                <button
                  key={stat.id}
                  type="button"
                  onClick={() => navigate('/influencer/campaigns')}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-slate-900">
                      {stat.value ?? <span className="text-slate-300" title="Not loaded">&mdash;</span>}
                    </span>
                    <span className="text-sm text-slate-500">{stat.label}</span>
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sponsored Magazines */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Sponsored Magazine</h2>
          <p className="text-sm text-slate-500">Magazines you can promote and earn commission on</p>
        </div>

        {errors.magazines ? (
          <ErrorState message={errors.magazines} onRetry={loadMagazines} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {mags.length === 0 && (
              <p className="text-sm text-slate-400">No live magazines to promote yet.</p>
            )}
            {mags.map((mag) => (
              <article
                key={mag.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 hover:shadow-md transition-shadow"
              >
                {/* Was a blank grey square even when a cover existed. */}
                <img
                  src={mag.cover}
                  alt=""
                  className="w-36 h-36 rounded-xl shrink-0 object-cover bg-slate-200"
                  loading="lazy"
                />

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
        )}
      </section>
    </div>
  );
}
