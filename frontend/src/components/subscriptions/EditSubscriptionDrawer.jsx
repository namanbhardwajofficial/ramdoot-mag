import { useState, useEffect } from 'react';
import Drawer from '@/components/ui/drawer';
import { ORG, SUBSCRIPTION_STATUSES } from '@/config/constants';

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400';

/**
 * Slide-in drawer for editing a subscription's plan, status and owner.
 * Opened from the edit (pen) action in the admin Subscription List.
 */
export default function EditSubscriptionDrawer({
  open,
  subscription,
  plans = [],
  saving = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({ planId: '', status: '', createdBy: '' });

  // Reset the form whenever a different subscription is opened.
  useEffect(() => {
    if (subscription) {
      setForm({
        planId: subscription.planId ?? plans[0]?.id ?? '',
        status: subscription.status ?? SUBSCRIPTION_STATUSES.ACTIVE,
        createdBy: subscription.createdBy ?? '',
      });
    }
  }, [subscription, plans]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Edit Subscription"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-subscription-form"
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      }
    >
      {subscription && (
        <form
          id="edit-subscription-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <p className="text-xs text-slate-400">Subscription ID</p>
            <p className="font-mono text-sm text-slate-700">
              #{subscription.id.replace('sub_', '')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Plan</label>
            <select value={form.planId} onChange={set('planId')} className={inputCls}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {ORG.currencySymbol}
                  {(p.priceInPaise / 100).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={form.status} onChange={set('status')} className={inputCls}>
              {Object.values(SUBSCRIPTION_STATUSES).map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Created/updated by
            </label>
            <input
              value={form.createdBy}
              onChange={set('createdBy')}
              placeholder="Name"
              className={inputCls}
            />
          </div>
        </form>
      )}
    </Drawer>
  );
}
