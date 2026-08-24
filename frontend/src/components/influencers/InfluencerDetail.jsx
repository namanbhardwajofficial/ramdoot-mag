import { useState, useEffect, useCallback } from 'react';
import StatusBadge from '@/components/ui/status-badge';
import DataTable from '@/components/ui/data-table';
import Toolbar from '@/components/ui/toolbar';
import { ORG } from '@/config/constants';
import useInfluencers from '@/hooks/useInfluencers';
import ErrorState from '@/components/ui/error-state';
import { adminApi, listOf } from '@/lib/api';

// Placeholder for tabs whose backing endpoint doesn't exist yet. Better than a
// spinner that never resolves — see BACKEND_GAPS.md.
function NotAvailable({ what }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
      <p className="text-sm text-slate-500">{what} isn&apos;t available yet.</p>
      <p className="mt-1 text-xs text-slate-400">This view is waiting on a backend endpoint.</p>
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-slate-200 mb-6">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${active === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Avatar({ size = 'lg' }) {
  const cls = size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  return (
    <div className={`${cls} rounded-full bg-slate-200 shrink-0 flex items-center justify-center`}>
      <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    </div>
  );
}

function CampaignsTab({ influencerId }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getInfluencerCampaigns } = useInfluencers();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getInfluencerCampaigns(influencerId)
      .then((rows) => alive && setCampaigns(rows))
      .catch((err) => console.warn('influencerCampaigns', err.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [influencerId, getInfluencerCampaigns]);

  const columns = [
    { key: 'name', label: 'Campaign Name' },
    { key: 'startingDate', label: 'Starting Date', render: (v) => formatDate(v) },
    { key: 'totalClicks', label: 'Total Clicks', render: (v) => v?.toLocaleString('en-IN') },
    { key: 'clickConversion', label: 'Click Conversions', render: (v) => v?.toLocaleString('en-IN') },
    { key: 'conversions', label: 'Conversions' },
    { key: 'commissionEarned', label: 'Commission Earned', render: (v) => `${ORG.currencySymbol}${v?.toLocaleString('en-IN')}` },
    {
      key: '_actions', label: '', align: 'right',
      render: () => (
        <button className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-full hover:bg-slate-800">
          View Campaign
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      ),
    },
  ];

  return (
    <>
      <h2 className="text-lg font-semibold mb-1">Active Campaign</h2>
      <p className="text-sm text-slate-500 mb-4">Campaigns this influencer is currently running</p>
      <Toolbar statusFilter="" onStatusChange={() => {}} statusOptions={[]} search="" onSearchChange={() => {}} />
      <DataTable columns={columns} data={campaigns} loading={loading} />
    </>
  );
}

// Small helper so every tab here loads the same way: one call, its own error,
// its own retry.
function useTabData(fetcher, dep) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetcher(dep));
      setError(null);
    } catch (err) {
      setData(null);
      setError(err.message || 'Could not load this');
    } finally {
      setLoading(false);
    }
    // fetcher is a stable module-level api function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);

  useEffect(() => { load(); }, [load]);
  return { data, error, loading, reload: load };
}

