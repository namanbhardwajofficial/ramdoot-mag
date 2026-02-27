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

const INFLUENCER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  INACTIVE: 'inactive',
};

const CAMPAIGN_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

const PLATFORMS = ['Instagram', 'Facebook', "What's app"];

const INFLUENCERS = [
  { id: 'inf_81t4109', name: 'Influencer Name 1', realName: 'Prakjta Kholi', email: 'atharv@squidcrew.com', phone: '+91 9136840260', status: INFLUENCER_STATUSES.ACTIVE, activeCampaigns: 2, platforms: ['Instagram', 'Facebook'], totalEarning: 33294, roi: '80%', joinedOn: '2024-09-12T00:00:00Z', paymentModel: 'Revenue Share', commission: '20%', totalEarned: 124000, totalPaid: 96000, pendingAmount: 29000, nextPayout: 30, paymentStatus: 'pending', bankInfo: { holderName: 'Prakjta vishal Kholi', bankName: 'HDFC Bank', accountNumber: '**** 4321', ifsc: 'HDFC0001245', location: 'Vasai, Mumbai' } },
  { id: 'inf_81t4110', name: 'Influencer Name 2', realName: 'Aman Sharma', email: 'aman@squidcrew.com', phone: '+91 9136840261', status: INFLUENCER_STATUSES.ACTIVE, activeCampaigns: 1, platforms: ['Instagram', "What's app"], totalEarning: 10900, roi: '102%', joinedOn: '2024-08-15T00:00:00Z', paymentModel: 'Revenue Share', commission: '15%', totalEarned: 58000, totalPaid: 42000, pendingAmount: 16000, nextPayout: 15, paymentStatus: 'active', bankInfo: { holderName: 'Aman Sharma', bankName: 'ICICI Bank', accountNumber: '**** 5678', ifsc: 'ICIC0001234', location: 'Andheri, Mumbai' } },
  { id: 'inf_81t4111', name: 'Influencer Name 3', realName: 'Neha Patel', email: 'neha@squidcrew.com', phone: '+91 9136840262', status: INFLUENCER_STATUSES.ACTIVE, activeCampaigns: 10, platforms: ['Facebook', "What's app"], totalEarning: 42000, roi: '890%', joinedOn: '2024-07-01T00:00:00Z', paymentModel: 'Revenue Share', commission: '20%', totalEarned: 200000, totalPaid: 158000, pendingAmount: 42000, nextPayout: 7, paymentStatus: 'pending', bankInfo: { holderName: 'Neha Patel', bankName: 'SBI', accountNumber: '**** 9012', ifsc: 'SBIN0001234', location: 'Thane, Mumbai' } },
  { id: 'inf_81t4112', name: 'Influencer Name 4', realName: 'Ravi Kumar', email: 'ravi@squidcrew.com', phone: '+91 9136840263', status: INFLUENCER_STATUSES.ACTIVE, activeCampaigns: 0, platforms: ['Instagram'], totalEarning: 0, roi: '0%', joinedOn: '2024-11-01T00:00:00Z', paymentModel: 'Revenue Share', commission: '10%', totalEarned: 0, totalPaid: 0, pendingAmount: 0, nextPayout: 0, paymentStatus: 'active', bankInfo: { holderName: 'Ravi Kumar', bankName: 'Axis Bank', accountNumber: '**** 3456', ifsc: 'UTIB0001234', location: 'Pune' } },
  { id: 'inf_81t4113', name: 'Influencer Name 5', realName: 'Sneha Joshi', email: 'sneha@squidcrew.com', phone: '+91 9136840264', status: INFLUENCER_STATUSES.ACTIVE, activeCampaigns: 3, platforms: ["What's app"], totalEarning: 43000, roi: '200%', joinedOn: '2024-06-10T00:00:00Z', paymentModel: 'Revenue Share', commission: '20%', totalEarned: 86000, totalPaid: 63000, pendingAmount: 23000, nextPayout: 20, paymentStatus: 'pending', bankInfo: { holderName: 'Sneha Joshi', bankName: 'Kotak Bank', accountNumber: '**** 7890', ifsc: 'KKBK0001234', location: 'Bandra, Mumbai' } },
];

const CAMPAIGNS = [
  { id: 'camp_27087210', name: 'Campaign Name 1', influencerId: 'inf_81t4109', influencerName: 'Influencer 1', startingDate: '2025-01-22T00:00:00Z', endDate: '2025-09-30T00:00:00Z', totalClicks: 2128, clickConversion: 200, conversions: '20%', status: CAMPAIGN_STATUSES.ACTIVE, commissionEarned: 12000, totalRevenue: 12000, platforms: ['Instagram', 'Facebook', "What's app"], createdBy: 'Admin', email: 'atharv@squidcrew.com' },
  { id: 'camp_27087211', name: 'Campaign Name 2', influencerId: 'inf_81t4109', influencerName: 'Influencer 1', startingDate: '2025-01-20T00:00:00Z', endDate: '2025-08-31T00:00:00Z', totalClicks: 382, clickConversion: 102, conversions: '10%', status: CAMPAIGN_STATUSES.SUSPENDED, commissionEarned: 1400, totalRevenue: 1400, platforms: ['Instagram'], createdBy: 'Admin', email: 'atharv@squidcrew.com' },
  { id: 'camp_27087212', name: 'Campaign Name 3', influencerId: 'inf_81t4111', influencerName: 'Influencer 1', startingDate: '2025-01-24T00:00:00Z', endDate: '2025-07-31T00:00:00Z', totalClicks: 1021, clickConversion: 783, conversions: '15%', status: CAMPAIGN_STATUSES.PAUSED, commissionEarned: 9280, totalRevenue: 9280, platforms: ['Facebook'], createdBy: 'Admin', email: 'neha@squidcrew.com' },
  { id: 'camp_27087213', name: 'Campaign Name 4', influencerId: 'inf_81t4113', influencerName: 'Influencer 1', startingDate: '2025-01-26T00:00:00Z', endDate: '2025-06-30T00:00:00Z', totalClicks: 122, clickConversion: 19, conversions: '5%', status: CAMPAIGN_STATUSES.COMPLETED, commissionEarned: 1000, totalRevenue: 1000, platforms: ["What's app"], createdBy: 'Admin', email: 'sneha@squidcrew.com' },
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
  INFLUENCER_STATUSES,
  CAMPAIGN_STATUSES,
  PLATFORMS,
  INFLUENCERS,
  CAMPAIGNS,
  TAX_RATE,
  MAGAZINES,
  MONTHLY_REVENUE,
};
