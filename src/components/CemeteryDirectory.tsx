import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cemeteries, communes } from '@/data/cemeteries';
import type { Cemetery } from '@/data/cemeteries';

export default function CemeteryDirectory() {
  const { t, lang } = useLanguage();
  const { ref, revealed } = useScrollReveal();
  const [search, setSearch] = useState('');
  const [communeFilter, setCommuneFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = cemeteries.filter((c: Cemetery) => {
    const name = lang === 'ar' ? c.nameAr : c.name;
    const communeName = lang === 'ar' ? c.communeAr : c.commune;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      communeName.toLowerCase().includes(search.toLowerCase());
    const matchesCommune = !communeFilter || c.commune === communeFilter;
    const matchesType = !typeFilter || c.type === typeFilter;
    return matchesSearch && matchesCommune && matchesType;
  });

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
            {t.cemeteries.search}
          </p>

          {/* Search & Filters */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-olive/40 ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                placeholder={t.cemeteries.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full bg-white border border-light-gray py-3 text-sm text-deep-forest placeholder:text-olive/40 focus:outline-none focus:border-muted-gold transition-colors ${lang === 'ar' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4'}`}
              />
            </div>
            <select
              value={communeFilter}
              onChange={(e) => setCommuneFilter(e.target.value)}
              className="bg-white border border-light-gray py-3 px-4 text-sm text-deep-forest focus:outline-none focus:border-muted-gold transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23526451' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: lang === 'ar' ? 'left 12px center' : 'right 12px center' }}
            >
              <option value="">{t.cemeteries.allCommunes}</option>
              {communes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-light-gray py-3 px-4 text-sm text-deep-forest focus:outline-none focus:border-muted-gold transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23526451' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: lang === 'ar' ? 'left 12px center' : 'right 12px center' }}
            >
              <option value="">{t.cemeteries.allTypes}</option>
              <option value="islamique">Islamique</option>
              <option value="chrétien">Chrétien</option>
              <option value="mixte">Mixte</option>
            </select>
            <select
              className="bg-white border border-light-gray py-3 px-4 text-sm text-deep-forest focus:outline-none focus:border-muted-gold transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23526451' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: lang === 'ar' ? 'left 12px center' : 'right 12px center' }}
            >
              <option value="">{t.cemeteries.all}</option>
              <option value="available">{t.cemeteries.available}</option>
              <option value="unavailable">{t.cemeteries.unavailable}</option>
            </select>
          </div>
        </motion.div>

        {/* Results */}
        <div className="divide-y divide-light-gray">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center text-olive/50 text-sm"
              >
                {t.cemeteries.noResults}
              </motion.p>
            ) : (
              filtered.map((cemetery, i) => (
                <motion.div
                  key={cemetery.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={revealed ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.05 * i, ease: 'easeOut' }}
                >
                  <Link
                    to={`/cimetieres/${cemetery.id}`}
                    className={`flex items-center justify-between py-6 group hover:bg-ivory/50 px-4 -mx-4 transition-colors duration-300 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex items-center gap-5 lg:gap-8 min-w-0 ${lang === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                      <div className="w-12 h-12 lg:w-14 lg:h-14 bg-light-gray shrink-0 flex items-center justify-center text-olive/30 text-xs font-mono">
                        {cemetery.hectares}ha
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-base lg:text-lg font-semibold text-deep-forest mb-1 group-hover:text-deep-forest transition-colors ${lang === 'ar' ? 'font-arabic' : ''}`}>
                          {lang === 'ar' ? cemetery.nameAr : cemetery.name}
                        </h3>
                        <p className="text-sm text-olive/50 truncate">
                          {lang === 'ar' ? cemetery.communeAr : cemetery.commune}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] lg:text-xs text-olive/40 hidden sm:block uppercase tracking-[0.08em]">
                        {lang === 'ar' ? cemetery.typeAr : cemetery.type}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-olive/30 group-hover:text-muted-gold transition-all duration-300 ${lang === 'ar' ? 'rotate-180' : ''} group-hover:translate-x-1`} />
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
