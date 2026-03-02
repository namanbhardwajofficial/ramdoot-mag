const CHECK_ICON = (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function StepProgress({ steps, currentStep = 0 }) {
  return (
    <div className="space-y-6">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isDone
                    ? 'bg-emerald-500'
                    : isCurrent
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? CHECK_ICON : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-0.5 flex-1 mt-2 ${isDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${isDone || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                {step.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
