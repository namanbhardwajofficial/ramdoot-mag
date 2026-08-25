# Frontend issues — full audit

Swept **2026-08-25** against the deployed backend (`13.204.191.64:3000`, 61 routes).
Every item below was verified by running the app, not read off the code. Routes
were rendered headless per role; buttons and API wiring were scanned across all
of `src/` and then hand-checked to strip false positives.

**Route health:** all 20 routes render. No crashes, no stuck spinners, no 404s
except the intended catch-all. The problems are inside the pages, not the routing.

---

## 1. 🔴 Blockers

### 1.1 The influencer role cannot log in at all

`arun@example.com` has 2FA enabled server-side, and login now enforces it:

```
POST /auth/login {"email":"arun@example.com","password":"Admin@123"}
-> 401 {"message":"2FA token required"}
```

`authApi.login` sends only `{ email, password, rememberMe }`. The login DTO
accepts `totpToken` and we never send it, so **there is no way to sign in as that
influencer through the UI** — the form shows "2FA token required" and offers
nothing to type the code into. The entire `/influencer/*` area is unreachable for
this account.

This is the lockout flagged before the 2FA panels were re-enabled; it is no longer
hypothetical, it is live on a seeded account.

**Fix:** add a TOTP step to the login form and pass `totpToken` through
`authApi.login`. Until then, do **not** flip `TWO_FACTOR_ENABLED`
(`components/settings/SecurityPanel.jsx:13`,
`components/user/settings/SecurityPanel.jsx:20`) — any user who enables 2FA locks
themselves out the same way.

*Silver lining: this is proof that 2FA enforcement on login works, which was
previously unverified.*

### 1.2 Backend has no TLS

Unchanged and still the hard launch blocker. Serving the frontend over HTTPS makes
**every** API call fail as mixed content. Tokens and passwords currently travel in
clear. Needs a certificate and reverse proxy, then `VITE_BACKEND_URL` moves to
`https://`.

### 1.3 Credential leak on a public endpoint

`GET /magazines` (unauthenticated) returns `createdBy` as a full user entity
including `passwordHash` and `twoFactorSecret`. See `BACKEND_GAPS.md` #17. The
frontend now discards the object, which limits our exposure but does not fix the
leak. **The admin password and 2FA secret should be rotated.**

---

## 2. 🟠 Dead controls — buttons that do nothing when clicked

Verified individually; multi-line false positives removed.

### 2.1 Table row actions (highest impact)

`pages/admin/influencer-campaigns.jsx` — only the eye/view icon works:

| Line | Control | Table |
|---|---|---|
| 91 | Delete (trash) | Influencers |
| 92 | Edit (pen) | Influencers |
| 112 | Restrict (circle-slash) | Campaigns |
| 115 | Edit (pen) | Campaigns |

These look identical to the working view button, so they read as functional.

### 2.2 "Sort by" — on every admin list page

`components/ui/toolbar.jsx:32` is a button with no handler, and `Toolbar` is used
on users, subscriptions, payments, publications and influencer-campaigns. One dead
control, five pages. `pages/admin/magazines.jsx:19-20` has its own unwired
**Filters** and **Sort by** pair, plus a search input with no state binding.

### 2.3 Individually dead buttons

| File | Line | Label |
|---|---|---|
| `pages/admin/AdminDashboard.jsx` | 188, 189 | Preview, View Details (magazine rows) |
| `pages/admin/AdminDashboard.jsx` | 228, 303, 312 | Create Campaigns, View Details, View deposits |
| `pages/admin/payments.jsx` | 109 | View Report |
| `components/influencers/InfluencerDetail.jsx` | 77 | View Campaign |
| `components/influencers/InfluencerDetail.jsx` | 271 | Edit |
| `pages/Help.jsx` | 98 | Get in Touch |
| `components/landing/AboutUs.jsx` | 80 | View Details |
| `components/influencers/PayoutRequestedDrawer.jsx` | 16 | Connect Us |
| `components/influencers/PromoCodeDrawer.jsx` | 83 | Connect Support |
| `components/influencers/ShareCampaignDrawer.jsx` | 51 | Connect Support |
| `pages/influencers/RequestPayout.jsx` | 345 | Connect Us |

The four "Connect Us / Connect Support" buttons need a destination — support email,
form, or WhatsApp. That is a product decision, like the donation CTAs were.

### 2.4 Links that go nowhere

- `components/landing/Footer.jsx:63` — every social icon is `href="#"`. Needs the
  real social URLs or the icons should come out.
