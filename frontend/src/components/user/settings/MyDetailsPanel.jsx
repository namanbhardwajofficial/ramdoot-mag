import { useState } from "react";
import Button from "@/components/Button.jsx";
import { Field, inputCls } from "@/components/settings/fields";
import { ChevronDownIcon } from "@/components/ui/icons";
import { SectionHeader } from "./parts";

/**
 * Settings ▸ My details — personal info form. See design/user - settings.png.
 */
export default function MyDetailsPanel() {
  const [form, setForm] = useState({
    fullName: "Atharv Kelwadkar",
    phone: "9136840260",
    email: "atharv@ramdootfoundation.com",
  });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-xl">
      <SectionHeader
        title="Personal Info"
        subtitle="List of all the magazines you been looking for"
      />

      <div className="space-y-5">
        <Field label="Full Name">
          <input
            className={inputCls}
            value={form.fullName}
            onChange={set("fullName")}
          />
        </Field>

        <Field label="Phone No">
          <div className="flex">
            <span className="inline-flex items-center gap-1 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
              IN <ChevronDownIcon className="h-3.5 w-3.5" />
            </span>
            <input
              className={`${inputCls} rounded-l-none`}
              value={form.phone}
              onChange={set("phone")}
            />
          </div>
        </Field>

        <Field label="Email">
          <input
            className={inputCls}
            value={form.email}
            onChange={set("email")}
          />
        </Field>

        <Button text="Update" handler={() => {}} width="100%" />
      </div>
    </div>
  );
}
