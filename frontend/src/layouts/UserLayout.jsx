import Nav from "@/components/nav";
import ErrorBoundary from "@/components/ErrorBoundary";
import TopBar from "@/components/ui/top-bar";
import { Outlet, useLocation, useNavigate } from "react-router";
import { User_NAV } from "../config/constants";

function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activePage =
    location.pathname.split("/")[2] || "home";

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#f0eeef]">
      <Nav
        activePage={activePage}
        items={User_NAV.main}
        footerItems={User_NAV.footer}
        basePath="/user"
      />

      <main className="flex-1 p-2 md:p-6 bg-white rounded-none md:rounded-2xl border border-slate-200 shadow-sm m-0 md:m-2 overflow-auto">
        <TopBar className="mb-6" />
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default UserLayout;