import { useState, useCallback } from 'react';
import { BACKEND_URL } from '@/config/constants';

async function safeFetch(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export default function usePublications() {
  const [publications, setPublications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      const data = await safeFetch(`${BACKEND_URL}/publications?${params}`);
      setPublications(Array.isArray(data) ? data : []);
    } catch (err) { console.error('fetchPublications', err); }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStats(await safeFetch(`${BACKEND_URL}/publications/stats`));
    } catch (err) { console.error('fetchStats', err); }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchAll()]);
    setLoading(false);
  }, [fetchStats, fetchAll]);

  const publish = useCallback(async (form) => {
    const pub = await safeFetch(`${BACKEND_URL}/publications`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    await Promise.all([fetchStats(), fetchAll()]);
    return pub;
  }, [fetchStats, fetchAll]);

  const update = useCallback(async (id, form) => {
    const pub = await safeFetch(`${BACKEND_URL}/publications/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    await Promise.all([fetchStats(), fetchAll()]);
    return pub;
  }, [fetchStats, fetchAll]);

  const deactivate = useCallback(async (id, data) => {
    const pub = await safeFetch(`${BACKEND_URL}/publications/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'paused', ...data }),
    });
    await Promise.all([fetchStats(), fetchAll()]);
    return pub;
  }, [fetchStats, fetchAll]);

  const remove = useCallback(async (id) => {
    await safeFetch(`${BACKEND_URL}/publications/${id}`, { method: 'DELETE' });
    await Promise.all([fetchStats(), fetchAll()]);
  }, [fetchStats, fetchAll]);

  const getVersions = useCallback(async (id) => {
    return safeFetch(`${BACKEND_URL}/publications/${id}/versions`);
  }, []);

  return { publications, stats, loading, init, fetchAll, fetchStats, publish, update, deactivate, remove, getVersions };
}
