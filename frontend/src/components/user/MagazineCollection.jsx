import Button from "@/components/Button.jsx";
import { toastSuccess } from "@/lib/confirm";

/**
 * Reader-facing magazine list/grid used on the user Home and Magazine pages.
 * The same data renders as either stacked rows ("list" view — see
 * design/user - magazines - second layout.png) or a card grid ("grid" view —
 * see design/user - magazines - block layout.png), toggled via <ViewToggle />.
 */

function defaultShare() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  }
  toastSuccess("Share link copied");
}

function defaultRead() {
  toastSuccess("Magazine reader coming soon");
}

function Thumb({ image, title, className = "" }) {
  return (
    <div className={`bg-slate-200 overflow-hidden ${className}`}>
      {image ? (
        <img src={image} alt={title} className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

function ShareLink({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="whitespace-nowrap text-sm text-slate-500 transition-colors hover:text-slate-800"
    >
      Share Magazine
    </button>
  );
}

export function MagazineRow({ magazine, onRead, onShare }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
      <Thumb
        image={magazine.image}
        title={magazine.title}
        className="h-28 w-full shrink-0 rounded-xl sm:h-20 sm:w-32"
      />

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-slate-900">{magazine.title}</h3>
        <p className="truncate text-sm text-slate-500">{magazine.description}</p>
      </div>

      <div className="flex items-center justify-between gap-6 sm:justify-end">
        <ShareLink onClick={() => (onShare ?? defaultShare)(magazine)} />
        <Button text="Read Magazine" handler={() => (onRead ?? defaultRead)(magazine)} />
      </div>
    </article>
  );
}

export function MagazineCard({ magazine, onRead, onShare }) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3">
      <Thumb
        image={magazine.image}
        title={magazine.title}
        className="mb-4 h-44 w-full rounded-xl"
      />

      <h3 className="text-base font-semibold text-slate-900">{magazine.title}</h3>
      <p className="mb-4 text-sm text-slate-500">{magazine.description}</p>

      <div className="mt-auto space-y-3">
        <Button
          text="View Magazine"
          handler={() => (onRead ?? defaultRead)(magazine)}
          width="100%"
        />
        <div className="text-center">
          <ShareLink onClick={() => (onShare ?? defaultShare)(magazine)} />
        </div>
      </div>
    </article>
  );
}

/** Segmented list/grid switch shown at the top-right of the collection. */
export function ViewToggle({ view, onChange }) {
  const btn = (mode, label, icon) => {
    const active = view === mode;
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onClick={() => onChange(mode)}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
          active
            ? "bg-slate-100 text-slate-900"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      {btn("list", "List view", <ListIcon />)}
      {btn("grid", "Grid view", <GridIcon />)}
    </div>
  );
}

export default function MagazineCollection({
  magazines = [],
  view = "list",
  onRead,
  onShare,
  emptyMessage = "No magazines available yet.",
}) {
  // An empty catalogue must read as empty. Callers used to paper over this with
  // sample data, which showed readers magazines that do not exist.
  if (magazines.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {magazines.map((m) => (
          <MagazineCard key={m.id} magazine={m} onRead={onRead} onShare={onShare} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {magazines.map((m) => (
        <MagazineRow key={m.id} magazine={m} onRead={onRead} onShare={onShare} />
      ))}
    </div>
  );
}

/* ---------------- ICONS ---------------- */

function ListIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
