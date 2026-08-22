# Backend gaps & issues — for Amit

Written after pulling `a7934d3` ("additional changes"). Frontend is at branch `routing`.

Everything below is something the **frontend cannot fix on its own**. I've grouped it
by urgency. Items 1–2 are security/correctness bugs in code that already exists;
items 3–9 are endpoints the UI needs but that don't exist yet.

For each gap I've said what the UI needs, why the current API can't provide it, and a
suggested shape. Response shapes assume the standard `{ success, message, data }`
envelope the rest of the API already uses.

---

## 0. Heads-up: `a7934d3` was a breaking change for us

You changed the global prefix:

```diff
- const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
- app.setGlobalPrefix(apiPrefix, {
+ app.setGlobalPrefix('api', {
```

That moved every route from `/api/v1/v1/...` to `/api/v1/...`. Correct fix — the old
double `v1` was clearly accidental — but it silently broke every call the frontend
made. I've updated our client, so **we're in sync now**. No action needed.

Flagging it only because a base-path change breaks 100% of clients at once, and it
arrived in a commit named "additional changes". A one-line note in the message would
have saved a debugging session. Not a complaint, just a request for next time.

**Excluded routes — verified, but probably not what you intended.** I tested this
against the running server:

| Path | Status |
|---|---|
| `/api/v1/magazines` | **200** |
| `/api/v1/v1/magazines` | 404 (old path, correctly gone) |
| `/v1/health` | **200** |
| `/health` | 404 |
| `/v1/track/ARUNAF500` | **200** |
| `/track/ARUNAF500` | 404 |

So `exclude` strips the `api` prefix but **URI versioning still injects `/v1`**. Our
client now points at `/v1/track/:code` and works. No action strictly required.

Worth a thought though: `/health` is excluded presumably so load balancers and
uptime checks can hit a stable unversioned path — but it's actually at `/v1/health`,
so anything configured for `/health` gets a 404. Same for promo links, which are
public URLs influencers paste into social bios; `/v1/` in them is awkward and pins a
shareable link to an API version you may later retire. If you want the bare paths,
those two routes need `@Version(VERSION_NEUTRAL)`. Your call — just flagging that
the current behaviour looks accidental.

---

## 1. 🔴 The Razorpay webhook is unauthenticated and mutates payment status

**File:** `src/payments/payments.controller.ts`

```ts
@Post('webhooks/razorpay')
@Public()
async razorpayWebhook(@Body() body: any) {
  // In production, verify webhook signature here
  const event = body.event;
  ...
}
```

This endpoint is `@Public()`, takes an unvalidated `any` body, and drives a payment to
its final state. As written, **anyone on the internet can POST a forged
`payment.captured` event and mark any order paid** without paying. It's the highest
severity item in this document — it's a direct path to free subscriptions.

**Suggested fix.** Razorpay signs every webhook with `X-Razorpay-Signature`, an
HMAC-SHA256 of the *raw* request body using your webhook secret. You must verify it
against the raw bytes — `JSON.stringify(req.body)` will not match, because key order
and whitespace differ after parsing.

Enable the raw body when creating the app:

```ts
const app = await NestFactory.create(AppModule, { rawBody: true });
```

Then verify before doing any work:

```ts
@Post('webhooks/razorpay')
@Public()
@HttpCode(HttpStatus.OK)
async razorpayWebhook(
  @Req() req: RawBodyRequest<Request>,
  @Headers('x-razorpay-signature') signature: string,
) {
  const secret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody)          // raw bytes, NOT the parsed object
    .digest('hex');

  // timingSafeEqual to avoid leaking the signature byte-by-byte
  const ok =
    signature &&
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  if (!ok) throw new UnauthorizedException('Invalid webhook signature');

  return this.paymentsService.handleWebhook(req.body.event, req.body.payload);
}
```

Two related points while you're in there:

