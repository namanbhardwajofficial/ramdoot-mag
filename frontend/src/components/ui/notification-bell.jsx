import { useState, useEffect, useCallback } from 'react';
import { BellIcon, InfoIcon, XIcon } from '@/components/ui/icons';
import Drawer from '@/components/ui/drawer';
import ErrorState from '@/components/ui/error-state';
import { notificationsApi, listOf } from '@/lib/api';
import { toastError } from '@/lib/confirm';

/**
 * Bell button with an unread dot that opens a right-side Notifications drawer.
 * Each item can be dismissed (which also marks it read on the server).
 * See design/user -notifications.png.
 */
export default function NotificationBell({ className = '' }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  // A failed load used to console.warn, so the drawer said "You're all caught
  // up" — a claim about the user's inbox — when the request had actually failed.
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const listing = notificationsApi.list().then((res) => {
      const list = listOf(res).map((n) => ({
        id: n.id,
        title: n.title,
        body: n.message,
        isRead: n.isRead,
      }));
      setItems(list);
      // The total lives on `meta`, not the top level — reading it here is
      // free. The dedicated endpoint below confirms it.
      const fromMeta = Number(res?.meta?.unreadCount);
      setUnread(Number.isFinite(fromMeta) ? fromMeta : list.filter((n) => !n.isRead).length);
    });

    // Authoritative count. GET /notifications pages at 20, so counting unread
    // rows in the first page under-reports for anyone with more than that.
    // If only this one fails the listing is still usable, so it does not set the
    // error — the count from `meta` above just stands.
    notificationsApi
      .unreadCount()
      .then((res) => {
        const n = Number(res?.unreadCount);
        if (Number.isFinite(n)) setUnread(n);
      })
      .catch(() => {});

    return listing
      .catch((err) => {
        setItems([]);
        setError(err.message || 'Could not load notifications');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    const prevItems = items;
    const prevUnread = unread;
    // Optimistic: the drawer is open and the user expects the badge to clear.
    setItems((list) => list.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    try {
      await notificationsApi.markAllRead();
    } catch (err) {
      setItems(prevItems);
      setUnread(prevUnread);
      toastError(err.message || 'Could not mark notifications as read');
    }
  };

  const dismiss = async (id) => {
    const prevItems = items;
    const prevUnread = unread;
    const item = items.find((n) => n.id === id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    if (item && !item.isRead) setUnread((u) => Math.max(0, u - 1));
    try {
      await notificationsApi.markRead(id);
    } catch (err) {
      // Put it back: without this the row vanishes from the drawer while the
      // notification is still unread on the server.
      setItems(prevItems);
      setUnread(prevUnread);
      toastError(err.message || 'Could not dismiss notification');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Notifications"
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 ${className}`}
      >
        <BellIcon className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        )}
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title="Notifications">
        {error ? (
          <ErrorState message={error} onRetry={load} className="my-6" />
        ) : loading ? (
          <div className="py-16 text-center text-sm text-slate-400">Loading&hellip;</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            You&apos;re all caught up
          </div>
        ) : (
          <>
            {unread > 0 && (
              <div className="flex justify-end pb-2">
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800"
                >
                  Mark all as read
                </button>
              </div>
            )}
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
          </>
        )}
      </Drawer>
    </>
  );
}
