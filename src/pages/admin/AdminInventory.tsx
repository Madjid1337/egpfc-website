import { FormEvent, useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCemeteries } from '@/hooks/useCemeteries';
import {
  CONDITION_LABELS,
  ITEM_CATEGORIES,
  createAnnualInventory,
  createInventoryItem,
  deleteInventoryItem,
  updateInventoryItem,
  fetchCampaigns,
  fetchCounts,
  fetchInventoryItems,
  fetchTeams,
  type InventoryCampaign,
  type InventoryCount,
  type InventoryItem,
  type InventoryTeam,
  type ItemCondition,
  type TeamAccountInput,
} from '@/lib/inventoryApi';

const inputClass =
  'w-full border border-light-gray bg-white px-3 py-2.5 text-sm text-deep-forest outline-none focus:border-muted-gold';
const labelClass = 'block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function printBarcode(value: string, name: string) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  JsBarcode(svg, value, {
    format: 'CODE128',
    height: 48,
    width: 1.4,
    displayValue: false,
    margin: 0,
  });
  const popup = window.open('', '_blank', 'width=420,height=320');
  if (!popup) return;
  popup.document.write(`<!doctype html>
<html>
  <head>
    <title>EGPFC — ${escapeHtml(name)}</title>
    <style>
      body { margin: 24px; font-family: Arial, sans-serif; }
      .label { width: 240px; text-align: center; }
      .brand { letter-spacing: 0.28em; font-weight: 700; font-size: 14px; margin-bottom: 8px; }
      .name { margin-top: 8px; font-size: 13px; }
      svg { width: 220px; height: auto; }
    </style>
  </head>
  <body>
    <div class="label">
      <div class="brand">EGPFC</div>
      ${svg.outerHTML}
      <div class="name">${escapeHtml(name)}</div>
    </div>
    <script>window.onload = () => window.print();</script>
  </body>
</html>`);
  popup.document.close();
}

function BarcodeView({ value, name }: { value: string; name: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) {
      JsBarcode(ref.current, value, {
        format: 'CODE128',
        height: 32,
        width: 1.2,
        displayValue: false,
        margin: 0,
      });
    }
  }, [value]);
  return (
    <div className="inline-flex flex-col items-center bg-white px-2 py-1.5 border border-light-gray">
      <p className="text-[10px] tracking-[0.22em] font-semibold text-deep-forest leading-none mb-1">EGPFC</p>
      <svg ref={ref} className="h-8 w-[140px]" />
      <p className="text-[10px] text-deep-forest mt-1 max-w-[140px] truncate text-center">{name}</p>
    </div>
  );
}

