import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Article, Volume, Review, AuthUser } from '../types';

import currentVolumeCoverImg from '../assets/images/current_volume_cover_1790466202632.jpg';
import coverBiomaterialsImg from '../assets/images/cover_biomaterials_bone_1790468595959.jpg';
import coverEndodonticsImg from '../assets/images/cover_endodontics_cbct_1790468605223.jpg';
import coverPediatricImg from '../assets/images/cover_pediatric_dentistry_1790468615922.jpg';
import coverZygomaticImg from '../assets/images/cover_zygomatic_implants_1790468736059.jpg';

// 1. Read environment variables exactly as requested
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Validate and log error if any is missing
if (!supabaseUrl || !supabaseKey) {
  console.error("Faltan credenciales de Supabase:", { supabaseUrl, supabaseKey });
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Create Supabase client directly without interceptors
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://unconfigured-project.supabase.co', 
  supabaseKey || 'unconfigured-anon-key', 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// High-fidelity volume cover assets mapping
export const VOLUME_COVER_MAP: Record<string, string> = {
  v1n1: currentVolumeCoverImg,
  v12n2: currentVolumeCoverImg,
};

export function resolveVolumeCover(id?: string, coverImage?: string | null): string {
  if (coverImage && typeof coverImage === 'string' && coverImage.trim().length > 0 && !coverImage.includes('null') && !coverImage.includes('undefined')) {
    return coverImage;
  }
  if (id && VOLUME_COVER_MAP[id]) {
    return VOLUME_COVER_MAP[id];
  }
  return currentVolumeCoverImg;
}

/**
 * Transforms database volume row to frontend Volume type
 */
export function mapVolumeRow(row: any): Volume {
  const isCurrent = Boolean(row.is_current ?? row.isCurrent ?? true);
  const safeCover = resolveVolumeCover(row.id, row.cover_image || row.coverImage);

  // Vol. 1 Núm. 1 (2026) is the official first volume of 2026
  if (isCurrent || row.id === 'v1n1' || row.id === 'v12n2') {
    return {
      id: row.id,
      title: 'Vol. 1 Núm. 1 (2026): Scientia Dentis - Revista Científica Oficial',
      volumeNumber: 1,
      issueNumber: 1,
      year: 2026,
      isCurrent: true,
      publishedAt: row.published_at ?? '2026-01-15',
      coverImage: safeCover,
      articleCount: Math.max(1, row.article_count ?? 1),
      theme: 'Odontología Multidisciplinaria & Investigación Clínica',
      pdfUrl: row.pdf_url ?? 'Scientia_Dentis_Vol1_Num1_2026.pdf',
    };
  }

  return {
    id: row.id,
    title: row.title || 'Scientia Dentis',
    volumeNumber: row.volume_number ?? 1,
    issueNumber: row.issue_number ?? 1,
    year: row.year ?? 2026,
    isCurrent: false,
    publishedAt: row.published_at ?? new Date().toISOString().split('T')[0],
    coverImage: safeCover,
    articleCount: row.article_count ?? 0,
    theme: row.theme,
    pdfUrl: row.pdf_url,
  };
}

/**
 * Transforms database article row to frontend Article type
 */
export function mapArticleRow(row: any): Article {
  return {
    id: row.id,
    title: row.title || 'Sin título',
    abstract: row.abstract || '',
    authors: row.authors || [],
    authorEmails: row.author_emails || row.authorEmails || [],
    affiliations: row.affiliations || [],
    contributors: row.contributors || [],
    keywords: row.keywords || [],
    category: row.category || 'Estomatología General',
    submittedAt: row.submitted_at || row.submittedAt || new Date().toISOString().split('T')[0],
    status: row.status,
    manuscriptFile: row.manuscript_file || row.manuscriptFile || { 
      name: 'manuscrito.pdf', 
      size: '1.5 MB', 
      format: 'pdf',
      url: row.pdf_url || row.pdfUrl 
    },
    figures: row.figures || [],
    supplementaryFiles: row.supplementary_files || row.supplementaryFiles || [],
    reviewers: row.reviewers || [],
    reviews: row.reviews || [],
    editorNotes: row.editor_notes || row.editorNotes,
    publishedInVolumeId: (row.published_in_volume_id === 'v12n2' || !row.published_in_volume_id) 
      ? 'v1n1' 
      : (row.published_in_volume_id || row.publishedInVolumeId || 'v1n1'),
    publishedAt: row.published_at || row.publishedAt,
    cover_image_url: row.cover_image_url || row.coverImageUrl || undefined,
    pdfUrl: row.pdf_url || row.pdfUrl || row.manuscript_file?.url || row.manuscriptFile?.url,
    doi: row.doi,
    references: row.references_list || row.references || [],
    wordCount: row.word_count ?? row.wordCount ?? 3000,
    hasStructuredAbstract: Boolean(row.has_structured_abstract ?? row.hasStructuredAbstract ?? true),
    formattingScore: row.formatting_score ?? row.formattingScore ?? 95,
    formattingReport: row.formatting_report || row.formattingReport || [],
    aiDeclaration: row.ai_declaration || row.aiDeclaration,
  };
}

/**
 * Fetches volumes directly from Supabase.
 * Throws on error without localStorage fallback.
 */
export async function fetchVolumes(): Promise<Volume[]> {
  const { data, error } = await supabase
    .from('volumes')
    .select('*')
    .order('year', { ascending: false })
    .order('volume_number', { ascending: false });

  if (error) {
    console.error('Error en fetchVolumes desde Supabase:', error);
    throw error;
  }

  // Filtrar volúmenes de ejemplo para no tomarlos en cuenta
  const DEMO_EXAMPLE_VOLUMES = new Set(['v12n2', 'v12n1', 'v11n2', 'v11n1', 'v10n2']);
  const realRows = (data || []).filter(r => {
    if (DEMO_EXAMPLE_VOLUMES.has(r.id)) return false;
    if (typeof r.title === 'string' && (r.title.includes('Vol. 12') || r.title.includes('Vol. 11') || r.title.includes('Vol. 10'))) {
      return false;
    }
    return true;
  });

  const mapped = realRows.map(mapVolumeRow);
  if (!mapped.some(v => v.id === 'v1n1' || (v.volumeNumber === 1 && v.issueNumber === 1 && v.year === 2026))) {
    mapped.unshift({
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
    });
  }

  return mapped;
}

/**
 * Fetches articles directly from Supabase.
 * Throws on error without localStorage fallback.
 */
export async function fetchArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error en fetchArticles desde Supabase:', error);
    throw error;
  }

  return (data || []).map(mapArticleRow);
}

