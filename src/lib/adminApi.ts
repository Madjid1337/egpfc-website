import type { Cemetery } from '@/data/cemeteries';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

type CemeteryInsert = Database['public']['Tables']['cemeteries']['Insert'];
type MediaRow = Database['public']['Tables']['media']['Row'];

export type CemeteryFormValues = {
  id: string;
  name: string;
  nameAr: string;
  commune: string;
  communeAr: string;
  wilaya: string;
  address: string;
  addressAr: string;
  lat: number;
  lng: number;
  openingHours: string;
  openingHoursAr: string;
  hectares: number;
  type: Cemetery['type'];
  typeAr: string;
  description: string;
  descriptionAr: string;
  imageUrl: string;
  available: boolean;
};

export function cemeteryToForm(c: Cemetery): CemeteryFormValues {
  return {
    id: c.id,
    name: c.name,
    nameAr: c.nameAr,
    commune: c.commune,
    communeAr: c.communeAr,
    wilaya: c.wilaya,
    address: c.address,
    addressAr: c.addressAr,
    lat: c.coordinates[0],
    lng: c.coordinates[1],
    openingHours: c.openingHours,
    openingHoursAr: c.openingHoursAr,
    hectares: c.hectares,
    type: c.type,
    typeAr: c.typeAr,
    description: c.description,
    descriptionAr: c.descriptionAr,
    imageUrl: c.imageUrl,
    available: c.available,
  };
}

export function emptyCemeteryForm(): CemeteryFormValues {
  return {
    id: '',
    name: '',
    nameAr: '',
    commune: '',
    communeAr: '',
    wilaya: 'Alger',
    address: '',
    addressAr: '',
    lat: 36.75,
    lng: 3.05,
    openingHours: '08:00 – 17:00',
    openingHoursAr: '08:00 – 17:00',
    hectares: 0,
    type: 'islamique',
    typeAr: 'إسلامي',
    description: '',
    descriptionAr: '',
    imageUrl: '',
    available: true,
  };
}

export function slugifyId(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

export function typeArFromType(type: Cemetery['type']): string {
  if (type === 'chrétien') return 'مسيحي';
  if (type === 'mixte') return 'مختلط';
  return 'إسلامي';
}

function toInsert(values: CemeteryFormValues): CemeteryInsert {
  return {
    id: values.id,
    name: values.name,
    name_ar: values.nameAr,
    commune: values.commune,
    commune_ar: values.communeAr,
    wilaya: values.wilaya,
    address: values.address,
    address_ar: values.addressAr,
    lat: values.lat,
    lng: values.lng,
    opening_hours: values.openingHours,
    opening_hours_ar: values.openingHoursAr,
    hectares: values.hectares,
    type: values.type,
    type_ar: values.typeAr || typeArFromType(values.type),
    description: values.description,
    description_ar: values.descriptionAr,
    image_url: values.imageUrl,
    available: values.available,
    updated_at: new Date().toISOString(),
  };
}

export async function upsertCemetery(values: CemeteryFormValues) {
  const payload = toInsert(values);
  const { error } = await supabase.from('cemeteries').upsert(payload);
  return { error: error?.message };
}

export async function deleteCemetery(id: string) {
  const { error } = await supabase.from('cemeteries').delete().eq('id', id);
  return { error: error?.message };
}

export async function fetchMedia(kind?: MediaRow['kind']) {
  let query = supabase.from('media').select('*').order('sort_order', { ascending: true });
  if (kind) query = query.eq('kind', kind);
  const { data, error } = await query;
  return { data: data ?? [], error: error?.message };
}

export async function uploadSiteImage(file: File, folder = 'uploads') {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('site-images')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (uploadError) return { url: null as string | null, error: uploadError.message };

  const { data } = supabase.storage.from('site-images').getPublicUrl(path);
  return { url: data.publicUrl, error: undefined as string | undefined };
}

export async function insertMedia(input: {
  url: string;
  kind: MediaRow['kind'];
  title?: string;
  sortOrder?: number;
  cemeteryId?: string | null;
}) {
  const { error } = await supabase.from('media').insert({
    url: input.url,
    kind: input.kind,
    title: input.title ?? '',
    sort_order: input.sortOrder ?? 0,
    cemetery_id: input.cemeteryId ?? null,
  });
  return { error: error?.message };
}

export async function deleteMedia(id: string) {
  const { error } = await supabase.from('media').delete().eq('id', id);
  return { error: error?.message };
}
