import { useState, useRef, useEffect } from 'react';
import { BellIcon, ClockIcon, CheckCircleIcon, XIcon } from '@/components/ui/icons';

// Mock notifications — replace with a real feed later.
const INITIAL = [
  { id: 1, tone: 'amber', title: "We've just released a new feature" },
  { id: 2, tone: 'green', title: "We've just released a new feature" },
  { id: 3, tone: 'amber', title: "We've just released a new feature" },
  { id: 4, tone: 'amber', title: "We've just released a new feature" },
  { id: 5, tone: 'amber', title: "We've just released a new feature" },
  { id: 6, tone: 'green', title: "We've just released a new feature" },
];

/**
 * Bell button with an unread dot that opens a panel of recent notifications.
 * Each item can be dismissed; closes on outside click or Escape.
 */
export default function NotificationBell({ className = '' }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(INITIAL);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function dismiss(id) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50"
      >
        <BellIcon className="w-5 h-5" />
        {items.length > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 text-sm font-medium text-slate-500 border-b border-slate-100">
            Recent Notifications
          </div>

          <div className="max-h-96 overflow-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                You&apos;re all caught up
              </div>
            ) : (
              items.map((n) => (
                <div key={n.id} className="group flex items-start gap-3 px-4 py-3 hover:bg-slate-50">
                  <span
                    className={`mt-0.5 flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${
                      n.tone === 'green'
                        ? 'bg-emerald-50 text-emerald-500'
                        : 'bg-amber-50 text-amber-500'
                    }`}
                  >
                    {n.tone === 'green' ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <ClockIcon className="w-4 h-4" />
                    )}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800">{n.title}</div>
                    <div className="text-xs text-slate-500">
                      Lorem ipsum dolor sit amet{' '}
                      <a href="#" className="text-slate-700 underline underline-offset-2">
                        consectetur
                      </a>
                      .
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => dismiss(n.id)}
                    aria-label="Dismiss"
                    className="text-slate-300 hover:text-slate-500 shrink-0"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
