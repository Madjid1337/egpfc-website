import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useService } from '@/hooks/useServices';
import {
  emptyServiceForm,
  SERVICE_ICONS,
  serviceToForm,
  upsertService,
  type ServiceFormValues,
} from '@/lib/servicesApi';
import { slugifyId } from '@/lib/adminApi';

const inputClass =
  'w-full border border-light-gray bg-white px-3 py-2.5 text-sm text-deep-forest outline-none focus:border-muted-gold';
const labelClass = 'block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5';

export default function AdminServiceForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'nouveau';
  const navigate = useNavigate();
  const { service, loading } = useService(isNew ? undefined : id);

  const [form, setForm] = useState<ServiceFormValues>(emptyServiceForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idManual, setIdManual] = useState(false);

  useEffect(() => {
    if (!isNew && service) {
      setForm(serviceToForm(service));
      setIdManual(true);
    }
  }, [isNew, service]);

  function setField<K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && isNew && !idManual) {
        next.id = slugifyId(String(value));
      }
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.id || !form.title || !form.titleAr) {
      setError('Identifiant, titre FR et titre AR sont obligatoires.');
      return;
    }
    setSaving(true);
    const result = await upsertService(form, isNew);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate('/admin/services');
  }

  if (!isNew && loading) return <p className="text-olive/50">Chargement…</p>;

  return (
    <div>
      <Link to="/admin/services" className="inline-flex items-center gap-2 text-sm text-olive/50 hover:text-deep-forest mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>
      <h1 className="font-display text-3xl font-light text-deep-forest mb-8">
        {isNew ? 'Nouveau service' : 'Modifier le service'}
      </h1>

      <form onSubmit={onSubmit} className="max-w-3xl space-y-5 bg-ivory border border-light-gray p-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Numéro</label>
            <input className={inputClass} value={form.number} onChange={(e) => setField('number', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Ordre</label>
            <input
              type="number"
              className={inputClass}
              value={form.sortOrder}
              onChange={(e) => setField('sortOrder', Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Icône</label>
            <select className={inputClass} value={form.icon} onChange={(e) => setField('icon', e.target.value)}>
              {SERVICE_ICONS.map((icon) => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Identifiant (slug)</label>
          <input
            className={inputClass}
            value={form.id}
            disabled={!isNew}
            onChange={(e) => {
              setIdManual(true);
              setField('id', e.target.value.toLowerCase().replace(/\s+/g, '-'));
            }}
            required
          />
        </div>

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
          <label className={labelClass}>Description (FR)</label>
          <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Description (AR)</label>
          <textarea className={inputClass} rows={3} dir="rtl" value={form.descriptionAr} onChange={(e) => setField('descriptionAr', e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>Points clés (FR) — une ligne = un point</label>
          <textarea className={inputClass} rows={5} value={form.featuresText} onChange={(e) => setField('featuresText', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Points clés (AR) — une ligne = un point</label>
          <textarea className={inputClass} rows={5} dir="rtl" value={form.featuresArText} onChange={(e) => setField('featuresArText', e.target.value)} />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-deep-forest">
          <input type="checkbox" checked={form.published} onChange={(e) => setField('published', e.target.checked)} />
          Visible sur le site
        </label>

        {error && <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-muted-gold text-deep-forest px-6 py-3 text-sm font-semibold tracking-[0.06em] disabled:opacity-50">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <Link to="/admin/services" className="border border-olive/20 px-6 py-3 text-sm font-semibold text-deep-forest">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
