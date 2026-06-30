import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import DataTable from '@/components/ui/data-table';
import Button from '@/components/Button.jsx';
import { ORG } from '@/config/constants';
import { campaignsApi, listOf } from '@/lib/api';

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

// Backend campaign -> the row shape this table expects.
function mapCampaignRow(c) {
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

const campaigns = [
  { id: 1, name: 'Campaign Name 1', startingDate: '22 Jan 2025', totalClicks: 2128, clickConversions: 200, conversions: '20%', commission: 12000 },
  { id: 2, name: 'Campaign Name 2', startingDate: '20 Jan 2025', totalClicks: 382, clickConversions: 102, conversions: '10%', commission: 1400 },
  { id: 3, name: 'Campaign Name 3', startingDate: '24 Jan 2025', totalClicks: 1021, clickConversions: 783, conversions: '12%', commission: 9280 },
  { id: 4, name: 'Campaign Name 4', startingDate: '26 Jan 2025', totalClicks: 122, clickConversions: 19, conversions: '30%', commission: 1000 },
  { id: 5, name: 'Campaign Name 4', startingDate: '26 Jan 2025', totalClicks: 122, clickConversions: 19, conversions: '30%', commission: 1000 },
  { id: 6, name: 'Campaign Name 4', startingDate: '26 Jan 2025', totalClicks: 122, clickConversions: 19, conversions: '30%', commission: 1000 },
  { id: 7, name: 'Campaign Name 4', startingDate: '26 Jan 2025', totalClicks: 122, clickConversions: 19, conversions: '30%', commission: 1000 },
  { id: 8, name: 'Campaign Name 4', startingDate: '26 Jan 2025', totalClicks: 122, clickConversions: 19, conversions: '30%', commission: 1000 },
];

const TOTAL_PAGES = 10;

export default function Campaigns() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(campaigns);

  useEffect(() => {
    let alive = true;
    campaignsApi
      .list({ limit: 50 })
      .then((res) => {
        const items = listOf(res).map(mapCampaignRow);
        if (alive && items.length) setRows(items);
      })
      .catch((err) => console.warn('campaigns', err.message));
    return () => {
      alive = false;
    };
  }, []);

  const columns = [
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

  return (
    <div className="p-1">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
        <p className="text-sm text-slate-500 mt-1">
          View all the earning report from all your links and shares from
        </p>
      </header>

      <DataTable columns={columns} data={rows} />

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="text-sm text-slate-500">
          Page {page} of {TOTAL_PAGES}
        </span>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))}
          disabled={page === TOTAL_PAGES}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
