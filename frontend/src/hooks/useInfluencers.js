import { useState, useCallback } from 'react';
import { BACKEND_URL } from '@/config/constants';

async function safeFetch(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export default function useInfluencers() {
  const [influencers, setInfluencers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInfluencers = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      const data = await safeFetch(`${BACKEND_URL}/influencers?${params}`);
      setInfluencers(Array.isArray(data) ? data : []);
    } catch (err) { console.error('fetchInfluencers', err); }
  }, []);

  const fetchCampaigns = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      if (filters.influencerId) params.set('influencerId', filters.influencerId);
      const data = await safeFetch(`${BACKEND_URL}/campaigns?${params}`);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) { console.error('fetchCampaigns', err); }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchInfluencers(), fetchCampaigns()]);
    setLoading(false);
  }, [fetchInfluencers, fetchCampaigns]);

  const getInfluencer = useCallback(async (id) => safeFetch(`${BACKEND_URL}/influencers/${id}`), []);
  const getInfluencerCampaigns = useCallback(async (id) => safeFetch(`${BACKEND_URL}/influencers/${id}/campaigns`), []);
  const getInfluencerAudience = useCallback(async (id) => safeFetch(`${BACKEND_URL}/influencers/${id}/audience`), []);
  const getInfluencerPayments = useCallback(async (id) => safeFetch(`${BACKEND_URL}/influencers/${id}/payments`), []);
  const getCampaignFinancials = useCallback(async (id) => safeFetch(`${BACKEND_URL}/campaigns/${id}/financials`), []);
  const getCampaign = useCallback(async (id) => safeFetch(`${BACKEND_URL}/campaigns/${id}`), []);

  const createCampaign = useCallback(async (form) => {
    const camp = await safeFetch(`${BACKEND_URL}/campaigns`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    await fetchCampaigns();
    return camp;
  }, [fetchCampaigns]);

  const restrictInfluencer = useCallback(async (id) => {
    await safeFetch(`${BACKEND_URL}/influencers/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'suspended' }),
    });
    await fetchInfluencers();
  }, [fetchInfluencers]);

  return {
    influencers, campaigns, loading, init,
    fetchInfluencers, fetchCampaigns,
    getInfluencer, getInfluencerCampaigns, getInfluencerAudience, getInfluencerPayments,
    getCampaign, getCampaignFinancials, createCampaign, restrictInfluencer,
  };
}
