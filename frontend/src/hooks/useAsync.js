import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * One fetch, with its own loading flag, error message and retry.
 *
 * Most page-local loads in this app were written as
 *
 *     api.something().then(setRows).catch((e) => console.warn('rows', e.message))
 *
 * which turns every failure into an empty screen: the table says "No data
 * found", the card says "₹ 0", and the only trace is a line in a console nobody
 * has open. This gives each of those an error the user can actually see and a
 * button that tries again.
 *
 * @param fn      async function returning the data
 * @param deps    re-run when these change (same contract as useEffect)
 * @param options `initial` seeds `data`; `map` transforms the resolved value;
 *                `enabled: false` holds the fetch back (e.g. waiting on an id)
 */
export default function useAsync(fn, deps = [], { initial = null, map, enabled = true } = {}) {
  const [data, setData] = useState(initial);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(enabled);

  // Keep the latest fn/map without making them part of the dep list — callers
  // pass inline arrows, which would otherwise re-run the fetch every render.
  const fnRef = useRef(fn);
  const mapRef = useRef(map);
  fnRef.current = fn;
  mapRef.current = map;

  // Ignore a resolution that lands after the inputs changed or the component
  // went away, so a slow first request cannot overwrite a fast second one.
  const runId = useRef(0);

  const load = useCallback(() => {
    if (!enabled) return Promise.resolve();
    const id = ++runId.current;
    setLoading(true);
    setError(null);
    return Promise.resolve()
      .then(() => fnRef.current())
      .then((res) => {
        if (runId.current !== id) return;
        setData(mapRef.current ? mapRef.current(res) : res);
      })
      .catch((err) => {
        if (runId.current !== id) return;
        setError(err?.message || 'Something went wrong');
      })
      .finally(() => {
        if (runId.current === id) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    load();
    return () => {
      // Invalidate whatever is in flight.
      runId.current++;
    };
  }, [load]);

  return { data, error, loading, reload: load, setData };
}
