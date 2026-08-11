import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LanguageProvider } from '@/i18n/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import AboutPage from '@/pages/AboutPage';
import ServicesPage from '@/pages/ServicesPage';
import CemeteriesPage from '@/pages/CemeteriesPage';
import CemeteryDetails from '@/pages/CemeteryDetails';
import NewsPage from '@/pages/NewsPage';
import NewsDetails from '@/pages/NewsDetails';
import ContactPage from '@/pages/ContactPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/etablissement" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/cimetieres" element={<CemeteriesPage />} />
          <Route path="/cimetieres/:id" element={<CemeteryDetails />} />
          <Route path="/actualites" element={<NewsPage />} />
          <Route path="/actualites/:slug" element={<NewsDetails />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AppRoutes />
      </LanguageProvider>
    </BrowserRouter>
  );
}
