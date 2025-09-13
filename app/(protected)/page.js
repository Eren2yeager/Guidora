import HeroSection from '@/components/home/HeroSection';
import FeaturedCards from '@/components/home/FeaturedCards';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import BlogSection from '@/components/home/BlogSection';
import CallToAction from '@/components/home/CallToAction';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main>
      {/* <Navbar /> */}
      <HeroSection />
      <FeaturedCards />
      <HowItWorks />
      <Testimonials />
      <BlogSection />
      <CallToAction />
      <Footer />
    </main>
  );
}