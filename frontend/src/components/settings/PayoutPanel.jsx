import { useState } from 'react';
import Button from '@/components/Button.jsx';
import { Field, inputCls, PanelHeader } from './fields';

/**
 * Influencer-only settings tab. Influencers receive money (payouts) rather than
 * pay, so instead of the subscriber "Billings" tab they manage the bank account
 * their campaign payouts are sent to.
 */
export default function PayoutPanel() {
  const [form, setForm] = useState({
    accountHolder: 'Atharv Sevak Kelwadkar',
    accountType: 'Savings',
    bankName: 'HDFC BANK',
    accountNumber: '123456789012',
    confirmAccountNumber: '123456789012',
    ifsc: 'HDFC0001234',
    upi: 'atharv@okaxis',
  });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <PanelHeader title="Payout Details" subtitle="The bank account where your campaign payouts are sent" />

      <div className="space-y-5">
        <Field label="Account Holder Name" required hint="As per bank records">
          <input className={inputCls} value={form.accountHolder} onChange={set('accountHolder')} />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Account Type" required>
            <select className={inputCls} value={form.accountType} onChange={set('accountType')}>
              <option>Savings</option>
              <option>Current</option>
            </select>
          </Field>
          <Field label="Bank name" required>
            <input className={inputCls} value={form.bankName} onChange={set('bankName')} />
          </Field>
          <Field label="Account Number" required>
            <input className={inputCls} value={form.accountNumber} onChange={set('accountNumber')} />
          </Field>
          <Field label="Confirm Account Number" required>
            <input className={inputCls} value={form.confirmAccountNumber} onChange={set('confirmAccountNumber')} />
          </Field>
          <Field label="IFSC Code" required>
            <input className={inputCls} value={form.ifsc} onChange={set('ifsc')} />
          </Field>
          <Field label="UPI ID" required>
            <input className={inputCls} value={form.upi} onChange={set('upi')} />
          </Field>
        </div>

        <Button text="Update" handler={() => {}} width="100%" />
      </div>
    </div>
  );
}
