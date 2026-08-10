import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import dummyMagazines from "@/data/dummyMagazines.js";
import RequireAuth from "@/components/RequireAuth.jsx";
import { magazinesApi, toMagazineCard } from "@/lib/api";

// Landing is the homepage entry — keep it eager so it paints immediately.
import Landing from "./pages/Landing.jsx";
// 404 + error boundary stay eager so they always render (even if a chunk fails).
import NotFound from "./pages/NotFound.jsx";
import RouteError from "./pages/RouteError.jsx";
import { User } from "lucide-react";

// Everything else is lazy-loaded so it stays out of the homepage's critical bundle.
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const Users = lazy(() => import("./pages/admin/users.jsx"));
//User_Mangement page import Start here
const UserDahboard =lazy(()=>import("./pages/user/UserDashboard.jsx"));
// UserLayout is declared once further down (both branches added it in the merge).
const UserManagment =lazy(()=> import("./pages/user/Users.jsx"));
const UserSubcription =lazy(()=> import("./pages/user/Subscription.jsx"));
const InfluencerCampaignsUser =lazy(()=> import("./pages/user/InfluencersCampaigns.jsx"));
const PublicationsUser =lazy(()=> import("./pages/user/Publications.jsx"));
const UserPayment =lazy(()=> import("./pages/user/payments.jsx"));
const UserSecurity =lazy(()=> import("./pages/user/Security.jsx"));
//user_Mangement page import end here
const Magazines = lazy(() => import("@/pages/admin/magazines.jsx"));
const Subscriptions = lazy(() => import("@/pages/admin/subscriptions.jsx"));
const InfluencerCampaigns = lazy(() => import("@/pages/admin/influencer-campaigns.jsx"));
const Payments = lazy(() => import("@/pages/admin/payments.jsx"));
const Publications = lazy(() => import("@/pages/admin/publications.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const InfluencerDashboard = lazy(() => import("./pages/influencers/InfluencerDashboard.jsx"));
const InfluencerCampaignList = lazy(() => import("./pages/influencers/Campaigns.jsx"));
const CampaignDetails = lazy(() => import("./pages/influencers/CampaignDetails.jsx"));
const Earnings = lazy(() => import("./pages/influencers/Earnings.jsx"));
const RequestPayout = lazy(() => import("./pages/influencers/RequestPayout.jsx"));
const RequestedPayout = lazy(() => import("./pages/influencers/RequestedPayout.jsx"));
const InfluencerSettings = lazy(() => import("./pages/influencers/Settings.jsx"));
const AdminSettings = lazy(() => import("./pages/admin/Settings.jsx"));
const AdminLayout = lazy(() => import("./layouts/adminLayout.jsx"));
const InfluencerLayout = lazy(() => import("./layouts/InfluencerLayout.jsx"));
const UserLayout = lazy(() => import("./layouts/UserLayout.jsx"));
const UserMagazines = lazy(() => import("./pages/user/Magazines.jsx"));
const UserMagazineDetail = lazy(() => import("./pages/user/MagazineDetail.jsx"));
const UserSettings = lazy(() => import("./pages/user/Settings.jsx"));
const Help = lazy(() => import("./pages/Help.jsx"));

const PageFallback = () => (
  <div className="grid min-h-screen place-items-center text-sm text-gray-400">Loading…</div>
);
const withSuspense = (el) => <Suspense fallback={<PageFallback />}>{el}</Suspense>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "admin",
    element: <RequireAuth role="ADMIN">{withSuspense(<AdminLayout />)}</RequireAuth>,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: withSuspense(<AdminDashboard />) },
      { path: "users", element: withSuspense(<Users />) },
      {
        path: "magazines",
        element: withSuspense(<Magazines />),
        loader: async () => {
          // GET /magazines is public; fall back to sample data if the API is down.
          try {
            const page = await magazinesApi.list({ limit: 12 });
            const items = Array.isArray(page?.data) ? page.data : [];
            return items.map(toMagazineCard);
          } catch (err) {
            console.warn("Magazines API unavailable, using sample data:", err.message);
            return dummyMagazines;
          }
        },
      },
      { path: "subscriptions", element: withSuspense(<Subscriptions />) },
      { path: "publications", element: withSuspense(<Publications />) },
      { path: "influencer-campaigns", element: withSuspense(<InfluencerCampaigns />) },
      { path: "payments", element: withSuspense(<Payments />) },
      { path: "settings", element: withSuspense(<AdminSettings />) },
      { path: "help", element: withSuspense(<Help />) },
    ],
  },
  {
    path: "login",
    element: withSuspense(<Login />),
  },
  {
    path: "signup",
    element: withSuspense(<Signup />),
  },
  {
    path: "forgot-password",
    element: withSuspense(<ForgotPassword />),
  },
  {
    path: "influencer",
    element: <RequireAuth role="INFLUENCER">{withSuspense(<InfluencerLayout />)}</RequireAuth>,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: withSuspense(<InfluencerDashboard />) },
      { path: "campaigns", element: withSuspense(<InfluencerCampaignList />) },
      { path: "campaigns/:id", element: withSuspense(<CampaignDetails />) },
      { path: "earnings", element: withSuspense(<Earnings />) },
      { path: "earnings/request-payout", element: withSuspense(<RequestPayout />) },
      { path: "earnings/requested-payout", element: withSuspense(<RequestedPayout />) },
      { path: "settings", element: withSuspense(<InfluencerSettings />) },
      { path: "help", element: withSuspense(<Help />) },
    ],
  },
  {
    path: "user",
    element: <RequireAuth role="USER">{withSuspense(<UserLayout />)}</RequireAuth>,
    errorElement: <RouteError />,
    // Merged in the routing<-origin/routing merge: the incoming branch added a
    // second `path: "user"` block, which shadowed this guarded one entirely.
    // Both child sets now live here so /user stays behind RequireAuth.
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: withSuspense(<UserDahboard />) },
      { path: "users", element: withSuspense(<UserManagment />) },
      { path: "influencer-campaigns", element: withSuspense(<InfluencerCampaignsUser />) },
      { path: "publications", element: withSuspense(<PublicationsUser />) },
      { path: "payments", element: withSuspense(<UserPayment />) },
      { path: "security", element: withSuspense(<UserSecurity />) },
      { path: "magazines", element: withSuspense(<UserMagazines />) },
      { path: "magazines/:id", element: withSuspense(<UserMagazineDetail />) },
      { path: "subscriptions", element: withSuspense(<UserSubcription />) },
      { path: "settings", element: withSuspense(<UserSettings />) },
      { path: "help", element: withSuspense(<Help />) },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
