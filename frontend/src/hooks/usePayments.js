import { useState, useCallback, useMemo } from 'react';
import { paymentsApi, earningsApi, listOf, lc } from '@/lib/api';

// NOTE: the backend exposes only the *current user's* payments (/payments/me)
// and payouts (/earnings/payouts) — there is no admin-wide list yet, so for an
// admin these tables are real but typically empty.
function mapPayment(p) {
  return {
    ...p,
    userName: p.user?.fullName || '—',
    magazineTitle: p.description || '—',
    amount: Number(p.amount ?? 0),
    status: lc(p.status),
  };
}

function mapPayout(p) {
  return {
    ...p,
    influencerName: p.user?.fullName || p.influencer?.fullName || '—',
    influencerId: p.userId || p.influencerId,
    amount: Number(p.amount ?? 0),
    status: lc(p.status),
    campaignLink: p.campaign?.name || '—',
  };
}

const sum = (rows) => rows.reduce((a, r) => a + r.amount, 0);

// Revenue splits. `relatedType` is set when the order is created; the checkout
// flow tags subscription purchases as "subscription", so anything else that
// settled is a one-off sale.
function paymentTotalsOf(rows) {
  const settled = rows.filter((p) => p.status === 'success');
  const subs = settled.filter((p) => String(p.relatedType || '').toLowerCase() === 'subscription');
  const total = sum(settled);
  return { totalRevenue: total, subscriptions: sum(subs), singleSales: total - sum(subs) };
}

function payoutTotalsOf(rows) {
  return { influencerPayouts: sum(rows.filter((p) => p.status === 'success')) };
}

export default function usePayments() {
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Set when a primary list fetch fails so the page can show an inline
  // error with a retry, instead of an empty table that looks like "no data".
  const [error, setError] = useState(null);

  // Totals are kept apart from the table rows so the cards keep describing the
  // whole account while the table is filtered down.
  const [paymentTotals, setPaymentTotals] = useState(null);
  const [payoutTotals, setPayoutTotals] = useState(null);

  // Null until something loads, so the cards can show "—" rather than claiming
  // a real ₹0 when the request failed.
  const stats = useMemo(() => {
    if (!paymentTotals && !payoutTotals) return null;
    const revenue = paymentTotals?.totalRevenue ?? 0;
    const paidOut = payoutTotals?.influencerPayouts ?? 0;
    return {
      totalRevenue: revenue,
      subscriptions: paymentTotals?.subscriptions ?? 0,
      singleSales: paymentTotals?.singleSales ?? 0,
      influencerPayouts: paidOut,
      netRevenue: revenue - paidOut,
    };
  }, [paymentTotals, payoutTotals]);

  const fetchPayments = useCallback(async (filters = {}) => {
    try {
      setError(null);
      const all = listOf(await paymentsApi.mine()).map(mapPayment);
      setPaymentTotals(paymentTotalsOf(all));
      setPayments(filters.status ? all.filter((p) => p.status === lc(filters.status)) : all);
    } catch (err) {
      setPaymentTotals(null);
      setError(err.message || 'Could not load payments');
    }
  }, []);

  const fetchPayouts = useCallback(async (filters = {}) => {
    try {
      setError(null);
      const all = listOf(await earningsApi.payouts()).map(mapPayout);
      setPayoutTotals(payoutTotalsOf(all));
      setPayouts(filters.status ? all.filter((p) => p.status === lc(filters.status)) : all);
    } catch (err) {
      setPayoutTotals(null);
      setError(err.message || 'Could not load payouts');
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPayments(), fetchPayouts()]);
    setLoading(false);
  }, [fetchPayments, fetchPayouts]);

  // No retry/refund endpoints yet — refresh so the UI stays consistent.
  const retryPayment = useCallback(async () => { await fetchPayments(); }, [fetchPayments]);
  const refundPayment = useCallback(async () => { await fetchPayments(); }, [fetchPayments]);

  return { payments, payouts, stats, loading, error, init, fetchPayments, fetchPayouts, retryPayment, refundPayment };
}