/**
 * Inserts or updates an article in Supabase.
 * Throws on error without localStorage fallback.
 */
export async function saveArticleToSupabase(article: Article): Promise<boolean> {
  const dbPayload = {
    id: article.id,
    title: article.title,
    abstract: article.abstract,
    authors: article.authors,
    author_emails: article.authorEmails,
    affiliations: article.affiliations,
    contributors: article.contributors || [],
    keywords: article.keywords,
    category: article.category,
    status: article.status,
    submitted_at: article.submittedAt,
    manuscript_file: article.manuscriptFile,
    figures: article.figures || [],
    supplementary_files: article.supplementaryFiles || [],
    reviewers: article.reviewers || [],
    reviews: article.reviews || [],
    editor_notes: article.editorNotes || null,
    published_in_volume_id: article.publishedInVolumeId || null,
    published_at: article.publishedAt || (article.status === 'published' ? (article.submittedAt || new Date().toISOString()) : null),
    cover_image_url: article.cover_image_url || null,
    pdf_url: article.pdfUrl || article.manuscriptFile?.url || null,
    doi: article.doi || null,
    references_list: article.references || [],
    word_count: article.wordCount,
    has_structured_abstract: article.hasStructuredAbstract,
    formatting_score: article.formattingScore,
    formatting_report: article.formattingReport,
    ai_declaration: article.aiDeclaration || null,
  };

  const { error } = await supabase
    .from('articles')
    .upsert(dbPayload, { onConflict: 'id' });

  if (error) {
    console.error('Error guardando artículo en Supabase:', error);
    throw error;
  }
  return true;
}

/**
 * Deletes an article from Supabase and any associated reviews.
 */
export async function deleteArticleFromSupabase(articleId: string): Promise<boolean> {
  try {
    await supabase.from('reviews').delete().eq('article_id', articleId);
  } catch (err) {
    console.warn('Advertencia eliminando reviews asociadas:', err);
  }

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', articleId);

  if (error) {
    console.error('Error eliminando artículo de Supabase:', error);
    throw error;
  }
  return true;
}

/**
 * Inserts a review in Supabase.
 * Throws on error without fallback.
 */
export async function saveReviewToSupabase(review: Review): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .upsert({
      id: review.id,
      article_id: review.articleId,
      reviewer_id: review.reviewerId,
      reviewer_name: review.reviewerName,
      originality_score: review.originalityScore,
      methodology_score: review.methodologyScore,
      clinical_relevance_score: review.clinicalRelevanceScore,
      ethical_score: review.ethicalScore,
      comments: review.comments,
      recommendation: review.recommendation,
      submitted_at: review.submittedAt,
    }, { onConflict: 'id' });

  if (error) {
    console.error('Error guardando revisión en Supabase:', error);
    throw error;
  }
  return true;
}

