import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { deleteService } from '@/lib/servicesApi';

export default function AdminServices() {
  const { items, loading, source } = useServices({ includeDrafts: true });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(id: string, title: string) {
    if (!confirm(`Supprimer « ${title} » ?`)) return;
    setBusyId(id);
    setError(null);
    const result = await deleteService(id);
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
          <h1 className="font-display text-3xl font-light text-deep-forest mb-2">Nos services</h1>
          <p className="text-sm text-olive/60">
            {loading ? 'Chargement…' : `${items.length} services`} · source {source}
          </p>
        </div>
        <Link
          to="/admin/services/nouveau"
          className="inline-flex items-center gap-2 bg-deep-forest text-ivory px-5 py-2.5 text-sm font-semibold tracking-[0.06em] hover:bg-deep-forest/90"
        >
          <Plus className="w-4 h-4" />
          Nouveau service
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-700 bg-red-50 p-3">{error}</p>}

      <div className="bg-ivory border border-light-gray overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-light-gray text-[10px] uppercase tracking-[0.12em] text-olive/40">
            <tr>
              <th className="px-4 py-3 font-medium">N°</th>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Icône</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-off-white/80">
                <td className="px-4 py-3 text-muted-gold font-display">{item.number}</td>
                <td className="px-4 py-3 font-medium text-deep-forest">{item.title}</td>
                <td className="px-4 py-3 text-olive/60">{item.icon}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] uppercase tracking-[0.08em] ${item.published === false ? 'text-olive/40' : 'text-muted-gold'}`}>
                    {item.published === false ? 'Masqué' : 'Visible'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link to={`/admin/services/${item.id}`} className="p-2 text-olive/50 hover:text-deep-forest">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => onDelete(item.id, item.title)}
                      className="p-2 text-olive/50 hover:text-red-700 disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-olive/50">Aucun service.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
