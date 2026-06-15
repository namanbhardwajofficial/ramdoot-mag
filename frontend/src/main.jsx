import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import { BACKEND_URL } from "@/config/constants.js";
import dummyMagazines from "@/data/dummyMagazines.js";

// Landing is the homepage entry — keep it eager so it paints immediately.
import Landing from "./pages/Landing.jsx";

// Everything else is lazy-loaded so it stays out of the homepage's critical bundle.
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Users = lazy(() => import("./pages/admin/users.jsx"));
const Magazines = lazy(() => import("@/pages/admin/magazines.jsx"));
const Subscriptions = lazy(() => import("@/pages/admin/subscriptions.jsx"));
const InfluencerCampaigns = lazy(() => import("@/pages/admin/influencer-campaigns.jsx"));
const Payments = lazy(() => import("@/pages/admin/payments.jsx"));
const Publications = lazy(() => import("@/pages/admin/publications.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const InfluencerDashboard = lazy(() => import("./pages/influencers/InfluencerDashboard.jsx"));
const InfluencerCampaignList = lazy(() => import("./pages/influencers/Campaigns.jsx"));
const CampaignDetails = lazy(() => import("./pages/influencers/CampaignDetails.jsx"));
const AdminLayout = lazy(() => import("./layouts/adminLayout.jsx"));
const InfluencerLayout = lazy(() => import("./layouts/InfluencerLayout.jsx"));
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
    element: withSuspense(<AdminLayout />),
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: withSuspense(<AdminDashboard />) },
      { path: "users", element: withSuspense(<Users />) },
      {
        path: "magazines",
        element: withSuspense(<Magazines />),
        loader: async () => {
          try {
            const res = await fetch(`${BACKEND_URL}/magazines`);
            return await res.json();
          } catch (err) {
            console.log("Backend not running:", err);
            return dummyMagazines;
          }
        },
      },
      { path: "subscriptions", element: withSuspense(<Subscriptions />) },
      { path: "publications", element: withSuspense(<Publications />) },
      { path: "influencer-campaigns", element: withSuspense(<InfluencerCampaigns />) },
      { path: "payments", element: withSuspense(<Payments />) },
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
    path: "influencer",
    element: withSuspense(<InfluencerLayout />),
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: withSuspense(<InfluencerDashboard />) },
      { path: "campaigns", element: withSuspense(<InfluencerCampaignList />) },
      { path: "campaigns/:id", element: withSuspense(<CampaignDetails />) },
      { path: "help", element: withSuspense(<Help />) },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
