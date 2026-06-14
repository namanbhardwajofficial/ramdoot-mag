import Button from '@/components/Button';
import { BookOpenIcon, BookmarkIcon } from '@/components/ui/icons';

const CARDS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  title: 'Magazines',
  subtitle: 'List of all the magazines you been looking for',
}));

function VersionCard({ title, subtitle }) {
  return (
    <div className="flex flex-col rounded-2xl bg-[#e9e7e8] p-2.5">
      {/* Cover */}
      <div className="relative h-[260px] w-full rounded-xl bg-[#d9d7d8]">
        <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[#1c1c1e]">
          <BookOpenIcon className="h-4 w-4" strokeWidth={1.6} />
        </span>
        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[#1c1c1e]">
          <BookmarkIcon className="h-4 w-4" strokeWidth={1.6} />
        </span>
      </div>

      {/* Meta */}
      <div className="px-1.5 pt-4">
        <h3 className="font-medium text-[#1c1c1e] text-lg">{title}</h3>
        <p className="mt-1 text-xs text-[#1c1c1e]/55">{subtitle}</p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-2 px-1.5 pb-1.5">
        <Button text="Read Sample" handler={() => {}} width="100%" />
        <Button text="Subscribe" handler={() => {}} width="100%" />
      </div>
    </div>
  );
}

export default function MagazineVersions() {
  return (
    <section className="px-5 py-14 md:py-20">
      <div className="mx-auto max-w-[1362px]">
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-['Delight'] font-medium leading-tight tracking-[-0.01em] text-[#1c1c1e] text-2xl sm:text-3xl md:text-[2.25rem]">
            Versions of Magazines
          </h2>
          <p className="mx-auto mt-3 max-w-[440px] text-xs leading-relaxed text-[#1c1c1e]/55 sm:text-sm">
            Choose your subscription plans to get magazines every month, subscription
            plans to get magazines every month.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-12">
          {CARDS.map((c) => (
            <VersionCard key={c.id} title={c.title} subtitle={c.subtitle} />
          ))}
        </div>
      </div>
    </section>
  );
}