- `pages/admin/payments.jsx:72` — "Campaign Link" column renders `href="#"`.
  `/admin/payouts` does not join the campaign, so there is no name or id to link
  to (`BACKEND_GAPS.md` #16).

### 2.5 Inert period selector

`components/ui/stat-card.jsx:76` — the "This Month / This Week / Today / This Year"
dropdown on every stat card has `defaultValue` and no `onChange`. Changing it does
nothing. It appears on ~20 cards and implies filtering the app cannot do; the
endpoints take `from`/`to` (payments) and `days` (revenue), so it *could* be wired.

---

## 3. 🟠 Fabricated data still on screen

### 3.1 Hardcoded sparklines on influencer pages

- `pages/influencers/Earnings.jsx:47-48` — `commissionTrend` and `payoutTrend` are
  literal arrays (`[20, 28, 24, 36, …]`) feeding the charts on the Commission
  Earning and Payout Available cards. **The number is real, the trend beside it is
  invented** — the same defect fixed in `MiniChart`.
- `pages/influencers/RequestPayout.jsx:9` — `trend = [10, 14, 12, 20, …]` feeding
  an `AreaChart`.

No per-influencer time series exists, so the honest fix is to drop these charts
until one does (or add `GET /earnings/timeseries`).

### 3.2 Confident zeros on failure

`Earnings.jsx:186-187` and `InfluencerDashboard.jsx:80,84` render `'₹ 0'` when the
fetch fails, asserting a real balance of zero. Should be a dash, as the admin cards
now are.

---

## 4. 🟡 Errors still invisible — 22 handlers

Down from 50. All admin screens are done; what remains are page-local fetches that
never reach a hook, so each needs its own error state.

**Influencer pages (11):** `Campaigns.jsx:46`, `Earnings.jsx:98,105,112`,
`InfluencerDashboard.jsx:40,44,56`, `CampaignDetails.jsx:109`,
`RequestPayout.jsx:148,160`, `RequestedPayout.jsx:39`
**User pages (3):** `Home.jsx:25`, `Magazines.jsx:26`, `Subscriptions.jsx:57`
**Settings (4):** `BillingsPanel.jsx:97,103`, both `MyDetailsPanel` (`:47`, `:38`)
**Other (4):** `notification-bell.jsx:35,46`, `InfluencerDetail.jsx:60`,
`useSecurity.js:123`

Roughly half a day. Nothing blocks it.

---

## 5. 🟡 Wired but unreachable / unused

| Item | Problem |
|---|---|
| `magazinesApi.read` | Never called. `MagazineDetail.jsx:73` links straight to `pdfUrl`, so **`readsCount` never increments** — which is why the magazine Performance tab reads 0. Route the button through `/magazines/:id/read`. |
| `magazinesApi.versions` | Endpoint wired, but `MagazineDetailsDrawer` has no Versions tab (`TAB_LIST` is Overview/Performance/Financials/Actions). Backend ships it as a stub anyway. |
| `authApi.verifyEmail` | No UI calls it. Signup step 2 already verifies, so this is probably dead — confirm and delete. |
| `paymentsApi.record` | No caller since checkout moved to `create-order` + webhook. Likely dead. |
| `src/data/userMagazines.js` | Mock catalogue, no longer imported anywhere. Delete. |

---

## 6. 🟡 Untestable until the backend moves

- **Signup and password reset** — the deployed mailer is unconfigured
  (`"Email service is not configured"`), so no OTP is delivered. Both flows are
  dead ends end to end. Blocks a resend-code button too.
- **Razorpay checkout** — keys unset; `create-order` returns
  `500 key_id is mandatory`. The frontend flow is complete and fails with a clear
  message rather than granting anything.
- **`BillingsPanel` empty state** — needs a fresh account, which needs working OTP.
- **Magazine upload → read round trip** — the 404 path bug is fixed, but no PDF has
  been uploaded, so no magazine is readable and every cover is a placeholder.
- **Influencer area** — unverifiable at all right now, see §1.1.

---

## 7. Deployment checklist

- [ ] `VITE_BACKEND_URL` set to an **https** origin (blocked by §1.2)
- [ ] `VITE_RAZORPAY_KEY_ID` set
- [ ] Rotate admin password + 2FA secret after §1.3 is fixed
- [ ] Upload real magazine PDFs and covers
- [ ] Decide destinations for the four "Connect Support" buttons and the footer socials
- [ ] `npm run build` — currently passes

---

## Verified working

Admin dashboard (real counts, 12-month revenue chart, real recent payments, audit
log) · admin users/subscriptions/publications/payments incl. platform-wide totals ·
influencer Audience and Payments tabs · campaign financials · magazine performance
and financials · login → role redirect · token refresh with rotation · search and
filters on admin tables · inline error + retry on every admin data load · donation
CTAs → ramdootrestores.in · 404 catch-all.
