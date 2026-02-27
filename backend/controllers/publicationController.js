import {
  PUBLICATION_STATUSES,
  PUBLICATIONS,
  WEEKLY_CHART,
} from '../config/magazines.js';

const publications = [...PUBLICATIONS];
let nextId = publications.length + 1;

const versions = {};
for (const pub of publications) {
  versions[pub.id] = [
    { version: '1.1', status: 'live', author: 'Admin', date: '22 Jan at 10:40am' },
    { version: '0.1', status: null, author: 'Admin', date: '22 Jan at 10:40am' },
    { version: '0.2', status: null, author: 'Admin', date: '22 Jan at 10:40am' },
    { version: '0.5', status: null, author: 'Admin', date: '22 Jan at 10:40am' },
  ];
}

export function getStats(_req, res) {
  const totalReaders = publications.reduce((s, p) => s + p.subscribers, 0);
  const total = publications.length;
  const live = publications.filter((p) => p.status === PUBLICATION_STATUSES.LIVE).length;
  const drafts = publications.filter(
    (p) => p.status === PUBLICATION_STATUSES.PAUSED || p.status === PUBLICATION_STATUSES.SCHEDULED,
  ).length;
  res.json({ totalReaders, totalPublications: total, liveCount: live, draftCount: drafts });
}

export function getWeeklyChart(_req, res) {
  res.json(WEEKLY_CHART);
}

export function list(req, res) {
  const { status, search } = req.query;
  let result = publications;
  if (status) result = result.filter((p) => p.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (p) => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
    );
  }
  res.json(result);
}

export function getById(req, res) {
  const pub = publications.find((p) => p.id === req.params.id);
  if (!pub) return res.status(404).json({ message: 'Publication not found' });
  res.json(pub);
}

export function getPerformance(req, res) {
  const pub = publications.find((p) => p.id === req.params.id);
  if (!pub) return res.status(404).json({ message: 'Publication not found' });
  res.json({ chart: WEEKLY_CHART, avgTimePerUser: pub.avgTimePerUser });
}

export function getFinancials(req, res) {
  const pub = publications.find((p) => p.id === req.params.id);
  if (!pub) return res.status(404).json({ message: 'Publication not found' });
  res.json({
    ...pub.financials,
    revenueChart: WEEKLY_CHART.revenue,
    labels: WEEKLY_CHART.labels,
  });
}

export function getVersions(req, res) {
  const v = versions[req.params.id];
  if (!v) return res.status(404).json({ message: 'Publication not found' });
  res.json(v);
}

export function create(req, res) {
  const { title, description, pricingPlan, price, startDate, endDate } = req.body;
  const now = new Date().toISOString();
  const pub = {
    id: `pub_${Date.now().toString(36)}${nextId++}`,
    title: title || 'Untitled Magazine',
    magazineRef: `#${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    description: description || '',
    status: PUBLICATION_STATUSES.LIVE,
    publishedOn: now,
    subscribers: 0,
    reads: 0,
    revenue: 0,
    createdBy: 'Admin',
    startDate: startDate || now.slice(0, 10),
    endDate: endDate || now.slice(0, 10),
    coverImage: '',
    pricingPlan: pricingPlan || 'free',
    price: price || 0,
    shareLink: `https://ramdoot.com/${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
    financials: { totalRevenue: 0, totalClicks: 0, influencerCommission: 0, influencerSubscribers: 0 },
    avgTimePerUser: '0sec',
  };
  publications.push(pub);
  versions[pub.id] = [{ version: '1.0', status: 'live', author: 'Admin', date: new Date().toLocaleString() }];
  res.status(201).json(pub);
}

export function update(req, res) {
  const pub = publications.find((p) => p.id === req.params.id);
  if (!pub) return res.status(404).json({ message: 'Publication not found' });

  const updatable = ['title', 'description', 'pricingPlan', 'price', 'startDate', 'endDate'];
  for (const key of updatable) {
    if (req.body[key] !== undefined) pub[key] = req.body[key];
  }

  if (req.body.saveVersion) {
    const v = versions[pub.id] || [];
    const next = v.length ? `${(parseFloat(v[0].version) + 0.1).toFixed(1)}` : '1.0';
    v.unshift({ version: next, status: 'live', author: 'Admin', date: new Date().toLocaleString() });
    versions[pub.id] = v;
  }

  res.json(pub);
}

export function updateStatus(req, res) {
  const pub = publications.find((p) => p.id === req.params.id);
  if (!pub) return res.status(404).json({ message: 'Publication not found' });

  const { status } = req.body;
  const allowed = Object.values(PUBLICATION_STATUSES);
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
  }
  pub.status = status;
  res.json(pub);
}

export function remove(req, res) {
  const idx = publications.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Publication not found' });
  const [removed] = publications.splice(idx, 1);
  delete versions[removed.id];
  res.json({ message: 'Deleted', id: removed.id });
}
