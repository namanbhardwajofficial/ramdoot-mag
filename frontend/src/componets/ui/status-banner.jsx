import { BANNER_THEMES } from '@/config/theme';

export default function StatusBanner({ variant = 'success', title, description, icon }) {
  const theme = BANNER_THEMES[variant] || BANNER_THEMES.success;

  const iconMap = {
    success: (
      <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    warning: (
      <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    danger: (
      <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
  };

  return (
    <div className={`rounded-xl p-5 mb-5 ${theme.bg}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0">{icon || iconMap[variant]}</div>
        <div>
          <p className={`text-sm font-semibold ${theme.title}`}>{title}</p>
          {description && <p className={`text-xs mt-0.5 ${theme.text}`}>{description}</p>}
        </div>
      </div>
    </div>
  );
}
