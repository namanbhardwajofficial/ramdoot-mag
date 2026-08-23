# Frontend — Remaining Work

**Date:** 2026-08-23
**Repo:** `frontend` (Vite + React)
**Branch:** `routing` — latest commits `8043c4a`, `36001ec` (neither pushed)
**Backend:** `http://13.204.191.64:3000` · Swagger at `/docs` · base path `/api/v1`

---

## Summary

All 56 Swagger operations are wired in `src/lib/api.js`, except two that are
deliberately not client-callable (`GET /v1/health`, `POST /webhooks/razorpay`).
Every screen renders real API data — verified by rendering all 25 routes across
public / admin / influencer / user with **no errors, no 404s and nothing stuck
loading**.

**Nothing on the frontend blocks launch.** Everything in "Blocked" below is
backend, infrastructure or content. The open frontend items are one product
decision and a set of quality improvements.

---

## 1. Open on the frontend

### 1.1 Donation CTAs have no destination — needs a product decision

`src/components/landing/WhyBuy.jsx` — "Donate Now", "Contribute", "Support Us"
are still `handler={() => {}}`. There is no donation flow in the app or the API,
and pointing them at `/signup` would mislead visitors. Marked `TODO(product)` in
the file.

**Needs from you:** either a donation feature, or an external giving URL to link
out to. Wiring is ~10 minutes once decided.

### 1.2 Errors are mostly invisible to users — **in progress**

**50** catch handlers logged to the console only (not 34 — the first count used
a single-line grep and missed every block-form `catch (e) { console.error(...) }`).
They split into two groups:

**Mutations — done.** 10 handlers where the user clicked something, it failed,
and *nothing happened at all*: add/delete user, create/delete/toggle/update
plan, publish/delete/deactivate/update magazine, restrict influencer, save user
edits, suspend/block user, copy-to-clipboard, mark-all-read and dismiss
notification. All now surface the API's own message via `toastError`.

Two real bugs surfaced while doing this:

- Dismissing a notification removed the row optimistically but never restored
  it on failure — the notification vanished from the drawer while still unread
  on the server.
- `handleUpdate` in `admin/subscriptions.jsx` was missed by the original count
  entirely, so plan edits failed silently.

Verified end to end: submitting the Add User form with an existing address now
shows *"Email already registered"*; before, the modal just sat there.

**Data loads — 39 remaining.** These need a different treatment: an inline
error with a retry action, not a toast, because they fire on mount and a toast
on page load is noise. Concentrated in the six `src/hooks/use*.js` data hooks
(they swallow errors before the page ever sees them) plus the dashboards and
list pages. The hooks are the place to start — fixing those covers most pages
at once. Roughly half a day.

### 1.3 Untested empty state

`BillingsPanel` renders a "Browse subscription plans" empty state when the user
has no active subscription. It is a plain ternary, but I could not exercise it:
both seeded users have active subscriptions, and creating a fresh account needs
an OTP email (see §2.4). Worth a manual pass once signup works end to end.

### 1.4 Re-enable 2FA when the backend is fixed

Both security panels are gated behind `const TWO_FACTOR_ENABLED = false`:

- `src/components/settings/SecurityPanel.jsx:13`
- `src/components/user/settings/SecurityPanel.jsx:20`

The wiring is complete and already calls the real endpoints — flip the flag to
`true` once `BACKEND_GAPS.md` #2 is fixed. The panel subtitle follows the flag,
so it stays accurate either way.

Hidden because the current implementation is not functional: `generate2fa`
returns a 40-char **hex** secret where `otpauth://` requires **Base32** (so
authenticator apps reject it outright), `enable2fa` stores the submitted code
*as* the secret and verifies nothing, and login never reads
`isTwoFactorEnabled`.

### 1.5 Placeholder tabs — UI to build once the endpoints exist

These render "Coming soon" or an explicit "not available" card. Each is waiting
on a missing endpoint, listed with its `BACKEND_GAPS.md` reference:

| Location | Tabs | Blocked on |
|---|---|---|
| `InfluencerDetail.jsx` | Audience | gap #3 |
| `InfluencerDetail.jsx` | Payments | gap #4 |
| `InfluencerDetail.jsx` | Overview, Analytics, Profile & Activity, Admin Controls | gaps #3–#4 |
| `CampaignDetailsDrawer.jsx` | Performance, Subscription, Actions | gap #5 |
| `MagazineDetailsDrawer.jsx` | Performance | gap #6 |
| `MagazineDetailsDrawer.jsx` | Financials | gap #7 |

