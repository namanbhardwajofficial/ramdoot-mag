import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Vite resolves the worker to a hashed asset URL at build time. Pinning it this
// way (rather than a CDN string) keeps the worker and the library on the exact
// same version — a mismatch there fails with an opaque "API version does not
// match Worker version" that looks like a corrupt PDF.
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

/**
 * In-app PDF reader.
 *
 * Renders each page to a <canvas> rather than handing the file to the browser's
 * built-in viewer. That is the whole point: `<iframe src={pdf}>` ships Chrome's
 * PDF toolbar, which has Download and Print buttons and exposes the real file
 * URL — so embedding a presigned URL directly would hand the file over on the
 * first click and make the 15-minute expiry meaningless.
 *
 * What this does NOT do is stop a determined user. The bytes reach the browser
 * to be drawn at all, so anyone who opens devtools can pull the presigned URL
 * out of the network tab and fetch it within its window. This raises the effort
 * from "click Download" to "know what a network tab is"; real protection
 * against a motivated copier is DRM, which is a different project.
 *
 * `loadUrl` is an async function returning a fresh presigned URL. It is a
 * function rather than a string because the URL expires (900s) — when S3 starts
 * refusing a range request mid-read we call it again to re-presign.
 */
export default function PdfReader({ loadUrl, title, onClose }) {
  const canvasRef = useRef(null);
  const docRef = useRef(null);
  // Cancels an in-flight page render when the user pages or zooms faster than a
  // page can draw; without this, two renders race onto the same canvas and
  // pdfjs throws "Cannot use the same canvas during multiple render()".
  const taskRef = useRef(null);
  const retriedRef = useRef(false);

  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoomIdx, setZoomIdx] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rendering, setRendering] = useState(false);

  // --- load the document -------------------------------------------------
  const openDoc = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = await loadUrl();
      const doc = await pdfjsLib.getDocument({ url }).promise;
      docRef.current = doc;
      setNumPages(doc.numPages);
      setPage((p) => Math.min(p, doc.numPages));
    } catch (err) {
      setError(err?.message || "Could not open this magazine.");
    } finally {
      setLoading(false);
    }
  }, [loadUrl]);

  useEffect(() => {
    openDoc();
    return () => {
      taskRef.current?.cancel();
      docRef.current?.destroy();
      docRef.current = null;
    };
  }, [openDoc]);

  // --- render the current page ------------------------------------------
  useEffect(() => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas || loading || error) return;

    let cancelled = false;
    (async () => {
      setRendering(true);
      try {
        taskRef.current?.cancel();
        const pdfPage = await doc.getPage(page);

        // Draw at the device's real pixel density, then scale back down in CSS.
        // Rendering at CSS pixels on a high-DPI screen produces soft text.
        const dpr = window.devicePixelRatio || 1;
        const viewport = pdfPage.getViewport({ scale: ZOOMS[zoomIdx] * dpr });
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const task = pdfPage.render({ canvasContext: ctx, viewport });
        taskRef.current = task;
        await task.promise;
        retriedRef.current = false;
      } catch (err) {
        if (cancelled || err?.name === "RenderingCancelledException") return;
        // A page fetched after the presign expired fails here. Re-open the
        // document once with a fresh URL; a second failure is a real error.
        if (!retriedRef.current) {
          retriedRef.current = true;
          openDoc();
          return;
        }
        setError(err?.message || "Could not render this page.");
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, zoomIdx, loading, error, openDoc]);

  // --- keyboard + save/print blocking ------------------------------------
  useEffect(() => {
    function onKey(e) {
      // Ctrl/Cmd+S and Ctrl/Cmd+P are the two one-keystroke ways out of a
      // canvas reader. Blocking them is a speed bump, not a guarantee — the
      // print dialog can still be reached through the browser's own menu.
      if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        setPage((p) => Math.min(numPages, p + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setPage((p) => Math.max(1, p - 1));
      } else if (e.key === "Escape") {
        onClose?.();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [numPages, onClose]);

  const zoomPct = `${Math.round(ZOOMS[zoomIdx] * 100)}%`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Toolbar — ours, not the browser's. No download, no print. */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-200">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1.5 text-sm hover:bg-slate-700"
          >
            &larr; Close
          </button>
          <span className="truncate text-sm font-medium">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            aria-label="Previous page"
            className="rounded-lg px-2.5 py-1.5 text-sm hover:bg-slate-700 disabled:opacity-30"
          >
            &lsaquo;
          </button>
          <span className="min-w-20 text-center text-sm tabular-nums">
            {loading ? "—" : `${page} / ${numPages}`}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={page >= numPages || loading}
            aria-label="Next page"
            className="rounded-lg px-2.5 py-1.5 text-sm hover:bg-slate-700 disabled:opacity-30"
          >
            &rsaquo;
          </button>

          <span className="mx-2 h-5 w-px bg-slate-600" />

          <button
            type="button"
            onClick={() => setZoomIdx((z) => Math.max(0, z - 1))}
            disabled={zoomIdx === 0}
            aria-label="Zoom out"
            className="rounded-lg px-2.5 py-1.5 text-sm hover:bg-slate-700 disabled:opacity-30"
          >
            &minus;
          </button>
          <span className="min-w-14 text-center text-sm tabular-nums">{zoomPct}</span>
          <button
            type="button"
            onClick={() => setZoomIdx((z) => Math.min(ZOOMS.length - 1, z + 1))}
            disabled={zoomIdx === ZOOMS.length - 1}
            aria-label="Zoom in"
            className="rounded-lg px-2.5 py-1.5 text-sm hover:bg-slate-700 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      {/* Page area */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <p className="mt-10 text-center text-sm text-slate-400">Opening magazine&hellip;</p>
        ) : error ? (
          <div className="mx-auto mt-10 max-w-md text-center">
            <p role="alert" className="text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={openDoc}
              className="mt-4 rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-600"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              // Right-click on a canvas offers "Save image as…", which would
              // hand over the rendered page as a PNG.
              onContextMenu={(e) => e.preventDefault()}
              className={`rounded shadow-2xl transition-opacity ${
                rendering ? "opacity-60" : "opacity-100"
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
