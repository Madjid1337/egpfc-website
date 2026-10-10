import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPinned,
  Images,
  Newspaper,
  Briefcase,
  LogOut,
  ClipboardList,
  Building2,
  Bell,
  Users,
  Barcode,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { fetchMyAlerts } from '@/lib/operationsApi';

export default function AdminLayout() {
  const { isAuthenticated, loading, signOut, user, profile, isFullAccess, isChef, isDev, isInventory } = useAuth();
  const { pathname } = useLocation();
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    if (!isChef) {
      setUnreadAlerts(0);
      return;
    }

    let cancelled = false;

    async function load() {
      const alerts = await fetchMyAlerts();
      if (!cancelled) setUnreadAlerts(alerts.filter((a) => !a.readAt).length);
    }

    void load();
    const timer = window.setInterval(() => void load(), 20000);
    window.addEventListener('egpfc-alerts-changed', load);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener('egpfc-alerts-changed', load);
    };
  }, [isChef, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center text-olive/50">
        Chargement…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const roleLabel =
    profile?.role === 'dev'
      ? 'Développeur'
      : profile?.role === 'directeur'
        ? 'Directeur'
        : profile?.role === 'chef_unite'
          ? 'Chef d’Unité'
          : profile?.role === 'inventaire'
            ? 'Équipe inventaire'
            : 'Admin';

  const cmsLinks = isInventory
    ? []
    : [
    { to: '/admin', end: true, label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/admin/cimetieres', end: false, label: 'Cimetières', icon: MapPinned },
    ...(isFullAccess
      ? [
          { to: '/admin/actualites', end: false, label: 'Actualités', icon: Newspaper },
          { to: '/admin/services', end: false, label: 'Nos services', icon: Briefcase },
          { to: '/admin/medias', end: false, label: 'Photos', icon: Images },
        ]
      : []),
  ];

  const opsLinks = isInventory
    ? [{ to: '/admin/inventaire/scan', end: false, label: 'Scan', icon: Barcode }]
    : [
    { to: '/admin/signalements', end: false, label: 'Signalements', icon: ClipboardList },
    ...(isFullAccess
      ? [
          { to: '/admin/unites', end: false, label: 'Unités', icon: Building2 },
          { to: '/admin/utilisateurs', end: false, label: 'Utilisateurs', icon: Users },
          { to: '/admin/inventaire', end: false, label: 'Inventaire', icon: Barcode },
        ]
      : []),
    ...(isChef
      ? [{ to: '/admin/alertes', end: false, label: 'Alertes', icon: Bell }]
      : []),
  ];

  return (
    <div className="h-screen bg-off-white flex overflow-hidden">
      <aside className="w-64 shrink-0 h-screen bg-deep-forest text-ivory flex flex-col">
        <div className="px-6 py-8 border-b border-ivory/10">
          <p className="text-[10px] tracking-[0.3em] text-muted-gold uppercase mb-2">{roleLabel}</p>
          <h1 className="font-display text-xl font-light">EGPFC</h1>
          <p className="text-[11px] text-ivory/40 mt-2 truncate">{user?.email}</p>
          {isDev && <p className="text-[10px] text-muted-gold/80 mt-1">Accès complet</p>}
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {cmsLinks.length > 0 && (
            <p className="px-3 mb-2 text-[9px] tracking-[0.2em] uppercase text-ivory/30">Contenu</p>
          )}
          {cmsLinks.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-ivory/10 text-muted-gold' : 'text-ivory/70 hover:bg-ivory/5 hover:text-ivory'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
          <p className="px-3 mt-6 mb-2 text-[9px] tracking-[0.2em] uppercase text-ivory/30">Opérations</p>
          {opsLinks.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-ivory/10 text-muted-gold' : 'text-ivory/70 hover:bg-ivory/5 hover:text-ivory'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="flex-1">{label}</span>
              {to === '/admin/alertes' && unreadAlerts > 0 && (
                <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-semibold leading-5 text-center">
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-ivory/10">
          <button
            type="button"
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-ivory/60 hover:text-ivory transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 py-8 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
