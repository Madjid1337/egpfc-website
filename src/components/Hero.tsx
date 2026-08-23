import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const slides = ['/images/bg1.jpg', '/images/bg2.jpg', '/images/bg3.jpg'];
const SLIDE_MS = 5500;

export default function Hero() {
  const { t, lang } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [index]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        hero.style.setProperty('--scroll', `${scrollY * 0.35}px`);
        hero.style.opacity = `${1 - scrollY / (window.innerHeight * 0.7)}`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative h-[90vh] lg:h-screen min-h-[600px] overflow-hidden"
      style={{ willChange: 'opacity' } as React.CSSProperties}
    >
      {/* Background slideshow with gradient overlay */}
      <div className="absolute inset-0 bg-deep-forest">
        {slides.map((src, i) => (
          <motion.div
            key={src}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${src}')`,
              transform: 'translateY(var(--scroll, 0)) scale(1.03)',
            }}
            initial={false}
            animate={{ opacity: i === index ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              160deg,
              rgba(13, 43, 34, 0.55) 0%,
              rgba(22, 58, 45, 0.4) 30%,
              rgba(13, 43, 34, 0.55) 60%,
              rgba(23, 26, 24, 0.7) 100%
            )`,
          }}
        />
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B89555' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 lg:px-12 xl:px-20 mx-auto max-w-[1440px]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-3xl xl:max-w-4xl"
        >
          {/* Label */}
          <p className="text-[10px] lg:text-[11px] xl:text-xs tracking-[0.35em] text-muted-gold/80 mb-6 lg:mb-8 uppercase font-medium">
            {t.hero.label}
          </p>

          {/* Main Heading */}
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-light leading-[1.05] text-ivory mb-6 lg:mb-8 tracking-tight ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
            {t.hero.heading1}
            <br />
            {t.hero.heading2}
          </h1>

          {/* Description */}
          <p className={`text-base lg:text-lg xl:text-xl text-ivory/70 max-w-xl lg:max-w-2xl mb-10 lg:mb-12 leading-relaxed font-light ${lang === 'ar' ? 'font-arabic' : ''}`}>
            {t.hero.description}
          </p>

          {/* CTAs */}
          <div className={`flex flex-wrap gap-4 lg:gap-5 ${lang === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
            <Link
              to="/services"
              className="group inline-flex items-center gap-3 bg-muted-gold text-deep-forest px-6 lg:px-8 py-3.5 lg:py-4 text-[13px] lg:text-sm font-semibold tracking-[0.08em] hover:bg-muted-gold/90 transition-all duration-300"
            >
              {t.hero.cta1}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
            </Link>
            <Link
              to="/cimetieres"
              className="group inline-flex items-center gap-3 border border-ivory/30 text-ivory px-6 lg:px-8 py-3.5 lg:py-4 text-[13px] lg:text-sm font-semibold tracking-[0.08em] hover:bg-ivory/10 transition-all duration-300"
            >
              {t.hero.cta2}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
            </Link>
          </div>
        </motion.div>

        {/* Slide dots */}
        <div className="absolute bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
          {slides.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-[5px] rounded-full transition-all duration-500 ${
                i === index ? 'w-8 bg-muted-gold' : 'w-[5px] bg-ivory/35 hover:bg-ivory/60'
              }`}
            />
          ))}
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
          {slides.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-[5px] rounded-full transition-all duration-500 ${
                i === index ? 'w-8 bg-muted-gold' : 'w-[5px] bg-ivory/35 hover:bg-ivory/60'
              }`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ivory/40">
          <span className="text-[9px] lg:text-[10px] tracking-[0.25em] uppercase">{t.hero.scroll}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
