import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { newsItems } from '@/data/news';

export default function NewsDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useLanguage();
  const article = newsItems.find((n) => n.slug === slug);

  if (!article) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-olive/50">Article non trouvé.</p>
        <Link to="/actualites" className="text-muted-gold hover:underline mt-4 inline-block">
          ← {t.news.heading}
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20">
      <section className="bg-deep-forest py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
          <Link
            to="/actualites"
            className={`inline-flex items-center gap-2 text-ivory/50 hover:text-ivory text-sm mb-8 transition-colors ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className="w-4 h-4" />
            {t.news.heading}
          </Link>
          <div className={`flex items-center gap-3 text-[10px] lg:text-[11px] tracking-[0.1em] uppercase mb-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <span className="text-muted-gold font-medium">{lang === 'ar' ? article.categoryAr : article.category}</span>
            <span className="text-ivory/20">—</span>
            <span className="text-ivory/40">{lang === 'ar' ? article.dateAr : article.date}</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className={`text-3xl lg:text-5xl xl:text-6xl font-light text-ivory leading-[1.15] max-w-4xl ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}
          >
            {lang === 'ar' ? article.titleAr : article.title}
          </motion.h1>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-off-white">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
          <div className="max-w-3xl">
            {/* Image placeholder */}
            <div className="aspect-[16/9] bg-light-gray mb-10">
              <div className="w-full h-full bg-gradient-to-br from-olive/10 to-deep-forest/5 flex items-center justify-center">
                <span className="text-olive/15 text-6xl font-thin font-display">{article.id}</span>
              </div>
            </div>
            <p className={`text-lg leading-relaxed text-deep-forest/70 ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
              {lang === 'ar' ? article.descriptionAr : article.description}
            </p>
            <p className={`text-base leading-relaxed text-deep-forest/50 mt-6 ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
              Cet article présente les détails de l&apos;initiative menée par l&apos;EGPFC dans le cadre de sa mission de gestion et de préservation des cimetières de la Wilaya d&apos;Alger.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
