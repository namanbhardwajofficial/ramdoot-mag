import { useState, useEffect } from 'react';
import useFilterRefetch from '@/hooks/useFilterRefetch';
import StatCard from '@/components/ui/stat-card';
import StatusBadge from '@/components/ui/status-badge';
import DataTable from '@/components/ui/data-table';
import Toolbar from '@/components/ui/toolbar';
import { EyeIcon } from '@/components/ui/icons';
import PaymentsChart from '@/components/payments/PaymentsChart';
import PaymentDetailsDrawer from '@/components/payments/PaymentDetailsDrawer';
import PaymentFailedModal from '@/components/payments/PaymentFailedModal';
import PaymentRefundDrawer from '@/components/payments/PaymentRefundDrawer';
import InfluencerPayoutDrawer from '@/components/payments/InfluencerPayoutDrawer';
import usePayments from '@/hooks/usePayments';
import { ORG, PAYMENT_STATUSES, PAYOUT_STATUSES } from '@/config/constants';
import { CHART_COLORS } from '@/config/theme';
import Button from "@/components/Button.jsx";
import { sortRows } from '@/lib/sort';
import { downloadCsv, stampedName } from '@/lib/csv';
import { toastSuccess } from '@/lib/confirm';

const VIEWS = { DASHBOARD: 'dashboard', PAYMENT_LIST: 'payment-list', PAYOUT_LIST: 'payout-list' };

const PAYMENT_SORTS = [
  { value: 'amount:desc', label: 'Amount (high→low)' },
  { value: 'amount:asc', label: 'Amount (low→high)' },
  { value: 'userName:asc', label: 'User (A–Z)' },
  { value: 'status:asc', label: 'Status' },
];

const PAYOUT_SORTS = [
  { value: 'amount:desc', label: 'Amount (high→low)' },
  { value: 'amount:asc', label: 'Amount (low→high)' },
  { value: 'influencerName:asc', label: 'Influencer (A–Z)' },
  { value: 'status:asc', label: 'Status' },
];

// Column sets for the CSV. Deliberately separate from the table columns: the
// table renders JSX, a spreadsheet needs plain values.
const PAYMENT_CSV = [
  { key: 'id', label: 'Payment ID' },
  { key: 'userName', label: 'User' },
  { key: 'userEmail', label: 'Email' },
  { key: 'userId', label: 'User ID' },
  { key: 'createdAt', label: 'Date' },
  { key: 'magazineTitle', label: 'Magazine' },
  { key: 'amount', label: `Amount (${ORG.currency})` },
  { key: 'status', label: 'Status' },
];

const PAYOUT_CSV = [
  { key: 'id', label: 'Payout ID' },
  { key: 'influencerName', label: 'Influencer' },
  { key: 'influencerEmail', label: 'Email' },
  { key: 'influencerId', label: 'Influencer ID' },
  { key: 'createdAt', label: 'Date' },
  { key: 'amount', label: `Amount (${ORG.currency})` },
  { key: 'status', label: 'Status' },
];