- **Make it idempotent.** Razorpay retries on any non-2xx, and will happily deliver
  the same event twice. Keying on `payload.payment.entity.id` and ignoring an event
  whose payment is already `COMPLETED` is enough.
- **Always return 200 once the signature is valid**, even if your internal handling
  fails — otherwise Razorpay retries for hours. Log and swallow instead.

---

## 2. 🔴 2FA is not actually functional

**File:** `src/auth/auth.service.ts`

```ts
async generate2faSecret(userId: string) {
  const secret = crypto.randomBytes(20).toString('hex');
  // In production, generate a proper TOTP secret and return a QR code URI
  return { secret, uri: `otpauth://totp/Ramdoot:${user.email}?secret=${secret}...` };
}

async enable2fa(userId: string, token: string) {
  // In production, verify token against the secret using a TOTP library
  await this.userRepo.update(userId, { twoFactorSecret: token, isTwoFactorEnabled: true });
}
```

Three problems:

1. **The secret isn't valid TOTP.** `otpauth://` URIs require a **Base32** secret;
   you're returning hex. Google Authenticator will reject it outright.
2. **`enable2fa` stores the submitted token *as* the secret**, overwriting the real
   one. So the 6-digit code the user typed becomes the shared secret.
3. **Nothing is ever verified**, so any 6 digits enable 2FA.
4. **Login never checks 2FA at all** — `isTwoFactorEnabled` is written but never read
   in the login path. Enabling it changes nothing about how you sign in.

Net effect: the feature reports success and provides zero security. I'd argue that's
worse than not shipping it, because the UI tells users they're protected.

**Suggested fix.** Use `otplib` — it handles Base32 and the time-window logic:

```ts
import { authenticator } from 'otplib';

async generate2faSecret(userId: string) {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  const secret = authenticator.generateSecret();     // proper Base32

  // Store as PENDING — do not set isTwoFactorEnabled yet.
  await this.userRepo.update(userId, { twoFactorSecret: secret });

  return {
    secret,
    uri: authenticator.keyuri(user.email, 'Ramdoot', secret),
  };
}

async enable2fa(userId: string, token: string) {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user?.twoFactorSecret) throw new BadRequestException('Start 2FA setup first');

  // verify against the STORED secret — never overwrite it with the token
  if (!authenticator.verify({ token, secret: user.twoFactorSecret })) {
    throw new BadRequestException('Invalid authentication code');
  }

  await this.userRepo.update(userId, { isTwoFactorEnabled: true });
  return { message: '2FA enabled successfully' };
}
```

Then **`login` has to honour it**. The usual shape: if `isTwoFactorEnabled` and no
valid `twoFactorToken` was supplied, return a challenge instead of tokens —

```json
{ "requires2fa": true, "challengeToken": "<short-lived JWT>" }
```

— and let the client re-submit with the code. Tell me which shape you pick and I'll
build the second-factor screen; right now our login assumes tokens always come back
on a successful password check.

Also worth storing `twoFactorSecret` encrypted at rest, since it's password-equivalent.

---

## 2b. 🟠 Device sessions are never written — the endpoints return an empty list forever

**Files:** `src/users/users.service.ts`, `src/auth/auth.service.ts`

`GET /users/me/devices` and `DELETE /users/me/devices/:id` both work — I tested them,
they return 200. But **nothing in the codebase ever creates a `DeviceSession` row.**
Grepping `deviceSessionRepo` finds only `.find()`, `.findOne()` and `.update()` — no
`.save()` or `.create()` anywhere. `login` doesn't record a session.

Verified live: logged in as `admin@ramdoot.com`, then immediately called
`GET /users/me/devices` → `{"success":true,"data":[]}`.

So the "Where you're logged in" panel is permanently empty and "revoke" has nothing to
revoke. The read side is done; the write side was never built.

**Suggested fix.** Record a session in `login`, alongside the refresh token. You'll
need the request context, so pass `@Req()` (or `@Ip()` and `@Headers('user-agent')`)
into `authService.login`:

