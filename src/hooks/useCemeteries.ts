import { useEffect, useState } from 'react';
import type { Cemetery } from '@/data/cemeteries';
import { stats as localStats } from '@/data/cemeteries';
import {
  buildCommunes,
  buildStats,
  fetchCemeteries,
  fetchCemeteryById,
  type CemeteriesSource,
} from '@/lib/cemeteriesApi';

export function useCemeteries() {
  const [cemeteries, setCemeteries] = useState<Cemetery[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<CemeteriesSource>('local');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = await fetchCemeteries();
      if (cancelled) return;
      setCemeteries(result.data);
      setSource(result.source);
      setError(result.error);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    cemeteries,
    communes: buildCommunes(cemeteries),
    stats: cemeteries.length ? buildStats(cemeteries) : localStats,
    loading,
    source,
    error,
  };
}

export function useCemetery(id: string | undefined) {
  const [cemetery, setCemetery] = useState<Cemetery | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<CemeteriesSource>('local');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!id) {
      setCemetery(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const result = await fetchCemeteryById(id);
      if (cancelled) return;
      setCemetery(result.data);
      setSource(result.source);
      setError(result.error);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { cemetery, loading, source, error };
}
