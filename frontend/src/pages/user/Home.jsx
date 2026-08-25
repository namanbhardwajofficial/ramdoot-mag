import { useState } from "react";
import { useNavigate } from "react-router";
import MagazineCollection, {
  ViewToggle,
} from "@/components/user/MagazineCollection";
import ErrorState from "@/components/ui/error-state";
import useAsync from "@/hooks/useAsync";
import { magazinesApi, listOf, toMagazineCard } from "@/lib/api";

/**
 * User dashboard home — a hero pitch followed by the magazine collection.
 * See design/User - home.png.
 */
export default function Home() {
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  // Failure here used to be a console.warn, which left the page looking like a
  // catalogue with nothing in it.
  const {
    data: mags,
    error,
    loading,
    reload,
  } = useAsync(() => magazinesApi.list({ status: "LIVE", limit: 12 }), [], {
    initial: [],
    map: (res) => listOf(res).map(toMagazineCard),
  });

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl bg-linear-to-br from-slate-100 to-slate-50 px-6 py-10 md:px-10 md:py-12">
        <h1 className="max-w-2xl text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
          Magazines which focus on real history not pirated one.
        </h1>
        <p className="mt-4 max-w-xl text-sm text-slate-500">
          Choose your subscription plans to get magazines every month,
          subscription plans to get magazines every month.
        </p>
      </section>

      {/* Magazine collection */}
      <section>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Magazines</h2>
            <p className="mt-1 text-sm text-slate-500">
              Fresh editions, published every month
            </p>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : loading ? (
          <p className="py-10 text-center text-sm text-slate-400">Loading magazines&hellip;</p>
        ) : (
          <MagazineCollection
            magazines={mags}
            view={view}
            onRead={(m) => navigate(`/user/magazines/${m.id}`)}
          />
        )}
      </section>
    </div>
  );
}
