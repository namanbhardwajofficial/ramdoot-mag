import { useState, useEffect } from 'react';
import StatusBadge from '@/componets/ui/status-badge';
import StatCard, { MiniChart } from '@/componets/ui/stat-card';
import DataTable from '@/componets/ui/data-table';
import Toolbar from '@/componets/ui/toolbar';
import { EyeIcon, TrashIcon } from '@/componets/ui/icons';
import { BACKEND_URL, ORG } from '@/config/constants';
import { CHART_COLORS } from '@/config/theme';

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-slate-200 mb-6">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${active === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Avatar({ size = 'lg' }) {
  const cls = size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  return (
    <div className={`${cls} rounded-full bg-slate-200 shrink-0 flex items-center justify-center`}>
      <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    </div>
  );
}

function CampaignsTab({ influencerId }) {
  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => {
    fetch(`${BACKEND_URL}/influencers/${influencerId}/campaigns`)
      .then((r) => r.json())
      .then((d) => setCampaigns(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, [influencerId]);

  const columns = [
    { key: 'name', label: 'Campaign Name' },
    { key: 'startingDate', label: 'Starting Date', render: (v) => formatDate(v) },
    { key: 'totalClicks', label: 'Total Clicks', render: (v) => v?.toLocaleString('en-IN') },
    { key: 'clickConversion', label: 'Click Conversions', render: (v) => v?.toLocaleString('en-IN') },
    { key: 'conversions', label: 'Conversions' },
    { key: 'commissionEarned', label: 'Commission Earned', render: (v) => `${ORG.currencySymbol}${v?.toLocaleString('en-IN')}` },
    {
      key: '_actions', label: '', align: 'right',
      render: () => (
        <button className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-full hover:bg-slate-800">
          View Campaign
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      ),
    },
  ];

  return (
    <>
      <h2 className="text-lg font-semibold mb-1">Active Campaign</h2>
      <p className="text-sm text-slate-500 mb-4">List of all the magazines you been looking for</p>
      <Toolbar statusFilter="" onStatusChange={() => {}} statusOptions={[]} search="" onSearchChange={() => {}} />
      <DataTable columns={columns} data={campaigns} />
    </>
  );
}

function AudienceTab({ influencerId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`${BACKEND_URL}/influencers/${influencerId}/audience`).then((r) => r.json()).then(setData).catch(console.error);
  }, [influencerId]);
  if (!data) return <div className="text-center py-8 text-slate-400">Loading...</div>;
  return (
    <div className="flex gap-4 flex-wrap">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-[200px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-slate-700">Refund rate</span>
          <span className="text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">This Month</span>
        </div>
        <p className="text-3xl font-bold mt-2">{data.refundRate}</p>
        <MiniChart color={CHART_COLORS.success} trend="up" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-[200px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-slate-700">Paid vs Free users %</span>
          <span className="text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">This Month</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-bold">{data.paidVsFree}</p>
          <span className="text-xs text-emerald-600 font-medium">{data.paidChange}</span>
        </div>
        <MiniChart color={CHART_COLORS.success} trend="up" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-[200px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-slate-700">Revenue per sub</span>
          <span className="text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">This Month</span>
        </div>
        <p className="text-3xl font-bold mt-2">{ORG.currencySymbol}{data.revenuePerSub}</p>
        <MiniChart color={CHART_COLORS.success} trend="up" />
      </div>
    </div>
  );
}

function PaymentsTab({ influencerId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`${BACKEND_URL}/influencers/${influencerId}/payments`).then((r) => r.json()).then(setData).catch(console.error);
  }, [influencerId]);
  if (!data) return <div className="text-center py-8 text-slate-400">Loading...</div>;

  const historyColumns = [
    { key: 'campaignName', label: 'Campaign Name' },
    { key: 'startingDate', label: 'Starting Date', render: (v) => formatDate(v) },
    { key: 'commissionEarned', label: 'Commission Earned', render: (v) => `${ORG.currencySymbol}${v?.toLocaleString('en-IN')}` },
    { key: 'totalClicks', label: 'Total Clicks', render: (v) => v?.toLocaleString('en-IN') },
    { key: 'method', label: 'Method' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: '_actions', label: '', align: 'right',
      render: () => (
        <div className="flex items-center justify-end gap-1">
          <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"><EyeIcon /></button>
          <button className="p-1.5 rounded-md hover:bg-red-50 text-slate-500"><TrashIcon /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-1">Payments</h2>
        <p className="text-sm text-slate-500 mb-4">You will find everything about users in this platform.</p>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Payment Model', value: data.paymentModel },
            { label: 'Commission', value: data.commission },
            { label: 'Currency', value: data.currency },
            { label: 'Tax Applicable', value: data.taxApplicable },
          ].map((s) => (
            <div key={s.label} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
              <p className="text-lg font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total Earned', value: `${ORG.currencySymbol}${data.totalEarned?.toLocaleString('en-IN')}` },
            { label: 'Total Paid', value: `${ORG.currencySymbol}${data.totalPaid?.toLocaleString('en-IN')}` },
            { label: 'Pending Amount', value: `${ORG.currencySymbol}${data.pendingAmount?.toLocaleString('en-IN')}` },
            { label: 'Next Payout', value: <><span className="text-2xl font-bold">{data.nextPayout}</span> <span className="text-sm text-slate-500">days</span></> },
            { label: 'Payment Status', value: <StatusBadge status={data.paymentStatus} /> },
          ].map((s, i) => (
            <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">{s.label}</p>
              <div className="text-lg font-bold">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-1">Payment History</h2>
      <p className="text-sm text-slate-500 mb-4">List of all the magazines you been looking for</p>
      <DataTable columns={historyColumns} data={Array.isArray(data.history) ? data.history : []} />

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-1">Bank Information</h2>
        <p className="text-sm text-slate-500 mb-3">List of all the magazines you been looking for</p>
        <div className="flex items-center justify-end mb-2">
          <button className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-full hover:bg-slate-800">
            Edit
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        {data.bankInfo && (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-200 text-xs text-slate-500">
              <th className="text-left py-2 font-medium">Holder Name</th>
              <th className="text-left py-2 font-medium">Bank Name</th>
              <th className="text-left py-2 font-medium">Account Number</th>
              <th className="text-left py-2 font-medium">IFSC / SWIFT</th>
              <th className="text-left py-2 font-medium">Location</th>
            </tr></thead>
            <tbody><tr className="border-b border-slate-100">
              <td className="py-3">{data.bankInfo.holderName}</td>
              <td className="py-3">{data.bankInfo.bankName}</td>
              <td className="py-3">{data.bankInfo.accountNumber}</td>
              <td className="py-3">{data.bankInfo.ifsc}</td>
              <td className="py-3">{data.bankInfo.location}</td>
            </tr></tbody>
          </table>
        )}
      </div>
    </>
  );
}

const TAB_LIST = ['Overview', 'Campaigns', 'Analytics', 'Audience', 'Payments', 'Profile & Activity', 'Admin Controls'];

export default function InfluencerDetail({ influencer, onBack, onRestrict, onCreateCampaign }) {
  const [tab, setTab] = useState('Campaigns');

  function renderTab() {
    switch (tab) {
      case 'Campaigns': return <CampaignsTab influencerId={influencer.id} />;
      case 'Audience':  return <AudienceTab influencerId={influencer.id} />;
      case 'Payments':  return <PaymentsTab influencerId={influencer.id} />;
      default: return <div className="flex items-center justify-center h-40 text-slate-400">{tab} — Coming soon</div>;
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{influencer.realName || influencer.name}</h1>
              <StatusBadge status={influencer.status} />
            </div>
            <p className="text-sm text-slate-500">
              ID: #{influencer.id.replace('inf_', '')} &nbsp; Joining Date: {formatDate(influencer.joinedOn)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            Edit
          </button>
          <button onClick={() => onRestrict(influencer.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M4.93 4.93l14.14 14.14" /></svg>
            Restrict Account
          </button>
          <button onClick={onCreateCampaign} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
            Create Campaigns
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <Tabs tabs={TAB_LIST} active={tab} onChange={setTab} />
      {renderTab()}
    </>
  );
}
