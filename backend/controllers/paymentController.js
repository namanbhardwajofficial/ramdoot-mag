import {
  PAYMENT_STATUSES,
  PAYOUT_STATUSES,
  TAX_RATE,
  MAGAZINES,
  MONTHLY_REVENUE,
  ORG,
} from '../config/magazines.js';

const payments = [
  { id: 'pay_6213Qd63', userId: 'user_6213Qd63', userName: 'Atharv Kelwadkar', magazineId: 2, amount: 49, status: PAYMENT_STATUSES.SUCCESS, createdAt: '2020-10-17T00:00:00Z' },
  { id: 'pay_6213Qd64', userId: 'user_6213Qd63', userName: 'Atharv Kelwadkar', magazineId: 2, amount: 49, status: PAYMENT_STATUSES.SUCCESS, createdAt: '2020-10-17T00:00:00Z' },
  { id: 'pay_6213Qd65', userId: 'user_6213Qd63', userName: 'Atharv Kelwadkar', magazineId: 2, amount: 49, status: PAYMENT_STATUSES.SUCCESS, createdAt: '2020-10-17T00:00:00Z' },
  { id: 'pay_6213Qd66', userId: 'user_6213Qd63', userName: 'Atharv Kelwadkar', magazineId: 2, amount: 49, status: PAYMENT_STATUSES.FAILED, createdAt: '2020-10-17T00:00:00Z' },
  { id: 'pay_6213Qd67', userId: 'user_6213Qd63', userName: 'Atharv Kelwadkar', magazineId: 2, amount: 49, status: PAYMENT_STATUSES.REFUND, createdAt: '2020-10-17T00:00:00Z' },
];

const influencerPayouts = [
  { id: 'pout_6213Qd63', influencerId: 'inf_6213Qd63', influencerName: 'Atharv Kelwadkar', amount: 18000, status: PAYOUT_STATUSES.SUCCESS, campaignLink: 'Magazine V2', createdAt: '2020-10-17T00:00:00Z' },
  { id: 'pout_6213Qd64', influencerId: 'inf_6213Qd63', influencerName: 'Atharv Kelwadkar', amount: 123000, status: PAYOUT_STATUSES.SUCCESS, campaignLink: 'Magazine V2', createdAt: '2020-10-17T00:00:00Z' },
  { id: 'pout_6213Qd65', influencerId: 'inf_6213Qd63', influencerName: 'Atharv Kelwadkar', amount: 1000, status: PAYOUT_STATUSES.SUCCESS, campaignLink: 'Magazine V2', createdAt: '2020-10-17T00:00:00Z' },
  { id: 'pout_6213Qd66', influencerId: 'inf_6213Qd63', influencerName: 'Atharv Kelwadkar', amount: 38051, status: PAYOUT_STATUSES.FAILED, campaignLink: 'Magazine V2', createdAt: '2020-10-17T00:00:00Z' },
  { id: 'pout_6213Qd67', influencerId: 'inf_6213Qd63', influencerName: 'Atharv Kelwadkar', amount: 11818, status: PAYOUT_STATUSES.PROCESSING, campaignLink: 'Magazine V2', createdAt: '2020-10-17T00:00:00Z' },
];

function enrichPayment(p) {
  const mag = MAGAZINES.find((m) => m.id === p.magazineId);
  const tax = Math.round(p.amount * TAX_RATE);
  return { ...p, magazineTitle: mag?.title ?? 'Magazine V2', tax, netAmount: p.amount + tax, currency: ORG.currency };
}

export function getStats(_req, res) {
  const totalRevenue = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0);
  const totalPayout = MONTHLY_REVENUE.reduce((s, m) => s + m.payout, 0);
  res.json({ totalRevenue, influencerPayouts: totalPayout, subscriptions: 360000, singleSales: 122000, netRevenue: totalRevenue - totalPayout });
}

export function getChart(_req, res) {
  res.json(MONTHLY_REVENUE);
}

export function listPayouts(req, res) {
  const { status, search } = req.query;
  let result = influencerPayouts;
  if (status) result = result.filter((p) => p.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((p) => p.id.toLowerCase().includes(q) || p.influencerName.toLowerCase().includes(q));
  }
  res.json(result);
}

export function getPayoutById(req, res) {
  const p = influencerPayouts.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Payout not found' });
  res.json(p);
}

export function list(req, res) {
  const { status, search } = req.query;
  let result = payments;
  if (status) result = result.filter((p) => p.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((p) => p.id.toLowerCase().includes(q) || p.userName.toLowerCase().includes(q));
  }
  res.json(result.map(enrichPayment));
}

export function getById(req, res) {
  const p = payments.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Payment not found' });
  res.json(enrichPayment(p));
}

export function retry(req, res) {
  const p = payments.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Payment not found' });
  if (p.status !== PAYMENT_STATUSES.FAILED) return res.status(400).json({ message: 'Only failed payments can be retried' });
  p.status = PAYMENT_STATUSES.SUCCESS;
  res.json(enrichPayment(p));
}

export function refund(req, res) {
  const p = payments.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: 'Payment not found' });
  if (p.status !== PAYMENT_STATUSES.SUCCESS) return res.status(400).json({ message: 'Only successful payments can be refunded' });
  p.status = PAYMENT_STATUSES.REFUND;
  res.json(enrichPayment(p));
}
