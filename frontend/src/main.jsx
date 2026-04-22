import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {createBrowserRouter} from "react-router";
import {RouterProvider} from "react-router/dom";
import Login from "./pages/Login.jsx";
import Users from "./pages/admin/users.jsx"
import Magazines from "@/pages/admin/magazines.jsx";
import Subscriptions from "@/pages/admin/subscriptions.jsx";
import InfluencerCampaigns from "@/pages/admin/influencer-campaigns.jsx";
import Payments from "@/pages/admin/payments.jsx";
import Publications from "@/pages/admin/publications.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx"
import {BACKEND_URL} from "@/config/constants.js";
import dummyMagazines from "@/data/dummyMagazines.js";
import InfluencerDashboard from "./pages/influencers/InfluencerDashboard.jsx"

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { path: "home", element: <AdminDashboard /> },
            { path: "users", element: <Users /> },
            { path: "magazines",
              element: <Magazines /> ,
              loader: async () => {
                    try {
                        const res = await fetch(`${BACKEND_URL}/magazines`);
                        return await res.json();
                    } catch (err) {
                        console.log("Backend not running:", err);
                        return dummyMagazines;
                    }
              }
            },
            { path: "subscriptions", element: <Subscriptions />},
            { path: "publications", element: <Publications /> },
            { path: "influencer-campaigns", element: <InfluencerCampaigns /> },
            { path: "payments", element: <Payments /> }
        ]
    },
    {
        path: "login",
        element: <Login />
    },
    {
        path: "influencer",
        element: <App />,
        children: [
            { index: true, element: <InfluencerDashboard />}
        ]
    }
]);


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <RouterProvider router={router} />
  </React.StrictMode>
);
