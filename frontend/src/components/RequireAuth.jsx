import { Navigate, useLocation } from "react-router";
import { getToken, getStoredUser, routeForRole } from "@/lib/api";

/**
 * Route guard for authenticated areas.
 *
 * - No access token  -> redirect to /login (remembering where we came from).
 * - Wrong role        -> redirect to the user's own area (admin/influencer/user).
 *
 * Usage in the router:
 *   element: <RequireAuth role="ADMIN">{<AdminLayout />}</RequireAuth>
 */
export default function RequireAuth({ role, children }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role) {
    const userRole = String(getStoredUser()?.role || "").toUpperCase();
    if (userRole !== role.toUpperCase()) {
      return <Navigate to={routeForRole(userRole)} replace />;
    }
  }

  return children;
}
