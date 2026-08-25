import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Button from '@/components/Button.jsx';
import ErrorState from '@/components/ui/error-state';
import PayoutRequestedDrawer from '@/components/influencers/PayoutRequestedDrawer';
import { earningsApi, getStoredUser, listOf } from '@/lib/api';
import { toastError } from '@/lib/confirm';
import SupportLink from '@/components/SupportLink';

// Sentinel for the "add a new bank account" option in the account picker.
const NEW_ACCOUNT = '__new__';

const inputCls =
  'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300';

function Check() {
  return (
    <span className="absolute inset-y-0 right-3 flex items-center text-emerald-500">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M8.5 12.5l2.2 2.2 4.3-4.6" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Field({ label, required, hint, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </label>
  );
}

/**
 * Both of these used to carry an AreaChart over one shared literal array —
 * the identical ten-point climb under every figure, on every account. There is
 * no per-influencer time series to plot, so the chart is gone and the number
 * stands on its own. A null value renders a dash rather than a confident zero.
 */
function MiniStat({ label, value }) {
  const unknown = value === null || value === undefined;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">
        {unknown ? <span className="text-slate-300" title="Not loaded">&mdash;</span> : value}
      </p>
    </div>
  );
}

function Stepper({ step }) {
  const steps = [
    { title: 'Personal Details', desc: 'Verify your personal details' },
    { title: 'Bank Details', desc: 'Add your bank details to verify' },
  ];
  return (
    <div className="flex items-start mb-8">
      {steps.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <React.Fragment key={s.title}>
            <div className="flex flex-col items-center text-center w-44 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  done ? 'bg-emerald-500 text-white' : active ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <p className={`text-sm font-medium mt-2 ${done || active ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}</p>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </div>
            {i < steps.length - 1 && <div className="flex-1 border-t border-dashed border-slate-300 mt-4" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function RequestPayout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState(null);
  // Saved payout accounts. `NEW_ACCOUNT` means "enter fresh bank details".
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(NEW_ACCOUNT);
  // Both loads used to console.warn on failure, leaving zeroed cards and an
  // empty account picker with no hint that anything had gone wrong.
  const [errors, setErrors] = useState({ earnings: null, accounts: null });
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    accountHolder: '',
    withdrawAmount: '',
    accountType: 'Savings',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    upi: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setErr = (key, msg) => setErrors((e) => ({ ...e, [key]: msg }));

  // Load real earnings for the summary cards + default the withdrawal amount.
  const loadEarnings = useCallback(() => {
    setErr('earnings', null);
    return earningsApi
      .overview()
      .then((e) => {
        const commission = Number(e?.totalEarnings ?? 0);
        const available = Number(e?.availableBalance ?? 0);
        setStats({ commission, available });
        setForm((f) =>
          f.withdrawAmount ? f : { ...f, withdrawAmount: available > 0 ? String(available) : '' },
        );
      })
      .catch((err) => setErr('earnings', err.message || 'Could not load your balance'));
  }, []);

  // Reuse an already-saved payout account instead of creating a duplicate on
  // every request. The API masks the account number, so we match by id only.
  const loadAccounts = useCallback(() => {
    setErr('accounts', null);
    return earningsApi
      .bankAccounts()
      .then((res) => {
        const list = listOf(res);
        setAccounts(list);
        const preferred = list.find((a) => a.isDefault) || list[0];
        if (preferred) setAccountId(preferred.id);
      })
      .catch((err) => setErr('accounts', err.message || 'Could not load your saved accounts'));
  }, []);

  useEffect(() => {
    // Prefill personal details from the signed-in user.
    const u = getStoredUser();
    if (u) {
      setForm((f) => ({
        ...f,
        fullName: u.fullName || '',
        phone: u.phone || '',
        email: u.email || '',
        accountHolder: u.fullName || '',
      }));
    }
    loadEarnings();
    loadAccounts();
  }, [loadEarnings, loadAccounts]);

  async function handleRequest() {
    const amount = Number(form.withdrawAmount);
    if (!amount || amount <= 0) {
      toastError('Enter a valid withdrawal amount');
      return;
    }

    const creatingAccount = accountId === NEW_ACCOUNT;
    if (creatingAccount) {
      if (form.accountNumber !== form.confirmAccountNumber) {
        toastError('Account numbers do not match');
        return;
      }
      if (!form.accountHolder || !form.bankName || !form.accountNumber || !form.ifsc) {
        toastError('Please fill in all bank details');
        return;
      }
    }

    setSubmitting(true);
    try {
      // Only add a bank account when the user asked for a new one — otherwise
      // every payout request would save another copy of the same account.
      const bankAccountId = creatingAccount
        ? (
            await earningsApi.addBankAccount({
              holderName: form.accountHolder,
              bankName: form.bankName,
              accountNumber: form.accountNumber,
              ifscCode: form.ifsc,
              isDefault: accounts.length === 0,
            })
          ).id
        : accountId;
      await earningsApi.withdraw({ amount, bankAccountId });
      setSuccess(true);
    } catch (err) {
      toastError(err.message || 'Payout request failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-1">
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* Left summary */}
        <aside className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Request Payout</h1>
            <p className="text-sm text-slate-500 mt-1">View all the earning report from all your links and shares from</p>
          </div>

          {errors.earnings ? (
            <ErrorState message={errors.earnings} onRetry={loadEarnings} className="px-4 py-5" />
          ) : (
            <>
              <MiniStat
                label="Commission Earning"
                value={stats ? stats.commission.toLocaleString('en-IN') : null}
              />
              <MiniStat
                label="Payout Available"
                value={stats ? stats.available.toLocaleString('en-IN') : null}
              />
            </>
          )}

          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-sky-300 via-sky-400 to-blue-500 p-5">
            <div className="absolute -right-3 -top-3 text-6xl opacity-90 select-none">🪙</div>
            <div className="absolute right-10 bottom-12 text-2xl opacity-80 select-none">💸</div>
            <h3 className="relative text-xl font-bold text-white leading-snug max-w-50">Requested Payout</h3>
            <p className="relative text-xs text-white/85 mt-1 max-w-56">
              View all the earning report from all your links and shares from
            </p>
            <div className="relative mt-4">
              <Button text="View Status" handler={() => navigate('/influencer/earnings/requested-payout')} />
            </div>
          </div>
        </aside>

        {/* Right: Payout Form */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Payout Form</h2>
            <p className="text-sm text-slate-500">View all the earning report from all your links and shares from</p>
          </div>

          <Stepper step={step} />

          {step === 0 ? (
            <div className="space-y-5">
              <Field label="Full Name">
                <input className={inputCls} value={form.fullName} onChange={set('fullName')} />
              </Field>

              <Field label="Phone No" required>
                <div className="relative flex">
                  <span className="inline-flex items-center gap-1 rounded-l-xl border border-r-0 border-slate-200 px-3 text-sm text-slate-500 bg-slate-50">
                    +91
                  </span>
                  <div className="relative flex-1">
                    <input
                      className="w-full rounded-r-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      value={form.phone}
                      onChange={set('phone')}
                    />
                    {form.phone && <Check />}
                  </div>
                </div>
              </Field>

              <Field label="Email" required>
                <div className="relative">
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={form.email}
                    onChange={set('email')}
                  />
                  {form.email && <Check />}
                </div>
              </Field>
            </div>
          ) : (
            <div className="space-y-5">
              {/* A failed account load looks exactly like "you have no saved
                  accounts", which would quietly push the user into re-entering
                  bank details they have already given us. */}
              {errors.accounts && (
                <ErrorState message={errors.accounts} onRetry={loadAccounts} className="px-4 py-5" />
              )}
              {accounts.length > 0 && (
                <Field label="Payout Account" required hint="Where the money will be sent">
                  <select
                    className={inputCls}
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {[a.bankName, a.holderName, a.ifscCode].filter(Boolean).join(' · ')}
                        {a.isDefault ? ' (default)' : ''}
                      </option>
                    ))}
                    <option value={NEW_ACCOUNT}>Use a different bank account…</option>
                  </select>
                </Field>
              )}

              {accountId === NEW_ACCOUNT && (
                <Field label="Account Holder Name" required hint="As per bank records">
                  <input className={inputCls} value={form.accountHolder} onChange={set('accountHolder')} />
                </Field>
              )}

              <Field label="Withdraw Amount" required>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">₹</span>
                  <input className={`${inputCls} pl-7`} value={form.withdrawAmount} onChange={set('withdrawAmount')} />
                </div>
              </Field>

              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                  accountId === NEW_ACCOUNT ? '' : 'hidden'
                }`}
              >
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
            </div>
          )}

          <div className="mt-8">
            {step === 0 ? (
              <Button text="Next" handler={() => setStep(1)} width="100%" />
            ) : (
              <Button text="Request" handler={handleRequest} loading={submitting} width="100%" />
            )}
            <p className="text-center text-xs text-slate-400 mt-3">
              Trouble withdrawing funds?{' '}
              <SupportLink className="font-semibold text-slate-600 hover:text-slate-900">Connect Us</SupportLink>
            </p>
          </div>
        </section>
      </div>

      <PayoutRequestedDrawer
        open={success}
        onClose={() => setSuccess(false)}
        onViewStatus={() => navigate('/influencer/earnings/requested-payout')}
      />
    </div>
  );
}
