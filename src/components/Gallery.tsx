import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const galleryItems = [
  { id: 1, category: 'Entretien', categoryAr: 'صيانة', aspect: 'aspect-[4/5]' },
  { id: 2, category: 'Nettoyage', categoryAr: 'تنظيف', aspect: 'aspect-[3/4]' },
  { id: 3, category: 'Aménagement', categoryAr: 'تهيئة', aspect: 'aspect-[4/3]' },
  { id: 4, category: 'Cimetières', categoryAr: 'مقابر', aspect: 'aspect-[3/4]' },
  { id: 5, category: 'Personnel', categoryAr: 'طاقم العمل', aspect: 'aspect-[4/5]' },
  { id: 6, category: 'Activités', categoryAr: 'نشاطات', aspect: 'aspect-[4/3]' },
  { id: 7, category: 'Entretien', categoryAr: 'صيانة', aspect: 'aspect-[3/4]' },
  { id: 8, category: 'Cimetières', categoryAr: 'مقابر', aspect: 'aspect-[4/5]' },
] as const;

const categories = [
  { key: 'all', fr: 'Tout', ar: 'الكل' },
  { key: 'Entretien', fr: 'Entretien', ar: 'صيانة' },
  { key: 'Nettoyage', fr: 'Nettoyage', ar: 'تنظيف' },
  { key: 'Aménagement', fr: 'Aménagement', ar: 'تهيئة' },
  { key: 'Cimetières', fr: 'Cimetières', ar: 'مقابر' },
  { key: 'Personnel', fr: 'Personnel', ar: 'طاقم العمل' },
  { key: 'Activités', fr: 'Activités', ar: 'نشاطات' },
];

export default function Gallery() {
  const { t, lang } = useLanguage();
  const { ref, revealed } = useScrollReveal();
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = activeCategory === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
  };
  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filtered.length);
  };

  return (
    <section className="py-24 lg:py-32 xl:py-40 bg-ivory">
      <div ref={ref} className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-14 lg:mb-20"
        >
          <p className="text-[10px] lg:text-[11px] tracking-[0.3em] text-muted-gold uppercase font-medium mb-3">
            {t.gallery.heading}
          </p>

          {/* Category filters */}
          <div className={`flex flex-wrap gap-2 lg:gap-3 mt-8 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-1.5 text-[11px] lg:text-xs tracking-[0.08em] uppercase font-medium transition-all duration-300 ${
                  activeCategory === cat.key
                    ? 'bg-deep-forest text-ivory'
                    : 'text-olive/50 hover:text-deep-forest border border-transparent hover:border-light-gray'
                }`}
              >
                {lang === 'ar' ? cat.ar : cat.fr}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 lg:gap-5">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.06 * i, ease: 'easeOut' }}
              className="break-inside-avoid mb-4 lg:mb-5"
            >
              <button
                onClick={() => openLightbox(i)}
                className="block w-full group cursor-pointer"
              >
                <div className={`${item.aspect} bg-light-gray overflow-hidden relative`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-olive/12 to-deep-forest/8 flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-700 ease-out">
                    <span className="text-olive/15 text-3xl font-thin font-display">{item.id}</span>
                  </div>
                  <div className="absolute inset-0 bg-deep-forest/0 group-hover:bg-deep-forest/10 transition-colors duration-500" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-deep-forest/95 flex items-center justify-center"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-ivory/60 hover:text-ivory transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={prevImage}
              className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 text-ivory/50 hover:text-ivory transition-colors"
            >
              <ChevronLeft className="w-8 h-8 lg:w-10 lg:h-10" />
            </button>
            <div className="w-full max-w-4xl aspect-[4/3] bg-light-gray/10 mx-16 flex items-center justify-center">
              <span className="text-ivory/20 text-6xl font-thin font-display">
                {filtered[lightboxIndex].id}
              </span>
            </div>
            <button
              onClick={nextImage}
              className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 text-ivory/50 hover:text-ivory transition-colors"
            >
              <ChevronRight className="w-8 h-8 lg:w-10 lg:h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
