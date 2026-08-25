import { useEffect, useState } from 'react';
import Drawer from '@/components/ui/drawer';
import Button from '@/components/Button.jsx';
import { TrashIcon } from '@/components/ui/icons';
import { confirmDelete } from '@/lib/confirm';
import SupportLink from '@/components/SupportLink';

function CheckBadge() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M8.5 12.5l2.2 2.2 4.3-4.6" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

/**
 * Slide-in panel for creating or editing a campaign promo code.
 * `mode="create"` shows a "Publish Promo Code" action; `mode="edit"` re-uses
 * the same screen but the action becomes "Republish Promo Code".
 */
export default function PromoCodeDrawer({
  open,
  onClose,
  mode = 'create',
  initialCode = '',
  initialDiscount = '',
  onSubmit,
  onDelete,
}) {
  const [code, setCode] = useState(initialCode);
  const [discount, setDiscount] = useState(initialDiscount);

  // Re-seed the fields every time the drawer is (re)opened.
  useEffect(() => {
    if (open) {
      setCode(initialCode);
      setDiscount(initialDiscount);
    }
  }, [open, initialCode, initialDiscount]);

  const isValid = code.trim().length > 0;
  const submitLabel = mode === 'edit' ? 'Republish Promo Code' : 'Publish Promo Code';

  function handleSubmit() {
    if (!isValid) return;
    onSubmit?.({ code: code.trim(), discount: Number(discount) || 0 });
  }

  async function handleDelete() {
    const ok = await confirmDelete({
      title: 'Delete this promo code?',
      text: "This will remove the promo code from this campaign. This action can't be undone.",
      confirmButtonText: 'Yes, delete it',
    });
    if (ok) onDelete?.();
  }

  const footer = (
    <div className="space-y-3">
      <Button text={submitLabel} handler={handleSubmit} width="100%" />
      {mode === 'edit' && (
        <button
          type="button"
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          Delete Promo Code
        </button>
      )}
      <p className="text-center text-xs text-slate-400">
        Trouble in getting code?{' '}
        <SupportLink className="font-semibold text-slate-600 hover:text-slate-900">Connect Support</SupportLink>
      </p>
    </div>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Campaign Promo Code" footer={footer}>
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-sky-300 via-sky-400 to-blue-500 p-5 mb-6">
        <div className="absolute -right-4 -top-4 text-7xl opacity-90 select-none">🪙</div>
        <div className="absolute right-8 bottom-3 text-2xl opacity-80 select-none">💸</div>
        <h3 className="relative text-xl font-bold text-white leading-snug max-w-60">
          Create a Promo Code &amp; Earn on Every Purchase
        </h3>
      </div>

      {/* Promo Code */}
      <label className="block mb-5">
        <span className="block text-sm font-medium text-slate-700 mb-1.5">Promo Code</span>
        <div className="relative">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Atharv100"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          />
          {isValid && (
            <span className="absolute inset-y-0 right-3 flex items-center text-emerald-500">
              <CheckBadge />
            </span>
          )}
        </div>
      </label>

      {/* Promo Code Amount Discount */}
      <label className="block">
        <span className="block text-sm font-medium text-slate-700 mb-1.5">Promo Code Amount Discount</span>
        <div className="relative">
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="18"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <button
            type="button"
            onClick={() => setDiscount('')}
            aria-label="Reset discount"
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <RefreshIcon />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5">Please add the numbers. It will be default in INR</p>
      </label>
    </Drawer>
  );
}
