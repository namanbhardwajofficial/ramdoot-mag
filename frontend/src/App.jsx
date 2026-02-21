import { useState } from "react";
import Nav from "./componets/nav"
import Magazines from "./pages/magazines";
import MagazinesDetails from "./componets/magazinesdetails";


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
      <Magazines magazines={magazines} handleView={handleView} message={message} />
      {/* <MagazinesDetails /> */}
      </main>
      
    </div>
  );
}

export default App;