import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "@/components/Button.jsx";
import PdfReader from "@/components/reader/PdfReader";
import { magazinesApi, MAGAZINE_PLACEHOLDER } from "@/lib/api";
import { API_ORIGIN, ORG } from "@/config/constants";

// Resolve a possibly-relative backend asset path to an absolute URL.
const asset = (url) => (url ? (url.startsWith("http") ? url : `${API_ORIGIN}${url}`) : null);

/**
 * Single magazine view (reader entry point). Fetched by id via GET /magazines/:id
 * so it always has the full record — including the PDF link to read.
 */
export default function MagazineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mag, setMag] = useState(null);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(false);
  const [readError, setReadError] = useState("");
  // A 403 means the plan does not cover this magazine — a different situation
  // from a broken request, and the only one worth offering an upgrade for.
  const [notInPlan, setNotInPlan] = useState(false);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    magazinesApi
      .get(id)
      .then((m) => alive && setMag(m))
      .catch((err) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, [id]);

  /**
   * Fetch a fresh presigned URL for the reader.
   *
   * `GET /magazines/:id/read` returns `{ url, title, expiresIn }` — a presigned
   * S3 link valid for 900s — and records the read. It is the only way in: the
   * page used to link straight at `pdfUrl`, so the endpoint never ran and
   * `readsCount` never moved, which is why every Performance tab showed 0 reads.
   *
   * This is passed to PdfReader as a function, not a string, so the reader can
   * re-presign when a long reading session outlives the 900s window.
   */
  const loadPdfUrl = useCallback(async () => {
    const res = await magazinesApi.read(id);
    // `pdfUrl` is the pre-S3 field name; kept as a fallback so the reader still
    // works if a stale backend build is deployed.
    const href = res?.url || res?.pdfUrl;
    if (!href) throw new Error("This magazine has no readable file yet.");
    // Presigned S3 links are absolute; only a legacy relative path needs the
    // API origin prepended.
    return href.startsWith("http") ? href : asset(href);
  }, [id]);

  /**
   * Open the reader. The URL is fetched once up front rather than inside the
   * reader so that an auth or subscription failure lands on this page, where
   * there is somewhere useful to send the user — showing a 403 inside a
   * full-screen black reader would be a dead end.
   */
  async function handleRead() {
    if (opening) return;
    setOpening(true);
    setReadError("");
    setNotInPlan(false);
    try {
      await loadPdfUrl();
      setReading(true);
    } catch (err) {
      if (err.status === 403) setNotInPlan(true);
      else setReadError(err.message || "Could not open this magazine.");
    } finally {
      setOpening(false);
    }
  }

  if (error) {
    return <div className="p-6 text-sm text-red-500">Could not load this magazine: {error}</div>;
  }
  if (!mag) {
    return <div className="p-6 text-sm text-slate-400">Loading…</div>;
  }

  const cover = asset(mag.coverImageUrl) || MAGAZINE_PLACEHOLDER;
  const pdfHref = asset(mag.pdfUrl);
  const price = Number(mag.price ?? 0);

  if (reading) {
    return (
      <PdfReader
        loadUrl={loadPdfUrl}
        title={mag.title}
        onClose={() => setReading(false)}
      />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-slate-500 hover:text-slate-800"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[320px_1fr]">
        <img
          src={cover}
          alt={mag.title}
          className="w-full rounded-2xl border border-slate-200 object-cover"
        />

        <div>
          <h1 className="text-2xl font-bold text-slate-900">{mag.title}</h1>
          <p className="mt-2 text-slate-600">{mag.shortDescription || mag.description || ""}</p>
          {mag.description && mag.shortDescription && (
            <p className="mt-4 whitespace-pre-line text-sm text-slate-500">{mag.description}</p>
          )}

          <div className="mt-4 text-lg font-semibold text-slate-900">
            {price > 0 ? `${ORG.currencySymbol}${price.toLocaleString("en-IN")}` : "Free"}
          </div>

          <div className="mt-6">
            {pdfHref ? (
              <>
                <Button text="Read Magazine" handler={handleRead} loading={opening} />
                {notInPlan && (
                  <div
                    role="alert"
                    className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                  >
                    This magazine isn&apos;t included in your current plan.{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/user/subscriptions")}
                      className="font-medium underline underline-offset-2"
                    >
                      See plans that include it
                    </button>
                  </div>
                )}
                {readError && <p className="mt-2 text-sm text-red-600">{readError}</p>}
              </>
            ) : (
              <p className="text-sm text-slate-400">This magazine has no readable file yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
