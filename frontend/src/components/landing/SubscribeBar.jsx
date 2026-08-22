import Button from '@/components/Button';
import useLandingNav from './useLandingNav';

/**
 * Dark "subscribe" pill that overlaps the bottom of the magazine collage.
 * Rendered inside MagazineCollage's relative container (not viewport-pinned).
 */
export default function SubscribeBar() {
  const nav = useLandingNav();
  return (
    <div className="flex w-full max-w-[438px] items-center justify-between gap-4 rounded-2xl bg-btn-primary px-5 py-4 shadow-2xl">
      <p className="text-sm font-medium leading-snug text-white">
        Get Monthly Subscribe to magazine @₹99 only
      </p>
      <Button text="Subscribe" handler={nav.subscribe} />
    </div>
  );
}
