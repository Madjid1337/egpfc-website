import { FormEvent, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useCemeteries } from '@/hooks/useCemeteries';
import {
  CONDITION_LABELS,
  clearTeamSession,
  fetchCountsForTeam,
  fetchItemForTeam,
  fetchUnitesForTeam,
  loginInventoryTeam,
  readTeamSession,
  submitTeamCount,
  type InventoryCount,
  type InventoryItem,
  type InventoryUnite,
  type ItemCondition,
  type TeamSession,
} from '@/lib/inventoryApi';

const inputClass =
  'w-full border border-light-gray bg-white px-3 py-2.5 text-sm text-deep-forest outline-none focus:border-muted-gold';

export default function AdminInventoryScan() {
  const { cemeteries } = useCemeteries();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [session, setSession] = useState<TeamSession | null>(() => readTeamSession());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'unite' | 'cemetery' | 'scan'>('unite');
  const [unites, setUnites] = useState<InventoryUnite[]>([]);
  const [uniteId, setUniteId] = useState('');
  const [cemeteryId, setCemeteryId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [otherCounts, setOtherCounts] = useState<InventoryCount[]>([]);
  const [condition, setCondition] = useState<ItemCondition>('bon');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    void fetchUnitesForTeam().then(setUnites);
  }, [session]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await loginInventoryTeam(email, password);
    setSaving(false);
    if (result.error || !result.session) {
      setError(result.error ?? 'Connexion impossible');
      return;
    }
    setSession(result.session);
  }

  async function startScan() {
    if (!cemeteryId) {
      setError('Choisissez un cimetière avant de scanner.');
      return;
    }
    setError(null);
    setDone(false);
    setItem(null);
    setScanning(true);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    if (!videoRef.current) {
      setScanning(false);
      setError('Caméra indisponible.');
      return;
    }
    try {
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (!result) return;
        const code = result.getText();
        controls.stop();
        controlsRef.current = null;
        setScanning(false);
        void onCode(code);
      });
      controlsRef.current = controls;
    } catch (err) {
      setScanning(false);
      const detail = err instanceof Error ? err.message : '';
      setError(
        detail
          ? `Caméra bloquée : ${detail}. Ouvrez le site en https:// et autorisez la caméra.`
          : 'Caméra bloquée. Ouvrez le site en https:// et autorisez la caméra.',
      );
    }
  }

  async function onCode(code: string) {
    const found = await fetchItemForTeam(code);
    if (!found) {
      setError(`Aucun article pour le code ${code}.`);
      return;
    }
    if (found.cemeteryId && found.cemeteryId !== cemeteryId) {
      setError('Cet article n’appartient pas au cimetière sélectionné.');
      return;
    }
    setItem(found);
    setCondition(found.condition);
    setOtherCounts(await fetchCountsForTeam(found.id));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!item) return;
    setSaving(true);
    setError(null);
    const result = await submitTeamCount(item.id, condition);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
        <form onSubmit={onLogin} className="w-full max-w-sm bg-ivory border border-light-gray p-6 space-y-4">
          <h1 className="font-display text-3xl font-light text-deep-forest">Équipe inventaire</h1>
          <p className="text-sm text-olive/60">Connectez-vous avec le compte créé pour la campagne.</p>
          {error && <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5">Email</label>
            <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5">Mot de passe</label>
            <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-deep-forest text-ivory px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
            {saving ? '…' : 'Connexion'}
          </button>
        </form>
      </div>
    );
  }

  const team1 = otherCounts.find((c) => c.team === 1);
  const team2 = otherCounts.find((c) => c.team === 2);
  const mismatch = Boolean(team1 && team2 && team1.condition !== team2.condition);
  const unite = unites.find((u) => u.id === uniteId);
  const uniteCemeteries = cemeteries.filter((c) => c.uniteId === uniteId);
  const cemetery = uniteCemeteries.find((c) => c.id === cemeteryId);

  function chooseUnite(id: string) {
    controlsRef.current?.stop();
    setUniteId(id);
    setCemeteryId('');
    setItem(null);
    setDone(false);
    setScanning(false);
    setStep('cemetery');
  }

  function chooseCemetery(id: string) {
    setCemeteryId(id);
    setItem(null);
    setDone(false);
    setError(null);
    setStep('scan');
  }

  return (
    <div className="min-h-screen bg-off-white px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-light text-deep-forest mb-2">Scan inventaire</h1>
            <p className="text-sm text-olive/60">
              {session.fullName} · Équipe {session.team} · campagne {session.year}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearTeamSession();
              setSession(null);
              setItem(null);
              setStep('unite');
              setUniteId('');
              setCemeteryId('');
            }}
            className="text-xs text-olive/50 hover:text-deep-forest"
          >
            Déconnexion
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-700 bg-red-50 p-3">{error}</p>}

        {step === 'unite' && (
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-olive/50">Choisir l’unité</p>
            {unites.length === 0 && (
              <p className="text-sm text-olive/60">Aucune unité. Exécutez supabase/inventory_local_teams.sql dans Supabase.</p>
            )}
            {unites.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => chooseUnite(u.id)}
                className="w-full text-left bg-ivory border border-light-gray px-4 py-3 text-deep-forest hover:border-muted-gold"
              >
                {u.name}
              </button>
            ))}
          </div>
        )}

        {step === 'cemetery' && (
          <div className="space-y-3">
            <button type="button" onClick={() => setStep('unite')} className="text-xs text-olive/50 hover:text-deep-forest">
              ← {unite?.name ?? 'Unités'}
            </button>
            <p className="text-[11px] uppercase tracking-[0.12em] text-olive/50">Choisir le cimetière</p>
            {uniteCemeteries.length === 0 && (
              <p className="text-sm text-olive/60">Aucun cimetière dans cette unité.</p>
            )}
            {uniteCemeteries.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => chooseCemetery(c.id)}
                className="w-full text-left bg-ivory border border-light-gray px-4 py-3 text-deep-forest hover:border-muted-gold"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {step === 'scan' && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              controlsRef.current?.stop();
              setScanning(false);
              setItem(null);
              setStep('cemetery');
            }}
            className="text-xs text-olive/50 hover:text-deep-forest"
          >
            ← {cemetery?.name ?? 'Cimetières'}
          </button>

          <video ref={videoRef} className={`w-full bg-black ${scanning ? 'block aspect-[3/4]' : 'hidden'}`} muted playsInline autoPlay />

          {!item && (
            <button
              type="button"
              onClick={() => void startScan()}
              className="bg-deep-forest text-ivory px-5 py-3 text-sm font-semibold"
            >
              {scanning ? 'Caméra ouverte…' : 'Scanner un code-barres'}
            </button>
          )}

          {item && (
            <form onSubmit={onSubmit} className="bg-ivory border border-light-gray p-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-olive/40">Article</p>
                <p className="text-lg text-deep-forest">{item.name}</p>
              </div>

              {session.team === 3 && (
                <div className="text-sm border border-light-gray p-3">
                  <p>Équipe 1 : {team1 ? CONDITION_LABELS[team1.condition] : 'pas encore'}</p>
                  <p>Équipe 2 : {team2 ? CONDITION_LABELS[team2.condition] : 'pas encore'}</p>
                  <p className={mismatch ? 'text-red-700 font-semibold mt-2' : 'text-olive/60 mt-2'}>
                    {mismatch ? 'Décalage entre les deux équipes.' : 'Pas de décalage, ou comptage incomplet.'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5">État constaté</label>
                <select className={inputClass} value={condition} onChange={(e) => setCondition(e.target.value as ItemCondition)}>
                  <option value="bon">Bon</option>
                  <option value="pas_bon">Pas bon</option>
                  <option value="use">Usé</option>
                </select>
              </div>

              {done ? (
                <p className="text-sm text-deep-forest">Enregistré pour la campagne {session.year}.</p>
              ) : (
                <button type="submit" disabled={saving} className="bg-muted-gold text-deep-forest px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
                  {saving ? '…' : 'Valider'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setItem(null);
                  setDone(false);
                }}
                className="block text-sm text-olive/50 hover:text-deep-forest"
              >
                Scanner un autre article
              </button>
            </form>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
