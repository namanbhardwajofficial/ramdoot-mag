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
import { EyeIcon, TrashIcon, PenIcon, ChevronRightIcon } from '@/componets/ui/icons';
import PublishMagazineForm from '@/componets/publications/PublishMagazineForm';
import MagazineDetailsDrawer from '@/componets/publications/MagazineDetailsDrawer';
import PublishSuccessModal from '@/componets/publications/PublishSuccessModal';
import DeleteMagazineDrawer from '@/componets/publications/DeleteMagazineDrawer';
import EditMagazineForm from '@/componets/publications/EditMagazineForm';
import EditSuccessModal from '@/componets/publications/EditSuccessModal';
import usePublications from '@/hooks/usePublications';
import { ORG, PUBLICATION_STATUSES } from '@/config/constants';
import { CHART_COLORS } from '@/config/theme';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const VIEWS = { DASHBOARD: 'dashboard', LIST: 'list', PUBLISH: 'publish', EDIT: 'edit' };

export default function Publications() {
  const { publications, stats, loading, init, fetchAll, publish, update, deactivate, remove } = usePublications();

  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedPub, setSelectedPub] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [successModal, setSuccessModal] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editPub, setEditPub] = useState(null);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!loading) fetchAll({ status: statusFilter, search });
  }, [statusFilter, search, loading, fetchAll]);

  async function handlePublish(form) {
    try {
      const pub = await publish(form);
      setSuccessModal(pub.shareLink);
      setView(VIEWS.DASHBOARD);
    } catch (err) { console.error('Failed to publish', err); }
  }

  async function handleDelete({ reason, note }) {
    if (!selectedPub) return;
    try {
      await remove(selectedPub.id);
      setShowDelete(false);
      setSelectedPub(null);
    } catch (err) { console.error('Failed to delete', err); }
  }

  async function handleDeactivate() {
    if (!selectedPub) return;
    try {
      await deactivate(selectedPub.id);
    } catch (err) { console.error('Failed to deactivate', err); }
  }

  async function handleUpdate(form) {
    if (!editPub) return;
    try {
      await update(editPub.id, form);
      setEditSuccess(true);
    } catch (err) { console.error('Failed to update', err); }
  }

  const columns = [
    {
      key: 'title',
      label: 'Magazine Name & ID',
      render: (v, row) => (
        <div>
          <div className="font-medium text-slate-800">{v}</div>
          <div className="text-xs text-slate-400">{row.magazineRef}</div>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'publishedOn', label: 'Published On', render: (v) => <span className="text-slate-600">{formatDate(v)}</span> },
    { key: 'subscribers', label: 'Subscribers', render: (v) => v?.toLocaleString('en-IN') },
    { key: 'reads', label: 'Reads / Views', render: (v) => v?.toLocaleString('en-IN') },
    { key: 'revenue', label: 'Revenue', render: (v) => `${ORG.currencySymbol}${v?.toLocaleString('en-IN')}` },
    {
      key: '_actions',
      label: '',
      align: 'right',
      render: (_v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setSelectedPub(row); setShowDetails(true); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700">
            <EyeIcon />
          </button>
          <button onClick={() => { setSelectedPub(row); setShowDelete(true); }} className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600">
            <TrashIcon />
          </button>
          <button onClick={() => { setEditPub(row); setView(VIEWS.EDIT); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700">
            <PenIcon />
          </button>
        </div>
      ),
    },
  ];

  /* ----- Edit View ----- */
  if (view === VIEWS.EDIT && editPub) {
    return (
      <>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink onClick={() => { setView(VIEWS.DASHBOARD); setEditPub(null); }} className="cursor-pointer">Settings</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink onClick={() => { setView(VIEWS.DASHBOARD); setEditPub(null); }} className="cursor-pointer">Publications</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink>Edit Magazine</BreadcrumbLink></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Edit Magazine</h1>
          <p className="text-sm text-slate-500">You will find everything about users in this platform.</p>
        </header>

        <EditMagazineForm
          publication={editPub}
          onUpdate={handleUpdate}
          onCancel={() => { setView(VIEWS.DASHBOARD); setEditPub(null); }}
        />

        <EditSuccessModal
          open={editSuccess}
          onClose={() => { setEditSuccess(false); setEditPub(null); setView(VIEWS.DASHBOARD); }}
        />
      </>
    );
  }

  /* ----- Publish View ----- */
  if (view === VIEWS.PUBLISH) {
    return (
      <>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.DASHBOARD)} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.DASHBOARD)} className="cursor-pointer">Settings</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.DASHBOARD)} className="cursor-pointer">Publications</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink>Publish Magazine</BreadcrumbLink></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Publish Magazine</h1>
          <p className="text-sm text-slate-500">You will find everything about users in this platform.</p>
        </header>

        <PublishMagazineForm onPublish={handlePublish} onCancel={() => setView(VIEWS.DASHBOARD)} />

        {successModal && (
          <PublishSuccessModal open shareLink={successModal} onClose={() => setSuccessModal(null)} />
        )}
      </>
    );
  }

  /* ----- List View ----- */
  if (view === VIEWS.LIST) {
    return (
      <>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.DASHBOARD)} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.DASHBOARD)} className="cursor-pointer">Settings</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink>Publications</BreadcrumbLink></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Magazines List</h1>
            <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
          </div>
        </header>

        <Toolbar statusFilter={statusFilter} onStatusChange={setStatusFilter} statusOptions={Object.values(PUBLICATION_STATUSES)} search={search} onSearchChange={setSearch} />
        <DataTable columns={columns} data={publications} loading={loading} />

        <MagazineDetailsDrawer open={showDetails} publication={selectedPub} onClose={() => { setShowDetails(false); setSelectedPub(null); }} onDeactivate={handleDeactivate} />
        <DeleteMagazineDrawer open={showDelete} publication={selectedPub} onClose={() => { setShowDelete(false); setSelectedPub(null); }} onDelete={handleDelete} />
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
          <BreadcrumbItem><BreadcrumbLink>Publications</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Magazine Publications</h1>
          <p className="text-sm text-slate-500">You will find everything about users in this platform.</p>
        </div>
        <button onClick={() => setView(VIEWS.PUBLISH)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
          Publish New Magazine
          <ChevronRightIcon />
        </button>
      </header>

      <div className="flex gap-4 mb-8 flex-wrap">
        <StatCard title="Total Readers" value={stats?.totalReaders ?? 0} color={CHART_COLORS.success} trend="up" changeLabel="+ 100% vs last month" changeColor="text-emerald-600" />
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-[200px]">
          <span className="text-sm font-medium text-slate-700">Total Publications</span>
          <div className="text-3xl font-bold text-slate-900 mt-3">{stats?.totalPublications ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-[200px]">
          <span className="text-sm font-medium text-slate-700">Live Promo Code & Drafts</span>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div><span className="text-xl font-bold text-slate-900">{stats?.liveCount ?? 0}</span><span className="text-sm text-slate-500 ml-2">Live Magazines</span></div>
              <ChevronRightIcon />
            </div>
            <div className="flex items-center justify-between">
              <div><span className="text-xl font-bold text-slate-900">{String(stats?.draftCount ?? 0).padStart(2, '0')}</span><span className="text-sm text-slate-500 ml-2">Draft Magazines</span></div>
              <ChevronRightIcon />
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Magazines List</h2>
            <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
          </div>
        </div>
        <Toolbar statusFilter={statusFilter} onStatusChange={setStatusFilter} statusOptions={Object.values(PUBLICATION_STATUSES)} search={search} onSearchChange={setSearch} />
        <DataTable columns={columns} data={publications} loading={loading} />
      </section>

      <MagazineDetailsDrawer open={showDetails} publication={selectedPub} onClose={() => { setShowDetails(false); setSelectedPub(null); }} onDeactivate={handleDeactivate} />
      <DeleteMagazineDrawer open={showDelete} publication={selectedPub} onClose={() => { setShowDelete(false); setSelectedPub(null); }} onDelete={handleDelete} />
      {successModal && <PublishSuccessModal open shareLink={successModal} onClose={() => setSuccessModal(null)} />}
    </>
  );
}
