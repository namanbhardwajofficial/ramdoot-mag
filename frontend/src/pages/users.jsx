import { useState, useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
} from '@/componets/ui/breadcrumb';
import StatCard, { MiniChart } from '@/componets/ui/stat-card';
import StatusBadge from '@/componets/ui/status-badge';
import DataTable from '@/componets/ui/data-table';
import Toolbar from '@/componets/ui/toolbar';
import { EyeIcon, TrashIcon, PenIcon, ChevronRightIcon } from '@/componets/ui/icons';
import DeactivateUserDrawer from '@/componets/users/DeactivateUserDrawer';
import AddUserModal from '@/componets/users/AddUserModal';
import useUsers from '@/hooks/useUsers';
import { ORG, USER_STATUSES } from '@/config/constants';
import { CHART_COLORS } from '@/config/theme';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Avatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0 flex items-center justify-center">
      <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    </div>
  );
}

const VIEWS = { DASHBOARD: 'dashboard', LIST: 'list' };

export default function Users() {
  const { users, stats, loading, init, fetchAll, createUser, deactivateUser, removeUser } = useUsers();

  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { init(); }, [init]);
  useEffect(() => {
    if (!loading) fetchAll({ status: statusFilter, search, sort: sortBy });
  }, [statusFilter, search, sortBy, loading, fetchAll]);

  async function handleAddUser(form) {
    try {
      await createUser(form);
      setShowAddModal(false);
    } catch (err) { console.error('Failed to add user', err); }
  }

  async function handleDeactivate(id) {
    try {
      await deactivateUser(id);
      setShowDeactivate(false);
      setSelectedUser(null);
    } catch (err) { console.error('Failed to deactivate', err); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return;
    try { await removeUser(id); } catch (err) { console.error('Failed to delete', err); }
  }

  const dashboardColumns = [
    {
      key: 'name', label: 'User Name & ID',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar />
          <div>
            <div className="font-medium text-slate-800">{v}</div>
            <div className="text-xs text-slate-400">#{row.id.replace('user_', '')}</div>
          </div>
        </div>
      ),
    },
    { key: 'status', label: 'Account Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'subscription', label: 'Subscription',
      render: (v, row) => (
        <div>
          <div className="text-slate-800">{v}</div>
          <div className="text-xs text-slate-400">{row.subscriptionPlan}</div>
        </div>
      ),
    },
    { key: 'lastActive', label: 'Last Active', render: (v) => <span className="text-slate-600">{v}</span> },
    { key: 'totalSpent', label: 'Total Spent', render: (v) => `${ORG.currencySymbol}${v?.toLocaleString('en-IN')}` },
    { key: 'joinedOn', label: 'Joined On', render: (v) => <span className="text-slate-600">{formatDate(v)}</span> },
    {
      key: '_actions', label: '', align: 'right',
      render: (_v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setSelectedUser(row); setShowDeactivate(true); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><EyeIcon /></button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600"><TrashIcon /></button>
          <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><PenIcon /></button>
        </div>
      ),
    },
  ];

  const listColumns = [
    {
      key: 'name', label: 'User Name & ID',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar />
          <div>
            <div className="font-medium text-slate-800">{v}</div>
            <div className="text-xs text-slate-400">#{row.id.replace('user_', '')}</div>
          </div>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'subscription', label: 'Subscription',
      render: (v, row) => (
        <div>
          <div className="text-slate-800">{v}</div>
          <div className="text-xs text-slate-400">{row.subscriptionPlan}</div>
        </div>
      ),
    },
    { key: 'lastActive', label: 'Last Active', render: (v) => <span className="text-slate-600">{v}</span> },
  ];

  /* ----- List View ----- */
  if (view === VIEWS.LIST) {
    return (
      <>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.DASHBOARD)} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.DASHBOARD)} className="cursor-pointer">User</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink>Users List</BreadcrumbLink></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Users List</h1>
          <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
        </header>

        <Toolbar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={Object.values(USER_STATUSES)}
          search={search}
          onSearchChange={setSearch}
        />

        <DataTable columns={listColumns} data={users} loading={loading} />

        <DeactivateUserDrawer
          open={showDeactivate}
          user={selectedUser}
          onClose={() => { setShowDeactivate(false); setSelectedUser(null); }}
          onDeactivate={handleDeactivate}
        />
      </>
    );
  }

  /* ----- Dashboard View ----- */
  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>Settings</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>Another link</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>Users</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Users</h1>
          <p className="text-sm text-slate-500">You will find everything about users in this platform.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
          Add User
          <ChevronRightIcon />
        </button>
      </header>

      {/* Stats Row 1 — 3 big cards */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          color={CHART_COLORS.success}
          trend="up"
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers ?? 0}
          color={CHART_COLORS.success}
          trend="up"
        />
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-[200px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700">Paid Users</span>
            <span className="text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">This Month</span>
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-3xl font-bold text-slate-900">
              {(stats?.paidUsers ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-600 font-medium">{stats?.paidChange}</span>
          </div>
          <MiniChart color={CHART_COLORS.success} trend="up" />
        </div>
      </div>

      {/* Stats Row 2 — 2 smaller cards */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-[200px]">
          <span className="text-sm font-medium text-slate-700">Churned Users</span>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {(stats?.churnedUsers ?? 0).toLocaleString('en-IN')}
          </div>
          <MiniChart color={CHART_COLORS.danger} trend="down" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-[200px]">
          <span className="text-sm font-medium text-slate-700">Inactive Users</span>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {(stats?.inactiveUsers ?? 0).toLocaleString('en-IN')}
          </div>
          <MiniChart color={CHART_COLORS.success} trend="up" />
        </div>
      </div>

      {/* Users List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Users List</h2>
            <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
          </div>
        </div>

        <Toolbar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={Object.values(USER_STATUSES)}
          search={search}
          onSearchChange={setSearch}
        />

        <DataTable columns={dashboardColumns} data={users.slice(0, 10)} loading={loading} />

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400">View All details at once?</span>
          <button
            onClick={() => setView(VIEWS.LIST)}
            className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            View All User List
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      <DeactivateUserDrawer
        open={showDeactivate}
        user={selectedUser}
        onClose={() => { setShowDeactivate(false); setSelectedUser(null); }}
        onDeactivate={handleDeactivate}
      />

      {showAddModal && (
        <AddUserModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddUser}
        />
      )}
    </>
  );
}
