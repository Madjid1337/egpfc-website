import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { fetchMyAlerts, markAlertRead } from '@/lib/operationsApi';
import type { Alert } from '@/lib/operationsTypes';

export default function AdminAlerts() {
  const { isChef, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    setAlerts(await fetchMyAlerts());
    setLoading(false);
    window.dispatchEvent(new Event('egpfc-alerts-changed'));
  }

  useEffect(() => {
    void reload();
  }, []);

  async function onRead(id: string) {
    await markAlertRead(id);
    await reload();
  }

  if (authLoading) {
    return <p className="text-olive/50">Chargement…</p>;
  }

  if (!isChef) {
    return <Navigate to="/admin/signalements" replace />;
  }

  const unread = alerts.filter((a) => !a.readAt).length;

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-deep-forest mb-2">Alertes</h1>
      <p className="text-sm text-olive/60 mb-8">
        {loading ? 'Chargement…' : `${unread} non lue${unread === 1 ? '' : 's'} · ${alerts.length} au total`}
      </p>

      <div className="space-y-3">
        {!loading && alerts.length === 0 && (
          <p className="text-olive/50 bg-ivory border border-light-gray p-6">Aucune alerte.</p>
        )}
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`border p-5 flex gap-4 ${
              a.readAt ? 'bg-ivory border-light-gray' : 'bg-muted-gold/10 border-muted-gold/40'
            }`}
          >
            <Bell className={`w-5 h-5 shrink-0 mt-0.5 ${a.readAt ? 'text-olive/30' : 'text-muted-gold'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-deep-forest whitespace-pre-wrap">{a.message}</p>
              <p className="text-xs text-olive/50 mt-2">
                {new Date(a.createdAt).toLocaleString('fr-DZ')}
                {a.readAt ? ' · Lu' : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link to="/admin/signalements" className="text-sm text-muted-gold hover:underline">
                  Voir les signalements →
                </Link>
                {!a.readAt && (
                  <button
                    type="button"
                    onClick={() => onRead(a.id)}
                    className="text-sm text-olive/60 hover:text-deep-forest"
                  >
                    Marquer comme lu
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
