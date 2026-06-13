import { Fragment } from 'react';
import { Link, useLocation } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';
import { HomeIcon } from '@/components/ui/icons';
import { ADMIN_NAV, INFLUENCER_NAV } from '@/config/constants';

// Human labels for known path segments — sourced from the nav config so they
// stay in sync, plus a few extras. Unknown segments fall back to Title Case.
const LABELS = {
  ...Object.fromEntries(
    [
      ...ADMIN_NAV.main,
      ...ADMIN_NAV.footer,
      ...INFLUENCER_NAV.main,
      ...INFLUENCER_NAV.footer,
    ].map((i) => [i.key, i.label])
  ),
  home: 'Home',
  help: 'Help',
  settings: 'Settings',
};

const titleCase = (seg) =>
  seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Route-aware breadcrumb. Derives the trail from the current URL so every page
 * gets a consistent, working breadcrumb with no per-page wiring. The first
 * crumb is always a Home icon linking to the section's dashboard; intermediate
 * crumbs are real react-router links; the final crumb is the current page.
 */
export default function AppBreadcrumb({ className = '' }) {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean); // e.g. ['admin', 'users']
  const base = segments[0] || '';
  const homeHref = base === 'influencer' ? '/influencer' : '/admin/home';

  // Crumbs after the section base, dropping a redundant 'home' segment.
  const rest = segments.slice(1).filter((s) => s !== 'home');

  let acc = `/${base}`;
  const crumbs = rest.map((seg) => {
    acc += `/${seg}`;
    return { label: LABELS[seg] ?? titleCase(seg), href: acc };
  });

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          {crumbs.length === 0 ? (
            <BreadcrumbPage className="flex items-center text-slate-500">
              <HomeIcon className="h-4 w-4" />
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link to={homeHref} aria-label="Home" className="flex items-center">
                <HomeIcon className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={c.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={c.href}>{c.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
