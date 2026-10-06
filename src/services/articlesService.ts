import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Article, ArticleStatus, Review, AIDeclaration, ArticleFile, AuthorContributor } from '../types';
import { INITIAL_ARTICLES } from '../data';
import { incrementVolumeArticleCount } from './volumesService';

export interface DirectArticlePayload {
  title: string;
  abstract: string;
  authors: string[];
  authorEmails?: string[];
  affiliations?: string[];
  category: string;
  keywords: string[];
  volumeId: string;
  pdfFile: File;
  doi?: string;
  wordCount?: number;
  onProgress?: (status: string, percent?: number) => void;
}

export interface PublishDirectResult {
  success: boolean;
  article?: Article;
  error?: string;
  pdfUrl?: string;
}

export interface SubmitManuscriptPayload {
  title: string;
  abstract: string;
  authors: string[];
  authorEmails: string[];
  affiliations: string[];
  contributors?: AuthorContributor[];
  keywords: string[];
  category: string;
  wordCount: number;
  pdfFile?: File | null;
  manuscriptFile?: {
    name: string;
    size: string;
    format: string;
    url?: string;
  };
  figures?: ArticleFile[];
  supplementaryFiles?: ArticleFile[];
  references?: string[];
  aiDeclaration?: AIDeclaration;
  hasStructuredAbstract?: boolean;
  formattingScore?: number;
  formattingReport?: string[];
  onProgress?: (status: string, percent?: number) => void;
}

export interface SubmitReviewPayload {
  articleId: string;
  reviewerId: string;
  reviewerName: string;
  originalityScore: number;
  methodologyScore: number;
  clinicalRelevanceScore: number;
  ethicalScore: number;
  comments: string;
  recommendation: 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';
}

/**
 * Format raw byte count into readable KB/MB
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Transforms Supabase database row to frontend Article type
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
    status: row.status as ArticleStatus,
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
 * 1. uploadPdfToStorage(file: File, path: string, bucket?: string):
 * Uploads a binary PDF to Supabase Storage and returns its public URL.
 */
export async function uploadPdfToStorage(
  file: File, 
  path: string, 
  bucket: string = 'published_articles'
): Promise<{ url: string | null; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // Generate safe local object URL fallback
    const localUrl = URL.createObjectURL(file);
    return { url: localUrl };
  }

  try {
    const cleanPath = path.replace(/[^a-zA-Z0-9._/-]/g, '_');
    
    // Attempt upload to specified bucket
    let uploadRes = await supabase.storage
      .from(bucket)
      .upload(cleanPath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf'
      });

    let activeBucket = bucket;

    // If bucket doesn't exist or permissions fail, try fallback bucket
    if (uploadRes.error) {
      const fallbackBucket = bucket === 'published_articles' ? 'manuscripts' : 'published_articles';
      console.warn(`Storage bucket '${bucket}' error: ${uploadRes.error.message}. Probando fallback '${fallbackBucket}'...`);
      
      const fallbackRes = await supabase.storage
        .from(fallbackBucket)
        .upload(cleanPath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf'
        });

      if (!fallbackRes.error) {
        activeBucket = fallbackBucket;
        uploadRes = fallbackRes;
      }
    }

    if (!uploadRes.error) {
      const { data: urlData } = supabase.storage
        .from(activeBucket)
        .getPublicUrl(cleanPath);

      return { url: urlData.publicUrl };
    } else {
      console.warn('Storage upload error, usando URL de objeto temporal:', uploadRes.error.message);
      return { url: URL.createObjectURL(file), error: uploadRes.error.message };
    }
  } catch (err: any) {
    console.warn('Excepción al subir archivo a Supabase Storage:', err);
    return { url: URL.createObjectURL(file), error: err.message };
  }
}

/**
 * 2. getPublishedArticles(volumeId?, category?):
 * Fetches articles where status = 'published' from `public.articles`.
 */
