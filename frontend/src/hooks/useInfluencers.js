import { useState, useCallback } from 'react';
import { adminApi, campaignsApi, usersApi, listOf, lc } from '@/lib/api';

function mapInfluencer(i) {
  return {
    ...i,
    name: i.fullName,
    status: lc(i.status),
    activeCampaigns: i._count?.campaigns ?? 0,
    platforms: [],
    totalEarning: 0,
    roi: '—',
  };
}

function mapCampaign(c) {
  return {
    ...c,
    influencerName: c.influencer?.fullName || '—',
    startingDate: c.startDate,
    totalClicks: c._count?.clickEvents ?? 0,
    clickConversion: c._count?.conversions ?? 0,
    status: lc(c.status),
    commissionEarned: 0,
    totalRevenue: 0,
  };
}

function applyFilters(rows, filters) {
  let out = rows;
  if (filters.status) out = out.filter((r) => r.status === lc(filters.status));
  if (filters.search) {
    const q = filters.search.toLowerCase();
    out = out.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.influencerName || '').toLowerCase().includes(q),
    );
  }
  return out;
}

export default function useInfluencers() {
  const [influencers, setInfluencers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  // Set when a primary list fetch fails so the page can show an inline
  // error with a retry, instead of an empty table that looks like "no data".
  const [error, setError] = useState(null);

  const fetchInfluencers = useCallback(async (filters = {}) => {
    try {
      setError(null);
      const res = await adminApi.influencers();
      const rows = (res?.influencers || []).map(mapInfluencer);
      setInfluencers(applyFilters(rows, filters));
    } catch (err) {
      setError(err.message || 'Could not load influencers');
    }
  }, []);

  const fetchCampaigns = useCallback(async (filters = {}) => {
    try {
      setError(null);
      const res = await campaignsApi.list({
        status: filters.status ? String(filters.status).toUpperCase() : undefined,
        limit: 100,
      });
      let rows = listOf(res).map(mapCampaign);
      if (filters.influencerId) rows = rows.filter((c) => c.influencerId === filters.influencerId);
      setCampaigns(applyFilters(rows, { search: filters.search }));
    } catch (err) {
      setError(err.message || 'Could not load campaigns');
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchInfluencers(), fetchCampaigns()]);
    setLoading(false);
  }, [fetchInfluencers, fetchCampaigns]);

  const getInfluencer = useCallback(async (id) => {
    try {
      const res = await adminApi.influencers();
      const found = (res?.influencers || []).find((i) => i.id === id);
      return found ? mapInfluencer(found) : null;
    } catch {
      return null;
    }
  }, []);

  const getInfluencerCampaigns = useCallback(async (id) => {
    const res = await campaignsApi.list({ limit: 100 }).catch(() => ({ data: [] }));
    return listOf(res).map(mapCampaign).filter((c) => c.influencerId === id);
  }, []);

  // No dedicated endpoints for these yet — return safe empties.
  const getInfluencerAudience = useCallback(async () => ({}), []);
  const getInfluencerPayments = useCallback(async () => [], []);
  const getCampaignFinancials = useCallback(async () => ({}), []);

  const getCampaign = useCallback(async (id) => {
    const c = await campaignsApi.get(id);
    return mapCampaign(c);
  }, []);

  const createCampaign = useCallback(
    async (form) => {
      const camp = await campaignsApi.create(form);
      await fetchCampaigns();
      return camp;
    },
    [fetchCampaigns],
  );

  const restrictInfluencer = useCallback(
    async (id) => {
      await usersApi.setStatus(id, 'SUSPENDED');
      await fetchInfluencers();
    },
    [fetchInfluencers],
  );

  return {
    influencers,
    campaigns,
    loading,
    error,
    init,
    fetchInfluencers,
    fetchCampaigns,
    getInfluencer,
    getInfluencerCampaigns,
    getInfluencerAudience,
    getInfluencerPayments,
    getCampaign,
    getCampaignFinancials,
    createCampaign,
    restrictInfluencer,
  };
}
