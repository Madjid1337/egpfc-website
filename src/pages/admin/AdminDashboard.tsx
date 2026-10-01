import { Link } from 'react-router-dom';
import { MapPinned, Images, Plus } from 'lucide-react';
import { useCemeteries } from '@/hooks/useCemeteries';

export default function AdminDashboard() {
  const { cemeteries, loading, source } = useCemeteries();

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-deep-forest mb-2">Tableau de bord</h1>
      <p className="text-sm text-olive/60 mb-10">
        Source des données : {source === 'supabase' ? 'Supabase' : 'locale (fallback)'}
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-ivory border border-light-gray p-6">
          <p className="text-[10px] uppercase tracking-[0.15em] text-olive/40 mb-2">Cimetières</p>
          <p className="font-display text-4xl font-light text-deep-forest">
            {loading ? '…' : cemeteries.length}
          </p>
        </div>
        <Link
          to="/admin/cimetieres/nouveau"
          className="bg-deep-forest text-ivory p-6 flex flex-col justify-between hover:bg-deep-forest/90 transition-colors"
        >
          <Plus className="w-5 h-5 text-muted-gold" />
          <span className="text-sm font-semibold tracking-[0.06em] mt-6">Ajouter un cimetière</span>
        </Link>
        <Link
          to="/admin/medias"
          className="bg-ivory border border-light-gray p-6 flex flex-col justify-between hover:border-muted-gold transition-colors"
        >
          <Images className="w-5 h-5 text-muted-gold" />
          <span className="text-sm font-semibold tracking-[0.06em] text-deep-forest mt-6">
            Gérer les photos
          </span>
        </Link>
      </div>

      <div className="bg-ivory border border-light-gray">
        <div className="px-6 py-4 border-b border-light-gray flex items-center gap-2">
          <MapPinned className="w-4 h-4 text-muted-gold" />
          <h2 className="text-sm font-semibold text-deep-forest">Cimetières récents</h2>
        </div>
        <ul className="divide-y divide-light-gray">
          {cemeteries.slice(0, 6).map((c) => (
            <li key={c.id}>
              <Link
                to={`/admin/cimetieres/${c.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-off-white transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-deep-forest">{c.name}</p>
                  <p className="text-xs text-olive/50">{c.commune}</p>
                </div>
                <span className="text-[11px] text-olive/40 tabular-nums">
                  {c.coordinates[0].toFixed(4)}, {c.coordinates[1].toFixed(4)}
                </span>
              </Link>
            </li>
          ))}
          {!loading && cemeteries.length === 0 && (
            <li className="px-6 py-8 text-sm text-olive/50">Aucun cimetière pour le moment.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
