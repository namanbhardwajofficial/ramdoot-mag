import { useState, useEffect } from 'react';
import useFilterRefetch from '@/hooks/useFilterRefetch';
import StatCard from '@/components/ui/stat-card';
import StatusBadge from '@/components/ui/status-badge';
import DataTable from '@/components/ui/data-table';
import Toolbar from '@/components/ui/toolbar';
import Modal from '@/components/ui/modal';
import EditSubscriptionDrawer from '@/components/subscriptions/EditSubscriptionDrawer';
import { EyeIcon, TrashIcon, PenIcon } from '@/components/ui/icons';
import useSubscriptions from '@/hooks/useSubscriptions';
import { confirmDelete, toastSuccess, toastError } from '@/lib/confirm';
import { ORG, SUBSCRIPTION_STATUSES } from '@/config/constants';
import { CHART_COLORS } from '@/config/theme';
import Button from "@/components/Button.jsx";
import { sortRows } from '@/lib/sort';

const SUB_SORTS = [
  { value: 'price:desc', label: 'Price (high→low)' },
  { value: 'price:asc', label: 'Price (low→high)' },
  { value: 'type:asc', label: 'Type' },
  { value: 'updatedAt:desc', label: 'Recently updated' },
  { value: 'status:asc', label: 'Status' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function AddPlanModal({ plans, onClose, onSubmit }) {
  const [planId, setPlanId] = useState(plans[0]?.id ?? '');
  const [createdBy, setCreatedBy] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ planId, createdBy });
  }

  return (
    <Modal open onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add New Subscription</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Plan</label>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.label} — {ORG.currencySymbol}{(p.priceInPaise / 100).toLocaleString('en-IN')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Created By</label>
          <input value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} placeholder="Name" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-slate-300 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm bg-slate-900 text-white hover:bg-slate-800">Create</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Subscriptions() {
  const { subscriptions, plans, stats, error, loading, init, fetchAll, create, update, toggleStatus, remove } = useSubscriptions();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // Backs the Toolbar's "Sort by", which had no handler at all before.
  const [sortBy, setSortBy] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { init(); }, [init]);
  useFilterRefetch(fetchAll, { status: statusFilter, search }, !loading);

  async function handleCreate(form) {
    try {
      await create(form);
      setShowModal(false);
      toastSuccess('Plan created');
    } catch (err) {
      // Leave the modal open so the entered details aren't lost.
      toastError(err.message || 'Could not create plan');
    }
  }

  async function handleDelete(id) {
    const ok = await confirmDelete({ text: 'This subscription will be permanently deleted.' });
    if (!ok) return;
    try {
      await remove(id);
      toastSuccess('Subscription deleted');
    } catch (err) {
      toastError(err.message || 'Could not delete subscription');
    }
  }

  async function handleToggle(sub) {
    try {
      await toggleStatus(sub);
    } catch (err) {
      toastError(err.message || 'Could not change plan status');
    }
  }

  async function handleUpdate(form) {
    if (!editing) return;
    setSaving(true);
    try {
      await update(editing.id, form);
      toastSuccess('Subscription updated');
      setEditing(null);
    } catch (err) {
      toastError(err.message || 'Could not update subscription');
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: 'id', label: 'Subscription ID', render: (v) => <span className="font-mono text-xs">#{v.replace('sub_', '')}</span> },
    { key: 'status', label: 'Subscription Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'price', label: 'Subscription Price', render: (v) => `${ORG.currencySymbol}${v}` },
    { key: 'type', label: 'Subscription Type' },
    { key: 'createdBy', label: 'Create/updated by', render: (v) => <span className="text-slate-700 underline decoration-slate-300 underline-offset-2">@{v}</span> },
    { key: 'updatedAt', label: 'Last Updated On', render: (v) => <span className="text-slate-500">{formatDate(v)}</span> },
    {
      key: '_actions', label: '', align: 'right',
      render: (_v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => handleToggle(row)} title={row.status === SUBSCRIPTION_STATUSES.ACTIVE ? 'Deactivate' : 'Activate'} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><EyeIcon /></button>
          <button onClick={() => handleDelete(row.id)} title="Delete" className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600"><TrashIcon /></button>
          <button onClick={() => setEditing(row)} title="Edit" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><PenIcon /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Subscriptions</h1>
          <p className="text-sm text-slate-500">Create &amp; update the subscription models for subs</p>
        </div>

        <Button text="Add New Plan" handler={() => setShowModal(true)} />
      </header>

      <div className="flex gap-4 mb-8 flex-wrap">
        <StatCard title="Active Subscribers" value={stats?.activeSubscribers} color={CHART_COLORS.success} />
        <StatCard title="New Subscriptions" value={stats?.newSubscriptions} color={CHART_COLORS.danger} />
        <StatCard title="Cancellations" value={stats?.cancellations} color={CHART_COLORS.success} />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Subscription List</h2>
          <p className="text-sm text-slate-500">Every plan your subscribers can buy</p>
        </div>
        <Toolbar statusFilter={statusFilter} onStatusChange={setStatusFilter} statusOptions={Object.values(SUBSCRIPTION_STATUSES)} search={search} onSearchChange={setSearch} sortOptions={SUB_SORTS} sort={sortBy} onSortChange={setSortBy} />
        <DataTable columns={columns} data={sortRows(subscriptions, sortBy)} loading={loading} error={error} onRetry={() => fetchAll({ status: statusFilter, search })} emptyMessage="No subscriptions found" />
      </section>

      {showModal && <AddPlanModal plans={plans} onClose={() => setShowModal(false)} onSubmit={handleCreate} />}

      <EditSubscriptionDrawer
        open={!!editing}
        subscription={editing}
        plans={plans}
        saving={saving}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
      />
    </>
  );
}
