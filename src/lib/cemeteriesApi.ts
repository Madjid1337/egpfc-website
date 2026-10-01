import type { Cemetery } from '@/data/cemeteries';
import { cemeteries as localCemeteries, communes as localCommunes, stats as localStats } from '@/data/cemeteries';
import type { Database } from '@/lib/database.types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type CemeteryRow = Database['public']['Tables']['cemeteries']['Row'];

function mapRow(row: CemeteryRow): Cemetery {
  return {
    id: row.id,
    name: row.name,
    nameAr: row.name_ar,
    commune: row.commune,
    communeAr: row.commune_ar,
    wilaya: row.wilaya,
    address: row.address,
    addressAr: row.address_ar,
    coordinates: [row.lat, row.lng],
    openingHours: row.opening_hours,
    openingHoursAr: row.opening_hours_ar,
    hectares: Number(row.hectares),
    type: row.type,
    typeAr: row.type_ar,
    description: row.description,
    descriptionAr: row.description_ar,
    imageUrl: row.image_url,
    available: row.available,
  };
}

export type CemeteriesSource = 'supabase' | 'local';

export async function fetchCemeteries(): Promise<{
  data: Cemetery[];
  source: CemeteriesSource;
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return { data: localCemeteries, source: 'local', error: 'Supabase env missing' };
  }

  const { data, error } = await supabase
    .from('cemeteries')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.warn('[supabase] cemeteries fetch failed, using local data:', error.message);
    return { data: localCemeteries, source: 'local', error: error.message };
  }

  if (!data || data.length === 0) {
    return {
      data: localCemeteries,
      source: 'local',
      error: 'No rows in cemeteries table yet — run supabase/seed.sql',
    };
  }

  return { data: data.map(mapRow), source: 'supabase' };
}

export async function fetchCemeteryById(id: string): Promise<{
  data: Cemetery | null;
  source: CemeteriesSource;
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      data: localCemeteries.find((c) => c.id === id) ?? null,
      source: 'local',
    };
  }

  const { data, error } = await supabase
    .from('cemeteries')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.warn('[supabase] cemetery by id failed:', error.message);
    return {
      data: localCemeteries.find((c) => c.id === id) ?? null,
      source: 'local',
      error: error.message,
    };
  }

  if (!data) {
    return {
      data: localCemeteries.find((c) => c.id === id) ?? null,
      source: 'local',
    };
  }

  return { data: mapRow(data), source: 'supabase' };
}

export function buildCommunes(list: Cemetery[]): string[] {
  const fromData = [...new Set(list.map((c) => c.commune))].sort((a, b) => a.localeCompare(b));
  return fromData.length > 0 ? fromData : localCommunes;
}

export function buildStats(list: Cemetery[]) {
  if (list.length === 0) return localStats;
  return {
    totalCemeteries: Math.max(localStats.totalCemeteries, list.length),
    communesCovered: new Set(list.map((c) => c.commune)).size,
    hectaresMaintained: Math.round(list.reduce((sum, c) => sum + c.hectares, 0)),
    agentsDeployed: localStats.agentsDeployed,
  };
}
