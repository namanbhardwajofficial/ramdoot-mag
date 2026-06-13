import heroBg from '@/assets/landing/hero-temple.webp';
import Button from '@/components/Button';

export default function Hero() {
  return (
    <section id="home" className="px-2 pt-2">
      <div className="relative overflow-hidden rounded-[20px] border border-[#e5e5e5]">
        {/* Background image */}
        <img
          src={heroBg}
          alt="Ancient temple architecture"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Subtle scrim for text legibility (vignette already baked into image) */}
        <div className="absolute inset-0 bg-black/15" />

        {/* Content */}
        <div className="relative z-10 flex min-h-[560px] flex-col pt-24 sm:min-h-[640px] lg:min-h-[800px]">
          <div className="flex flex-1 flex-col items-center justify-center px-5 pb-16 text-center text-white sm:px-8">
            <h1 className="max-w-[751px] font-['Delight'] font-medium leading-[1.12] tracking-[-0.02em] text-[2rem] sm:text-[2.75rem] md:text-[3.25rem] lg:text-[3.75rem] lg:leading-[72px]">
              Magazines which focus on real history not pirated one.
            </h1>
            <p className="mt-5 max-w-[680px] text-base text-white/90 sm:text-lg md:text-xl lg:text-[26px] lg:leading-snug">
              Choose your subscription plans to get magazines every month, subscription plans to get magazines every month.
            </p>
            <div className="mt-8">
              <Button text="Get Started" handler={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
