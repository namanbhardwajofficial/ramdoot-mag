import { useState, useEffect } from 'react';
import DataTable from '@/components/ui/data-table';
import StatusBadge from '@/components/ui/status-badge';
import { ORG } from '@/config/constants';
import { earningsApi, listOf, lc } from '@/lib/api';

const money = (v) => `${ORG.currencySymbol} ${Number(v || 0).toLocaleString('en-IN')}`;

const columns = [
  { key: 'formId', label: 'Form ID', render: (v) => <span className="font-medium text-slate-800">{v}</span> },
  { key: 'date', label: 'Initiate Date', render: (v) => <span className="text-slate-500">{v}</span> },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  { key: 'funds', label: 'Funds Requested', render: money },
  { key: 'remaining', label: 'Remaining Balance', render: money },
];

export default function RequestedPayout() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let alive = true;
    earningsApi
      .payouts()
      .then((res) => {
        if (!alive) return;
        setRows(
          listOf(res).map((p) => ({
            id: p.id,
            formId: `#${String(p.id).slice(0, 8)}`,
            date: p.createdAt
              ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—',
            status: lc(p.status),
            funds: Number(p.amount || 0),
            remaining: Number(p.amount || 0),
          })),
        );
      })
      .catch((err) => console.warn('payouts', err.message));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="p-1">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Requested Payout</h1>
        <p className="text-sm text-slate-500 mt-1">View all the earning report from all your links and shares from</p>
      </header>

      <DataTable columns={columns} data={rows} />
    </div>
  );
}
