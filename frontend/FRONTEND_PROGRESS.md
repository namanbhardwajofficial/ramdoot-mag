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

### 1.2 Errors are mostly invisible to users — **admin done, in progress**

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

**Data loads — admin done, 24 remaining.** These need a different treatment:
an inline error with a retry action, not a toast, because they fire on mount
and a toast on page load is noise.

The five `src/hooks/use*.js` data hooks swallowed failures before the page
could ever see them, so page-level work alone would have been useless. Each
now exposes an `error`, and `DataTable` takes `error`/`onRetry`. A failed load
used to fall through to **"No data found"** — asserting the list was empty
when the request never came back.

The stat cards had the same problem one level up. `stats` stayed `null` on
failure and every card read `stats?.x ?? 0`, so an outage rendered a confident
**0**. `<StatCard>` and the new `<StatValue>` now render a dash when the value
is unknown. Verified by pointing `VITE_BACKEND_URL` at a closed port: all five
cards show `—` and the table shows *"Couldn't load this / Try again"*.

**Admin dashboard — done.** Its four loaders (`/admin/dashboard`,
`/admin/analytics/dashboard`, `/admin/audit-logs`, magazines) now each own an
error key, so a failed audit log no longer blanks the stat cards, and every
one of the five sections gets its own retry. Verified against a dead backend:
all five show *"Couldn't load this / Try again"*, and clicking all five fires
exactly five new requests.

Three defects came out of that page:

- **The "Recent Payment Deposits" list was entirely fabricated** —
  `[1,2,3,4].map()` over hardcoded "Visa ending in 1234 / Expiry 06/2025 /
  +₹ 49" rows. The real `recentPayments` were already in the
  `/admin/dashboard` response the page had fetched, and were being discarded.
  It now renders them (payer, description, amount, timestamp).
- Audit rows rendered `l.entityType`, but the API returns `l.entity`, so the
  entity label was always blank. Now shows `· user`, `· magazine`, `· system`.
- Every magazine row displayed a green dot and the word "Live" regardless of
  status. It now reads the row's real status (Draft / Scheduled / Live).

**Remaining 24**, all page-local fetches that never reach a hook: influencer
pages (`Campaigns`, `Earnings` ×3, `InfluencerDashboard` ×3,
`CampaignDetails`, `RequestPayout` ×2, `RequestedPayout`), user pages
(`Home`, `Magazines`, `Subscriptions`), settings panels (`BillingsPanel` ×2,
both `MyDetailsPanel`), the notification bell (2), `PaymentsChart`,
`CampaignDetailsDrawer`, `InfluencerDetail` and `useSecurity.loadDevices`.
Each needs local `error` state — they fetch directly rather than through a
hook.

### 1.2b Fabricated trend lines — **done**

`MiniChart` drew one of two hardcoded SVG curves chosen by a `trend` prop, on
29 cards. It was not data. "Churned Users 0" came with a falling red line, and
with the backend dead a card showed **0 beside a climbing green curve**.

It now plots a `series` and renders nothing without one. The 20 dead `trend`
props are gone.

**Now wired to real data.** The backend shipped
`GET /admin/analytics/revenue`, so the Total Revenue sparkline plots actual
monthly revenue. The endpoint returns only periods that had payments, so
`src/lib/series.js` zero-fills the window first — otherwise one paid month
would draw as a flat line implying the other eleven never happened. 13 unit
checks cover it against the real payload shape.

The same data replaced two placeholders:

- The admin dashboard panel reading *"Campaign revenue over time isn't
  available yet"* is now a real 12-month revenue chart (₹0 through Jul,
  ₹1,448 in Aug).
- `PaymentsChart` filtered on `status === 'COMPLETED'`, but the backend enum
  is `SUCCESS` — **the filter never matched, so that chart had always drawn a
  flat zero line** regardless of payments. It now reads the revenue endpoint.
  Its y-axis also formatted every tick as `(v/1000).toFixed(0)+'k'`, printing
  "0k, 0k, 0k, 0k, 0k" for any revenue under ₹1,500; it now shows ₹0 / ₹362 /
  ₹724 / ₹1.1k / ₹1.4k. Its "Payout" series is gone — nothing exposes payouts
  per period, and drawing it flat at zero asserted none had been paid.

Two related fixes in the same pass:

- `admin/payments.jsx` read `influencerPayouts`, `subscriptions`, `singleSales`
  and `netRevenue`, but the hook only ever set `totalRevenue`. **Four of the
  five cards were permanently ₹0** regardless of backend state. All five are
  now derived from real payments and payouts.
- Hardcoded `changeLabel="+ 100% vs last month"` growth claims removed from
  the payments and publications cards — nothing computed them.

### 1.2d Magazine upload posted to a path that does not exist — **fixed**

`magazinesApi.upload` POSTed to `/magazines/upload` with the id in the form
body. The route is `POST /magazines/{id}/upload` — the old path returns **404**,
confirmed against the deployed backend. `usePublications.publish()` calls it, so
**publishing a magazine with a PDF has been failing all along**, which is why
every magazine in the database has no file attached and
`GET /magazines/{id}/read` answers "This magazine has no PDF uploaded yet" for
all four.

Fixed, and `magazinesApi.read(id)` added for the reader. The upload -> read
round trip is **not yet verified end to end** — that means writing a real PDF to
the shared deployed server, which I have not done without asking.

