import { useState, useEffect } from 'react';
import useFilterRefetch from '@/hooks/useFilterRefetch';
import StatusBadge from '@/components/ui/status-badge';
import DataTable from '@/components/ui/data-table';
import Toolbar from '@/components/ui/toolbar';
import { EyeIcon, TrashIcon } from '@/components/ui/icons';
import PlatformBadge from '@/components/influencers/PlatformBadge';
import { confirmDelete, toastSuccess, toastError } from '@/lib/confirm';
import InfluencerDetail from '@/components/influencers/InfluencerDetail';
import CampaignDetailsDrawer from '@/components/influencers/CampaignDetailsDrawer';
import CreateCampaignModal from '@/components/influencers/CreateCampaignModal';
import useInfluencers from '@/hooks/useInfluencers';
import { sortRows } from '@/lib/sort';
import { ORG, CAMPAIGN_STATUSES, INFLUENCER_STATUSES } from '@/config/constants';

const INFLUENCER_SORTS = [
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'name:desc', label: 'Name (Z–A)' },
  { value: 'activeCampaigns:desc', label: 'Most campaigns' },
  { value: 'status:asc', label: 'Status' },
];

const CAMPAIGN_SORTS = [
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'startingDate:desc', label: 'Newest first' },
  { value: 'startingDate:asc', label: 'Oldest first' },
  { value: 'totalClicks:desc', label: 'Most clicks' },
  { value: 'status:asc', label: 'Status' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Avatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0 flex items-center justify-center">
      <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    </div>
  );
}

const VIEWS = { INFLUENCER_LIST: 'influencer-list', CAMPAIGN_LIST: 'campaign-list', INFLUENCER_DETAIL: 'influencer-detail' };

