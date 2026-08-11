import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Sparkles, Trees, Heart, Shield, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { services } from '@/data/services';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Building2, Sparkles, Trees, Heart, Shield,
};

export default function Services() {
  const { t, lang } = useLanguage();
  const { ref, revealed } = useScrollReveal();

  return (
    <section className="py-24 lg:py-32 xl:py-40 bg-off-white">
      <div ref={ref} className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-14 lg:mb-20"
        >
          <p className="text-[10px] lg:text-[11px] tracking-[0.3em] text-muted-gold uppercase font-medium mb-3">
            {t.services.heading}
          </p>
          <h2 className={`text-3xl lg:text-4xl xl:text-5xl font-light text-deep-forest leading-[1.15] ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
            {t.services.subtitle}
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-[1px] bg-light-gray">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon];
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 32 }}
                animate={revealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.08 * i, ease: 'easeOut' }}
                className="group bg-off-white p-8 lg:p-10 xl:p-12 hover:bg-ivory transition-all duration-500 relative overflow-hidden"
              >
                {/* Gold accent on hover */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-muted-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div className="flex items-start justify-between mb-6">
                  <span className={`text-4xl lg:text-5xl font-thin text-light-gray group-hover:text-muted-gold/20 transition-colors duration-500 ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
                    {service.number}
                  </span>
                  {Icon && (
                    <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-olive/40 group-hover:text-muted-gold transition-colors duration-500" />
                  )}
                </div>

                <h3 className={`text-lg lg:text-xl font-semibold text-deep-forest mb-3 group-hover:text-deep-forest transition-colors ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {lang === 'ar' ? service.titleAr : service.title}
                </h3>
                <p className={`text-sm lg:text-base text-olive/60 leading-relaxed mb-5 ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
                  {lang === 'ar' ? service.descriptionAr : service.description}
                </p>

                <ul className={`space-y-2 mb-6 ${lang === 'ar' ? 'text-right' : ''}`}>
                  {(lang === 'ar' ? service.featuresAr : service.features).slice(0, 3).map((feature, j) => (
                    <li key={j} className={`text-xs lg:text-sm text-olive/50 flex items-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <span className="w-1 h-1 rounded-full bg-muted-gold/40 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to={`/services#${service.id}`}
                  className={`inline-flex items-center gap-2 text-[12px] lg:text-[13px] font-semibold tracking-[0.06em] text-olive group-hover:text-muted-gold transition-colors duration-300 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
                >
                  {t.services.discover}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