// ============================================================================
// SUPABASE AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================================

export const PREDEFINED_OFFICIAL_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  'admcentralcolp@gmail.com': {
    password: 'ScientiaCOLP2026!',
    user: {
      id: 'usr_superadmin_colp',
      email: 'admcentralcolp@gmail.com',
      name: 'Director General / Creador COLP',
      role: 'superadmin',
      affiliation: 'Colegio de Odontólogos de La Paz (COLP)',
      specialty: 'Cirugía Bucal y Maxilofacial',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  },
  'editor@scientiadentis.org': {
    password: 'EditorCOLP2026!',
    user: {
      id: 'usr_editor_chief',
      email: 'editor@scientiadentis.org',
      name: 'Dra. Patricia Villalobos Santander (Editora en Jefa)',
      role: 'editor',
      affiliation: 'Comité Editorial Científico COLP',
      specialty: 'Rehabilitación Oral e Implantología',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  },
  'revisor@scientiadentis.org': {
    password: 'RevisorCOLP2026!',
    user: {
      id: 'usr_reviewer_peer',
      email: 'revisor@scientiadentis.org',
      name: 'Dra. Elena Mendoza R. (Comité Científico / Arbitraje)',
      role: 'reviewer',
      affiliation: 'Consejo Científico de Arbitraje Odontológico COLP',
      specialty: 'Endodoncia & Tomografía Cone Beam',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  }
};

export async function registerAuthor(params: {
  email: string;
  password: string;
  fullName: string;
  affiliation: string;
  specialty?: string;
}): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    if (!isSupabaseConfigured) {
      const offlineUser: AuthUser = {
        id: 'usr_author_' + Date.now(),
        email: params.email.trim(),
        name: params.fullName.trim(),
        role: 'author',
        affiliation: params.affiliation.trim(),
        specialty: params.specialty,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('oj_auth_user', JSON.stringify(offlineUser));
      return { user: offlineUser, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email: params.email.trim(),
      password: params.password,
      options: {
        data: {
          full_name: params.fullName.trim(),
          role: 'author',
          affiliation: params.affiliation.trim(),
          specialty: params.specialty || 'Estomatología General',
        }
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      const userProfile: AuthUser = {
        id: data.user.id,
        email: data.user.email || params.email.trim(),
        name: params.fullName.trim(),
        role: 'author',
        affiliation: params.affiliation.trim(),
        specialty: params.specialty,
        createdAt: data.user.created_at,
      };

      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          name: params.fullName.trim(),
          role: 'author',
          affiliation: params.affiliation.trim(),
          specialty: params.specialty,
        });
      } catch {
        // ignore profile upsert error
      }

      localStorage.setItem('oj_auth_user', JSON.stringify(userProfile));
      return { user: userProfile, error: null };
    }

    return { user: null, error: 'No se pudo crear la cuenta de usuario.' };
  } catch (err: any) {
    return { user: null, error: err.message || 'Error durante el registro del autor.' };
  }
}

export async function loginUser(
  email: string, 
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check for official preassigned accounts first (SuperAdmin, Editor, Reviewer)
  const officialAccount = PREDEFINED_OFFICIAL_ACCOUNTS[normalizedEmail];
  if (officialAccount) {
    if (password === officialAccount.password) {
      localStorage.setItem('oj_auth_user', JSON.stringify(officialAccount.user));
      if (isSupabaseConfigured) {
        try {
          await supabase.from('profiles').upsert({
            id: officialAccount.user.id,
            email: officialAccount.user.email,
            name: officialAccount.user.name,
            role: officialAccount.user.role,
            affiliation: officialAccount.user.affiliation,
            specialty: officialAccount.user.specialty
          });
        } catch {
          // ignore
        }
      }
      return { user: officialAccount.user, error: null };
    } else {
      return { user: null, error: 'Contraseña incorrecta para la cuenta oficial COLP.' };
    }
  }

  // 2. If Supabase credentials are not configured, notify user cleanly
  if (!isSupabaseConfigured) {
    return { 
      user: null, 
      error: 'El servicio de autenticación en la nube requiere configuración en .env. Puede utilizar las cuentas oficiales preasignadas para acceder al sistema.' 
    };
  }

  // 3. Authenticate registered authors/users against Supabase Auth
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        return { 
          user: null, 
          error: 'Credenciales inválidas. Por favor verifique su correo y contraseña o regístrese como nuevo autor.' 
        };
      }
      if (msg.includes('email not confirmed')) {
        return { 
          user: null, 
          error: 'El correo electrónico no ha sido confirmado aún en Supabase. Verifique su bandeja de entrada o regístrese como nuevo autor.' 
        };
      }
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'No se pudo iniciar sesión en el servidor.' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const isSuperAdmin = normalizedEmail === 'admcentralcolp@gmail.com';
    const role = isSuperAdmin 
      ? 'superadmin' 
      : (profile?.role || data.user.user_metadata?.role || 'author');

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || normalizedEmail,
      name: profile?.name || data.user.user_metadata?.full_name || (isSuperAdmin ? 'Director General / Creador COLP' : normalizedEmail.split('@')[0]),
      role: role as any,
      affiliation: profile?.affiliation || data.user.user_metadata?.affiliation || 'Colegio de Odontólogos de La Paz (COLP)',
      specialty: profile?.specialty || data.user.user_metadata?.specialty,
      createdAt: data.user.created_at
    };

    localStorage.setItem('oj_auth_user', JSON.stringify(authUser));
    return { user: authUser, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Error de conexión con el servicio de autenticación.' };
  }
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem('oj_auth_user');
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
}

