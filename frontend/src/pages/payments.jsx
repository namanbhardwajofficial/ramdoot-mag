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
import { EyeIcon } from '@/componets/ui/icons';
import PaymentsChart from '@/componets/payments/PaymentsChart';
import PaymentDetailsDrawer from '@/componets/payments/PaymentDetailsDrawer';
import PaymentFailedModal from '@/componets/payments/PaymentFailedModal';
import PaymentRefundDrawer from '@/componets/payments/PaymentRefundDrawer';
import InfluencerPayoutDrawer from '@/componets/payments/InfluencerPayoutDrawer';
import usePayments from '@/hooks/usePayments';
import { ORG, PAYMENT_STATUSES, PAYOUT_STATUSES } from '@/config/constants';
import { CHART_COLORS } from '@/config/theme';

const VIEWS = { DASHBOARD: 'dashboard', PAYMENT_LIST: 'payment-list', PAYOUT_LIST: 'payout-list' };

export default function Payments() {
  const { payments, payouts, stats, loading, init, fetchPayments, fetchPayouts, retryPayment, refundPayment } = usePayments();

  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [paySearch, setPaySearch] = useState('');
  const [payStatusFilter, setPayStatusFilter] = useState('');
  const [payoutSearch, setPayoutSearch] = useState('');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('');

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [drawerType, setDrawerType] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);

  useEffect(() => { init(); }, [init]);
  useEffect(() => { if (!loading) fetchPayments({ status: payStatusFilter, search: paySearch }); }, [payStatusFilter, paySearch, loading, fetchPayments]);
  useEffect(() => { if (!loading) fetchPayouts({ status: payoutStatusFilter, search: payoutSearch }); }, [payoutStatusFilter, payoutSearch, loading, fetchPayouts]);

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
    { key: 'campaignLink', label: 'Campaign Link', render: (v) => <a href="#" className="text-slate-700 underline decoration-slate-300 underline-offset-2">{v}</a> },
    { key: '_actions', label: '', align: 'right', render: (_v, row) => (<button onClick={() => { setSelectedPayout(row); setDrawerType('payout'); }} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"><EyeIcon /></button>) },
  ];

  if (view === VIEWS.PAYMENT_LIST) {
    return (
      <>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.DASHBOARD)} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.DASHBOARD)} className="cursor-pointer">Payments</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink>Payment List</BreadcrumbLink></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold mb-1">Payment List</h1>
        <p className="text-sm text-slate-500 mb-4">List of all the magazines you been looking for</p>
        <Toolbar statusFilter={payStatusFilter} onStatusChange={setPayStatusFilter} statusOptions={Object.values(PAYMENT_STATUSES)} search={paySearch} onSearchChange={setPaySearch} onExport={() => {}} />
        <DataTable columns={paymentCols} data={payments} loading={loading} />
        <PaymentDetailsDrawer open={drawerType === 'details'} payment={selectedPayment} onClose={closeAll} onInitiateRefund={() => handleRefund(selectedPayment.id)} onViewStatus={() => setDrawerType('refund-steps')} />
        <PaymentFailedModal open={drawerType === 'failed-modal'} payment={selectedPayment} onClose={closeAll} onRetry={() => handleRetry(selectedPayment.id)} />
        <PaymentRefundDrawer open={drawerType === 'refund-steps'} onClose={closeAll} />
      </>
    );
  }

  if (view === VIEWS.PAYOUT_LIST) {
    return (
      <>
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.DASHBOARD)} className="cursor-pointer">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink onClick={() => setView(VIEWS.DASHBOARD)} className="cursor-pointer">Payments</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink>Influencer Payout</BreadcrumbLink></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold mb-1">Influencer Payout</h1>
        <p className="text-sm text-slate-500 mb-4">List of all the magazines you been looking for</p>
        <Toolbar statusFilter={payoutStatusFilter} onStatusChange={setPayoutStatusFilter} statusOptions={Object.values(PAYOUT_STATUSES)} search={payoutSearch} onSearchChange={setPayoutSearch} onExport={() => {}} />
        <DataTable columns={payoutCols} data={payouts} loading={loading} />
        <InfluencerPayoutDrawer open={drawerType === 'payout'} payout={selectedPayout} onClose={closeAll} />
      </>
    );
  }

  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>Settings</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>Payments</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Payments</h1>
          <p className="text-sm text-slate-500">You will find everything about users in this platform.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800">
          View Report
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </header>

      <div className="flex gap-4 mb-4 flex-wrap">
        <StatCard title="Total Revenue" value={stats?.totalRevenue ?? 0} prefix={ORG.currencySymbol} color={CHART_COLORS.success} trend="up" changeLabel="+ 100% vs last month" changeColor="text-emerald-600" />
        <StatCard title="Influencer Payouts" value={stats?.influencerPayouts ?? 0} prefix={ORG.currencySymbol} color={CHART_COLORS.danger} trend="down" changeLabel="+ 100% vs last month" changeColor="text-emerald-600" />
        <StatCard title="Subscriptions" value={stats?.subscriptions ?? 0} prefix={ORG.currencySymbol} color={CHART_COLORS.success} trend="up" changeLabel="+ 100% vs last month" changeColor="text-emerald-600" />
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
        <StatCard title="Single Sales" value={stats?.singleSales ?? 0} prefix={ORG.currencySymbol} color={CHART_COLORS.danger} trend="down" />
        <StatCard title="Net Revenue" value={stats?.netRevenue ?? 0} prefix={ORG.currencySymbol} color={CHART_COLORS.success} trend="up" />
      </div>

      <div className="mb-8"><PaymentsChart /></div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Payment List</h2>
          <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
        </div>
        <Toolbar statusFilter={payStatusFilter} onStatusChange={setPayStatusFilter} statusOptions={Object.values(PAYMENT_STATUSES)} search={paySearch} onSearchChange={setPaySearch} />
        <DataTable columns={paymentCols} data={payments.slice(0, 5)} loading={loading} />
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
          <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
        </div>
        <Toolbar statusFilter={payoutStatusFilter} onStatusChange={setPayoutStatusFilter} statusOptions={Object.values(PAYOUT_STATUSES)} search={payoutSearch} onSearchChange={setPayoutSearch} />
        <DataTable columns={payoutCols} data={payouts.slice(0, 5)} loading={loading} />
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
