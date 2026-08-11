import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function Mission() {
  const { t, lang } = useLanguage();
  const { ref, revealed } = useScrollReveal(0.3);

  return (
    <section className="relative py-32 lg:py-44 xl:py-56 overflow-hidden bg-deep-forest">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url('/images/aerial-cemetery.jpg')` }}
      />

      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep-forest/85 via-deep-forest/60 to-deep-forest/85" />

      <div ref={ref} className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-[10px] lg:text-[11px] tracking-[0.35em] text-muted-gold/70 uppercase font-medium mb-8"
        >
          {t.mission.heading}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-ivory leading-[1.2] max-w-4xl mx-auto tracking-tight ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}
        >
          {t.mission.description}
        </motion.h2>

        {/* Decorative gold line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={revealed ? { scaleX: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
          className="w-16 h-[1px] bg-muted-gold/50 mx-auto mt-12 origin-center"
        />
      </div>
    </section>
  );
}
