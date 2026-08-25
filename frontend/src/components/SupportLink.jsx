import { SUPPORT } from '@/config/constants';

/**
 * "Connect Support" / "Connect Us" / "Get in Touch".
 *
 * These appeared eleven times across drawers, modals and the Help page, always
 * as a `<span>` or a handler-less `<button>` — styled to look clickable, doing
 * nothing. They all now share one real destination (see SUPPORT in constants),
 * and they render as an anchor so middle-click, "copy link address" and screen
 * readers treat them as the link they are.
 *
 * `className` fully replaces the default styling for the callers that need to
 * blend into surrounding text.
 */
export default function SupportLink({ children = 'Connect Support', className }) {
  return (
    <a
      href={SUPPORT.href}
      {...(SUPPORT.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={
        className ??
        'font-medium text-slate-900 underline underline-offset-2 hover:text-slate-700'
      }
    >
      {children}
    </a>
  );
}
