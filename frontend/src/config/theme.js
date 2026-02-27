export const CHART_COLORS = {
  primary:   '#1e293b',
  secondary: '#64748b',
  success:   '#10b981',
  danger:    '#ef4444',
  warning:   '#f59e0b',
  info:      '#3b82f6',
  muted:     '#94a3b8',
};

export const GRAPH_THEMES = {
  revenue:        { stroke: CHART_COLORS.primary, label: 'Revenue' },
  payout:         { stroke: CHART_COLORS.success, label: 'Payout' },
  subscriberGain: { stroke: CHART_COLORS.primary, label: 'Subscriber Gain' },
  views:          { stroke: CHART_COLORS.success, label: 'Views' },
  cancellations:  { stroke: CHART_COLORS.danger,  label: 'Cancellations' },
};

export const STAT_CARD_THEMES = {
  up:   { color: CHART_COLORS.success, trend: 'up' },
  down: { color: CHART_COLORS.danger,  trend: 'down' },
  flat: { color: CHART_COLORS.muted,   trend: 'up' },
};

export const BANNER_THEMES = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    icon: 'text-white',
    title: 'text-white',
    text: 'text-emerald-100',
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-400 to-amber-500',
    icon: 'text-white',
    title: 'text-white',
    text: 'text-amber-100',
  },
  danger: {
    bg: 'bg-gradient-to-r from-red-500 to-red-600',
    icon: 'text-white',
    title: 'text-white',
    text: 'text-red-100',
  },
};
