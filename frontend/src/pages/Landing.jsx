import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import TaglineStrip from '@/components/landing/TaglineStrip';
import MagazineCollage from '@/components/landing/MagazineCollage';
import AssuranceSection from '@/components/landing/AssuranceSection';
import AboutUs from '@/components/landing/AboutUs';
import AffiliateProgram from '@/components/landing/AffiliateProgram';

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#f0eeef]">
      <Navbar />
      <Hero />
      <TaglineStrip />
      <MagazineCollage />
      <AssuranceSection />
      <AboutUs />

      {/* NOTE: remaining sections (#8–#11, #13, #15–#16) slot in here in design order */}
      <AffiliateProgram />
    </main>
  );
}
