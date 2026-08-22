import { useNavigate } from "react-router";
import { isAuthenticated, getStoredUser, routeForRole } from "@/lib/api";

/**
 * Destinations for the public landing page's calls to action.
 *
 * Visitors who are already signed in skip the auth screens and go straight to
 * their own area — bouncing a logged-in user to /login just to be redirected
 * back is a confusing round trip.
 */
export default function useLandingNav() {
  const navigate = useNavigate();
  const ownArea = () => navigate(routeForRole(getStoredUser()?.role));

  return {
    login: () => (isAuthenticated() ? ownArea() : navigate("/login")),
    signup: () => (isAuthenticated() ? ownArea() : navigate("/signup")),

    // Plans live behind the USER area; anyone else lands in their own area.
    subscribe: () => {
      if (!isAuthenticated()) return navigate("/signup");
      const role = String(getStoredUser()?.role || "").toUpperCase();
      return role === "USER" ? navigate("/user/subscriptions") : ownArea();
    },
  };
}
