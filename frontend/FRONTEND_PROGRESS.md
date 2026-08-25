# Frontend issues — audit and remediation

Audited **2026-08-25**, then fixed the same day. Everything below was verified by
running the app against the deployed backend (`13.204.191.64:3000`), not read off
the code: routes rendered headless per role, controls clicked through a
same-origin driver, and API behaviour confirmed with live calls.

**Route health:** all 20 routes render for every role. No crashes, no stuck
spinners, no unintended 404s. `npm run build` passes.

---

## 1. What was fixed

### 1.1 🔴 The influencer role could not log in at all — frontend side done

`arun@example.com` has 2FA enabled and login enforces it, but `authApi.login`
only ever sent `{ email, password, rememberMe }`. The form dead-ended on
"2FA token required" with nowhere to type a code.

The login form now has a second step. It appears when the backend asks for a
code, keeps the credentials, strips non-digits, requires six of them, and sends
`totpToken` through. Driven end to end headless:

```
STEP1 email input: true | password input: true
STEP2 totp field appeared: true
STEP2 message: This account is protected by two-factor authentication…
STEP2 after typing "abc12", value = "12"
STEP2 verify disabled with 6 digits: false
STEP3 still on totp step: true
STEP3 message: Invalid Base32 string: Unknown letter "1"…
STEP4 back on password form: true
```

That last message is the point: **the request now reaches TOTP verification.**
The account still cannot log in, but no longer for a frontend reason — its seeded
`twoFactorSecret` is the literal string `"123456"`, which is not valid Base32.
See `BACKEND_GAPS.md` #21. `/influencer/*` stays untestable end to end until the
backend reseeds that secret.

Two things came along with it: the password field's eye icon was decorative and
now actually reveals the password, and the form submits on Enter.

### 1.2 🟠 Dead controls — 32 of them

Every control that looked clickable and did nothing is now either wired or gone.
Nothing was left inert.

**Wired to something real:**

| Where | Control | Now does |
|---|---|---|
| `ui/toolbar.jsx` (5 admin pages) | "Sort by" | Real sort (see below) |
| `admin/payments.jsx` | Export ×2 | Downloads a CSV of exactly what is on screen |
| `admin/payments.jsx` | "View Report" | Downloads the payments report (relabelled "Download Report") |
| `admin/AdminDashboard.jsx` | Create Campaigns | Opens a real create-campaign form |
| `admin/AdminDashboard.jsx` | Preview / View Details | Opens the PDF / goes to Publications |
| `admin/AdminDashboard.jsx` | View Details, View deposits | Navigate to Users / Payments |
| `admin/magazines.jsx` | Filters, Sort by, Search | All three now filter the catalogue |
| `admin/publications.jsx` | Live / Draft count rows | Open the list filtered to that status |
| `influencers/InfluencerDetail.jsx` | Create Campaigns, View Campaign, its Toolbar | Create form, campaign drawer, real filter/search/sort |
| `influencer-campaigns.jsx` | Row trash icon | Blocks the influencer (with a confirm) |
| `influencer-campaigns.jsx` | Row restrict icon | Suspends — or reactivates, depending on status |
| `publications/EditMagazineForm.jsx` | Both "Add New Magazine" uploads | Real file pickers → `POST /magazines/:id/upload` |
| `pages/Help.jsx` | Search box, Get in Touch | Filters the FAQs, opens support |
| `nav.jsx` | Mobile notification bell | The real `NotificationBell` with its badge and drawer |
| `influencers/Earnings.jsx` | All / 1 Month / 6 Month / 1 Year | Actually narrow both tables |
| `InfluencerDashboard.jsx` | Live Links / Promo Code rows | Open the campaigns list |
| `ui/search-bar.jsx` | The whole global search | Filters and jumps to the pages the role can reach |
| `users/UserDetailView.jsx` | Magazine row eye icon | Opens Publications |
| 11 × "Connect Support" / "Connect Us" | across drawers, modals, Help | One shared `<SupportLink>` |

**Removed instead, because the backend has nothing behind them:**

