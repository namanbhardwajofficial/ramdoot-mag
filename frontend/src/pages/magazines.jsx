import Card from "@/components/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { RiHome6Line } from "react-icons/ri";
import {useLoaderData} from "react-router";

export default function Magazines({ handleBuy, loading, message }) {

  let magazines = useLoaderData();

  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/"><RiHome6Line size={15} opacity="50%" /></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Magazines</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
