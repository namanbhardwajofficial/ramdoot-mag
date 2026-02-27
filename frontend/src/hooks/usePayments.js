import { useState, useCallback } from 'react';
import { BACKEND_URL } from '@/config/constants';

async function safeFetch(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export default function usePayments() {
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      const data = await safeFetch(`${BACKEND_URL}/payments?${params}`);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) { console.error('fetchPayments', err); }
  }, []);

  const fetchPayouts = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      const data = await safeFetch(`${BACKEND_URL}/payments/influencer-payouts?${params}`);
      setPayouts(Array.isArray(data) ? data : []);
    } catch (err) { console.error('fetchPayouts', err); }
  }, []);

  const fetchStats = useCallback(async () => {
    try { setStats(await safeFetch(`${BACKEND_URL}/payments/stats`)); } catch (err) { console.error('fetchStats', err); }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchPayments(), fetchPayouts()]);
    setLoading(false);
  }, [fetchStats, fetchPayments, fetchPayouts]);

  const retryPayment = useCallback(async (id) => {
    await safeFetch(`${BACKEND_URL}/payments/${id}/retry`, { method: 'POST' });
    await fetchPayments();
  }, [fetchPayments]);

  const refundPayment = useCallback(async (id) => {
    await safeFetch(`${BACKEND_URL}/payments/${id}/refund`, { method: 'POST' });
    await fetchPayments();
  }, [fetchPayments]);

  return { payments, payouts, stats, loading, init, fetchPayments, fetchPayouts, fetchStats, retryPayment, refundPayment };
}
