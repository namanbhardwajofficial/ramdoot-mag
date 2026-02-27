import { useState, useEffect } from 'react';
import { BACKEND_URL, ORG, PRICING_PLANS } from '@/config/constants';
import StatusBadge from '@/componets/ui/status-badge';

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

function UploadBlock({ label, hint, buttonLabel }) {
  return (
    <div className="mb-5">
      <div className="flex gap-4 items-start">
        <div className="w-24 h-28 bg-slate-200 rounded-lg shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
          <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-full hover:bg-slate-800">
            {buttonLabel}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function VersionHistory({ pubId }) {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/publications/${pubId}/versions`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) ? setVersions(d) : setVersions([]))
      .catch(console.error);
  }, [pubId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold mb-4">Magazine Updates</h3>
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

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleUpdate() {
    onUpdate({ ...form });
  }

  return (
    <div>
      <StepIndicator currentStep={step} />

      {step === 0 ? (
        <>
          <h2 className="text-lg font-semibold mb-4">Edit Magazine</h2>

          <UploadBlock label="Add Magazine file" hint="You will find everything about users in this platform." buttonLabel="Add New Magazine" />
          <UploadBlock label="Add Magazine Profile Photo" hint="You will find everything about users in this platform." buttonLabel="Add New Magazine" />

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

            <button onClick={handleUpdate} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800">
              Update Magazine
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <VersionHistory pubId={publication.id} />
        </div>
      )}
    </div>
  );
}
