import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import MagazineCollection, {
  ViewToggle,
} from "@/components/user/MagazineCollection";
import { magazinesApi, listOf, toMagazineCard } from "@/lib/api";

/**
 * Magazine catalogue. Defaults to the block/grid layout
 * (design/user - magazines - block layout.png) and toggles to a stacked list
 * (design/user - magazines - second layout.png).
 */
export default function Magazines() {
  const navigate = useNavigate();
  const [view, setView] = useState("grid");
  const [mags, setMags] = useState([]);

  useEffect(() => {
    let alive = true;
    magazinesApi
      .list({ status: "LIVE", limit: 24 })
      .then((res) => {
        const items = listOf(res).map(toMagazineCard);
        if (alive) setMags(items);
      })
      .catch((err) => console.warn("magazines", err.message));
    return () => {
      alive = false;
    };
  }, []);

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

      <MagazineCollection
        magazines={mags}
        view={view}
        onRead={(m) => navigate(`/user/magazines/${m.id}`)}
      />
    </div>
  );
}
