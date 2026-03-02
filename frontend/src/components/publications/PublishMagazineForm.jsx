import { useState } from 'react';
import { ORG, PRICING_PLANS } from '@/config/constants';

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
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                done
                  ? 'bg-emerald-500 text-white'
                  : active
                    ? 'bg-amber-400 text-white'
                    : 'bg-slate-200 text-slate-500'
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
            <p className="text-sm font-medium text-slate-800">{s.label}</p>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

function UploadZone({ label, hint, accept }) {
  const [files, setFiles] = useState([]);

  function handleChange(e) {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  }

  return (
    <div className="mb-5">
      <p className="text-sm font-medium mb-2">{label}</p>
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-slate-400 transition-colors">
        <svg className="w-8 h-8 text-slate-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm">
          <span className="text-blue-600 underline">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-slate-400 mt-1">{hint}</p>
        <input type="file" className="sr-only" accept={accept} multiple onChange={handleChange} />
      </label>

      {files.map((f, i) => (
        <div key={i} className="flex items-center gap-3 mt-3 bg-slate-50 rounded-lg px-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500 text-xs font-bold shrink-0">
            {f.name.split('.').pop()?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{f.name}</p>
            <p className="text-xs text-slate-400">{(f.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-slate-600">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function PreviewPanel() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Preview Magazine</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Full View</span>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
          </svg>
        </div>
      </div>
      <div className="bg-slate-200 rounded-lg aspect-3/4 mb-3" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-slate-100 rounded aspect-square" />
        ))}
      </div>
    </div>
  );
}

export default function PublishMagazineForm({ onPublish, onCancel }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    pricingPlan: 'paid',
    price: 49,
    sendNotification: true,
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePublish() {
    onPublish(form);
  }

  return (
    <div>
      <StepIndicator currentStep={step} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left form */}
        <div>
          {step === 0 ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Upload Magazine</h2>

              <UploadZone label="Add Magazine file" hint="PDF Version Only (max size: 10MB)" accept=".pdf" />
              <UploadZone label="Add Cover Image" hint="Webp, PNG, JPG (max: 800x400px)" accept="image/*" />

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Magazine Title</label>
                <input
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder="Magazine 1"
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
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => update('startDate', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => update('endDate', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800"
              >
                Next
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4">Add Pricing</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Pricing Plan</label>
                <select
                  value={form.pricingPlan}
                  onChange={(e) => update('pricingPlan', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {PRICING_PLANS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {form.pricingPlan === 'paid' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Pricing</label>
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                    <span className="px-3 py-2 bg-slate-50 text-sm text-slate-600 border-r border-slate-300">
                      {ORG.currency}
                    </span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => update('price', Number(e.target.value))}
                      className="flex-1 px-3 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sendNotification}
                  onChange={(e) => update('sendNotification', e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300"
                />
                <div>
                  <p className="text-sm font-medium">Send Notification</p>
                  <p className="text-xs text-slate-400">After Publishing this will send notification to current paid users</p>
                </div>
              </label>

              <button
                onClick={handlePublish}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800"
              >
                Publish Magazine
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Right preview */}
        <PreviewPanel />
      </div>
    </div>
  );
}
