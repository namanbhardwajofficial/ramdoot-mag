import { useState, useEffect, useRef } from 'react';
import { ORG, PRICING_PLANS, API_ORIGIN } from '@/config/constants';
import StatusBadge from '@/components/ui/status-badge';
import { magazinesApi } from '@/lib/api';
import { toastError } from '@/lib/confirm';

function StepIndicator({ currentStep }) {
  const steps = [
    { label: 'Upload Magazine', sub: 'Add Files and Titles' },
    { label: 'Add Pricing', sub: 'Add Files and Titles' },
  ];
  return (
    <div className="flex items-center justify-center gap-12 mb-8">
      {steps.map((s, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${done ? 'bg-emerald-500 text-white' : active ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {done ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <p className="text-sm font-medium text-slate-800">{s.label}</p>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

function prettySize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Was a grey square and a handler-less button — there was no file input behind
 * it at all, so the "Add New Magazine" control could not add a magazine file.
 * The upload endpoint (`POST /magazines/:id/upload`) already existed; nothing
 * reached it. Picking a file stages it, and the form sends it on Update.
 */
function UploadBlock({ label, hint, buttonLabel, accept, file, preview, onPick }) {
  const inputRef = useRef(null);

  return (
    <div className="mb-5">
      <div className="flex gap-4 items-start">
        <div className="w-24 h-28 bg-slate-200 rounded-lg shrink-0 overflow-hidden">
          {preview && <img src={preview} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{hint}</p>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              onPick(e.target.files?.[0] || null);
              // Let the same file be picked again after a removal.
              e.target.value = '';
            }}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-full hover:bg-slate-800"
          >
            {file ? 'Choose a different file' : buttonLabel}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {file && (
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="truncate font-medium text-slate-700">{file.name}</span>
              <span className="text-slate-300">|</span>
              {prettySize(file.size)}
              <button
                type="button"
                onClick={() => onPick(null)}
                className="font-medium text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function VersionHistory() {
  // No magazine version-history endpoint yet — magazines are updated in place
  // with no revision table behind them. See BACKEND_GAPS.md.
  const versions = [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold mb-4">Magazine Updates</h3>
      {versions.length === 0 && (
        <p className="text-xs text-slate-400">Version history isn&apos;t available yet.</p>
      )}
      <div className="space-y-4">
        {versions.map((v, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 7h6M9 11h6M9 15h4" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Version {v.version}</span>
                {v.status && <StatusBadge status={v.status} />}
              </div>
              <p className="text-xs text-slate-400">{v.author} &bull; {v.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EditMagazineForm({ publication, onUpdate, onCancel }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: publication?.title || '',
    description: publication?.description || '',
    startDate: publication?.startDate || '',
    endDate: publication?.endDate || '',
    pricingPlan: publication?.pricingPlan || 'paid',
    price: publication?.price || 49,
    saveVersion: true,
  });
  // Staged files, sent on Update. Kept out of `form` so the payload handed to
  // onUpdate stays plain JSON.
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Local preview of a freshly picked cover, falling back to whatever is
  // already on the magazine.
  const [coverPreview, setCoverPreview] = useState(null);
  useEffect(() => {
    if (!coverFile) { setCoverPreview(null); return undefined; }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const existingCover = publication?.coverImageUrl
    ? (publication.coverImageUrl.startsWith('http')
        ? publication.coverImageUrl
        : `${API_ORIGIN}${publication.coverImageUrl}`)
    : null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleUpdate() {
    setSaving(true);
    try {
      // Files first: the upload is a separate multipart call keyed on the
      // magazine id, so it has to land before the JSON update closes the drawer.
      const files = [pdfFile, coverFile].filter(Boolean);
      if (files.length) {
        if (!publication?.id) throw new Error('Save the magazine before attaching files.');
        await magazinesApi.upload(publication.id, files);
      }
      await onUpdate({ ...form });
    } catch (err) {
      toastError(err.message || 'Could not update the magazine');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <StepIndicator currentStep={step} />

      {step === 0 ? (
        <>
          <h2 className="text-lg font-semibold mb-4">Edit Magazine</h2>

          <UploadBlock
            label="Add Magazine file"
            hint="The PDF readers will open. Max 50MB."
            buttonLabel="Choose PDF"
            accept="application/pdf"
            file={pdfFile}
            onPick={setPdfFile}
          />
          <UploadBlock
            label="Add Magazine Profile Photo"
            hint="Cover image shown on the magazine card. PNG or JPG."
            buttonLabel="Choose cover"
            accept="image/png,image/jpeg,image/webp"
            file={coverFile}
            preview={coverPreview || existingCover}
            onPick={setCoverFile}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Magazine Title</label>
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Type here..."
              rows={4}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
          </div>

          <button onClick={() => setStep(1)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800">
            Next
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Add Pricing</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Pricing Plan</label>
              <select value={form.pricingPlan} onChange={(e) => update('pricingPlan', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                {PRICING_PLANS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            {form.pricingPlan === 'paid' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Pricing</label>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                  <span className="px-3 py-2 bg-slate-50 text-sm text-slate-600 border-r border-slate-300">{ORG.currency}</span>
                  <input type="number" value={form.price} onChange={(e) => update('price', Number(e.target.value))} className="flex-1 px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>
            )}

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input type="checkbox" checked={form.saveVersion} onChange={(e) => update('saveVersion', e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-slate-300" />
              <div>
                <p className="text-sm font-medium">Save version</p>
                <p className="text-xs text-slate-400">Save this version for later edit</p>
              </div>
            </label>

            <button onClick={handleUpdate} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Updating…' : 'Update Magazine'}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <VersionHistory />
        </div>
      )}
    </div>
  );
}
