// ==========================================
// RAMDOOT Foundation - Frontend API client
// Thin wrapper around the NestJS backend.
//
// NOTE: the base path is `/api/v1` — `setGlobalPrefix('api')` plus URI
// versioning with `defaultVersion: '1'`. It used to be `/api/v1/v1` because the
// prefix itself was `api/v1`; backend commit a7934d3 dropped the duplicate.
// All successful responses are wrapped as `{ success, message, data }` and
// errors as `{ success: false, message, error: { code, details? } }`.
// ==========================================
import { API_ORIGIN, BACKEND_URL } from '@/config/constants';

export const API_BASE = `${API_ORIGIN}/api/v1`;

// Public promo-tracking link an influencer shares. Hitting it records a click
// (GET /track/:promoCode) — optional `medium` tags where it was shared.
// `track/:promoCode` is in the `exclude` list of setGlobalPrefix, so it skips the
// `api` prefix — but URI versioning STILL injects the version segment, so the
// live path is `/v1/track/:code` (verified 2026-08-10; `/track/:code` 404s).
// Same story for `/v1/health`.
export const trackingUrl = (promoCode, medium) =>
  `${BACKEND_URL}/v1/track/${promoCode}${medium ? `?medium=${encodeURIComponent(medium)}` : ''}`;

// Single-flight refresh: concurrent 401s share one in-flight refresh call.
// The backend ROTATES refresh tokens (it revokes the old one on each use), so
// parallel refreshes would invalidate each other — we must serialize them.
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshToken = getRefreshToken();
    refreshPromise = (
      refreshToken
        ? request('/auth/refresh', {
            method: 'POST',
            body: { refreshToken },
            token: null,
            _skipRefresh: true,
          })
        : Promise.reject(new Error('No refresh token'))
    )
      .then((data) => {
        // Persist BOTH new tokens — the refresh token is rotated server-side.
        saveAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Refresh failed / no refresh token: drop the session and bounce to login.
function handleSessionExpired() {
  clearAuth();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.assign('/login');
  }
}

async function request(path, { method = 'GET', body, token, _skipRefresh = false } = {}) {
  // Attach the stored access token automatically unless a caller overrides it.
  const authToken = token !== undefined ? token : getToken();
  // For file uploads pass the FormData through untouched and let the browser
  // set the multipart boundary — don't JSON-encode or force a Content-Type.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(`Cannot reach the server. Is the backend running at ${BACKEND_URL}?`);
  }

  // Access token likely expired: transparently refresh once, then retry.
  // Skip for auth endpoints (a 401 there is a real credential failure) and for
  // the retried request itself (_skipRefresh) to avoid an infinite loop.
  if (res.status === 401 && !_skipRefresh && !path.startsWith('/auth/') && getRefreshToken()) {
    try {
      const newToken = await refreshAccessToken();
      return await request(path, { method, body, token: newToken, _skipRefresh: true });
    } catch {
      handleSessionExpired();
      throw new Error('Your session has expired. Please sign in again.');
    }
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* response had no JSON body */
  }

  if (!res.ok || (json && json.success === false)) {
    const details = json?.error?.details;
    const message =
      Array.isArray(details) && details.length
        ? details.join('; ')
        : json?.message || `Request failed (${res.status})`;
    // Carry the HTTP status on the error. Callers that must tell one failure
    // from another need it: GET /magazines/:id/read answers 403 when the plan
    // does not cover the magazine and 400 when no PDF has been uploaded, and
    // those two want completely different UI. Matching on message text would
    // break the moment the backend rewords a string.
    const err = new Error(message);
    err.status = res.status;
    err.code = json?.error?.code;
    throw err;
  }

  // Unwrap the standard { success, message, data } envelope.
  return json && typeof json === 'object' && 'data' in json ? json.data : json;
}

