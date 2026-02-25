import { useState, useEffect } from "react";
import Nav from "./componets/nav";
import Magazines from "./pages/magazines";
import { useRazorpay } from "./componets/RazorpayButton";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function App() {
  const [magazines, setMagazines] = useState([]);
  const [message, setMessage] = useState("");
  const { pay, loading } = useRazorpay();

  useEffect(() => {
    fetch(`${BACKEND_URL}/magazines`)
      .then((res) => res.json())
      .then(setMagazines)
      .catch((err) => console.error("Failed to fetch magazines", err));
  }, []);

  function handleBuy(magazine) {
    pay({
      amount: magazine.price,
      title: magazine.title,
      description: `Purchase: ${magazine.title}`,
    });
  }

  return (
    <div className="flex min-h-screen bg-[#f0eeef]">
      <Nav />
      <main className="flex-1 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm m-2">
        <Magazines
          magazines={magazines}
          handleBuy={handleBuy}
          loading={loading}
          message={message}
        />
      </main>
    </div>
  );
}

export default App;
