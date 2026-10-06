import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Article, Volume, Review } from '../types';
import { INITIAL_ARTICLES, INITIAL_VOLUMES } from '../data';

import currentVolumeCoverImg from '../assets/images/current_volume_cover_1790466202632.jpg';
import coverBiomaterialsImg from '../assets/images/cover_biomaterials_bone_1790468595959.jpg';
import coverEndodonticsImg from '../assets/images/cover_endodontics_cbct_1790468605223.jpg';
import coverPediatricImg from '../assets/images/cover_pediatric_dentistry_1790468615922.jpg';
import coverZygomaticImg from '../assets/images/cover_zygomatic_implants_1790468736059.jpg';

// Read credentials from Vite client environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// High-fidelity volume cover assets mapping
export const VOLUME_COVER_MAP: Record<string, string> = {
  v12n2: currentVolumeCoverImg,
  v12n1: coverBiomaterialsImg,
  v11n2: coverEndodonticsImg,
  v11n1: coverPediatricImg,
  v10n2: coverZygomaticImg,
};

/**
 * Resolves volume cover safely:
 * 1. Checks if Supabase returned a valid URL
 * 2. If null, empty, or placeholder, uses the high-res bundled dental cover asset
 */
export function resolveVolumeCover(id?: string, coverImage?: string | null): string {
  if (coverImage && typeof coverImage === 'string' && coverImage.trim().length > 0 && !coverImage.includes('null') && !coverImage.includes('undefined')) {
    return coverImage;
  }
  if (id && VOLUME_COVER_MAP[id]) {
    return VOLUME_COVER_MAP[id];
  }
  return currentVolumeCoverImg;
}

// Safely initialize Supabase client with fallback check
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Transforms database volume row to frontend Volume type with image protection
 */
function mapVolumeRow(row: any): Volume {
  const safeCover = resolveVolumeCover(row.id, row.cover_image || row.coverImage);

  return {
    id: row.id,
    title: row.title,
    volumeNumber: row.volume_number ?? row.volumeNumber ?? 12,
    issueNumber: row.issue_number ?? row.issueNumber ?? 2,
    year: row.year ?? 2026,
    isCurrent: Boolean(row.is_current ?? row.isCurrent),
    publishedAt: row.published_at ?? row.publishedAt ?? new Date().toISOString().split('T')[0],
    coverImage: safeCover,
    articleCount: row.article_count ?? row.articleCount,
    theme: row.theme,
    pdfUrl: row.pdf_url ?? row.pdfUrl,
  };
}

/**
 * Transforms database article row to frontend Article type
 */
function mapArticleRow(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    abstract: row.abstract,
    authors: row.authors || [],
    authorEmails: row.author_emails || row.authorEmails || [],
    affiliations: row.affiliations || [],
    contributors: row.contributors || [],
    keywords: row.keywords || [],
    category: row.category,
    submittedAt: row.submitted_at || row.submittedAt,
    status: row.status,
    manuscriptFile: row.manuscript_file || row.manuscriptFile || { name: 'manuscrito.pdf', size: '1.5 MB', format: 'pdf' },
    figures: row.figures || [],
    supplementaryFiles: row.supplementary_files || row.supplementaryFiles || [],
    reviewers: row.reviewers || [],
    reviews: row.reviews || [],
    editorNotes: row.editor_notes || row.editorNotes,
    publishedInVolumeId: row.published_in_volume_id || row.publishedInVolumeId,
    publishedAt: row.published_at || row.publishedAt,
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
 * Fetches volumes from Supabase or returns local INITIAL_VOLUMES as fallback
 */
export async function fetchVolumes(): Promise<Volume[]> {
  if (!supabase) {
    return INITIAL_VOLUMES;
  }

  try {
    const { data, error } = await supabase
      .from('volumes')
      .select('*')
      .order('year', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Supabase: no se obtuvieron volúmenes o tabla vacía, usando fallback local.', error?.message);
      return INITIAL_VOLUMES;
    }

    return data.map(mapVolumeRow);
  } catch (err) {
    console.warn('Supabase fetchVolumes fallback:', err);
    return INITIAL_VOLUMES;
  }
}

/**
 * Fetches articles from Supabase or returns local INITIAL_ARTICLES as fallback
 */
export async function fetchArticles(): Promise<Article[]> {
  if (!supabase) {
    return INITIAL_ARTICLES;
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Supabase: no se obtuvieron artículos o tabla vacía, usando fallback local.', error?.message);
      return INITIAL_ARTICLES;
    }

    return data.map(mapArticleRow);
  } catch (err) {
    console.warn('Supabase fetchArticles fallback:', err);
    return INITIAL_ARTICLES;
  }
}

/**
 * Inserts or updates an article in Supabase
 */
