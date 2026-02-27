import { INFLUENCER_STATUSES, INFLUENCERS, CAMPAIGNS, WEEKLY_CHART } from '../config/magazines.js';

const influencers = [...INFLUENCERS];
const campaigns = [...CAMPAIGNS];

export function list(req, res) {
  const { status, search } = req.query;
  let result = influencers;
  if (status) result = result.filter((i) => i.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((i) => i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.realName.toLowerCase().includes(q));
  }
  res.json(result);
}

export function getById(req, res) {
  const inf = influencers.find((i) => i.id === req.params.id);
  if (!inf) return res.status(404).json({ message: 'Influencer not found' });
  res.json(inf);
}

export function getCampaigns(req, res) {
  const inf = influencers.find((i) => i.id === req.params.id);
  if (!inf) return res.status(404).json({ message: 'Influencer not found' });
  const result = campaigns.filter((c) => c.influencerId === req.params.id);
  res.json(result);
}

export function getAudience(req, res) {
  const inf = influencers.find((i) => i.id === req.params.id);
  if (!inf) return res.status(404).json({ message: 'Influencer not found' });
  res.json({ refundRate: '9%', paidVsFree: '20%', paidChange: '+52 Paid users', revenuePerSub: 49 });
}

export function getPayments(req, res) {
  const inf = influencers.find((i) => i.id === req.params.id);
  if (!inf) return res.status(404).json({ message: 'Influencer not found' });
  const history = campaigns.filter((c) => c.influencerId === req.params.id).map((c) => ({
    campaignName: c.name, startingDate: c.startingDate, commissionEarned: c.commissionEarned, totalClicks: c.totalClicks,
    method: c.commissionEarned > 5000 ? 'Bank Transfer' : 'UPI',
    status: c.status === 'active' ? 'active' : c.status === 'paused' ? 'paused' : 'paid',
  }));
  res.json({
    paymentModel: inf.paymentModel, commission: inf.commission, currency: 'INR (\u20B9)', taxApplicable: '18% GST',
    totalEarned: inf.totalEarned, totalPaid: inf.totalPaid, pendingAmount: inf.pendingAmount,
    nextPayout: inf.nextPayout, paymentStatus: inf.paymentStatus,
    history, bankInfo: inf.bankInfo,
  });
}

export function updateStatus(req, res) {
  const inf = influencers.find((i) => i.id === req.params.id);
  if (!inf) return res.status(404).json({ message: 'Influencer not found' });
  const { status } = req.body;
  const allowed = Object.values(INFLUENCER_STATUSES);
  if (!allowed.includes(status)) return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
  inf.status = status;
  res.json(inf);
}