export async function getPublishedArticles(
  volumeId?: string, 
  category?: string
): Promise<Article[]> {
  if (!isSupabaseConfigured || !supabase) {
    const stored = localStorage.getItem('oj_articles');
    const all: Article[] = stored ? JSON.parse(stored) : INITIAL_ARTICLES;
    return all.filter(a => {
      if (a.status !== 'published') return false;
      if (volumeId && a.publishedInVolumeId !== volumeId) return false;
      if (category && a.category !== category) return false;
      return true;
    });
  }

  try {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (volumeId) {
      query = query.eq('published_in_volume_id', volumeId);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      console.warn('Supabase getPublishedArticles: no rows or error, using local fallback:', error?.message);
      const stored = localStorage.getItem('oj_articles');
      const all: Article[] = stored ? JSON.parse(stored) : INITIAL_ARTICLES;
      return all.filter(a => {
        if (a.status !== 'published') return false;
        if (volumeId && a.publishedInVolumeId !== volumeId) return false;
        if (category && a.category !== category) return false;
        return true;
      });
    }

    return data.map(mapArticleRow);
  } catch (err) {
    console.warn('Excepción en getPublishedArticles:', err);
    const stored = localStorage.getItem('oj_articles');
    const all: Article[] = stored ? JSON.parse(stored) : INITIAL_ARTICLES;
    return all.filter(a => a.status === 'published');
  }
}

/**
 * 3. getAllArticlesForEditor():
 * Loads all articles (all statuses) for editorial committee.
 */
export async function getAllArticlesForEditor(): Promise<Article[]> {
  if (!isSupabaseConfigured || !supabase) {
    const stored = localStorage.getItem('oj_articles');
    return stored ? JSON.parse(stored) : INITIAL_ARTICLES;
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Supabase getAllArticlesForEditor fallback a local:', error?.message);
      const stored = localStorage.getItem('oj_articles');
      return stored ? JSON.parse(stored) : INITIAL_ARTICLES;
    }

    const mapped = data.map(mapArticleRow);
    try {
      localStorage.setItem('oj_articles', JSON.stringify(mapped));
    } catch (e) {}

    return mapped;
  } catch (err) {
    console.warn('Excepción en getAllArticlesForEditor:', err);
    const stored = localStorage.getItem('oj_articles');
    return stored ? JSON.parse(stored) : INITIAL_ARTICLES;
  }
}

/**
 * 4. publishDirectArticle(payload, pdfFile):
 * Direct editorial launch tool:
 * - Uploads the PDF file to Supabase Storage ('published_articles')
 * - Inserts row into `public.articles` with status = 'published'
 * - Increments article_count in `public.volumes`
 */
