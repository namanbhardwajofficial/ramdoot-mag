import { FileTextIcon, CreditCardIcon, PhoneIcon } from '@/components/ui/icons';

const STEPS = [
  { icon: FileTextIcon, label: ['Choose Your', 'Favourite Magazine'] },
  { icon: CreditCardIcon, label: ['Pay Online with', 'Your Preferable Method'] },
  { icon: PhoneIcon, label: ['Start Reading Instantly', 'Anywhere, Anytime'] },
];

export default function HowItWorks() {
  const last = STEPS.length - 1;

  return (
    <section className="px-5 py-14 md:py-20">
      <div className="mx-auto max-w-[1362px]">
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-['Delight'] font-medium leading-tight tracking-[-0.01em] text-[#1c1c1e] text-2xl sm:text-3xl md:text-[2.25rem]">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-[440px] text-xs leading-relaxed text-[#1c1c1e]/55 sm:text-sm">
            Choose your subscription plans to get magazines every month, subscription
            plans to get magazines every month.
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto mt-12 flex max-w-[1012px] flex-col sm:flex-row">
          {STEPS.map(({ icon: IconComp, label }, i) => (
            <div
              key={label.join(' ')}
              className="flex flex-1 flex-col items-center px-4 text-center"
            >
              <div className="flex w-full items-center">
                <span className={`h-px flex-1 ${i === 0 ? 'invisible' : 'bg-black/15'}`} />
                <span className="mx-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 bg-[#f0eeef] font-['Delight'] font-medium text-[#1c1c1e]">
                  {i + 1}
                </span>
                <span className={`h-px flex-1 ${i === last ? 'invisible' : 'bg-black/15'}`} />
              </div>

              <IconComp className="mt-8 h-6 w-6 text-[#1c1c1e]" strokeWidth={1.6} />
              <p className="mt-3 font-medium leading-snug text-[#1c1c1e] text-base">
                {label[0]}
                <br />
                {label[1]}
              </p>
            </div>
          ))}
        </div>

        {/* Showcase images */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]">
          <div className="h-[280px] rounded-2xl bg-[#d9d7d8] md:h-[450px]" />
          <div className="h-[280px] rounded-2xl bg-[#d9d7d8] md:h-[450px]" />
        </div>
      </div>
    </section>
  );
}
