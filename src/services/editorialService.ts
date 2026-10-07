import { supabase } from '../lib/supabase';
import { EditorialMember } from '../types';

/**
 * Datos oficiales de respaldo del Consejo Editorial y Científico de Scientia Dentis (COLP)
 * Utilizados como fallback seguro en caso de contingencia de red transitoria.
 */
export const DEFAULT_EDITORIAL_BOARD: EditorialMember[] = [
  {
    id: 'bcb620a7-76e6-4f5c-bc8d-ba559e478bda',
    name: 'Dr. Jeffersson Krishan Trigo Gutierrez, PhD',
    role: 'DIRECCIÓN GENERAL',
    institution: 'Colegio de Odontólogos de La Paz (COLP)',
    country: 'Bolivia',
    specialty: 'Doctor en Investigación Odontológica',
    order_index: 1,
    category: 'editorial'
  },
  {
    id: '9691d48b-773f-45f4-966d-9a078ea7234c',
    name: 'Dra. Maria Cristina Arce Loza',
    role: 'CONSEJO EDITORIAL / EDITORA EN JEFE',
    institution: 'Colegio de Odontólogos de La Paz',
    country: 'Bolivia',
    specialty: 'Especialista en Rehabilitación Oral, Ortodoncia, Salud Publica e Implantologia Oral',
    order_index: 2,
    category: 'editorial'
  },
  {
    id: '8a8229e9-9690-48e2-9aa4-710759667372',
    name: 'Lic. Gabriel Rolando Calle Catacora',
    role: 'DIRECCION DE TI / DESARROLLADOR PRINCIPAL',
    institution: 'Colegio de Odontólogos de La Paz',
    country: 'Bolivia',
    specialty: 'Especialista en Data Science, ML & Diseño UI/UX y Arquitectura de Software',
    order_index: 3,
    category: 'editorial'
  },
  {
    id: 'd8e61202-1fe3-4aee-90d1-826a7097c7eb',
    name: 'Dra. Carola Copa Franco',
    role: 'CONSEJO EDITORIAL',
    institution: 'Colegio de Odontólogos de La Paz',
    country: 'Bolivia',
    specialty: 'Especialista en Rehabilitacion Oral',
    order_index: 4,
    category: 'editorial'
  },
  {
    id: '0674a4df-287a-4be5-9a05-d7d04b5cf00a',
    name: 'Dra. Amaranta Aleida Aillon Terceros',
    role: 'CONSEJO EDITORIAL',
    institution: 'Colegio de Odontólogos de La Paz',
    country: 'Bolivia',
    specialty: 'Especialista en Endodoncia',
    order_index: 5,
    category: 'editorial'
  },
  {
    id: 'aae41856-f689-4446-b82b-faf120f785b4',
    name: 'Dra. Luz Emma Alurralde Alfaro',
    role: 'CONSEJO EDITORIAL',
    institution: 'Colegio de Odontólogos de La Paz',
    country: 'Bolivia',
    specialty: 'Especialista en Endodoncia',
    order_index: 6,
    category: 'editorial'
  },
  {
    id: '8226dc41-f461-48ca-8830-2aab1334ca3b',
    name: 'Dra. Lia Mavel Garcia Manzaneda',
    role: 'CONSEJO EDITORIAL',
    institution: 'Colegio de Odontólogos de La Paz',
    country: 'Bolivia',
    specialty: 'Especialista en Salud Publica',
    order_index: 7,
    category: 'editorial'
  },
  {
    id: '8b72bde8-2f68-46d8-b3b9-ab9c6ae72719',
    name: 'Dra. Ximena Torrez Choque',
    role: 'CONSEJO EDITORIAL',
    institution: 'Colegio de Odontólogos de La Paz',
    country: 'Bolivia',
    specialty: 'Especialista en Odontopediatria',
    order_index: 8,
    category: 'editorial'
  }
];

function mapEditorialRow(row: any, index: number): EditorialMember {
  const role = row.role || 'Miembro del Consejo Editorial';
  const isAdvisory = role.toLowerCase().includes('asesor') || (row.category === 'advisory');
  return {
    id: String(row.id || `colp_ed_${index}`),
    name: row.name || 'Sin nombre',
    role: role,
    institution: row.institution || 'Colegio de Odontólogos de La Paz (COLP)',
    country: row.country || 'Bolivia',
    specialty: row.specialty || '',
    order_index: Number(row.order_index ?? index + 1),
    category: isAdvisory ? 'advisory' : 'editorial'
  };
}

/**
 * 1. getEditorialBoard():
 * Consulta directamente la tabla 'public.editorial_board' en Supabase ordenada por order_index.
 * Si retorna vacío o error de red, utiliza el fallback institucional.
 */
export async function getEditorialBoard(): Promise<EditorialMember[]> {
  try {
    const { data, error } = await supabase
      .from('editorial_board')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.warn('[editorialService] Error al consultar editorial_board en Supabase:', error.message);
      return DEFAULT_EDITORIAL_BOARD;
    }

    if (!data || data.length === 0) {
      return DEFAULT_EDITORIAL_BOARD;
    }

    return data.map((row, idx) => mapEditorialRow(row, idx));
  } catch (err) {
    console.error('[editorialService] Fallo de red en getEditorialBoard:', err);
    return DEFAULT_EDITORIAL_BOARD;
  }
}

/**
 * 2. updateEditorialMember(id, updates):
 * Actualiza la fila en 'public.editorial_board' de Supabase por id.
 */
export async function updateEditorialMember(
  id: string, 
  updates: Partial<EditorialMember>
): Promise<EditorialMember> {
  const payload: Record<string, any> = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.role !== undefined) payload.role = updates.role.trim();
  if (updates.institution !== undefined) payload.institution = updates.institution.trim();
  if (updates.country !== undefined) payload.country = updates.country.trim();
  if (updates.specialty !== undefined) payload.specialty = updates.specialty.trim();
  if (updates.order_index !== undefined) payload.order_index = Number(updates.order_index);

  const { data, error } = await supabase
    .from('editorial_board')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[editorialService] Error actualizando miembro en Supabase:', error);
    throw new Error(`[Supabase Error - updateEditorialMember] ${error.message} (Código: ${error.code})`);
  }

  return mapEditorialRow(data, 0);
}

/**
 * 3. addEditorialMember(member):
 * Inserta un nuevo miembro en 'public.editorial_board' de Supabase.
 */
export async function addEditorialMember(
  member: Omit<EditorialMember, 'id'>
): Promise<EditorialMember> {
  const payload: Record<string, any> = {
    name: member.name.trim(),
    role: member.role.trim(),
    institution: (member.institution || 'Colegio de Odontólogos de La Paz').trim(),
    country: (member.country || 'Bolivia').trim(),
    specialty: (member.specialty || '').trim(),
    order_index: member.order_index ?? 99
  };

  const { data, error } = await supabase
    .from('editorial_board')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[editorialService] Error insertando miembro en Supabase:', error);
    throw new Error(`[Supabase Error - addEditorialMember] ${error.message} (Código: ${error.code})`);
  }

  return mapEditorialRow(data, 0);
}

/**
 * 4. deleteEditorialMember(id):
 * Elimina el miembro de la tabla 'public.editorial_board' en Supabase.
 */
export async function deleteEditorialMember(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('editorial_board')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[editorialService] Error eliminando miembro en Supabase:', error);
    throw new Error(`[Supabase Error - deleteEditorialMember] ${error.message} (Código: ${error.code})`);
  }

  return true;
}
