import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Button from "@/components/Button.jsx";
import { magazinesApi, MAGAZINE_PLACEHOLDER } from "@/lib/api";
import { BACKEND_URL, ORG } from "@/config/constants";

// Resolve a possibly-relative backend asset path to an absolute URL.
const asset = (url) => (url ? (url.startsWith("http") ? url : `${BACKEND_URL}${url}`) : null);

/**
 * Single magazine view (reader entry point). Fetched by id via GET /magazines/:id
 * so it always has the full record — including the PDF link to read.
 */
export default function MagazineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mag, setMag] = useState(null);
  const [error, setError] = useState("");

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
              <a href={pdfHref} target="_blank" rel="noreferrer">
                <Button text="Read Magazine" />
              </a>
            ) : (
              <p className="text-sm text-slate-400">This magazine has no readable file yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
