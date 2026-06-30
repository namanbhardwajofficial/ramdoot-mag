import { useState, useCallback } from 'react';
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

export default function usePayments() {
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async (filters = {}) => {
    try {
      let rows = listOf(await paymentsApi.mine()).map(mapPayment);
      if (filters.status) rows = rows.filter((p) => p.status === lc(filters.status));
      setPayments(rows);
    } catch (err) {
      console.error('fetchPayments', err);
    }
  }, []);

  const fetchPayouts = useCallback(async (filters = {}) => {
    try {
      let rows = listOf(await earningsApi.payouts()).map(mapPayout);
      if (filters.status) rows = rows.filter((p) => p.status === lc(filters.status));
      setPayouts(rows);
    } catch (err) {
      console.error('fetchPayouts', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const rows = listOf(await paymentsApi.mine()).map(mapPayment);
      const sum = (s) =>
        rows.filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0);
      setStats({
        totalRevenue: sum('success'),
        successful: rows.filter((p) => p.status === 'success').length,
        failed: rows.filter((p) => p.status === 'failed').length,
        refunded: rows.filter((p) => p.status === 'refunded').length,
      });
    } catch (err) {
      console.error('fetchPaymentStats', err);
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchPayments(), fetchPayouts()]);
    setLoading(false);
  }, [fetchStats, fetchPayments, fetchPayouts]);

  // No retry/refund endpoints yet — refresh so the UI stays consistent.
  const retryPayment = useCallback(async () => { await fetchPayments(); }, [fetchPayments]);
  const refundPayment = useCallback(async () => { await fetchPayments(); }, [fetchPayments]);

  return { payments, payouts, stats, loading, init, fetchPayments, fetchPayouts, fetchStats, retryPayment, refundPayment };
}
