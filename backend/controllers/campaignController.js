import { CAMPAIGN_STATUSES, CAMPAIGNS, WEEKLY_CHART } from '../config/magazines.js';

const campaigns = [...CAMPAIGNS];
let nextId = campaigns.length + 1;

export function list(req, res) {
  const { status, search, influencerId } = req.query;
  let result = campaigns;
  if (influencerId) result = result.filter((c) => c.influencerId === influencerId);
  if (status) result = result.filter((c) => c.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }
  res.json(result);
}

export function getById(req, res) {
  const camp = campaigns.find((c) => c.id === req.params.id);
  if (!camp) return res.status(404).json({ message: 'Campaign not found' });
  res.json(camp);
}

export function getFinancials(req, res) {
  const camp = campaigns.find((c) => c.id === req.params.id);
  if (!camp) return res.status(404).json({ message: 'Campaign not found' });
  const totalRevenue = 43219;
  const profitMargin = 32;
  const totalProfit = 29000;
  const commission = 14219;
  res.json({
    totalRevenue, totalProfit, profitMargin: `${profitMargin}%`, influencerCommission: commission,
    totalPayable: commission, paid: 4219, taxes: '18% GST',
    chart: WEEKLY_CHART.revenue, labels: WEEKLY_CHART.labels,
  });
}

export function create(req, res) {
  const { name, influencerId, influencerName, startingDate, endDate, platforms, email, createdBy } = req.body;
  const camp = {
    id: `camp_${Date.now().toString(36)}${nextId++}`,
    name: name || 'New Campaign',
    influencerId: influencerId || '',
    influencerName: influencerName || '',
    startingDate: startingDate || new Date().toISOString(),
    endDate: endDate || new Date().toISOString(),
    totalClicks: 0, clickConversion: 0, conversions: '0%',
    status: CAMPAIGN_STATUSES.ACTIVE,
    commissionEarned: 0, totalRevenue: 0,
    platforms: platforms || [], createdBy: createdBy || 'Admin', email: email || '',
  };
  campaigns.push(camp);
  res.status(201).json(camp);
}

export function updateStatus(req, res) {
  const camp = campaigns.find((c) => c.id === req.params.id);
  if (!camp) return res.status(404).json({ message: 'Campaign not found' });
  const { status } = req.body;
  const allowed = Object.values(CAMPAIGN_STATUSES);
  if (!allowed.includes(status)) return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
  camp.status = status;
  res.json(camp);
}

export function remove(req, res) {
  const idx = campaigns.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Campaign not found' });
  const [removed] = campaigns.splice(idx, 1);
  res.json({ message: 'Deleted', id: removed.id });
}
