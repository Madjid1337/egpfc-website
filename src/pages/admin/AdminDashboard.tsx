import { Link, Navigate } from 'react-router-dom';
import { MapPinned, Images, Plus, Newspaper, Briefcase, ClipboardList, Building2, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCemeteries } from '@/hooks/useCemeteries';
import { useNews } from '@/hooks/useNews';
import { useServices } from '@/hooks/useServices';
import { fetchMyAlerts, fetchReports, hoursPending } from '@/lib/operationsApi';

export default function AdminDashboard() {
  const { isFullAccess, isChef, isInventory, uniteId } = useAuth();
  const { cemeteries: all, loading: cLoading } = useCemeteries();
  const cemeteries =
    isChef && uniteId ? all.filter((c) => c.uniteId === uniteId) : all;
  const { items: news, loading: nLoading } = useNews({ includeDrafts: true });
  const { items: services, loading: sLoading } = useServices({ includeDrafts: true });
  const [pendingReports, setPendingReports] = useState<number | null>(null);
  const [overdue, setOverdue] = useState<number | null>(null);
  const [unreadAlerts, setUnreadAlerts] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      const { data: reports } = await fetchReports();
      setPendingReports(reports.filter((r) => r.status === 'PENDING').length);
      setOverdue(
        reports.filter((r) => r.status === 'PENDING' && hoursPending(r.createdAt) >= 48).length,
      );
      if (isChef) {
        const alerts = await fetchMyAlerts();
        setUnreadAlerts(alerts.filter((a) => !a.readAt).length);
      }
    })();
  }, [isChef]);

  const cmsSections = [
    {
      to: '/admin/cimetieres',
      label: 'Cimetières',
      desc: 'Carte, fiches & QR',
      icon: MapPinned,
      add: '/admin/cimetieres/nouveau',
      count: cLoading ? '…' : cemeteries.length,
    },
    ...(isFullAccess
      ? [
          {
            to: '/admin/actualites',
            label: 'Actualités',
            desc: 'Articles & photos',
            icon: Newspaper,
            add: '/admin/actualites/nouveau',
            count: nLoading ? '…' : news.length,
          },
          {
            to: '/admin/services',
            label: 'Nos services',
            desc: 'Offres du site',
            icon: Briefcase,
            add: '/admin/services/nouveau',
            count: sLoading ? '…' : services.length,
          },
          {
            to: '/admin/medias',
            label: 'Photos',
            desc: 'Médias généraux',
            icon: Images,
            add: '/admin/medias',
            count: '—',
          },
        ]
      : []),
  ];

  const opsSections = [
    {
      to: '/admin/signalements',
      label: 'Signalements',
      desc: pendingReports === null ? '…' : `${pendingReports} en attente · ${overdue ?? 0} en retard`,
      icon: ClipboardList,
    },
    ...(isFullAccess
      ? [{ to: '/admin/unites', label: 'Unités', desc: 'Chefs & périmètres', icon: Building2 }]
      : []),
    ...(isChef
      ? [
          {
            to: '/admin/alertes',
            label: 'Alertes',
            desc: unreadAlerts === null ? '…' : `${unreadAlerts} non lue(s)`,
            icon: Bell,
          },
        ]
      : []),
  ];

  if (isInventory) {
    return <Navigate to="/admin/inventaire/scan" replace />;
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-deep-forest mb-2">Tableau de bord</h1>
      <p className="text-sm text-olive/60 mb-10">
        {isFullAccess
          ? 'Pilotage global : contenu du site et opérations terrain.'
          : 'Cimetières et signalements de votre unité.'}
      </p>

      <h2 className="text-[10px] tracking-[0.2em] uppercase text-olive/40 mb-3">Opérations</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {opsSections.map(({ to, label, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="bg-ivory border border-light-gray p-6 flex flex-col hover:border-muted-gold/50 transition-colors"
          >
            <Icon className="w-5 h-5 text-muted-gold mb-4" />
            <h3 className="text-lg font-medium text-deep-forest mb-1">{label}</h3>
            <p className="text-xs text-olive/50">{desc}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-[10px] tracking-[0.2em] uppercase text-olive/40 mb-3">Contenu</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {cmsSections.map(({ to, label, desc, icon: Icon, add, count }) => (
          <div key={to} className="bg-ivory border border-light-gray p-6 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <Icon className="w-5 h-5 text-muted-gold" />
              <span className="font-display text-3xl font-light text-deep-forest">{count}</span>
            </div>
            <h3 className="text-lg font-medium text-deep-forest mb-1">{label}</h3>
            <p className="text-xs text-olive/50 mb-6">{desc}</p>
            <div className="mt-auto flex gap-3">
              <Link to={to} className="text-sm font-semibold text-deep-forest hover:text-muted-gold">
                Gérer →
              </Link>
              <Link to={add} className="inline-flex items-center gap-1 text-sm text-olive/50 hover:text-deep-forest">
                <Plus className="w-3.5 h-3.5" />
                Ajouter
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
