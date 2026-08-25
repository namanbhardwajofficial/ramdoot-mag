// Absolute, publicly reachable backend origin. Use this only for links that
// leave the app (e.g. the promo link an influencer copies and shares) — those
// must resolve from anywhere, not just from a browser on the dev server.
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Origin the app itself fetches from. In dev this is empty so requests go out
// as same-origin relative paths (/api/v1/...) and Vite proxies them to
// BACKEND_URL server-side — the deployed backend's CORS allowlist has no
// localhost entry, so a direct call from the browser would be blocked.
// See the `proxy` block in vite.config.js.
export const API_ORIGIN = import.meta.env.DEV ? '' : BACKEND_URL;

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const ORG = {
  name: 'Ramdoot Foundation',
  currency: 'INR',
  currencySymbol: '\u20B9',
  theme: '#1e293b',
  site: 'https://ramdootrestores.in',
};

// Where the donation CTAs on the landing page point.
export const DONATE_URL = ORG.site;

/**
 * Single destination behind every "Connect Support" / "Connect Us" /
 * "Get in Touch" control. There were eleven of them across the app and not one
 * had a handler, so they all looked clickable and did nothing.
 *
 * Set `VITE_SUPPORT_EMAIL` to route them at a mailbox; without it they open the
 * foundation's public site, which is a real destination rather than a guessed
 * address that would bounce.
 */
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || '';
export const SUPPORT = {
  email: SUPPORT_EMAIL,
  href: SUPPORT_EMAIL ? `mailto:${SUPPORT_EMAIL}` : ORG.site,
  // A mailto: hands off to the mail client; a website should open in a new tab
  // so the user does not lose whatever they were part-way through.
  external: !SUPPORT_EMAIL,
};

// Social profiles for the landing footer. An empty string hides that icon \u2014
// better than an `href="#"` that scrolls to the top and looks broken.
export const SOCIAL_LINKS = {
  facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || '',
  instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM || '',
  twitter: import.meta.env.VITE_SOCIAL_TWITTER || '',
  youtube: import.meta.env.VITE_SOCIAL_YOUTUBE || '',
  linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN || '',
};

// --- Navigation ---
export const ADMIN_NAV = {
  main: [
    { key: "home", label: "Home" },
    { key: "users", label: "Users" },
    { key: "magazines", label: "Magazine" },
    { key: "subscriptions", label: "Subscriptions" },
    { key: "influencer-campaigns", label: "Influencers Campaigns" },
    { key: "publications", label: "Publications" },
    { key: "payments", label: "Payments" },
  ],

  footer: [
    { key: "settings", label: "Settings" },
    { key: "help", label: "Help" },
  ],
};
export const User_NAV = {
  main: [
    { key: "home", label: "Home" },
    { key: "users", label: "Users" },
    { key: "subscriptions", label: "Subscriptions" },
    { key: "influencer-campaigns", label: "Influencers Campaigns" },
    { key: "publications", label: "Publications" },
    { key: "payments", label: "Payments" },
    {key: "security",label:"Security"}
  ],

  footer: [
    { key: "settings", label: "Settings" },
    { key: "help", label: "Help" },
  ],
};
export const INFLUENCER_NAV = {
  main: [
    { key: "home", label: "Dashboard" },
    { key: "earnings", label: "Earnings" },
    { key: "campaigns", label: "Campaigns" },
  ],

  footer: [
    { key: "settings", label: "Settings" },
    { key: "help", label: "Help" },
  ],
};

export const USER_NAV = {
  main: [
    { key: "home", label: "Home" },
    { key: "magazines", label: "Magazine" },
    { key: "subscriptions", label: "Subscriptions" },
  ],

  footer: [
    { key: "settings", label: "Settings" },
    { key: "help", label: "Help" },
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
// DRAFT was missing here, so the Filters dropdown on the Publications page
// could not select it — even though it is the status most magazines are
// actually in (`GET /magazines` returns DRAFT, SCHEDULED and LIVE today).
export const PUBLICATION_STATUSES = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
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

// --- Influencer Campaigns ---
export const INFLUENCER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLOCKED: 'blocked',
  INACTIVE: 'inactive',
};

export const CAMPAIGN_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

export const PLATFORM_COLORS = {
  Instagram:    { bg: 'bg-gradient-to-r from-pink-500 to-orange-400', text: 'text-white' },
  Facebook:     { bg: 'bg-blue-500', text: 'text-white' },
  "What's app": { bg: 'bg-emerald-500', text: 'text-white' },
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
  completed:   { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending:     { bg: 'bg-yellow-50',   text: 'text-yellow-700',  dot: 'bg-yellow-500'  },
  initiated:   { bg: 'bg-yellow-50',   text: 'text-yellow-700',  dot: 'bg-yellow-500'  },
  paid:        { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pause:       { bg: 'bg-orange-50',   text: 'text-orange-700',  dot: 'bg-orange-500'  },
};
