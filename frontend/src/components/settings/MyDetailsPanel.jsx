import { useState, useEffect, useRef } from 'react';
import Button from '@/components/Button.jsx';
import { TrashIcon, UploadIcon, CheckCircleIcon } from '@/components/ui/icons';
import { Field, inputCls, inputWithIconCls, GreenCheck, PanelHeader } from './fields';
import { usersApi, getStoredUser, saveAuth } from '@/lib/api';
import { toastSuccess, toastError } from '@/lib/confirm';

// The backend caps avatars at 2MB and only stores the file it is given, so
// reject anything larger (or non-image) before spending the round trip.
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function prettySize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MyDetailsPanel() {
  const [form, setForm] = useState({ fullName: '', phone: '', email: '' });
  // The refresh from GET /users/me used to console.warn on failure, leaving
  // whatever was cached at login on screen as though it were current.
  const [staleWarning, setStaleWarning] = useState(null);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  useEffect(() => {
    let alive = true;
    const stored = getStoredUser();
    if (stored) {
      setForm({
        fullName: stored.fullName || '',
        phone: stored.phone || '',
        email: stored.email || '',
      });
    }
    usersApi
      .me()
      .then((me) => {
        if (!alive || !me) return;
        setForm({
          fullName: me.fullName || '',
          phone: me.phone || '',
          email: me.email || '',
        });
      })
      .catch((err) => {
        if (!alive) return;
        setStaleWarning(err.message || 'Could not refresh your details');
      });
    return () => {
      alive = false;
    };
  }, []);

  async function handleAvatarPick(e) {
    const picked = e.target.files?.[0];
    // Reset the input so re-picking the same file still fires onChange.
    e.target.value = '';
    if (!picked) return;

    if (!picked.type.startsWith('image/')) {
      toastError('Choose a PNG or JPG image');
      return;
    }
    if (picked.size > MAX_AVATAR_BYTES) {
      toastError(`That image is ${prettySize(picked.size)} — the limit is 2 MB`);
      return;
    }

    setFile({ name: picked.name, size: prettySize(picked.size) });
    setUploading(true);
    try {
      const updated = await usersApi.uploadAvatar(picked);
      saveAuth({ user: { ...getStoredUser(), ...updated } });
      toastSuccess('Profile picture updated');
    } catch (err) {
      setFile(null);
      toastError(err.message || 'Could not upload that image');
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdate() {
    setSaving(true);
    try {
      const updated = await usersApi.updateMe({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
      });
      saveAuth({ user: { ...getStoredUser(), ...updated } });
      toastSuccess('Profile updated');
    } catch (err) {
      toastError(err.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PanelHeader title="Personal Info" subtitle="Update your photo and personal details" />

      {staleWarning && (
        <p role="alert" className="mb-4 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
          Showing your saved details — we couldn&apos;t refresh them from the server ({staleWarning}).
        </p>
      )}

      <p className="text-sm font-semibold text-slate-700 mb-2">Add Profile Picture</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleAvatarPick}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
          <UploadIcon className="w-5 h-5" />
        </div>
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-slate-400 mt-1">PNG or JPG (max size 2MB)</p>
      </button>

      {file && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 text-[10px] font-bold text-white">
              JPG
            </span>
            <div>
              <p className="text-sm font-medium text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                {file.size}
                <span className="text-slate-300">|</span>
                {uploading ? (
                  <span className="text-slate-500">Uploading…</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <CheckCircleIcon className="w-3.5 h-3.5" /> 100%
                  </span>
                )}
              </p>
            </div>
          </div>
          <button onClick={() => setFile(null)} aria-label="Remove file" className="text-slate-400 hover:text-red-600">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="mt-6 space-y-5">
        <Field label="Full Name">
          <input className={inputCls} value={form.fullName} onChange={set('fullName')} />
        </Field>

        <Field label="Phone No">
          <div className="flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
              IN
            </span>
            <div className="relative flex-1">
              <input className={`${inputWithIconCls} rounded-l-none`} value={form.phone} onChange={set('phone')} />
              {form.phone && <GreenCheck />}
            </div>
          </div>
        </Field>

        <Field label="Email">
          <div className="relative">
            <input className={inputWithIconCls} value={form.email} onChange={set('email')} />
            {form.email && <GreenCheck />}
          </div>
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
