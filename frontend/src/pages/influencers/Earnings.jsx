import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import DataTable from '@/components/ui/data-table';
import StatusBadge from '@/components/ui/status-badge';
import ErrorState from '@/components/ui/error-state';
import Button from '@/components/Button.jsx';
import { CalendarIcon } from '@/components/ui/icons';
import { ORG } from '@/config/constants';
import { earningsApi, campaignsApi, listOf, lc } from '@/lib/api';

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}
const inr = (n) => `${ORG.currencySymbol} ${Number(n || 0).toLocaleString('en-IN')}`;

function mapEarnCampaign(c) {
  const clicks = c._count?.clickEvents ?? 0;
  const conv = c._count?.conversions ?? 0;
  return {
    id: c.id,
    name: c.name,
    // Keep the raw timestamp alongside the display string so the period filter
    // has something to compare against.
    at: c.startDate ? new Date(c.startDate).getTime() : null,
    startingDate: fmtDate(c.startDate),
    totalClicks: clicks,
    clickConversions: conv,
    conversions: clicks ? `${Math.round((conv / clicks) * 100)}%` : '0%',
    commission: 0,
  };
}

function mapInvoice(p) {
  return {
    id: p.id,
    name: `Payout #${String(p.id).slice(0, 6)}`,
    at: p.createdAt ? new Date(p.createdAt).getTime() : null,
    billingDate: fmtDate(p.createdAt),
    status: lc(p.status),
    amount: Number(p.amount ?? 0),
    paidBy: 'Admin',
  };
}

// Period filter. "Custom" was dropped — there is no date picker behind it, so it
// was a fourth way to select nothing. `months: null` means "no cutoff".
const FILTERS = [
  { label: 'All', months: null },
  { label: '1 Month', months: 1 },
  { label: '6 Month', months: 6 },
  { label: '1 Year', months: 12 },
];

// Start of the selected window, or null for "All".
function cutoffFor(months, now = new Date()) {
  if (!months) return null;
  const d = new Date(now);
  d.setMonth(d.getMonth() - months);
  return d;
}

function withinPeriod(rows, months) {
  const cutoff = cutoffFor(months);
  if (!cutoff) return rows;
  const min = cutoff.getTime();
  return rows.filter((r) => r.at == null || r.at >= min);
}

function PdfIcon() {
  return (
    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-500 shrink-0">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    </span>
  );
}

/**
 * Both cards used to draw an AreaChart over a literal array — a confident
 * twelve-point climb that was identical for every influencer and every balance,
 * including a balance of zero. No per-influencer time series exists (there is no
 * `GET /earnings/timeseries`), so the chart is gone rather than invented. The
 * figure is real; nothing beside it now claims to be.
 *
 * `value` of null means the fetch has not landed or failed — a dash, not "₹ 0",
 * which would assert a real balance of zero.
 */
