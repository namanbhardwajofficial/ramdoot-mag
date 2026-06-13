import AppBreadcrumb from '@/components/ui/app-breadcrumb';
import SearchBar from '@/components/ui/search-bar';
import NotificationBell from '@/components/ui/notification-bell';

/**
 * Common page header: route-aware breadcrumb on the left, global search and a
 * notification bell on the right. Shared across the admin and influencer layouts.
 */
export default function TopBar({ className = '' }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <AppBreadcrumb className="flex-1 min-w-0" />
      <SearchBar className="hidden md:block w-72 lg:w-96 shrink-0" />
      <NotificationBell className="shrink-0" />
    </div>
  );
}
