import Card from "@/components/card";
import {useLoaderData} from "react-router";

export default function Magazines({ handleBuy, loading, message }) {

  let magazines = useLoaderData();

  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Magazines</h1>
          <p className="text-sm text-slate-500">
            List of all the magazines you been looking for
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3 py-2 border rounded-md text-sm">Filters</button>
          <button className="px-3 py-2 border rounded-md text-sm">Sort by</button>
          <input
            placeholder="Search"
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {magazines.map((m) => (
          <Card
            key={m.id}
            title={m.title}
            description={m.description}
            image={m.image}
            price={m.price}
            onBuy={() => handleBuy(m)}
            loading={loading}
          />
        ))}
      </div>

      {message && <p className="mt-6 text-sm text-slate-600">{message}</p>}
    </>
  );
}
