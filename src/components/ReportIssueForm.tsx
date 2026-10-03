import { FormEvent, useState } from 'react';
import {
  canSubmitReport,
  recordReportSubmit,
  submitReport,
  uploadReportImage,
} from '@/lib/operationsApi';
import { ISSUE_TYPES } from '@/lib/operationsTypes';

const inputClass =
  'w-full border border-light-gray bg-white px-3 py-2.5 text-sm text-deep-forest outline-none focus:border-muted-gold';
const labelClass = 'block text-[11px] uppercase tracking-[0.12em] text-olive/50 mb-1.5';

type Props = {
  cemeteryId: string;
  cemeteryName: string;
};

export default function ReportIssueForm({ cemeteryId, cemeteryName }: Props) {
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0].value);
  const [description, setDescription] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (honeypot.trim()) {
      setDone(true);
      return;
    }

    if (description.trim().length < 10) {
      setError('Veuillez décrire le problème (au moins 10 caractères).');
      return;
    }

    const rate = canSubmitReport(cemeteryId);
    if (!rate.ok) {
      setError(rate.reason ?? 'Limite atteinte.');
      return;
    }

    setSubmitting(true);
    let imageUrl = '';
    if (file) {
      const up = await uploadReportImage(file);
      if (up.error || !up.url) {
        // Don't block the report if photo upload fails (common RLS/storage issue)
        console.warn('[report image]', up.error);
      } else {
        imageUrl = up.url;
      }
    }

    const result = await submitReport({
      cemeteryId,
      issueType,
      description: description.trim(),
      imageUrl,
    });
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    recordReportSubmit(cemeteryId);
    setDone(true);
    setDescription('');
    setFile(null);
  }

  if (done) {
    return (
      <div className="bg-ivory border border-light-gray p-6 lg:p-8">
        <p className="text-[10px] tracking-[0.2em] text-muted-gold uppercase mb-3">Signalement</p>
        <h2 className="font-display text-2xl font-light text-deep-forest mb-2">Merci</h2>
        <p className="text-sm text-olive/70">
          Votre signalement pour « {cemeteryName} » a bien été enregistré. Les équipes de l’EGPFC
          le traiteront prochainement.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-6 text-sm text-muted-gold hover:underline"
        >
          Envoyer un autre signalement
        </button>
      </div>
    );
  }

  return (
    <div className="bg-ivory border border-light-gray p-6 lg:p-8">
      <p className="text-[10px] tracking-[0.2em] text-muted-gold uppercase mb-3">Signalement</p>
      <h2 className="font-display text-2xl font-light text-deep-forest mb-2">Signaler un problème</h2>
      <p className="text-sm text-olive/60 mb-6">
        Aucun compte requis. Décrivez le problème constaté sur place (propreté, entretien, sécurité…).
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Honeypot — leave empty */}
        <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden>
          <label>
            Site web
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </label>
        </div>

        <div>
          <label className={labelClass}>Type de problème</label>
          <select
            className={inputClass}
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          >
            {ISSUE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className={inputClass}
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez ce que vous avez observé…"
          />
        </div>

        <div>
          <label className={labelClass}>Photo (optionnel)</label>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-olive/70"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {error && <p className="text-sm text-red-700 bg-red-50 p-3">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-deep-forest text-ivory px-6 py-3 text-sm font-semibold tracking-[0.06em] hover:bg-deep-forest/90 disabled:opacity-50"
        >
          {submitting ? 'Envoi…' : 'Envoyer le signalement'}
        </button>
      </form>
    </div>
  );
}
