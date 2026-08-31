import { useState } from 'react';
import { PUBLICATION_STATUSES } from '@/config/constants';

/**
 * Change a magazine's publication status.
 *
 * The admin screens could filter by status but never set one: the only way to
 * move a magazine was "Deactivate" (a one-way trip to PAUSED) or "Delete"
 * (ARCHIVED). Everything else — pulling a live issue back to draft, putting a
 * paused one back on sale, restoring something archived — had no control at
 * all, so a magazine published by mistake could not be unpublished.
 *
 * Statuses are lowercase in the UI and uppercase on the wire; usePublications'
 * `update` does that conversion, so callers pass what they see here.
 *
 * `onChange` should return a promise — the control stays disabled until it
 * settles, and surfaces the backend's own message on failure rather than
 * assuming the change landed.
 */

// Wording for what each move actually does to readers, shown before it runs.
// A status change is not obviously reversible from the label alone, and two of
// these take a magazine away from people who can currently read it.
const CONSEQUENCE = {
  [PUBLICATION_STATUSES.LIVE]: 'Readers on a plan that includes it will be able to open it.',
  [PUBLICATION_STATUSES.DRAFT]: 'It will disappear from the catalogue. Existing readers lose access.',
  [PUBLICATION_STATUSES.SCHEDULED]: 'It stays hidden until its publish date.',
  [PUBLICATION_STATUSES.PAUSED]: 'No new purchases. Current subscribers keep access until their term ends.',
  [PUBLICATION_STATUSES.ARCHIVED]: 'It is removed from the catalogue and the admin list.',
};

const LABEL = {
  [PUBLICATION_STATUSES.LIVE]: 'Live',
  [PUBLICATION_STATUSES.DRAFT]: 'Draft',
  [PUBLICATION_STATUSES.SCHEDULED]: 'Scheduled',
  [PUBLICATION_STATUSES.PAUSED]: 'Paused',
  [PUBLICATION_STATUSES.ARCHIVED]: 'Archived',
};

const ORDER = [
  PUBLICATION_STATUSES.DRAFT,
  PUBLICATION_STATUSES.SCHEDULED,
  PUBLICATION_STATUSES.LIVE,
  PUBLICATION_STATUSES.PAUSED,
  PUBLICATION_STATUSES.ARCHIVED,
];

export default function StatusControl({ status, onChange, disabled = false }) {
  const current = String(status || '').toLowerCase();
  // The status picked in the select but not yet confirmed.
  const [pending, setPending] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function commit(next) {
    setBusy(true);
    setError('');
    try {
      await onChange(next);
      setPending('');
    } catch (err) {
      setError(err?.message || 'Could not change the status.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label htmlFor="magazine-status" className="block text-xs text-slate-500 mb-1">
        Publication status
      </label>

      <select
        id="magazine-status"
        value={pending || current}
        disabled={disabled || busy}
        onChange={(e) => {
          const next = e.target.value;
          if (next === current) {
            setPending('');
            return;
          }
          setPending(next);
          setError('');
        }}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
      >
        {ORDER.map((s) => (
          <option key={s} value={s}>
            {LABEL[s]}
          </option>
        ))}
      </select>

      {/* Confirmation step. Changing what readers can see is not something to
          do on a stray click in a dropdown. */}
      {pending && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-900">
            Change to <strong>{LABEL[pending]}</strong>?
          </p>
          <p className="mt-1 text-xs text-amber-800">{CONSEQUENCE[pending]}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => commit(pending)}
              disabled={busy}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPending('');
                setError('');
              }}
              disabled={busy}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