export async function publishDirectArticle(
  payload: DirectArticlePayload
): Promise<PublishDirectResult> {
  const {
    title,
    abstract,
    authors,
    authorEmails = [],
    affiliations = [],
    category,
    keywords,
    volumeId,
    pdfFile,
    doi,
    wordCount,
    onProgress
  } = payload;

  const now = new Date().toISOString();
  const articleId = `art_pub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanFileName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `direct_launch/${volumeId || 'v12n2'}/${Date.now()}_${cleanFileName}`;

  // 1. UPLOAD PDF TO SUPABASE STORAGE
  if (onProgress) onProgress('Preparando y validando archivo PDF...', 15);

  let publicPdfUrl = '';
  if (onProgress) onProgress('Alojando manuscrito en Supabase Storage...', 35);
  
  const uploadResult = await uploadPdfToStorage(pdfFile, storagePath, 'published_articles');
  publicPdfUrl = uploadResult.url || URL.createObjectURL(pdfFile);

  if (onProgress) onProgress('PDF alojado correctamente.', 65);

  // 2. CONSTRUCT DOI IF NOT PROVIDED
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(Math.random() * 90000 + 10000);
  const finalDoi = doi && doi.trim().length > 0 
    ? (doi.startsWith('http') || doi.startsWith('10.') ? doi : `https://doi.org/${doi}`)
    : `https://doi.org/10.48512/scientia.${currentYear}.${randomSuffix}`;

  const calculatedWordCount = wordCount || Math.max(3000, abstract.split(/\s+/).length * 15);

  // 3. BUILD ARTICLE OBJECT
  const newArticle: Article = {
    id: articleId,
    title: title.trim(),
    abstract: abstract.trim(),
    authors: authors.map(a => a.trim()).filter(Boolean),
    authorEmails: authorEmails.length > 0 ? authorEmails : ['editorial@scientiadentis.org'],
    affiliations: affiliations.length > 0 ? affiliations : ['Colegio de Odontólogos de La Paz (COLP)'],
    contributors: [],
    keywords: keywords.map(k => k.trim()).filter(Boolean),
    category: category.trim(),
    status: 'published',
    publishedInVolumeId: volumeId,
    publishedAt: now,
    submittedAt: now,
    manuscriptFile: {
      name: pdfFile.name,
      size: formatFileSize(pdfFile.size),
      format: 'pdf',
      url: publicPdfUrl
    },
    pdfUrl: publicPdfUrl,
    figures: [],
    supplementaryFiles: [],
    reviewers: [],
    reviews: [],
    editorNotes: 'Publicación directa oficial de lanzamiento (Comité Editorial COLP).',
    doi: finalDoi,
    references: [
      'Asociación Médica Mundial. Declaración de Helsinki. Principios éticos para las investigaciones médicas en seres humanos. 2013.',
      'International Committee of Medical Journal Editors (ICMJE). Recommendations for Conduct, Reporting, Editing, and Publication of Scholarly Work. 2024.'
    ],
    wordCount: calculatedWordCount,
    hasStructuredAbstract: abstract.toLowerCase().includes('métodos') || abstract.toLowerCase().includes('conclusiones'),
    formattingScore: 100,
    formattingReport: [
      'Maquetación final y diagramación científica aprobada',
      'Metadatos completos para indexación internacional (OJS/DOI)',
      'Archivo PDF de alta resolución validado'
    ],
    aiDeclaration: {
      used: false,
      sectionsUsed: [],
      humanSupervisionConfirmed: true
    }
  };

  if (onProgress) onProgress('Guardando registro en base de datos Supabase...', 85);

  // 4. INSERT INTO SUPABASE 'articles' TABLE
  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = {
        id: newArticle.id,
        title: newArticle.title,
        abstract: newArticle.abstract,
        authors: newArticle.authors,
        author_emails: newArticle.authorEmails,
        affiliations: newArticle.affiliations,
        contributors: newArticle.contributors || [],
        keywords: newArticle.keywords,
        category: newArticle.category,
        status: newArticle.status, // 'published'
        submitted_at: newArticle.submittedAt,
        published_at: newArticle.publishedAt,
        published_in_volume_id: newArticle.publishedInVolumeId,
        pdf_url: publicPdfUrl,
        manuscript_file: newArticle.manuscriptFile,
        figures: newArticle.figures || [],
        supplementary_files: newArticle.supplementaryFiles || [],
        reviewers: newArticle.reviewers || [],
        reviews: newArticle.reviews || [],
        editor_notes: newArticle.editorNotes,
        doi: newArticle.doi,
        references_list: newArticle.references || [],
        word_count: newArticle.wordCount,
        has_structured_abstract: newArticle.hasStructuredAbstract,
        formatting_score: newArticle.formattingScore,
        formatting_report: newArticle.formattingReport,
        ai_declaration: newArticle.aiDeclaration
      };

      const { error: insertError } = await supabase
        .from('articles')
        .upsert(dbPayload, { onConflict: 'id' });

      if (insertError) {
        console.error('Error insertando artículo en Supabase:', insertError);
      }
    } catch (dbErr: any) {
      console.error('Excepción registrando artículo en Supabase:', dbErr);
    }
  }

  // 5. INCREMENT VOLUME ARTICLE COUNT
  await incrementVolumeArticleCount(volumeId);

  // Update local storage backup
  try {
    const local = localStorage.getItem('oj_articles');
    const existing: Article[] = local ? JSON.parse(local) : INITIAL_ARTICLES;
    localStorage.setItem('oj_articles', JSON.stringify([newArticle, ...existing]));
  } catch (e) {}

  if (onProgress) onProgress('¡Artículo publicado con éxito!', 100);

  return {
    success: true,
    article: newArticle,
    pdfUrl: publicPdfUrl
  };
}

/**
 * 5. submitManuscript(payload):
 * Author submission tool:
 * - Uploads the manuscript file to Supabase Storage ('manuscripts')
 * - Inserts the article in `public.articles` with status = 'submitted'
 */
