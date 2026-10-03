import { useEffect, useState } from 'react';
import type { Service } from '@/data/services';
import { fetchServiceById, fetchServices } from '@/lib/servicesApi';

export function useServices(opts?: { includeDrafts?: boolean }) {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local'>('local');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchServices(opts);
      if (cancelled) return;
      setItems(result.data);
      setSource(result.source);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [opts?.includeDrafts]);

  return { items, loading, source, error };
}

export function useService(id: string | undefined) {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || id === 'nouveau') {
      setService(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const result = await fetchServiceById(id);
      if (cancelled) return;
      setService(result.data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { service, loading };
}
