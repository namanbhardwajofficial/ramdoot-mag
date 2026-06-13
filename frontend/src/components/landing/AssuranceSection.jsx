import {
  FileTextIcon,
  BadgeCheckIcon,
  FlagIcon,
  BookOpenIcon,
  FilmIcon,
} from '@/components/ui/icons';

const FEATURES = [
  { icon: FileTextIcon, label: ['Fully Research', 'Backed'] },
  { icon: BadgeCheckIcon, label: ['Completely', 'Original'] },
  { icon: FlagIcon, label: ['Real Hindu', 'History'] },
  { icon: BookOpenIcon, label: ['Dharmic', 'Knowledge'] },
  { icon: FilmIcon, label: ['Fabricated-Free', 'Content'] },
];

export default function AssuranceSection() {
  return (
    <section className="px-5 py-12 md:py-16">
      <div className="mx-auto max-w-[1245px]">
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-['Delight'] font-medium leading-tight tracking-[-0.01em] text-[#1c1c1e] text-2xl sm:text-3xl md:text-[2.25rem]">
            We assure you, you will get
          </h2>
          <p className="mx-auto mt-3 max-w-[440px] text-xs leading-relaxed text-[#1c1c1e]/55 sm:text-sm">
            Choose your subscription plans to get magazines every month,
            subscription plans to get magazines every month.
          </p>
        </div>

        {/* Feature card */}
        <div className="mt-10 rounded-[28px] bg-[#e9e7e8] px-4 py-10 sm:px-6 md:mt-12 md:py-12">
          <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-y-0">
            {FEATURES.map(({ icon: IconComp, label }, i) => (
              <div
                key={label.join(' ')}
                className={`flex flex-col items-center px-4 text-center lg:border-l lg:border-black/10 ${
                  i === 0 ? 'lg:border-l-0' : ''
                }`}
              >
                <IconComp className="h-6 w-6 text-[#1c1c1e]" strokeWidth={1.6} />
                <p className="mt-4 font-medium leading-snug text-[#1c1c1e] text-sm sm:text-base">
                  {label[0]}
                  <br />
                  {label[1]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
