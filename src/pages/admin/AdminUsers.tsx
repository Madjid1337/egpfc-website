import { FormEvent, useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { fetchProfiles, fetchUnites, updateProfileRole } from '@/lib/operationsApi';
import type { Profile, Unite, UserRole } from '@/lib/operationsTypes';

const inputClass =
  'w-full border border-light-gray bg-white px-3 py-2.5 text-sm text-deep-forest outline-none focus:border-muted-gold';
const labelClass = 'block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5';

const ROLE_LABELS: Record<UserRole, string> = {
  dev: 'Développeur',
  directeur: 'Directeur',
  chef_unite: 'Chef d’Unité',
};

export default function AdminUsers() {
  const { isFullAccess, isDev, user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [unites, setUnites] = useState<Unite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { role: UserRole; uniteId: string }>>({});

  async function reload() {
    setLoading(true);
    const [p, u] = await Promise.all([fetchProfiles(), fetchUnites()]);
    setProfiles(p);
    setUnites(u);
    const next: Record<string, { role: UserRole; uniteId: string }> = {};
    for (const row of p) {
      next[row.id] = { role: row.role, uniteId: row.uniteId ?? '' };
    }
    setDrafts(next);
    setLoading(false);
  }

  useEffect(() => {
    void reload();
  }, []);

  if (!isFullAccess) {
    return <p className="text-olive/50">Réservé au Directeur / Développeur.</p>;
  }

  async function onSave(id: string) {
    const draft = drafts[id];
    if (!draft) return;

    // Only Dev can assign/promote to dev
    if (draft.role === 'dev' && !isDev) {
      setError('Seul un Développeur peut attribuer le rôle Dev.');
      return;
    }

    // Directeur cannot demote/change another Dev
    const target = profiles.find((p) => p.id === id);
    if (target?.role === 'dev' && !isDev) {
      setError('Seul un Développeur peut modifier un compte Dev.');
      return;
    }

    setBusyId(id);
    setError(null);
    const uniteId = draft.role === 'chef_unite' ? draft.uniteId || null : null;
    if (draft.role === 'chef_unite' && !uniteId) {
      setBusyId(null);
      setError('Un Chef d’Unité doit être lié à une unité.');
      return;
    }

    const result = await updateProfileRole(id, draft.role, uniteId);
    setBusyId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    await reload();
  }

  return (
    <div>
      <div className="flex items-start gap-3 mb-2">
        <Users className="w-6 h-6 text-muted-gold mt-1" />
        <div>
          <h1 className="font-display text-3xl font-light text-deep-forest">Utilisateurs</h1>
          <p className="text-sm text-olive/60 mt-1">
            Créez d’abord le compte dans Supabase Auth → Users, puis assignez le rôle ici.
            Seuls Dev et Directeur peuvent créer / promouvoir un Chef d’Unité.
          </p>
        </div>
      </div>

      {error && <p className="mb-4 mt-6 text-sm text-red-700 bg-red-50 p-3">{error}</p>}

      <div className="bg-ivory border border-light-gray overflow-x-auto mt-8">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-light-gray text-[10px] uppercase tracking-[0.12em] text-olive/40">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Unité (Chef)</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-olive/50">
                  Chargement…
                </td>
              </tr>
            )}
            {!loading && profiles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-olive/50">
                  Aucun profil. Connectez-vous une fois avec chaque compte Auth pour créer le profil.
                </td>
              </tr>
            )}
            {profiles.map((p) => {
              const draft = drafts[p.id] ?? { role: p.role, uniteId: p.uniteId ?? '' };
              const isSelf = p.id === user?.id;
              const lockedDev = p.role === 'dev' && !isDev;
              return (
                <tr key={p.id} className="hover:bg-off-white/80">
                  <td className="px-4 py-3 text-deep-forest">
                    {p.email || p.id.slice(0, 8)}
                    {isSelf && <span className="ml-2 text-[10px] uppercase text-muted-gold">vous</span>}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={inputClass}
                      disabled={lockedDev}
                      value={draft.role}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [p.id]: { ...draft, role: e.target.value as UserRole },
                        }))
                      }
                    >
                      {isDev && <option value="dev">{ROLE_LABELS.dev}</option>}
                      <option value="directeur">{ROLE_LABELS.directeur}</option>
                      <option value="chef_unite">{ROLE_LABELS.chef_unite}</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {draft.role === 'chef_unite' ? (
                      <select
                        className={inputClass}
                        value={draft.uniteId}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [p.id]: { ...draft, uniteId: e.target.value },
                          }))
                        }
                      >
                        <option value="">— Choisir —</option>
                        {unites.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-olive/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={busyId === p.id || lockedDev}
                      onClick={() => onSave(p.id)}
                      className="text-sm font-semibold text-deep-forest hover:text-muted-gold disabled:opacity-40"
                    >
                      {busyId === p.id ? '…' : 'Enregistrer'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form
        className="mt-8 bg-ivory border border-light-gray p-6 max-w-xl space-y-3"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
        }}
      >
        <p className={labelClass}>Rappel</p>
        <p className="text-sm text-olive/70">
          1. Supabase → Authentication → Users → Add user (email + mot de passe)
          <br />
          2. L’utilisateur se connecte une fois (ou vous lancez ensure_my_profile)
          <br />
          3. Ici : rôle <strong>Chef d’Unité</strong> + unité → Enregistrer
        </p>
      </form>
    </div>
  );
}
