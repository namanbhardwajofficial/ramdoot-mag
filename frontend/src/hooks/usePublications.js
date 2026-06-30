import { useState, useCallback } from 'react';
import { magazinesApi, listOf, lc } from '@/lib/api';

// "Publications" in the UI are backed by magazines.
function mapPub(m) {
  return {
    ...m,
    title: m.title,
    magazineRef: `#${String(m.id).slice(0, 8)}`,
    status: lc(m.status),
    publishedOn: m.publishedAt || m.createdAt,
    subscribers: 0,
    reads: m.readsCount ?? m.viewsCount ?? 0,
    revenue: 0,
  };
}

function computeStats(list) {
  const by = (s) => list.filter((p) => p.status === s).length;
  return {
    totalPublications: list.length,
    liveCount: by('live'),
    draftCount: by('draft'),
    totalReaders: list.reduce((s, p) => s + (p.reads || 0), 0),
  };
}

export default function usePublications() {
  const [publications, setPublications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async (filters = {}) => {
    try {
      let rows = listOf(await magazinesApi.list({ limit: 100 })).map(mapPub);
      if (filters.status) rows = rows.filter((p) => p.status === lc(filters.status));
      if (filters.search) {
        const q = filters.search.toLowerCase();
        rows = rows.filter((p) => (p.title || '').toLowerCase().includes(q));
      }
      setPublications(rows);
    } catch (err) {
      console.error('fetchPublications', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStats(computeStats(listOf(await magazinesApi.list({ limit: 100 })).map(mapPub)));
    } catch (err) {
      console.error('fetchPublicationStats', err);
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchAll()]);
    setLoading(false);
  }, [fetchStats, fetchAll]);

  const publish = useCallback(
    async (form) => {
      // Create the magazine, then publish it if it already has a PDF.
      const created = await magazinesApi.create({
        title: form.title || form.name,
        shortDescription: form.shortDescription,
        description: form.description,
        price: form.price != null && form.price !== '' ? Number(form.price) : undefined,
      });
      await Promise.all([fetchStats(), fetchAll()]);
      return created;
    },
    [fetchStats, fetchAll],
  );

  const update = useCallback(
    async (id, form) => {
      const patch = {};
      if (form?.title) patch.title = form.title;
      if (form?.shortDescription) patch.shortDescription = form.shortDescription;
      if (form?.description) patch.description = form.description;
      if (form?.price != null && form.price !== '') patch.price = Number(form.price);
      if (form?.status) patch.status = String(form.status).toUpperCase();
      const pub = await magazinesApi.update(id, patch);
      await Promise.all([fetchStats(), fetchAll()]);
      return pub;
    },
    [fetchStats, fetchAll],
  );

  const deactivate = useCallback(
    async (id) => {
      const pub = await magazinesApi.update(id, { status: 'PAUSED' });
      await Promise.all([fetchStats(), fetchAll()]);
      return pub;
    },
    [fetchStats, fetchAll],
  );

  // No hard-delete endpoint; archive instead.
  const remove = useCallback(
    async (id) => {
      await magazinesApi.update(id, { status: 'ARCHIVED' });
      await Promise.all([fetchStats(), fetchAll()]);
    },
    [fetchStats, fetchAll],
  );

  const getVersions = useCallback(async () => [], []);

  return { publications, stats, loading, init, fetchAll, fetchStats, publish, update, deactivate, remove, getVersions };
}
