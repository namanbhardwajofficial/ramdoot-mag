import { useState } from 'react';
import Modal from '@/components/ui/modal';
import Button from '@/components/Button.jsx';

/**
 * Create a campaign for one influencer.
 *
 * The "Create Campaigns" buttons on the influencer detail view and the admin
 * dashboard were wired to `() => {}` — `POST /campaigns` and
 * `campaignsApi.create` both already existed, there was just no form to reach
 * them from.
 *
 * The DTO, probed live on 2026-08-25:
 *   required — name (string), startDate + endDate (ISO 8601)
 *   optional — influencerId, promoCode, sharingMediums[], commissionRate
 */

const MEDIUMS = ['instagram', 'facebook', 'whatsapp', 'youtube', 'twitter'];

const inputCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300';

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </label>
  );
}

// `<input type="date">` gives us yyyy-mm-dd; the API wants a full ISO string.
function toIso(day) {
  return day ? new Date(`${day}T00:00:00.000Z`).toISOString() : undefined;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function CreateCampaignModal({ influencer, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    promoCode: '',
    startDate: today(),
    endDate: '',
    commissionRate: '15',
    sharingMediums: ['instagram'],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function toggleMedium(m) {
    setForm((f) => ({
      ...f,
      sharingMediums: f.sharingMediums.includes(m)
        ? f.sharingMediums.filter((x) => x !== m)
        : [...f.sharingMediums, m],
    }));
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Give the campaign a name.');
    if (!form.startDate || !form.endDate) return setError('Both dates are required.');
    if (new Date(form.endDate) < new Date(form.startDate)) {
      return setError('The end date cannot be before the start date.');
    }

    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        startDate: toIso(form.startDate),
        endDate: toIso(form.endDate),
        ...(influencer?.id ? { influencerId: influencer.id } : {}),
        ...(form.promoCode.trim() ? { promoCode: form.promoCode.trim().toUpperCase() } : {}),
        ...(form.sharingMediums.length ? { sharingMediums: form.sharingMediums } : {}),
        // The API stores this as a fraction (0.1500 == 15%).
        ...(form.commissionRate ? { commissionRate: Number(form.commissionRate) / 100 } : {}),
      });
    } catch (err) {
      // Keep the modal open so the entered details are not lost.
      setError(err.message || 'Could not create the campaign');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose}>
      {/* Modal is a bare shell — it supplies the overlay and the close button
          only, so the padding, heading and scroll cap live here. */}
      <form onSubmit={handleSubmit} className="max-h-[85vh] space-y-4 overflow-y-auto p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Create Campaign</h2>
          {influencer && (
            <p className="text-sm text-slate-500">
              For <span className="font-medium text-slate-800">{influencer.name || influencer.fullName}</span>
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Field label="Campaign name" required>
          <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Festival Special Promo" />
        </Field>

        <Field label="Promo code" hint="Leave blank and the backend generates one">
          <input
            className={`${inputCls} uppercase`}
            value={form.promoCode}
            onChange={set('promoCode')}
            placeholder="ARUNFEST"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date" required>
            <input type="date" className={inputCls} value={form.startDate} onChange={set('startDate')} />
          </Field>
          <Field label="End date" required>
            <input type="date" className={inputCls} value={form.endDate} onChange={set('endDate')} min={form.startDate} />
          </Field>
        </div>

        <Field label="Commission rate" hint="Percentage of each attributed sale">
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              className={`${inputCls} pr-8`}
              value={form.commissionRate}
              onChange={set('commissionRate')}
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">%</span>
          </div>
        </Field>

        <Field label="Sharing mediums">
          <div className="flex flex-wrap gap-2">
            {MEDIUMS.map((m) => {
              const on = form.sharingMediums.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMedium(m)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    on
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <Button text="Create Campaign" type="submit" loading={saving} handler={handleSubmit} />
        </div>
      </form>
    </Modal>
  );
}
