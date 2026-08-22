import Button from '@/components/Button';

const PROMO_BODY =
  'Choose your subscription plans to get magazines every month, subscription plans to get magazines every';

const PROMOS = [
  { title: 'Temple Restoration', cta: 'Donate Now' },
  { title: 'Feed Animals Do Gau Seva', cta: 'Contribute' },
  { title: 'Supporting your roots', cta: 'Support Us' },
];

function PromoCard({ title, cta }) {
  return (
    <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-2xl bg-[#d9d7d8] p-8 md:min-h-[450px]">
      {/* gradient for text legibility over imagery */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      <h3 className="relative font-['Delight'] font-medium leading-tight tracking-[-0.01em] text-white text-2xl sm:text-3xl">
        {title}
      </h3>

      <div className="relative max-w-[554px]">
        <p className="text-sm leading-relaxed text-white/85">{PROMO_BODY}</p>
        <div className="mt-5">
          {/* TODO(product): these donation CTAs have no destination — the app
              and the API have no donation flow. Needs either a donation feature
              or an external giving link before launch. */}
          <Button text={cta} handler={() => {}} />
        </div>
      </div>
    </div>
  );
}

export default function WhyBuy() {
  return (
    <section className="px-5 py-14 md:py-20">
      <div className="mx-auto grid max-w-[1362px] grid-cols-1 gap-6 md:grid-cols-2">
        {/* Intro */}
        <div className="flex flex-col justify-center p-2 md:p-8">
          <h2 className="max-w-[420px] font-['Delight'] font-medium leading-[1.15] tracking-[-0.01em] text-[#1c1c1e] text-3xl sm:text-4xl">
            Why should You Buy this Magazine ?
          </h2>
          <p className="mt-6 max-w-[550px] text-sm leading-relaxed text-[#1c1c1e]/60 sm:text-base">
            An Attempt To Revive Indic Knowledge by Jai Shree Ram Sena - A magazine Packed
            With Untold Stories of ancient India - Indian history - Politics - Culture -
            Civilization - empire and Many more.
          </p>
        </div>

        {/* First promo */}
        <PromoCard title={PROMOS[0].title} cta={PROMOS[0].cta} />

        {/* Full-width feature image */}
        <div className="h-[280px] rounded-2xl bg-[#d9d7d8] md:col-span-2 md:h-[450px]" />

        {/* Remaining promos */}
        <PromoCard title={PROMOS[1].title} cta={PROMOS[1].cta} />
        <PromoCard title={PROMOS[2].title} cta={PROMOS[2].cta} />
      </div>
    </section>
  );
}
