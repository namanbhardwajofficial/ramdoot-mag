import { useState } from "react";
import Drawer from "@/components/ui/drawer";
import AccountMenu from "@/components/ui/account-menu";
import NotificationBell from "@/components/ui/notification-bell";
import { Link } from "react-router";

const iconMap = {
  home: HomeIcon,
  users: UsersIcon,
  magazines: MagazineIcon,
  subscriptions: SubscriptionsIcon,
  campaigns: MegaphoneIcon,
  "influencer-campaigns": MegaphoneIcon,
  publications: BookIcon,
  payments: PaymentsIcon,
  security: ShieldIcon,
  settings: SettingsIcon,
  help: HelpIcon,
  earnings: PaymentsIcon,
};

export default function Nav({
  activePage,
  items = [],
  footerItems = [],
  basePath = "",
}) {
  const [open, setOpen] = useState(false);

  function SidebarContent({ onClose } = {}) {
    return (
      <div className="w-84 bg-[#f0eeef] border-slate-200 h-full flex flex-col justify-between">
        <div className="px-6 pt-6">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-lg font-semibold">RAMDOOT</div>
              <div className="text-xs text-slate-400">foundation</div>
            </div>
          </div>

          <nav className="mt-8 space-y-1" aria-label="Sidebar">
            {items.map((item) => {
              const isActive = item.key === activePage;
              const Icon = iconMap[item.key];

              return (
                <Link
                  key={item.key}
                  to={`${basePath}/${item.key}`}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={`group w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                    isActive
                      ? "bg-white text-slate-900 font-medium shadow-sm"
                      : "text-slate-700 hover:bg-[#ffffff]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="w-5 h-5 text-slate-400 group-hover:text-slate-600">
                    <Icon aria-hidden />
                  </span>

                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-6 pb-6">
          <nav className="space-y-1 mb-4" aria-label="Footer navigation">
            {footerItems.map((item) => {
              const Icon = iconMap[item.key];

              return (
                <Link
                  key={item.key}
                  to={`${basePath}/${item.key}`}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className="group w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left text-slate-700 hover:bg-[#ffffff] transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <span className="w-5 h-5 text-slate-400 group-hover:text-slate-600">
                    <Icon aria-hidden />
                  </span>

                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <AccountMenu onNavigate={onClose} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-white">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-md hover:bg-slate-100 text-slate-700"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="text-lg font-semibold">RAMDOOT</div>

        <div className="flex items-center gap-2">
          {/* This was a hand-drawn bell with no handler — the mobile header's
              only notification affordance, and it did nothing. The real
              component (with the unread badge and the drawer) already exists
              and is what the desktop top bar uses. */}
          <NotificationBell className="h-9 w-9 rounded-md border-0 shadow-none" />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-84 bg-[#f0eeef] border-slate-200 h-screen flex flex-col justify-between shrink-0"
        aria-label="Primary Navigation"
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <Drawer open={open} onClose={() => setOpen(false)} title="Menu">
        <SidebarContent onClose={() => setOpen(false)} />
      </Drawer>
    </>
  );
}

/* ---------------- ICONS ---------------- */

function HomeIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function SubscriptionsIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </svg>
  );
}

function MegaphoneIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function BookIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function PaymentsIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M1 10h22" />
    </svg>
  );
}

function ShieldIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.08 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function HelpIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    </svg>
  );
}

function MagazineIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h8M8 15h4" />
    </svg>
  );
}
