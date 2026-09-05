import Button from '@/components/Button';
import LandingImage from '@/components/landing/LandingImage';

const PROMO_BODY =
  'Choose your subscription plans to get magazines every month, subscription plans to get magazines every';

// Giving happens on the foundation's own site — there is no donation flow in
// this app or its API, so these CTAs hand off rather than pretending to collect.
const DONATE_URL = 'https://ramdootrestores.in';

// `image` names the file in src/assets/landing/ that backs each card.
const PROMOS = [
  { title: 'Temple Restoration', cta: 'Donate Now', image: 'promo-temple' },
  { title: 'Feed Animals Do Gau Seva', cta: 'Contribute', image: 'promo-gauseva' },
  { title: 'Supporting your roots', cta: 'Support Us', image: 'promo-roots' },
];

function PromoCard({ title, cta, image }) {
  return (
    <LandingImage
      name={image}
      alt=""
      // The card draws its own gradient below, so LandingImage must not add a
      // second one — two stacked overlays crush the photo to near black.
      overlay={false}
      className="flex min-h-[360px] flex-col justify-between rounded-2xl p-8 md:min-h-[450px]"
    >
      {/* gradient for text legibility over imagery */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

      <h3 className="relative font-['Delight'] font-medium leading-tight tracking-[-0.01em] text-white text-2xl sm:text-3xl">
        {title}
      </h3>

      <div className="relative max-w-[554px]">
        <p className="text-sm leading-relaxed text-white/85">{PROMO_BODY}</p>
        <div className="mt-5">
          <Button text={cta} href={DONATE_URL} external />
        </div>
      </div>
    </LandingImage>
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
        <LandingImage
          name="why-buy-feature"
          alt="Ramdoot magazine issues laid out together"
          className="h-[280px] rounded-2xl md:col-span-2 md:h-[450px]"
        />

        {/* Remaining promos */}
        <PromoCard title={PROMOS[1].title} cta={PROMOS[1].cta} />
        <PromoCard title={PROMOS[2].title} cta={PROMOS[2].cta} />
      </div>
    </section>
  );
}
