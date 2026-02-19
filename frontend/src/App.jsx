import { useState } from "react";
import Nav from "./componets/nav"

function App() {
  const [message, setMessage] = useState("");

  

  return (
    <div className="flex min-h-screen bg-[#f0eeef]">
      <Nav />
      <main className="flex-1 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm m-2">
        <h1 className="text-2xl font-bold mb-4">Welcome to RAMDOOT Magazine</h1>
        <p className="text-gray-700 mb-4">
          Explore the latest articles, stories, and insights from our talented writers.
        </p>
       
        {message && <p className="mt-4 text-green-600">{message}</p>}
      </main>
    </div>
  );
}

export default App;
