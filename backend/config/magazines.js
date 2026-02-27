const ORG = {
  name: 'Ramdoot Foundation',
  currency: 'INR',
  theme: '#1e293b',
};

const SUBSCRIPTION_PLANS = [
  { id: 'monthly',   label: 'Monthly',   priceInPaise: 4900,   durationDays: 30  },
  { id: 'quarterly', label: 'Quarterly', priceInPaise: 12900,  durationDays: 90  },
  { id: 'yearly',    label: 'Yearly',    priceInPaise: 44900,  durationDays: 365 },
];

const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  DEACTIVATED: 'deactivated',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

const PAYMENT_STATUSES = {
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUND: 'refund',
  PROCESSING: 'processing',
};

const PAYOUT_STATUSES = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PROCESSING: 'processing',
};

const PUBLICATION_STATUSES = {
  LIVE: 'live',
  ARCHIVED: 'archived',
  PAUSED: 'paused',
  SCHEDULED: 'scheduled',
};

const PRICING_PLANS = ['free', 'paid'];

const WEEKLY_CHART = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  subscriberGain: [200, 5000, 1000, 8000, 3000, 15000, 20000],
  views:          [100, 2000, 500,  3000, 1500, 5000,  8000],
  revenue:        [1000, 6200, 10200, 16000, 20000, 18000, 20000],
};

const PUBLICATIONS = [
  {
    id: 'pub_6213Qd63',
    title: 'Magazine 1',
    magazineRef: '#6213Qd63',
    description: '',
    status: PUBLICATION_STATUSES.LIVE,
    publishedOn: '2020-10-17T00:00:00Z',
    subscribers: 8327,
    reads: 102393,
    revenue: 78311,
    createdBy: 'Admin',
    startDate: '2025-09-20',
    endDate: '2025-09-30',
    coverImage: '',
    pricingPlan: 'paid',
    price: 49,
    shareLink: 'https://ramdoot.com/ARUNAFLUX',
    financials: { totalRevenue: 98321, totalClicks: 123213, influencerCommission: 18000, influencerSubscribers: 22127 },
    avgTimePerUser: '1min 30sec',
  },
  {
    id: 'pub_6213Qd64',
    title: 'Magazine 1',
    magazineRef: '#6213Qd63',
    description: '',
    status: PUBLICATION_STATUSES.ARCHIVED,
    publishedOn: '2020-10-22T00:00:00Z',
    subscribers: 10921,
    reads: 87218,
    revenue: 717391,
    createdBy: 'Admin',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    coverImage: '',
    pricingPlan: 'paid',
    price: 49,
    shareLink: 'https://ramdoot.com/BFLUX',
    financials: { totalRevenue: 717391, totalClicks: 87218, influencerCommission: 25000, influencerSubscribers: 10921 },
    avgTimePerUser: '2min 10sec',
  },
  {
    id: 'pub_6213Qd65',
    title: 'Magazine 1',
    magazineRef: '#6213Qd63',
    description: '',
    status: PUBLICATION_STATUSES.PAUSED,
    publishedOn: '2020-02-01T00:00:00Z',
    subscribers: 12893,
    reads: 112912,
    revenue: 2000,
    createdBy: 'Admin',
    startDate: '2025-07-01',
    endDate: '2025-07-31',
    coverImage: '',
    pricingPlan: 'free',
    price: 0,
    shareLink: 'https://ramdoot.com/CFLUX',
    financials: { totalRevenue: 2000, totalClicks: 112912, influencerCommission: 0, influencerSubscribers: 12893 },
    avgTimePerUser: '55sec',
  },
  {
    id: 'pub_6213Qd66',
    title: 'Magazine 1',
    magazineRef: '#6213Qd63',
    description: '',
    status: PUBLICATION_STATUSES.SCHEDULED,
    publishedOn: '2020-09-08T00:00:00Z',
    subscribers: 162631,
    reads: 917313,
    revenue: 2000,
    createdBy: 'Admin',
    startDate: '2025-10-01',
    endDate: '2025-10-31',
    coverImage: '',
    pricingPlan: 'paid',
    price: 49,
    shareLink: 'https://ramdoot.com/DFLUX',
    financials: { totalRevenue: 2000, totalClicks: 917313, influencerCommission: 500, influencerSubscribers: 162631 },
    avgTimePerUser: '3min 20sec',
  },
  {
    id: 'pub_6213Qd67',
    title: 'Magazine 1',
    magazineRef: '#6213Qd63',
    description: '',
    status: PUBLICATION_STATUSES.LIVE,
    publishedOn: '2020-05-24T00:00:00Z',
    subscribers: 21981,
    reads: 812784,
    revenue: 4000,
    createdBy: 'Admin',
    startDate: '2025-05-01',
    endDate: '2025-05-31',
    coverImage: '',
    pricingPlan: 'paid',
    price: 49,
    shareLink: 'https://ramdoot.com/EFLUX',
    financials: { totalRevenue: 4000, totalClicks: 812784, influencerCommission: 1200, influencerSubscribers: 21981 },
    avgTimePerUser: '1min 45sec',
  },
];

