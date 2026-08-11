import { motion } from 'framer-motion';
import { Building2, HandHeart, Sparkles, LayoutGrid, Shield } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { values } from '@/data/values';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Building2,
  HandHeart,
  Sparkles,
  LayoutGrid,
  Shield,
};

export default function Values() {
  const { t, lang } = useLanguage();
  const { ref, revealed } = useScrollReveal();

  return (
    <section className="py-20 lg:py-28 bg-ivory">
      <div ref={ref} className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-14 lg:mb-20"
        >
          <p className="text-[10px] lg:text-[11px] tracking-[0.3em] text-muted-gold uppercase font-medium mb-3">
            {t.values.heading}
          </p>
          <h2 className={`text-3xl lg:text-4xl font-light text-deep-forest ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
            {t.values.subtitle}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
          {values.map((value, i) => {
            const Icon = iconMap[value.icon];
            return (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 32 }}
                animate={revealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i, ease: 'easeOut' }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center mb-5 text-olive group-hover:text-muted-gold transition-colors duration-400">
                  {Icon && <Icon className="w-7 h-7 lg:w-8 lg:h-8" />}
                </div>
                <h3 className={`text-sm lg:text-base font-semibold text-deep-forest mb-2 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {lang === 'ar' ? value.titleAr : value.title}
                </h3>
                <p className={`text-xs lg:text-sm text-olive/60 leading-relaxed max-w-[160px] ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {lang === 'ar' ? value.subtitleAr : value.subtitle}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
