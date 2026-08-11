import { motion } from 'framer-motion';
import { Building2, Users, Target } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { values } from '@/data/values';

export default function AboutPage() {
  const { t, lang } = useLanguage();

  return (
    <div className="pt-16 lg:pt-20">
      {/* Hero */}
      <section className="bg-deep-forest py-24 lg:py-32">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[10px] lg:text-[11px] tracking-[0.3em] text-muted-gold/70 uppercase font-medium mb-6"
          >
            {t.about.label}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-3xl lg:text-5xl xl:text-6xl font-light text-ivory leading-[1.15] max-w-3xl ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}
          >
            {t.about.heading}
          </motion.h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 lg:py-28 bg-off-white">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-2">
              <p className={`text-base lg:text-lg text-deep-forest/70 leading-relaxed ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
                {t.about.description}
              </p>
              <p className={`text-base lg:text-lg text-deep-forest/70 leading-relaxed mt-6 ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
                L&apos;EGPFC œuvre quotidiennement pour assurer la propreté, l&apos;entretien et la préservation des cimetières de la Wilaya d&apos;Alger, en mettant en œuvre des standards élevés de gestion et de respect des lieux.
              </p>
            </div>
            <div className="space-y-8">
              {[
                { icon: Building2, label: 'Établissement', value: 'EPIC — Wilaya d\'Alger' },
                { icon: Users, label: 'Agents', value: 'Plus de 120 agents mobilisés' },
                { icon: Target, label: 'Mission', value: 'Gestion et préservation des cimetières' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <item.icon className="w-5 h-5 text-muted-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] tracking-[0.12em] text-olive/40 uppercase mb-0.5 font-medium">{item.label}</p>
                    <p className="text-sm text-deep-forest">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mt-20 lg:mt-28">
            <h2 className={`text-2xl lg:text-3xl font-light text-deep-forest mb-12 ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
              {t.values.heading}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {values.map((value) => (
                <div key={value.id} className="text-center">
                  <div className="w-2 h-2 rounded-full bg-muted-gold/40 mx-auto mb-4" />
                  <h3 className={`text-sm font-semibold text-deep-forest mb-2 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'ar' ? value.titleAr : value.title}
                  </h3>
                  <p className={`text-xs text-olive/60 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'ar' ? value.subtitleAr : value.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
