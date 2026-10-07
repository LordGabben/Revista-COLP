import { supabase, mapVolumeRow } from '../lib/supabase';
import { Volume } from '../types';
import currentVolumeCoverImg from '../assets/images/current_volume_cover_1790466202632.jpg';
import { uploadPdfToStorage } from './articlesService';

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
  pdfUrl: 'Scientia_Dentis_Vol1_Num1_2026.pdf',
  institutional_presentation: 'Scientia Dentis es el Órgano Oficial de difusión científica y académica del Ilustre Colegio de Odontólogos de La Paz (COLP). Publicación arbitrada por pares a doble ciego, orientada a la difusión de investigaciones estomatológicas de vanguardia, innovaciones clínicas, biomateriales y salud pública bucal bajo los más rigurosos estándares éticos de Ciencia Abierta (Acceso Abierto Diamante sin cobro de APC).'
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

  // Asegurar que el primer volumen del 2026 (Vol. 1 Núm. 1) sea el oficial activo si no existe en BD
  if (!mapped.some(v => v.id === 'v1n1' || (v.volumeNumber === 1 && v.issueNumber === 1 && v.year === 2026))) {
    mapped.unshift(OFFICIAL_FIRST_VOLUME_2026);
  }

  // Garantizar que siempre haya al menos un volumen activo
  if (mapped.length > 0 && !mapped.some(v => v.isCurrent)) {
    const v1 = mapped.find(v => v.id === 'v1n1');
    if (v1) {
      v1.isCurrent = true;
    } else {
      mapped[0].isCurrent = true;
    }
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
 * 3. updateVolumeDetails(volumeId, updates, coverFile):
 * Actualiza los campos del volumen en public.volumes de Supabase.
 * Si se incluye coverFile, lo sube automáticamente a Supabase Storage y actualiza cover_image.
 */
export async function updateVolumeDetails(
  volumeId: string, 
  updates: Partial<Volume>, 
  coverFile?: File
): Promise<Volume> {
  let publicCoverUrl: string | undefined = updates.coverImage;

  // 1. Subida opcional de nueva imagen de portada del volumen
  if (coverFile) {
    const cleanFileName = coverFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `volumes/${volumeId}_cover_${Date.now()}_${cleanFileName}`;
    try {
      try {
        const coverRes = await uploadPdfToStorage(coverFile, storagePath, 'covers');
        publicCoverUrl = coverRes.url;
      } catch {
        const coverRes = await uploadPdfToStorage(coverFile, storagePath, 'published_articles');
        publicCoverUrl = coverRes.url;
      }
    } catch (uploadErr) {
      console.warn('Error subiendo portada de volumen a Storage:', uploadErr);
    }
  }

  // 2. Si se marca como activo, desactivar los demás volúmenes
  if (updates.isCurrent) {
    try {
      await supabase
        .from('volumes')
        .update({ is_current: false })
        .neq('id', volumeId);
    } catch (cErr) {
      console.warn('Advertencia actualizando otros volúmenes:', cErr);
    }
  }

  // 3. Preparar payload de actualización
  const dbPayload: any = {};
  if (updates.title !== undefined) dbPayload.title = updates.title;
  if (updates.volumeNumber !== undefined) dbPayload.volume_number = updates.volumeNumber;
  if (updates.issueNumber !== undefined) dbPayload.issue_number = updates.issueNumber;
  if (updates.year !== undefined) dbPayload.year = updates.year;
  if (updates.isCurrent !== undefined) dbPayload.is_current = updates.isCurrent;
  if (updates.publishedAt !== undefined) dbPayload.published_at = updates.publishedAt;
  if (publicCoverUrl !== undefined) dbPayload.cover_image = publicCoverUrl;
  if (updates.theme !== undefined) dbPayload.theme = updates.theme;
  if (updates.pdfUrl !== undefined) dbPayload.pdf_url = updates.pdfUrl;
  if (updates.institutional_presentation !== undefined || updates.institutionalPresentation !== undefined) {
    dbPayload.institutional_presentation = updates.institutional_presentation ?? updates.institutionalPresentation;
  }

  const { data, error } = await supabase
    .from('volumes')
    .update(dbPayload)
    .eq('id', volumeId)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando volumen en Supabase:', error);
    throw new Error(`[Supabase Error - updateVolume] ${error.message}`);
  }

  return mapVolumeRow(data);
}

/**
 * 4. createVolume(volumeData, coverFile):
 * Permite registrar un nuevo volumen en Supabase y opcionalmente subir su portada.
 */
export async function createVolume(
  volumeData: Volume, 
  coverFile?: File
): Promise<Volume> {
  let publicCoverUrl: string | undefined = volumeData.coverImage;

  if (coverFile) {
    const cleanFileName = coverFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `volumes/${volumeData.id}_cover_${Date.now()}_${cleanFileName}`;
    try {
      try {
        const coverRes = await uploadPdfToStorage(coverFile, storagePath, 'covers');
        publicCoverUrl = coverRes.url;
      } catch {
        const coverRes = await uploadPdfToStorage(coverFile, storagePath, 'published_articles');
        publicCoverUrl = coverRes.url;
      }
    } catch (uploadErr) {
      console.warn('Error subiendo portada en createVolume:', uploadErr);
    }
  }

  if (volumeData.isCurrent) {
    try {
      await supabase
        .from('volumes')
        .update({ is_current: false })
        .neq('id', volumeData.id);
    } catch (cErr) {
      console.warn('Advertencia desactivando otros volúmenes:', cErr);
    }
  }

  const dbPayload = {
    id: volumeData.id,
    title: volumeData.title,
    volume_number: volumeData.volumeNumber,
    issue_number: volumeData.issueNumber,
    year: volumeData.year,
    is_current: volumeData.isCurrent ?? false,
    published_at: volumeData.publishedAt,
    cover_image: publicCoverUrl || null,
    theme: volumeData.theme || null,
    pdf_url: volumeData.pdfUrl || null,
    article_count: volumeData.articleCount || 0,
    institutional_presentation: volumeData.institutional_presentation ?? volumeData.institutionalPresentation ?? null
  };

  const { data, error } = await supabase
    .from('volumes')
    .insert(dbPayload)
    .select()
    .single();

  if (error) {
    console.error('Error insertando nuevo volumen en Supabase:', error);
    throw new Error(`[Supabase Error - createVolume] ${error.message}`);
  }

  return mapVolumeRow(data);
}

/**
 * 5. setCurrentActiveVolume(volumeId: string):
 * Conmuta qué volumen es el activo (is_current = true).
 */
export async function setCurrentActiveVolume(volumeId: string): Promise<boolean> {
  // Desactivar todos
  await supabase.from('volumes').update({ is_current: false }).neq('id', volumeId);
  // Activar el seleccionado
  const { error } = await supabase.from('volumes').update({ is_current: true }).eq('id', volumeId);
  if (error) {
    console.error('Error al conmutar volumen activo:', error);
    throw error;
  }
  return true;
}

/**
 * 6. incrementVolumeArticleCount(volumeId: string):
 * Incrementa directamente en Supabase el contador 'article_count' en la fila del volumen.
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
