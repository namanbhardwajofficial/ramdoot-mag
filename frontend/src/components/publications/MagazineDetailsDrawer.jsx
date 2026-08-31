import { useState, useEffect, useCallback } from 'react';
import Drawer from '@/components/ui/drawer';
import StatusControl from '@/components/publications/StatusControl';
import { ORG } from '@/config/constants';
import { CHART_COLORS } from '@/config/theme';
import { magazinesApi } from '@/lib/api';
import ErrorState from '@/components/ui/error-state';

// Placeholder for tabs whose backing endpoint doesn't exist yet — better than a
// spinner that never resolves. See BACKEND_GAPS.md.
function NotAvailable({ what }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
      <p className="text-sm text-slate-500">{what} isn&apos;t available yet.</p>
      <p className="mt-1 text-xs text-slate-400">This view is waiting on a backend endpoint.</p>
    </div>
  );
}

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

// One loader for both tabs: its own error, its own retry.
function useMagazineData(fetcher, id) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetcher(id));
      setError(null);
    } catch (err) {
      setData(null);
      setError(err.message || 'Could not load this');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { load(); }, [load]);
  return { data, error, loading, reload: load };
}

function Tile({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

const rupees = (v) => `${ORG.currencySymbol}${Number(v || 0).toLocaleString('en-IN')}`;

/**
 * GET /magazines/:id/performance.
 *
 * The mock wanted subscriber gain over time and average dwell time; the
 * endpoint reports neither — it reports views, reads and an engagement rate, so
 * that is what this shows.
 */
function PerformanceTab({ magazineId }) {
  const { data, error, loading, reload } = useMagazineData(magazinesApi.performance, magazineId);

  if (loading) return <div className="py-8 text-center text-sm text-slate-400">Loading&hellip;</div>;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <NotAvailable what="Performance data" />;

  return (
    <>
      <h3 className="text-base font-semibold mb-3">Engagement</h3>
      <div className="grid grid-cols-2 gap-3">
        <Tile label="Views" value={Number(data.viewsCount || 0).toLocaleString('en-IN')} />
        <Tile label="Reads" value={Number(data.readsCount || 0).toLocaleString('en-IN')} />
        <Tile label="Engagement rate" value={data.engagementRate ?? '—'} />
        <Tile label="Revenue" value={rupees(data.revenue)} />
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Reads are counted when a subscriber opens the PDF. Views count opens of the
        magazine page.
      </p>
    </>
  );
}

/**
 * GET /magazines/:id/financials.
 *
 * `price` comes back as a string ("59.00"), so it is coerced before formatting.
 */
function FinancialsTab({ magazineId }) {
  const { data, error, loading, reload } = useMagazineData(magazinesApi.financials, magazineId);

  if (loading) return <div className="py-8 text-center text-sm text-slate-400">Loading&hellip;</div>;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <NotAvailable what="Financials" />;

  const byDay = Array.isArray(data.revenueByDay) ? data.revenueByDay : [];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Tile label="Total Revenue" value={rupees(data.totalRevenue)} />
        <Tile label="Total Sales" value={Number(data.totalSales || 0).toLocaleString('en-IN')} />
        <Tile label="Cover Price" value={rupees(data.price)} />
      </div>
      <h3 className="text-base font-semibold mb-2">Revenue</h3>
      {byDay.length > 1 ? (
        <MiniLineChart
          labels={byDay.map((d) => d.date ?? d.period)}
          data={byDay.map((d) => Number(d.revenue ?? d.amount ?? 0))}
          color={CHART_COLORS.primary}
        />
      ) : (
        <p className="py-6 text-center text-sm text-slate-400">
          No sales recorded for this magazine yet
        </p>
      )}
    </>
  );
}

function ActionsTab({ pub, onStatusChange }) {
  return (
    <>
      {/* The status control replaces a lone "Deactivate" button. Deactivating
          is just one of these moves (to Paused), and it was the only one the
          UI offered — a magazine published by mistake could not be pulled back. */}
      <div className="mb-6">
        <StatusControl status={pub.status} onChange={onStatusChange} />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2">Please Note</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Pausing a magazine makes it unavailable for new purchases and
          subscriptions. Existing subscribers keep access until their current
          subscription period ends.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed mt-2">
          None of these change deletes the magazine, and each one can be
          reversed by choosing another status.
        </p>
      </div>
    </>
  );
}

const TAB_LIST = ['Overview', 'Performance', 'Financials', 'Actions'];

export default function MagazineDetailsDrawer({ open, publication, onClose, onStatusChange }) {
  const [tab, setTab] = useState('Overview');

  if (!publication) return null;

  function renderTab() {
    switch (tab) {
      case 'Overview':    return <OverviewTab pub={publication} />;
      case 'Performance': return <PerformanceTab magazineId={publication.id} />;
      case 'Financials':  return <FinancialsTab magazineId={publication.id} />;
      case 'Actions':     return <ActionsTab pub={publication} onStatusChange={onStatusChange} />;
      default:            return null;
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Magazine Details"
      footer={
        // The footer used to fire Deactivate from the Actions tab, duplicating
        // the button inside it — and doing it without confirmation. Status
        // changes now live only in the tab, behind their own confirm step.
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
        >
          Close
        </button>
      }
    >
      <Tabs tabs={TAB_LIST} active={tab} onChange={setTab} />
      {renderTab()}
    </Drawer>
  );
}