### 1.6 Admin revenue chart is a placeholder

`AdminDashboard.jsx` shows "Campaign revenue over time isn't available yet"
where a chart used to draw a hardcoded curve.
`GET /admin/analytics/dashboard` returns scalars only
(`{ total, thisMonth, pendingPayouts }`) — no time series. **Needs a backend
endpoint** returning revenue bucketed by day/month before the chart can return.

---

## 2. Blocked — not fixable from the frontend

### 2.1 🔴 Backend has no TLS — hard launch blocker

Verified: `https://13.204.191.64:3000` fails entirely; only HTTP responds. The
moment the frontend is served over HTTPS, **every API call is blocked as mixed
content** and the app is completely non-functional. Access tokens and passwords
also travel in clear today.

**Needs:** a certificate and a reverse proxy (ALB / nginx / Caddy), then set
`VITE_BACKEND_URL` to the `https://` origin.

### 2.2 🔴 Razorpay not configured

`POST /payments/create-order` returns
`500 · "key_id or oauthToken is mandatory"`. Checkout cannot complete until
`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are set on the server. The frontend
flow is finished and fails with a clear error rather than granting anything.

### 2.3 🔴 No magazine files uploaded

All four magazines have `pdfUrl: null` and `coverImageUrl: null`, so nothing is
readable and every cover falls back to the placeholder. Content task — the
upload flow itself works.

### 2.4 🔴 OTP email delivery unverified

Deployed `signup/step1` no longer returns the OTP, and `forgot-password` returns
the generic *"If the email exists, an OTP has been sent"*. If SMTP is not
configured, **signup and password reset are both silent dead ends**. Confirm
mail actually sends before launch.

### 2.5 Other backend gaps

See `BACKEND_GAPS.md`:

- **#2b** — device sessions are never written, so Settings ▸ Security will
  always read "No active sessions".
- **#12** — no resend-OTP endpoint, and an abandoned signup permanently locks
  the email (409 on retry, no password set, no way out). The "Resend
  Verification Code" control on the signup screen has nothing to call.
- **#1** — the Razorpay webhook is unauthenticated and mutates payment status.

---

## 3. Done this session (for context)

- **Case collision fixed.** The repo tracked both `src/pages/User/` and
  `src/pages/user/`; Windows merged them, Linux would not. Five imports resolved
  to nothing, and `main.jsx` imported `./layouts/adminLayout.jsx` where the file
  is `AdminLayout.jsx` — the admin area would have 404'd. A fresh clone now
  builds on a case-sensitive filesystem — verified against an extracted
  checkout of the commit, and re-checked after every change since (345 imports
  across 120 files, all exact-case).
- **Routing corrected.** `/user/home` served an admin scaffold with hardcoded
  counts; `/user/subscriptions` served a mock page with no purchase path. Both
  real pages existed but were orphaned. Removed `/user/users` (`GET /users` is
  ADMIN-only, 403 for the only role that could reach it) and four one-word stub
  routes.
- **Free-subscriptions bug removed.** The subscriptions page fabricated a
  payment then called `purchase`, granting subscriptions without payment.
  Replaced with real Razorpay checkout.
- **Fabricated data removed** from the influencer payout form (someone's
  invented bank details), campaign and admin charts, the influencer dashboard,
  and every silent mock fallback. Empty states now read as empty.
- **Landing CTAs wired** — previously *no* navigation existed off the landing
  page at all, including the Login button.
- 23 placeholder subtitles replaced; `.env.example` added; settings tabs made
  deep-linkable.

### Dev environment note

The deployed backend's `CORS_ORIGINS` excludes localhost, so the browser blocks
direct calls. `vite.config.js` proxies `/api`, `/v1` and `/uploads` server-side
and `API_ORIGIN` is blank in dev, so requests go out same-origin. **No backend
change is needed for local development** — see `BACKEND_GAPS.md` #11.

---

## 4. Deployment checklist (frontend)

1. Copy `.env.example` → `.env`.
2. Set `VITE_BACKEND_URL` to the **https://** backend origin, no trailing slash.
   The client appends `/api/v1` itself.
3. Optionally set `VITE_RAZORPAY_KEY_ID` (the publishable `rzp_...` id, never
   the secret). `create-order` returns the key it used and the checkout prefers
   that, so this is only a fallback.
4. `npm ci && npm run build` → serve `dist/`.
5. Configure the host to rewrite unknown paths to `index.html` (client-side
   routing), or deep links like `/user/settings` will 404.
6. Add the deployed origin to the backend's `CORS_ORIGINS`.
