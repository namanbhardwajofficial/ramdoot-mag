import { useState, useEffect } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
} from '@/componets/ui/breadcrumb';
import StatusBadge from '@/componets/ui/status-badge';
import DataTable from '@/componets/ui/data-table';
import Toolbar from '@/componets/ui/toolbar';
import { EyeIcon, TrashIcon, PenIcon, ChevronRightIcon } from '@/componets/ui/icons';
import PlatformBadge from '@/componets/influencers/PlatformBadge';
import InfluencerDetail from '@/componets/influencers/InfluencerDetail';
import CampaignDetailsDrawer from '@/componets/influencers/CampaignDetailsDrawer';
import useInfluencers from '@/hooks/useInfluencers';
import { ORG, CAMPAIGN_STATUSES, INFLUENCER_STATUSES } from '@/config/constants';

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
    influencers, campaigns, loading, init, fetchInfluencers, fetchCampaigns,
    restrictInfluencer, createCampaign,
  } = useInfluencers();

  const [view, setView] = useState(VIEWS.INFLUENCER_LIST);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campSearch, setCampSearch] = useState('');
  const [campStatusFilter, setCampStatusFilter] = useState('');

  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignDrawer, setShowCampaignDrawer] = useState(false);

  useEffect(() => { init(); }, [init]);
  useEffect(() => { if (!loading) fetchInfluencers({ status: statusFilter, search }); }, [statusFilter, search, loading, fetchInfluencers]);
  useEffect(() => { if (!loading) fetchCampaigns({ status: campStatusFilter, search: campSearch }); }, [campStatusFilter, campSearch, loading, fetchCampaigns]);

  function openInfluencer(inf) {
    setSelectedInfluencer(inf);
    setView(VIEWS.INFLUENCER_DETAIL);
  }

  async function handleRestrict(id) {
    try { await restrictInfluencer(id); } catch (err) { console.error('Failed to restrict', err); }
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
      render: (_v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openInfluencer(row)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><EyeIcon /></button>
          <button className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600"><TrashIcon /></button>
          <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><PenIcon /></button>
        </div>
      ),
    },
  ];

  const campaignColumns = [
    { key: 'name', label: 'Campaign Name', render: (v) => <span className="font-medium text-slate-800 truncate max-w-[100px] block">{v}</span> },
    { key: 'influencerName', label: 'Influencer Name' },
    { key: 'startingDate', label: 'Starting Date', render: (v) => formatDate(v) },
    { key: 'totalClicks', label: 'Total Clicks', render: (v) => v?.toLocaleString('en-IN') },
    { key: 'clickConversion', label: 'Click Conversion', render: (v) => v?.toLocaleString('en-IN') },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'commissionEarned', label: 'Commission Earned', render: (v) => `${ORG.currencySymbol}${v?.toLocaleString('en-IN')}` },
    { key: 'totalRevenue', label: 'Total Revenue', render: (v) => `${ORG.currencySymbol}${v?.toLocaleString('en-IN')}` },
    {
      key: '_actions', label: '', align: 'right',
      render: (_v, row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setSelectedCampaign(row); setShowCampaignDrawer(true); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><EyeIcon /></button>
          <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" /></svg>
          </button>
          <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><PenIcon /></button>
        </div>
      ),
    },
  ];

  /* ----- Influencer Detail ----- */
  if (view === VIEWS.INFLUENCER_DETAIL && selectedInfluencer) {
    return (
      <>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.INFLUENCER_LIST)} className="cursor-pointer">Influencers Campaigns</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.INFLUENCER_LIST)} className="cursor-pointer">Influencers list</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink>Influencers Name 1</BreadcrumbLink></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <InfluencerDetail
          influencer={selectedInfluencer}
          onBack={() => { setView(VIEWS.INFLUENCER_LIST); setSelectedInfluencer(null); }}
          onRestrict={handleRestrict}
          onCreateCampaign={() => {}}
        />
      </>
    );
  }

  /* ----- Campaign List ----- */
  if (view === VIEWS.CAMPAIGN_LIST) {
    return (
      <>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.INFLUENCER_LIST)} className="cursor-pointer">Settings</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.INFLUENCER_LIST)} className="cursor-pointer">Influencers Campaigns</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink>Influencers list</BreadcrumbLink></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Campaign List</h1>
          <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
        </header>

        <Toolbar
          statusFilter={campStatusFilter}
          onStatusChange={setCampStatusFilter}
          statusOptions={Object.values(CAMPAIGN_STATUSES)}
          search={campSearch}
          onSearchChange={setCampSearch}
        />

        <DataTable columns={campaignColumns} data={campaigns} loading={loading} />

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
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>Settings</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>Influencers Campaigns</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>Influencers list</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Influencers List</h1>
        <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
      </header>

      <Toolbar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={Object.values(INFLUENCER_STATUSES)}
        search={search}
        onSearchChange={setSearch}
      />

      <DataTable columns={influencerColumns} data={influencers} loading={loading} />

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-400">View All details at once?</span>
        <button onClick={() => setView(VIEWS.CAMPAIGN_LIST)} className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1">
          View All User List
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </>
  );
}