export default function Payments() {
  const { payments, payouts, stats, error, loading, init, fetchPayments, fetchPayouts, retryPayment, refundPayment } = usePayments();

  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [paySearch, setPaySearch] = useState('');
  const [payStatusFilter, setPayStatusFilter] = useState('');
  const [payoutSearch, setPayoutSearch] = useState('');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('');

  // "Sort by" was a handler-less button in the shared Toolbar. Sorting is
  // client-side because the backend rejects sort params (see lib/sort.js).
  const [paySort, setPaySort] = useState('');
  const [payoutSort, setPayoutSort] = useState('');

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [drawerType, setDrawerType] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);

  useEffect(() => { init(); }, [init]);
  useFilterRefetch(fetchPayments, { status: payStatusFilter, search: paySearch }, !loading);
  useFilterRefetch(fetchPayouts, { status: payoutStatusFilter, search: payoutSearch }, !loading);

  const sortedPayments = sortRows(payments, paySort);
  const sortedPayouts = sortRows(payouts, payoutSort);

  // Export used to be `onExport={() => {}}`. There is no export endpoint, but
  // the page already holds every row it shows, so the file is built here from
  // exactly what the admin is looking at — filters, search and sort included.
  function exportPayments() {
    downloadCsv(stampedName('payments'), PAYMENT_CSV, sortedPayments);
    toastSuccess(`Exported ${sortedPayments.length} payments`);
  }

  function exportPayouts() {
    downloadCsv(stampedName('influencer-payouts'), PAYOUT_CSV, sortedPayouts);
    toastSuccess(`Exported ${sortedPayouts.length} payouts`);
  }

  function openPayment(p) {
    setSelectedPayment(p);
    setDrawerType(p.status === 'failed' ? 'failed-modal' : 'details');
  }

  function closeAll() {
    setSelectedPayment(null);
    setSelectedPayout(null);
    setDrawerType(null);
  }

  async function handleRetry(id) {
    await retryPayment(id);
    closeAll();
  }

  async function handleRefund(id) {
    await refundPayment(id);
    setDrawerType('refund-steps');
  }

  const paymentCols = [
    { key: 'id', label: 'Payment ID', render: (v) => <span className="font-mono text-xs">#{v.replace('pay_', '')}</span> },
    { key: 'userName', label: 'User & ID', render: (v, row) => (<div><div className="font-medium text-slate-800">{v}</div><div className="text-xs text-slate-400">#{row.userId?.replace('user_', '')}</div></div>) },
    { key: 'magazineTitle', label: 'Magazine' },
    { key: 'amount', label: 'Amount', render: (v) => `${ORG.currencySymbol}${v}` },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: '_actions', label: '', align: 'right', render: (_v, row) => (<button onClick={() => openPayment(row)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><EyeIcon /></button>) },
  ];

  const payoutCols = [
    { key: 'id', label: 'Payment ID', render: (v) => <span className="font-mono text-xs">#{v.replace('pout_', '')}</span> },
    { key: 'influencerName', label: 'Influencer Name & ID', render: (v, row) => (<div><div className="font-medium text-slate-800">{v}</div><div className="text-xs text-slate-400">#{row.influencerId?.replace('inf_', '')}</div></div>) },
    { key: 'amount', label: 'Amount', render: (v) => `${ORG.currencySymbol}${v.toLocaleString('en-IN')}` },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    // Was an <a href="#"> — a link that scrolled to the top. /admin/payouts
    // does not join the campaign (BACKEND_GAPS.md #16), so there is no id to
    // link to and the value is always a dash. Plain text until it isn't.
    { key: 'campaignLink', label: 'Campaign', render: (v) => <span className="text-slate-500" title="The payouts endpoint does not return the campaign yet">{v}</span> },
    { key: '_actions', label: '', align: 'right', render: (_v, row) => (<button onClick={() => { setSelectedPayout(row); setDrawerType('payout'); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><EyeIcon /></button>) },
  ];

  if (view === VIEWS.PAYMENT_LIST) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-1">Payment List</h1>
        <p className="text-sm text-slate-500 mb-4">Every payment received from subscribers</p>
        <Toolbar statusFilter={payStatusFilter} onStatusChange={setPayStatusFilter} statusOptions={Object.values(PAYMENT_STATUSES)} search={paySearch} onSearchChange={setPaySearch} sortOptions={PAYMENT_SORTS} sort={paySort} onSortChange={setPaySort} onExport={exportPayments} />
        <DataTable columns={paymentCols} data={sortedPayments} loading={loading} error={error} onRetry={fetchPayments} />
        <PaymentDetailsDrawer open={drawerType === 'details'} payment={selectedPayment} onClose={closeAll} onInitiateRefund={() => handleRefund(selectedPayment.id)} onViewStatus={() => setDrawerType('refund-steps')} />
        <PaymentFailedModal open={drawerType === 'failed-modal'} payment={selectedPayment} onClose={closeAll} onRetry={() => handleRetry(selectedPayment.id)} />
        <PaymentRefundDrawer open={drawerType === 'refund-steps'} onClose={closeAll} />
      </>
    );
  }

  if (view === VIEWS.PAYOUT_LIST) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-1">Influencer Payout</h1>
        <p className="text-sm text-slate-500 mb-4">Commission paid out to influencers</p>
        <Toolbar statusFilter={payoutStatusFilter} onStatusChange={setPayoutStatusFilter} statusOptions={Object.values(PAYOUT_STATUSES)} search={payoutSearch} onSearchChange={setPayoutSearch} sortOptions={PAYOUT_SORTS} sort={payoutSort} onSortChange={setPayoutSort} onExport={exportPayouts} />
        <DataTable columns={payoutCols} data={sortedPayouts} loading={loading} error={error} onRetry={fetchPayouts} />
        <InfluencerPayoutDrawer open={drawerType === 'payout'} payout={selectedPayout} onClose={closeAll} />
      </>
    );
  }

  return (
    <>
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Payments</h1>
          <p className="text-sm text-slate-500">You will find everything about users in this platform.</p>
        </div>
        {/* Was a dead <Button>. There is no report screen to open, so it
            downloads the same figures instead of pretending to navigate. */}
        <Button text='Download Report' handler={exportPayments} />
      </header>

      <div className="flex gap-4 mb-4 flex-wrap">
        <StatCard title="Total Revenue" value={stats?.totalRevenue} prefix={ORG.currencySymbol} color={CHART_COLORS.success} />
        <StatCard title="Influencer Payouts" value={stats?.influencerPayouts} prefix={ORG.currencySymbol} color={CHART_COLORS.danger} />
        <StatCard title="Subscriptions" value={stats?.subscriptions} prefix={ORG.currencySymbol} color={CHART_COLORS.success} />
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
        <StatCard title="Single Sales" value={stats?.singleSales} prefix={ORG.currencySymbol} color={CHART_COLORS.danger} />
        <StatCard title="Net Revenue" value={stats?.netRevenue} prefix={ORG.currencySymbol} color={CHART_COLORS.success} />
      </div>

      <div className="mb-8"><PaymentsChart /></div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Payment List</h2>
          <p className="text-sm text-slate-500">Every payment received from subscribers</p>
        </div>
        <Toolbar statusFilter={payStatusFilter} onStatusChange={setPayStatusFilter} statusOptions={Object.values(PAYMENT_STATUSES)} search={paySearch} onSearchChange={setPaySearch} sortOptions={PAYMENT_SORTS} sort={paySort} onSortChange={setPaySort} onExport={exportPayments} />
        <DataTable columns={paymentCols} data={sortedPayments.slice(0, 5)} loading={loading} error={error} onRetry={fetchPayments} />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400">View All details at once?</span>
          <button onClick={() => setView(VIEWS.PAYMENT_LIST)} className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1">
            View All List
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Influencer Payout</h2>
          <p className="text-sm text-slate-500">Commission paid out to influencers</p>
        </div>
        <Toolbar statusFilter={payoutStatusFilter} onStatusChange={setPayoutStatusFilter} statusOptions={Object.values(PAYOUT_STATUSES)} search={payoutSearch} onSearchChange={setPayoutSearch} sortOptions={PAYOUT_SORTS} sort={payoutSort} onSortChange={setPayoutSort} onExport={exportPayouts} />
        <DataTable columns={payoutCols} data={sortedPayouts.slice(0, 5)} loading={loading} error={error} onRetry={fetchPayouts} />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400">View All details at once?</span>
          <button onClick={() => setView(VIEWS.PAYOUT_LIST)} className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1">
            View All List
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </section>

      <PaymentDetailsDrawer open={drawerType === 'details'} payment={selectedPayment} onClose={closeAll} onInitiateRefund={() => handleRefund(selectedPayment.id)} onViewStatus={() => setDrawerType('refund-steps')} />
      <PaymentFailedModal open={drawerType === 'failed-modal'} payment={selectedPayment} onClose={closeAll} onRetry={() => handleRetry(selectedPayment.id)} />
      <PaymentRefundDrawer open={drawerType === 'refund-steps'} onClose={closeAll} />
      <InfluencerPayoutDrawer open={drawerType === 'payout'} payout={selectedPayout} onClose={closeAll} />
    </>
  );
}
