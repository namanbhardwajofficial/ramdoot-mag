import { USER_STATUSES, USERS } from '../config/magazines.js';

const users = [...USERS];
let nextId = users.length + 1;

export function getStats(_req, res) {
  const total = 1298517;
  const active = 122182;
  const paid = 648991;
  const churned = 22182;
  const inactive = 2182;
  res.json({ totalUsers: total, activeUsers: active, paidUsers: paid, churnedUsers: churned, inactiveUsers: inactive, paidChange: '+52 to last month' });
}

export function list(req, res) {
  const { status, search, sort } = req.query;
  let result = users;
  if (status) result = result.filter((u) => u.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((u) => u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  if (sort === 'spent-desc') result = [...result].sort((a, b) => b.totalSpent - a.totalSpent);
  if (sort === 'spent-asc') result = [...result].sort((a, b) => a.totalSpent - b.totalSpent);
  if (sort === 'joined-desc') result = [...result].sort((a, b) => new Date(b.joinedOn) - new Date(a.joinedOn));
  if (sort === 'joined-asc') result = [...result].sort((a, b) => new Date(a.joinedOn) - new Date(b.joinedOn));
  res.json(result);
}

export function getById(req, res) {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
}

export function create(req, res) {
  const { name, email, phone, role, subscription, subscriptionPlan } = req.body;
  const now = new Date().toISOString();
  const user = {
    id: `user_${Date.now().toString(36)}${nextId++}`,
    name: name || 'New User',
    email: email || '',
    phone: phone || '',
    role: role || 'User',
    status: USER_STATUSES.ACTIVE,
    subscription: subscription || 'Free',
    subscriptionPlan: subscriptionPlan || 'N/A',
    lastPaid: 'N/A',
    totalSpent: 0,
    lastActive: 'Just now',
    joinedOn: now,
  };
  users.push(user);
  res.status(201).json(user);
}

export function updateStatus(req, res) {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { status } = req.body;
  const allowed = Object.values(USER_STATUSES);
  if (!allowed.includes(status)) return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
  user.status = status;
  res.json(user);
}

export function update(req, res) {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const updatable = ['name', 'email', 'phone', 'role', 'subscription', 'subscriptionPlan'];
  for (const key of updatable) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  res.json(user);
}

export function remove(req, res) {
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  const [removed] = users.splice(idx, 1);
  res.json({ message: 'Deleted', id: removed.id });
}
