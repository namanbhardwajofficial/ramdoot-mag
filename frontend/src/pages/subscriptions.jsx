import { useState, useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
} from '@/componets/ui/breadcrumb';
import StatCard from '@/componets/ui/stat-card';
import StatusBadge from '@/componets/ui/status-badge';
import DataTable from '@/componets/ui/data-table';
import Toolbar from '@/componets/ui/toolbar';
import Modal from '@/componets/ui/modal';
import { EyeIcon, TrashIcon, PenIcon } from '@/componets/ui/icons';
import useSubscriptions from '@/hooks/useSubscriptions';
import { ORG, SUBSCRIPTION_STATUSES } from '@/config/constants';
import { CHART_COLORS } from '@/config/theme';

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
  const { subscriptions, plans, stats, loading, init, fetchAll, create, toggleStatus, remove } = useSubscriptions();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { init(); }, [init]);
  useEffect(() => { if (!loading) fetchAll({ status: statusFilter, search }); }, [statusFilter, search, loading, fetchAll]);

  async function handleCreate(form) {
    try {
      await create(form);
      setShowModal(false);
    } catch (err) { console.error('Failed to create subscription', err); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this subscription?')) return;
    try { await remove(id); } catch (err) { console.error('Failed to delete', err); }
  }

  async function handleToggle(sub) {
    try { await toggleStatus(sub); } catch (err) { console.error('Failed to toggle status', err); }
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
          <button title="Edit" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><PenIcon /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>Settings</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>Subscription</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Subscriptions</h1>
          <p className="text-sm text-slate-500">Create &amp; update the subscription models for subs</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300">
          Add New Plan
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </header>

      <div className="flex gap-4 mb-8 flex-wrap">
        <StatCard title="Active Subscribers" value={stats.activeSubscribers} color={CHART_COLORS.success} trend="up" />
        <StatCard title="New Subscriptions" value={stats.newSubscriptions} color={CHART_COLORS.danger} trend="down" />
        <StatCard title="Cancellations" value={stats.cancellations} color={CHART_COLORS.success} trend="up" />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Subscription List</h2>
          <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
        </div>
        <Toolbar statusFilter={statusFilter} onStatusChange={setStatusFilter} statusOptions={Object.values(SUBSCRIPTION_STATUSES)} search={search} onSearchChange={setSearch} />
        <DataTable columns={columns} data={subscriptions} loading={loading} emptyMessage="No subscriptions found" />
      </section>

      {showModal && <AddPlanModal plans={plans} onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
    </>
  );
}
