import React, { useState } from 'react';
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6';
import Button from '@/components/Button.jsx';
import PromoCodeDrawer from '@/components/influencers/PromoCodeDrawer';
import ShareCampaignDrawer from '@/components/influencers/ShareCampaignDrawer';
import { toastSuccess } from '@/lib/confirm';

const CAMPAIGN_LINK = 'Atharv21i1313oqdq';

const SERIES = {
  click: { label: 'Click', color: '#4F46E5' },
  conversions: { label: 'Conversions', color: '#A78BFA' },
  earnings: { label: 'Campaign Earnings', color: '#34D399' },
};

const chartData = [
  { name: 'Jan', click: 5000, conversions: 1200, earnings: 1000 },
  { name: 'Feb', click: 8000, conversions: 3200, earnings: 2400 },
  { name: 'Mar', click: 7000, conversions: 5400, earnings: 2100 },
  { name: 'Apr', click: 12000, conversions: 4200, earnings: 6800 },
  { name: 'May', click: 9000, conversions: 8800, earnings: 5200 },
  { name: 'Jun', click: 16000, conversions: 3200, earnings: 9800 },
  { name: 'Jul', click: 14000, conversions: 9800, earnings: 7400 },
  { name: 'Aug', click: 18000, conversions: 6400, earnings: 11200 },
  { name: 'Sep', click: 17000, conversions: 10200, earnings: 9600 },
  { name: 'Oct', click: 21000, conversions: 8200, earnings: 13400 },
  { name: 'Nov', click: 20000, conversions: 12400, earnings: 11800 },
  { name: 'Dec', click: 23000, conversions: 9800, earnings: 14600 },
];

const commissionTrend = [12, 18, 14, 22, 19, 28, 24, 26, 23, 31, 29, 40].map((v) => ({ v }));

function LegendDot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function ShareButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Share campaign"
      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    </button>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-center">
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function CampaignDetails() {
  // null = no promo code yet (shows "Create New Promo Code" flow);
  // an object = promo code created (shows promo stats + "Edit Promo Code").
  const [promo, setPromo] = useState(null);
  // 'create' | 'edit' | null (closed)
  const [promoDrawer, setPromoDrawer] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);

  function handlePromoSubmit({ code, discount }) {
    setPromo((prev) => ({ used: prev?.used ?? 1213, ...prev, code, discount }));
    setPromoDrawer(null);
  }

  function handlePromoDelete() {
    setPromo(null);
    setPromoDrawer(null);
    toastSuccess('Promo code deleted');
  }

  return (
    <div className="p-1">
      {/* Header + main chart */}
      <div className="bg-[#faf9fb] rounded-2xl border border-slate-200 p-5 mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-slate-400">Campaign Name</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Ramdoot magazine promo Atharv</h1>
            <div className="flex items-center gap-4 mt-2">
              {Object.values(SERIES).map((s) => (
                <LegendDot key={s.label} color={s.color} label={s.label} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!promo && (
              <Button text="Create New Promo Code" handler={() => setPromoDrawer('create')} />
            )}
            <ShareButton onClick={() => setShareOpen(true)} />
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e9e7ec" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="click" stroke={SERIES.click.color} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="conversions" stroke={SERIES.conversions.color} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="earnings" stroke={SERIES.earnings.color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Total Commission Earned (spans both rows) */}
        <div className="lg:row-span-2 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
          <p className="text-xs text-slate-400">Total Commission Earned</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹ 12,000</p>
          <div className="flex-1 min-h-36 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={commissionTrend} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#34D399" strokeWidth={2} fill="url(#commissionGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <InfoCard label="Campaign Start Date" value="30 December 2025" />
        <InfoCard label="Campaign End Date" value="Ongoing" />

        {/* Campaign Sharing Medium */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-center">
          <p className="text-xs text-slate-400 mb-3">Campaign Sharing Medium</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-16 h-9 rounded-full text-white bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <FaInstagram className="w-4 h-4" />
            </span>
            <span className="flex items-center justify-center w-16 h-9 rounded-full text-white bg-green-500">
              <FaWhatsapp className="w-4 h-4" />
            </span>
          </div>
        </div>

        <InfoCard label="Available Balance Withdraw" value="₹9,237" />
      </div>

      {/* Promo code details (only once a promo code is created) */}
      {promo && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-5">
          <InfoCard label="Promo Code Used" value={promo.used.toLocaleString('en-IN')} />
          <InfoCard label="Promo Code Discount" value={`₹${promo.discount}`} />

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Promo Code</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">{promo.code}</span>
                <button
                  type="button"
                  aria-label="Copy promo code"
                  onClick={() => navigator.clipboard?.writeText(promo.code)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>
            <Button text="Edit Promo Code" handler={() => setPromoDrawer('edit')} />
          </div>
        </div>
      )}

      <PromoCodeDrawer
        open={promoDrawer !== null}
        mode={promoDrawer === 'edit' ? 'edit' : 'create'}
        initialCode={promoDrawer === 'edit' ? promo?.code ?? '' : ''}
        initialDiscount={promoDrawer === 'edit' ? promo?.discount ?? '' : ''}
        onClose={() => setPromoDrawer(null)}
        onSubmit={handlePromoSubmit}
        onDelete={handlePromoDelete}
      />

      <ShareCampaignDrawer
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        campaignLink={CAMPAIGN_LINK}
        promoCode={promo?.code}
      />
    </div>
  );
}
