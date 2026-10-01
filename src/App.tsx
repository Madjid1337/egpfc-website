import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCemeteries from '@/pages/admin/AdminCemeteries';
import AdminCemeteryForm from '@/pages/admin/AdminCemeteryForm';
import AdminMedia from '@/pages/admin/AdminMedia';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="cimetieres" element={<AdminCemeteries />} />
            <Route path="cimetieres/nouveau" element={<AdminCemeteryForm />} />
            <Route path="cimetieres/:id" element={<AdminCemeteryForm />} />
            <Route path="medias" element={<AdminMedia />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </>
    );
  }

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
