import { supabase, isSupabaseConfigured, resolveVolumeCover } from '../lib/supabase';
import { Volume } from '../types';
import { INITIAL_VOLUMES } from '../data';

/**
 * Maps Supabase raw database row to frontend Volume type
 */
export function mapVolumeRow(row: any): Volume {
  const safeCover = resolveVolumeCover(row.id, row.cover_image || row.coverImage);

  return {
    id: row.id,
    title: row.title || 'Scientia Dentis',
    volumeNumber: row.volume_number ?? row.volumeNumber ?? 12,
    issueNumber: row.issue_number ?? row.issueNumber ?? 2,
    year: row.year ?? 2026,
    isCurrent: Boolean(row.is_current ?? row.isCurrent),
    publishedAt: row.published_at ?? row.publishedAt ?? new Date().toISOString().split('T')[0],
    coverImage: safeCover,
    articleCount: row.article_count ?? row.articleCount ?? 8,
    theme: row.theme,
    pdfUrl: row.pdf_url ?? row.pdfUrl,
  };
}

/**
 * 1. getVolumes():
 * Fetches all volumes from `public.volumes` ordered by year and volume number descending.
 * Includes graceful fallback to localStorage / INITIAL_VOLUMES.
 */
export async function getVolumes(): Promise<Volume[]> {
  // If Supabase client is not available, return cached or initial volumes
  if (!isSupabaseConfigured || !supabase) {
    const local = localStorage.getItem('oj_volumes');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.warn('Error parseando oj_volumes:', e);
      }
    }
    return INITIAL_VOLUMES;
  }

  try {
    const { data, error } = await supabase
      .from('volumes')
      .select('*')
      .order('year', { ascending: false })
      .order('volume_number', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Supabase getVolumes error o tabla vacía, usando fallback:', error?.message);
      const local = localStorage.getItem('oj_volumes');
      return local ? JSON.parse(local) : INITIAL_VOLUMES;
    }

    const mapped = data.map(mapVolumeRow);
    // Cache locally for instant loading on reloads
    try {
      localStorage.setItem('oj_volumes', JSON.stringify(mapped));
    } catch (e) {}

    return mapped;
  } catch (err) {
    console.warn('Excepción al conectar con Supabase en getVolumes:', err);
    const local = localStorage.getItem('oj_volumes');
    return local ? JSON.parse(local) : INITIAL_VOLUMES;
  }
}

/**
 * 2. getCurrentVolume():
 * Fetches the active current volume where `is_current = true`.
 */
export async function getCurrentVolume(): Promise<Volume> {
  const volumes = await getVolumes();
  const current = volumes.find(v => v.isCurrent);
  return current || volumes[0] || INITIAL_VOLUMES[0];
}

/**
 * 3. incrementVolumeArticleCount(volumeId: string):
 * Increments the article_count field of a specific volume row in Supabase.
 */
export async function incrementVolumeArticleCount(volumeId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    // Update local storage fallback
    const local = localStorage.getItem('oj_volumes');
    if (local) {
      try {
        const vols: Volume[] = JSON.parse(local);
        const updated = vols.map(v => v.id === volumeId ? { ...v, articleCount: (v.articleCount || 0) + 1 } : v);
        localStorage.setItem('oj_volumes', JSON.stringify(updated));
      } catch (e) {}
    }
    return true;
  }

  try {
    // First read current count
    const { data, error } = await supabase
      .from('volumes')
      .select('article_count')
      .eq('id', volumeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error leyendo volumen en incrementVolumeArticleCount:', error.message);
    }

    const currentCount = data?.article_count ?? 8;
    const { error: updateErr } = await supabase
      .from('volumes')
      .update({ article_count: currentCount + 1 })
      .eq('id', volumeId);

    if (updateErr) {
      console.warn('Error actualizando article_count en Supabase:', updateErr.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Excepción en incrementVolumeArticleCount:', err);
    return false;
  }
}