export default function InfluencerCampaigns() {
  const {
    influencers, campaigns, loading, error, init, fetchInfluencers, fetchCampaigns,
    restrictInfluencer, blockInfluencer, reactivateInfluencer, createCampaign,
  } = useInfluencers();

  const [view, setView] = useState(VIEWS.INFLUENCER_LIST);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [infSort, setInfSort] = useState('');
  const [campSearch, setCampSearch] = useState('');
  const [campStatusFilter, setCampStatusFilter] = useState('');
  const [campSort, setCampSort] = useState('');

  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignDrawer, setShowCampaignDrawer] = useState(false);
  // Which influencer the create-campaign modal is for (null = closed).
  const [campaignFor, setCampaignFor] = useState(null);

  useEffect(() => { init(); }, [init]);
  useFilterRefetch(fetchInfluencers, { status: statusFilter, search }, !loading);
  useFilterRefetch(fetchCampaigns, { status: campStatusFilter, search: campSearch }, !loading);

  const sortedInfluencers = sortRows(influencers, infSort);
  const sortedCampaigns = sortRows(campaigns, campSort);

  function openInfluencer(inf) {
    setSelectedInfluencer(inf);
    setView(VIEWS.INFLUENCER_DETAIL);
  }

  async function handleRestrict(id) {
    try {
      await restrictInfluencer(id);
      toastSuccess('Influencer restricted');
    } catch (err) {
      toastError(err.message || 'Could not restrict influencer');
    }
  }

  // The trash icon in the row. There is no DELETE /users/:id on the backend —
  // blocking the account is the strongest action available, and it is what the
  // Users page's identical trash icon already does.
  async function handleBlock(row) {
    const ok = await confirmDelete({
      title: `Block ${row.name}?`,
      text: 'They will lose access immediately. You can reactivate them afterwards.',
      confirmButtonText: 'Yes, block them',
    });
    if (!ok) return;
    try {
      await blockInfluencer(row.id);
      toastSuccess('Influencer blocked');
    } catch (err) {
      toastError(err.message || 'Could not block influencer');
    }
  }

  async function handleReactivate(row) {
    try {
      await reactivateInfluencer(row.id);
      toastSuccess('Influencer reactivated');
    } catch (err) {
      toastError(err.message || 'Could not reactivate influencer');
    }
  }

  async function handleCreateCampaign(payload) {
    await createCampaign(payload);
    setCampaignFor(null);
    toastSuccess('Campaign created');
  }

  const influencerColumns = [
    {
      key: 'name', label: 'User Name & ID',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar />
          <div>
            <div className="font-medium text-slate-800">{v}</div>
            <div className="text-xs text-slate-400">#{row.id.replace('inf_', '')}</div>
          </div>
        </div>
      ),
    },
    { key: 'status', label: 'Account Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'activeCampaigns', label: 'Active Campaign', render: (v) => `${v} Active` },
    {
      key: 'platforms', label: 'Platforms',
      render: (v) => <div className="flex gap-1.5 flex-wrap">{v?.map((p) => <PlatformBadge key={p} platform={p} />)}</div>,
    },
    { key: 'totalEarning', label: 'Total Earning', render: (v) => `${ORG.currencySymbol}${v?.toLocaleString('en-IN')}` },
    { key: 'roi', label: 'ROI' },
    {
      key: '_actions', label: '', align: 'right',
      // The trash and pen icons here had no handlers at all, sitting next to a
      // working eye icon and looking identical to it. The pen is gone — there is
      // no PATCH /users/:id to edit an influencer with, only
      // PATCH /users/:id/status — so the row now offers the three things the
      // backend can actually do.
      render: (_v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openInfluencer(row)}
            title="View influencer"
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"
          >
            <EyeIcon />
          </button>
          {row.status === 'active' ? (
            <button
              onClick={() => handleRestrict(row.id)}
              title="Suspend this influencer"
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => handleReactivate(row)}
              title="Reactivate this influencer"
              className="p-1.5 rounded-md hover:bg-emerald-50 text-slate-500 hover:text-emerald-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => handleBlock(row)}
            title="Block this influencer"
            className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600"
          >
            <TrashIcon />
          </button>
        </div>
      ),
    },
  ];

  const campaignColumns = [
    { key: 'name', label: 'Campaign Name', render: (v) => <span className="font-medium text-slate-800 truncate max-w-25 block">{v}</span> },
    { key: 'influencerName', label: 'Influencer Name' },
    { key: 'startingDate', label: 'Starting Date', render: (v) => formatDate(v) },
    { key: 'totalClicks', label: 'Total Clicks', render: (v) => v?.toLocaleString('en-IN') },
    { key: 'clickConversion', label: 'Click Conversion', render: (v) => v?.toLocaleString('en-IN') },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'commissionEarned', label: 'Commission Earned', render: (v) => `${ORG.currencySymbol}${v?.toLocaleString('en-IN')}` },
    { key: 'totalRevenue', label: 'Total Revenue', render: (v) => `${ORG.currencySymbol}${v?.toLocaleString('en-IN')}` },
    {
      key: '_actions', label: '', align: 'right',
      // The restrict and edit icons that used to sit beside this one are gone:
      // the backend has no PATCH or DELETE for a campaign at all
      // (`PATCH /campaigns/:id` -> 404, verified 2026-08-25), so neither could
      // ever have done anything. Viewing is the only real action.
      render: (_v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setSelectedCampaign(row); setShowCampaignDrawer(true); }}
            title="View campaign"
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"
          >
            <EyeIcon />
          </button>
        </div>
      ),
    },
  ];

  /* ----- Influencer Detail ----- */
  if (view === VIEWS.INFLUENCER_DETAIL && selectedInfluencer) {
    return (
      <>
        <InfluencerDetail
          influencer={selectedInfluencer}
          onBack={() => { setView(VIEWS.INFLUENCER_LIST); setSelectedInfluencer(null); }}
          onRestrict={handleRestrict}
          onCreateCampaign={() => setCampaignFor(selectedInfluencer)}
        />
        {campaignFor && (
          <CreateCampaignModal
            influencer={campaignFor}
            onClose={() => setCampaignFor(null)}
            onSubmit={handleCreateCampaign}
          />
        )}
      </>
    );
  }

  /* ----- Campaign List ----- */
  if (view === VIEWS.CAMPAIGN_LIST) {
    return (
      <>
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Campaign List</h1>
          <p className="text-sm text-slate-500">Every campaign running across your influencers</p>
        </header>

        <Toolbar
          statusFilter={campStatusFilter}
          onStatusChange={setCampStatusFilter}
          statusOptions={Object.values(CAMPAIGN_STATUSES)}
          search={campSearch}
          onSearchChange={setCampSearch}
          sortOptions={CAMPAIGN_SORTS}
          sort={campSort}
          onSortChange={setCampSort}
        />

        <DataTable columns={campaignColumns} data={sortedCampaigns} loading={loading} error={error} onRetry={() => fetchCampaigns({ status: campStatusFilter, search: campSearch })} />

        <CampaignDetailsDrawer
          open={showCampaignDrawer}
          campaign={selectedCampaign}
          onClose={() => { setShowCampaignDrawer(false); setSelectedCampaign(null); }}
        />
      </>
    );
  }

  /* ----- Influencer List (default) ----- */
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Influencers List</h1>
        <p className="text-sm text-slate-500">Everyone promoting Ramdoot magazines</p>
      </header>

      <Toolbar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={Object.values(INFLUENCER_STATUSES)}
        search={search}
        onSearchChange={setSearch}
        sortOptions={INFLUENCER_SORTS}
        sort={infSort}
        onSortChange={setInfSort}
      />

      <DataTable columns={influencerColumns} data={sortedInfluencers} loading={loading} error={error} onRetry={() => fetchInfluencers({ status: statusFilter, search })} />

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-400">View All details at once?</span>
        <button onClick={() => setView(VIEWS.CAMPAIGN_LIST)} className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1">
          View All User List
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {campaignFor && (
        <CreateCampaignModal
          influencer={campaignFor}
          onClose={() => setCampaignFor(null)}
          onSubmit={handleCreateCampaign}
        />
      )}
    </>
  );
}
