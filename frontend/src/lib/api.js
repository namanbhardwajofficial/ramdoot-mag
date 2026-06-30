// ==========================================
// RAMDOOT Foundation - Frontend API client
// Thin wrapper around the NestJS backend.
//
// NOTE: the backend uses BOTH a literal `api/v1` global prefix AND URI
// versioning (which inserts another `v1`), so the real base path is
// `/api/v1/v1`. All successful responses are wrapped as
// `{ success, message, data }` and errors as
// `{ success: false, message, error: { code, details? } }`.
// ==========================================
import { BACKEND_URL } from '@/config/constants';

export const API_BASE = `${BACKEND_URL}/api/v1/v1`;

async function request(path, { method = 'GET', body, token } = {}) {
  // Attach the stored access token automatically unless a caller overrides it.
  const authToken = token !== undefined ? token : getToken();
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(`Cannot reach the server. Is the backend running at ${BACKEND_URL}?`);
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
    throw new Error(message);
  }

  // Unwrap the standard { success, message, data } envelope.
  return json && typeof json === 'object' && 'data' in json ? json.data : json;
}

// ---- Auth endpoints ----
export const authApi = {
  login: (email, password, rememberMe = false) =>
    request('/auth/login', { method: 'POST', body: { email, password, rememberMe } }),

  signupStep1: ({ email, fullName, phone, countryCode }) =>
    request('/auth/signup/step1', {
      method: 'POST',
      body: { email, fullName, phone, countryCode },
    }),

  signupStep2: ({ email, otp, password }) =>
    request('/auth/signup/step2', { method: 'POST', body: { email, otp, password } }),
};

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
      : `${BACKEND_URL}${m.coverImageUrl}`
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

// ---- Users (admin) ----
export const usersApi = {
  list: (params = {}) => request(`/users${qs(params)}`),
  get: (id) => request(`/users/${id}`),
  create: (body) => request('/users', { method: 'POST', body }),
  setStatus: (id, status) =>
    request(`/users/${id}/status`, { method: 'PATCH', body: { status } }),
  me: () => request('/users/me'),
  updateMe: (body) => request('/users/me', { method: 'PATCH', body }),
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
  record: (body) => request('/payments', { method: 'POST', body }),
};

// ---- Admin / analytics ----
export const adminApi = {
  dashboard: () => request('/admin/dashboard'),
  auditLogs: (params = {}) => request(`/admin/audit-logs${qs(params)}`),
  influencers: () => request('/admin/influencers'),
  analytics: () => request('/admin/analytics/dashboard'),
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
