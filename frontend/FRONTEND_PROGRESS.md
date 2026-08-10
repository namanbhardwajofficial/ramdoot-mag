# Frontend Integration Progress — RAMDOOT

**Date:** 2026-07-01
**Audience:** Backend team
**Repo:** `frontend` (Vite + React)

---

## Summary

All frontend screens that have a matching backend endpoint are now wired to the
live API — previously most ran on dummy/placeholder data. Remaining unwired
features are blocked only by missing backend endpoints (listed at the bottom).

- **API base path in use:** `/api/v1/v1/...` (global prefix `api/v1` + URI versioning adds a second `v1`)
- **Auth:** Bearer access token, with automatic silent refresh on `401`
- **Response envelope handled:** `{ success, message, data }` (unwrapped client-side)

---

## ✅ Features integrated (and endpoints consumed)

### Authentication & session
- `POST /auth/login`
- `POST /auth/signup/step1`, `POST /auth/signup/step2` (dev OTP auto-prefilled)
- `POST /auth/forgot-password`, `POST /auth/reset-password` (new **Forgot password** page)
- `POST /auth/refresh` — **silent token refresh + one-time retry on 401**, single-flight
  (concurrent 401s share one refresh, since the refresh token rotates server-side);
  auto-logout + redirect to `/login` if refresh fails

### User profile
- `GET /users/me`, `PATCH /users/me` — Settings ▸ My details (user + influencer/admin)

### Users (admin)
- `GET /users`, `POST /users`, `PATCH /users/:id/status`

### Subscriptions & payments
- `GET /subscription-plans`, `POST /subscription-plans`, `PATCH /subscription-plans/:id`, `PATCH /subscription-plans/:id/toggle`
- `GET /user-subscriptions/me`
- `POST /subscriptions/purchase` — "Get this plan" flow (see dev-payment note below)
- `POST /payments`, `GET /payments/me`

### Magazines
- `GET /magazines`, `GET /magazines/:id` (new **magazine reader** at `/user/magazines/:id`)
- `POST /magazines` → `POST /magazines/upload` (multipart PDF + cover) → `POST /magazines/:id/publish`
  (admin "Publish Magazine" now runs the full create → upload → publish chain)
- `PATCH /magazines/:id` (pause/archive)

### Campaigns (influencer)
- `GET /campaigns`, `GET /campaigns/:id`, `GET /campaigns/:id/overview`, `POST /campaigns`
- Campaign detail page shows real name / dates / commission / promo code

### Earnings & payouts (influencer)
- `GET /earnings` (summary cards), `GET /earnings/payouts` (Requested Payout table)
- `POST /bank-accounts`, `GET /bank-accounts`, `POST /earnings/withdraw` (Request Payout wizard)

### Notifications
- `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`
  (bell shows real feed + unread dot; dismiss marks read)

### Admin / analytics
- `GET /admin/dashboard`, `GET /admin/analytics/dashboard`, `GET /admin/audit-logs` (new "Recent Activity" panel), `GET /admin/influencers`

### Promo tracking
- Influencer share links now point at `GET /track/:promoCode`

### Reliability
- Added a **404 catch-all page** and a **route-level error boundary** (no more blank screens on bad URLs / render errors)

---

## ⚠️ Needs backend attention

### 1. A backend fix was already applied — please review
`POST /auth/refresh` was returning **500** (`duplicate key value violates unique
constraint` on `refresh_tokens.token`) when two tokens were minted in the same
second. The service revokes the old refresh token *before* generating the new
one, so a failure left the session with no valid refresh token.

- **Fix:** added a unique `jti: nanoid()` to the refresh JWT payload in
  `auth.service.ts` → `generateTokens` (nanoid was already imported).
- **This is the only change made in the backend repo.** Everything else is frontend-only.

### 2. No Razorpay order / checkout endpoint
Subscription purchase and payouts currently create a payment record directly
(the frontend calls `POST /payments`, which the backend marks `SUCCESS`). This is
a **dev-mode shim** isolated in a single function on the client. Before
production we need a real order-creation + signature-verification flow.

### 3. Missing endpoints blocking frontend features (left unwired)
- Authenticated **change password** (only OTP-based reset exists) → Settings ▸ Security password form is inert
- **2FA enable**
- **Active sessions** list (a `DeviceSession` entity exists, but no route)
- **Avatar / profile-picture upload**

### 4. Campaign overview has no time-series
`GET /campaigns/:id/overview` returns scalars only (totalClicks, totalConversions,
totalCommission, clicksByMedium). The campaign detail charts therefore remain
**illustrative**. A daily clicks/conversions/earnings series would let us render
them from real data.

### 5. Data / consistency notes
- **Double-versioned routes** (`/api/v1/v1/...`) — works, but appears unintended.
- **Seed inconsistency:** influencer `arun` has a **negative `availableBalance`**
  (pending + completed payouts ₹1500 > earnings ₹109), so successful withdrawals
  can't be exercised on that account.
- `admin/dashboard` and `admin/analytics/dashboard` overlap; the frontend uses both.
- Confirmed constraint: **publishing a magazine requires a PDF** — the frontend
  enforces create → upload → publish ordering and validates a PDF is attached.

---

## Not yet integrated

Only the backend-blocked items in section ⚠️ above (change-password, 2FA, active
sessions, avatar upload, real Razorpay checkout). Every screen with an existing
endpoint is now live.

## Known frontend follow-ups (not backend-related)

- Replace silent dummy-data fallbacks with explicit loading / error / empty states
- Production env + build config (backend URL is currently `localhost`)
- Move tokens from `localStorage` to httpOnly cookies (needs backend cooperation)
- Form-validation, accessibility, and responsive passes
