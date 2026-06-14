import Button from '@/components/Button';

const BLOCKS = [
  {
    id: 'mission',
    title: 'Mission',
    heading:
      'To help people from all around the globe to restore ancient temples and spread values of our religion',
    cta: 'Read Our Mission',
  },
  {
    id: 'vision',
    title: 'Vision',
    heading:
      'To help younger generation understand the real history about our past to show as it was.',
    cta: 'Read Our Vision',
  },
];

export default function MissionVision() {
  return (
    <section className="px-5">
      <div className="mx-auto max-w-[1245px]">
        {BLOCKS.map((b) => (
          <div
            key={b.id}
            id={b.id}
            className="flex flex-col gap-8 border-t border-black/10 py-14 last:border-b md:flex-row md:justify-between md:gap-16 md:py-20"
          >
            <div className="md:w-[325px] md:shrink-0">
              <h2 className="font-['Delight'] font-medium leading-[1.05] tracking-[-0.02em] text-[#1c1c1e] text-4xl sm:text-5xl lg:text-[3.5rem]">
                {b.title}
              </h2>
            </div>
            <div className="md:max-w-[670px] md:flex-1">
              <h3 className="max-w-[598px] font-['Delight'] font-medium leading-[1.2] tracking-[-0.01em] text-[#1c1c1e] text-2xl sm:text-3xl">
                {b.heading}
              </h3>
              <p className="mt-5 max-w-[554px] text-sm leading-relaxed text-[#1c1c1e]/55 sm:text-base">
                Choose your subscription plans to get magazines every month, subscription
                plans to get magazines every month. Choose your subscription plans to get
                magazines every month, subscription plans to get magazines every month.
              </p>
              <div className="mt-7">
                <Button text={b.cta} handler={() => {}} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
