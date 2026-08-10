import { useEffect, useState } from "react";
import Button from "@/components/Button.jsx";
import { Field, inputCls } from "@/components/settings/fields";
import { MonitorIcon, SmartphoneIcon } from "@/components/ui/icons";
import { SectionHeader } from "./parts";
import useSecurity from "@/hooks/useSecurity";
import { getStoredUser } from "@/lib/api";

/**
 * Settings ▸ Security — password + 2FA on the left, active sessions on the
 * right. See design/user - settings - 2.png.
 */
export default function SecurityPanel() {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [code, setCode] = useState("");
  const set = (key) => (e) => setPw((p) => ({ ...p, [key]: e.target.value }));

  const {
    savingPassword,
    changePassword,
    twoFactor,
    twoFactorBusy,
    startTwoFactor,
    confirmTwoFactor,
    cancelTwoFactor,
    devices,
    devicesLoading,
    loadDevices,
    revokeDevice,
  } = useSecurity();

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const email = getStoredUser()?.email || "your email";

  async function handleUpdatePassword() {
    if (await changePassword(pw)) setPw({ current: "", next: "", confirm: "" });
  }

  async function handleConfirm2fa() {
    if (await confirmTwoFactor(code)) setCode("");
  }

  return (
    <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,28rem)_1fr]">
      {/* Password + 2FA */}
      <div>
        <SectionHeader
          title="Security"
          subtitle="Manage your password and two-factor authentication"
        />

        <div className="space-y-5">
          <Field label="Password">
            <input
              type="password"
              className={inputCls}
              value={pw.current}
              onChange={set("current")}
              placeholder="Current password"
            />
          </Field>
          <Field label="New Password">
            <input
              type="password"
              className={inputCls}
              value={pw.next}
              onChange={set("next")}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Confirm New Password" required>
            <input
              type="password"
              className={inputCls}
              value={pw.confirm}
              onChange={set("confirm")}
              placeholder="••••••••"
            />
          </Field>
          <Button
            text="Update Password"
            handler={handleUpdatePassword}
            loading={savingPassword}
            width="100%"
          />
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-bold text-slate-900">Add 2FA</h3>
          <p className="mb-4 mt-1 text-sm text-slate-500">
            Add an extra layer of security to your account
          </p>

          {!twoFactor ? (
            <Button
              text="Add 2 Factor Authentication"
              handler={startTwoFactor}
              loading={twoFactorBusy}
              width="100%"
            />
          ) : (
            // Step 2 of enrolment: the backend handed back a secret + otpauth
            // URI. Until a QR renderer is added, show the secret for manual entry.
            <div className="space-y-4 rounded-xl border border-slate-200 p-4">
              <div>
                <p className="text-sm text-slate-600">
                  Add this key to your authenticator app, then enter the 6-digit
                  code it shows.
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
                <Button
                  text="Verify & Enable"
                  handler={handleConfirm2fa}
                  loading={twoFactorBusy}
                  width="100%"
                />
                <button
                  type="button"
                  onClick={() => {
                    cancelTwoFactor();
                    setCode("");
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

      {/* Active sessions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Where you&apos;re logged in
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          We&apos;ll alert you via{" "}
          <span className="text-slate-700">{email}</span> if there is any unusual
          activity on your account.
        </p>

        {devicesLoading ? (
          <p className="mt-6 text-sm text-slate-400">Loading sessions…</p>
        ) : devices.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">No active sessions.</p>
        ) : (
          <ul className="mt-6 divide-y divide-slate-100">
            {devices.map((d, i) => (
              <li key={d.id} className="flex items-start gap-3 py-4">
                <span className="mt-0.5 text-slate-400">
                  {d.type === "phone" ? (
                    <SmartphoneIcon className="h-5 w-5" />
                  ) : (
                    <MonitorIcon className="h-5 w-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">
                      {d.name}
                    </span>
                    {/* Sessions come back sorted by lastActiveAt desc, so the
                        first row is the most recently used one. */}
                    {i === 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active now
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{d.meta}</p>
                </div>
                <button
                  type="button"
                  onClick={() => revokeDevice(d.id)}
                  className="shrink-0 text-xs font-medium text-slate-400 hover:text-red-600"
                >
                  Sign out
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
