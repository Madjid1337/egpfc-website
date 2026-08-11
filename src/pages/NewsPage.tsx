import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { newsItems } from '@/data/news';

export default function NewsPage() {
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
            {t.news.heading}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-3xl lg:text-5xl font-light text-ivory ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}
          >
            {t.news.heading}
          </motion.h1>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-off-white">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {newsItems.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 * i, ease: [0.25, 0.1, 0.25, 1] }}
                className="group"
              >
                <Link to={`/actualites/${item.slug}`} className="block">
                  <div className="aspect-[16/10] bg-light-gray mb-5 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-olive/15 to-deep-forest/10 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                      <div className="text-olive/20 text-5xl font-thin font-display">{item.id}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 text-[10px] lg:text-[11px] tracking-[0.1em] uppercase mb-3 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <span className="text-muted-gold font-medium">{lang === 'ar' ? item.categoryAr : item.category}</span>
                    <span className="text-olive/30">—</span>
                    <span className="text-olive/40">{lang === 'ar' ? item.dateAr : item.date}</span>
                  </div>
                  <h2 className={`text-lg lg:text-xl font-semibold text-deep-forest mb-3 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'ar' ? item.titleAr : item.title}
                  </h2>
                  <p className={`text-sm text-olive/60 leading-relaxed mb-4 ${lang === 'ar' ? 'text-right' : ''}`}>
                    {lang === 'ar' ? item.descriptionAr : item.description}
                  </p>
                  <span className={`inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.06em] text-olive group-hover:text-muted-gold transition-colors ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                    {t.news.readMore}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                  </span>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
