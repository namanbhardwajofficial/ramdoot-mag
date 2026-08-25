import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { SearchIcon } from '@/components/ui/icons';
import { SUPPORT } from '@/config/constants';
import {
  ADMIN_NAV,
  INFLUENCER_NAV,
  USER_NAV,
} from '@/config/constants';
import { getStoredUser } from '@/lib/api';

/**
 * Global quick-search in the top bar.
 *
 * This used to render a dropdown of two hardcoded "recent" items — a fabricated
 * card number ("Atharv Kelwadkar Card No ********645") and a fabricated email
 * address — above four handler-less buttons ("My profile", "Team profile",
 * "Invite colleagues", "Support"). The input's `query` state fed nothing, so
 * typing in the app's only global search did nothing at all.
 *
 * There is no search endpoint on the backend, so this is a navigator rather
 * than a content search: it filters the pages the signed-in role can actually
 * reach and goes there. That is a real answer to "where is X?", which is what
 * people use a top-bar search for, and it does not pretend to search data we
 * cannot search.
 */

// The role's own nav, plus the two footer entries, as {label, path} pairs.
function pagesForRole(role) {
  const r = String(role || '').toUpperCase();
  const [nav, base] =
    r === 'ADMIN' ? [ADMIN_NAV, '/admin']
    : r === 'INFLUENCER' ? [INFLUENCER_NAV, '/influencer']
    : [USER_NAV, '/user'];

  return [...nav.main, ...nav.footer].map(({ key, label }) => ({
    key,
    label,
    path: `${base}/${key}`,
  }));
}

export default function SearchBar({ className = '' }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const user = getStoredUser();
  const pages = useMemo(() => pagesForRole(user?.role), [user?.role]);

  const q = query.trim().toLowerCase();
  const results = q ? pages.filter((p) => p.label.toLowerCase().includes(q)) : pages;

  // Keep the highlighted row in range as the list shrinks.
  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function go(page) {
    setOpen(false);
    setQuery('');
    navigate(page.path);
  }

  // Arrow keys move the highlight, Enter opens it — the shape people expect
  // from a search box that offers suggestions.
  function onInputKey(e) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-slate-300">
        <SearchIcon className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKey}
          placeholder="Jump to a page…"
          aria-label="Search pages"
          className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
        />
        <kbd className="hidden sm:inline-flex items-center text-xs text-slate-400 border border-slate-200 rounded-md px-1.5 py-0.5 font-medium">
          ⌘/
        </kbd>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-full min-w-80 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
          <div className="px-4 py-1.5 text-xs font-medium text-slate-400">
            {q ? `Pages matching “${query.trim()}”` : 'Go to'}
          </div>

          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">
              No page matches that. Try &ldquo;payments&rdquo; or &ldquo;settings&rdquo;.
            </p>
          ) : (
            results.map((page, i) => (
              <button
                key={page.key}
                type="button"
                onClick={() => go(page)}
                onMouseEnter={() => setActive(i)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 text-left ${
                  i === active ? 'bg-slate-50' : ''
                }`}
              >
                <span className="truncate">{page.label}</span>
              </button>
            ))
          )}

          <div className="my-2 border-t border-slate-100" />

          <a
            href={SUPPORT.href}
            {...(SUPPORT.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left"
          >
            Support
          </a>
        </div>
      )}
    </div>
  );
}
