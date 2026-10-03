import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapContainer } from 'react-leaflet';
import { ArrowLeft, Download, QrCode } from 'lucide-react';
import MapBaseLayers from '@/components/MapBaseLayers';
import MapClickPicker from '@/components/admin/MapClickPicker';
import { useAuth } from '@/hooks/useAuth';
import { useCemetery } from '@/hooks/useCemeteries';
import {
  cemeteryToForm,
  emptyCemeteryForm,
  slugifyId,
  typeArFromType,
  upsertCemetery,
  uploadSiteImage,
  deleteCemetery,
  type CemeteryFormValues,
} from '@/lib/adminApi';
import { MAP_MAX_ZOOM } from '@/lib/mapTiles';
import { fetchUnites } from '@/lib/operationsApi';
import type { Unite } from '@/lib/operationsTypes';
import type { Cemetery } from '@/data/cemeteries';

const inputClass =
  'w-full border border-light-gray bg-white px-3 py-2.5 text-sm text-deep-forest outline-none focus:border-muted-gold';
const labelClass = 'block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5';

export default function AdminCemeteryForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'nouveau';
  const navigate = useNavigate();
  const { cemetery, loading } = useCemetery(isNew ? undefined : id);
  const { isFullAccess, isChef, uniteId: myUniteId } = useAuth();

  const [form, setForm] = useState<CemeteryFormValues>(emptyCemeteryForm());
  const [unites, setUnites] = useState<Unite[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);
  const [originalId, setOriginalId] = useState<string | null>(null);

  useEffect(() => {
    void fetchUnites().then(setUnites);
  }, []);

  useEffect(() => {
    if (!isNew && cemetery) {
      setForm(cemeteryToForm(cemetery));
      setOriginalId(cemetery.id);
      setSlugManual(true);
    } else if (isNew && isChef && myUniteId) {
      setForm((prev) => ({ ...prev, uniteId: myUniteId }));
    }
  }, [isNew, cemetery, isChef, myUniteId]);

  function setField<K extends keyof CemeteryFormValues>(key: K, value: CemeteryFormValues[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && isNew && !slugManual) {
        next.id = slugifyId(String(value));
      }
      if (key === 'type') {
        next.typeAr = typeArFromType(value as Cemetery['type']);
      }
      return next;
    });
  }

  async function onUploadImage(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const result = await uploadSiteImage(file, 'cemeteries');
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

    if (!form.id || !form.name || !form.nameAr) {
      setError('Identifiant, nom FR et nom AR sont obligatoires.');
      return;
    }

    const normalizedId = slugifyId(form.id) || form.id.trim().toLowerCase();
    if (!normalizedId) {
      setError('Identifiant invalide. Utilisez des lettres, chiffres et tirets.');
      return;
    }

    const uniteId = isChef && myUniteId ? myUniteId : form.uniteId;

    setSaving(true);
    const payload = { ...form, id: normalizedId, uniteId };
    const result = await upsertCemetery(payload);

    if (!result.error && originalId && originalId !== normalizedId) {
      await deleteCemetery(originalId);
    }

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.qrCodeUrl) {
      setField('qrCodeUrl', result.qrCodeUrl);
    }

    if (result.warning) {
      setError(result.warning);
      // Still allow leaving after a short moment — cemetery is saved
    }

    navigate('/admin/cimetieres');
  }

  if (!isNew && loading) {
    return <p className="text-olive/50">Chargement…</p>;
  }

  if (!isNew && !loading && !cemetery) {
    return (
      <div>
        <p className="text-olive/50 mb-4">Cimetière introuvable.</p>
        <Link to="/admin/cimetieres" className="text-muted-gold text-sm">
          ← Retour
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/admin/cimetieres"
        className="inline-flex items-center gap-2 text-sm text-olive/50 hover:text-deep-forest mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <h1 className="font-display text-3xl font-light text-deep-forest mb-8">
        {isNew ? 'Nouveau cimetière' : 'Modifier le cimetière'}
      </h1>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4 bg-ivory border border-light-gray p-6">
            <div>
              <label className={labelClass}>Identifiant (slug)</label>
              <input
                className={inputClass}
                value={form.id}
                onChange={(e) => {
                  setSlugManual(true);
                  setField('id', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                onBlur={() => setField('id', slugifyId(form.id) || form.id)}
                placeholder="ex: el-alia"
                required
              />
              <p className="mt-1.5 text-[11px] text-olive/45">
                Utilisé dans l’URL : /cimetieres/{form.id || '…'} — lettres, chiffres et tirets.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom (FR)</label>
                <input className={inputClass} value={form.name} onChange={(e) => setField('name', e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Nom (AR)</label>
                <input className={inputClass} dir="rtl" value={form.nameAr} onChange={(e) => setField('nameAr', e.target.value)} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Commune (FR)</label>
                <input className={inputClass} value={form.commune} onChange={(e) => setField('commune', e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Commune (AR)</label>
                <input className={inputClass} dir="rtl" value={form.communeAr} onChange={(e) => setField('communeAr', e.target.value)} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Wilaya</label>
              <input className={inputClass} value={form.wilaya} onChange={(e) => setField('wilaya', e.target.value)} />
            </div>

            {isFullAccess && (
              <div>
                <label className={labelClass}>Unité</label>
                <select
                  className={inputClass}
                  value={form.uniteId ?? ''}
                  onChange={(e) => setField('uniteId', e.target.value || null)}
                >
                  <option value="">— Non assignée —</option>
                  {unites.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Adresse (FR)</label>
                <input className={inputClass} value={form.address} onChange={(e) => setField('address', e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Adresse (AR)</label>
                <input className={inputClass} dir="rtl" value={form.addressAr} onChange={(e) => setField('addressAr', e.target.value)} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Type</label>
                <select
                  className={inputClass}
                  value={form.type}
                  onChange={(e) => setField('type', e.target.value as Cemetery['type'])}
                >
                  <option value="islamique">islamique</option>
                  <option value="chrétien">chrétien</option>
                  <option value="mixte">mixte</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Hectares</label>
                <input
                  type="number"
                  step="0.1"
                  className={inputClass}
                  value={form.hectares}
                  onChange={(e) => setField('hectares', Number(e.target.value))}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="inline-flex items-center gap-2 text-sm text-deep-forest">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => setField('available', e.target.checked)}
                  />
                  Disponible
                </label>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Horaires (FR)</label>
                <input className={inputClass} value={form.openingHours} onChange={(e) => setField('openingHours', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Horaires (AR)</label>
                <input className={inputClass} dir="rtl" value={form.openingHoursAr} onChange={(e) => setField('openingHoursAr', e.target.value)} />
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
              <label className={labelClass}>Photo de couverture</label>
              <p className="text-[11px] text-olive/45 mb-2">
                Affichée en grand sur la page du cimetière et dans la liste.
              </p>
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => onUploadImage(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-olive/70"
              />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="" className="mt-3 h-40 w-full object-cover bg-light-gray" />
              )}
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() => setField('imageUrl', '')}
                  className="mt-2 text-xs text-olive/50 hover:text-red-700"
                >
                  Retirer la photo
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-ivory border border-light-gray p-6">
              <p className={labelClass}>Position sur la carte</p>
              <p className="text-xs text-olive/50 mb-3">
                Cliquez sur la carte pour placer le marqueur. Zoom libre +/-, Satellite / Street en haut à droite.
              </p>
              <div className="h-[380px] bg-light-gray">
                <MapContainer
                  center={[form.lat, form.lng]}
                  zoom={13}
                  minZoom={8}
                  maxZoom={MAP_MAX_ZOOM}
                  scrollWheelZoom
                  className="h-full w-full"
                  zoomControl
                >
                  <MapBaseLayers defaultMode="satellite" />
                  <MapClickPicker
                    position={[form.lat, form.lng]}
                    onChange={([lat, lng]) => {
                      setField('lat', Number(lat.toFixed(6)));
                      setField('lng', Number(lng.toFixed(6)));
                    }}
                  />
                </MapContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass}>Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className={inputClass}
                    value={form.lat}
                    onChange={(e) => setField('lat', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    className={inputClass}
                    value={form.lng}
                    onChange={(e) => setField('lng', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="bg-ivory border border-light-gray p-6">
              <div className="flex items-center gap-2 mb-3">
                <QrCode className="w-4 h-4 text-muted-gold" />
                <p className="mb-0 text-[11px] uppercase tracking-[0.12em] text-olive/50">QR code</p>
              </div>
              <p className="text-xs text-olive/50 mb-4">
                Généré à l’enregistrement. Lien encodé :
                <span className="block mt-1 text-deep-forest break-all">
                  {(import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
                    (typeof window !== 'undefined' ? window.location.origin : '')}
                  /cimetieres/{form.id || '…'}
                </span>
                Ré-enregistrez après chaque changement de VITE_PUBLIC_SITE_URL.
              </p>
              {form.qrCodeUrl ? (
                <div className="flex flex-col items-start gap-3">
                  <img src={form.qrCodeUrl} alt="QR code" className="w-40 h-40 bg-white border border-light-gray" />
                  <a
                    href={form.qrCodeUrl}
                    download={`qr-${form.id || 'cimetiere'}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-deep-forest hover:text-muted-gold"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger
                  </a>
                </div>
              ) : (
                <p className="text-sm text-olive/40">Enregistrez pour générer le QR.</p>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-muted-gold text-deep-forest px-6 py-3 text-sm font-semibold tracking-[0.06em] hover:bg-muted-gold/90 disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <Link
            to="/admin/cimetieres"
            className="border border-olive/20 text-deep-forest px-6 py-3 text-sm font-semibold tracking-[0.06em] hover:bg-olive/5"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
