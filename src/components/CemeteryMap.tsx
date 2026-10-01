import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Clock, MapPinHouse, Building2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useCountUp } from '@/hooks/useCountUp';
import { useCemeteries } from '@/hooks/useCemeteries';
import type { Cemetery } from '@/data/cemeteries';
import { MAP_TILE } from '@/lib/mapTiles';

// Custom marker icon
const markerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#B89555;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const selectedMarkerIcon = new L.DivIcon({
  className: 'custom-marker-selected',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#0D2B22;border:2px solid #B89555;box-shadow:0 2px 12px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapController() {
  useMap();
  return null;
}

function StatItem({ value, label, revealed, delay }: { value: number; label: string; revealed: boolean; delay: number }) {
  const count = useCountUp(value, 2000, revealed);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={revealed ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="text-center"
    >
      <span className={`block text-3xl lg:text-4xl xl:text-5xl font-light text-deep-forest mb-1 tabular-nums font-display`}>
        {count}+
      </span>
      <span className="text-[11px] lg:text-xs text-olive/60 uppercase tracking-[0.15em] font-medium">
        {label}
      </span>
    </motion.div>
  );
}

export default function CemeteryMap() {
  const { t, lang } = useLanguage();
  const { ref, revealed } = useScrollReveal();
  const { cemeteries, stats } = useCemeteries();
  const [selectedCemetery, setSelectedCemetery] = useState<Cemetery | null>(null);

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
            {t.cemeteries.heading}
          </p>
          <h2 className={`text-3xl lg:text-4xl xl:text-5xl font-light text-deep-forest leading-[1.15] ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
            {t.cemeteries.subtitle}
          </h2>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 mb-14 lg:mb-20">
          <StatItem value={stats.totalCemeteries} label={t.cemeteries.managed} revealed={revealed} delay={0.1} />
          <StatItem value={stats.communesCovered} label={t.cemeteries.communes} revealed={revealed} delay={0.2} />
          <StatItem value={stats.hectaresMaintained} label={t.cemeteries.hectares} revealed={revealed} delay={0.3} />
          <StatItem value={stats.agentsDeployed} label={t.cemeteries.agents} revealed={revealed} delay={0.4} />
        </div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="relative h-[400px] lg:h-[500px] xl:h-[600px] bg-light-gray overflow-hidden rounded-none"
        >
          <MapContainer
            center={[36.75, 3.05]}
            zoom={11}
            scrollWheelZoom={false}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution={MAP_TILE.attribution}
              url={MAP_TILE.url}
              maxZoom={MAP_TILE.maxZoom}
            />
            <MapController />
            {cemeteries.map((cemetery) => (
              <Marker
                key={cemetery.id}
                position={cemetery.coordinates}
                icon={selectedCemetery?.id === cemetery.id ? selectedMarkerIcon : markerIcon}
                eventHandlers={{
                  click: () => setSelectedCemetery(cemetery),
                }}
              >
                <Popup>
                  <div className="text-sm font-medium">{cemetery.name}</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map overlay button */}
          <div className="absolute bottom-6 right-6 z-[1000]">
            <Link
              to="/cimetieres"
              className="inline-flex items-center gap-2 bg-deep-forest text-ivory px-5 py-2.5 text-xs font-semibold tracking-[0.08em] hover:bg-deep-forest/90 transition-colors shadow-lg"
            >
              {t.cemeteries.explore}
            </Link>
          </div>
        </motion.div>

        {/* Cemetery Detail Panel */}
        <AnimatePresence>
          {selectedCemetery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-6 bg-off-white p-6 lg:p-8 border border-light-gray">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className={`text-xl lg:text-2xl font-semibold text-deep-forest mb-1 ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
                      {lang === 'ar' ? selectedCemetery.nameAr : selectedCemetery.name}
                    </h3>
                    <p className="text-sm text-olive/60">
                      {lang === 'ar' ? selectedCemetery.communeAr : selectedCemetery.commune}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCemetery(null)}
                    className="text-olive/40 hover:text-olive transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPinHouse className="w-4 h-4 text-muted-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-olive/40 mb-0.5">{t.cemeteries.address}</p>
                      <p className="text-sm text-deep-forest">{lang === 'ar' ? selectedCemetery.addressAr : selectedCemetery.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-muted-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-olive/40 mb-0.5">{t.cemeteries.openingHours}</p>
                      <p className="text-sm text-deep-forest">{lang === 'ar' ? selectedCemetery.openingHoursAr : selectedCemetery.openingHours}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-muted-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-olive/40 mb-0.5">{t.cemeteries.type}</p>
                      <p className="text-sm text-deep-forest">{lang === 'ar' ? selectedCemetery.typeAr : selectedCemetery.type.charAt(0).toUpperCase() + selectedCemetery.type.slice(1)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/cimetieres/${selectedCemetery.id}`}
                    className="inline-flex items-center gap-2 bg-deep-forest text-ivory px-5 py-2.5 text-[12px] font-semibold tracking-[0.06em] hover:bg-deep-forest/90 transition-colors"
                  >
                    {t.cemeteries.viewDetails}
                  </Link>
                  <a
                    href={`https://www.google.com/maps?q=${selectedCemetery.coordinates[0]},${selectedCemetery.coordinates[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-olive/30 text-deep-forest px-5 py-2.5 text-[12px] font-semibold tracking-[0.06em] hover:bg-olive/5 transition-colors"
                  >
                    {t.cemeteries.openMap}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
