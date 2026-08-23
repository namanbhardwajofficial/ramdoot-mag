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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // Set when a primary list fetch fails so the page can show an inline
  // error with a retry, instead of an empty table that looks like "no data".
  const [error, setError] = useState(null);

  // One request feeds the table, the cards and the plan dropdowns — all three
  // used to fetch /subscriptions/plans separately on every mount. Filtering is
  // client-side, so the cards keep describing every plan, not the filtered set.
  const fetchAll = useCallback(async (filters = {}) => {
    try {
      setError(null);
      const raw = listOf(await subscriptionsApi.plans());
      const all = raw.map(mapPlanRow);
      setPlans(raw.map(mapPlanOption));
      setStats({
        activeSubscribers: all.reduce((n, p) => n + (p.subscriberCount || 0), 0),
        newSubscriptions: 0,
        cancellations: 0,
      });
      let rows = all;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        rows = rows.filter(
          (r) => (r.name || '').toLowerCase().includes(q) || (r.type || '').toLowerCase().includes(q),
        );
      }
      if (filters.status) rows = rows.filter((r) => r.status === filters.status);
      setSubscriptions(rows);
    } catch (err) {
      setStats(null);
      setError(err.message || 'Could not load subscriptions');
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await fetchAll();
    setLoading(false);
  }, [fetchAll]);

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
      await fetchAll();
    },
    [fetchAll],
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
      await fetchAll();
    },
    [subscriptions, fetchAll],
  );

  const toggleStatus = useCallback(
    async (sub) => {
      await subscriptionsApi.togglePlan(sub.id);
      await fetchAll();
    },
    [fetchAll],
  );

  // No delete-plan endpoint; deactivating is the closest real action.
  const remove = useCallback(
    async (id) => {
      const current = subscriptions.find((s) => s.id === id);
      if (!current || current.status === 'active') await subscriptionsApi.togglePlan(id);
      await fetchAll();
    },
    [subscriptions, fetchAll],
  );

  return { subscriptions, plans, stats, loading, error, init, fetchAll, create, update, toggleStatus, remove };
}
