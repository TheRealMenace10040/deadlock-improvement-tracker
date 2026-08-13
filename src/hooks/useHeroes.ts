import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Hero } from '../types';

export function useHeroes() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('heroes').select('*').order('sort_order');
    if (error) setError(error.message);
    else setHeroes(data as Hero[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byId = new Map(heroes.map((h) => [h.id, h]));
  const bySlug = new Map(heroes.map((h) => [h.slug, h]));

  const uploadPortrait = useCallback(async (heroId: string, file: File): Promise<string> => {
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
    const path = `${heroId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('hero-portraits').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabase.storage.from('hero-portraits').getPublicUrl(path);
    const portraitUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from('heroes')
      .update({ portrait_url: portraitUrl })
      .eq('id', heroId);
    if (updateError) throw new Error(updateError.message);

    setHeroes((prev) => prev.map((h) => (h.id === heroId ? { ...h, portrait_url: portraitUrl } : h)));
    return portraitUrl;
  }, []);

  return { heroes, byId, bySlug, loading, error, reload: load, uploadPortrait };
}
