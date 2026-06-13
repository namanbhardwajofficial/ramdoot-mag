import { useState, useRef, useEffect } from 'react';
import {
  SearchIcon,
  CreditCardIcon,
  MailIcon,
  UserIcon,
  UsersIcon,
  UserPlusIcon,
  HelpCircleIcon,
} from '@/components/ui/icons';

// Mock data — wire to real search results / account actions later.
const RECENT = [
  { id: 'card', icon: CreditCardIcon, label: 'Atharv Kelwadkar Card No ********645' },
  { id: 'mail', icon: MailIcon, label: 'atharvkeladkar@ramdootfoundation.com' },
];

const MENU = [
  { id: 'profile', icon: UserIcon, label: 'My profile' },
  { id: 'team', icon: UsersIcon, label: 'Team profile' },
  { id: 'invite', icon: UserPlusIcon, label: 'Invite colleagues' },
  { id: 'support', icon: HelpCircleIcon, label: 'Support' },
];

/**
 * Search input with a dropdown of recent items and quick account actions.
 * Opens on focus, closes on outside click or Escape. Cmd/Ctrl + / focuses it.
 */
export default function SearchBar({ className = '' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

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

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-slate-300">
        <SearchIcon className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search anything..."
          className="flex-1 min-w-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
        />
        <kbd className="hidden sm:inline-flex items-center text-xs text-slate-400 border border-slate-200 rounded-md px-1.5 py-0.5 font-medium">
          ⌘/
        </kbd>
      </div>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-full min-w-80 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
          <div className="px-4 py-1.5 text-xs font-medium text-slate-400">Recent</div>
          {RECENT.map(({ id, icon: ItemIcon, label }) => (
            <button
              key={id}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left"
            >
              <ItemIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}

          <div className="my-2 border-t border-slate-100" />

          {MENU.map(({ id, icon: ItemIcon, label }) => (
            <button
              key={id}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left"
            >
              <ItemIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
