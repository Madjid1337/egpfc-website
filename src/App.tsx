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
import AdminNews from '@/pages/admin/AdminNews';
import AdminNewsForm from '@/pages/admin/AdminNewsForm';
import AdminServices from '@/pages/admin/AdminServices';
import AdminServiceForm from '@/pages/admin/AdminServiceForm';
import AdminReports from '@/pages/admin/AdminReports';
import AdminUnites from '@/pages/admin/AdminUnites';
import AdminAlerts from '@/pages/admin/AdminAlerts';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminInventory from '@/pages/admin/AdminInventory';
import AdminInventoryScan from '@/pages/admin/AdminInventoryScan';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const { pathname } = useLocation();
  const isTeamLogin = pathname === '/inventaire';
  const isAdmin = pathname.startsWith('/admin');

  if (isTeamLogin) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/inventaire" element={<AdminInventoryScan />} />
        </Routes>
      </>
    );
  }

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
            <Route path="actualites" element={<AdminNews />} />
            <Route path="actualites/nouveau" element={<AdminNewsForm />} />
            <Route path="actualites/:id" element={<AdminNewsForm />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="services/nouveau" element={<AdminServiceForm />} />
            <Route path="services/:id" element={<AdminServiceForm />} />
            <Route path="medias" element={<AdminMedia />} />
            <Route path="signalements" element={<AdminReports />} />
            <Route path="unites" element={<AdminUnites />} />
            <Route path="utilisateurs" element={<AdminUsers />} />
            <Route path="alertes" element={<AdminAlerts />} />
            <Route path="inventaire" element={<AdminInventory />} />
            <Route path="inventaire/scan" element={<Navigate to="/inventaire" replace />} />
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