// ---- Auth endpoints ----
export const authApi = {
  // `totpToken` is the 6-digit code from the authenticator app. It is only sent
  // when we have one: accounts without 2FA sign in on the first call, and the
  // backend answers a 2FA account with `401 "2FA token required"`, which the
  // login form turns into a second step. Omitting the key entirely (rather than
  // sending an empty string) keeps the DTO's optional validation happy.
  login: ({ email, password, rememberMe = false, totpToken } = {}) =>
    request('/auth/login', {
      method: 'POST',
      body: { email, password, rememberMe, ...(totpToken ? { totpToken } : {}) },
    }),

  signupStep1: ({ email, fullName, phone, countryCode }) =>
    request('/auth/signup/step1', {
      method: 'POST',
      body: { email, fullName, phone, countryCode },
    }),

  signupStep2: ({ email, otp, password }) =>
    request('/auth/signup/step2', { method: 'POST', body: { email, otp, password } }),

  // Password reset (OTP based). forgotPassword returns the OTP in dev.
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: ({ email, otp, newPassword }) =>
    request('/auth/reset-password', { method: 'POST', body: { email, otp, newPassword } }),

  // `POST /auth/verify-email` exists but nothing calls it: signup step 2 already
  // verifies the address while setting the password, so there is no flow left
  // that needs to verify one on its own. Removed rather than kept as an unused
  // export — add it back if a "resend / confirm email" flow ever lands.

  // Authenticated password change. Backend requires the new password to be
  // >=8 chars with upper + lower + a digit, and rejects a wrong currentPassword
  // with 400 "Current password is incorrect".
  changePassword: ({ currentPassword, newPassword }) =>
    request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),

  // ---- Two-factor auth ----
  // generate2fa returns { secret, uri }; render `uri` as a QR code, then pass
  // the code from the authenticator app to enable2fa.
  generate2fa: () => request('/auth/2fa/generate', { method: 'POST' }),
  enable2fa: (token) => request('/auth/2fa/enable', { method: 'POST', body: { token } }),
  disable2fa: () => request('/auth/2fa/disable', { method: 'POST' }),
};

// Does this login failure mean "we need the authenticator code"? The backend
// answers a 2FA-enabled account with 401 "2FA token required", and a wrong code
// with "Invalid 2FA token" — both should keep the user on the code step rather
// than bouncing them back to the password form.
export function isTwoFactorError(message) {
  return /2fa|two[- ]?factor|totp|authenticat(?:or|ion code)/i.test(String(message || ''));
}

// ---- Magazines ----
export const magazinesApi = {
  // GET /magazines is public; returns the inner { data, meta } page object.
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ''),
    ).toString();
    return request(`/magazines${query ? `?${query}` : ''}`);
  },
  get: (id) => request(`/magazines/${id}`),
  create: (body) => request('/magazines', { method: 'POST', body }),
  update: (id, body) => request(`/magazines/${id}`, { method: 'PATCH', body }),
  publish: (id, body = {}) => request(`/magazines/${id}/publish`, { method: 'POST', body }),
  // Multipart upload of a cover image and/or PDF for an existing magazine.
  // The id goes in the path — POSTing to /magazines/upload with the id in the
  // body 404s, which is why publishing with a PDF used to fail silently and
  // every magazine ended up with no file attached.
  upload: (magazineId, files) => {
    const fd = new FormData();
    (Array.isArray(files) ? files : [files]).filter(Boolean).forEach((f) => fd.append('files', f));
    return request(`/magazines/${magazineId}/upload`, { method: 'POST', body: fd });
  },
  // Resolves the PDF URL for the reader and increments readsCount server-side.
  // 400s with "This magazine has no PDF uploaded yet" when there is no file.
  read: (id) => request(`/magazines/${id}/read`),
  // { magazineId, title, status, publishedAt, viewsCount, readsCount,
  //   engagementRate: "0%", revenue }
  performance: (id) => request(`/magazines/${id}/performance`),
  // { magazineId, title, price: "59.00" (string), totalRevenue, totalSales,
  //   revenueByDay: [] }
  financials: (id) => request(`/magazines/${id}/financials`),
  // `GET /magazines/:id/versions` is not wired. It exists, but ships as a stub —
  // `{ versions: [], note: "Version history tracking is not yet implemented." }`
  // — so a Versions tab in MagazineDetailsDrawer could only ever render that
  // note. Add the method and the tab together when the endpoint returns rows.
};

