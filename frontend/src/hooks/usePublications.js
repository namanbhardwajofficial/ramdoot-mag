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
  // Set when a primary list fetch fails so the page can show an inline
  // error with a retry, instead of an empty table that looks like "no data".
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async (filters = {}) => {
    try {
      setError(null);
      let rows = listOf(await magazinesApi.list({ limit: 100 })).map(mapPub);
      if (filters.status) rows = rows.filter((p) => p.status === lc(filters.status));
      if (filters.search) {
        const q = filters.search.toLowerCase();
        rows = rows.filter((p) => (p.title || '').toLowerCase().includes(q));
      }
      setPublications(rows);
    } catch (err) {
      setError(err.message || 'Could not load publications');
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
      // 1. Create the magazine entry.
      const created = await magazinesApi.create({
        title: form.title || form.name,
        shortDescription: form.shortDescription || form.description,
        description: form.description,
        price:
          form.pricingPlan === 'free'
            ? 0
            : form.price != null && form.price !== ''
              ? Number(form.price)
              : undefined,
      });

      // 2. Upload the PDF and/or cover image (the backend requires a PDF to publish).
      const files = [form.pdfFile, form.coverFile].filter(Boolean);
      if (files.length) await magazinesApi.upload(created.id, files);

      // 3. Publish it, optionally notifying paid subscribers.
      const published = await magazinesApi.publish(created.id, {
        notifySubscribers: !!form.sendNotification,
      });

      await Promise.all([fetchStats(), fetchAll()]);
      return published;
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

  return { publications, stats, loading, error, init, fetchAll, fetchStats, publish, update, deactivate, remove, getVersions };
}
