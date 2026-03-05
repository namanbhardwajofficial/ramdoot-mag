import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {createBrowserRouter} from "react-router";
import {RouterProvider} from "react-router/dom";
import Login from "./pages/Login.jsx";
import Users from "./pages/users.jsx"
import Magazines from "@/pages/magazines.jsx";
import Subscriptions from "@/pages/subscriptions.jsx";
import InfluencerCampaigns from "@/pages/influencer-campaigns.jsx";
import Payments from "@/pages/payments.jsx";
import Publications from "@/pages/publications.jsx";
import {BACKEND_URL} from "@/config/constants.js";
import dummyMagazines from "@/data/dummyMagazines.js";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Users /> },
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
    }
]);


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <RouterProvider router={router} />
  </React.StrictMode>
);
