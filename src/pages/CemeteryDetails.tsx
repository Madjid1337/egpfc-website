import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPinHouse, Clock, Building2, ExternalLink } from 'lucide-react';
import { MapContainer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '@/i18n/LanguageContext';
import { useCemetery } from '@/hooks/useCemeteries';
import { MAP_MAX_ZOOM } from '@/lib/mapTiles';
import MapBaseLayers from '@/components/MapBaseLayers';
import ReportIssueForm from '@/components/ReportIssueForm';

const markerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#0D2B22;border:2px solid #B89555;box-shadow:0 2px 12px rgba(0,0,0,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function CemeteryDetails() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLanguage();
  const { cemetery, loading } = useCemetery(id);

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-olive/50">…</p>
      </div>
    );
  }

  if (!cemetery) {
    return (
      <div className="pt-32 pb-20 text-center">
        <p className="text-olive/50">Cimetière non trouvé.</p>
        <Link to="/cimetieres" className="text-muted-gold hover:underline mt-4 inline-block">
          ← {t.cemeteries.heading}
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-20">
      {/* Cover hero */}
      <section className="relative min-h-[42vh] lg:min-h-[52vh] overflow-hidden bg-deep-forest">
        {cemetery.imageUrl ? (
          <>
            <img
              src={cemetery.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-forest via-deep-forest/55 to-deep-forest/25" />
          </>
        ) : (
          <div className="absolute inset-0 bg-deep-forest" />
        )}

        <div className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20 py-20 lg:py-28 flex flex-col justify-end min-h-[42vh] lg:min-h-[52vh]">
          <Link
            to="/cimetieres"
            className={`inline-flex items-center gap-2 text-ivory/60 hover:text-ivory text-sm mb-8 transition-colors w-fit ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className="w-4 h-4" />
            {t.cemeteries.heading}
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className={`text-3xl lg:text-5xl xl:text-6xl font-light text-ivory leading-[1.15] mb-4 max-w-4xl ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}
          >
            {lang === 'ar' ? cemetery.nameAr : cemetery.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-ivory/60"
          >
            {lang === 'ar' ? cemetery.communeAr : cemetery.commune}, {cemetery.wilaya}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 lg:py-28 bg-off-white">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className={`flex items-start gap-4 ${lang === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                <MapPinHouse className="w-5 h-5 text-muted-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] tracking-[0.12em] text-olive/40 uppercase mb-1 font-medium">{t.cemeteries.address}</p>
                  <p className={`text-sm text-deep-forest ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'ar' ? cemetery.addressAr : cemetery.address}
                  </p>
                </div>
              </div>
              <div className={`flex items-start gap-4 ${lang === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                <Building2 className="w-5 h-5 text-muted-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] tracking-[0.12em] text-olive/40 uppercase mb-1 font-medium">{t.cemeteries.commune}</p>
                  <p className="text-sm text-deep-forest">{lang === 'ar' ? cemetery.communeAr : cemetery.commune}</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 ${lang === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                <Clock className="w-5 h-5 text-muted-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] tracking-[0.12em] text-olive/40 uppercase mb-1 font-medium">{t.cemeteries.openingHours}</p>
                  <p className="text-sm text-deep-forest">{lang === 'ar' ? cemetery.openingHoursAr : cemetery.openingHours}</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 ${lang === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                <Building2 className="w-5 h-5 text-muted-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] tracking-[0.12em] text-olive/40 uppercase mb-1 font-medium">{t.cemeteries.type}</p>
                  <p className="text-sm text-deep-forest">{cemetery.type.charAt(0).toUpperCase() + cemetery.type.slice(1)}</p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps?q=${cemetery.coordinates[0]},${cemetery.coordinates[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 border border-olive/30 text-deep-forest px-6 py-3 text-[13px] font-semibold tracking-[0.06em] hover:bg-olive/5 transition-colors mt-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}
              >
                {t.cemeteries.openMap}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Map + Description */}
            <div className="lg:col-span-2">
              <div className="h-[350px] lg:h-[450px] bg-light-gray mb-8">
                <MapContainer
                  center={cemetery.coordinates}
                  zoom={17}
                  minZoom={10}
                  maxZoom={MAP_MAX_ZOOM}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                  zoomControl={true}
                >
                  <MapBaseLayers defaultMode="satellite" />
                  <Marker position={cemetery.coordinates} icon={markerIcon} />
                </MapContainer>
              </div>

              <p className={`text-base lg:text-lg text-deep-forest/70 leading-relaxed ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
                {lang === 'ar' ? cemetery.descriptionAr : cemetery.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-light-gray">
                <div className="text-center">
                  <span className="block text-2xl lg:text-3xl font-light text-deep-forest font-display">{cemetery.hectares}</span>
                  <span className="text-[10px] tracking-[0.12em] text-olive/40 uppercase">{t.cemeteries.hectares}</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl lg:text-3xl font-light text-deep-forest font-display">
                    {cemetery.available ? '✓' : '—'}
                  </span>
                  <span className="text-[10px] tracking-[0.12em] text-olive/40 uppercase">
                    {cemetery.available ? t.cemeteries.available : t.cemeteries.unavailable}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl lg:text-3xl font-light text-deep-forest font-display">{cemetery.wilaya}</span>
                  <span className="text-[10px] tracking-[0.12em] text-olive/40 uppercase">Wilaya</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 lg:mt-20 max-w-2xl">
            <ReportIssueForm cemeteryId={cemetery.id} cemeteryName={lang === 'ar' ? cemetery.nameAr : cemetery.name} />
          </div>
        </div>
      </section>
    </div>
  );
}
