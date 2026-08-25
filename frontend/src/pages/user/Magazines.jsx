import { useState } from "react";
import { useNavigate } from "react-router";
import MagazineCollection, {
  ViewToggle,
} from "@/components/user/MagazineCollection";
import ErrorState from "@/components/ui/error-state";
import useAsync from "@/hooks/useAsync";
import { magazinesApi, listOf, toMagazineCard } from "@/lib/api";

/**
 * Magazine catalogue. Defaults to the block/grid layout
 * (design/user - magazines - block layout.png) and toggles to a stacked list
 * (design/user - magazines - second layout.png).
 */
export default function Magazines() {
  const navigate = useNavigate();
  const [view, setView] = useState("grid");
  // Failure here used to be a console.warn, leaving an empty catalogue with no
  // way to tell "nothing published yet" from "the request failed".
  const {
    data: mags,
    error,
    loading,
    reload,
  } = useAsync(() => magazinesApi.list({ status: "LIVE", limit: 24 }), [], {
    initial: [],
    map: (res) => listOf(res).map(toMagazineCard),
  });

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Magazines</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse every edition available to you
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
    </div>
  );
}