// Neutral cover used when a magazine has no uploaded image (e.g. seeded data).
export const MAGAZINE_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">' +
      '<rect width="100%" height="100%" fill="#0e1320"/>' +
      '<text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="34" ' +
      'text-anchor="middle" dominant-baseline="middle">RAMDOOT Magazine</text></svg>',
  );

// Map a backend magazine entity to the flat shape the <Card> grid expects.
export function toMagazineCard(m) {
  const cover = m.coverImageUrl
    ? m.coverImageUrl.startsWith('http')
      ? m.coverImageUrl
      : `${API_ORIGIN}${m.coverImageUrl}`
    : MAGAZINE_PLACEHOLDER;
  return {
    id: m.id,
    title: m.title,
    description: m.shortDescription || m.description || '',
    image: cover,
    price: Number(m.price ?? 0),
    status: m.status,
  };
}

// ---- Query-string + normalization helpers ----
function qs(params = {}) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  const s = new URLSearchParams(entries).toString();
  return s ? `?${s}` : '';
}

// Backend enums are UPPERCASE (e.g. ACTIVE); the UI uses lowercase keys.
export function lc(v) {
  return v == null ? v : String(v).toLowerCase();
}

// List endpoints return { data, meta }; tolerate either that or a bare array.
export function listOf(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

// Pagination block that rides along with a list response:
// { page, limit, total, totalPages, hasNextPage, hasPreviousPage }.
// A bare array has no pagination, so callers get a single-page shape and their
// pager collapses to one page instead of inventing a page count.
export function metaOf(res, fallbackLimit = 10) {
  const m = (res && !Array.isArray(res) && res.meta) || {};
  const total = Number(m.total ?? listOf(res).length);
  const limit = Number(m.limit ?? fallbackLimit) || fallbackLimit;
  return {
    page: Number(m.page ?? 1),
    limit,
    total,
    totalPages: Number(m.totalPages ?? Math.max(1, Math.ceil(total / limit))),
    hasNextPage: Boolean(m.hasNextPage),
    hasPreviousPage: Boolean(m.hasPreviousPage),
  };
}

// ---- Users (admin) ----
export const usersApi = {
  list: (params = {}) => request(`/users${qs(params)}`),
  get: (id) => request(`/users/${id}`),
  create: (body) => request('/users', { method: 'POST', body }),
  setStatus: (id, status) =>
    request(`/users/${id}/status`, { method: 'PATCH', body: { status } }),
  me: () => request('/users/me'),
  updateMe: (body) => request('/users/me', { method: 'PATCH', body }),

  // ---- Current user's device sessions ----
  // Returns active DeviceSession rows: { id, deviceName, deviceType, ipAddress,
  // userAgent, lastActiveAt, createdAt }, newest activity first.
  devices: () => request('/users/me/devices'),
  revokeDevice: (id) => request(`/users/me/devices/${id}`, { method: 'DELETE' }),

  // Avatar upload — multipart, single file under the field name `avatar`.
  // Backend caps it at 2MB and responds with the updated user.
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return request('/users/me/avatar', { method: 'POST', body: fd });
  },
};

// ---- Subscriptions / plans ----
export const subscriptionsApi = {
  plans: (params = {}) => request(`/subscription-plans${qs(params)}`),
  plan: (id) => request(`/subscription-plans/${id}`),
  createPlan: (body) => request('/subscription-plans', { method: 'POST', body }),
  updatePlan: (id, body) => request(`/subscription-plans/${id}`, { method: 'PATCH', body }),
  togglePlan: (id) => request(`/subscription-plans/${id}/toggle`, { method: 'PATCH' }),
  mine: () => request('/user-subscriptions/me'),
  purchase: (body) => request('/subscriptions/purchase', { method: 'POST', body }),
};

// ---- Campaigns ----
export const campaignsApi = {
  list: (params = {}) => request(`/campaigns${qs(params)}`),
  get: (id) => request(`/campaigns/${id}`),
  overview: (id) => request(`/campaigns/${id}/overview`),
  // { campaignId, commissionRate, totalRevenue, totalCommission,
  //   totalConversions, averageOrderValue, revenueByDay: [] }
  financials: (id) => request(`/campaigns/${id}/financials`),
  create: (body) => request('/campaigns', { method: 'POST', body }),
};

