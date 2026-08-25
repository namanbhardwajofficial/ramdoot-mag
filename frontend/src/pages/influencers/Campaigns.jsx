import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import DataTable from '@/components/ui/data-table';
import Button from '@/components/Button.jsx';
import { ORG } from '@/config/constants';
import { campaignsApi, listOf, metaOf } from '@/lib/api';

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

const PAGE_SIZE = 10;

export default function Campaigns() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  // The pager used to be hardcoded to "Page n of 10" and changing it refetched
  // nothing, so it paged through a table that never moved. It now drives the
  // request and reads its page count off the response's `meta`.
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback((p) => {
    setLoading(true);
    setError(null);
    return campaignsApi
      .list({ page: p, limit: PAGE_SIZE })
      .then((res) => {
        setRows(listOf(res).map(mapCampaignRow));
        setMeta(metaOf(res, PAGE_SIZE));
      })
      .catch((err) => setError(err.message || 'Could not load campaigns'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let alive = true;
    load(page).then(() => {
      if (!alive) return;
    });
    return () => {
      alive = false;
    };
  }, [load, page]);

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

  const totalPages = Math.max(1, meta.totalPages || 1);

  return (
    <div className="p-1">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
        <p className="text-sm text-slate-500 mt-1">
          View all the earning report from all your links and shares from
        </p>
      </header>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        error={error}
        onRetry={() => load(page)}
        emptyMessage="No campaigns yet"
      />

      {/* Pagination — hidden when everything fits on one page. */}
      {!error && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
