import { useState, useCallback } from 'react';
import { usersApi, listOf, lc } from '@/lib/api';
import { toastError } from '@/lib/confirm';

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

// Backend user entity -> the row shape the Users table/detail expects.
function mapUser(u) {
  const subscribed = (u._count?.userSubscriptions ?? 0) > 0;
  return {
    ...u,
    name: u.fullName,
    status: lc(u.status),
    role: lc(u.role),
    subscription: subscribed ? 'Subscribed' : 'None',
    subscriptionPlan: '',
    lastActive: u.lastLoginAt ? fmtDate(u.lastLoginAt) : '—',
    totalSpent: 0,
    joinedOn: u.createdAt,
  };
}

// GET /users only returns `_count` aggregates, so the list row has nothing
// behind the detail view's billing fields. GET /users/:id returns the actual
// related rows (userSubscriptions with a nested plan, payments, campaigns) —
// this folds those into the same row shape the detail view already renders.
// Note: the nested plan has no `magazines`, so the Magazines tab stays empty
// until the backend includes them (or we fetch plans separately).
function mapUserDetail(u) {
  const subs = u.userSubscriptions || [];
  const active = subs.find((s) => String(s.status).toUpperCase() === 'ACTIVE') || subs[0];
  const latestPayment = (u.payments || [])[0];
  const spent = Number(u.totalSpent ?? 0);
  return {
    ...mapUser(u),
    subscription: active ? 'Subscribed' : 'None',
    subscriptionPlan: active?.plan?.name || '',
    amount: active?.plan?.price != null ? `₹${Number(active.plan.price).toLocaleString('en-IN')}` : '—',
    paymentMethod: latestPayment?.paymentMethod || '—',
    totalSpent: spent,
    lastLogin: u.lastLoginAt ? fmtDate(u.lastLoginAt) : '—',
    twoFA: u.isTwoFactorEnabled ? { status: 'Enabled' } : undefined,
  };
}

function computeStats(list) {
  const by = (s) => list.filter((u) => u.status === s).length;
  return {
    totalUsers: list.length,
    activeUsers: by('active'),
    inactiveUsers: by('inactive'),
    paidUsers: list.filter((u) => u.subscription === 'Subscribed').length,
    churnedUsers: by('blocked') + by('suspended'),
    paidChange: '',
  };
}

function toRole(role) {
  const r = String(role || 'User').toUpperCase();
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'INFLUENCER') return 'INFLUENCER';
  return 'USER';
}

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // Set when a primary list fetch fails so the page can show an inline
  // error with a retry, instead of an empty table that looks like "no data".
  const [error, setError] = useState(null);

  // Filtering happens server-side here, so a filtered response can't be used
  // for the cards — they must stay whole-account totals. An unfiltered load
  // (mount, and after every mutation) refreshes them from the same response;
  // a filtered one leaves the previous totals alone.
  const fetchAll = useCallback(async (filters = {}) => {
    const filtered = !!(filters.search || filters.status);
    try {
      setError(null);
      const res = await usersApi.list({
        search: filters.search || undefined,
        status: filters.status ? String(filters.status).toUpperCase() : undefined,
        limit: 100,
      });
      const rows = listOf(res).map(mapUser);
      setUsers(rows);
      if (!filtered) setStats(computeStats(rows));
    } catch (err) {
      if (!filtered) setStats(null);
      setError(err.message || 'Could not load users');
    }
  }, []);

  // Full record for one user, for the detail view. Returns null on failure so
  // the caller can fall back to the list row rather than showing nothing.
  //
  // The fallback is real data, just thinner — no plan, billing or 2FA — so the
  // detail view still renders and only looks like the user has none of those.
  // This is opened by a click, so a toast is the right shape: it tells the user
  // what they are looking at without replacing a usable screen with an error.
  const fetchUser = useCallback(async (id) => {
    try {
      return mapUserDetail(await usersApi.get(id));
    } catch (err) {
      toastError(`${err.message || 'Could not load the full record'} — showing partial details.`);
      return null;
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await fetchAll();
    setLoading(false);
  }, [fetchAll]);

  const createUser = useCallback(
    async (form) => {
      const user = await usersApi.create({
        email: form.email,
        fullName: form.name || form.fullName,
        phone: form.phone || undefined,
        role: toRole(form.role),
      });
      await fetchAll();
      return user;
    },
    [fetchAll],
  );

  // Only a status change exists for other users on the backend.
  const suspendUser = useCallback(
    async (id, payload = {}) => {
      const status = String(payload.status || 'suspended').toUpperCase();
      const user = await usersApi.setStatus(id, status);
      await fetchAll();
      return user;
    },
    [fetchAll],
  );

  const deactivateUser = useCallback((id) => suspendUser(id, { status: 'suspended' }), [suspendUser]);

  // No hard-delete endpoint; closest real action is blocking the account.
  const removeUser = useCallback((id) => suspendUser(id, { status: 'blocked' }), [suspendUser]);

  // No admin profile-edit endpoint; push a status change if present, else local-only.
  const updateUser = useCallback(
    async (id, form) => {
      if (form?.status) await suspendUser(id, { status: form.status });
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...form } : u)));
      return { id, ...form };
    },
    [suspendUser],
  );

  return {
    users,
    stats,
    error,
    loading,
    init,
    fetchAll,
    fetchUser,
    createUser,
    deactivateUser,
    updateUser,
    suspendUser,
    removeUser,
  };
}