const USER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  INACTIVE: 'inactive',
};

const USERS = [
  { id: 'user_6213Qd63', name: 'Atharv Kelwadkar', email: 'atharv@ramdootfoundation.com', phone: '+91 9136840260', role: 'User', status: USER_STATUSES.ACTIVE, subscription: 'Paid', subscriptionPlan: 'Monthly @ \u20B949', lastPaid: '12 Sep 2025', totalSpent: 3294, lastActive: '2 days ago', joinedOn: '2020-10-17T00:00:00Z' },
  { id: 'user_6213Qd64', name: 'Atharv Kelwadkar', email: 'atharv@ramdootfoundation.com', phone: '+91 9136840260', role: 'User', status: USER_STATUSES.SUSPENDED, subscription: 'Paid', subscriptionPlan: 'Monthly @ \u20B949', lastPaid: '12 Sep 2025', totalSpent: 1000, lastActive: '12 days ago', joinedOn: '2020-10-22T00:00:00Z' },
  { id: 'user_6213Qd65', name: 'Atharv Kelwadkar', email: 'atharv@ramdootfoundation.com', phone: '+91 9136840260', role: 'User', status: USER_STATUSES.BLOCKED, subscription: 'Paid', subscriptionPlan: 'Monthly @ \u20B949', lastPaid: '12 Sep 2025', totalSpent: 2000, lastActive: '92 days ago', joinedOn: '2020-02-01T00:00:00Z' },
  { id: 'user_6213Qd66', name: 'Atharv Kelwadkar', email: 'atharv@ramdootfoundation.com', phone: '+91 9136840260', role: 'User', status: USER_STATUSES.ACTIVE, subscription: 'Paid', subscriptionPlan: 'Monthly @ \u20B949', lastPaid: '12 Sep 2025', totalSpent: 2000, lastActive: '1 days ago', joinedOn: '2020-09-08T00:00:00Z' },
  { id: 'user_6213Qd67', name: 'Atharv Kelwadkar', email: 'atharv@ramdootfoundation.com', phone: '+91 9136840260', role: 'User', status: USER_STATUSES.ACTIVE, subscription: 'Paid', subscriptionPlan: 'Monthly @ \u20B949', lastPaid: '12 Sep 2025', totalSpent: 4000, lastActive: '10 days ago', joinedOn: '2020-05-24T00:00:00Z' },
  { id: 'user_6213Qd68', name: 'Atharv Kelwadkar', email: 'atharv@ramdootfoundation.com', phone: '+91 9136840260', role: 'User', status: USER_STATUSES.ACTIVE, subscription: 'Paid', subscriptionPlan: 'Monthly @ \u20B949', lastPaid: '12 Sep 2025', totalSpent: 1000, lastActive: '12 days ago', joinedOn: '2020-05-24T00:00:00Z' },
  { id: 'user_6213Qd69', name: 'Atharv Kelwadkar', email: 'atharv@ramdootfoundation.com', phone: '+91 9136840260', role: 'User', status: USER_STATUSES.ACTIVE, subscription: 'Paid', subscriptionPlan: 'Monthly @ \u20B949', lastPaid: '12 Sep 2025', totalSpent: 37000, lastActive: '23 days ago', joinedOn: '2020-09-21T00:00:00Z' },
  { id: 'user_6213Qd70', name: 'Atharv Kelwadkar', email: 'atharv@ramdootfoundation.com', phone: '+91 9136840260', role: 'User', status: USER_STATUSES.ACTIVE, subscription: 'Paid', subscriptionPlan: 'Monthly @ \u20B949', lastPaid: '12 Sep 2025', totalSpent: 40000, lastActive: '24 days ago', joinedOn: '2020-09-08T00:00:00Z' },
  { id: 'user_6213Qd71', name: 'Atharv Kelwadkar', email: 'atharv@ramdootfoundation.com', phone: '+91 9136840260', role: 'User', status: USER_STATUSES.ACTIVE, subscription: 'Paid', subscriptionPlan: 'Monthly @ \u20B949', lastPaid: '12 Sep 2025', totalSpent: 40000, lastActive: '24 days ago', joinedOn: '2020-09-08T00:00:00Z' },
  { id: 'user_6213Qd72', name: 'Atharv Kelwadkar', email: 'atharv@ramdootfoundation.com', phone: '+91 9136840260', role: 'User', status: USER_STATUSES.ACTIVE, subscription: 'Paid', subscriptionPlan: 'Monthly @ \u20B949', lastPaid: '12 Sep 2025', totalSpent: 40000, lastActive: '24 days ago', joinedOn: '2020-09-08T00:00:00Z' },
  { id: 'user_6213Qd73', name: 'Atharv Kelwadkar', email: 'atharv@ramdootfoundation.com', phone: '+91 9136840260', role: 'User', status: USER_STATUSES.ACTIVE, subscription: 'Paid', subscriptionPlan: 'Monthly @ \u20B949', lastPaid: '12 Sep 2025', totalSpent: 40000, lastActive: '24 days ago', joinedOn: '2020-09-08T00:00:00Z' },
];

