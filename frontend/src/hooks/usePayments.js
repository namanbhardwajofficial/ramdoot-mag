import { useState, useCallback } from 'react';
import { adminApi, listOf, lc } from '@/lib/api';

// Admin-scoped: /admin/payments and /admin/payouts describe the whole platform.
// The caller-scoped /payments/me and /earnings/payouts are deliberately not used
// here — for an admin they return that admin's own (empty) rows, which is why
// this page used to show "Total Revenue ₹0" above a chart reading ₹1,448.
function mapPayment(p) {
  return {
    ...p,
    userName: p.user?.fullName || '—',
    // The id lives on the nested `user`, not at the top level — without this
    // the table's "User & ID" cell rendered a bare "#" under every name.
    userId: p.userId || p.user?.id || '',
    userEmail: p.user?.email || '',
    magazineTitle: p.description || '—',
    amount: Number(p.amount ?? 0),
    status: lc(p.status),
  };
}

function mapPayout(p) {
  return {
    ...p,
    influencerName: p.user?.fullName || p.influencer?.fullName || '—',
    // Same as above: /admin/payouts nests the id under `user`.
    influencerId: p.userId || p.influencerId || p.user?.id || p.influencer?.id || '',
    influencerEmail: p.user?.email || p.influencer?.email || '',
    amount: Number(p.amount ?? 0),
    status: lc(p.status),
    // /admin/payouts does not join the campaign, so there is no name to show.
    campaignLink: p.campaign?.name || '—',
  };
}

export default function usePayments() {
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // Set when a primary list fetch fails so the page can show an inline
  // error with a retry, instead of an empty table that looks like "no data".
  const [error, setError] = useState(null);

  // Filtering is server-side now (`?status=`), so the totals cannot be derived
  // from the rows on screen — they come from their own endpoint and keep
  // describing the whole platform while the table is filtered down.
  const fetchStats = useCallback(async () => {
    try {
      const [breakdown, analytics] = await Promise.all([
        adminApi.revenueBreakdown(),
        adminApi.analytics(),
      ]);
      setStats({
        totalRevenue: analytics?.revenue?.total ?? breakdown?.netRevenue,
        subscriptions: breakdown?.subscriptions,
        singleSales: breakdown?.singleSales,
        influencerPayouts: breakdown?.payoutsPaid,
        netRevenue: breakdown?.netRevenue,
      });
    } catch (err) {
      // Null, not zeroes — the cards render "—" rather than assert a figure.
      setStats(null);
      setError((prev) => prev || err.message || 'Could not load revenue totals');
    }
  }, []);

  const fetchPayments = useCallback(async (filters = {}) => {
    try {
      setError(null);
      const res = await adminApi.payments({
        status: filters.status ? String(filters.status).toUpperCase() : undefined,
        search: filters.search || undefined,
        limit: 100,
      });
      setPayments(listOf(res).map(mapPayment));
    } catch (err) {
      setError(err.message || 'Could not load payments');
    }
  }, []);

  const fetchPayouts = useCallback(async (filters = {}) => {
    try {
      setError(null);
      const res = await adminApi.payouts({
        status: filters.status ? String(filters.status).toUpperCase() : undefined,
        limit: 100,
      });
      let rows = listOf(res).map(mapPayout);
      // /admin/payouts takes no `search` param, so that one stays client-side.
      if (filters.search) {
        const q = filters.search.toLowerCase();
        rows = rows.filter((p) => (p.influencerName || '').toLowerCase().includes(q));
      }
      setPayouts(rows);
    } catch (err) {
      setError(err.message || 'Could not load payouts');
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

  return { payments, payouts, stats, loading, error, init, fetchPayments, fetchPayouts, retryPayment, refundPayment };
}
