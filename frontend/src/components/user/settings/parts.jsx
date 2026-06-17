/**
 * Small building blocks shared by the user Settings panels (My details /
 * Security / Billings). See design/user - settings*.png.
 */

export function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6 border-b border-slate-200 pb-4">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

/** A square checkbox that fills dark when selected, matching the mockups. */
export function SquareCheck({ checked, onChange, className = "" }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
        checked
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white"
      } ${className}`}
    >
      {checked && (
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}