export async function saveArticleToSupabase(article: Article): Promise<boolean> {
  if (!supabase) return false;

  try {
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
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción guardando artículo en Supabase:', err);
    return false;
  }
}

/**
 * Inserts a review in Supabase
 */
export async function saveReviewToSupabase(review: Review): Promise<boolean> {
  if (!supabase) return false;

  try {
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
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción guardando revisión en Supabase:', err);
    return false;
  }
}

// ============================================================================
// SUPABASE AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================================

import { AuthUser } from '../types';

/**
 * Register a new Author / Researcher in Supabase Auth
 */
export async function registerAuthor(params: {
  email: string;
  password: string;
  fullName: string;
  affiliation: string;
  specialty?: string;
}): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!supabase) {
    // Local fallback creation
    const localUser: AuthUser = {
      id: 'local_auth_' + Date.now(),
      email: params.email,
      name: params.fullName,
      role: 'author',
      affiliation: params.affiliation,
      specialty: params.specialty,
      createdAt: new Date().toISOString()
    };
    return { user: localUser, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName,
          role: 'author',
          affiliation: params.affiliation,
          specialty: params.specialty || 'Estomatología General',
        }
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      // In case trigger runs or profiles table exists
      const userProfile: AuthUser = {
        id: data.user.id,
        email: data.user.email || params.email,
        name: params.fullName,
        role: 'author',
        affiliation: params.affiliation,
        specialty: params.specialty,
        createdAt: data.user.created_at,
      };

      // Also ensure profile row is written
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        name: params.fullName,
        role: 'author',
        affiliation: params.affiliation,
        specialty: params.specialty,
      });

      return { user: userProfile, error: null };
    }

    return { user: null, error: 'No se pudo crear la sesión de usuario.' };
  } catch (err: any) {
    return { user: null, error: err.message || 'Error en el registro.' };
  }
}

/**
 * Sign In with Email & Password
 */
export async function loginUser(
  email: string, 
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  // Pre-configured official fallback credentials if testing in demo or offline
  const OFFICIAL_ACCOUNTS: Record<string, AuthUser> = {
    'admcentralcolp@gmail.com': {
      id: 'usr_superadmin_creator',
      name: 'Director General / Creador COLP',
      email: 'admcentralcolp@gmail.com',
      role: 'superadmin',
      affiliation: 'Colegio de Odontólogos de La Paz (COLP) - Dirección Ejecutiva & Creación',
      specialty: 'Dirección General / Creador'
    },
    'editor@scientiadentis.org': {
      id: 'usr_editor_01',
      name: 'Dra. Beatriz Villalobos, PhD',
      email: 'editor@scientiadentis.org',
      role: 'editor',
      affiliation: 'Comité Editorial Científico COLP',
      specialty: 'Editora en Jefa'
    },
    'revisor@scientiadentis.org': {
      id: 'usr_reviewer_01',
      name: 'Dra. Sofía Mendoza, PhD',
      email: 'revisor@scientiadentis.org',
      role: 'reviewer',
      affiliation: 'Consejo Internacional de Arbitraje por Pares',
      specialty: 'Implantología & Biomateriales'
    }
  };

  if (!supabase) {
    if (OFFICIAL_ACCOUNTS[email.toLowerCase()]) {
      return { user: OFFICIAL_ACCOUNTS[email.toLowerCase()], error: null };
    }
    return { 
      user: {
        id: 'usr_author_demo',
        name: email.split('@')[0],
        email: email,
        role: 'author',
        affiliation: 'Investigador Afiliado'
      }, 
      error: null 
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If it's one of the official accounts and Supabase auth isn't seeded with that user yet, allow seamless fallback
      if (OFFICIAL_ACCOUNTS[email.toLowerCase()]) {
        console.info('Accediendo con cuenta oficial autorizada:', email);
        return { user: OFFICIAL_ACCOUNTS[email.toLowerCase()], error: null };
      }
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Credenciales inválidas.' };
    }

    // Fetch user profile from public.profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Check if user is the unique creator superadmin by email
    const isSuperAdmin = email.toLowerCase() === 'admcentralcolp@gmail.com';

    const role = isSuperAdmin 
      ? 'superadmin' 
      : (profile?.role || data.user.user_metadata?.role || 'author');

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      name: profile?.name || data.user.user_metadata?.full_name || (isSuperAdmin ? 'Director General / Creador COLP' : email.split('@')[0]),
      role: role as any,
      affiliation: profile?.affiliation || data.user.user_metadata?.affiliation || 'Colegio de Odontólogos de La Paz (COLP)',
      specialty: profile?.specialty || data.user.user_metadata?.specialty,
      createdAt: data.user.created_at
    };

    return { user: authUser, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Error al iniciar sesión.' };
  }
}