export default function AdminInventory() {
  const { isFullAccess } = useAuth();
  const { cemeteries } = useCemeteries();
  const [tab, setTab] = useState<'items' | 'year'>('items');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [campaigns, setCampaigns] = useState<InventoryCampaign[]>([]);
  const [selectedYearId, setSelectedYearId] = useState('');
  const [teams, setTeams] = useState<InventoryTeam[]>([]);
  const [counts, setCounts] = useState<InventoryCount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(ITEM_CATEGORIES[0]);
  const [cemeteryId, setCemeteryId] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('bon');
  const [year, setYear] = useState(new Date().getFullYear());
  const [teamForms, setTeamForms] = useState<TeamAccountInput[]>([
    { fullName: '', email: '', password: '' },
    { fullName: '', email: '', password: '' },
    { fullName: '', email: '', password: '' },
  ]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function reloadItems() {
    setItems(await fetchInventoryItems());
  }

  async function reloadCampaigns(preferId?: string) {
    const list = await fetchCampaigns();
    setCampaigns(list);
    const id = preferId || selectedYearId || list[0]?.id || '';
    setSelectedYearId(id);
    if (id) {
      const [t, c] = await Promise.all([fetchTeams(id), fetchCounts(id)]);
      setTeams(t);
      setCounts(c);
    } else {
      setTeams([]);
      setCounts([]);
    }
  }

  useEffect(() => {
    void reloadItems();
    void reloadCampaigns();
  }, []);

  useEffect(() => {
    if (!selectedYearId) return;
    void Promise.all([fetchTeams(selectedYearId), fetchCounts(selectedYearId)]).then(([t, c]) => {
      setTeams(t);
      setCounts(c);
    });
  }, [selectedYearId]);

  function openCreate() {
    setEditingId(null);
    setName('');
    setCategory(ITEM_CATEGORIES[0]);
    setCemeteryId('');
    setCondition('bon');
    setError(null);
    setShowItemForm(true);
  }

  function openEdit(item: InventoryItem) {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setCemeteryId(item.cemeteryId ?? '');
    setCondition(item.condition);
    setError(null);
    setShowItemForm(true);
  }

  async function onCreateItem(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !cemeteryId) {
      setError('Nom et cimetière sont obligatoires.');
      return;
    }
    setSaving(true);
    setError(null);
    const result = editingId
      ? await updateInventoryItem({ id: editingId, name, category, cemeteryId, condition })
      : await createInventoryItem({ name, category, cemeteryId, condition });
    setSaving(false);
    if (result.error || ('item' in result && !result.item && !editingId)) {
      setError(result.error ?? 'Enregistrement impossible');
      return;
    }
    setName('');
    setEditingId(null);
    setShowItemForm(false);
    await reloadItems();
  }

  async function onCreateYear(e: FormEvent) {
    e.preventDefault();
    if (teamForms.some((team) => !team.fullName.trim() || !team.email.trim() || !team.password.trim())) {
      setError('Nom, email et mot de passe sont obligatoires pour les 3 équipes.');
      return;
    }
    const emails = teamForms.map((team) => team.email.trim().toLowerCase());
    if (new Set(emails).size < 3) {
      setError('Chaque équipe doit avoir un email différent.');
      return;
    }
    setSaving(true);
    setError(null);
    const result = await createAnnualInventory(year, teamForms);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    }
    if (result.campaign) await reloadCampaigns(result.campaign.id);
    setTab('year');
  }

  if (!isFullAccess) {
    return <p className="text-olive/50">Réservé au Directeur / Développeur.</p>;
  }

  const cemeteryName = (id: string | null) => cemeteries.find((c) => c.id === id)?.name ?? '—';
  const selected = campaigns.find((c) => c.id === selectedYearId);

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-deep-forest mb-2">Inventaire</h1>
      <p className="text-sm text-olive/60 mb-6">Articles avec code-barres, puis inventaire annuel et comptes des équipes.</p>

      <div className="flex gap-2 mb-8">
        <button
          type="button"
          onClick={() => setTab('items')}
          className={`px-4 py-2 text-sm font-semibold ${tab === 'items' ? 'bg-deep-forest text-ivory' : 'border border-light-gray text-olive/70'}`}
        >
          Articles
        </button>
        <button
          type="button"
          onClick={() => setTab('year')}
          className={`px-4 py-2 text-sm font-semibold ${tab === 'year' ? 'bg-deep-forest text-ivory' : 'border border-light-gray text-olive/70'}`}
        >
          Inventaire annuel
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-700 bg-red-50 p-3">{error}</p>}

      {tab === 'items' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-deep-forest text-ivory px-5 py-2.5 text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Créer un article
            </button>
          </div>

          <div className="bg-ivory border border-light-gray overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-light-gray text-[10px] uppercase tracking-[0.12em] text-olive/40">
                <tr>
                  <th className="px-4 py-3 font-medium">Nom</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Cimetière</th>
                  <th className="px-4 py-3 font-medium">État</th>
                  <th className="px-4 py-3 font-medium">Code-barres</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-olive/50">
                      Aucun article. Cliquez sur « Créer un article ».
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-deep-forest font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-olive/70">{item.category}</td>
                    <td className="px-4 py-3 text-olive/70">{cemeteryName(item.cemeteryId)}</td>
                    <td className="px-4 py-3 text-olive/70">{CONDITION_LABELS[item.condition]}</td>
                    <td className="px-4 py-3">
                      <BarcodeView value={item.barcode} name={item.name} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => printBarcode(item.barcode, item.name)}
                        className="text-xs text-deep-forest hover:text-muted-gold mr-3"
                      >
                        Imprimer
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="text-xs text-deep-forest hover:text-muted-gold mr-3"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteInventoryItem(item.id).then(reloadItems)}
                        className="text-xs text-olive/50 hover:text-red-700"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showItemForm && (
            <div className="fixed inset-0 z-50 bg-deep-forest/50 flex items-center justify-center p-4">
              <form onSubmit={onCreateItem} className="bg-ivory w-full max-w-md p-6 space-y-4">
                <h2 className="font-display text-2xl font-light text-deep-forest">
                  {editingId ? 'Modifier l’article' : 'Nouvel article'}
                </h2>
                <div>
                  <label className={labelClass}>Nom</label>
                  <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                    {ITEM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Cimetière</label>
                  <select className={inputClass} value={cemeteryId} onChange={(e) => setCemeteryId(e.target.value)} required>
                    <option value="">— Choisir —</option>
                    {cemeteries.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>État</label>
                  <select className={inputClass} value={condition} onChange={(e) => setCondition(e.target.value as ItemCondition)}>
                    <option value="bon">Bon</option>
                    <option value="pas_bon">Pas bon</option>
                    <option value="use">Usé</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="bg-muted-gold text-deep-forest px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
                    {saving ? '…' : editingId ? 'Enregistrer' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemForm(false);
                      setEditingId(null);
                    }}
                    className="border border-olive/20 px-4 py-2.5 text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {tab === 'year' && (
        <div className="space-y-8">
          <form onSubmit={onCreateYear} className="bg-ivory border border-light-gray p-5 space-y-5">
            <div className="max-w-xs">
              <label className={labelClass}>Année</label>
              <input
                type="number"
                className={inputClass}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2100}
              />
            </div>
            <div className="grid lg:grid-cols-3 gap-4">
              {teamForms.map((team, index) => (
                <div key={index} className="border border-light-gray bg-white p-4 space-y-3">
                  <p className="text-sm font-medium text-deep-forest">Équipe {index + 1}</p>
                  <div>
                    <label className={labelClass}>Nom</label>
                    <input
                      className={inputClass}
                      value={team.fullName}
                      onChange={(e) => {
                        const next = [...teamForms];
                        next[index] = { ...team, fullName: e.target.value };
                        setTeamForms(next);
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      className={inputClass}
                      value={team.email}
                      onChange={(e) => {
                        const next = [...teamForms];
                        next[index] = { ...team, email: e.target.value };
                        setTeamForms(next);
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Mot de passe</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={team.password}
                      onChange={(e) => {
                        const next = [...teamForms];
                        next[index] = { ...team, password: e.target.value };
                        setTeamForms(next);
                      }}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving} className="bg-deep-forest text-ivory px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
              {saving ? 'Enregistrement…' : 'Créer l’inventaire de l’année'}
            </button>
            <p className="text-xs text-olive/50">
              Les équipes se connectent sur /inventaire avec cet email et ce mot de passe. Aucun compte Supabase n’est créé.
            </p>
          </form>

          {campaigns.length > 0 && (
            <div>
              <label className={labelClass}>Campagne</label>
              <select className={`${inputClass} max-w-xs`} value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)}>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.year} · {c.status === 'open' ? 'ouverte' : 'fermée'}</option>
                ))}
              </select>
            </div>
          )}

          {selected && (
            <>
              <div>
                <h2 className="text-sm font-semibold text-deep-forest mb-3">Comptes des équipes · {selected.year}</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {teams.map((t) => (
                    <div key={t.id} className="bg-ivory border border-light-gray p-4 text-sm">
                      <p className="font-medium text-deep-forest mb-2">Équipe {t.team}</p>
                      <p className="text-deep-forest">{t.fullName || '—'}</p>
                      <p className="text-olive/70 break-all">{t.email}</p>
                      <p className="text-olive/70 mt-1">Mot de passe : {t.tempPassword || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-ivory border border-light-gray overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-light-gray text-[10px] uppercase tracking-[0.12em] text-olive/40">
                    <tr>
                      <th className="px-4 py-3 font-medium">Article</th>
                      <th className="px-4 py-3 font-medium">Équipe 1</th>
                      <th className="px-4 py-3 font-medium">Équipe 2</th>
                      <th className="px-4 py-3 font-medium">Équipe 3</th>
                      <th className="px-4 py-3 font-medium">Décalage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-gray">
                    {items.map((item) => {
                      const byTeam = (team: number) => counts.find((c) => c.itemId === item.id && c.team === team);
                      const a = byTeam(1);
                      const b = byTeam(2);
                      const c = byTeam(3);
                      const gap = Boolean(a && b && a.condition !== b.condition);
                      if (!a && !b && !c) return null;
                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-deep-forest">{item.name}</td>
                          <td className="px-4 py-3">{a ? CONDITION_LABELS[a.condition] : '—'}</td>
                          <td className="px-4 py-3">{b ? CONDITION_LABELS[b.condition] : '—'}</td>
                          <td className="px-4 py-3">{c ? CONDITION_LABELS[c.condition] : '—'}</td>
                          <td className="px-4 py-3">{gap ? <span className="text-red-700 font-semibold">Oui</span> : 'Non'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
