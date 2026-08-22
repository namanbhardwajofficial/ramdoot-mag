import { useState, useEffect } from "react";
import Button from "@/components/Button.jsx";
import { Field, inputCls } from "@/components/settings/fields";
import { ChevronDownIcon } from "@/components/ui/icons";
import { SectionHeader } from "./parts";
import { usersApi, getStoredUser, saveAuth } from "@/lib/api";
import { toastSuccess, toastError } from "@/lib/confirm";

/**
 * Settings ▸ My details — personal info form. See design/user - settings.png.
 */
export default function MyDetailsPanel() {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    let alive = true;
    // Seed from the cached user for an instant paint, then refresh from the API.
    const stored = getStoredUser();
    if (stored) {
      setForm({
        fullName: stored.fullName || "",
        phone: stored.phone || "",
        email: stored.email || "",
      });
    }
    usersApi
      .me()
      .then((me) => {
        if (!alive || !me) return;
        setForm({
          fullName: me.fullName || "",
          phone: me.phone || "",
          email: me.email || "",
        });
      })
      .catch((err) => console.warn("me", err.message));
    return () => {
      alive = false;
    };
  }, []);

  async function handleUpdate() {
    setSaving(true);
    try {
      const updated = await usersApi.updateMe({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
      });
      // Keep the cached user (account menu, guards) in sync with the change.
      saveAuth({ user: { ...getStoredUser(), ...updated } });
      toastSuccess("Profile updated");
    } catch (err) {
      toastError(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <SectionHeader
        title="Personal Info"
        subtitle="Update your name, phone number and email address"
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

        <Button
          text="Update"
          handler={handleUpdate}
          loading={saving}
          width="100%"
        />
      </div>
    </div>
  );
}
