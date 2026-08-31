import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { clearAuth, getStoredUser, routeForRole } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, LogOutIcon, ChevronDownIcon } from "@/components/ui/icons";

function initialsFrom(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "RF";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

// Each role has its own settings route, and "My details" is its first tab —
// which is what "View profile" means here. routeForRole owns the role→prefix
// mapping so this cannot drift from where login sends people.
const profilePathFor = (role) => `${routeForRole(role)}/settings`;

/**
 * Account switcher shown at the bottom of the sidebar. Clicking the avatar
 * row opens a popover (anchored above the trigger) with profile, account and
 * sign-out actions — see design/Profile Open.png.
 *
 * `onNavigate` lets the parent close the mobile drawer when an action routes
 * away.
 */
export default function AccountMenu({ onNavigate }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // These used to fall back to a fabricated identity — the name "Atharv", the
  // address atharv@ramdootfoundation.com, and shadcn's own GitHub avatar — so a
  // signed-in user whose record had not loaded was shown someone else's details
  // as if they were their own. An empty slot is the honest state.
  const user = getStoredUser();
  const name = user?.fullName || user?.name || "";
  const email = user?.email || "";
  const avatarUrl = user?.avatar || undefined;

  // Close on outside click / Escape while the popover is open.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleSignOut() {
    clearAuth();
    setOpen(false);
    if (onNavigate) onNavigate();
    navigate("/login");
  }

  // "View profile" only closed the popover — it had no destination at all.
  function handleViewProfile() {
    setOpen(false);
    if (onNavigate) onNavigate();
    navigate(profilePathFor(user?.role));
  }

  return (
    <div ref={ref} className="relative border-t border-slate-200 pt-4">
      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {/* View profile */}
          <button
            type="button"
            role="menuitem"
            onClick={handleViewProfile}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <UserIcon className="h-5 w-5 text-slate-400" />
            <span>View profile</span>
          </button>

          {/* Current account + add account */}
          <div className="border-t border-slate-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{initialsFrom(name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-900">
                  {name || "Signed in"}
                </div>
                {email && <div className="truncate text-xs text-slate-400">{email}</div>}
              </div>
            </div>

            {/* Was "Add New Account", which closed the popover and did nothing.
                There is no multi-account support to add one to — the session is
                a single token in localStorage, with no account list or switcher
                on either side — so this signs out and returns to the login
                form, which is what the control could honestly do. */}
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Sign in as someone else
            </button>
          </div>

          {/* Sign out */}
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <LogOutIcon className="h-5 w-5 text-slate-400" />
            <span>Sign out</span>
          </button>
        </div>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-white focus:outline-none"
      >
        <Avatar>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{initialsFrom(name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 text-left">
          <div className="truncate text-sm font-medium">{name || "Signed in"}</div>
          {email && <div className="truncate text-xs text-slate-400">{email}</div>}
        </div>

        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}
