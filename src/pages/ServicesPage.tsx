import { motion } from 'framer-motion';
import { Building2, Sparkles, Trees, Heart, Shield } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { services } from '@/data/services';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Building2, Sparkles, Trees, Heart, Shield,
};

export default function ServicesPage() {
  const { t, lang } = useLanguage();

  return (
    <div className="pt-16 lg:pt-20">
      <section className="bg-deep-forest py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[10px] lg:text-[11px] tracking-[0.3em] text-muted-gold/70 uppercase font-medium mb-6"
          >
            {t.services.heading}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-3xl lg:text-5xl xl:text-6xl font-light text-ivory leading-[1.15] max-w-3xl ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}
          >
            {t.services.subtitle}
          </motion.h1>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-off-white">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
          <div className="divide-y divide-light-gray">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon];
              return (
                <motion.div
                  key={service.id}
                  id={service.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: 0.1 * i, ease: 'easeOut' }}
                  className="py-12 lg:py-16 first:pt-0"
                >
                  <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">
                    <div className="flex items-start gap-4">
                      <span className={`text-4xl font-thin text-light-gray shrink-0 ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
                        {service.number}
                      </span>
                      {Icon && <Icon className="w-6 h-6 text-muted-gold mt-1 shrink-0" />}
                    </div>
                    <div className="lg:col-span-2">
                      <h2 className={`text-xl lg:text-2xl font-semibold text-deep-forest mb-4 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                        {lang === 'ar' ? service.titleAr : service.title}
                      </h2>
                      <p className={`text-base text-olive/60 leading-relaxed mb-6 ${lang === 'ar' ? 'text-right' : ''}`}>
                        {lang === 'ar' ? service.descriptionAr : service.description}
                      </p>
                      <ul className={`space-y-3 ${lang === 'ar' ? 'text-right' : ''}`}>
                        {(lang === 'ar' ? service.featuresAr : service.features).map((feature, j) => (
                          <li key={j} className={`flex items-center gap-3 text-sm text-deep-forest/70 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-gold/50 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
