import { useState, useEffect } from 'react';
import Drawer from '@/componets/ui/drawer';
import StatusBanner from '@/componets/ui/status-banner';
import { BACKEND_URL, ORG } from '@/config/constants';
import { CHART_COLORS } from '@/config/theme';

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-slate-200 mb-5">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            active === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <div className="text-sm text-slate-800 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">{value || '—'}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function MiniLineChart({ labels, data, color = CHART_COLORS.primary, height = 120 }) {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const w = 300, h = height;
  const pad = { top: 10, bottom: 25, left: 35, right: 10 };
  const pts = data.map((v, i) => ({
    x: pad.left + (i / (data.length - 1)) * (w - pad.left - pad.right),
    y: pad.top + (1 - v / max) * (h - pad.top - pad.bottom),
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" fill="none">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = pad.top + (1 - f) * (h - pad.top - pad.bottom);
        return (
          <g key={f}>
            <line x1={pad.left} x2={w - pad.right} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
            <text x={pad.left - 5} y={y + 4} textAnchor="end" className="text-[9px] fill-slate-400">{max * f >= 1000 ? `${(max * f / 1000).toFixed(0)}k` : (max * f).toFixed(0)}</text>
          </g>
        );
      })}
      {labels?.map((l, i) => <text key={l} x={pts[i]?.x} y={h - 5} textAnchor="middle" className="text-[9px] fill-slate-400">{l}</text>)}
      <path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function OverviewTab({ pub }) {
  return (
    <>
      <Field label="Magazine Title" value={pub.title} />
      <Field label="Magazine ID" value={pub.magazineRef} />
      <Field label="Short Description" value={pub.description || 'Type here...'} />
      <Field label="Campaign Created By" value={pub.createdBy} />
      <Field label="Campaign Status" value={pub.status.charAt(0).toUpperCase() + pub.status.slice(1)} />
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Field label="Start date" value={formatDate(pub.startDate)} />
        <Field label="End date" value={formatDate(pub.endDate)} />
      </div>
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-slate-200 shrink-0" />
        <div>
          <p className="text-sm font-medium">Preview Magazine</p>
          <p className="text-xs text-slate-400">Click here to preview magazine</p>
        </div>
      </div>
    </>
  );
}

function PerformanceTab({ pubId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`${BACKEND_URL}/publications/${pubId}/performance`).then((r) => r.json()).then(setData).catch(console.error);
  }, [pubId]);
  if (!data) return <div className="text-center py-8 text-slate-400">Loading...</div>;
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold">Essential</h3>
        <span className="text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">This Week</span>
      </div>
      <div className="flex items-center gap-4 text-xs mb-3">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS.primary }} />Subscriber Gain</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS.success }} />Views</span>
      </div>
      <MiniLineChart labels={data.chart.labels} data={data.chart.subscriberGain} color={CHART_COLORS.primary} />
      <div className="mt-5 bg-slate-50 rounded-lg border border-slate-200 p-4">
        <p className="text-xs text-slate-400 mb-1">Avg Time per user spend</p>
        <p className="text-xl font-bold">{data.avgTimePerUser}</p>
      </div>
    </>
  );
}

function FinancialsTab({ pubId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`${BACKEND_URL}/publications/${pubId}/financials`).then((r) => r.json()).then(setData).catch(console.error);
  }, [pubId]);
  if (!data) return <div className="text-center py-8 text-slate-400">Loading...</div>;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'Total Revenue', value: `${ORG.currencySymbol}${data.totalRevenue?.toLocaleString('en-IN')}` },
          { label: 'Total Clicks', value: data.totalClicks?.toLocaleString('en-IN') },
          { label: 'Influencer Commission', value: `${ORG.currencySymbol}${data.influencerCommission?.toLocaleString('en-IN')}` },
          { label: 'Influencer Subscribers', value: data.influencerSubscribers?.toLocaleString('en-IN') },
        ].map((s) => (
          <div key={s.label} className="bg-slate-50 rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className="text-lg font-bold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold">Revenue</h3>
        <span className="text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">This Week</span>
      </div>
      <MiniLineChart labels={data.labels} data={data.revenueChart} color={CHART_COLORS.primary} />
    </>
  );
}

function ActionsTab({ pub, onDeactivate }) {
  const [done, setDone] = useState(false);

  function handleDeactivate() {
    onDeactivate();
    setDone(true);
  }

  if (done) {
    return (
      <StatusBanner
        variant="success"
        title="Successfully Deactivated"
        description="Deactivate the current magazine for all subscriber."
      />
    );
  }

  return (
    <>
      <StatusBanner
        variant="warning"
        title="Important Notice"
        description="This action cannot be reversed."
      />

      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2">Please Note</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Deactivating this pricing will make the magazine unavailable for new
          purchases and subscriptions. Existing subscribers will continue to have
          access until their current subscription period ends.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed mt-2">
          This action does not delete the magazine and can be reversed at any time.
        </p>
      </div>
    </>
  );
}

const TAB_LIST = ['Overview', 'Performance', 'Financials', 'Actions'];

export default function MagazineDetailsDrawer({ open, publication, onClose, onDeactivate }) {
  const [tab, setTab] = useState('Overview');

  if (!publication) return null;

  function renderTab() {
    switch (tab) {
      case 'Overview':    return <OverviewTab pub={publication} />;
      case 'Performance': return <PerformanceTab pubId={publication.id} />;
      case 'Financials':  return <FinancialsTab pubId={publication.id} />;
      case 'Actions':     return <ActionsTab pub={publication} onDeactivate={onDeactivate} />;
      default:            return null;
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Magazine Details"
      footer={
        <button
          onClick={tab === 'Actions' ? onDeactivate : onClose}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
        >
          {tab === 'Actions' ? 'Deactivate Magazine' : 'Go Home'}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      }
    >
      <Tabs tabs={TAB_LIST} active={tab} onChange={setTab} />
      {renderTab()}
    </Drawer>
  );
}
