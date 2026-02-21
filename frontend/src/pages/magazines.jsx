import Card from "@/componets/card"
import { Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
    BreadcrumbList
} from "@/componets/ui/breadcrumb";


export default function Magazines(props) {
    const { magazines, handleView, message } = props;
    return(
         <>
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                    <BreadcrumbLink >Magazines</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Magazines</h1>
            <p className="text-sm text-slate-500">List of all the magazines you been looking for</p>
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
              onView={() => handleView(m)}
            />
          ))}
        </div>

        {message && <p className="mt-6 text-sm text-slate-600">{message}</p>}
      </>
    )
}