// ---- Earnings / payouts ----
export const earningsApi = {
  overview: () => request('/earnings'),
  payouts: () => request('/earnings/payouts'),
  bankAccounts: () => request('/bank-accounts'),
  addBankAccount: (body) => request('/bank-accounts', { method: 'POST', body }),
  withdraw: (body) => request('/earnings/withdraw', { method: 'POST', body }),
};

// ---- Payments ----
export const paymentsApi = {
  mine: () => request('/payments/me'),
  // Single payment by id, for confirming a checkout result. NOTE: `amount`
  // comes back as a STRING here ("1299.00") where /admin/payments returns a
  // number — coerce with Number() at the call site.
  get: (id) => request(`/payments/${id}`),
  // `POST /payments` has had no caller since checkout moved to
  // `create-order` + the Razorpay webhook, which writes the row server-side.
  // Recording a payment from the client would let anyone POST themselves a
  // successful one, so it is deliberately not wired.

  // Opens a Razorpay order and stores a PENDING payment row server-side.
  // `amount` is in RUPEES (the backend converts to paise); the returned
  // `amount` is in PAISE and feeds straight into the Razorpay checkout config.
  // Returns { orderId, amount, currency, keyId }.
  createOrder: ({ amount, relatedType, relatedId, description } = {}) =>
    request('/payments/create-order', {
      method: 'POST',
      body: { amount, relatedType, relatedId, description },
    }),
};

// ---- Admin / analytics ----
export const adminApi = {
  dashboard: () => request('/admin/dashboard'),
  auditLogs: (params = {}) => request(`/admin/audit-logs${qs(params)}`),
  influencers: () => request('/admin/influencers'),
  analytics: () => request('/admin/analytics/dashboard'),
  // { granularity, days, data: [{ period, revenue, transactions }] }.
  // Only periods that had payments come back — see fillSeries() for why that
  // matters before charting it.
  revenueSeries: ({ granularity = 'day', days = 30 } = {}) =>
    request(`/admin/analytics/revenue${qs({ granularity, days })}`),

  // Platform-wide, unlike /payments/me and /earnings/payouts which are both
  // caller-scoped and return the *admin's own* rows.
  // { data: [{ id, amount, status, paymentMethod, relatedType, description,
  //            createdAt, user: { id, fullName, email } }], meta }
  payments: (params = {}) => request(`/admin/payments${qs(params)}`),
  // { data: [{ id, amount, status, transactionId, notes, processedAt,
  //            createdAt, user: {...} }], meta }
  payouts: (params = {}) => request(`/admin/payouts${qs(params)}`),
  // { subscriptions, singleSales, payoutsPaid, netRevenue }
  revenueBreakdown: (params = {}) =>
    request(`/admin/analytics/revenue-breakdown${qs(params)}`),
  // { totalClicks, totalConversions, conversionRate: "20.00%",
  //   totalCommissionEarned, activeCampaigns, clicksByMedium: [{medium,count}],
  //   topCampaigns: [{ id, name, promoCode, status, clicks, conversions }] }
  influencerAudience: (id) => request(`/influencers/${id}/audience`),
  influencerPayments: (id, params = {}) =>
    request(`/admin/influencers/${id}/payments${qs(params)}`),
};

// ---- Notifications ----
export const notificationsApi = {
  list: () => request('/notifications'),
  unreadCount: () => request('/notifications/unread-count'),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
};

// ---- Auth session helpers ----
export function saveAuth({ accessToken, refreshToken, user } = {}) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (user) localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function getToken() {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

// Map the backend role enum (ADMIN | INFLUENCER | USER) to a frontend route.
export function routeForRole(role) {
  switch (String(role || '').toUpperCase()) {
    case 'ADMIN':
      return '/admin';
    case 'INFLUENCER':
      return '/influencer';
    default:
      return '/user';
  }
}
