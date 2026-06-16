import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router/dom";
import { BACKEND_URL } from "@/config/constants.js";
import dummyMagazines from "@/data/dummyMagazines.js";

// Landing is the homepage entry — keep it eager so it paints immediately.
import Landing from "./pages/Landing.jsx";
import { User } from "lucide-react";

// Everything else is lazy-loaded so it stays out of the homepage's critical bundle.
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Users = lazy(() => import("./pages/admin/users.jsx"));
//User_Mangement page import Start here
const UserDahboard =lazy(()=>import("./pages/User/UserDashboard.jsx"));
const UserLayout = lazy(()=> import("./layouts/UserLayout.jsx"));
const UserManagment =lazy(()=> import("./pages/User/Users.jsx"));
const UserSubcription =lazy(()=> import("./pages/User/Subscription.jsx"));
const InfluencerCampaignsUser =lazy(()=> import("./pages/User/InfluencersCampaigns.jsx"));
const PublicationsUser =lazy(()=> import("./pages/User/Publications.jsx"));
const UserPayment =lazy(()=> import("./pages/User/payments.jsx"));
const UserSecurity =lazy(()=> import("./pages/User/Security.jsx"));
const UserSetting =lazy(()=> import("./pages/User/Settings.jsx"));
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
      { path: "settings", element: withSuspense(<AdminSettings />) },
      { path: "help", element: withSuspense(<Help />) },
    ],
  },
  {
    path:"user",
    element:withSuspense(<UserLayout/>),
    children:[
      {index:true,element:<Navigate to ="home" replace/>},
      {path:"home",element:withSuspense(<UserDahboard/>)},
      {path:"users",element:withSuspense(<UserManagment/>)},
      {path:"subscriptions",element:withSuspense(<UserSubcription/>)},
      {path:"influencer-campaigns",element:withSuspense(<InfluencerCampaignsUser/>)},
      {path:"publications",element:withSuspense(<PublicationsUser/>)},
      {path:"payments",element:withSuspense(<UserPayment/>)},
      {path:"security",element:withSuspense(<UserSecurity/>)},
      {path:"settings",element:withSuspense(<UserSetting/>)},
      {path:"help",element:withSuspense(<Help/>)},
    ]
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
      { path: "earnings", element: withSuspense(<Earnings />) },
      { path: "earnings/request-payout", element: withSuspense(<RequestPayout />) },
      { path: "earnings/requested-payout", element: withSuspense(<RequestedPayout />) },
      { path: "settings", element: withSuspense(<InfluencerSettings />) },
      { path: "help", element: withSuspense(<Help />) },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
