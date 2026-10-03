import type { Service } from '@/data/services';
import { services as localServices } from '@/data/services';
import type { Database } from '@/lib/database.types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { slugifyId } from '@/lib/adminApi';

type ServiceRow = Database['public']['Tables']['services']['Row'];
type ServiceInsert = Database['public']['Tables']['services']['Insert'];

function mapRow(row: ServiceRow): Service {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    titleAr: row.title_ar,
    description: row.description,
    descriptionAr: row.description_ar,
    icon: row.icon,
    features: row.features ?? [],
    featuresAr: row.features_ar ?? [],
    sortOrder: row.sort_order,
    published: row.published,
  };
}

export type ServiceFormValues = {
  id: string;
  number: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  featuresText: string;
  featuresArText: string;
  sortOrder: number;
  published: boolean;
};

export function emptyServiceForm(): ServiceFormValues {
  return {
    id: '',
    number: '01',
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    icon: 'Building2',
    featuresText: '',
    featuresArText: '',
    sortOrder: 0,
    published: true,
  };
}

export function serviceToForm(s: Service & { sortOrder?: number; published?: boolean }): ServiceFormValues {
  return {
    id: s.id,
    number: s.number,
    title: s.title,
    titleAr: s.titleAr,
    description: s.description,
    descriptionAr: s.descriptionAr,
    icon: s.icon,
    featuresText: s.features.join('\n'),
    featuresArText: s.featuresAr.join('\n'),
    sortOrder: s.sortOrder ?? 0,
    published: s.published ?? true,
  };
}

function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function fetchServices(opts?: { includeDrafts?: boolean }) {
  if (!isSupabaseConfigured) {
    return { data: localServices, source: 'local' as const };
  }

  let query = supabase.from('services').select('*').order('sort_order', { ascending: true });
  if (!opts?.includeDrafts) {
    query = query.eq('published', true);
  }

  const { data, error } = await query;
  if (error || !data?.length) {
    if (error) console.warn('[supabase] services:', error.message);
    return { data: localServices, source: 'local' as const, error: error?.message };
  }

  return { data: data.map(mapRow), source: 'supabase' as const };
}

export async function fetchServiceById(id: string) {
  if (!isSupabaseConfigured) {
    return { data: localServices.find((s) => s.id === id) ?? null, source: 'local' as const };
  }

  const { data, error } = await supabase.from('services').select('*').eq('id', id).maybeSingle();
  if (error || !data) {
    return {
      data: localServices.find((s) => s.id === id) ?? null,
      source: 'local' as const,
      error: error?.message,
    };
  }

  return { data: mapRow(data), source: 'supabase' as const };
}

export async function upsertService(values: ServiceFormValues, isNew: boolean) {
  const id = slugifyId(values.id) || slugifyId(values.title);
  const payload: ServiceInsert = {
    id,
    number: values.number,
    title: values.title,
    title_ar: values.titleAr,
    description: values.description,
    description_ar: values.descriptionAr,
    icon: values.icon,
    features: linesToArray(values.featuresText),
    features_ar: linesToArray(values.featuresArText),
    sort_order: values.sortOrder,
    published: values.published,
    updated_at: new Date().toISOString(),
  };

  if (isNew) {
    const { error } = await supabase.from('services').insert(payload);
    return { error: error?.message, id };
  }

  const { error } = await supabase.from('services').upsert(payload);
  return { error: error?.message, id };
}

export async function deleteService(id: string) {
  const { error } = await supabase.from('services').delete().eq('id', id);
  return { error: error?.message };
}

export const SERVICE_ICONS = ['Building2', 'Sparkles', 'Trees', 'Heart', 'Shield', 'Leaf', 'Users', 'MapPin'] as const;
