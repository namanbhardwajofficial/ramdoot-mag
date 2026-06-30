import { useState, useCallback } from 'react';
import { usersApi, listOf, lc } from '@/lib/api';

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

  const fetchAll = useCallback(async (filters = {}) => {
    try {
      const res = await usersApi.list({
        search: filters.search || undefined,
        status: filters.status ? String(filters.status).toUpperCase() : undefined,
        limit: 100,
      });
      setUsers(listOf(res).map(mapUser));
    } catch (err) {
      console.error('fetchUsers', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await usersApi.list({ limit: 100 });
      setStats(computeStats(listOf(res).map(mapUser)));
    } catch (err) {
      console.error('fetchUserStats', err);
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchAll()]);
    setLoading(false);
  }, [fetchStats, fetchAll]);

  const createUser = useCallback(
    async (form) => {
      const user = await usersApi.create({
        email: form.email,
        fullName: form.name || form.fullName,
        phone: form.phone || undefined,
        role: toRole(form.role),
      });
      await Promise.all([fetchStats(), fetchAll()]);
      return user;
    },
    [fetchStats, fetchAll],
  );

  // Only a status change exists for other users on the backend.
  const suspendUser = useCallback(
    async (id, payload = {}) => {
      const status = String(payload.status || 'suspended').toUpperCase();
      const user = await usersApi.setStatus(id, status);
      await Promise.all([fetchStats(), fetchAll()]);
      return user;
    },
    [fetchStats, fetchAll],
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
    loading,
    init,
    fetchAll,
    fetchStats,
    createUser,
    deactivateUser,
    updateUser,
    suspendUser,
    removeUser,
  };
}
