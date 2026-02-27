export function MiniChart({ color = '#10b981', trend = 'up' }) {
  const d =
    trend === 'up'
      ? 'M0 28 Q8 26,16 22 T32 18 T48 14 T64 10 T80 6 T96 4 T112 2'
      : 'M0 4 Q8 6,16 10 T32 14 T48 18 T64 16 T80 20 T96 22 T112 26';
  return (
    <svg viewBox="0 0 112 32" className="w-full h-10 mt-2" fill="none">
      <path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function StatCard({
  title,
  value,
  color = '#10b981',
  trend = 'up',
  prefix = '',
  periodLabel = 'This Month',
  changeLabel,
  changeColor,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1 min-w-[200px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-700">{title}</span>
        <span className="text-xs text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">
          {periodLabel}
        </span>
      </div>
      <div className="text-3xl font-bold text-slate-900 mt-2">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </div>
      {changeLabel && (
        <p className={`text-xs mt-1 ${changeColor || 'text-emerald-600'}`}>
          {changeLabel}
        </p>
      )}
      <MiniChart color={color} trend={trend} />
    </div>
  );
}
