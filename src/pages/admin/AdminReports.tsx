import { useEffect, useMemo, useState } from 'react';
import { Bell, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCemeteries } from '@/hooks/useCemeteries';
import {
  fetchReports,
  fetchUnites,
  hoursPending,
  sendAlert,
  updateReportStatus,
} from '@/lib/operationsApi';
import { ISSUE_TYPES, type Report, type ReportStatus, type Unite } from '@/lib/operationsTypes';

const OVERDUE_HOURS = 48;

const statusLabel: Record<ReportStatus, string> = {
  PENDING: 'En attente',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolu',
};

function issueLabel(value: string) {
  return ISSUE_TYPES.find((t) => t.value === value)?.label ?? value;
}

export default function AdminReports() {
  const { isFullAccess, isChef, uniteId, user } = useAuth();
  const { cemeteries: allCemeteries } = useCemeteries();
  const cemeteries = useMemo(() => {
    if (isChef && uniteId) return allCemeteries.filter((c) => c.uniteId === uniteId);
    return allCemeteries;
  }, [allCemeteries, isChef, uniteId]);
  const [reports, setReports] = useState<Report[]>([]);
  const [unites, setUnites] = useState<Unite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReportStatus | 'OVERDUE'>('ALL');
  const [uniteFilter, setUniteFilter] = useState('');
  const [cemeteryFilter, setCemeteryFilter] = useState('');
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    setError(null);
    const [reportsResult, u] = await Promise.all([
      fetchReports(),
      isFullAccess ? fetchUnites() : Promise.resolve([] as Unite[]),
    ]);
    setReports(reportsResult.data);
    if (reportsResult.error) setError(`Lecture signalements: ${reportsResult.error}`);
    setUnites(u);
    setLoading(false);
  }

  useEffect(() => {
    void reload();
  }, [isFullAccess]);

  const cemeteryUnite = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const c of cemeteries) map.set(c.id, c.uniteId ?? null);
    return map;
  }, [cemeteries]);

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter === 'OVERDUE') {
        if (r.status !== 'PENDING' || hoursPending(r.createdAt) < OVERDUE_HOURS) return false;
      } else if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }
      if (cemeteryFilter && r.cemeteryId !== cemeteryFilter) return false;
      if (uniteFilter) {
        const uid = cemeteryUnite.get(r.cemeteryId);
        if (uid !== uniteFilter) return false;
      }
      return true;
    });
  }, [reports, statusFilter, cemeteryFilter, uniteFilter, cemeteryUnite]);

  const stats = useMemo(() => {
    const pending = reports.filter((r) => r.status === 'PENDING').length;
    const overdue = reports.filter(
      (r) => r.status === 'PENDING' && hoursPending(r.createdAt) >= OVERDUE_HOURS,
    ).length;
    const inProgress = reports.filter((r) => r.status === 'IN_PROGRESS').length;
    const resolved = reports.filter((r) => r.status === 'RESOLVED').length;
    return { pending, overdue, inProgress, resolved, total: reports.length };
  }, [reports]);

  async function setStatus(id: string, status: ReportStatus) {
    setBusyId(id);
    setError(null);
    const result = await updateReportStatus(id, status, noteDraft[id]);
    setBusyId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    await reload();
  }

  async function onAlert(report: Report) {
    const uniteId = cemeteryUnite.get(report.cemeteryId);
    const unite = unites.find((u) => u.id === uniteId);
    const chefId = unite?.chefUserId;
    if (!chefId || !user) {
      setError('Aucun Chef d’Unité assigné à ce cimetière.');
      return;
    }
    setBusyId(report.id);
    const result = await sendAlert({
      reportId: report.id,
      toUserId: chefId,
      fromUserId: user.id,
      message: `Rappel : signalement ${issueLabel(report.issueType)} sur ${report.cemeteryName ?? report.cemeteryId} en attente depuis ${Math.floor(hoursPending(report.createdAt))} h.`,
    });
    setBusyId(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    alert('Alerte envoyée au Chef d’Unité.');
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-light text-deep-forest mb-2">Signalements</h1>
      <p className="text-sm text-olive/60 mb-8">
        {isFullAccess
          ? 'Vue globale — filtres par unité, cimetière et statut.'
          : 'Incidents des cimetières de votre unité.'}
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Total', value: stats.total },
          { label: 'En attente', value: stats.pending },
          { label: 'En retard', value: stats.overdue },
          { label: 'En cours', value: stats.inProgress },
          { label: 'Résolus', value: stats.resolved },
        ].map((s) => (
          <div key={s.label} className="bg-ivory border border-light-gray p-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-olive/40 mb-1">{s.label}</p>
            <p className="font-display text-2xl font-light text-deep-forest">{loading ? '…' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <Filter className="w-4 h-4 text-olive/40 mb-2.5" />
        <div>
          <label className="block text-[10px] uppercase tracking-[0.12em] text-olive/40 mb-1">Statut</label>
          <select
            className="border border-light-gray bg-white px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="ALL">Tous</option>
            <option value="PENDING">En attente</option>
            <option value="OVERDUE">En retard (&gt;{OVERDUE_HOURS}h)</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolus</option>
          </select>
        </div>
        {isFullAccess && (
          <div>
            <label className="block text-[10px] uppercase tracking-[0.12em] text-olive/40 mb-1">Unité</label>
            <select
              className="border border-light-gray bg-white px-3 py-2 text-sm"
              value={uniteFilter}
              onChange={(e) => setUniteFilter(e.target.value)}
            >
              <option value="">Toutes</option>
              {unites.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-[10px] uppercase tracking-[0.12em] text-olive/40 mb-1">Cimetière</label>
          <select
            className="border border-light-gray bg-white px-3 py-2 text-sm"
            value={cemeteryFilter}
            onChange={(e) => setCemeteryFilter(e.target.value)}
          >
            <option value="">Tous</option>
            {cemeteries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-700 bg-red-50 p-3">{error}</p>}

      <div className="space-y-4">
        {loading && <p className="text-olive/50">Chargement…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-olive/50 bg-ivory border border-light-gray p-6">Aucun signalement.</p>
        )}
        {filtered.map((r) => {
          const overdue = r.status === 'PENDING' && hoursPending(r.createdAt) >= OVERDUE_HOURS;
          const uniteId = cemeteryUnite.get(r.cemeteryId);
          const uniteName = unites.find((u) => u.id === uniteId)?.name;
          return (
            <div key={r.id} className="bg-ivory border border-light-gray p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-medium text-deep-forest">
                    {r.cemeteryName ?? r.cemeteryId}
                    {uniteName ? <span className="text-olive/50 font-normal"> · {uniteName}</span> : null}
                  </p>
                  <p className="text-xs text-olive/50 mt-1">
                    {issueLabel(r.issueType)} · {new Date(r.createdAt).toLocaleString('fr-DZ')}
                    {overdue && (
                      <span className="ml-2 text-red-700 font-semibold">
                        En retard ({Math.floor(hoursPending(r.createdAt))} h)
                      </span>
                    )}
                  </p>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 ${
                    r.status === 'RESOLVED'
                      ? 'bg-deep-forest/10 text-deep-forest'
                      : r.status === 'IN_PROGRESS'
                        ? 'bg-muted-gold/20 text-deep-forest'
                        : 'bg-olive/10 text-olive'
                  }`}
                >
                  {statusLabel[r.status]}
                </span>
              </div>
              <p className="text-sm text-deep-forest/80 mb-3 whitespace-pre-wrap">{r.description}</p>
              {r.imageUrl && (
                <img src={r.imageUrl} alt="" className="mb-3 h-32 object-cover bg-light-gray" />
              )}
              <div className="mb-3">
                <label className="block text-[10px] uppercase tracking-[0.12em] text-olive/40 mb-1">
                  Note de résolution
                </label>
                <textarea
                  className="w-full border border-light-gray bg-white px-3 py-2 text-sm"
                  rows={2}
                  value={noteDraft[r.id] ?? r.resolutionNote}
                  onChange={(e) => setNoteDraft((prev) => ({ ...prev, [r.id]: e.target.value }))}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {r.status === 'PENDING' && (
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => setStatus(r.id, 'IN_PROGRESS')}
                    className="text-sm bg-muted-gold/30 text-deep-forest px-3 py-1.5 font-semibold disabled:opacity-50"
                  >
                    Prendre en charge
                  </button>
                )}
                {r.status !== 'RESOLVED' && (
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => setStatus(r.id, 'RESOLVED')}
                    className="text-sm bg-deep-forest text-ivory px-3 py-1.5 font-semibold disabled:opacity-50"
                  >
                    Marquer résolu
                  </button>
                )}
                {isFullAccess && overdue && (
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => onAlert(r)}
                    className="inline-flex items-center gap-1.5 text-sm border border-red-700/40 text-red-800 px-3 py-1.5 font-semibold disabled:opacity-50"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Envoyer une alerte
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
