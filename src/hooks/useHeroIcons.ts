import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface HeroRow {
  name: string;
  icon_url: string | null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function useHeroIcons() {
  const [iconMap, setIconMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('heroes').select('*');
    if (error) {
      setError(error.message);
    } else {
      const map = new Map<string, string>();
      (data as HeroRow[]).forEach((h) => {
        if (h.icon_url) map.set(h.name, h.icon_url);
      });
      setIconMap(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upsertIcon = useCallback(async (name: string, file: File): Promise<string> => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Hero name is required before uploading an icon.');

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
    const path = `${slugify(trimmed)}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('hero-icons').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabase.storage.from('hero-icons').getPublicUrl(path);
    const iconUrl = publicUrlData.publicUrl;

    const { error: upsertError } = await supabase
      .from('heroes')
      .upsert({ name: trimmed, icon_url: iconUrl }, { onConflict: 'name' });
    if (upsertError) throw new Error(upsertError.message);

    setIconMap((prev) => {
      const next = new Map(prev);
      next.set(trimmed, iconUrl);
      return next;
    });

    return iconUrl;
  }, []);

  return { iconMap, loading, error, reload: load, upsertIcon };
}
