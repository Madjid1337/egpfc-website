import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Search, ChevronRight, MapPinHouse, Clock } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCemeteries } from '@/hooks/useCemeteries';
import type { Cemetery } from '@/data/cemeteries';
import { MAP_MAX_ZOOM } from '@/lib/mapTiles';
import MapBaseLayers from '@/components/MapBaseLayers';

const markerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#B89555;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export default function CemeteriesPage() {
  const { t, lang } = useLanguage();
  const { cemeteries, communes } = useCemeteries();
  const [search, setSearch] = useState('');
  const [communeFilter, setCommuneFilter] = useState('');

  const filtered = cemeteries.filter((c: Cemetery) => {
    const name = lang === 'ar' ? c.nameAr : c.name;
    const communeName = lang === 'ar' ? c.communeAr : c.commune;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      communeName.toLowerCase().includes(search.toLowerCase());
    const matchesCommune = !communeFilter || c.commune === communeFilter;
    return matchesSearch && matchesCommune;
  });

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
            {t.cemeteries.heading}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-3xl lg:text-5xl xl:text-6xl font-light text-ivory leading-[1.15] max-w-3xl ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}
          >
            {t.cemeteries.subtitle}
          </motion.h1>
        </div>
      </section>

      {/* Map */}
      <section className="h-[400px] lg:h-[500px] bg-light-gray relative">
        <MapContainer
          center={[36.75, 3.05]}
          zoom={11}
          minZoom={8}
          maxZoom={MAP_MAX_ZOOM}
          scrollWheelZoom={true}
          className="h-full w-full"
          zoomControl={true}
        >
          <MapBaseLayers defaultMode="satellite" />
          {cemeteries.map((cemetery) => (
            <Marker
              key={cemetery.id}
              position={cemetery.coordinates}
              icon={markerIcon}
            >
              <Popup>
                <div className="text-sm font-medium">
                  <Link to={`/cimetieres/${cemetery.id}`} className="hover:text-muted-gold transition-colors">
                    {lang === 'ar' ? cemetery.nameAr : cemetery.name}
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      {/* Directory */}
      <section className="py-20 lg:py-28 bg-off-white">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
          {/* Filters */}
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            <div className="relative">
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
          </div>

          {/* Results grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cemetery, i) => (
              <motion.div
                key={cemetery.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
              >
                <Link to={`/cimetieres/${cemetery.id}`} className="block bg-white border border-light-gray p-6 hover:border-muted-gold/30 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-light-gray flex items-center justify-center text-olive/30 text-xs font-mono mb-4">
                    {cemetery.hectares}ha
                  </div>
                  <h3 className={`text-lg font-semibold text-deep-forest mb-2 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'ar' ? cemetery.nameAr : cemetery.name}
                  </h3>
                  <p className="text-sm text-olive/50 mb-3">
                    {lang === 'ar' ? cemetery.communeAr : cemetery.commune}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-olive/40 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPinHouse className="w-3 h-3" />
                      {cemetery.hectares} ha
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cemetery.openingHours}
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.06em] text-olive group-hover:text-muted-gold transition-colors ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                    {t.cemeteries.viewDetails}
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