function Tile({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-[170px]">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

/**
 * GET /influencers/:id/audience.
 *
 * The mock this replaced showed refund rate, paid-vs-free split and revenue per
 * subscriber. The endpoint reports none of those — it reports reach and
 * conversion — so the tab now shows what actually exists rather than keeping
 * three tiles that could never be filled.
 */
function AudienceTab({ influencerId }) {
  const { data, error, loading, reload } = useTabData(adminApi.influencerAudience, influencerId);

  if (loading) return <div className="py-10 text-center text-sm text-slate-400">Loading&hellip;</div>;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <NotAvailable what="Audience data" />;

  const media = Array.isArray(data.clicksByMedium) ? data.clicksByMedium : [];
  const peak = Math.max(1, ...media.map((m) => Number(m.count) || 0));
  const top = Array.isArray(data.topCampaigns) ? data.topCampaigns : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Tile label="Total clicks" value={Number(data.totalClicks || 0).toLocaleString('en-IN')} />
        <Tile label="Conversions" value={Number(data.totalConversions || 0).toLocaleString('en-IN')} />
        <Tile label="Conversion rate" value={data.conversionRate ?? '—'} />
        <Tile
          label="Commission earned"
          value={`${ORG.currencySymbol}${Number(data.totalCommissionEarned || 0).toLocaleString('en-IN')}`}
        />
        <Tile label="Active campaigns" value={Number(data.activeCampaigns || 0).toLocaleString('en-IN')} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-800">Where the clicks came from</h3>
        {media.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No clicks recorded yet</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {media.map((m) => (
              <li key={m.medium} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm capitalize text-slate-600">{m.medium}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-emerald-500"
                    style={{ width: `${((Number(m.count) || 0) / peak) * 100}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right text-sm font-medium text-slate-700">{m.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-1 text-lg font-semibold">Top campaigns</h3>
        <p className="mb-4 text-sm text-slate-500">Ranked by clicks</p>
        <DataTable
          columns={[
            { key: 'name', label: 'Campaign' },
            { key: 'promoCode', label: 'Promo code' },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v || '').toLowerCase()} /> },
            { key: 'clicks', label: 'Clicks', render: (v) => Number(v || 0).toLocaleString('en-IN') },
            { key: 'conversions', label: 'Conversions', render: (v) => Number(v || 0).toLocaleString('en-IN') },
          ]}
          data={top}
          emptyMessage="No campaigns yet"
        />
      </div>
    </div>
  );
}

/**
 * GET /admin/influencers/:id/payments — rows match /admin/payments.
 *
 * The mock this replaced showed a payment model, commission rate, tax status,
 * next-payout countdown and bank details. None of that is exposed for another
 * user, so rather than keep tiles that can only ever be blank this is the real
 * payment history and nothing more.
 */
function PaymentsTab({ influencerId }) {
  const { data, error, loading, reload } = useTabData(adminApi.influencerPayments, influencerId);
  const rows = data ? listOf(data) : [];

  return (
    <>
      <h2 className="mb-1 text-lg font-semibold">Payment history</h2>
      <p className="mb-4 text-sm text-slate-500">Payments attributed to this influencer</p>
      <DataTable
        columns={[
          { key: 'description', label: 'Description', render: (v) => v || '—' },
          { key: 'createdAt', label: 'Date', render: (v) => formatDate(v) },
          { key: 'paymentMethod', label: 'Method', render: (v) => String(v || '—').replace(/_/g, ' ') },
          {
            key: 'amount',
            label: 'Amount',
            render: (v) => `${ORG.currencySymbol}${Number(v || 0).toLocaleString('en-IN')}`,
          },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v || '').toLowerCase()} /> },
        ]}
        data={rows}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyMessage="No payments attributed to this influencer yet"
      />
    </>
  );
}

const TAB_LIST = ['Overview', 'Campaigns', 'Analytics', 'Audience', 'Payments', 'Profile & Activity', 'Admin Controls'];

export default function InfluencerDetail({ influencer, onBack, onRestrict, onCreateCampaign }) {
  const [tab, setTab] = useState('Campaigns');

  function renderTab() {
    switch (tab) {
      case 'Campaigns': return <CampaignsTab influencerId={influencer.id} />;
      case 'Audience':  return <AudienceTab influencerId={influencer.id} />;
      case 'Payments':  return <PaymentsTab influencerId={influencer.id} />;
      default: return <div className="flex items-center justify-center h-40 text-slate-400">{tab} — Coming soon</div>;
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{influencer.realName || influencer.name}</h1>
              <StatusBadge status={influencer.status} />
            </div>
            <p className="text-sm text-slate-500">
              ID: #{influencer.id.replace('inf_', '')} &nbsp; Joining Date: {formatDate(influencer.joinedOn)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Edit
          </button>
          <button onClick={() => onRestrict(influencer.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" /></svg>
            Restrict Account
          </button>
          <button onClick={onCreateCampaign} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
            Create Campaigns
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <Tabs tabs={TAB_LIST} active={tab} onChange={setTab} />
      {renderTab()}
    </>
  );
}
