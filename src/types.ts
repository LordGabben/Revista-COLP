export type UserRole = 'reader' | 'author' | 'editor' | 'reviewer' | 'superadmin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  affiliation?: string;
  specialty?: string;
  createdAt?: string;
}

export interface EditorialMember {
  id: string;
  name: string;
  role: string;
  institution: string;
  country: string;
  specialty: string;
  category?: 'editorial' | 'advisory';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  affiliation: string;
  specialty?: string;
}

export interface Review {
  id: string;
  articleId: string;
  reviewerId: string;
  reviewerName: string;
  originalityScore: number; // 1-5
  methodologyScore: number; // 1-5
  clinicalRelevanceScore: number; // 1-5
  ethicalScore: number; // 1-5
  comments: string;
  recommendation: 'accept' | 'minor_revisions' | 'major_revisions' | 'reject';
  submittedAt: string;
}

export type ArticleStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'revisions_required' 
  | 'accepted' 
  | 'rejected' 
  | 'published';

export interface AIDeclaration {
  used: boolean;
  sectionsUsed: string[];
  toolsAndScope?: string;
  humanSupervisionConfirmed: boolean;
}

export interface ArticleFile {
  id: string;
  name: string;
  type: 'manuscript' | 'figure' | 'supplementary' | 'ethics' | 'title_page' | 'dataset';
  format: string; // 'docx' | 'pdf' | 'tiff' | 'eps' | 'jpg' | 'png' | 'xlsx'
  size: string;
  dpi?: number; // e.g. 300, 600 for high-resolution scientific figures
  figureNumber?: string; // e.g. "Figura 1", "Figura 2"
  caption?: string; // e.g. "Microfotografía SEM del sellado apical a 2000x"
  uploadedAt: string;
}

export type AuthorRoleType = 
  | 'primary' // Primer Autor / Autor Principal
  | 'corresponding' // Autor de Correspondencia
  | 'coauthor' // Coautor / Investigador
  | 'senior' // Autor Senior / Director de Investigación
  | 'methodologist' // Metodólogo / Bioestadístico
  | 'collaborator'; // Colaborador Clínico

export interface AuthorContributor {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  role: AuthorRoleType;
  isCorresponding: boolean;
  orcid?: string;
}

export interface Article {
  id: string;
  title: string;
  abstract: string; // Structured: Introducción, Métodos, Resultados, Conclusiones
  authors: string[];
  authorEmails: string[];
  affiliations: string[];
  contributors?: AuthorContributor[];
  keywords: string[];
  category: string;
  submittedAt: string;
  status: ArticleStatus;
  manuscriptFile: {
    name: string;
    size: string;
    format?: string; // 'docx' | 'pdf' | 'odt'
    url?: string;
  };
  figures?: ArticleFile[];
  supplementaryFiles?: ArticleFile[];
  reviewers: string[]; // List of reviewer UIDs assigned
  reviews: Review[];
  editorNotes?: string;
  publishedInVolumeId?: string;
  publishedAt?: string;
  pdfUrl?: string;
  doi?: string;
  references: string[];
  wordCount: number;
  hasStructuredAbstract: boolean;
  formattingScore: number; // Percentage check
  formattingReport: string[];
  aiDeclaration?: AIDeclaration;
}

export interface Volume {
  id: string;
  title: string;
  volumeNumber: number;
  issueNumber: number;
  year: number;
  isCurrent: boolean;
  publishedAt: string;
  coverImage?: string;
  articleCount?: number;
  pdfUrl?: string;
  theme?: string;
}

export interface JournalConfig {
  name: string;
  shortName: string;
  issn?: string;
  description: string;
  institution: string;
  editorInChief: string;
}

export type InstitutionalModalType = 'privacy' | 'terms' | 'guidelines' | 'about' | null;
