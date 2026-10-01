import { motion } from 'framer-motion';
import Contact from '@/components/Contact';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '@/i18n/LanguageContext';
import { MAP_TILE } from '@/lib/mapTiles';

const markerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#0D2B22;border:2px solid #B89555;box-shadow:0 2px 12px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function ContactPage() {
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
            {t.contact.heading}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`text-3xl lg:text-5xl font-light text-ivory ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}
          >
            {t.contact.heading}
          </motion.h1>
        </div>
      </section>

      <Contact />

      {/* Map */}
      <section className="h-[400px] lg:h-[500px] bg-light-gray">
        <MapContainer
          center={[36.75, 3.05]}
          zoom={12}
          scrollWheelZoom={false}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution={MAP_TILE.attribution}
            url={MAP_TILE.url}
            maxZoom={MAP_TILE.maxZoom}
          />
          <Marker position={[36.7528, 3.0421]} icon={markerIcon} />
        </MapContainer>
      </section>
    </div>
  );
}
