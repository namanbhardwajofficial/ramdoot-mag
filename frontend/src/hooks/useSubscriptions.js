import { useState, useCallback } from 'react';
import { subscriptionsApi, listOf } from '@/lib/api';

function billingLabel(c) {
  const v = String(c || '').toUpperCase();
  if (v === 'MONTHLY') return 'Monthly';
  if (v === 'YEARLY') return 'Yearly';
  if (v === 'QUARTERLY') return 'Quarterly';
  return c || '';
}

// Backend plan -> the "subscription" row shape the table expects.
function mapPlanRow(p) {
  return {
    ...p,
    status: p.isActive ? 'active' : 'deactivated',
    price: Number(p.price ?? 0),
    type: billingLabel(p.billingCycle),
    createdBy: p.createdBy?.fullName || 'admin',
    subscriberCount: p.subscriberCount ?? 0,
  };
}

// Backend plan -> the {id,label,priceInPaise} shape the dropdowns expect.
function mapPlanOption(p) {
  return { id: p.id, label: p.name, priceInPaise: Math.round(Number(p.price ?? 0) * 100) };
}

export default function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({ activeSubscribers: 0, newSubscriptions: 0, cancellations: 0 });
  const [loading, setLoading] = useState(true);
  // Set when a primary list fetch fails so the page can show an inline
  // error with a retry, instead of an empty table that looks like "no data".
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async (filters = {}) => {
    try {
      setError(null);
      let rows = listOf(await subscriptionsApi.plans()).map(mapPlanRow);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        rows = rows.filter(
          (r) => (r.name || '').toLowerCase().includes(q) || (r.type || '').toLowerCase().includes(q),
        );
      }
      if (filters.status) rows = rows.filter((r) => r.status === filters.status);
      setSubscriptions(rows);
    } catch (err) {
      setError(err.message || 'Could not load subscriptions');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const rows = listOf(await subscriptionsApi.plans()).map(mapPlanRow);
      const activeSubscribers = rows.reduce((s, p) => s + (p.subscriberCount || 0), 0);
      setStats({ activeSubscribers, newSubscriptions: 0, cancellations: 0 });
    } catch (err) {
      console.error('fetchSubStats', err);
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    try {
      setPlans(listOf(await subscriptionsApi.plans()).map(mapPlanOption));
    } catch (err) {
      console.error('fetchPlans', err);
    }
    await Promise.all([fetchStats(), fetchAll()]);
    setLoading(false);
  }, [fetchStats, fetchAll]);

  // The Add modal only collects planId/createdBy; a real create needs
  // name+price+billingCycle, so attempt the API call only when those exist.
  const create = useCallback(
    async (form) => {
      if (form?.name && form?.price) {
        await subscriptionsApi.createPlan({
          name: form.name,
          price: Number(form.price),
          billingCycle: String(form.billingCycle || 'MONTHLY').toUpperCase(),
          description: form.description,
        });
      }
      await Promise.all([fetchStats(), fetchAll()]);
    },
    [fetchStats, fetchAll],
  );

  const update = useCallback(
    async (id, form) => {
      const current = subscriptions.find((s) => s.id === id);
      if (form?.status && current && form.status !== current.status) {
        await subscriptionsApi.togglePlan(id);
      }
      const patch = {};
      if (form?.name) patch.name = form.name;
      if (form?.price != null && form.price !== '') patch.price = Number(form.price);
      if (form?.billingCycle) patch.billingCycle = String(form.billingCycle).toUpperCase();
      if (Object.keys(patch).length) await subscriptionsApi.updatePlan(id, patch);
      await Promise.all([fetchStats(), fetchAll()]);
    },
    [subscriptions, fetchStats, fetchAll],
  );

  const toggleStatus = useCallback(
    async (sub) => {
      await subscriptionsApi.togglePlan(sub.id);
      await Promise.all([fetchStats(), fetchAll()]);
    },
    [fetchStats, fetchAll],
  );

  // No delete-plan endpoint; deactivating is the closest real action.
  const remove = useCallback(
    async (id) => {
      const current = subscriptions.find((s) => s.id === id);
      if (!current || current.status === 'active') await subscriptionsApi.togglePlan(id);
      await Promise.all([fetchStats(), fetchAll()]);
    },
    [subscriptions, fetchStats, fetchAll],
  );

  return { subscriptions, plans, stats, loading, error, init, fetchAll, fetchStats, create, update, toggleStatus, remove };
}
