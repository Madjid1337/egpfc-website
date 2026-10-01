import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useCemeteries } from '@/hooks/useCemeteries';
import { deleteCemetery } from '@/lib/adminApi';

export default function AdminCemeteries() {
  const { cemeteries, loading, source } = useCemeteries();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(id: string, name: string) {
    if (!confirm(`Supprimer « ${name} » ?`)) return;
    setBusyId(id);
    setError(null);
    const result = await deleteCemetery(id);
    setBusyId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    window.location.reload();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-deep-forest mb-2">Cimetières</h1>
          <p className="text-sm text-olive/60">
            {loading ? 'Chargement…' : `${cemeteries.length} entrées`} · source {source}
          </p>
        </div>
        <Link
          to="/admin/cimetieres/nouveau"
          className="inline-flex items-center gap-2 bg-deep-forest text-ivory px-5 py-2.5 text-sm font-semibold tracking-[0.06em] hover:bg-deep-forest/90"
        >
          <Plus className="w-4 h-4" />
          Nouveau
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-700 bg-red-50 p-3">{error}</p>}

      <div className="bg-ivory border border-light-gray overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-light-gray text-[10px] uppercase tracking-[0.12em] text-olive/40">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Commune</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Coordonnées</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {cemeteries.map((c) => (
              <tr key={c.id} className="hover:bg-off-white/80">
                <td className="px-4 py-3 text-deep-forest font-medium">{c.name}</td>
                <td className="px-4 py-3 text-olive/70">{c.commune}</td>
                <td className="px-4 py-3 text-olive/70 capitalize">{c.type}</td>
                <td className="px-4 py-3 text-olive/50 tabular-nums text-xs">
                  {c.coordinates[0].toFixed(5)}, {c.coordinates[1].toFixed(5)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/cimetieres/${c.id}`}
                      className="p-2 text-olive/50 hover:text-deep-forest"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === c.id}
                      onClick={() => onDelete(c.id, c.name)}
                      className="p-2 text-olive/50 hover:text-red-700 disabled:opacity-40"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && cemeteries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-olive/50">
                  Aucun cimetière.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
