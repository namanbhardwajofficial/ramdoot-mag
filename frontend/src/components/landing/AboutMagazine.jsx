import TwoColSection from '@/components/landing/TwoColSection';

const STATS = [
  { value: '5000+', label: 'Subscription' },
  { value: '2+', label: 'Language' },
  { value: '100%', label: 'Made in India' },
];

export default function AboutMagazine() {
  return (
    <TwoColSection title="About Magazine">
      <h3 className="max-w-[598px] font-['Delight'] font-medium leading-[1.2] tracking-[-0.01em] text-[#1c1c1e] text-xl sm:text-2xl">
        A complete guide for Santan Dharma - Your Spiritual Campanion
      </h3>
      <p className="mt-4 max-w-[554px] text-sm leading-relaxed text-[#1c1c1e]/55">
        Choose your subscription plans to get magazines every month, subscription plans
        to get magazines every month. Choose your subscription plans to get magazines
        every month, subscription plans to get magazines every month. Choose your
        subscription plans to get magazines every month.
      </p>

      {/* Stats */}
      <div className="mt-10 flex items-center gap-6 sm:gap-10">
        {STATS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-6 sm:gap-10">
            {i > 0 && <span className="h-[70px] w-px bg-black/10" />}
            <div className="text-center">
              <div className="font-['Delight'] font-medium tracking-[-0.01em] text-[#1c1c1e] text-3xl sm:text-[2.25rem]">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-[#1c1c1e]/55">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </TwoColSection>
  );
}
