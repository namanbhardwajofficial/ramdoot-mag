import collage from '@/assets/landing/magazine-collage.webp';
import SubscribeBar from '@/components/landing/SubscribeBar';

export default function MagazineCollage() {
  return (
    <section className="px-5 pb-16 md:pb-24">
      <div className="relative mx-auto max-w-[1000px]">
        <img
          src={collage}
          alt="Ramdoot magazine editions"
          className="w-full [mask-image:linear-gradient(to_bottom,black_55%,transparent_98%)] [-webkit-mask-image:linear-gradient(to_bottom,black_55%,transparent_98%)]"
        />
        {/* Subscribe pill overlapping the faded bottom of the collage */}
        <div className="absolute inset-x-0 bottom-[2%] flex justify-center px-4">
          <SubscribeBar />
        </div>
      </div>
    </section>
  );
}
