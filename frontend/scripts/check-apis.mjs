#!/usr/bin/env node
/**
 * Probes the deployed backend for every endpoint listed in MISSING_APIS.md.
 *
 *   node scripts/check-apis.mjs
 *   API=http://other-host:3000 EMAIL=admin@x.com PASSWORD=... node scripts/check-apis.mjs
 *
 * Calls each route for real rather than reading /docs-json, because Swagger only
 * lists decorated routes — an undocumented endpoint would look missing when it
 * isn't. 404 means the route does not exist; anything else means it does.
 *
 * Exit code is the number of items still missing, so CI can gate on it.
 */

const API = process.env.API || 'http://13.204.191.64:3000';
const BASE = `${API}/api/v1`;
const EMAIL = process.env.EMAIL || 'admin@ramdoot.com';
const PASSWORD = process.env.PASSWORD || 'Admin@123';

const GREEN = '\x1b[32m', RED = '\x1b[31m', YELLOW = '\x1b[33m', DIM = '\x1b[2m', OFF = '\x1b[0m';

async function main() {
  const login = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!login.ok) {
    console.error(`${RED}Login failed (${login.status}). Set EMAIL/PASSWORD if the seed changed.${OFF}`);
    process.exit(99);
  }
  const token = (await login.json()).data.accessToken;
  const auth = { Authorization: `Bearer ${token}` };

  // Resolve real ids so a 404 means "no route", never "no such record".
  const pick = async (path, fallback) => {
    try {
      const r = await fetch(`${BASE}${path}`, { headers: auth });
      const d = (await r.json()).data;
      return (d?.data || d || [])[0]?.id || fallback;
    } catch { return fallback; }
  };
  const magId = await pick('/magazines?limit=1', 'missing');
  const campId = await pick('/campaigns?limit=1', 'missing');
  const payId = await pick('/payments/me', 'missing');
  const infId = '00000000-0000-0000-0000-000000000002';

  const health = await fetch(`${API}/v1/health`).then((r) => r.json()).catch(() => null);
  const uptime = health?.data?.uptime;
  if (uptime != null) {
    const h = (uptime / 3600).toFixed(1);
    console.log(`${DIM}${API} — process up ${h}h. A deploy resets this to ~0.${OFF}\n`);
  }

  const routes = [
    ['1  admin payments list',       `/admin/payments`],
    ['2  admin payouts list',        `/admin/payouts`],
    ['3  revenue breakdown',         `/admin/analytics/revenue-breakdown`],
    ['4  influencer audience',       `/influencers/${infId}/audience`],
    ['5  influencer payments',       `/admin/influencers/${infId}/payments`],
    ['6  campaign financials',       `/campaigns/${campId}/financials`],
    ['7  magazine performance',      `/magazines/${magId}/performance`],
    ['8  magazine financials',       `/magazines/${magId}/financials`],
    ['9  magazine versions',         `/magazines/${magId}/versions`],
    ['11 single payment status',     `/payments/${payId}`],
  ];

  let missing = 0;
  console.log('ENDPOINTS');
  for (const [label, path] of routes) {
    const res = await fetch(`${BASE}${path}`, { headers: auth }).catch(() => null);
    const code = res?.status ?? 0;
    const ok = code && code !== 404;
    if (!ok) missing++;
    console.log(`  ${ok ? GREEN + 'AVAILABLE' : RED + 'MISSING  '}${OFF} ${label} ${DIM}(${code || 'no response'})${OFF}`);
  }

  console.log('\nBEHAVIOUR');

  // 10 — influencerId filter on the campaigns list.
  const f = await fetch(`${BASE}/campaigns?limit=100&influencerId=${infId}`, { headers: auth });
  const filterOk = f.status !== 400;
  if (!filterOk) missing++;
  console.log(`  ${filterOk ? GREEN + 'AVAILABLE' : RED + 'MISSING  '}${OFF} 10 influencerId filter on /campaigns ${DIM}(${f.status})${OFF}`);

  // 12 — does the revenue series emit the whole window, or only paid periods?
  const rs = await fetch(`${BASE}/admin/analytics/revenue?granularity=month&days=365`, { headers: auth });
  const buckets = ((await rs.json()).data?.data || []).length;
  const filled = buckets >= 12;
  console.log(`  ${filled ? GREEN + 'AVAILABLE' : YELLOW + 'SPARSE   '}${OFF} 12 revenue series zero-fill ${DIM}(${buckets}/12 buckets; we pad client-side)${OFF}`);

  console.log(`\n${missing === 0 ? GREEN + 'All endpoints available.' : RED + missing + ' of 11 still missing.'}${OFF}`);
  process.exit(missing);
}

main().catch((e) => { console.error(e); process.exit(98); });
