import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useNews } from '@/hooks/useNews';

export default function News() {
  const { t, lang } = useLanguage();
  const { ref, revealed } = useScrollReveal();
  const { items } = useNews();

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
            {t.news.heading}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {items.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * i, ease: [0.25, 0.1, 0.25, 1] }}
              className="group"
            >
              <Link to={`/actualites/${item.slug}`} className="block">
                <div className="aspect-[16/10] bg-light-gray mb-5 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-olive/15 to-deep-forest/10 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                      <div className="text-olive/20 text-5xl font-thin font-display">{i + 1}</div>
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-3 text-[10px] lg:text-[11px] tracking-[0.1em] uppercase mb-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-gold font-medium">{lang === 'ar' ? item.categoryAr : item.category}</span>
                  <span className="text-olive/30">—</span>
                  <span className="text-olive/40">{lang === 'ar' ? item.dateAr : item.date}</span>
                </div>

                <h3 className={`text-lg lg:text-xl font-semibold text-deep-forest mb-3 leading-snug group-hover:text-deep-forest/80 transition-colors ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {lang === 'ar' ? item.titleAr : item.title}
                </h3>
                <p className={`text-sm lg:text-base text-olive/60 leading-relaxed mb-4 ${lang === 'ar' ? 'text-right' : ''}`}>
                  {lang === 'ar' ? item.descriptionAr : item.description}
                </p>

                <span className={`inline-flex items-center gap-2 text-[12px] lg:text-[13px] font-semibold tracking-[0.06em] text-olive group-hover:text-muted-gold transition-colors duration-300 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                  {t.news.readMore}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