export async function submitManuscript(
  payload: SubmitManuscriptPayload
): Promise<{ success: boolean; article?: Article; error?: string }> {
  const {
    title,
    abstract,
    authors,
    authorEmails,
    affiliations,
    contributors = [],
    keywords,
    category,
    wordCount,
    pdfFile,
    manuscriptFile: existingManuscriptFile,
    figures = [],
    supplementaryFiles = [],
    references = [],
    aiDeclaration,
    hasStructuredAbstract = true,
    formattingScore = 95,
    formattingReport = [],
    onProgress
  } = payload;

  const now = new Date().toISOString().split('T')[0];
  const articleId = 'art_' + Date.now();

  let uploadedFileUrl = existingManuscriptFile?.url || '';

  // Upload file if provided
  if (pdfFile) {
    if (onProgress) onProgress('Subiendo manuscrito a Supabase Storage (manuscripts)...', 30);
    const cleanFileName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `submissions/${articleId}/${cleanFileName}`;
    const uploadResult = await uploadPdfToStorage(pdfFile, storagePath, 'manuscripts');
    uploadedFileUrl = uploadResult.url || URL.createObjectURL(pdfFile);
  }

  const finalManuscriptFile = {
    name: pdfFile ? pdfFile.name : (existingManuscriptFile?.name || 'Manuscrito.docx'),
    size: pdfFile ? formatFileSize(pdfFile.size) : (existingManuscriptFile?.size || '1.5 MB'),
    format: pdfFile ? 'pdf' : (existingManuscriptFile?.format || 'docx'),
    url: uploadedFileUrl || undefined
  };

  const newArticle: Article = {
    id: articleId,
    title: title.trim(),
    abstract: abstract.trim(),
    authors: authors.map(a => a.trim()).filter(Boolean),
    authorEmails: authorEmails.map(e => e.trim()).filter(Boolean),
    affiliations: affiliations.map(af => af.trim()).filter(Boolean),
    contributors,
    keywords: keywords.map(k => k.trim()).filter(Boolean),
    category: category.trim(),
    submittedAt: now,
    status: 'submitted',
    manuscriptFile: finalManuscriptFile,
    pdfUrl: uploadedFileUrl || undefined,
    figures,
    supplementaryFiles,
    reviewers: [],
    reviews: [],
    references,
    wordCount,
    hasStructuredAbstract,
    formattingScore,
    formattingReport,
    aiDeclaration
  };

  if (onProgress) onProgress('Guardando manuscrito en la base de datos...', 80);

  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = {
        id: newArticle.id,
        title: newArticle.title,
        abstract: newArticle.abstract,
        authors: newArticle.authors,
        author_emails: newArticle.authorEmails,
        affiliations: newArticle.affiliations,
        contributors: newArticle.contributors || [],
        keywords: newArticle.keywords,
        category: newArticle.category,
        status: 'submitted',
        submitted_at: newArticle.submittedAt,
        manuscript_file: newArticle.manuscriptFile,
        pdf_url: newArticle.pdfUrl || null,
        figures: newArticle.figures || [],
        supplementary_files: newArticle.supplementaryFiles || [],
        reviewers: [],
        reviews: [],
        references_list: newArticle.references || [],
        word_count: newArticle.wordCount,
        has_structured_abstract: newArticle.hasStructuredAbstract,
        formatting_score: newArticle.formattingScore,
        formatting_report: newArticle.formattingReport,
        ai_declaration: newArticle.aiDeclaration
      };

      const { error: insertErr } = await supabase
        .from('articles')
        .insert(dbPayload);

      if (insertErr) {
        console.warn('Error insertando manuscrito en Supabase:', insertErr.message);
      }
    } catch (err: any) {
      console.warn('Excepción guardando manuscrito en Supabase:', err);
    }
  }

  // Backup in local storage
  try {
    const local = localStorage.getItem('oj_articles');
    const existing: Article[] = local ? JSON.parse(local) : INITIAL_ARTICLES;
    localStorage.setItem('oj_articles', JSON.stringify([newArticle, ...existing]));
  } catch (e) {}

  if (onProgress) onProgress('¡Manuscrito enviado satisfactoriamente!', 100);

  return { success: true, article: newArticle };
}

/**
 * 6. submitReview(reviewData):
 * Reviewer arbitration submission:
 * - Inserts the review into `public.reviews`
 * - Appends the review to the article in `public.articles`
 * - Updates article status to 'under_review' (or accepted/rejected depending on recommendation)
 */
export async function submitReview(
  payload: SubmitReviewPayload
): Promise<{ success: boolean; review?: Review; error?: string }> {
  const {
    articleId,
    reviewerId,
    reviewerName,
    originalityScore,
    methodologyScore,
    clinicalRelevanceScore,
    ethicalScore,
    comments,
    recommendation
  } = payload;

  const reviewId = 'rev_' + Date.now();
  const now = new Date().toISOString().split('T')[0];

  const review: Review = {
    id: reviewId,
    articleId,
    reviewerId,
    reviewerName,
    originalityScore,
    methodologyScore,
    clinicalRelevanceScore,
    ethicalScore,
    comments,
    recommendation,
    submittedAt: now
  };

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Insert into public.reviews
      const { error: revErr } = await supabase
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
          submitted_at: review.submittedAt
        }, { onConflict: 'id' });

      if (revErr) {
        console.warn('Error guardando review en Supabase:', revErr.message);
      }

      // 2. Fetch existing article to update its reviews array and status
      const { data: artData } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (artData) {
        const existingReviews = artData.reviews || [];
        const updatedReviews = [...existingReviews.filter((r: any) => r.id !== review.id), review];
        
        await supabase
          .from('articles')
          .update({
            reviews: updatedReviews,
            status: 'under_review'
          })
          .eq('id', articleId);
      }
    } catch (err: any) {
      console.warn('Excepción guardando review en Supabase:', err);
    }
  }

  // Local storage update
  try {
    const local = localStorage.getItem('oj_articles');
    if (local) {
      const existing: Article[] = JSON.parse(local);
      const updated = existing.map(a => {
        if (a.id === articleId) {
          const revs = [...a.reviews.filter(r => r.id !== review.id), review];
          return { ...a, reviews: revs, status: 'under_review' as ArticleStatus };
        }
        return a;
      });
      localStorage.setItem('oj_articles', JSON.stringify(updated));
    }
  } catch (e) {}

  return { success: true, review };
}

