import { useState } from "react";
import Nav from "./componets/nav"
import Card from "./componets/card";

function App() {
  const [message, setMessage] = useState("");
  const magazines = [
    {
      id: 1,
      title: "Ramdoot August 2026 Edition",
      description:
        "Curated magazines delivering insights, trends, and inspiration across technology and design.",
        // image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&q=80",
        image: "",
    },
    {
      id: 2,
      title: "Ramdoot July 2026 Edition",
      description:
        "A collection of long-form essays and visual stories on modern product design.",
      image: "",
    },
    {
      id: 3,
      title: "Ramdoot June 2026 Edition",
      description:
        "Features on web performance, accessibility, and the future of front-end tooling.",
      image: "",
    },
    {
      id: 4,
      title: "Ramdoot May 2026 Edition",
      description:
        "Interviews with creators, makers, and engineers shipping delightful products.",
      image: "",
    },
    {
      id: 5,
      title: "Ramdoot April 2026 Edition",
      description:
        "Exploring the latest trends in AI, machine learning, and data science.",
      image: "",
    },
  ];

  function handleView(magazine) {
    setMessage(`Viewing ${magazine.title}`);
    console.log("view", magazine);
  }

  return (
    <div className="flex min-h-screen bg-[#f0eeef]">
      <Nav />
      <main className="flex-1 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm m-2">
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
      </main>
    </div>
  );
}

export default App;
