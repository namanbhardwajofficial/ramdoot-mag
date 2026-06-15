import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import Button from '@/components/Button.jsx';
import PayoutRequestedDrawer from '@/components/influencers/PayoutRequestedDrawer';

const trend = [10, 14, 12, 20, 17, 25, 22, 30, 27, 36].map((v) => ({ v }));

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

function MiniStat({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      <div className="h-12 mt-1 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#34D399" strokeWidth={2} fill={`url(#g-${label})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
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
  const [form, setForm] = useState({
    fullName: 'Atharv Kelwadkar',
    phone: '9136840260',
    email: 'atharv@ramdootfoundation.com',
    accountHolder: 'Atharv Sevak Kelwadkar',
    withdrawAmount: '10600',
    accountType: 'Savings',
    bankName: 'HDFC BANK',
    accountNumber: '123456789012',
    confirmAccountNumber: '123456789012',
    ifsc: 'HDFC0001234',
    upi: 'atharv@okaxis',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="p-1">
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* Left summary */}
        <aside className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Request Payout</h1>
            <p className="text-sm text-slate-500 mt-1">View all the earning report from all your links and shares from</p>
          </div>

          <MiniStat label="Commission Earning" value="22,182" />
          <MiniStat label="Payout Available" value="2,182" />

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
              <Field label="Account Holder Name" required hint="As per bank records">
                <input className={inputCls} value={form.accountHolder} onChange={set('accountHolder')} />
              </Field>

              <Field label="Withdraw Amount" required>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">₹</span>
                  <input className={`${inputCls} pl-7`} value={form.withdrawAmount} onChange={set('withdrawAmount')} />
                </div>
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
            </div>
          )}

          <div className="mt-8">
            {step === 0 ? (
              <Button text="Next" handler={() => setStep(1)} width="100%" />
            ) : (
              <Button text="Request" handler={() => setSuccess(true)} width="100%" />
            )}
            <p className="text-center text-xs text-slate-400 mt-3">
              Trouble withdrawing funds?{' '}
              <button type="button" className="font-semibold text-slate-600 hover:text-slate-900">Connect Us</button>
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
