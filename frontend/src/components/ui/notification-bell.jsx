import { useState } from 'react';
import { BellIcon, InfoIcon, XIcon } from '@/components/ui/icons';
import Drawer from '@/components/ui/drawer';

// Mock notifications — replace with a real feed later.
const INITIAL = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: "We've just released a new feature",
  body: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur, ipsum dolor.',
}));

/**
 * Bell button with an unread dot that opens a right-side Notifications drawer.
 * Each item can be dismissed. See design/user -notifications.png.
 */
export default function NotificationBell({ className = '' }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(INITIAL);

  const dismiss = (id) => setItems((prev) => prev.filter((n) => n.id !== id));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Notifications"
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 ${className}`}
      >
        <BellIcon className="h-5 w-5" />
        {items.length > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        )}
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Notifications">
        {items.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            You&apos;re all caught up
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li key={n.id} className="flex items-start gap-3 py-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400">
                  <InfoIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{n.body}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(n.id)}
                  aria-label="Dismiss"
                  className="shrink-0 text-slate-300 hover:text-slate-500"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </>
  );
}
