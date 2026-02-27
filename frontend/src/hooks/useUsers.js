import { useState, useCallback } from 'react';
import { BACKEND_URL } from '@/config/constants';

async function safeFetch(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      if (filters.sort) params.set('sort', filters.sort);
      const data = await safeFetch(`${BACKEND_URL}/users?${params}`);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) { console.error('fetchUsers', err); }
  }, []);

  const fetchStats = useCallback(async () => {
    try { setStats(await safeFetch(`${BACKEND_URL}/users/stats`)); } catch (err) { console.error('fetchStats', err); }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchAll()]);
    setLoading(false);
  }, [fetchStats, fetchAll]);

  const createUser = useCallback(async (form) => {
    const user = await safeFetch(`${BACKEND_URL}/users`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    await Promise.all([fetchStats(), fetchAll()]);
    return user;
  }, [fetchStats, fetchAll]);

  const deactivateUser = useCallback(async (id) => {
    const user = await safeFetch(`${BACKEND_URL}/users/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'suspended' }),
    });
    await Promise.all([fetchStats(), fetchAll()]);
    return user;
  }, [fetchStats, fetchAll]);

  const removeUser = useCallback(async (id) => {
    await safeFetch(`${BACKEND_URL}/users/${id}`, { method: 'DELETE' });
    await Promise.all([fetchStats(), fetchAll()]);
  }, [fetchStats, fetchAll]);

  return { users, stats, loading, init, fetchAll, fetchStats, createUser, deactivateUser, removeUser };
}