### 1.4b What the 2026-08-23 backend fixes unblock

Verified working (see `BACKEND_GAPS.md` "Verification of the 2026-08-23
fixes"): resend-OTP with a 60s limit, Base32 2FA secrets that verify before
enabling, device sessions with IP and user-agent, magazine upload/read, and the
revenue time-series.

Frontend work these open up, none of it done yet:

1. **A "Resend code" button** on the signup and password-reset OTP screens,
   with a 60s countdown to match the server. Blocked in practice: the deployed
   mailer is unconfigured and returns *"Email service is not configured"*, so no
   OTP can be delivered at all (`BACKEND_GAPS.md` #14).
2. **Turn the 2FA panels back on.** Do NOT flip `TWO_FACTOR_ENABLED` on its own
   — `authApi.login` does not send `totpToken`, so the first user to enable 2FA
   locks themselves out of the frontend. The login form needs a TOTP step first,
   and enforcement on login still needs confirming.
3. **A magazine reader** using `GET /magazines/{id}/read`, which also increments
   `readsCount`. Needs at least one magazine with a PDF, which §1.2d unblocks.
4. **Device sessions** now return real rows, so the security panel's device list
   should be re-checked against live data rather than an always-empty list.

### 1.2c Duplicate requests on every admin page — **done**

Each data hook ran a `fetchStats` that re-fetched the *same endpoint* the list
had just fetched, and every page paired `init()` with a second effect that
fetched again the moment `loading` flipped false. Measured on
`/admin/subscriptions` (StrictMode off, so these are production numbers):
**4 requests to `/api/v1/subscription-plans` per page load, now 1.**

Stats are computed from the response the list already fetched, and the
duplicate mount fetch is gone via `src/hooks/useFilterRefetch.js`, which skips
the first settled filter value. Filtering still works in both directions —
verified: 6 rows, search "Priya" → 1 row, clear → 6 rows.

### 1.3 Untested empty state

`BillingsPanel` renders a "Browse subscription plans" empty state when the user
has no active subscription. It is a plain ternary, but I could not exercise it:
both seeded users have active subscriptions, and creating a fresh account needs
an OTP email (see §2.4). Worth a manual pass once signup works end to end.

### 1.4 Re-enable 2FA when the backend is fixed

Both security panels are gated behind `const TWO_FACTOR_ENABLED = false`:

- `src/components/settings/SecurityPanel.jsx:13`
- `src/components/user/settings/SecurityPanel.jsx:20`

**The backend side is now fixed** (verified 2026-08-23): secrets are Base32, and
`enable` rejects an invalid code instead of storing it as the secret.

**But do not just flip the flag.** `authApi.login` sends only
`{ email, password, rememberMe }` — it does not send `totpToken`, which the login
DTO now accepts. So the first user to enable 2FA **locks themselves out of the
frontend entirely**. Order of work:

1. Add a TOTP step to the login form and pass `totpToken` through `authApi.login`.
2. Confirm the backend actually enforces 2FA on login (unverified — proving it
   means enabling 2FA on a live account).
3. Only then flip `TWO_FACTOR_ENABLED` in both panels.

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

### 1.6 Admin revenue chart — **done**

The backend shipped `GET /admin/analytics/revenue`, so the panel is a real
12-month chart and the Total Revenue card has a real sparkline. `src/lib/series.js`
zero-fills the window because the endpoint omits periods with no payments.

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

### 2.3 🟠 No magazine files uploaded — cause found and fixed, content still needed

All four magazines have `pdfUrl: null`, so nothing is readable and every cover
falls back to the placeholder. This was **not** just a content gap: the frontend
was POSTing to `/magazines/upload` when the route is `/magazines/{id}/upload`,
which 404s, so **every publish-with-a-PDF silently failed** (§1.2d). Fixed.

What remains is genuinely a content task — somebody has to upload real PDFs — plus
one verification: the upload -> read round trip has not been run end to end,
because that means writing a real file to the shared deployed server.

### 2.4 🔴 OTP email cannot be sent — confirmed, not just suspected

No longer a guess. The deployed mailer is unconfigured:

```
POST /api/v1/auth/resend-otp  {"email":"priya@example.com","purpose":"PASSWORD_RESET"}
-> 500 {"message":"Email service is not configured. Contact support."}
```

**Signup verification and password reset are both dead ends today**, and no amount
of frontend work changes that. This is config on the EC2 box, not code. It also
blocks §1.3 (the empty-state pass needs a fresh account) and makes a "Resend code"
button pointless until it is fixed. See `BACKEND_GAPS.md` #14.

### 2.5 Other backend gaps

See `BACKEND_GAPS.md`:

- **#1** — the Razorpay webhook is unauthenticated and mutates payment status.
  Still open, and still the most serious one: it can be forged to grant free
  subscriptions.
- **#16** — no platform-wide payments list, so four cards on `/admin/payments`
  (Influencer Payouts, Subscriptions, Single Sales, Net Revenue) have no real
  source and render "—".
- ~~**#2b** device sessions~~ — **fixed**, verified writing IP and user-agent.
- ~~**#12** resend-OTP~~ — **endpoint fixed** and rate-limited, but useless until
  §2.4 (the mailer) is configured.

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
