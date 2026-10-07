import { supabase, mapVolumeRow } from '../lib/supabase';
import { Volume } from '../types';
import currentVolumeCoverImg from '../assets/images/current_volume_cover_1790466202632.jpg';

// Definición oficial del primer volumen del año 2026: Vol. 1 Núm. 1 (2026)
export const OFFICIAL_FIRST_VOLUME_2026: Volume = {
  id: 'v1n1',
  title: 'Vol. 1 Núm. 1 (2026): Scientia Dentis - Revista Científica Oficial',
  volumeNumber: 1,
  issueNumber: 1,
  year: 2026,
  isCurrent: true,
  publishedAt: '2026-01-15',
  coverImage: currentVolumeCoverImg,
  articleCount: 1,
  theme: 'Odontología Multidisciplinaria & Investigación Clínica',
  pdfUrl: 'Scientia_Dentis_Vol1_Num1_2026.pdf'
};

// IDs y patrones de volúmenes de ejemplo para no tomarlos en cuenta
const DEMO_EXAMPLE_VOLUMES = new Set(['v12n2', 'v12n1', 'v11n2', 'v11n1', 'v10n2']);

/**
 * 1. getVolumes():
 * Consulta directamente la tabla 'public.volumes' en Supabase.
 * Descarta todos los volúmenes de ejemplo anteriores (v12n2, v12n1, etc.)
 * y retorna únicamente los fascículos oficiales reales, siendo el primero el Vol. 1 Núm. 1 (2026).
 */
export async function getVolumes(): Promise<Volume[]> {
  const { data, error } = await supabase
    .from('volumes')
    .select('*')
    .order('year', { ascending: false })
    .order('volume_number', { ascending: false });

  if (error) {
    console.error('Error al consultar volúmenes en Supabase:', error);
    throw new Error(`[Supabase Error - volumes] ${error.message} (Código: ${error.code})`);
  }

  // Filtrar los volúmenes de ejemplo de prueba
  const realRows = (data || []).filter(row => {
    if (DEMO_EXAMPLE_VOLUMES.has(row.id)) return false;
    if (typeof row.title === 'string' && (row.title.includes('Vol. 12') || row.title.includes('Vol. 11') || row.title.includes('Vol. 10'))) {
      return false;
    }
    return true;
  });

  const mapped = realRows.map(mapVolumeRow);

  // Asegurar que el primer volumen del 2026 (Vol. 1 Núm. 1) sea el oficial activo
  if (!mapped.some(v => v.id === 'v1n1' || (v.volumeNumber === 1 && v.issueNumber === 1 && v.year === 2026))) {
    mapped.unshift(OFFICIAL_FIRST_VOLUME_2026);
  }

  return mapped;
}

/**
 * 2. getCurrentVolume():
 * Retorna el volumen actual oficial (Vol. 1 Núm. 1 2026).
 */
export async function getCurrentVolume(): Promise<Volume> {
  const allVolumes = await getVolumes();
  const current = allVolumes.find(v => v.isCurrent) || allVolumes[0] || OFFICIAL_FIRST_VOLUME_2026;
  return current;
}

/**
 * 3. incrementVolumeArticleCount(volumeId: string):
 * Incrementa directamente en Supabase el contador 'article_count' en la fila del volumen.
 * Lanza error si falla.
 */
export async function incrementVolumeArticleCount(volumeId: string): Promise<boolean> {
  const { data, error: readError } = await supabase
    .from('volumes')
    .select('article_count')
    .eq('id', volumeId)
    .single();

  if (readError) {
    console.error('Error al leer volumen para incrementar conteo:', readError);
    throw new Error(`[Supabase Error] No se pudo leer el volumen ${volumeId}: ${readError.message}`);
  }

  const currentCount = data?.article_count ?? 0;
  const { error: updateError } = await supabase
    .from('volumes')
    .update({ article_count: currentCount + 1 })
    .eq('id', volumeId);

  if (updateError) {
    console.error('Error al actualizar article_count en Supabase:', updateError);
    throw new Error(`[Supabase Error] No se pudo incrementar article_count en volumen: ${updateError.message}`);
  }

  return true;
}
