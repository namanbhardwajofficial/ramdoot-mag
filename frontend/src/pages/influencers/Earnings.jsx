import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import DataTable from '@/components/ui/data-table';
import StatusBadge from '@/components/ui/status-badge';
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
    billingDate: fmtDate(p.createdAt),
    status: lc(p.status),
    amount: Number(p.amount ?? 0),
    paidBy: 'Admin',
  };
}

const FILTERS = ['All', '1 Month', '6 Month', '1 Year', 'Custom'];

const commissionTrend = [20, 28, 24, 36, 30, 44, 38, 52, 47, 60, 55, 72].map((v) => ({ v }));
const payoutTrend = [12, 16, 14, 22, 19, 27, 24, 30, 28, 36, 33, 44].map((v) => ({ v }));

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

function SummaryCard({ label, value, caption, data, gradientId }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className="text-xs text-slate-400">{caption}</span>
      </div>
      <div className="h-24 mt-3 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#34D399" strokeWidth={2} fill={`url(#${gradientId})`} />
          </AreaChart>
        </ResponsiveContainer>
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

  useEffect(() => {
    let alive = true;
    earningsApi
      .overview()
      .then((res) => { if (alive && res) setEarnings(res); })
      .catch((err) => console.warn('earnings', err.message));
    campaignsApi
      .list({ limit: 50 })
      .then((res) => {
        const items = listOf(res).map(mapEarnCampaign);
        if (alive) setCampRows(items);
      })
      .catch((err) => console.warn('campaigns', err.message));
    earningsApi
      .payouts()
      .then((res) => {
        const items = listOf(res).map(mapInvoice);
        if (alive) setInvoiceRows(items);
      })
      .catch((err) => console.warn('payouts', err.message));
    return () => {
      alive = false;
    };
  }, []);

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

      {/* Filters + date range */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f ? 'bg-white text-slate-900 shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-slate-600 border border-slate-200 rounded-xl px-3 py-2 bg-white">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          Jan 10, 2025 – Jan 16, 2025
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <SummaryCard label="Commission Earning" value={earnings ? inr(earnings.totalEarnings) : '₹ 0'} caption="In Total" data={commissionTrend} gradientId="commissionEarning" />
        <SummaryCard label="Payout Available" value={earnings ? inr(earnings.availableBalance) : '₹ 0'} caption="In your account" data={payoutTrend} gradientId="payoutAvailable" />
      </div>

      {/* Campaigns Commissions */}
      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Campaigns Commissions</h2>
          <p className="text-sm text-slate-500">View all the earning report from all your links and shares from</p>
        </div>
        <DataTable columns={campaignColumns} data={campRows} />
      </section>

      {/* Paid Invoices */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Paid Invoices</h2>
          <p className="text-sm text-slate-500">View all the earning report from all your links and shares from</p>
        </div>
        <DataTable columns={invoiceColumns} data={invoiceRows} />
      </section>
    </div>
  );
}
