import { useState } from 'react';
import { toastError } from '@/lib/confirm';

const DURATIONS = ['1 Day', '3 Days', '7 Days', '14 Days', '30 Days'];
const REASONS = [
  'No Specified',
  'Payment failure',
  'Policy violation',
  'Spam / Abuse',
  'User requested',
  'Other',
];

const ArrowIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export default function SuspendUserDrawer({ open, user, action = 'suspended', onClose, onConfirm, onFinished }) {
  const [duration, setDuration] = useState('7 Days');
  const [reason, setReason] = useState('No Specified');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open || !user) return null;

  const isBlock = action === 'blocked';
  const title = isBlock ? 'Block User' : 'Suspend User';

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm({ status: action, duration, reason, note });
      setDone(true);
    } catch (err) {
      toastError(err.message || 'Could not update this user');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setDone(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={handleClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500" aria-label="Close">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {done ? (
          /* ----- Success state ----- */
          <div className="flex-1 px-6">
            <div className="rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-white p-5 flex items-start gap-3">
              <span className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div>
                <div className="font-semibold">Successfully Deactivated</div>
                <p className="text-sm text-white/90 mt-0.5">Deactivate the current subscription plan for all subscriber.</p>
              </div>
            </div>
          </div>
        ) : (
          /* ----- Form state ----- */
          <div className="flex-1 overflow-y-auto px-6">
            <div className="rounded-2xl bg-gradient-to-b from-red-400 to-red-500 text-white p-5 flex items-start gap-3 mb-6">
              <span className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.86 12.14A2 2 0 0116.14 21H7.86a2 2 0 01-2-1.86L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                </svg>
              </span>
              <div>
                <div className="font-semibold">{title}</div>
                <p className="text-sm text-white/90 mt-0.5">This action will deactivate the user profile.</p>
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-800 mb-2">Duration <span className="text-slate-400">*</span></label>
            <div className="flex gap-2 flex-wrap mb-6">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                    duration === d
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-slate-800 mb-2">Reason to Deactivate Account <span className="text-slate-400">*</span></label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 mb-6 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <label className="block text-sm font-medium text-slate-800 mb-2">Additional Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Add a additional note for profile deavtivation."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 space-y-2">
          {done ? (
            <button
              onClick={() => { setDone(false); onFinished(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800"
            >
              Go Home
              <ArrowIcon />
            </button>
          ) : (
            <>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? 'Processing…' : 'Deactivate Account'}
                {!submitting && <ArrowIcon />}
              </button>
              <p className="text-xs text-center text-slate-400">
                Trouble in deactivate account? <span className="text-slate-700 font-medium underline underline-offset-2 cursor-pointer">Connect Us</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
