export default function Toolbar({
  statusFilter,
  onStatusChange,
  statusOptions = [],
  search,
  onSearchChange,
  onExport,
  children,
}) {
  return (
    <div className="flex items-center justify-end gap-3 mb-4 flex-wrap">
      {children}

      {statusOptions.length > 0 && (
        <div className="inline-flex items-center gap-1 border rounded-lg px-3 py-2 text-sm">
          <span className="text-slate-500">Filters</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-transparent focus:outline-none text-sm"
          >
            <option value="">All</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      <button className="px-3 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50">
        Sort by
      </button>

      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="border rounded-lg pl-9 pr-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      {onExport && (
        <button
          onClick={onExport}
          className="px-3 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
        >
          Export
        </button>
      )}
    </div>
  );
}