```ts
await this.deviceSessionRepo.save({
  userId: user.id,
  deviceName: parseDeviceName(userAgent),  // e.g. via `ua-parser-js`
  deviceType: parseDeviceType(userAgent),  // 'desktop' | 'phone' | 'tablet'
  ipAddress: ip,
  userAgent,
  isActive: true,
  lastActiveAt: new Date(),
});
```

Two things to get right:

- **Tie the session to the refresh token**, so revoking a device actually kills it.
  A `refreshTokenId` FK on `device_sessions` (or storing the `jti`) lets
  `revokeSession` also revoke the matching refresh token. Without that link,
  "sign out this device" just hides a row — the device keeps working, which is worse
  than not offering the button.
- **Bump `lastActiveAt`** on refresh, or every row will read as stale.

Also note `device_sessions` is not auto-created by `synchronize: true` in a fresh
environment. `DeviceSession` *is* registered in `UsersModule.forFeature` now, so it
should be created — but our local table was made by hand-written DDL before that, so
I can't confirm it works from scratch. Worth testing on a clean database.

---

## 3. Missing: influencer audience metrics

**Needs:** `GET /admin/influencers/:id/audience`
**Blocks:** admin ▸ Influencers ▸ *Audience* tab (currently shows a placeholder)

The UI wants refund rate, paid-vs-free user split, and revenue per subscriber, each
with a month-over-month delta. None of it is derivable from any current endpoint.

```jsonc
{
  "refundRate": "2.4%",
  "paidVsFree": "68%",
  "paidChange": "+4.2%",       // vs previous period
  "revenuePerSub": 149.50
}
```

`refundRate` can come from `payments.refund_amount` / `payments.amount` over the
window. The paid-vs-free split needs a join from conversions to whether that user
holds an active subscription. Admin-only.

---

## 4. Missing: influencer payment history (admin view)

**Needs:** `GET /admin/influencers/:id/payments`
**Blocks:** admin ▸ Influencers ▸ *Payments* tab (placeholder)

`GET /payments/me` is scoped to the caller, so an **admin cannot read another user's
payments** — there's no admin-scoped equivalent. Same for `/earnings/*`, which is
implicitly "my earnings".

```jsonc
{
  "summary": {
    "paymentModel": "Commission",
    "commission": "15%",
    "totalPaid": 45000,
    "pending": 12000
  },
  "history": [
    {
      "id": "uuid",
      "campaignName": "Diwali Special",
      "startingDate": "2026-01-12",
      "commissionEarned": 4500,
      "totalClicks": 1240,
      "method": "BANK_TRANSFER",
      "status": "COMPLETED"
    }
  ]
}
```

The cheapest version of this is an admin-scoped variant of the existing
`getUserPayments(userId)` — most of the query already exists.

---

## 5. Missing: campaign financials (partially exists)

**Needs:** extend `GET /campaigns/:id/overview`, or add `/campaigns/:id/financials`
**Blocks:** admin ▸ Campaigns ▸ drawer ▸ *Financials* tab — **partially working**

`overview` already gives me `stats.totalCommission` and `stats.daily.conversions`, so
I'm rendering **Influencer Commission** and the trend chart from real data. But these
tiles have no source and currently render `—`:

| Tile | Why it's missing |
|---|---|
| Total Revenue | no gross revenue attributed per campaign |
| Total Profit | needs revenue − commission − costs |
| Profit Margin | derived from the above |
| Total Payable | needs payout state per campaign |
| Paid | needs payout state per campaign |
| Taxes | no tax model anywhere in the schema |

Revenue is the important one and looks reachable: `conversions` presumably links a
campaign to a payment, so `SUM(payments.amount)` grouped by campaign should give gross
revenue. Payable/Paid need payouts joined to campaigns.

