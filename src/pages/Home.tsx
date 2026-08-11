import Hero from '@/components/Hero';
import About from '@/components/About';
import Values from '@/components/Values';
import Services from '@/components/Services';
import CemeteryMap from '@/components/CemeteryMap';
import CemeteryDirectory from '@/components/CemeteryDirectory';
import Statistics from '@/components/Statistics';
import News from '@/components/News';
import Gallery from '@/components/Gallery';
import Mission from '@/components/Mission';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Values />
      <Services />
      <CemeteryMap />
      <Statistics />
      <Mission />
      <CemeteryDirectory />
      <News />
      <Gallery />
      <Contact />
    </>
  );
}
