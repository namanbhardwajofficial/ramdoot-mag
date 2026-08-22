import { useState, useEffect, useCallback } from 'react';
import Button from '@/components/Button.jsx';
import { Field, inputCls, PanelHeader } from './fields';
import { earningsApi, getStoredUser, listOf } from '@/lib/api';
import { toastSuccess, toastError } from '@/lib/confirm';

/**
 * Influencer-only settings tab. Influencers receive money (payouts) rather than
 * pay, so instead of the subscriber "Billings" tab they manage the bank account
 * their campaign payouts are sent to.
 *
 * The API returns saved accounts WITHOUT the account number (it is never sent
 * back), so existing accounts are shown read-only and identified by bank +
 * IFSC. Adding a new account is the only way to change where payouts go.
 *
 * Fields are limited to what AddBankAccountDto accepts — holderName, bankName,
 * accountNumber, ifscCode, isDefault. The previous version also asked for
 * account type and a UPI ID, neither of which the API stores.
 */
const EMPTY = {
  holderName: '',
  bankName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifscCode: '',
};

function AccountRow({ account }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-medium text-slate-800">
          {account.bankName || 'Bank account'}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {[account.holderName, account.ifscCode].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {account.isDefault && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            Default
          </span>
        )}
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            account.isVerified
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}
        >
          {account.isVerified ? 'Verified' : 'Pending verification'}
        </span>
      </div>
    </div>
  );
}

export default function PayoutPanel() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const load = useCallback(
    () =>
      earningsApi
        .bankAccounts()
        .then((res) => setAccounts(listOf(res)))
        .catch((err) => {
          console.warn('bankAccounts', err.message);
          toastError('Could not load your payout accounts');
        }),
    [],
  );

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  function startAdding() {
    // Prefill the holder from the signed-in user — the only detail we actually know.
    setForm({ ...EMPTY, holderName: getStoredUser()?.fullName || '' });
    setAdding(true);
  }

  async function handleSave() {
    if (form.accountNumber !== form.confirmAccountNumber) {
      toastError('Account numbers do not match');
      return;
    }
    if (!form.holderName || !form.bankName || !form.accountNumber || !form.ifscCode) {
      toastError('Please fill in all bank details');
      return;
    }
    setSaving(true);
    try {
      await earningsApi.addBankAccount({
        holderName: form.holderName,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        // First account added becomes the one payouts default to.
        isDefault: accounts.length === 0,
      });
      await load();
      setForm(EMPTY);
      setAdding(false);
      toastSuccess('Payout account added');
    } catch (err) {
      toastError(err.message || 'Could not save payout account');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PanelHeader
        title="Payout Details"
        subtitle="The bank account where your campaign payouts are sent"
      />

      {loading ? (
        <p className="text-sm text-slate-400">Loading payout accounts…</p>
      ) : (
        <div className="space-y-6">
          {accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map((a) => (
                <AccountRow key={a.id} account={a} />
              ))}
            </div>
          ) : (
            !adding && (
              <div className="rounded-xl border border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-500">
                  You haven&apos;t added a payout account yet.
                </p>
              </div>
            )
          )}

          {adding ? (
            <div className="space-y-5 border-t border-slate-100 pt-6">
              <Field label="Account Holder Name" required hint="As per bank records">
                <input
                  className={inputCls}
                  value={form.holderName}
                  onChange={set('holderName')}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Bank name" required>
                  <input
                    className={inputCls}
                    value={form.bankName}
                    onChange={set('bankName')}
                  />
                </Field>
                <Field label="IFSC Code" required>
                  <input
                    className={inputCls}
                    value={form.ifscCode}
                    onChange={set('ifscCode')}
                  />
                </Field>
                <Field label="Account Number" required>
                  <input
                    className={inputCls}
                    value={form.accountNumber}
                    onChange={set('accountNumber')}
                  />
                </Field>
                <Field label="Confirm Account Number" required>
                  <input
                    className={inputCls}
                    value={form.confirmAccountNumber}
                    onChange={set('confirmAccountNumber')}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <div className="flex-1">
                  <Button
                    text="Save account"
                    handler={handleSave}
                    loading={saving}
                    width="100%"
                  />
                </div>
              </div>
            </div>
          ) : (
            <Button text="Add payout account" handler={startAdding} width="100%" />
          )}
        </div>
      )}
    </div>
  );
}
