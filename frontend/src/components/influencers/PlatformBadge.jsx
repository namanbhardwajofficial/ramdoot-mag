import { PLATFORM_COLORS } from '@/config/constants';

export default function PlatformBadge({ platform }) {
  const colors = PLATFORM_COLORS[platform] || { bg: 'bg-slate-200', text: 'text-slate-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}>
      {platform}
    </span>
  );
}
