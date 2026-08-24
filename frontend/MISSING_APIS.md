# Missing APIs — frontend requests for the backend team

Every item below was checked against the **deployed** backend
(`http://13.204.191.64:3000/docs-json`) on **2026-08-23**, not against the repo —
the `backend/` folder in this repository is abandoned and lags the deployment.
Deployed route count at time of writing: **51**.

Each entry says what UI is waiting on it, why the existing endpoints can't cover
it, and a suggested shape. Response shapes assume the standard
`{ success, message, data }` envelope already used everywhere.

For security and config issues (unauthenticated Razorpay webhook, missing TLS,
unconfigured mailer) see **`BACKEND_GAPS.md`** — this file is only about endpoints
that do not exist.

---

## Priority 1 — blocks visibly broken screens

### 1. Platform-wide payments list

**Missing:** `GET /admin/payments`

`GET /payments/me` is caller-scoped, so an admin sees **their own** payments, not
the platform's. Consequence today: `/admin/payments` showed *"Total Revenue ₹0"*
directly above a chart reading **₹1,448**, because the chart uses
`/admin/analytics/revenue` and the cards used `/payments/me`.

We patched Total Revenue to come from `/admin/analytics/dashboard`, but four cards
still have **no source at all** and now render `—`: Influencer Payouts,
Subscriptions, Single Sales, Net Revenue. The payments table on that page is also
empty for every admin.

```
GET /admin/payments?status=&from=&to=&search=&page=&limit=
-> { data: [ { id, amount, status, paymentMethod, relatedType, description,
               createdAt, user: { id, fullName, email } } ], meta: {...} }
```

`relatedType` is what lets us split subscription revenue from one-off sales.

### 2. Platform-wide payouts list

**Missing:** `GET /admin/payouts`

`GET /earnings/payouts` is influencer-scoped — an admin gets their own (empty)
list. So "Influencer Payouts" cannot be computed, and the admin payouts table is
permanently empty.

`/admin/analytics/dashboard` exposes `revenue.pendingPayouts` (₹109), but that is
*pending*, not paid — labelling it "Influencer Payouts" would misstate it, so we
left the card blank rather than show a wrong number.

```
GET /admin/payouts?status=&page=&limit=
-> { data: [ { id, amount, status, createdAt,
               user: { id, fullName }, campaign: { id, name } } ], meta: {...} }
```

Also: `GET /earnings/payouts` currently takes **no query parameters** — a `status`
filter there would let us stop filtering client-side.

### 3. Revenue breakdown

**Missing:** `GET /admin/analytics/revenue-breakdown`

Cheaper alternative to #1 if a full payments list is a bigger job. Anything that
splits total revenue by type would light up three of the four blank cards.

```
GET /admin/analytics/revenue-breakdown?from=&to=
-> { subscriptions: 1299, singleSales: 149, payoutsPaid: 0, netRevenue: 1448 }
```

---

## Priority 2 — placeholder tabs in shipped UI

These screens exist and currently render an explicit *"not available yet"* card.
**If any of these are not planned, tell us and we will delete the tabs** rather
than leave placeholders in the product.

| # | Missing endpoint | UI waiting on it |
|---|---|---|
| 4 | `GET /influencers/{id}/audience` | `InfluencerDetail` ▸ Audience tab |
| 5 | `GET /admin/influencers/{id}/payments` | `InfluencerDetail` ▸ Payments tab |
| 6 | `GET /campaigns/{id}/financials` | `CampaignDetailsDrawer` ▸ Performance / Subscription |
| 7 | `GET /magazines/{id}/performance` | `MagazineDetailsDrawer` ▸ Performance tab |
| 8 | `GET /magazines/{id}/financials` | `MagazineDetailsDrawer` ▸ Financials tab |
| 9 | `GET /magazines/{id}/versions` | `MagazineDetailsDrawer` ▸ Version history |

Notes on a few of these:

- **#6** partially exists — `GET /campaigns/{id}/overview` is live and already
  wired. What's missing is the money side: revenue attributed to the campaign,
  commission earned, and conversions-to-revenue.
- **#7** needs per-magazine read/view events over time. This is the largest piece
  of new work in this file; deprioritise it if the others matter more.
- **#9** needs a new table. Lowest value of the set — happy to drop the tab.

---

## Priority 3 — small additions to endpoints that already exist

### 10. `influencerId` filter on the campaigns list

**Have:** `GET /campaigns?status=&page=&limit=`
**Need:** `&influencerId=`

We currently fetch up to 100 campaigns and filter in the browser, which breaks
once there are more than 100. Roughly a three-line change.

### 11. Single payment status

**Missing:** `GET /payments/{id}`

After Razorpay checkout returns, we have an order/payment id and no way to ask
the server what happened to it. Today we re-read `/payments/me` and search for a
matching `paymentProviderId`, which will not work for an admin or once the list
grows.

```
GET /payments/{id}
-> { id, status, amount, paymentProviderId, failureReason, createdAt }
```

### 12. Time-series zero-fill (behaviour, not a new route)

`GET /admin/analytics/revenue` returns **only** periods that had payments:

```
?granularity=month&days=365
-> { "granularity":"month", "days":365,
     "data":[ {"period":"2026-08-01T00:00:00.000Z","revenue":1448,"transactions":2} ] }
```

One bucket for a 365-day window. Charted raw that draws a flat line and implies
the other eleven months don't exist rather than that they earned nothing. We
zero-fill client-side in `src/lib/series.js`, so **nothing is blocked** — but every
consumer will have to repeat that work. Emitting the full window would be a
better default.

---

## Confirmed working — no action needed

Verified live on 2026-08-23, listed so nobody re-does them:

`POST /auth/resend-otp` (60s limit returns a real 429) · 2FA Base32 secrets +
`enable` rejecting an invalid code · device sessions persisting IP and user-agent ·
`POST /magazines/{id}/upload` · `GET /magazines/{id}/read` ·
`GET /admin/analytics/revenue`.

One frontend bug found while testing these: we were POSTing uploads to
`/magazines/upload` instead of `/magazines/{id}/upload`, which 404s — so every
publish-with-a-PDF had been failing silently on our side. Fixed. That is why all
four magazines still have `pdfUrl: null`; they need real files uploaded.