function SummaryCard({ label, value, caption }) {
  const unknown = value === null || value === undefined;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="flex items-baseline gap-2 mt-2">
        {unknown ? (
          <span className="text-3xl font-bold text-slate-300" title="Not loaded">&mdash;</span>
        ) : (
          <>
            <span className="text-3xl font-bold text-slate-900">{value}</span>
            <span className="text-xs text-slate-400">{caption}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function Earnings() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [earnings, setEarnings] = useState(null);
  const [campRows, setCampRows] = useState([]);
  const [invoiceRows, setInvoiceRows] = useState([]);
  // One error slot per region. These three fetches used to console.warn and
  // leave the screen looking merely empty.
  const [errors, setErrors] = useState({ earnings: null, campaigns: null, payouts: null });
  const [loading, setLoading] = useState({ earnings: true, campaigns: true, payouts: true });

  const setErr = (key, msg) => setErrors((e) => ({ ...e, [key]: msg }));
  const setBusy = (key, v) => setLoading((l) => ({ ...l, [key]: v }));

  const loadEarnings = useCallback(() => {
    setBusy('earnings', true);
    setErr('earnings', null);
    return earningsApi
      .overview()
      .then((res) => setEarnings(res || null))
      .catch((err) => setErr('earnings', err.message || 'Could not load earnings'))
      .finally(() => setBusy('earnings', false));
  }, []);

  const loadCampaigns = useCallback(() => {
    setBusy('campaigns', true);
    setErr('campaigns', null);
    return campaignsApi
      .list({ limit: 50 })
      .then((res) => setCampRows(listOf(res).map(mapEarnCampaign)))
      .catch((err) => setErr('campaigns', err.message || 'Could not load campaigns'))
      .finally(() => setBusy('campaigns', false));
  }, []);

  const loadPayouts = useCallback(() => {
    setBusy('payouts', true);
    setErr('payouts', null);
    return earningsApi
      .payouts()
      .then((res) => setInvoiceRows(listOf(res).map(mapInvoice)))
      .catch((err) => setErr('payouts', err.message || 'Could not load payouts'))
      .finally(() => setBusy('payouts', false));
  }, []);

  useEffect(() => {
    loadEarnings();
    loadCampaigns();
    loadPayouts();
  }, [loadEarnings, loadCampaigns, loadPayouts]);

  const months = FILTERS.find((f) => f.label === filter)?.months ?? null;
  const visibleCampaigns = withinPeriod(campRows, months);
  const visibleInvoices = withinPeriod(invoiceRows, months);
  const rangeStart = cutoffFor(months);
  const fmtShort = (d) =>
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const campaignColumns = [
    { key: 'name', label: 'Campaign Name', render: (v) => <span className="font-medium text-slate-800">{v}</span> },
    { key: 'startingDate', label: 'Starting Date', render: (v) => <span className="text-slate-500">{v}</span> },
    { key: 'totalClicks', label: 'Total Clicks', render: (v) => v.toLocaleString('en-IN') },
    { key: 'clickConversions', label: 'Click Conversions', render: (v) => v.toLocaleString('en-IN') },
    { key: 'conversions', label: 'Conversions' },
    { key: 'commission', label: 'Commission Earned', render: (v) => `${ORG.currencySymbol} ${v.toLocaleString('en-IN')}` },
    {
      key: '_actions', label: '', align: 'right',
      render: (_v, row) => (
        <div className="flex justify-end">
          <Button text="View Campaign" handler={() => navigate(`/influencer/campaigns/${row.id}`)} />
        </div>
      ),
    },
  ];

  const invoiceColumns = [
    {
      key: 'name', label: 'Invoice',
      render: (v) => (
        <div className="flex items-center gap-3">
          <PdfIcon />
          <span className="font-medium text-slate-800">{v}</span>
        </div>
      ),
    },
    { key: 'billingDate', label: 'Billing Date', render: (v) => <span className="text-slate-500">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'amount', label: 'Amount', render: (v) => `${ORG.currencySymbol} ${v.toLocaleString('en-IN')}` },
    { key: 'paidBy', label: 'Paid By', render: (v) => <span className="text-slate-500">{v}</span> },
  ];

  return (
    <div className="p-1">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earning Reports</h1>
          <p className="text-sm text-slate-500 mt-1">View all the earning report from all your links and shares from</p>
        </div>
        <Button text="Request Payout" handler={() => navigate('/influencer/earnings/request-payout')} />
      </div>

      {/* Filters + date range. The buttons now actually narrow both tables, and
          the range label is computed from the selection instead of the fixed
          "Jan 10, 2025 – Jan 16, 2025" that used to sit here. */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setFilter(f.label)}
              aria-pressed={filter === f.label}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f.label ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-xl px-3 py-2 bg-white">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          {rangeStart ? `${fmtShort(rangeStart)} – ${fmtShort(new Date())}` : 'All time'}
        </div>
      </div>

      {/* Summary cards */}
      {errors.earnings ? (
        <div className="mb-10">
          <ErrorState message={errors.earnings} onRetry={loadEarnings} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          <SummaryCard
            label="Commission Earning"
            value={earnings ? inr(earnings.totalEarnings) : null}
            caption="In Total"
          />
          <SummaryCard
            label="Payout Available"
            value={earnings ? inr(earnings.availableBalance) : null}
            caption="In your account"
          />
        </div>
      )}

      {/* Campaigns Commissions */}
      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Campaigns Commissions</h2>
          <p className="text-sm text-slate-500">View all the earning report from all your links and shares from</p>
        </div>
        <DataTable
          columns={campaignColumns}
          data={visibleCampaigns}
          loading={loading.campaigns}
          error={errors.campaigns}
          onRetry={loadCampaigns}
          emptyMessage={months ? 'No campaigns in this period' : 'No campaigns yet'}
        />
      </section>

      {/* Paid Invoices */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Paid Invoices</h2>
          <p className="text-sm text-slate-500">View all the earning report from all your links and shares from</p>
        </div>
        <DataTable
          columns={invoiceColumns}
          data={visibleInvoices}
          loading={loading.payouts}
          error={errors.payouts}
          onRetry={loadPayouts}
          emptyMessage={months ? 'No payouts in this period' : 'No payouts yet'}
        />
      </section>
    </div>
  );
}
