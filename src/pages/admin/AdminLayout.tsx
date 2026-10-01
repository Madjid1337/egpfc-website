import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, MapPinned, Images, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const links = [
  { to: '/admin', end: true, label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/admin/cimetieres', end: false, label: 'Cimetières', icon: MapPinned },
  { to: '/admin/medias', end: false, label: 'Photos', icon: Images },
];

export default function AdminLayout() {
  const { isAuthenticated, loading, signOut, user } = useAuth();

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

  return (
    <div className="min-h-screen bg-off-white flex">
      <aside className="w-64 shrink-0 bg-deep-forest text-ivory flex flex-col">
        <div className="px-6 py-8 border-b border-ivory/10">
          <p className="text-[10px] tracking-[0.3em] text-muted-gold uppercase mb-2">Admin</p>
          <h1 className="font-display text-xl font-light">EGPFC</h1>
          <p className="text-[11px] text-ivory/40 mt-2 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {links.map(({ to, end, label, icon: Icon }) => (
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
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 py-8 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
