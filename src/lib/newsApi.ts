import type { NewsItem } from '@/data/news';
import { newsItems as localNews } from '@/data/news';
import type { Database } from '@/lib/database.types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { slugifyId } from '@/lib/adminApi';

type NewsRow = Database['public']['Tables']['news']['Row'];
type NewsInsert = Database['public']['Tables']['news']['Insert'];

function mapRow(row: NewsRow): NewsItem {
  return {
    id: row.id,
    slug: row.slug,
    date: row.date_label,
    dateAr: row.date_label_ar,
    category: row.category,
    categoryAr: row.category_ar,
    title: row.title,
    titleAr: row.title_ar,
    description: row.description,
    descriptionAr: row.description_ar,
    imageUrl: row.image_url,
    published: row.published,
  };
}

export type NewsFormValues = {
  id?: string;
  slug: string;
  date: string;
  dateAr: string;
  category: string;
  categoryAr: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  imageUrl: string;
  published: boolean;
};

export function emptyNewsForm(): NewsFormValues {
  return {
    slug: '',
    date: '',
    dateAr: '',
    category: 'Entretien',
    categoryAr: 'صيانة',
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    imageUrl: '',
    published: true,
  };
}

export function newsToForm(item: NewsItem & { published?: boolean }): NewsFormValues {
  return {
    id: item.id,
    slug: item.slug,
    date: item.date,
    dateAr: item.dateAr,
    category: item.category,
    categoryAr: item.categoryAr,
    title: item.title,
    titleAr: item.titleAr,
    description: item.description,
    descriptionAr: item.descriptionAr,
    imageUrl: item.imageUrl,
    published: item.published ?? true,
  };
}

export async function fetchNews(opts?: { includeDrafts?: boolean }) {
  if (!isSupabaseConfigured) {
    return { data: localNews, source: 'local' as const };
  }

  let query = supabase.from('news').select('*').order('created_at', { ascending: false });
  if (!opts?.includeDrafts) {
    query = query.eq('published', true);
  }

  const { data, error } = await query;
  if (error || !data?.length) {
    if (error) console.warn('[supabase] news:', error.message);
    return { data: localNews, source: 'local' as const, error: error?.message };
  }

  return { data: data.map(mapRow), source: 'supabase' as const };
}

export async function fetchNewsBySlug(slug: string) {
  if (!isSupabaseConfigured) {
    return { data: localNews.find((n) => n.slug === slug) ?? null, source: 'local' as const };
  }

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    return {
      data: localNews.find((n) => n.slug === slug) ?? null,
      source: 'local' as const,
      error: error?.message,
    };
  }

  return { data: mapRow(data), source: 'supabase' as const };
}

export async function upsertNews(values: NewsFormValues) {
  const slug = slugifyId(values.slug) || slugifyId(values.title);
  const payload: NewsInsert = {
    slug,
    date_label: values.date,
    date_label_ar: values.dateAr,
    category: values.category,
    category_ar: values.categoryAr,
    title: values.title,
    title_ar: values.titleAr,
    description: values.description,
    description_ar: values.descriptionAr,
    image_url: values.imageUrl,
    published: values.published,
  };

  if (values.id) {
    const { error } = await supabase.from('news').update(payload).eq('id', values.id);
    return { error: error?.message, id: values.id };
  }

  const { data, error } = await supabase.from('news').insert(payload).select('id').single();
  return { error: error?.message, id: data?.id };
}

export async function deleteNews(id: string) {
  const { error } = await supabase.from('news').delete().eq('id', id);
  return { error: error?.message };
}
