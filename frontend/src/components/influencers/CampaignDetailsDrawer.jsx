import { useState, useEffect, useCallback } from 'react';
import Drawer from '@/components/ui/drawer';
import PlatformBadge from './PlatformBadge';
import { ORG } from '@/config/constants';
import { CHART_COLORS } from '@/config/theme';
import { campaignsApi } from '@/lib/api';
import ErrorState from '@/components/ui/error-state';

// Placeholder for figures the backend can't produce yet — see BACKEND_GAPS.md.
const TBD = '—';

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-slate-200 mb-5">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${active === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <div className="text-sm text-slate-800 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">{value || '—'}</div>
    </div>
  );
}

function OverviewTab({ campaign }) {
  return (
    <>
      <Field label="Email *" value={campaign.email} />
      <Field label="Campaign ID" value={`#${campaign.id.replace('camp_', '')}`} />
      <div className="mb-4">
        <label className="block text-xs text-slate-500 mb-1">Influencer Name</label>
        <div className="text-sm text-slate-800 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 flex items-center justify-between">
          {campaign.influencerName}
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
        </div>
      </div>
      <Field label="Campaign Created By" value={campaign.createdBy} />
      <div className="mb-4">
        <label className="block text-xs text-slate-500 mb-1">Campaign Sharing Medium *</label>
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
          {campaign.platforms?.map((p) => <PlatformBadge key={p} platform={p} />)}
        </div>
      </div>
      <Field label="Campaign Status" value={campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1)} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start date" value={new Date(campaign.startingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
        <Field label="End date" value={new Date(campaign.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
      </div>
    </>
  );
}

function MiniLineChart({ data, labels, color = CHART_COLORS.success, height = 80 }) {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const w = 280, h = height;
  const pad = { top: 8, bottom: 4, left: 4, right: 4 };
  const pts = data.map((v, i) => ({
    x: pad.left + (i / (data.length - 1)) * (w - pad.left - pad.right),
    y: pad.top + (1 - v / max) * (h - pad.top - pad.bottom),
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  return <svg viewBox={`0 0 ${w} ${h}`} className="w-full" fill="none"><path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

const money = (v) =>
  v == null ? TBD : `${ORG.currencySymbol}${Number(v).toLocaleString('en-IN')}`;

/**
 * GET /campaigns/:id/financials.
 *
 * Replaces a derivation from /campaigns/:id/overview that could only produce
 * commission — gross revenue, profit, tax and payout state had no source, so
 * half the tiles rendered a permanent dash. The tiles that still have no source
 * (profit, margin, tax, payout state) are gone rather than left dashed forever;
 * what the endpoint does report is shown instead.
 */
function FinancialsTab({ campaignId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await campaignsApi.financials(campaignId));
      setError(null);
    } catch (err) {
      setData(null);
      setError(err.message || 'Could not load financials');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="text-center py-8 text-slate-400">Loading&hellip;</div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <div className="text-center py-8 text-slate-400">Could not load financials.</div>;

  const byDay = Array.isArray(data.revenueByDay) ? data.revenueByDay : [];
  // The API sends a commission *rate* as a fraction (0.15), not a percentage.
  const rate = data.commissionRate == null ? null : `${(Number(data.commissionRate) * 100).toFixed(0)}%`;

  const tiles = [
    ['Influencer Commission', money(data.totalCommission)],
    ['Commission Rate', rate ?? TBD],
    ['Conversions', Number(data.totalConversions || 0).toLocaleString('en-IN')],
    ['Average Order Value', money(data.averageOrderValue)],
  ];

  return (
    <div className="space-y-3">
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
        <p className="text-2xl font-bold">{money(data.totalRevenue)}</p>
        {byDay.length > 1 ? (
          <MiniLineChart
            data={byDay.map((d) => Number(d.revenue ?? d.amount ?? 0))}
            labels={byDay.map((d) => d.date ?? d.period)}
          />
        ) : (
          <p className="mt-2 text-xs text-slate-400">No day-by-day revenue for this campaign yet</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map(([label, value]) => (
          <div key={label} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const TAB_LIST = ['Overview', 'Performance', 'Subscription', 'Financials', 'Actions'];

export default function CampaignDetailsDrawer({ open, campaign, onClose }) {
  const [tab, setTab] = useState('Overview');
  if (!campaign) return null;

  function renderTab() {
    switch (tab) {
      case 'Overview': return <OverviewTab campaign={campaign} />;
      case 'Financials': return <FinancialsTab campaignId={campaign.id} />;
      default: return <div className="text-center py-8 text-slate-400">{tab} — Coming soon</div>;
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Campaign Details">
      <Tabs tabs={TAB_LIST} active={tab} onChange={setTab} />
      {renderTab()}
    </Drawer>
  );
}
