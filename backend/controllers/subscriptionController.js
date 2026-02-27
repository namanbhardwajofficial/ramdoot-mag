import {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  ORG,
} from '../config/magazines.js';

let nextId = 4;
const subscriptions = [
  { id: 'sub_6213Qd63', planId: 'monthly', status: SUBSCRIPTION_STATUSES.ACTIVE, createdBy: 'Atharv Kelwadkar', createdAt: '2020-10-17T00:00:00Z', updatedAt: '2020-10-17T00:00:00Z' },
  { id: 'sub_6213Qd64', planId: 'monthly', status: SUBSCRIPTION_STATUSES.DEACTIVATED, createdBy: 'Atharv Kelwadkar', createdAt: '2020-10-17T00:00:00Z', updatedAt: '2020-10-17T00:00:00Z' },
  { id: 'sub_6213Qd65', planId: 'monthly', status: SUBSCRIPTION_STATUSES.DEACTIVATED, createdBy: 'Atharv Kelwadkar', createdAt: '2020-10-17T00:00:00Z', updatedAt: '2020-10-17T00:00:00Z' },
];

function enrichSubscription(sub) {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === sub.planId) ?? {};
  return { ...sub, price: plan.priceInPaise ? plan.priceInPaise / 100 : 0, currency: ORG.currency, type: plan.label ?? sub.planId };
}

export function getPlans(_req, res) { res.json(SUBSCRIPTION_PLANS); }

export function getStats(_req, res) {
  const active = subscriptions.filter((s) => s.status === SUBSCRIPTION_STATUSES.ACTIVE).length;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = subscriptions.filter((s) => new Date(s.createdAt) >= startOfMonth).length;
  const cancelledThisMonth = subscriptions.filter(
    (s) => (s.status === SUBSCRIPTION_STATUSES.CANCELLED || s.status === SUBSCRIPTION_STATUSES.DEACTIVATED) && new Date(s.updatedAt) >= startOfMonth,
  ).length;
  res.json({ activeSubscribers: active, newSubscriptions: newThisMonth, cancellations: cancelledThisMonth });
}

export function list(req, res) {
  const { status, search } = req.query;
  let result = subscriptions;
  if (status) result = result.filter((s) => s.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((s) => s.id.toLowerCase().includes(q) || s.createdBy.toLowerCase().includes(q));
  }
  res.json(result.map(enrichSubscription));
}

export function getById(req, res) {
  const sub = subscriptions.find((s) => s.id === req.params.id);
  if (!sub) return res.status(404).json({ message: 'Subscription not found' });
  res.json(enrichSubscription(sub));
}

export function create(req, res) {
  const { planId, createdBy } = req.body;
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) return res.status(400).json({ message: 'Invalid plan' });
  const now = new Date().toISOString();
  const sub = { id: `sub_${Date.now().toString(36)}${nextId++}`, planId, status: SUBSCRIPTION_STATUSES.ACTIVE, createdBy: createdBy || 'Unknown', createdAt: now, updatedAt: now };
  subscriptions.push(sub);
  res.status(201).json(enrichSubscription(sub));
}

export function updateStatus(req, res) {
  const sub = subscriptions.find((s) => s.id === req.params.id);
  if (!sub) return res.status(404).json({ message: 'Subscription not found' });
  const { status } = req.body;
  const allowed = Object.values(SUBSCRIPTION_STATUSES);
  if (!allowed.includes(status)) return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
  sub.status = status;
  sub.updatedAt = new Date().toISOString();
  res.json(enrichSubscription(sub));
}

export function remove(req, res) {
  const idx = subscriptions.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Subscription not found' });
  const [removed] = subscriptions.splice(idx, 1);
  res.json({ message: 'Deleted', id: removed.id });
}