Tax I suspect is a product decision, not a coding one — is there even a tax model
planned? If not, say so and I'll drop the tile from the design rather than leave a
permanent `—`.

---

## 6. Missing: magazine performance

**Needs:** `GET /magazines/:id/performance`
**Blocks:** admin ▸ Publications ▸ drawer ▸ *Performance* tab (placeholder)

Wants a subscriber-gain and views time series, plus average reading time. **None of
this is tracked server-side today** — there's no view/read event table at all, so this
is not a query, it's a feature: you'd need a `magazine_view_events` table
(`magazineId`, `userId`, `openedAt`, `durationSeconds`) and an endpoint for the reader
to report against.

Biggest item in this doc. Worth confirming it's actually wanted before building it —
if it's speculative, I'd rather cut the tab.

```jsonc
{
  "chart": { "labels": ["Mon", "Tue"], "subscriberGain": [12, 18], "views": [340, 410] },
  "avgTimePerUser": "4m 32s"
}
```

---

## 7. Missing: magazine financials

**Needs:** `GET /magazines/:id/financials`
**Blocks:** admin ▸ Publications ▸ drawer ▸ *Financials* tab (placeholder)

Payments already carry `relatedType` / `relatedId`, so per-magazine revenue should be
a `WHERE related_type = 'magazine' AND related_id = :id` aggregate — probably the
easiest item in this document.

```jsonc
{ "totalRevenue": 125000, "totalProfit": 89000, "subscribers": 340, "refunds": 2400 }
```

---

## 8. Missing: magazine version history

**Needs:** `GET /magazines/:id/versions`
**Blocks:** admin ▸ Publications ▸ Edit ▸ *Magazine Updates* panel (placeholder)

`PATCH /magazines/:id` updates in place with no revision trail, so there's nothing to
list. Needs a `magazine_versions` row written on each update.

```jsonc
[{ "version": 3, "updatedAt": "2026-02-01T10:00:00Z", "updatedBy": "Naman", "note": "Cover replaced" }]
```

Low priority from our side — happy to hide the panel if you'd rather not keep history.

---

## 9. Missing: single payment status (post-checkout confirmation)

**Needs:** `GET /payments/:id` — or `GET /payments/by-order/:orderId`

Because confirmation is webhook-driven, the browser has no way to know when a payment
actually settles. Right now after checkout we show *"Payment received — we'll confirm
it shortly"*, which is honest but weak. With this endpoint we can poll for a few
seconds and show a real confirmation.

`POST /payments/create-order` already returns `orderId` and stores it as
`paymentProviderId`, so lookup by order id is a one-line query.

```jsonc
{ "id": "uuid", "status": "COMPLETED", "amount": 149, "paidAt": "2026-02-01T10:00:00Z" }
```

---

## 10. Minor: campaign list can't be filtered by influencer

`CampaignQueryDto` accepts `status`, `page`, `limit`. For non-admins `findAll` scopes
to the caller, but an **admin has no way to fetch one influencer's campaigns** — so we
currently pull `limit: 100` and filter client-side. Works, but it breaks past 100
campaigns and ships data the page doesn't need.

Adding `@IsOptional() @IsUUID() influencerId?: string` to the DTO and
`if (isAdmin && query.influencerId) where.influencerId = query.influencerId` to the
service would fix it. ~3 lines.

---

## 11. 🟠 Deployed `CORS_ORIGINS` excludes localhost — blocks all local dev

Verified against `http://13.204.191.64:3000` on 2026-08-22. A preflight from any
localhost origin comes back **204 with no `Access-Control-Allow-Origin` header**:

```
$ curl -i -X OPTIONS http://13.204.191.64:3000/api/v1/auth/login \
    -H 'Origin: http://localhost:3001' \
    -H 'Access-Control-Request-Method: POST'
HTTP/1.1 204 No Content
Vary: Origin
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With
          <- no Access-Control-Allow-Origin
```

