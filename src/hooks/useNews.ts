import { useEffect, useState } from 'react';
import type { NewsItem } from '@/data/news';
import { fetchNews, fetchNewsBySlug } from '@/lib/newsApi';

export function useNews(opts?: { includeDrafts?: boolean }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local'>('local');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchNews(opts);
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

  return { items, loading, source, error, reload: () => window.location.reload() };
}

export function useNewsArticle(slug: string | undefined) {
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setArticle(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const result = await fetchNewsBySlug(slug);
      if (cancelled) return;
      setArticle(result.data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { article, loading };
}
