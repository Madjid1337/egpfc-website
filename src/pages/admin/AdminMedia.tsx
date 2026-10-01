import { FormEvent, useEffect, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import {
  deleteMedia,
  fetchMedia,
  insertMedia,
  uploadSiteImage,
} from '@/lib/adminApi';
import type { Database } from '@/lib/database.types';

type MediaRow = Database['public']['Tables']['media']['Row'];

export default function AdminMedia() {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<MediaRow['kind']>('hero');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const result = await fetchMedia();
    setLoading(false);
    if (result.error) setError(result.error);
    setItems(result.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setError('Choisissez une image.');
      return;
    }

    setBusy(true);
    setError(null);
    const uploaded = await uploadSiteImage(file, kind);
    if (uploaded.error || !uploaded.url) {
      setBusy(false);
      setError(uploaded.error ?? 'Upload échoué');
      return;
    }

    const inserted = await insertMedia({
      url: uploaded.url,
      kind,
      title,
      sortOrder: items.filter((i) => i.kind === kind).length,
    });
    setBusy(false);

    if (inserted.error) {
      setError(inserted.error);
      return;
    }

    setTitle('');
    fileInput.value = '';
    await load();
  }

  async function onDelete(id: string) {
    if (!confirm('Supprimer cette photo ?')) return;
    const result = await deleteMedia(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-deep-forest mb-2">Photos</h1>
      <p className="text-sm text-olive/60 mb-8">
        Uploadez des images pour le hero, la galerie, ou les fiches cimetières.
      </p>

      <form onSubmit={onUpload} className="bg-ivory border border-light-gray p-6 mb-10 space-y-4 max-w-xl">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5">Type</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as MediaRow['kind'])}
            className="w-full border border-light-gray bg-white px-3 py-2.5 text-sm outline-none focus:border-muted-gold"
          >
            <option value="hero">Hero (diaporama)</option>
            <option value="gallery">Galerie</option>
            <option value="cemetery">Cimetière</option>
            <option value="news">Actualités</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5">Titre (optionnel)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-light-gray bg-white px-3 py-2.5 text-sm outline-none focus:border-muted-gold"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5">Fichier</label>
          <input name="file" type="file" accept="image/*" required className="block w-full text-sm" />
        </div>
        {error && <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 bg-deep-forest text-ivory px-5 py-2.5 text-sm font-semibold tracking-[0.06em] disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {busy ? 'Envoi…' : 'Uploader'}
        </button>
      </form>

      {loading ? (
        <p className="text-olive/50">Chargement…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-ivory border border-light-gray overflow-hidden">
              <div className="aspect-[4/3] bg-light-gray">
                <img src={item.url} alt={item.title ?? ''} className="h-full w-full object-cover" />
              </div>
              <div className="p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-gold mb-1">{item.kind}</p>
                  <p className="text-sm text-deep-forest truncate">{item.title || 'Sans titre'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-olive/40 hover:text-red-700"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-olive/50 col-span-full">Aucune photo pour le moment.</p>
          )}
        </div>
      )}
    </div>
  );
}
