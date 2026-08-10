import { useState } from 'react';
import Button from '@/components/Button.jsx';
import { Field, inputCls, PanelHeader } from './fields';
import useSecurity from '@/hooks/useSecurity';

export default function SecurityPanel() {
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [code, setCode] = useState('');
  const set = (key) => (e) => setPw((p) => ({ ...p, [key]: e.target.value }));

  const {
    savingPassword,
    changePassword,
    twoFactor,
    twoFactorBusy,
    startTwoFactor,
    confirmTwoFactor,
    cancelTwoFactor,
  } = useSecurity();

  async function handleUpdatePassword() {
    if (await changePassword(pw)) setPw({ current: '', next: '', confirm: '' });
  }

  async function handleConfirm2fa() {
    if (await confirmTwoFactor(code)) setCode('');
  }

  return (
    <div className="max-w-xl">
      <PanelHeader title="Security" subtitle="Manage your password and two-factor authentication" />

      <div className="space-y-5">
        <Field label="Password">
          <input type="password" className={inputCls} value={pw.current} onChange={set('current')} placeholder="Current password" />
        </Field>
        <Field label="New Password">
          <input type="password" className={inputCls} value={pw.next} onChange={set('next')} placeholder="••••••••" />
        </Field>
        <Field label="Confirm New Password" required>
          <input type="password" className={inputCls} value={pw.confirm} onChange={set('confirm')} placeholder="••••••••" />
        </Field>
        <Button text="Update Password" handler={handleUpdatePassword} loading={savingPassword} width="100%" />
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-bold text-slate-900">Add 2FA</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">Add an extra layer of security to your account</p>

        {!twoFactor ? (
          <Button
            text="Add 2 Factor Authentication"
            handler={startTwoFactor}
            loading={twoFactorBusy}
            width="100%"
          />
        ) : (
          // Step 2 of enrolment: the backend handed back a secret + otpauth URI.
          // Until a QR renderer is added, show the secret for manual entry.
          <div className="space-y-4 rounded-xl border border-slate-200 p-4">
            <div>
              <p className="text-sm text-slate-600">
                Add this key to your authenticator app, then enter the 6-digit code it shows.
              </p>
              <code className="mt-2 block break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-800">
                {twoFactor.secret}
              </code>
            </div>
            <Field label="Authentication code" required>
              <input
                className={inputCls}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </Field>
            <div className="flex gap-3">
              <Button text="Verify & Enable" handler={handleConfirm2fa} loading={twoFactorBusy} width="100%" />
              <button
                type="button"
                onClick={() => {
                  cancelTwoFactor();
                  setCode('');
                }}
                className="shrink-0 px-3 text-sm text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