export async function getCurrentUserProfile(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const isSuperAdmin = user.email?.toLowerCase() === 'admcentralcolp@gmail.com';

    return {
      id: user.id,
      email: user.email || '',
      name: profile?.name || user.user_metadata?.full_name || (isSuperAdmin ? 'Director General / Creador COLP' : (user.email?.split('@')[0] || 'Usuario')),
      role: isSuperAdmin ? 'superadmin' : (profile?.role || user.user_metadata?.role || 'reader'),
      affiliation: profile?.affiliation || user.user_metadata?.affiliation || 'Colegio de Odontólogos de La Paz (COLP)',
      specialty: profile?.specialty || user.user_metadata?.specialty,
      createdAt: user.created_at
    };
  } catch (err) {
    console.error('Error obteniendo perfil actual:', err);
    return null;
  }
}

export async function fetchAllProfiles(): Promise<AuthUser[]> {
  const officialList = Object.values(PREDEFINED_OFFICIAL_ACCOUNTS).map(acc => acc.user);

  if (!isSupabaseConfigured) {
    return officialList;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return officialList;
    }

    const fetched: AuthUser[] = (data || []).map(p => ({
      id: p.id,
      name: p.name || 'Sin nombre',
      email: p.email || '',
      role: p.email?.toLowerCase() === 'admcentralcolp@gmail.com' ? 'superadmin' : p.role,
      affiliation: p.affiliation || '',
      specialty: p.specialty || '',
      createdAt: p.created_at
    }));

    // Merge with official list so officials are always available in user management
    const merged = [...fetched];
    for (const official of officialList) {
      if (!merged.some(u => u.email.toLowerCase() === official.email.toLowerCase())) {
        merged.unshift(official);
      }
    }
    return merged;
  } catch {
    return officialList;
  }
}

export async function createOfficialAccount(params: {
  name: string;
  email: string;
  password?: string;
  role: 'editor' | 'reviewer';
  affiliation: string;
  specialty?: string;
}): Promise<{ user: AuthUser | null; error: string | null }> {
  let userId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
    ? crypto.randomUUID() 
    : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');

  if (params.password && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email.trim(),
        password: params.password,
        options: {
          data: {
            full_name: params.name.trim(),
            role: params.role,
            affiliation: params.affiliation.trim(),
            specialty: params.specialty?.trim()
          }
        }
      });

      if (!error && data?.user) {
        userId = data.user.id;
      }
    } catch {
      // ignore
    }
  }

  if (isSupabaseConfigured) {
    try {
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: userId,
        email: params.email.trim(),
        name: params.name.trim(),
        role: params.role,
        affiliation: params.affiliation.trim(),
        specialty: params.specialty?.trim(),
        created_at: new Date().toISOString()
      });

      if (profileErr) {
        console.warn('Aviso insertando perfil en Supabase:', profileErr.message);
      }
    } catch {
      // ignore
    }
  }

  const newUser: AuthUser = {
    id: userId,
    email: params.email.trim(),
    name: params.name.trim(),
    role: params.role,
    affiliation: params.affiliation.trim(),
    specialty: params.specialty?.trim(),
    createdAt: new Date().toISOString()
  };

  return { user: newUser, error: null };
}

export async function deleteUserProfile(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error eliminando perfil en Supabase:', error);
    throw error;
  }
  return true;
}

export async function updateUserRole(userId: string, newRole: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    console.error('Error actualizando rol en Supabase:', error);
    throw error;
  }
  return true;
}
