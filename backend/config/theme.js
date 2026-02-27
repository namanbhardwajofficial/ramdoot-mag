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
  revenue:        { stroke: '#1e293b', fill: 'rgba(30,41,59,0.06)' },
  payout:         { stroke: '#10b981', fill: 'rgba(16,185,129,0.06)' },
  subscriberGain: { stroke: '#1e293b', fill: 'rgba(30,41,59,0.06)' },
  views:          { stroke: '#10b981', fill: 'rgba(16,185,129,0.06)' },
  cancellations:  { stroke: '#ef4444', fill: 'rgba(239,68,68,0.06)' },
};

export const STATUS_THEME = {
  active:      { bg: '#ecfdf5', text: '#047857', dot: '#10b981' },
  success:     { bg: '#ecfdf5', text: '#047857', dot: '#10b981' },
  live:        { bg: '#ecfdf5', text: '#047857', dot: '#10b981' },
  deactivated: { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
  processing:  { bg: '#fefce8', text: '#a16207', dot: '#eab308' },
  paused:      { bg: '#fff7ed', text: '#c2410c', dot: '#f97316' },
  scheduled:   { bg: '#f8fafc', text: '#475569', dot: '#64748b' },
  cancelled:   { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
  failed:      { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
  archived:    { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
  refund:      { bg: '#f8fafc', text: '#475569', dot: '#64748b' },
  expired:     { bg: '#f8fafc', text: '#475569', dot: '#64748b' },
};
