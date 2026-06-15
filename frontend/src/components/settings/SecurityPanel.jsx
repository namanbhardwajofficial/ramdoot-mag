import { useState } from 'react';
import Button from '@/components/Button.jsx';
import { Field, inputCls, PanelHeader } from './fields';

export default function SecurityPanel() {
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const set = (key) => (e) => setPw((p) => ({ ...p, [key]: e.target.value }));

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
        <Button text="Update Password" handler={() => {}} width="100%" />
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-bold text-slate-900">Add 2FA</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">Add an extra layer of security to your account</p>
        <Button text="Add 2 Factor Authentication" handler={() => {}} width="100%" />
      </div>
    </div>
  );
}
