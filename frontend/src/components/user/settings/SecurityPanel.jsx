import { useState } from "react";
import Button from "@/components/Button.jsx";
import { Field, inputCls } from "@/components/settings/fields";
import { MonitorIcon, SmartphoneIcon } from "@/components/ui/icons";
import { SectionHeader } from "./parts";

/**
 * Settings ▸ Security — password + 2FA on the left, active sessions on the
 * right. See design/user - settings - 2.png.
 */
const DEVICES = [
  {
    id: 1,
    type: "desktop",
    name: "2024 MacBook Pro 14-inch",
    meta: "Melbourne, Australia • 22 Jan at 10:40am",
    active: true,
  },
  {
    id: 2,
    type: "desktop",
    name: "2024 MacBook Pro 14-inch",
    meta: "Melbourne, Australia • 22 Jan at 4:20pm",
  },
  {
    id: 3,
    type: "desktop",
    name: "2024 MacBook Pro 14-inch",
    meta: "Melbourne, Australia • 22 Jan at 12:15pm",
  },
  {
    id: 4,
    type: "phone",
    name: "2024 iPhone 16 Pro",
    meta: "Melbourne, Australia • 22 Jan at 7:30am",
  },
];

export default function SecurityPanel() {
  const [pw, setPw] = useState({
    current: "Qieg%62ksbdk)92",
    next: "",
    confirm: "",
  });
  const set = (key) => (e) => setPw((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,28rem)_1fr]">
      {/* Password + 2FA */}
      <div>
        <SectionHeader
          title="Security"
          subtitle="List of all the magazines you been looking for"
        />

        <div className="space-y-5">
          <Field label="Password">
            <input
              type="text"
              className={inputCls}
              value={pw.current}
              onChange={set("current")}
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
          <Button text="Update Password" handler={() => {}} width="100%" />
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-bold text-slate-900">Add 2FA</h3>
          <p className="mb-4 mt-1 text-sm text-slate-500">
            List of all the magazines you been looking for
          </p>
          <Button
            text="Add 2 Factor Authentication"
            handler={() => {}}
            width="100%"
          />
        </div>
      </div>

      {/* Active sessions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Where you&apos;re logged in
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          We&apos;ll alert you via{" "}
          <span className="text-slate-700">atharv@ramdootfoundation.com</span> if
          there is any unusual activity on your account.
        </p>

        <ul className="mt-6 divide-y divide-slate-100">
          {DEVICES.map((d) => (
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
                  {d.active && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active now
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{d.meta}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
