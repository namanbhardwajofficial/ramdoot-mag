import Drawer from '@/components/ui/drawer';
import { toastSuccess } from '@/lib/confirm';
import SupportLink from '@/components/SupportLink';

function CopyIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CopyField({ label, value }) {
  function handleCopy() {
    navigator.clipboard?.writeText(value);
    toastSuccess('Copied to clipboard');
  }

  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
      <div className="relative">
        <input
          readOnly
          value={value}
          onFocus={(e) => e.target.select()}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${label.toLowerCase()}`}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700"
        >
          <CopyIcon />
        </button>
      </div>
    </label>
  );
}

/**
 * Slide-in panel for sharing a campaign. Surfaces the shareable campaign link
 * (always) and the promo code (only when one has been created), each with a
 * one-tap copy action.
 */
export default function ShareCampaignDrawer({ open, onClose, campaignLink, promoCode }) {
  const footer = (
    <p className="text-center text-xs text-slate-400">
      Trouble in getting code?{' '}
      <SupportLink className="font-semibold text-slate-600 hover:text-slate-900">Connect Support</SupportLink>
    </p>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Share Campaign" footer={footer}>
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-sky-300 via-sky-400 to-blue-500 p-5 mb-6">
        <div className="absolute -right-3 -top-3 text-6xl opacity-90 select-none">📣</div>
        <div className="absolute right-10 bottom-3 text-2xl opacity-80 select-none">💸</div>
        <h3 className="relative text-xl font-bold text-white leading-snug max-w-60">
          Share Campaign &amp; Start Earning Instantly
        </h3>
      </div>

      <div className="space-y-5">
        <CopyField label="Campaign Link" value={campaignLink} />
        {promoCode && <CopyField label="Promo Code" value={promoCode} />}
      </div>
    </Drawer>
  );
}