Tested `localhost:3001`, `:5173`, `:3000` and `:4173` — all rejected. `main.ts` reads
`CORS_ORIGINS` (falling back to `http://localhost:3001`), so the EC2 environment must
be setting it to production-only origins. The browser therefore blocks every call,
even though the API itself answers fine over curl.

**Not blocking us any more** — we now route dev traffic through a Vite proxy, so the
browser makes a same-origin request to `localhost:3001` and Vite forwards it
server-side where CORS does not apply. No backend change is strictly required.

Still worth adding `http://localhost:3001` to `CORS_ORIGINS` on the EC2 instance: any
other client (a second frontend, Swagger-from-browser, a mobile web build, anyone
debugging against the deployed API) hits the same wall with a confusing error.

---

## 12. 🔴 No resend-OTP endpoint, and an abandoned signup locks the email forever

`POST /auth/signup/step1` creates the user row and emails an OTP. If the user never
completes `step2` — closes the tab, OTP expires, email never arrives — that email
address becomes **permanently unusable**:

```
$ curl -X POST .../auth/signup/step1 -d '{"email":"pending@example.com", ...}'
{"success":false,"message":"Email is already registered","error":{"code":"Conflict"}}  # 409
```

They cannot retry signup (409), and cannot log in either — `step2` is what sets the
password, so the account has no credentials. There is no route out of this state from
the UI. Anyone whose OTP email lands in spam is simply stuck.

There is also no resend endpoint anywhere in the spec — I checked every path for
`resend`/`otp`; only `/auth/verify-email` exists, and that needs an OTP the user never
got. So the **"Resend Verification Code" control on our signup screen has nothing to
call** and is currently inert.

Two things needed:

1. `POST /auth/signup/resend-otp` — body `{ email }`; regenerates and re-sends the OTP
   for a user who exists but is not yet verified. Rate-limit it (e.g. 1/60s).
   Response `{ message, email }`, matching `step1`.
2. Make `step1` idempotent for an **unverified** user: instead of 409, refresh the
   pending record and re-send the OTP. Keep the 409 only when
   `is_email_verified = true`. That alone fixes the lockout.

Once (1) exists I'll wire the resend button; right now I've left it inert rather than
pointing it at `step1`, which would just surface "Email is already registered".

**Also confirmed:** `step1` does not return the OTP in the deployed environment (it
does locally). That's correct for production — just noting that signup there depends
entirely on the outbound email actually being delivered, which we can't verify from
the frontend.

---
## Suggested order

| # | Item | Why this position |
|---|---|---|
| 1 | Webhook signature verification | Live exploit — free subscriptions |
| 2 | 2FA (or hide it) | Ships a false security promise |
| 3 | Write device sessions on login (#2b) | Endpoints exist but return empty forever |
| 4 | `influencerId` filter (#10) | ~3 lines |
| 5 | Magazine financials (#7) | Mostly an aggregate over existing data |
| 6 | Payment status (#9) | Small, closes the checkout loop |
| 7 | Influencer payments (#4) | Reuses existing query, admin-scoped |
| 8 | Campaign financials (#5) | Partly done already |
| 9 | Influencer audience (#3) | New aggregation work |
| 10 | Magazine performance (#6) | New event-tracking subsystem |
| 11 | Version history (#8) | New table; lowest value |

If #6 and #8 aren't planned, tell me and I'll remove those tabs from the UI instead of
leaving placeholders in the product.

## What the frontend has already done

- All 54 client-callable endpoints are wired, including everything from `a7934d3`
  (`change-password`, `2fa/*`, `me/devices`, `me/avatar`, `payments/create-order`).
- Razorpay now calls the real `/payments/create-order` with the correct DTO. The
  fictional `/verify-payment` call is gone; we rely on your webhook.
- Every screen above degrades to an explicit "not available yet" placeholder instead
  of an infinite spinner, so nothing looks broken while these land.
- No frontend work is blocked on anything except the items in this document.