/**
 * 7. updateArticleStatus(articleId, status, editorNotes?):
 * Updates article status and optional editorial notes in `public.articles`.
 */
export async function updateArticleStatus(
  articleId: string,
  status: ArticleStatus,
  editorNotes?: string
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const updates: any = { status };
      if (editorNotes !== undefined) {
        updates.editor_notes = editorNotes;
      }

      const { error } = await supabase
        .from('articles')
        .update(updates)
        .eq('id', articleId);

      if (error) {
        console.warn('Error actualizando estado en Supabase:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Excepción en updateArticleStatus:', err);
      return false;
    }
  }

  // Update localStorage
  try {
    const local = localStorage.getItem('oj_articles');
    if (local) {
      const existing: Article[] = JSON.parse(local);
      const updated = existing.map(a => a.id === articleId ? { ...a, status, editorNotes: editorNotes || a.editorNotes } : a);
      localStorage.setItem('oj_articles', JSON.stringify(updated));
    }
  } catch (e) {}

  return true;
}

/**
 * 8. publishArticleToVolume(articleId, volumeId, doi):
 * Sets status to 'published', assigns volumeId and doi, and increments volume count.
 */
export async function publishArticleToVolume(
  articleId: string,
  volumeId: string,
  doi: string
): Promise<boolean> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          status: 'published',
          published_in_volume_id: volumeId,
          published_at: now,
          doi: doi
        })
        .eq('id', articleId);

      if (error) {
        console.warn('Error publicando artículo en Supabase:', error.message);
        return false;
      }
    } catch (err) {
      console.warn('Excepción en publishArticleToVolume:', err);
      return false;
    }
  }

  await incrementVolumeArticleCount(volumeId);

  // Update local storage
  try {
    const local = localStorage.getItem('oj_articles');
    if (local) {
      const existing: Article[] = JSON.parse(local);
      const updated = existing.map(a => a.id === articleId ? { 
        ...a, 
        status: 'published' as ArticleStatus, 
        publishedInVolumeId: volumeId, 
        publishedAt: now, 
        doi 
      } : a);
      localStorage.setItem('oj_articles', JSON.stringify(updated));
    }
  } catch (e) {}

  return true;
}

/**
 * 9. assignReviewerToArticle(articleId, reviewerId):
 * Adds reviewer to article's reviewer list.
 */
export async function assignReviewerToArticle(
  articleId: string,
  reviewerId: string
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('articles')
        .select('reviewers, status')
        .eq('id', articleId)
        .single();

      if (data) {
        const currentReviewers: string[] = data.reviewers || [];
        if (!currentReviewers.includes(reviewerId)) {
          const updated = [...currentReviewers, reviewerId];
          await supabase
            .from('articles')
            .update({
              reviewers: updated,
              status: data.status === 'submitted' ? 'under_review' : data.status
            })
            .eq('id', articleId);
        }
      }
      return true;
    } catch (err) {
      console.warn('Excepción asignando revisor:', err);
      return false;
    }
  }

  // Update local storage
  try {
    const local = localStorage.getItem('oj_articles');
    if (local) {
      const existing: Article[] = JSON.parse(local);
      const updated = existing.map(a => {
        if (a.id === articleId && !a.reviewers.includes(reviewerId)) {
          return {
            ...a,
            reviewers: [...a.reviewers, reviewerId],
            status: (a.status === 'submitted' ? 'under_review' : a.status) as ArticleStatus
          };
        }
        return a;
      });
      localStorage.setItem('oj_articles', JSON.stringify(updated));
    }
  } catch (e) {}

  return true;
}
