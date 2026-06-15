import { useState } from 'react';
import Button from '@/components/Button.jsx';
import { TrashIcon, UploadIcon, CheckCircleIcon } from '@/components/ui/icons';
import { Field, inputCls, inputWithIconCls, GreenCheck, PanelHeader } from './fields';

export default function MyDetailsPanel() {
  const [form, setForm] = useState({
    fullName: 'Atharv Kelwadkar',
    phone: '9136840260',
    email: 'atharv@ramdootfoundation.com',
  });
  const [file, setFile] = useState({ name: 'Profile.jpg', size: '10 MB' });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <PanelHeader title="Personal Info" subtitle="Update your photo and personal details" />

      <p className="text-sm font-semibold text-slate-700 mb-2">Add Profile Picture</p>
      <div className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
          <UploadIcon className="w-5 h-5" />
        </div>
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-slate-400 mt-1">PNG or JPG (max size 10MB)</p>
      </div>

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
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircleIcon className="w-3.5 h-3.5" /> 100%
                </span>
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

        <Button text="Update" handler={() => {}} width="100%" />
      </div>
    </div>
  );
}
