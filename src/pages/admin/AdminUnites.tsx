import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  createUniteWithChef,
  deleteUnite,
  fetchProfiles,
  fetchUnites,
  updateUniteWithChef,
} from '@/lib/operationsApi';
import type { Profile, Unite } from '@/lib/operationsTypes';

const inputClass =
  'w-full border border-light-gray bg-white px-3 py-2.5 text-sm text-deep-forest outline-none focus:border-muted-gold';
const labelClass = 'block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5';

type Mode = 'list' | 'create' | 'edit';

export default function AdminUnites() {
  const { isFullAccess } = useAuth();
  const [unites, setUnites] = useState<Unite[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [chefName, setChefName] = useState('');
  const [chefEmail, setChefEmail] = useState('');
  const [chefPassword, setChefPassword] = useState('');

  async function reload() {
    setLoading(true);
    const [u, p] = await Promise.all([fetchUnites(), fetchProfiles()]);
    setUnites(u);
    setProfiles(p);
    setLoading(false);
  }

  useEffect(() => {
    void reload();
  }, []);

  function openCreate() {
    setMode('create');
    setEditingId(null);
    setName('');
    setNameAr('');
    setChefName('');
    setChefEmail('');
    setChefPassword('');
    setError(null);
  }

  function openEdit(u: Unite) {
    const chef = profiles.find((p) => p.id === u.chefUserId);
    setMode('edit');
    setEditingId(u.id);
    setName(u.name);
    setNameAr(u.nameAr);
    setChefName(chef?.fullName ?? '');
    setChefEmail(chef?.email ?? '');
    setChefPassword('');
    setError(null);
  }

  function backToList() {
    setMode('list');
    setEditingId(null);
    setError(null);
    void reload();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Le nom (FR) est obligatoire.');
      return;
    }

    setSaving(true);
    setError(null);

    if (mode === 'create') {
      if (!chefName.trim()) {
        setSaving(false);
        setError('Le nom du Chef d’Unité est obligatoire.');
        return;
      }
      if (!chefEmail.trim() || chefPassword.length < 6) {
        setSaving(false);
        setError('Email et mot de passe du Chef (min. 6 caractères) sont obligatoires.');
        return;
      }
      const result = await createUniteWithChef({
        name: name.trim(),
        nameAr: nameAr.trim(),
        chefName: chefName.trim(),
        chefEmail: chefEmail.trim(),
        chefPassword,
      });
      setSaving(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      backToList();
      return;
    }

    if (mode === 'edit' && editingId) {
      const current = unites.find((u) => u.id === editingId);
      const result = await updateUniteWithChef({
        id: editingId,
        name: name.trim(),
        nameAr: nameAr.trim(),
        chefName: chefName.trim() || undefined,
        chefEmail: chefEmail.trim() || undefined,
        chefPassword: chefPassword || undefined,
        keepChefUserId: current?.chefUserId ?? null,
      });
      setSaving(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      backToList();
    }
  }

  async function onDelete(id: string, label: string) {
    if (!confirm(`Supprimer l’unité « ${label} » ?`)) return;
    setError(null);
    const result = await deleteUnite(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    await reload();
  }

  if (!isFullAccess) {
    return <p className="text-olive/50">Réservé au Directeur / Développeur.</p>;
  }

  if (mode === 'create' || mode === 'edit') {
    return (
      <div>
        <button
          type="button"
          onClick={backToList}
          className="inline-flex items-center gap-2 text-sm text-olive/50 hover:text-deep-forest mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux unités
        </button>

        <h1 className="font-display text-3xl font-light text-deep-forest mb-2">
          {mode === 'create' ? 'Créer une nouvelle unité' : 'Modifier l’unité'}
        </h1>
        <p className="text-sm text-olive/60 mb-8">
          Nom de l’unité (FR / AR) et Chef d’Unité (nom, email, mot de passe).
        </p>

        {error && <p className="mb-4 text-sm text-red-700 bg-red-50 p-3">{error}</p>}

        <form onSubmit={onSubmit} className="bg-ivory border border-light-gray p-6 space-y-4 max-w-xl">
          <div>
            <label className={labelClass}>Nom de l’unité (FR)</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Unité Est"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Nom de l’unité (AR)</label>
            <input
              className={inputClass}
              dir="rtl"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="اسم الوحدة"
            />
          </div>

          <div className="pt-4 border-t border-light-gray">
            <p className="text-sm font-semibold text-deep-forest mb-4">Chef d’Unité</p>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nom du Chef</label>
                <input
                  className={inputClass}
                  value={chefName}
                  onChange={(e) => setChefName(e.target.value)}
                  placeholder="ex: Ahmed Benali"
                  required={mode === 'create'}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={chefEmail}
                  onChange={(e) => setChefEmail(e.target.value)}
                  placeholder="chef@exemple.com"
                  required={mode === 'create'}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Mot de passe {mode === 'edit' ? '(laisser vide pour garder le même chef)' : ''}
                </label>
                <input
                  type="password"
                  className={inputClass}
                  value={chefPassword}
                  onChange={(e) => setChefPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={mode === 'create' ? 6 : undefined}
                  required={mode === 'create'}
                  autoComplete="new-password"
                />
                {mode === 'edit' && (
                  <p className="mt-1.5 text-[11px] text-olive/45">
                    Pour changer de Chef : saisissez un nouvel email + mot de passe (crée un nouveau
                    compte), ou l’email d’un compte existant.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-muted-gold text-deep-forest px-6 py-3 text-sm font-semibold tracking-[0.06em] hover:bg-muted-gold/90 disabled:opacity-50"
            >
              {saving ? 'Enregistrement…' : mode === 'create' ? 'Créer l’unité' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={backToList}
              className="border border-olive/20 text-deep-forest px-6 py-3 text-sm font-semibold hover:bg-olive/5"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light text-deep-forest mb-2">Unités</h1>
          <p className="text-sm text-olive/60">
            {loading ? 'Chargement…' : `${unites.length} unité${unites.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-deep-forest text-ivory px-5 py-2.5 text-sm font-semibold tracking-[0.06em] hover:bg-deep-forest/90"
        >
          <Plus className="w-4 h-4" />
          Créer l’unité
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-700 bg-red-50 p-3">{error}</p>}

      <div className="bg-ivory border border-light-gray overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-light-gray text-[10px] uppercase tracking-[0.12em] text-olive/40">
            <tr>
              <th className="px-4 py-3 font-medium">Unité (FR)</th>
              <th className="px-4 py-3 font-medium">Unité (AR)</th>
              <th className="px-4 py-3 font-medium">Chef d’Unité</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-olive/50">
                  Chargement…
                </td>
              </tr>
            )}
            {!loading && unites.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-olive/50">
                  Aucune unité. Cliquez sur « Créer l’unité ».
                </td>
              </tr>
            )}
            {unites.map((u) => {
              const chef = profiles.find((p) => p.id === u.chefUserId);
              return (
                <tr key={u.id} className="hover:bg-off-white/80">
                  <td className="px-4 py-3 text-deep-forest font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-olive/70 font-arabic" dir="rtl">
                    {u.nameAr || '—'}
                  </td>
                  <td className="px-4 py-3 text-deep-forest">{chef?.fullName || '—'}</td>
                  <td className="px-4 py-3 text-olive/70">{chef?.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-deep-forest hover:text-muted-gold"
                        title="Modifier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(u.id, u.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-olive/50 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
