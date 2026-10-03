import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNews } from '@/hooks/useNews';
import { deleteNews } from '@/lib/newsApi';

export default function AdminNews() {
  const { items, loading, source } = useNews({ includeDrafts: true });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(id: string, title: string) {
    if (!confirm(`Supprimer « ${title} » ?`)) return;
    setBusyId(id);
    setError(null);
    const result = await deleteNews(id);
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
          <h1 className="font-display text-3xl font-light text-deep-forest mb-2">Actualités</h1>
          <p className="text-sm text-olive/60">
            {loading ? 'Chargement…' : `${items.length} articles`} · source {source}
          </p>
        </div>
        <Link
          to="/admin/actualites/nouveau"
          className="inline-flex items-center gap-2 bg-deep-forest text-ivory px-5 py-2.5 text-sm font-semibold tracking-[0.06em] hover:bg-deep-forest/90"
        >
          <Plus className="w-4 h-4" />
          Nouvel article
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-700 bg-red-50 p-3">{error}</p>}

      <div className="bg-ivory border border-light-gray overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-light-gray text-[10px] uppercase tracking-[0.12em] text-olive/40">
            <tr>
              <th className="px-4 py-3 font-medium">Titre</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-off-white/80">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="h-10 w-14 object-cover bg-light-gray shrink-0" />
                    ) : (
                      <div className="h-10 w-14 bg-light-gray shrink-0" />
                    )}
                    <span className="font-medium text-deep-forest line-clamp-2">{item.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-olive/70">{item.category}</td>
                <td className="px-4 py-3 text-olive/70">{item.date}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] uppercase tracking-[0.08em] ${item.published === false ? 'text-olive/40' : 'text-muted-gold'}`}>
                    {item.published === false ? 'Brouillon' : 'Publié'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link to={`/admin/actualites/${item.id}`} className="p-2 text-olive/50 hover:text-deep-forest" title="Modifier">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => onDelete(item.id, item.title)}
                      className="p-2 text-olive/50 hover:text-red-700 disabled:opacity-40"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-olive/50">Aucun article.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
