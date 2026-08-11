import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function About() {
  const { t, lang } = useLanguage();
  const { ref, revealed } = useScrollReveal();

  return (
    <section className="relative py-24 lg:py-32 xl:py-40 overflow-hidden bg-off-white">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230D2B22' fill-opacity='1'%3E%3Cpath d='M50 50v-8h-8v-4h8v-8h4v8h8v4h-8v8h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div ref={ref} className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">
          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
            animate={revealed ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative aspect-[4/5] lg:aspect-[3/4] bg-light-gray overflow-hidden"
          >
            {/* CSS-rendered architectural scene placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-olive/20 to-deep-forest/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 400 500" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F5F1E8" />
                    <stop offset="100%" stopColor="#E8E6DF" />
                  </linearGradient>
                  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C4B998" />
                    <stop offset="100%" stopColor="#B8AA86" />
                  </linearGradient>
                </defs>
                <rect width="400" height="500" fill="url(#sky)" />
                {/* Ground */}
                <rect x="0" y="350" width="400" height="150" fill="#526451" opacity="0.3" />
                {/* Pathway */}
                <polygon points="160,500 240,500 260,350 140,350" fill="#8A9A88" opacity="0.5" />
                {/* Arch structure */}
                <rect x="120" y="200" width="160" height="200" fill="url(#wall)" opacity="0.8" />
                <path d="M120,250 Q200,170 280,250 L280,400 L120,400 Z" fill="#D4C9A8" opacity="0.7" />
                <rect x="155" y="250" width="90" height="150" fill="#0D2B22" opacity="0.35" />
                {/* Palm trees */}
                <line x1="60" y1="400" x2="60" y2="180" stroke="#526451" strokeWidth="4" opacity="0.6" />
                <ellipse cx="60" cy="190" rx="35" ry="12" fill="#526451" opacity="0.5" transform="rotate(-10,60,190)" />
                <line x1="340" y1="420" x2="340" y2="200" stroke="#526451" strokeWidth="3.5" opacity="0.5" />
                <ellipse cx="340" cy="210" rx="30" ry="10" fill="#526451" opacity="0.45" transform="rotate(8,340,210)" />
                {/* Sunlight rays */}
                <line x1="200" y1="0" x2="200" y2="500" stroke="#B89555" strokeWidth="80" opacity="0.04" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-deep-forest/15 to-transparent" />
          </motion.div>

          {/* Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-[10px] lg:text-[11px] tracking-[0.3em] text-muted-gold uppercase font-medium mb-4">
              {t.about.label}
            </p>
            <h2 className={`text-3xl lg:text-4xl xl:text-5xl font-light text-deep-forest leading-[1.15] mb-6 lg:mb-8 tracking-tight ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
              {t.about.heading}
            </h2>
            <div className="w-12 h-[2px] bg-muted-gold mb-6 lg:mb-8" />
            <p className={`text-base lg:text-lg text-olive/80 leading-relaxed mb-8 lg:mb-10 max-w-lg ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
              {t.about.description}
            </p>
            <Link
              to="/etablissement"
              className="group inline-flex items-center gap-3 text-deep-forest text-[13px] lg:text-sm font-semibold tracking-[0.08em] hover:text-muted-gold transition-colors duration-300"
            >
              {t.about.cta}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
