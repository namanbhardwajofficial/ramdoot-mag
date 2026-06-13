import Button from '@/components/Button';
import TwoColSection from '@/components/landing/TwoColSection';

export default function AffiliateProgram() {
  return (
    <TwoColSection id="affiliate" title="Affiliate Program">
      <h3 className="max-w-[598px] font-['Delight'] font-medium leading-[1.15] tracking-[-0.01em] text-[#1c1c1e] text-2xl sm:text-3xl md:text-[2.25rem] md:leading-[44px]">
        You can earn more with just sharing a link with your audience.
      </h3>
      <p className="mt-5 max-w-[554px] text-sm leading-relaxed text-[#1c1c1e]/60 sm:text-base">
        Choose your subscription plans to get magazines every month, subscription plans to
        get magazines every month. Choose your subscription plans to get magazines every
        month, subscription plans to get magazines every month.
      </p>
      <div className="mt-7">
        <Button text="Become an Affiliate" handler={() => {}} />
      </div>
    </TwoColSection>
  );
}
