import { useState, useEffect } from "react";
import MagazineCollection, {
  ViewToggle,
} from "@/components/user/MagazineCollection";
import USER_MAGAZINES from "@/data/userMagazines";
import { magazinesApi, listOf, toMagazineCard } from "@/lib/api";

/**
 * User dashboard home — a hero pitch followed by the magazine collection.
 * See design/User - home.png.
 */
export default function Home() {
  const [view, setView] = useState("list");
  const [mags, setMags] = useState(USER_MAGAZINES);

  useEffect(() => {
    let alive = true;
    magazinesApi
      .list({ status: "LIVE", limit: 12 })
      .then((res) => {
        const items = listOf(res).map(toMagazineCard);
        if (alive && items.length) setMags(items);
      })
      .catch((err) => console.warn("magazines", err.message));
    return () => {
      alive = false;
    };
  }, []);

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
              List of all the magazines you been looking for
            </p>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <MagazineCollection magazines={mags} view={view} />
      </section>
    </div>
  );
}
