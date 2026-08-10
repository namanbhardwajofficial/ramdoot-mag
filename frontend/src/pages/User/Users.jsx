import { useState } from 'react';
import StatCard, { MiniChart } from '@/components/ui/stat-card';
import StatusBadge from '@/components/ui/status-badge';
import DataTable from '@/components/ui/data-table';
import Toolbar from '@/components/ui/toolbar';
import { EyeIcon, TrashIcon, PenIcon } from '@/components/ui/icons';
import useUsers from '@/hooks/useUsers';
import Button from '@/components/Button.jsx';
import UserDetailView from '@/components/users/UserDetailView';
import UserEditView from '@/components/users/UserEditView';
import { CHART_COLORS } from '@/config/theme';
import { ORG, USER_STATUSES } from '@/config/constants';
import dummyUsers from '@/data/dummyUsers.js'

const VIEWS = {
  DASHBOARD: 'dashboard',
  LIST: 'list',
  DETAIL: 'detail',
  EDIT: 'edit',
};

const dummyStats = {
  totalUsers: 1298517,
  activeUsers: 122182,
  paidUsers: 648991,
  paidChange: '+ 52 to last month',
  churnedUsers: 22182,
  inactiveUsers: 2182,
};



function formatDate(iso) {
  if (!iso) return '—';

  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function Avatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-blue-600 shrink-0 flex items-center justify-center overflow-hidden">
      <div className="w-7 h-7 rounded-full bg-orange-300" />
    </div>
  );
}

export default function Users() {
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const { updateUser,suspendUser } = useUsers();
   const [dummyUser] = useState(dummyUsers);

  function handleDelete(id) {
    console.log('Delete user:', id);
  }

  const actionsColumn = {
    key: '_actions',
    label: '',
    align: 'right',
    render: (_v, row) => (
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => {
            setSelectedUser(row);
            setView(VIEWS.DETAIL);
          }}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <EyeIcon />
        </button>

        <button
          onClick={() => handleDelete(row.id)}
          className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
        >
          <TrashIcon />
        </button>

        <button
          onClick={() => {
            setSelectedUser(row);
            setView(VIEWS.EDIT);
          }}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <PenIcon />
        </button>
      </div>
    ),
  };

  const columns = [
    {
      key: 'name',
      label: 'User Name & ID',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar />
          <div>
            <div className="font-medium text-slate-800">{v}</div>
            <div className="text-xs text-slate-400">
              #{row.id.replace('user_', '')}
            </div>
          </div>
        </div>
      ),
    },
    {
  key: 'status',
  label: 'Account Status',
  render: (v) => (
    <StatusBadge status={v} />
  ),
},
    {
      key: 'subscription',
      label: 'Subscription',
      render: (v, row) => (
        <div>
          <div className="text-slate-800">{v}</div>
          <div className="text-xs text-slate-400">
            {row.subscriptionPlan}
          </div>
        </div>
      ),
    },
    {
      key: 'lastActive',
      label: 'Last Active',
      render: (v) => <span className="text-slate-600">{v}</span>,
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      render: (v) => `${ORG.currencySymbol}${v?.toLocaleString('en-IN')}`,
    },
    {
      key: 'joinedOn',
      label: 'Joined On',
      render: (v) => <span className="text-slate-600">{formatDate(v)}</span>,
    },
    actionsColumn,
  ];

  if (view === VIEWS.DETAIL && selectedUser) {
   if (view === VIEWS.DETAIL && selectedUser) {
       return (
        <div>
           <button
          onClick={() => setView(VIEWS.DASHBOARD)}
          className="mb-4 text-sm text-slate-600 cursor-pointer"
        >
          ← Back
        </button>
         <UserDetailView
           user={selectedUser}
           onBack={() => { setSelectedUser(null); setView(VIEWS.DASHBOARD); }}
           onEdit={() => setView(VIEWS.EDIT)}
         />
       </div>       
       );
  }
}

  
  if (view === VIEWS.EDIT && selectedUser) {
    return (
      <div>
        <button
          onClick={() => setView(VIEWS.DASHBOARD)}
          className="mb-4 text-sm text-slate-600 cursor-pointer"
        >
          ← Back
        </button>

         <UserEditView
                user={selectedUser}
                updateUser={updateUser}
                suspendUser={suspendUser}
                onCancel={() => setView(VIEWS.DETAIL)}
                onSaved={(updated) => { setSelectedUser((prev) => ({ ...prev, ...updated })); setView(VIEWS.DETAIL); }}
                onExit={() => { setSelectedUser(null); setView(VIEWS.DASHBOARD); }}
              />
      </div>
    );
  }

 if (view === VIEWS.LIST) {
  return (
    <>
      <header>
        <div className="flex flex-row">
          <div><h1 className="text-2xl font-bold mb-1">Users List</h1>
            <p className="text-sm text-slate-500">
            List of all the magazines you been looking for
            </p></div>
          <div className='ml-auto'><Button text="Add User" handler={() => console.log('Add User')} /></div>
        </div>
      </header>
      <button
        onClick={() => setView(VIEWS.DASHBOARD)}
        className="mt-4 text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
      >
        ← Back to Dashboard
      </button>
      <Toolbar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={Object.values(USER_STATUSES)}
        search={search}
        onSearchChange={setSearch}
      />

      <DataTable columns={columns} data={dummyUser} loading={false} />
    </>
  );
}

  return (
    <>
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Users</h1>
          <p className="text-sm text-slate-500">
            You will find everything about users in this platform.
          </p>
        </div>

        <Button text="Add User" handler={() => console.log('Add User')} />
      </header>

      <div className="flex gap-4 mb-4 flex-wrap">
        <StatCard
          title="Total Users"
          value={dummyStats.totalUsers}
          color={CHART_COLORS.success}
          trend="up"
        />

        <StatCard
          title="Active Users"
          value={dummyStats.activeUsers}
          color={CHART_COLORS.danger}
          trend="down"
        />

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700">
              Paid Users
            </span>

            <select className="text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-0.5 bg-white outline-none cursor-pointer">
              <option>This Month</option>
              <option>This Week</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-3xl font-bold text-slate-900">
              {dummyStats.paidUsers.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              {dummyStats.paidChange}
            </span>
          </div>

          <MiniChart color={CHART_COLORS.success} trend="up" />
        </div>
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-50">
          <span className="text-sm font-medium text-slate-700">
            Churned Users
          </span>

          <div className="text-3xl font-bold text-slate-900 mt-2">
            {dummyStats.churnedUsers.toLocaleString('en-IN')}
          </div>

          <MiniChart color={CHART_COLORS.danger} trend="down" />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-50">
          <span className="text-sm font-medium text-slate-700">
            Inactive Users
          </span>

          <div className="text-3xl font-bold text-slate-900 mt-2">
            {dummyStats.inactiveUsers.toLocaleString('en-IN')}
          </div>

          <MiniChart color={CHART_COLORS.danger} trend="down" />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Users List</h2>
            <p className="text-sm text-slate-500">
              List of all the magazines you been looking for
            </p>
          </div>
        </div>

        <Toolbar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={Object.values(USER_STATUSES)}
          search={search}
          onSearchChange={setSearch}
        />

        <DataTable columns={columns} data={dummyUser} loading={false} />

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400">
            View All details at once?
          </span>

          <button
            onClick={() => setView(VIEWS.LIST)}
            className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            View All User List
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </section>
    </>
  );
}