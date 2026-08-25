import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "@/components/Button.jsx";
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
   * "Read Magazine" used to be a plain <a> straight to `pdfUrl`, which meant
   * `GET /magazines/:id/read` was never called and `readsCount` never moved —
   * which is why every magazine's Performance tab reports 0 reads. The endpoint
   * resolves the PDF *and* records the read, so it has to be the way in.
   *
   * The window is opened before the await: a `window.open` that happens after
   * an async hop is not attributable to the click any more and gets blocked as
   * a popup. So we open it first and then point it at whatever comes back.
   */
  async function handleRead() {
    if (opening) return;
    setOpening(true);
    setReadError("");
    const tab = window.open("", "_blank", "noopener,noreferrer");
    try {
      const res = await magazinesApi.read(id);
      // Fall back to the record's own pdfUrl if the endpoint answers without one.
      const href = asset(res?.pdfUrl || res?.url) || asset(mag?.pdfUrl);
      if (!href) throw new Error("This magazine has no readable file yet.");
      if (tab) tab.location = href;
      else window.location.assign(href);
    } catch (err) {
      if (tab) tab.close();
      setReadError(err.message || "Could not open this magazine.");
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
