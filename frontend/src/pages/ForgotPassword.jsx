import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Logo from '@/components/Logo.jsx';
import Button from '@/components/Button.jsx';
import { authApi } from '@/lib/api';
import { toastSuccess } from '@/lib/confirm';

const inputCls =
  'border border-black/10 p-3 rounded-lg shadow-sm w-full outline-none focus:border-black/30 transition-all text-sm';

/**
 * Two-step password reset: request an OTP by email, then set a new password.
 * The backend returns the OTP in development, so we prefill it for convenience.
 */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendOtp(e) {
    if (e) e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      if (res?.otp) {
        setOtp(res.otp);
        toastSuccess(`Dev OTP: ${res.otp}`);
      } else {
        toastSuccess('If the email exists, an OTP has been sent');
      }
      setStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    if (e) e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code from your email');
      return;
    }
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must be 8+ characters with an uppercase, lowercase and a number');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ email: email.trim(), otp, newPassword: password });
      toastSuccess('Password reset — please sign in');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-[#f8f9fa] p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-black/5 p-6 sm:p-8">
        <div className="mb-6">
          <Logo />
        </div>

        <h1 className="text-2xl font-medium">Reset your password</h1>
        <p className="text-black/50 text-sm mt-1">
          {step === 0
            ? 'Enter your email and we’ll send you a one-time code.'
            : `Enter the code sent to ${email} and choose a new password.`}
        </p>

        {error && <p className="text-red-500 text-sm mt-4 font-medium">{error}</p>}

        {step === 0 ? (
          <form onSubmit={sendOtp} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="you@example.com"
              />
            </div>
            <Button text={loading ? 'Sending…' : 'Send code'} width="100%" handler={sendOtp} loading={loading} />
          </form>
        ) : (
          <form onSubmit={resetPassword} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">One-time code *</label>
              <input
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className={inputCls}
                placeholder="6-digit code"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">New password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Confirm password *</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
            <Button
              text={loading ? 'Resetting…' : 'Reset password'}
              width="100%"
              handler={resetPassword}
              loading={loading}
            />
            <button
              type="button"
              onClick={() => setStep(0)}
              className="text-sm text-black/50 hover:text-black"
            >
              ← Use a different email
            </button>
          </form>
        )}

        <div className="mt-6 flex justify-center gap-2 text-sm">
          <span className="text-black/60">Remembered it?</span>
          <Link to="/login" className="font-medium hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </section>
  );
}
