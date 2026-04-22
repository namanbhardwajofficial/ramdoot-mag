import Nav from "@/components/nav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Outlet, useLocation, useNavigate } from "react-router";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const activePage =
    location.pathname.split("/")[1] || "users";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f0eeef]">
      <Nav
        activePage={activePage}
        onNavigate={(page) => navigate(`/${page}`)}
      />

      <main className="flex-1 p-2 md:p-6 bg-white rounded-none md:rounded-2xl border border-slate-200 shadow-sm m-0 md:m-2 overflow-auto">
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;