- Campaign row **edit** and **restrict** icons — `PATCH`/`DELETE /campaigns/:id`
  are both 404 (`BACKEND_GAPS.md` #23).
- Influencer row **pen** icon and the **Edit** button on the influencer detail
  view — there is no `PATCH /users/:id`, only a status change (#24).
- The **period dropdown** on ~20 stat cards ("This Month / This Week / Today /
  This Year"). It had a `defaultValue` and no handler. `StatCard` now renders it
  only when a caller passes `onPeriodChange`, so it cannot reappear inert.
- The **"This Month" pill** on the influencer dashboard cards — a static div with
  a chevron. `GET /earnings` returns lifetime totals only; the caption now says
  "Lifetime" and "Paid out" plainly.
- The fake **PDF viewer toolbar** (zoom −/+, download, ⋯, a hardcoded "1 / 2" and
  "100%") — the whole `magazinesdetails.jsx` component was unreferenced, and
  `/user/magazines/:id` renders `pages/user/MagazineDetail.jsx` instead. Deleted.

The **global search in the top bar** deserves its own note: it appeared on every
admin and influencer page, its `query` state fed nothing, and its dropdown listed
two fabricated "recent" items — a made-up card number
(`Atharv Kelwadkar Card No ********645`) and a made-up email address — above four
handler-less buttons. There is no search endpoint, so it is now a navigator: it
filters the pages the signed-in role can actually reach, supports arrow keys and
Enter, and goes there. The invented personal data is gone.

**Dead links:** the footer's seven `href="#"` social icons now read real URLs
from `SOCIAL_LINKS` and an icon with no URL is not rendered. The payouts table's
"Campaign Link" was an `<a href="#">` around a permanent dash — `/admin/payouts`
does not join the campaign, so it is plain text until it does. `AboutUs`'s
"View Details" points at the foundation's site.

A full re-scan finds **zero** `href="#"`, zero no-op handlers, and zero
handler-less buttons across `src/`.

### 1.3 Sorting, export, pagination

- **`src/lib/sort.js`** — client-side sort for the admin tables. It has to be
  client-side: `GET /users?sortBy=createdAt&sortOrder=desc` returns
  `400 ["property sortBy should not exist"]` (#22). Honest today because these
  pages fetch `limit: 100` unpaginated; the file says so, and says what breaks if
  server-side paging lands.
- **`src/lib/csv.js`** — RFC 4180 export with a UTF-8 BOM so Excel renders the
  rupee sign. Verified: `payments-2026-08-25.csv`, 244 bytes, header + 2 real rows.
- **Influencer Campaigns pagination** was hardcoded `Page n of 10` and refetched
  nothing — it paged through a table that never moved. It now drives the request
  and reads its page count from the response's `meta`, and hides itself when
  everything fits on one page.

### 1.4 🟠 Fabricated data removed

- `Earnings.jsx` — `commissionTrend` / `payoutTrend`, two literal 12-point arrays
  feeding AreaCharts under real balances. Identical for every influencer and
  every balance, including zero. **Charts removed**; the numbers stand alone.
- `RequestPayout.jsx` — one shared literal array under both MiniStats. Same
  treatment.
- The **hardcoded date range** "Jan 10, 2025 – Jan 16, 2025" on Earnings is now
  computed from the selected period.
- **Confident zeros:** `Earnings.jsx`, `InfluencerDashboard.jsx` and
  `RequestPayout.jsx` all rendered `₹ 0` when a fetch failed, asserting a real
  balance of zero. They render a dash now, as the admin cards already did.
- The influencer dashboard's magazine cards showed a **blank grey square** even
  when a cover existed. They render the cover.

### 1.5 🟡 Silent failures — 22 → 0

Every remaining `console.warn` catch now surfaces to the user. The pattern was
always the same and always misleading: a failed request rendered as a confident
factual claim.

| Was silently claiming | Where |
|---|---|
| "You don't have an active subscription" / "No payments yet" | `user/settings/BillingsPanel` |
| "No active sessions" on the Security panel | `hooks/useSecurity` |
| "You're all caught up" in Notifications | `ui/notification-bell` |
| "No subscription plans are available right now" | `user/Subscriptions` |
| An empty magazine catalogue | `user/Home`, `user/Magazines` |
| A campaign with no activity | `influencers/CampaignDetails` |
| Empty earnings, campaigns, payouts, bank accounts | `influencers/*` |
| Stale profile details shown as current | both `MyDetailsPanel`s |
| "no payout accounts" — inviting re-entry of saved bank details | `settings/PayoutPanel` |

Two cases got a softer treatment on purpose: a failed `/users/me` refresh shows
an amber "showing your saved details" banner rather than replacing a usable form,
and a failed full-user fetch toasts "showing partial details" rather than
blanking a detail view that still has real list data in it.

New shared hook `src/hooks/useAsync.js` carries loading / error / retry with
stale-response guarding, so this pattern is harder to reintroduce.

### 1.6 🟡 Wired but unused

- **`magazinesApi.read` is now called.** "Read Magazine" linked straight to
  `pdfUrl`, so `GET /magazines/:id/read` never ran and **`readsCount` never
  incremented** — which is why every magazine's Performance tab reads 0. It goes
  through the endpoint now, opening the tab before the await so it is not
  swallowed as a popup.
- Deleted `src/data/userMagazines.js` (mock catalogue, unimported) and
  `src/components/magazinesdetails.jsx` (unreferenced duplicate viewer).
- Removed `authApi.verifyEmail` and `paymentsApi.record` — no callers, and
  recording a payment client-side would let anyone POST themselves a successful
  one. Dropped `magazinesApi.versions`: the endpoint is a stub, so the tab it was
  "kept wired" for could only ever render its own not-implemented note.

### 1.7 Bugs found while fixing the above

- **`GET /campaigns` leaks `passwordHash` and `twoFactorSecret`** through the
  `influencer` join, exactly like `/magazines` does. Admin-guarded rather than
  public, so less severe — but it confirms the relation is widening across
  endpoints. Mitigated frontend-side (`mapCampaign` drops the object) and filed
  as `BACKEND_GAPS.md` #20.
- **`PUBLICATION_STATUSES` had no `DRAFT`**, so the Publications filter could not
  select the status most magazines are actually in. Added.
- **Payment and payout rows never had a user id** — it lives on the nested
  `user`, and the mapper never read it, so every "User & ID" cell rendered a bare
  `#`. Found because the CSV export had an empty column.

---

## 2. Still open — not fixable from the frontend

### 2.1 🔴 Backend has no TLS

Unchanged, still the hard launch blocker. Serving the frontend over HTTPS makes
**every** API call fail as mixed content. Tokens and passwords travel in clear.
Needs a certificate and reverse proxy, then `VITE_BACKEND_URL` moves to `https://`.

### 2.2 🔴 Credential leak, still live

Re-checked today — `GET /magazines` unauthenticated still returns
`createdBy.passwordHash` and `createdBy.twoFactorSecret`, and `/campaigns` does
the same via `influencer`. **The admin password and 2FA secret should be
rotated.** `BACKEND_GAPS.md` #17 and #20.

### 2.3 🔴 The influencer account is locked out server-side

`BACKEND_GAPS.md` #21. Frontend work is done and verified; the seeded
`twoFactorSecret` is invalid Base32. Until it is reseeded, `/influencer/*` cannot
be exercised as that role, so that area has not been audited under real data.

Related: do **not** enable 2FA on a live account through the settings panel until
you can confirm the generator is being used. New secrets are valid Base32
(verified 2026-08-23); the seed was never migrated.

### 2.4 🟡 Untestable until the backend moves

- **Signup and password reset** — the deployed mailer is unconfigured
  (`"Email service is not configured"`), so no OTP is delivered. Both flows are
  dead ends end to end.
- **Razorpay checkout** — keys unset; `create-order` returns
  `500 key_id is mandatory`. The frontend flow is complete and fails with a clear
  message rather than granting anything.
- **Magazine upload → read round trip** — the upload UI now exists and the 404
  path bug is fixed, but no PDF has been uploaded yet, so no magazine is readable
  and every cover is still a placeholder.

---

## 3. Deployment checklist

- [ ] `VITE_BACKEND_URL` set to an **https** origin (blocked by §2.1)
- [ ] `VITE_RAZORPAY_KEY_ID` set
- [ ] `VITE_SUPPORT_EMAIL` set — without it every "Connect Support" control falls
      back to `ramdootrestores.in` rather than a mailbox
- [ ] `VITE_SOCIAL_FACEBOOK` / `_INSTAGRAM` / `_TWITTER` / `_YOUTUBE` /
      `_LINKEDIN` — unset icons are hidden, so the footer is simply shorter
- [ ] Rotate admin password + 2FA secret after §2.2 is fixed
- [ ] Upload real magazine PDFs and covers (the admin UI can do this now)
- [ ] `npm run build` — passes

---

## Verified working

Admin dashboard (real counts, 12-month revenue chart, real recent payments, audit
log) · admin users / subscriptions / publications / payments incl. platform-wide
totals · sort and CSV export on the admin tables · influencer Audience and
Payments tabs · campaign financials · magazine performance and financials ·
login → role redirect · 2FA code step → `totpToken` · token refresh with rotation
· search and filters on every admin table · inline error + retry on every data
load · donation CTAs → ramdootrestores.in · 404 catch-all.
