import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Vite resolves the worker to a hashed asset URL at build time. Pinning it this
// way (rather than a CDN string) keeps the worker and the library on the exact
// same version — a mismatch there fails with an opaque "API version does not
// match Worker version" that looks like a corrupt PDF.
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const FIT = "fit"; // pseudo-zoom: recompute scale from the container width

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
 *
 * Layout is mobile-first: the page fits the viewport width by default, paging
 * is driven by large edge tap zones and a bottom bar sized for thumbs, and the
 * chrome hides itself while reading. The dark ground is deliberate — a white
 * shell around a white page is what makes long reading tiring.
 */
export default function PdfReader({ loadUrl, title, onClose }) {
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const docRef = useRef(null);
  // Cancels an in-flight page render when the user pages or zooms faster than a
  // page can draw; without this, two renders race onto the same canvas and
  // pdfjs throws "Cannot use the same canvas during multiple render()".
  const taskRef = useRef(null);
  const retriedRef = useRef(false);
  const hideTimer = useRef(null);

  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(FIT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rendering, setRendering] = useState(false);
  // Chrome auto-hides so the page itself is what you look at. It comes back on
  // any tap, pointer move, or keypress.
  const [chrome, setChrome] = useState(true);
  const [jumpOpen, setJumpOpen] = useState(false);

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
  const [viewportW, setViewportW] = useState(0);
  const [viewportH, setViewportH] = useState(0);

  // Re-fit on rotate/resize. Without this, turning a phone leaves the page at
  // the old width — either clipped or with a band of empty space beside it.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setViewportW(entry.contentRect.width);
      setViewportH(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [loading, error]);

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

        // "Fit" scales the page to the container, less padding. A magazine page
        // is not a fixed size, so a hardcoded scale is right only by accident.
        // Width alone is not enough: a portrait page fitted to a wide desktop
        // window runs far past the bottom of the screen, so fit takes whichever
        // of the two constraints binds first.
        const base = pdfPage.getViewport({ scale: 1 });
        const pad = viewportW < 640 ? 16 : 48;
        const scale =
          zoom === FIT
            ? Math.max(
                0.2,
                Math.min(
                  (viewportW - pad) / base.width,
                  (viewportH - pad) / base.height,
                ),
              )
            : zoom;

        // Draw at the device's real pixel density, then scale back down in CSS.
        // Rendering at CSS pixels on a high-DPI phone produces soft text.
        const dpr = window.devicePixelRatio || 1;
        const viewport = pdfPage.getViewport({ scale: scale * dpr });
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const task = pdfPage.render({ canvasContext: ctx, viewport });
        taskRef.current = task;
        await task.promise;
        retriedRef.current = false;
        // A new page starts at the top, not wherever the last one was scrolled.
        scrollRef.current?.scrollTo({ top: 0 });
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
  }, [page, zoom, viewportW, viewportH, loading, error, openDoc]);

  // --- paging ------------------------------------------------------------
  const next = useCallback(
    () => setPage((p) => Math.min(numPages, p + 1)),
    [numPages],
  );
  const prev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);

  // --- chrome auto-hide --------------------------------------------------
  const wake = useCallback(() => {
    setChrome(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setChrome(false), 3000);
  }, []);

  useEffect(() => {
    wake();
    return () => clearTimeout(hideTimer.current);
  }, [wake, page]);

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
      wake();
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        prev();
      } else if (e.key === "Escape") {
        if (jumpOpen) setJumpOpen(false);
        else onClose?.();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [next, prev, onClose, wake, jumpOpen]);

  // --- swipe -------------------------------------------------------------
  // Horizontal swipe turns the page; a mostly-vertical drag is left alone so
  // scrolling a zoomed-in page still works.
  const touch = useRef(null);
  function onTouchStart(e) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e) {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next();
      else prev();
    }
  }

  const atStart = page <= 1;
  const atEnd = page >= numPages;
  const zoomLabel = zoom === FIT ? "Fit" : `${Math.round(zoom * 100)}%`;

  function stepZoom(dir) {
    setZoom((z) => {
      if (z === FIT) return dir > 0 ? ZOOMS[3] : ZOOMS[1];
      const i = ZOOMS.indexOf(z);
      const nextI = Math.min(ZOOMS.length - 1, Math.max(0, i + dir));
      return ZOOMS[nextI];
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 select-none"
      onPointerMove={wake}
    >
      {/* ---- Top bar -------------------------------------------------- */}
      <header
        className={`absolute inset-x-0 top-0 z-20 flex items-center gap-2 bg-slate-900/95 px-2 py-2 text-slate-100 backdrop-blur transition-transform duration-300 sm:px-4 ${
          chrome ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reader"
          className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium hover:bg-slate-700 active:bg-slate-600"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="hidden sm:inline">Close</span>
        </button>

        <h1 className="min-w-0 flex-1 truncate text-center text-sm font-medium sm:text-base">
          {title}
        </h1>

        {/* Zoom lives up here so the bottom bar stays entirely about paging. */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => stepZoom(-1)}
            disabled={zoom !== FIT && zoom === ZOOMS[0]}
            aria-label="Zoom out"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-xl hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30"
          >
            &minus;
          </button>
          <button
            type="button"
            onClick={() => setZoom(FIT)}
            aria-label="Fit page to screen"
            className="hidden h-11 min-w-16 items-center justify-center rounded-xl px-2 text-sm tabular-nums hover:bg-slate-700 active:bg-slate-600 sm:flex"
          >
            {zoomLabel}
          </button>
          <button
            type="button"
            onClick={() => stepZoom(1)}
            disabled={zoom === ZOOMS[ZOOMS.length - 1]}
            aria-label="Zoom in"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-xl hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </header>

      {/* ---- Page ------------------------------------------------------ */}
      {/* Padding matches the bar heights so a page at "Fit" is never partly
          underneath them. The bars overlay rather than push, so that hiding
          them does not reflow and re-render the page. */}
      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => (chrome ? setChrome(false) : wake())}
        className={`flex-1 overflow-auto overscroll-contain transition-[padding] duration-300 ${
          chrome ? "pt-16 pb-24" : "pt-0 pb-0"
        }`}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-slate-200" />
              <p className="text-sm">Opening magazine&hellip;</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-6">
            <div className="max-w-sm text-center">
              <p role="alert" className="text-sm leading-relaxed text-red-300">
                {error}
              </p>
              <button
                type="button"
                onClick={openDoc}
                className="mt-5 h-11 rounded-xl bg-slate-700 px-5 text-sm font-medium text-slate-100 hover:bg-slate-600 active:bg-slate-500"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-full items-start justify-center p-2 sm:p-6">
            <canvas
              ref={canvasRef}
              // Right-click on a canvas offers "Save image as…", which would
              // hand over the rendered page as a PNG.
              onContextMenu={(e) => e.preventDefault()}
              className={`rounded-lg bg-white shadow-2xl transition-opacity duration-150 ${
                rendering ? "opacity-40" : "opacity-100"
              }`}
            />
          </div>
        )}
      </div>

      {/* ---- Edge tap zones -------------------------------------------
          Half the screen height down each side. On a phone this is the way
          people actually turn pages — far easier than aiming at a small
          arrow. They sit under the bars so they never eat a toolbar tap. */}
      {!loading && !error && (
        <>
          <button
            type="button"
            onClick={prev}
            disabled={atStart}
            aria-label="Previous page"
            tabIndex={-1}
            className="absolute left-0 top-1/4 z-10 h-1/2 w-16 cursor-pointer disabled:pointer-events-none sm:w-24"
          />
          <button
            type="button"
            onClick={next}
            disabled={atEnd}
            aria-label="Next page"
            tabIndex={-1}
            className="absolute right-0 top-1/4 z-10 h-1/2 w-16 cursor-pointer disabled:pointer-events-none sm:w-24"
          />
        </>
      )}

      {/* ---- Bottom bar ------------------------------------------------
          Every target here is 48px+ and the page buttons are wide, because
          this is the control people use most and thumbs are imprecise. */}
      {!loading && !error && (
        <footer
          className={`absolute inset-x-0 bottom-0 z-20 bg-slate-900/95 backdrop-blur transition-transform duration-300 ${
            chrome ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Progress: a read-through of where you are, tappable to scrub. */}
          <input
            type="range"
            min={1}
            max={Math.max(1, numPages)}
            value={page}
            onChange={(e) => setPage(Number(e.target.value))}
            aria-label="Page position"
            className="block h-1.5 w-full cursor-pointer appearance-none bg-slate-700 accent-white"
          />

          <div className="mx-auto flex max-w-3xl items-center gap-2 px-2 py-2.5 sm:px-4">
            <button
              type="button"
              onClick={prev}
              disabled={atStart}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 text-sm font-medium text-slate-100 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 sm:max-w-40"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Previous</span>
            </button>

            {/* Tapping the counter opens a jump-to-page field — the only way
                to move more than a page at a time on a long magazine. */}
            <button
              type="button"
              onClick={() => setJumpOpen(true)}
              aria-label={`Page ${page} of ${numPages}. Jump to a page`}
              className="h-12 min-w-20 rounded-xl px-3 text-sm font-medium tabular-nums text-slate-300 hover:bg-slate-800 active:bg-slate-700"
            >
              {page} / {numPages}
            </button>

            <button
              type="button"
              onClick={next}
              disabled={atEnd}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 text-sm font-medium text-slate-100 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-30 sm:max-w-40"
            >
              <span>Next</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </footer>
      )}

      {/* ---- Jump to page --------------------------------------------- */}
      {jumpOpen && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/80 px-6"
          onClick={() => setJumpOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(new FormData(e.currentTarget).get("page"));
              if (Number.isFinite(n) && n >= 1 && n <= numPages) setPage(n);
              setJumpOpen(false);
            }}
            className="w-full max-w-xs rounded-2xl bg-slate-800 p-5"
          >
            <label htmlFor="jump-page" className="block text-sm font-medium text-slate-200">
              Go to page
            </label>
            <input
              id="jump-page"
              name="page"
              type="number"
              min={1}
              max={numPages}
              defaultValue={page}
              autoFocus
              inputMode="numeric"
              className="mt-3 h-12 w-full rounded-xl bg-slate-900 px-4 text-base text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-2 focus:ring-slate-400"
            />
            <p className="mt-2 text-xs text-slate-400">1&ndash;{numPages}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setJumpOpen(false)}
                className="h-12 flex-1 rounded-xl bg-slate-700 text-sm font-medium text-slate-100 hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-12 flex-1 rounded-xl bg-white text-sm font-semibold text-slate-900 hover:bg-slate-200"
              >
                Go
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
