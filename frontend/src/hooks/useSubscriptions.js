import { useState, useCallback } from 'react';
import { BACKEND_URL } from '@/config/constants';

async function safeFetch(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export default function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({ activeSubscribers: 0, newSubscriptions: 0, cancellations: 0 });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      const data = await safeFetch(`${BACKEND_URL}/subscriptions?${params}`);
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) { console.error('fetchSubscriptions', err); }
  }, []);

  const fetchStats = useCallback(async () => {
    try { setStats(await safeFetch(`${BACKEND_URL}/subscriptions/stats`)); } catch (err) { console.error('fetchStats', err); }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    const [pl] = await Promise.all([
      safeFetch(`${BACKEND_URL}/subscriptions/plans`),
      fetchStats(),
      fetchAll(),
    ]);
    setPlans(Array.isArray(pl) ? pl : []);
    setLoading(false);
  }, [fetchStats, fetchAll]);

  const create = useCallback(async (form) => {
    await safeFetch(`${BACKEND_URL}/subscriptions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    await Promise.all([fetchStats(), fetchAll()]);
  }, [fetchStats, fetchAll]);

  const toggleStatus = useCallback(async (sub) => {
    const newStatus = sub.status === 'active' ? 'deactivated' : 'active';
    await safeFetch(`${BACKEND_URL}/subscriptions/${sub.id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }),
    });
    await Promise.all([fetchStats(), fetchAll()]);
  }, [fetchStats, fetchAll]);

  const remove = useCallback(async (id) => {
    await safeFetch(`${BACKEND_URL}/subscriptions/${id}`, { method: 'DELETE' });
    await Promise.all([fetchStats(), fetchAll()]);
  }, [fetchStats, fetchAll]);

  return { subscriptions, plans, stats, loading, init, fetchAll, fetchStats, create, toggleStatus, remove };
}
