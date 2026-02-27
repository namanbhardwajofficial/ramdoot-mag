import { useState, useEffect } from "react";
import Nav from "./componets/nav";
import ErrorBoundary from "./componets/ErrorBoundary";
import Magazines from "./pages/magazines";
import Subscriptions from "./pages/subscriptions";
import Payments from "./pages/payments";
import Publications from "./pages/publications";
import Users from "./pages/users";
import InfluencerCampaigns from "./pages/influencer-campaigns";
import { useRazorpay } from "./componets/RazorpayButton";
import { BACKEND_URL } from "./config/constants";

function App() {
  const [activePage, setActivePage] = useState("users");
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
    pay({ magazineId: magazine.id });
  }

  function renderPage() {
    switch (activePage) {
      case "subscriptions":
        return <Subscriptions />;
      case "payments":
        return <Payments />;
      case "publications":
        return <Publications />;
      case "users":
        return <Users />;
      case "influencer-campaigns":
        return <InfluencerCampaigns />;
      case "magazine":
        return (
          <Magazines
            magazines={magazines}
            handleBuy={handleBuy}
            loading={loading}
            message={message}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p className="text-lg">{activePage.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — Coming soon</p>
          </div>
        );
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f0eeef]">
      <Nav activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm m-2 overflow-auto">
        <ErrorBoundary key={activePage}>
          {renderPage()}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