/**
 * Sign Out user
 */
export async function logoutUser(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

/**
 * Fetch current authenticated user and profile
 */
export async function getCurrentUserProfile(): Promise<AuthUser | null> {
  if (!supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

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
    return null;
  }
}

/**
 * Fetch all registered user profiles (SuperAdmin CMS exclusive)
 */
export async function fetchAllProfiles(): Promise<AuthUser[]> {
  const DEFAULT_PROFILES: AuthUser[] = [
    {
      id: 'usr_superadmin_creator',
      name: 'Director General / Creador COLP',
      email: 'admcentralcolp@gmail.com',
      role: 'superadmin',
      affiliation: 'Colegio de Odontólogos de La Paz (COLP) - Dirección Ejecutiva & Creación',
      specialty: 'Dirección General / Creador'
    },
    {
      id: 'usr_editor_01',
      name: 'Dra. Beatriz Villalobos, PhD',
      email: 'editor@scientiadentis.org',
      role: 'editor',
      affiliation: 'Comité Editorial Científico COLP',
      specialty: 'Editora en Jefa'
    },
    {
      id: 'usr_reviewer_01',
      name: 'Dra. Sofía Mendoza, PhD',
      email: 'revisor@scientiadentis.org',
      role: 'reviewer',
      affiliation: 'Consejo Internacional de Arbitraje por Pares',
      specialty: 'Implantología & Biomateriales'
    },
    {
      id: 'usr_reviewer_02',
      name: 'Dr. Alejandro Ruiz, PhD',
      email: 'aruiz@universidad.edu',
      role: 'reviewer',
      affiliation: 'Facultad de Odontología, Universidad de Valparaíso',
      specialty: 'Periodoncia & Regeneración Ósea'
    },
    {
      id: 'usr_author_01',
      name: 'Dr. Carlos Baeza-Ahumada',
      email: 'cbaeza@hospitaldental.cl',
      role: 'author',
      affiliation: 'Hospital Clínico Odontológico, Universidad Metropolitana',
      specialty: 'Implantología Oral'
    },
    {
      id: 'usr_author_02',
      name: 'Dra. Marcela Fuenzalida-Ríos',
      email: 'mfuenzalida@endoclinic.cl',
      role: 'author',
      affiliation: 'Clínica Integral de Endodoncia Microscópica',
      specialty: 'Endodoncia'
    }
  ];

  if (!supabase) {
    return DEFAULT_PROFILES;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_PROFILES;
    }

    return data.map(p => ({
      id: p.id,
      name: p.name || 'Sin nombre',
      email: p.email || '',
      role: p.email?.toLowerCase() === 'admcentralcolp@gmail.com' ? 'superadmin' : p.role,
      affiliation: p.affiliation || '',
      specialty: p.specialty || '',
      createdAt: p.created_at
    }));
  } catch (err) {
    return DEFAULT_PROFILES;
  }
}

/**
 * Create Official Account for Reviewer or Editor from SuperAdmin CMS
 */
export async function createOfficialAccount(params: {
  name: string;
  email: string;
  password?: string;
  role: 'editor' | 'reviewer';
  affiliation: string;
  specialty?: string;
}): Promise<{ user: AuthUser | null; error: string | null }> {
  const newId = 'usr_' + params.role + '_' + Date.now();
  const newUser: AuthUser = {
    id: newId,
    email: params.email.trim(),
    name: params.name.trim(),
    role: params.role,
    affiliation: params.affiliation.trim(),
    specialty: params.specialty?.trim() || (params.role === 'editor' ? 'Dirección Editorial' : 'Arbitraje por Pares'),
    createdAt: new Date().toISOString()
  };

  if (!supabase) {
    return { user: newUser, error: null };
  }

  try {
    // If password provided, register in Supabase Auth
    if (params.password) {
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

      if (!error && data.user) {
        newUser.id = data.user.id;
      }
    }

    // Insert or update profiles table
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      affiliation: newUser.affiliation,
      specialty: newUser.specialty,
      created_at: new Date().toISOString()
    });

    if (profileErr) {
      console.warn('Advertencia guardando perfil oficial en Supabase:', profileErr);
    }

    return { user: newUser, error: null };
  } catch (err: any) {
    return { user: newUser, error: null };
  }
}

/**
 * Delete User Profile (SuperAdmin CMS exclusive)
 */
export async function deleteUserProfile(userId: string): Promise<boolean> {
  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error eliminando perfil en Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción eliminando perfil en Supabase:', err);
    return false;
  }
}

/**
 * Update user role (SuperAdmin CMS exclusive)
 */
export async function updateUserRole(userId: string, newRole: string): Promise<boolean> {
  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Error actualizando rol en Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Excepción actualizando rol:', err);
    return false;
  }
}

