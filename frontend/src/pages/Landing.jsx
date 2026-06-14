import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import TaglineStrip from '@/components/landing/TaglineStrip';
import MagazineCollage from '@/components/landing/MagazineCollage';
import AssuranceSection from '@/components/landing/AssuranceSection';
import AboutUs from '@/components/landing/AboutUs';
import AboutMagazine from '@/components/landing/AboutMagazine';
import MissionVision from '@/components/landing/MissionVision';
import MagazineVersions from '@/components/landing/MagazineVersions';
import HowItWorks from '@/components/landing/HowItWorks';
import AffiliateProgram from '@/components/landing/AffiliateProgram';
import WhyBuy from '@/components/landing/WhyBuy';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#f0eeef]">
      <Navbar />
      <Hero />
      <TaglineStrip />
      <MagazineCollage />
      <AssuranceSection />
      <AboutUs />
      <AboutMagazine />
      <MissionVision />
      <MagazineVersions />
      <HowItWorks />
      <AffiliateProgram />
      <WhyBuy />
      <Testimonials />
      <Footer />
    </main>
  );
}
