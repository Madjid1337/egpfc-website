import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const navLinks = [
  { key: 'home', path: '/' },
  { key: 'establishment', path: '/etablissement' },
  { key: 'services', path: '/services' },
  { key: 'cemeteries', path: '/cimetieres' },
  { key: 'news', path: '/actualites' },
  { key: 'contact', path: '/contact' },
] as const;

const serviceLinks = [
  { key: 'gestion', path: '/services#gestion-cimetieres' },
  { key: 'entretien', path: '/services#proprete-entretien' },
  { key: 'amenagement', path: '/services#amenagement' },
  { key: 'funeraires', path: '/services#services-funeraires' },
  { key: 'preservation', path: '/services#preservation' },
] as const;

const serviceLabels: Record<string, string> = {
  gestion: 'Gestion des cimetières',
  entretien: 'Propreté & entretien',
  amenagement: 'Aménagement',
  funeraires: 'Services funéraires',
  preservation: 'Préservation',
};

const serviceLabelsAr: Record<string, string> = {
  gestion: 'تسيير المقابر',
  entretien: 'النظافة والصيانة',
  amenagement: 'التهيئة',
  funeraires: 'الخدمات الجنائزية',
  preservation: 'الحفظ',
};

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="bg-deep-forest text-ivory/80 pt-20 lg:pt-28 pb-8 lg:pb-10">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16 lg:mb-20">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-9 h-9 rounded-sm bg-ivory">
                <span className="text-deep-forest font-bold text-sm font-display">E</span>
              </div>
              <span className="text-ivory text-xs font-semibold tracking-[0.2em]">EGPFC</span>
            </Link>
            <p className={`text-sm leading-relaxed text-ivory/50 max-w-xs ${lang === 'ar' ? 'font-arabic text-right' : ''}`}>
              {t.footer.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] lg:text-[11px] tracking-[0.2em] text-ivory/40 uppercase mb-5 font-medium">
              {t.footer.navigation}
            </h4>
            <nav className={`space-y-3 ${lang === 'ar' ? 'text-right' : ''}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  className="block text-sm text-ivory/50 hover:text-ivory transition-colors duration-300"
                >
                  {t.nav[link.key]}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[10px] lg:text-[11px] tracking-[0.2em] text-ivory/40 uppercase mb-5 font-medium">
              {t.footer.services}
            </h4>
            <nav className={`space-y-3 ${lang === 'ar' ? 'text-right' : ''}`}>
              {serviceLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  className="block text-sm text-ivory/50 hover:text-ivory transition-colors duration-300"
                >
                  {lang === 'ar' ? serviceLabelsAr[link.key] : serviceLabels[link.key]}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social / Empty space for visual balance */}
          <div>
            <h4 className="text-[10px] lg:text-[11px] tracking-[0.2em] text-ivory/40 uppercase mb-5 font-medium">
              &nbsp;
            </h4>
            <div className={`flex gap-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              {/* Social media placeholders */}
              {['FB', 'TW', 'IG', 'LN'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 flex items-center justify-center border border-ivory/10 text-ivory/30 text-[10px] hover:text-muted-gold hover:border-muted-gold/30 transition-all duration-300"
                  aria-label={social}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`pt-8 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] lg:text-xs text-ivory/30 ${lang === 'ar' ? 'flex-col-reverse' : ''}`}>
          <p>{t.footer.copyright}</p>
          <div className={`flex flex-wrap justify-center gap-5 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <a href="#" className="hover:text-ivory/60 transition-colors">{t.footer.legal}</a>
            <a href="#" className="hover:text-ivory/60 transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-ivory/60 transition-colors">{t.footer.sitemap}</a>
            <a href="#" className="hover:text-ivory/60 transition-colors">{t.footer.accessibility}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
