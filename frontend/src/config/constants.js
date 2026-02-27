export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const ORG = {
  name: 'Ramdoot Foundation',
  currency: 'INR',
  currencySymbol: '\u20B9',
  theme: '#1e293b',
};

// --- Navigation ---
export const NAV_ITEMS = {
  main: [
    { key: 'home',                 label: 'Home' },
    { key: 'users',                label: 'Users' },
    { key: 'subscriptions',        label: 'Subscriptions' },
    { key: 'influencer-campaigns', label: 'Influencers Campaigns' },
    { key: 'publications',         label: 'Publications' },
    { key: 'payments',             label: 'Payments' },
    { key: 'security',             label: 'Security' },
  ],
  footer: [
    { key: 'settings', label: 'Settings' },
    { key: 'help',     label: 'Help' },
  ],
};

// --- Subscription ---
export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  DEACTIVATED: 'deactivated',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const SUBSCRIPTION_TYPES = {
  monthly:   'Monthly',
  quarterly: 'Quarterly',
  yearly:    'Yearly',
};

// --- Payments ---
export const PAYMENT_STATUSES = {
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUND: 'refund',
  PROCESSING: 'processing',
};

export const PAYOUT_STATUSES = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PROCESSING: 'processing',
};

// --- Publications ---
export const PUBLICATION_STATUSES = {
  LIVE: 'live',
  ARCHIVED: 'archived',
  PAUSED: 'paused',
  SCHEDULED: 'scheduled',
};

export const PRICING_PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

// --- Users ---
export const USER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  INACTIVE: 'inactive',
};

// --- Shared status colors (used across all modules) ---
export const STATUS_COLORS = {
  active:      { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  success:     { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  deactivated: { bg: 'bg-orange-50',   text: 'text-orange-700',  dot: 'bg-orange-500'  },
  processing:  { bg: 'bg-yellow-50',   text: 'text-yellow-700',  dot: 'bg-yellow-500'  },
  cancelled:   { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500'     },
  failed:      { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500'     },
  refund:      { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400'   },
  expired:     { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400'   },
  live:        { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  archived:    { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500'     },
  paused:      { bg: 'bg-orange-50',   text: 'text-orange-700',  dot: 'bg-orange-500'  },
  scheduled:   { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-500'   },
  suspended:   { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500'     },
  blocked:     { bg: 'bg-orange-50',   text: 'text-orange-700',  dot: 'bg-orange-500'  },
  inactive:    { bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-500'   },
};
