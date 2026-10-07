import { supabase } from '../lib/supabase';
import { Partner } from '../types';
import { uploadPdfToStorage } from './articlesService';
import colpLogoImg from '../assets/images/colp_logo.png';

/**
 * Fallback institucional de aliados y patrocinadores oficiales de Scientia Dentis (COLP)
 */
export const DEFAULT_PARTNERS: Partner[] = [
  {
    id: 'aaed5ba2-97ed-44bf-8a48-a76d5ee3e1d4',
    name: 'Colegio de Odontólogos de La Paz (COLP)',
    logo_url: colpLogoImg || '/colp_logo.png',
    website_url: 'https://revista.colp.com.bo',
    category: 'Institucional',
    order_index: 1
  },
  {
    id: 'p_umsa_odontologia',
    name: 'Facultad de Odontología - UMSA',
    logo_url: '/colp_logo.jpg',
    website_url: 'https://odontologia.umsa.bo',
    category: 'Académico',
    order_index: 2
  },
  {
    id: 'p_abo_nacional',
    name: 'Asociación Boliviana de Odontología (ABO)',
    logo_url: '/colp_vector_logo.svg',
    website_url: 'https://abo.org.bo',
    category: 'Institucional',
    order_index: 3
  },
  {
    id: 'p_straumann_biomaterials',
    name: 'Straumann Biomaterials & Oral Implants',
    logo_url: '/covers/cover_biomaterials_bone_1790468595959.jpg',
    website_url: 'https://www.straumann.com',
    category: 'Auspiciador Comercial',
    order_index: 4
  }
];

function mapPartnerRow(row: any, index: number): Partner {
  return {
    id: String(row.id || `partner_${index}`),
    name: row.name || 'Aliado Estratégico',
    logo_url: row.logo_url || colpLogoImg || '/colp_logo.png',
    website_url: row.website_url || undefined,
    category: row.category || 'Institucional',
    order_index: Number(row.order_index ?? index + 1)
  };
}

/**
 * 1. getPartners():
 * Consulta directamente la tabla 'public.partners' en Supabase ordenada por order_index.
 */
export async function getPartners(): Promise<Partner[]> {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.warn('[partnersService] Error al consultar partners en Supabase:', error.message);
      return DEFAULT_PARTNERS;
    }

    if (!data || data.length === 0) {
      return DEFAULT_PARTNERS;
    }

    return data.map((row, idx) => mapPartnerRow(row, idx));
  } catch (err) {
    console.error('[partnersService] Fallo de red en getPartners:', err);
    return DEFAULT_PARTNERS;
  }
}

/**
 * 2. addPartner(payload, logoFile):
 * Sube opcionalmente el logo al bucket 'published_articles' o 'covers' y registra en 'public.partners'.
 */
export async function addPartner(
  payload: Omit<Partner, 'id'>, 
  logoFile?: File
): Promise<Partner> {
  let finalLogoUrl = payload.logo_url || colpLogoImg || '/colp_logo.png';

  if (logoFile) {
    const cleanFileName = logoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `partners/${Date.now()}_${cleanFileName}`;
    try {
      try {
        const uploadRes = await uploadPdfToStorage(logoFile, storagePath, 'covers');
        finalLogoUrl = uploadRes.url;
      } catch {
        const uploadRes = await uploadPdfToStorage(logoFile, storagePath, 'published_articles');
        finalLogoUrl = uploadRes.url;
      }
    } catch (uploadErr) {
      console.warn('Error subiendo logo de partner a Storage:', uploadErr);
    }
  }

  const dbPayload = {
    name: payload.name.trim(),
    logo_url: finalLogoUrl,
    website_url: payload.website_url ? payload.website_url.trim() : null,
    category: payload.category ? payload.category.trim() : 'Institucional',
    order_index: payload.order_index ?? 99
  };

  const { data, error } = await supabase
    .from('partners')
    .insert(dbPayload)
    .select()
    .single();

  if (error) {
    console.error('[partnersService] Error agregando partner en Supabase:', error);
    throw new Error(`[Supabase Error - addPartner] ${error.message} (Código: ${error.code})`);
  }

  return mapPartnerRow(data, 0);
}

/**
 * 3. updatePartner(id, updates, logoFile):
 * Actualiza la información del partner en 'public.partners'.
 */
export async function updatePartner(
  id: string, 
  updates: Partial<Partner>, 
  logoFile?: File
): Promise<Partner> {
  let finalLogoUrl = updates.logo_url;

  if (logoFile) {
    const cleanFileName = logoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `partners/${id}_${Date.now()}_${cleanFileName}`;
    try {
      try {
        const uploadRes = await uploadPdfToStorage(logoFile, storagePath, 'covers');
        finalLogoUrl = uploadRes.url;
      } catch {
        const uploadRes = await uploadPdfToStorage(logoFile, storagePath, 'published_articles');
        finalLogoUrl = uploadRes.url;
      }
    } catch (uploadErr) {
      console.warn('Error actualizando logo de partner en Storage:', uploadErr);
    }
  }

  const dbPayload: Record<string, any> = {};
  if (updates.name !== undefined) dbPayload.name = updates.name.trim();
  if (finalLogoUrl !== undefined) dbPayload.logo_url = finalLogoUrl;
  if (updates.website_url !== undefined) {
    dbPayload.website_url = updates.website_url ? updates.website_url.trim() : null;
  }
  if (updates.category !== undefined) dbPayload.category = updates.category.trim();
  if (updates.order_index !== undefined) dbPayload.order_index = Number(updates.order_index);

  const { data, error } = await supabase
    .from('partners')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[partnersService] Error actualizando partner en Supabase:', error);
    throw new Error(`[Supabase Error - updatePartner] ${error.message} (Código: ${error.code})`);
  }

  return mapPartnerRow(data, 0);
}

/**
 * 4. deletePartner(id):
 * Elimina el registro del partner de 'public.partners'.
 */
export async function deletePartner(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[partnersService] Error eliminando partner en Supabase:', error);
    throw new Error(`[Supabase Error - deletePartner] ${error.message} (Código: ${error.code})`);
  }

  return true;
}
