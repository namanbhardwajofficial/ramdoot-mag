import { useState } from "react";
import Card from "@/components/card";
import { useLoaderData } from "react-router";
import { sortRows } from "@/lib/sort";
import { PUBLICATION_STATUSES } from "@/config/constants";

const SORTS = [
  { value: "title:asc", label: "Title (A–Z)" },
  { value: "title:desc", label: "Title (Z–A)" },
  { value: "price:asc", label: "Price (low→high)" },
  { value: "price:desc", label: "Price (high→low)" },
];

export default function Magazines({ handleBuy, loading, message }) {
  const magazines = useLoaderData();

  // All three controls in the header used to be decorative: two handler-less
  // buttons and a search box with no state behind it. The catalogue is loaded
  // whole by the route loader, so filtering and sorting happen here over the
  // full set rather than as a request the backend has no parameters for.
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("");

  const q = search.trim().toLowerCase();
  const visible = sortRows(
    (magazines || []).filter(
      (m) =>
        (!status || String(m.status || "").toLowerCase() === status) &&
        (!q ||
          String(m.title || "").toLowerCase().includes(q) ||
          String(m.description || "").toLowerCase().includes(q)),
    ),
    sort,
  );

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Magazines</h1>
          <p className="text-sm text-slate-500">
            {q || status
              ? `${visible.length} of ${magazines?.length ?? 0} magazines`
              : "Every magazine in the catalogue"}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1 border rounded-md px-3 py-2 text-sm">
            <span className="text-slate-500">Filters</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
              className="bg-transparent focus:outline-none text-sm cursor-pointer"
            >
              <option value="">All</option>
              {Object.values(PUBLICATION_STATUSES).map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="inline-flex items-center gap-1 border rounded-md px-3 py-2 text-sm">
            <span className="text-slate-500">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort by"
              className="bg-transparent focus:outline-none text-sm cursor-pointer"
            >
              <option value="">Default</option>
              {SORTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            aria-label="Search magazines"
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
      </header>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">
          No magazines match this search.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visible.map((m) => (
            <Card
              key={m.id}
              title={m.title}
              description={m.description}
              image={m.image}
              price={m.price}
              onBuy={() => handleBuy(m)}
              loading={loading}
            />
          ))}
        </div>
      )}

      {message && <p className="mt-6 text-sm text-slate-600">{message}</p>}
    </>
  );
}
