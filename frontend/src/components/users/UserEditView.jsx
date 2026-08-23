import { useState } from 'react';
import StatusBadge from '@/components/ui/status-badge';
import SuspendUserDrawer from '@/components/users/SuspendUserDrawer';
import { toastError } from '@/lib/confirm';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspend Users' },
  { value: 'blocked', label: 'Block User' },
  { value: 'inactive', label: 'Inactive' },
];

const ROLE_OPTIONS = ['Subscriber', 'Influencer', 'Editor', 'Admin'];
const COUNTRY_CODES = ['US', 'IN', 'UK', 'AU'];

const inputCls =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function WarningBanner({ status }) {
  const isBlock = status === 'blocked';
  return (
    <div className="flex items-center gap-4 rounded-xl border border-red-200 bg-red-50/60 px-5 py-4 mb-6">
      <svg className="w-10 h-10 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L1 21h22L12 2zm0 14a1 1 0 110 2 1 1 0 010-2zm-1-7h2v6h-2V9z" />
      </svg>
      <div>
        <div className="text-lg font-bold text-red-600">{isBlock ? 'Block User' : 'Suspending user'}</div>
        <p className="text-sm text-red-500">This action will immediately revoke user access. User will be notified by email.</p>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-800 mb-1.5">
        {label}{required && <span className="text-slate-400"> *</span>}
      </label>
      {children}
    </div>
  );
}

export default function UserEditView({ user, updateUser, suspendUser, onCancel, onSaved, onExit }) {
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    countryCode: 'US',
    phone: user.phone || '',
    dob: user.dob || '',
    status: user.status || 'active',
    role: user.role || 'Subscriber',
  });
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const isRisky = form.status === 'suspended' || form.status === 'blocked';

  async function handleSave() {
    if (isRisky) { setDrawerOpen(true); return; }
    setSaving(true);
    try {
      const updated = await updateUser(user.id, form);
      onSaved(updated);
    } catch (err) {
      toastError(err.message || 'Could not save changes');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0 select-none">
            {getInitials(form.name)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              <StatusBadge status={user.status} />
            </div>
            <div className="text-sm text-slate-400 mb-1">#{user.id?.replace('user_', '') ?? user.id}</div>
            <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
              {user.email && <span>{user.email}</span>}
              {user.phone && <span>{user.phone}</span>}
              {user.location && <span>{user.location}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={onCancel} className="px-5 py-2 text-sm font-medium text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
            {!saving && (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isRisky && <WarningBanner status={form.status} />}

      <div className="flex gap-4 flex-wrap">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 min-w-72">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" required>
              <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Email" required>
              <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Phone NO" required>
              <div className="flex">
                <select
                  value={form.countryCode}
                  onChange={(e) => set('countryCode', e.target.value)}
                  className="border border-slate-300 border-r-0 rounded-l-lg px-2 text-sm text-slate-700 focus:outline-none"
                >
                  {COUNTRY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  className="w-full border border-slate-300 rounded-r-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
            </Field>
            <Field label="Date Of Birth" required>
              <input className={inputCls} value={form.dob} onChange={(e) => set('dob', e.target.value)} placeholder="DD/MM/YYYY" />
            </Field>
          </div>
        </div>

        {/* Account Access */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex-1 min-w-72">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">Account Access</h3>
          <div className="space-y-4">
            <Field label="Account Status">
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className={`${inputCls} ${isRisky ? 'border-red-400 focus:ring-red-200' : ''}`}
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Role">
              <select value={form.role} onChange={(e) => set('role', e.target.value)} className={inputCls}>
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </div>

      <SuspendUserDrawer
        open={drawerOpen}
        user={user}
        action={form.status}
        onClose={() => setDrawerOpen(false)}
        onConfirm={(payload) => suspendUser(user.id, payload)}
        onFinished={onExit}
      />
    </>
  );
}
