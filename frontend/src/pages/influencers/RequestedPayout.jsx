import React from 'react';
import DataTable from '@/components/ui/data-table';
import StatusBadge from '@/components/ui/status-badge';
import { ORG } from '@/config/constants';

const requests = [
  { id: 'r1', formId: '#12332124', date: '22 Jan 2025', status: 'initiated', funds: 12000, remaining: 12000 },
  { id: 'r2', formId: '#12332124', date: '20 Jan 2025', status: 'success', funds: 1400, remaining: 1400 },
  { id: 'r3', formId: '#12332124', date: '24 Jan 2025', status: 'success', funds: 9280, remaining: 9280 },
  { id: 'r4', formId: '#12332124', date: '26 Jan 2025', status: 'success', funds: 1000, remaining: 1000 },
  { id: 'r5', formId: '#12332124', date: '26 Jan 2025', status: 'failed', funds: 1000, remaining: 1000 },
];

const money = (v) => `${ORG.currencySymbol} ${v.toLocaleString('en-IN')}`;

const columns = [
  { key: 'formId', label: 'Form ID', render: (v) => <span className="font-medium text-slate-800">{v}</span> },
  { key: 'date', label: 'Initiate Date', render: (v) => <span className="text-slate-500">{v}</span> },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  { key: 'funds', label: 'Funds Requested', render: money },
  { key: 'remaining', label: 'Remaining Balance', render: money },
];

export default function RequestedPayout() {
  return (
    <div className="p-1">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Requested Payout</h1>
        <p className="text-sm text-slate-500 mt-1">View all the earning report from all your links and shares from</p>
      </header>

      <DataTable columns={columns} data={requests} />
    </div>
  );
}
