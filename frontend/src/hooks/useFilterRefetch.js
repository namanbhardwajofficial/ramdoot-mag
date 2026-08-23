import { useEffect, useRef } from 'react';

/**
 * Re-run a filtered list fetch when the filters change — but skip the first
 * settled value, which `init()` has already loaded.
 *
 * Every admin page paired `useEffect(() => init(), [])` with a second effect
 * that fetched again as soon as `loading` flipped false, so each page fired its
 * list request twice on mount with identical (empty) filters. This keeps the
 * filter-change behaviour, including clearing a filter back to empty, without
 * the duplicate on arrival.
 *
 * @param fetcher  the hook's fetch function (stable, from useCallback)
 * @param filters  plain object of the current filter values
 * @param ready    false while the initial load is in flight
 */
export default function useFilterRefetch(fetcher, filters, ready) {
  const seeded = useRef(false);
  const latest = useRef(filters);
  latest.current = filters;

  // Compared by value: the caller rebuilds this object every render.
  const key = JSON.stringify(filters);

  useEffect(() => {
    if (!ready) return;
    if (!seeded.current) {
      seeded.current = true;
      return;
    }
    fetcher(latest.current);
  }, [key, ready, fetcher]);
}
