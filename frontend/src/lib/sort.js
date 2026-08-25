/**
 * Client-side row sorting for the admin tables.
 *
 * The "Sort by" button in the shared Toolbar had no handler at all — one dead
 * control appearing on five pages. Sorting has to happen here rather than in the
 * request because the backend rejects sort params outright:
 *
 *   GET /users?sortBy=createdAt&sortOrder=desc
 *   -> 400 ["property sortBy should not exist", "property sortOrder should not exist"]
 *
 * (verified 2026-08-25 — see BACKEND_GAPS.md). That is fine for now: these pages
 * fetch the whole set (`limit: 100`) and render it without pagination, so
 * sorting the loaded rows sorts everything the user can see. If server-side
 * paging ever lands, this has to move into the query or it will silently sort
 * one page and look wrong.
 */

// `undefined`/`null`/'—' always sink to the bottom, whichever direction is
// picked — an unknown value is not "smallest", it is missing.
function isBlank(v) {
  return v === null || v === undefined || v === '' || v === '—';
}

function compare(a, b) {
  if (isBlank(a) && isBlank(b)) return 0;
  if (isBlank(a)) return 1;
  if (isBlank(b)) return -1;

  if (typeof a === 'number' && typeof b === 'number') return a - b;

  // ISO-ish date strings sort chronologically, not lexically ("2 Feb" < "10 Jan"
  // as text, which is wrong).
  const da = Date.parse(a);
  const db = Date.parse(b);
  if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db;

  return String(a).localeCompare(String(b), 'en', { numeric: true, sensitivity: 'base' });
}

/**
 * @param rows  the rows to sort (not mutated)
 * @param sort  "key" or "key:asc" / "key:desc"; falsy leaves the order alone
 */
export function sortRows(rows, sort) {
  if (!sort || !Array.isArray(rows)) return rows;
  const [key, dir = 'asc'] = String(sort).split(':');
  if (!key) return rows;
  const sign = dir === 'desc' ? -1 : 1;
  // Blanks are pinned to the bottom, so their comparison is not flipped.
  return [...rows].sort((a, b) => {
    const av = a?.[key];
    const bv = b?.[key];
    if (isBlank(av) || isBlank(bv)) return compare(av, bv);
    return sign * compare(av, bv);
  });
}

export default sortRows;
