import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  emptyNewsForm,
  fetchNews,
  newsToForm,
  upsertNews,
  type NewsFormValues,
} from '@/lib/newsApi';
import { slugifyId, uploadSiteImage } from '@/lib/adminApi';

const inputClass =
  'w-full border border-light-gray bg-white px-3 py-2.5 text-sm text-deep-forest outline-none focus:border-muted-gold';
const labelClass = 'block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5';

export default function AdminNewsForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'nouveau';
  const navigate = useNavigate();

  const [form, setForm] = useState<NewsFormValues>(emptyNewsForm());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      const result = await fetchNews({ includeDrafts: true });
      if (cancelled) return;
      const found = result.data.find((n) => n.id === id);
      if (found) {
        setForm(newsToForm(found));
        setSlugManual(true);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  function setField<K extends keyof NewsFormValues>(key: K, value: NewsFormValues[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && isNew && !slugManual) {
        next.slug = slugifyId(String(value));
      }
      return next;
    });
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const result = await uploadSiteImage(file, 'news');
    setUploading(false);
    if (result.error || !result.url) {
      setError(result.error ?? 'Upload échoué');
      return;
    }
    setField('imageUrl', result.url);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title || !form.titleAr || !form.slug) {
      setError('Titre FR, titre AR et slug sont obligatoires.');
      return;
    }
    setSaving(true);
    const result = await upsertNews(form);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate('/admin/actualites');
  }

  if (loading) return <p className="text-olive/50">Chargement…</p>;

  return (
    <div>
      <Link to="/admin/actualites" className="inline-flex items-center gap-2 text-sm text-olive/50 hover:text-deep-forest mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>
      <h1 className="font-display text-3xl font-light text-deep-forest mb-8">
        {isNew ? 'Nouvel article' : 'Modifier l’article'}
      </h1>

      <form onSubmit={onSubmit} className="max-w-3xl space-y-5 bg-ivory border border-light-gray p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Titre (FR)</label>
            <input className={inputClass} value={form.title} onChange={(e) => setField('title', e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Titre (AR)</label>
            <input className={inputClass} dir="rtl" value={form.titleAr} onChange={(e) => setField('titleAr', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className={labelClass}>Slug (URL)</label>
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              setField('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
            }}
            onBlur={() => setField('slug', slugifyId(form.slug) || form.slug)}
            required
          />
          <p className="mt-1 text-[11px] text-olive/45">/actualites/{form.slug || '…'}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date (FR)</label>
            <input className={inputClass} value={form.date} onChange={(e) => setField('date', e.target.value)} placeholder="15 Mars 2026" required />
          </div>
          <div>
            <label className={labelClass}>Date (AR)</label>
            <input className={inputClass} dir="rtl" value={form.dateAr} onChange={(e) => setField('dateAr', e.target.value)} required />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Catégorie (FR)</label>
            <input className={inputClass} value={form.category} onChange={(e) => setField('category', e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Catégorie (AR)</label>
            <input className={inputClass} dir="rtl" value={form.categoryAr} onChange={(e) => setField('categoryAr', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description (FR)</label>
          <textarea className={inputClass} rows={4} value={form.description} onChange={(e) => setField('description', e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Description (AR)</label>
          <textarea className={inputClass} rows={4} dir="rtl" value={form.descriptionAr} onChange={(e) => setField('descriptionAr', e.target.value)} required />
        </div>

        <div>
          <label className={labelClass}>Photo</label>
          <input type="file" accept="image/*" disabled={uploading} onChange={(e) => onUpload(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
          {form.imageUrl && <img src={form.imageUrl} alt="" className="mt-3 h-40 w-full object-cover bg-light-gray" />}
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-deep-forest">
          <input type="checkbox" checked={form.published} onChange={(e) => setField('published', e.target.checked)} />
          Publié sur le site
        </label>

        {error && <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving || uploading} className="bg-muted-gold text-deep-forest px-6 py-3 text-sm font-semibold tracking-[0.06em] disabled:opacity-50">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <Link to="/admin/actualites" className="border border-olive/20 px-6 py-3 text-sm font-semibold text-deep-forest">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