const TAX_RATE = 0.18;

const MAGAZINES = [
  {
    id: 1,
    title: 'Ramdoot August 2026 Edition',
    description:
      'Curated magazines delivering insights, trends, and inspiration across technology and design.',
    image: '',
    price: 5,
  },
  {
    id: 2,
    title: 'Ramdoot July 2026 Edition',
    description:
      'A collection of long-form essays and visual stories on modern product design.',
    image: '',
    price: 10,
  },
  {
    id: 3,
    title: 'Ramdoot June 2026 Edition',
    description:
      'Features on web performance, accessibility, and the future of front-end tooling.',
    image: '',
    price: 15,
  },
  {
    id: 4,
    title: 'Ramdoot May 2026 Edition',
    description:
      'Interviews with creators, makers, and engineers shipping delightful products.',
    image: '',
    price: 20,
  },
];

const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 18000, payout: 5000  },
  { month: 'Feb', revenue: 22000, payout: 7000  },
  { month: 'Mar', revenue: 19000, payout: 6500  },
  { month: 'Apr', revenue: 25000, payout: 8000  },
  { month: 'May', revenue: 28000, payout: 9000  },
  { month: 'Jun', revenue: 24000, payout: 10000 },
  { month: 'Jul', revenue: 30000, payout: 11000 },
  { month: 'Aug', revenue: 26000, payout: 9500  },
  { month: 'Sep', revenue: 32000, payout: 12000 },
  { month: 'Oct', revenue: 29000, payout: 10500 },
  { month: 'Nov', revenue: 35000, payout: 13000 },
  { month: 'Dec', revenue: 31000, payout: 11500 },
];

export {
  ORG,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  PAYMENT_STATUSES,
  PAYOUT_STATUSES,
  PUBLICATION_STATUSES,
  PRICING_PLANS,
  PUBLICATIONS,
  WEEKLY_CHART,
  USER_STATUSES,
  USERS,
  TAX_RATE,
  MAGAZINES,
  MONTHLY_REVENUE,
};
