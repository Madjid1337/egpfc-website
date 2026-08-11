import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const navLinks = [
  { key: 'home', path: '/' },
  { key: 'establishment', path: '/etablissement' },
  { key: 'services', path: '/services' },
  { key: 'cemeteries', path: '/cimetieres' },
  { key: 'news', path: '/actualites' },
  { key: 'contact', path: '/contact' },
] as const;

export default function Header() {
  const { t, lang, toggleLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-ivory/95 backdrop-blur-md shadow-sm border-b border-light-gray/50'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12 xl:px-20">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 lg:gap-4 shrink-0">
              <div className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-sm bg-deep-forest">
                <span className={`text-ivory font-bold text-sm lg:text-base ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
                  E
                </span>
              </div>
              <div className="hidden sm:block">
                <p className={`text-[10px] lg:text-[11px] uppercase tracking-[0.15em] font-medium leading-tight ${
                  scrolled ? 'text-charcoal' : 'text-white'
                }`}>
                  EGPFC
                </p>
                <p className={`text-[7px] lg:text-[8px] leading-tight max-w-[200px] lg:max-w-[240px] ${
                  scrolled ? 'text-olive/60' : 'text-white/60'
                }`}>
                  Établissement de Gestion des Pompes Funèbres et des Cimetières de la Wilaya d&apos;Alger
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  className={`relative px-3 xl:px-4 py-2 text-[13px] xl:text-sm font-medium tracking-wide transition-colors duration-300 ${
                    scrolled
                      ? isActive(link.path)
                        ? 'text-deep-forest'
                        : 'text-olive hover:text-deep-forest'
                      : isActive(link.path)
                        ? 'text-white'
                        : 'text-white/75 hover:text-white'
                  }`}
                >
                  {t.nav[link.key]}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="activeNav"
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-5 ${
                        scrolled ? 'bg-muted-gold' : 'bg-muted-gold'
                      }`}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 lg:gap-4">
              <button
                onClick={toggleLang}
                className={`text-xs lg:text-[13px] font-semibold tracking-wider px-2 py-1 transition-colors ${
                  scrolled ? 'text-deep-forest hover:text-muted-gold' : 'text-white/80 hover:text-white'
                }`}
              >
                {t.nav.langSwitch}
              </button>
              <button
                onClick={() => setMenuOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 transition-colors ${
                  scrolled ? 'text-deep-forest hover:text-muted-gold' : 'text-white/80 hover:text-white'
                }`}
                aria-label={t.nav.menu}
              >
                <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-deep-forest flex flex-col"
          >
            <div className="flex items-center justify-between px-6 lg:px-12 xl:px-20 h-16 lg:h-20">
              <Link to="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                <div className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-sm bg-ivory">
                  <span className="text-deep-forest font-bold text-sm lg:text-base font-display">E</span>
                </div>
                <span className="text-ivory text-xs font-semibold tracking-[0.2em]">EGPFC</span>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-ivory/80 hover:text-ivory transition-colors"
                aria-label={t.nav.close}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <nav className={`flex flex-col items-center gap-8 ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.key}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.5, ease: 'easeOut' }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className={`text-4xl lg:text-5xl xl:text-6xl font-light tracking-wide transition-colors duration-300 ${
                        isActive(link.path)
                          ? 'text-muted-gold'
                          : 'text-ivory/70 hover:text-ivory'
                      }`}
                    >
                      {t.nav[link.key]}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
            <div className="flex justify-center pb-12">
              <button
                onClick={toggleLang}
                className="text-ivory/50 hover:text-ivory text-sm tracking-[0.2em] transition-colors"
              >
                {t.nav.langSwitch}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
