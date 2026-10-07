import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  UserCheck, 
  Key, 
  Lock, 
  Award, 
  ClipboardCheck, 
  PenTool, 
  GraduationCap, 
  Search, 
  Filter, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  Eye,
  Settings,
  Sparkles,
  BookOpen,
  ArrowRight,
  UserPlus,
  Trash2,
  Edit3,
  PlusCircle,
  Building,
  Globe2,
  X,
  Crown,
  RotateCcw,
  Zap,
  Database,
  FileText,
  UploadCloud,
  Image as ImageIcon,
  FileCheck,
  Layers,
  FileUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FolderPlus,
  Paperclip,
  Download,
  Landmark,
  Calendar,
  CheckSquare,
  Handshake
} from 'lucide-react';
import { AuthUser, UserRole, Article, EditorialMember, Volume, ArticleFile, ArticleStatus, Partner } from '../types';
import { 
  fetchAllProfiles, 
  updateUserRole, 
  createOfficialAccount, 
  deleteUserProfile,
  saveArticleToSupabase,
  deleteArticleFromSupabase,
  resolveVolumeCover
} from '../lib/supabase';
import { 
  EDITORIAL_BOARD_MEMBERS, 
  INDEXING_SYSTEMS, 
  DENTAL_CATEGORIES,
  coverBiomaterialsImg, 
  coverEndodonticsImg, 
  coverPediatricImg, 
  coverZygomaticImg 
} from '../data';
import { uploadPdfToStorage, formatFileSize } from '../services/articlesService';
import { 
  updateVolumeDetails, 
  createVolume, 
  setCurrentActiveVolume, 
  getVolumes 
} from '../services/volumesService';
import { 
  getEditorialBoard,
  updateEditorialMember, 
  addEditorialMember, 
  deleteEditorialMember 
} from '../services/editorialService';
import { 
  getPartners, 
  addPartner, 
  updatePartner, 
  deletePartner 
} from '../services/partnersService';
import { DEFAULT_INSTITUTIONAL_PRESENTATION } from './CoverHero';
import DirectPublishModal from './DirectPublishModal';

// High-fidelity fallback cover mappings per dental discipline
const CATEGORY_DEFAULT_COVERS: Record<string, string> = {
  'Implantología': coverZygomaticImg,
  'Cirugía Bucal': coverZygomaticImg,
  'Cirugía Maxilofacial': coverZygomaticImg,
  'Endodoncia': coverEndodonticsImg,
  'Odontopediatría': coverPediatricImg,
  'Periodoncia': coverBiomaterialsImg,
  'Biomateriales': coverBiomaterialsImg,
  'Ortodoncia': coverBiomaterialsImg,
  'Rehabilitación Oral': coverBiomaterialsImg,
  'Patología Bucal': coverEndodonticsImg,
  'Odontología General': coverBiomaterialsImg,
};

function getArticleCoverPreview(article: Article): string {
  if (article.cover_image_url && article.cover_image_url.trim().length > 0) {
    return article.cover_image_url;
  }
  return CATEGORY_DEFAULT_COVERS[article.category] || coverBiomaterialsImg;
}

interface SuperAdminCMSProps {
  currentUser: AuthUser;
  articles: Article[];
  volumes?: Volume[];
  onSwitchPerspective: (role: UserRole) => void;
  editorialBoard: EditorialMember[];
  onUpdateEditorialBoard: (updated: EditorialMember[]) => void;
  onRefreshEditorialBoard?: () => Promise<void>;
  onOpenEditorialModal?: () => void;
  onDirectPublishSuccess?: (newArticle: Article) => void;
  onUpdateArticle?: (updatedArticle: Article) => Promise<void> | void;
  onDeleteArticle?: (articleId: string) => Promise<void> | void;
  onUpdateVolumeSuccess?: (updatedVolume: Volume) => void;
  onCreateVolumeSuccess?: (newVolume: Volume) => void;
  onRefreshVolumes?: () => Promise<Volume[]>;
  supabaseAlert?: { type: 'success' | 'error'; message: string; details?: string } | null;
  onRefreshSupabaseData?: () => Promise<void>;
}

export default function SuperAdminCMS({
  currentUser,
  articles,
  volumes = [],
  onSwitchPerspective,
  editorialBoard,
  onUpdateEditorialBoard,
  onRefreshEditorialBoard,
  onOpenEditorialModal,
  onDirectPublishSuccess,
  onUpdateArticle,
  onDeleteArticle,
  onUpdateVolumeSuccess,
  onCreateVolumeSuccess,
  onRefreshVolumes,
  supabaseAlert,
  onRefreshSupabaseData
}: SuperAdminCMSProps) {
  // Navigation Tabs inside CMS
  const [activeTab, setActiveTab] = useState<'articles' | 'volume_management' | 'users' | 'editorial_board' | 'partners' | 'indexing' | 'audit'>('articles');
  const [isDirectPublishModalOpen, setIsDirectPublishModalOpen] = useState(false);

  // Article Management State
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [articleStatusFilter, setArticleStatusFilter] = useState<'all' | ArticleStatus>('all');
  const [articleVolumeFilter, setArticleVolumeFilter] = useState<'all' | string>('all');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<'all' | string>('all');

  // Edit Article & Correct Files Modal State
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editModalTab, setEditModalTab] = useState<'files' | 'metadata'>('files');

  // Form Fields for Editing
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editVolumeId, setEditVolumeId] = useState('');
  const [editStatus, setEditStatus] = useState<ArticleStatus>('published');
  const [editDoi, setEditDoi] = useState('');
  const [editAuthors, setEditAuthors] = useState('');
  const [editAffiliation, setEditAffiliation] = useState('');
  const [editAbstract, setEditAbstract] = useState('');
  const [editKeywords, setEditKeywords] = useState('');
  const [editEditorNotes, setEditEditorNotes] = useState('');
  const [editWordCount, setEditWordCount] = useState<number>(3500);

  // PDF replacement state
  const [editCurrentPdfUrl, setEditCurrentPdfUrl] = useState<string>('');
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);

  // Cover image replacement state
  const [editCurrentCoverUrl, setEditCurrentCoverUrl] = useState<string | null>(null);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null);
  const [coverMarkedForRemoval, setCoverMarkedForRemoval] = useState(false);

  // Figures state
  const [editFigures, setEditFigures] = useState<ArticleFile[]>([]);
  const [newFigureFile, setNewFigureFile] = useState<File | null>(null);
  const [newFigureNumber, setNewFigureNumber] = useState('Figura 1');
  const [newFigureCaption, setNewFigureCaption] = useState('');

  // Supplementary files state
  const [editSupplementary, setEditSupplementary] = useState<ArticleFile[]>([]);
  const [newSuppFile, setNewSuppFile] = useState<File | null>(null);
  const [newSuppName, setNewSuppName] = useState('');

  // Saving & Upload Progress
  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const [savingProgressText, setSavingProgressText] = useState('');
  const [savingProgressPercent, setSavingProgressPercent] = useState(0);

  // Delete article confirmation state
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [isDeletingArticle, setIsDeletingArticle] = useState(false);

  // Indexing Systems & Databases State (CMS Super Admin Exclusive)
  const [indexingList, setIndexingList] = useState(INDEXING_SYSTEMS);
  const [showAddIndexModal, setShowAddIndexModal] = useState(false);
  const [newIndexName, setNewIndexName] = useState('');
  const [newIndexStatus, setNewIndexStatus] = useState('En Evaluación');
  const [newIndexCategory, setNewIndexCategory] = useState('Internacional');
  const [newIndexDescription, setNewIndexDescription] = useState('');

  // User Management State
  const [profiles, setProfiles] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Create Official Account Modal (Only for Reviewer or Editor)
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccRole, setNewAccRole] = useState<'reviewer' | 'editor'>('reviewer');
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('');
  const [newAccAffiliation, setNewAccAffiliation] = useState('Colegio de Odontólogos de La Paz (COLP)');
  const [newAccSpecialty, setNewAccSpecialty] = useState('Implantología Oral');
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Delete User Confirmation
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Editorial Member Modal (Add or Edit)
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memName, setMemName] = useState('');
  const [memRole, setMemRole] = useState('');
  const [memInstitution, setMemInstitution] = useState('');
  const [memCountry, setMemCountry] = useState('Bolivia');
  const [memSpecialty, setMemSpecialty] = useState('');
  const [memCategory, setMemCategory] = useState<'editorial' | 'advisory'>('editorial');
  const [editorialFilter, setEditorialFilter] = useState<'all' | 'editorial' | 'advisory'>('all');

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackNotice({ text, type });
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  // =========================================================================
  // GESTIÓN DEL VOLUMEN Y PORTADA (ESTADOS Y MANEJADORES)
  // =========================================================================
  const activeVolume = volumes.find(v => v.isCurrent) || volumes[0];
  const [selectedVolId, setSelectedVolId] = useState<string>(activeVolume?.id || 'v1n1');
  const currentSelectedVol = volumes.find(v => v.id === selectedVolId) || activeVolume;

  // Campos de edición del volumen seleccionado
  const [volTitle, setVolTitle] = useState(currentSelectedVol?.title || '');
  const [volVolumeNumber, setVolVolumeNumber] = useState<number>(currentSelectedVol?.volumeNumber || 1);
  const [volIssueNumber, setVolIssueNumber] = useState<number>(currentSelectedVol?.issueNumber || 1);
  const [volYear, setVolYear] = useState<number>(currentSelectedVol?.year || 2026);
  const [volPublishedAt, setVolPublishedAt] = useState<string>(currentSelectedVol?.publishedAt || '2026-01-15');
  const [volTheme, setVolTheme] = useState<string>(currentSelectedVol?.theme || '');
  const [volInstitutionalPresentation, setVolInstitutionalPresentation] = useState<string>(
    currentSelectedVol?.institutional_presentation || currentSelectedVol?.institutionalPresentation || DEFAULT_INSTITUTIONAL_PRESENTATION
  );
  const [newVolCoverFile, setNewVolCoverFile] = useState<File | null>(null);
  const [newVolCoverPreview, setNewVolCoverPreview] = useState<string | null>(null);
  const [isSavingVolume, setIsSavingVolume] = useState(false);
  const [volSavingProgress, setVolSavingProgress] = useState('');

  // Sincronizar campos al cambiar el volumen seleccionado
  useEffect(() => {
    if (currentSelectedVol) {
      setVolTitle(currentSelectedVol.title);
      setVolVolumeNumber(currentSelectedVol.volumeNumber);
      setVolIssueNumber(currentSelectedVol.issueNumber);
      setVolYear(currentSelectedVol.year);
      setVolPublishedAt(currentSelectedVol.publishedAt);
      setVolTheme(currentSelectedVol.theme || '');
      setVolInstitutionalPresentation(
        currentSelectedVol.institutional_presentation || currentSelectedVol.institutionalPresentation || DEFAULT_INSTITUTIONAL_PRESENTATION
      );
      setNewVolCoverFile(null);
      if (newVolCoverPreview) {
        URL.revokeObjectURL(newVolCoverPreview);
        setNewVolCoverPreview(null);
      }
    }
  }, [selectedVolId, volumes]);

  // Formulario de creación de nuevo volumen
  const [showCreateVolModal, setShowCreateVolModal] = useState(false);
  const [newVolId, setNewVolId] = useState(`v1n${(volumes.length || 1) + 1}`);
  const [newVolTitle, setNewVolTitle] = useState(`Vol. 1 Núm. ${(volumes.length || 1) + 1} (2026): Scientia Dentis - Innovación Estomatológica`);
  const [newVolVolumeNumber, setNewVolVolumeNumber] = useState<number>(1);
  const [newVolIssueNumber, setNewVolIssueNumber] = useState<number>((volumes.length || 1) + 1);
  const [newVolYear, setNewVolYear] = useState<number>(2026);
  const [newVolPublishedAt, setNewVolPublishedAt] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newVolTheme, setNewVolTheme] = useState('Odontología Multidisciplinaria & Investigación Clínica');
  const [newVolInstitutionalPresentation, setNewVolInstitutionalPresentation] = useState(DEFAULT_INSTITUTIONAL_PRESENTATION);
  const [newVolIsCurrent, setNewVolIsCurrent] = useState(true);
  const [createVolCoverFile, setCreateVolCoverFile] = useState<File | null>(null);
  const [createVolCoverPreview, setCreateVolCoverPreview] = useState<string | null>(null);
  const [isCreatingVol, setIsCreatingVol] = useState(false);
  const [createVolProgress, setCreateVolProgress] = useState('');

  // Manejo de archivo de portada para volumen existente
  const handleVolCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      showNotification('Formato de portada no compatible. Use PNG, JPG o WEBP.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showNotification('La imagen de portada no debe superar los 10 MB.', 'error');
      return;
    }

    if (newVolCoverPreview) URL.revokeObjectURL(newVolCoverPreview);
    setNewVolCoverFile(file);
    setNewVolCoverPreview(URL.createObjectURL(file));
  };

  // Manejo de archivo de portada para nuevo volumen
  const handleCreateVolCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      showNotification('Formato de portada no compatible. Use PNG, JPG o WEBP.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showNotification('La imagen de portada no debe superar los 10 MB.', 'error');
      return;
    }

    if (createVolCoverPreview) URL.revokeObjectURL(createVolCoverPreview);
    setCreateVolCoverFile(file);
    setCreateVolCoverPreview(URL.createObjectURL(file));
  };

  // Guardar cambios en el volumen seleccionado
  const handleSaveVolumeDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentSelectedVol) return;

    setIsSavingVolume(true);
    setVolSavingProgress('Subiendo portada a Supabase Storage y actualizando public.volumes...');

    try {
      const updates: Partial<Volume> = {
        title: volTitle.trim(),
        volumeNumber: Number(volVolumeNumber),
        issueNumber: Number(volIssueNumber),
        year: Number(volYear),
        publishedAt: volPublishedAt,
        theme: volTheme.trim() || undefined,
        institutional_presentation: volInstitutionalPresentation.trim() || DEFAULT_INSTITUTIONAL_PRESENTATION
      };

      const updated = await updateVolumeDetails(currentSelectedVol.id, updates, newVolCoverFile || undefined);

      if (onUpdateVolumeSuccess) {
        onUpdateVolumeSuccess(updated);
      }
      if (onRefreshVolumes) {
        await onRefreshVolumes();
      }

      setNewVolCoverFile(null);
      if (newVolCoverPreview) {
        URL.revokeObjectURL(newVolCoverPreview);
        setNewVolCoverPreview(null);
      }

      showNotification('✅ ¡Volumen y portada actualizados exitosamente en Supabase! La portada pública y los datos editoriales se han refrescado en tiempo real.');
    } catch (err: any) {
      console.error('Error al actualizar volumen:', err);
      showNotification(`Error al guardar cambios: ${err.message || String(err)}`, 'error');
    } finally {
      setIsSavingVolume(false);
      setVolSavingProgress('');
    }
  };

  // Conmutar volumen activo
  const handleSwitchActiveVolume = async (targetId: string) => {
    setIsSavingVolume(true);
    try {
      await setCurrentActiveVolume(targetId);
      const targetVol = volumes.find(v => v.id === targetId);
      if (targetVol && onUpdateVolumeSuccess) {
        onUpdateVolumeSuccess({ ...targetVol, isCurrent: true });
      }
      if (onRefreshVolumes) {
        await onRefreshVolumes();
      }
      setSelectedVolId(targetId);
      showNotification(`✅ Fascículo "${targetVol?.title || targetId}" establecido como Volumen Activo en Portada.`);
    } catch (err: any) {
      console.error('Error al cambiar volumen activo:', err);
      showNotification(`Error al conmutar volumen: ${err.message || String(err)}`, 'error');
    } finally {
      setIsSavingVolume(false);
    }
  };

  // Crear nuevo volumen en Supabase
  const handleCreateNewVolumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVolId.trim() || !newVolTitle.trim()) {
      showNotification('Por favor complete el identificador y título del volumen.', 'error');
      return;
    }

    setIsCreatingVol(true);
    setCreateVolProgress('Subiendo portada a Supabase Storage y registrando nuevo volumen...');

    try {
      const cleanId = newVolId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
      const volumeData: Volume = {
        id: cleanId,
        title: newVolTitle.trim(),
        volumeNumber: Number(newVolVolumeNumber),
        issueNumber: Number(newVolIssueNumber),
        year: Number(newVolYear),
        isCurrent: newVolIsCurrent,
        publishedAt: newVolPublishedAt,
        theme: newVolTheme.trim() || undefined,
        articleCount: 0,
        institutional_presentation: newVolInstitutionalPresentation.trim() || DEFAULT_INSTITUTIONAL_PRESENTATION
      };

      const created = await createVolume(volumeData, createVolCoverFile || undefined);

      if (onCreateVolumeSuccess) {
        onCreateVolumeSuccess(created);
      }
      if (onRefreshVolumes) {
        await onRefreshVolumes();
      }

      setSelectedVolId(created.id);
      setShowCreateVolModal(false);
      setCreateVolCoverFile(null);
      if (createVolCoverPreview) {
        URL.revokeObjectURL(createVolCoverPreview);
        setCreateVolCoverPreview(null);
      }

      showNotification(`✅ Nuevo volumen "${created.title}" creado y guardado exitosamente en Supabase.`);
    } catch (err: any) {
      console.error('Error creando volumen:', err);
      showNotification(`Error al crear volumen: ${err.message || String(err)}`, 'error');
    } finally {
      setIsCreatingVol(false);
      setCreateVolProgress('');
    }
  };

  // Open Article Edit Modal
  const handleOpenEditArticle = (art: Article) => {
    setEditingArticle(art);
    setEditModalTab('files');
    setEditTitle(art.title);
    setEditCategory(art.category);
    setEditVolumeId(art.publishedInVolumeId || 'v1n1');
    setEditStatus(art.status);
    setEditDoi(art.doi || '');
    setEditAuthors(art.authors.join(', '));
    setEditAffiliation(art.affiliations?.[0] || '');
    setEditAbstract(art.abstract);
    setEditKeywords(art.keywords.join(', '));
    setEditEditorNotes(art.editorNotes || '');
    setEditWordCount(art.wordCount || 3500);

    setEditCurrentPdfUrl(art.pdfUrl || art.manuscriptFile?.url || '');
    setNewPdfFile(null);

    setEditCurrentCoverUrl(art.cover_image_url || null);
    setNewCoverFile(null);
    setNewCoverPreview(null);
    setCoverMarkedForRemoval(false);

    setEditFigures(art.figures ? [...art.figures] : []);
    setNewFigureFile(null);
    setNewFigureNumber(`Figura ${(art.figures?.length || 0) + 1}`);
    setNewFigureCaption('');

    setEditSupplementary(art.supplementaryFiles ? [...art.supplementaryFiles] : []);
    setNewSuppFile(null);
    setNewSuppName('');
  };

  // Save Article Edits & Uploaded Files
  const handleSaveArticleEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    setIsSavingArticle(true);
    setSavingProgressPercent(10);
    setSavingProgressText('Iniciando procesamiento de cambios...');

    try {
      let finalPdfUrl = editCurrentPdfUrl;
      let finalManuscriptName = editingArticle.manuscriptFile?.name || 'manuscrito.pdf';
      let finalManuscriptSize = editingArticle.manuscriptFile?.size || '2.1 MB';

      // 1. Upload new PDF if selected
      if (newPdfFile) {
        setSavingProgressPercent(30);
        setSavingProgressText('Subiendo nuevo PDF a Supabase Storage...');
        const cleanName = newPdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const pdfPath = `direct_launch/${editVolumeId || 'v1n1'}/${Date.now()}_${cleanName}`;
        const uploadRes = await uploadPdfToStorage(newPdfFile, pdfPath, 'published_articles');
        finalPdfUrl = uploadRes.url;
        finalManuscriptName = newPdfFile.name;
        finalManuscriptSize = formatFileSize(newPdfFile.size);
      }

      // 2. Upload new cover image or handle removal
      let finalCoverUrl: string | undefined = coverMarkedForRemoval ? undefined : (editCurrentCoverUrl || undefined);
      if (newCoverFile && !coverMarkedForRemoval) {
        setSavingProgressPercent(55);
        setSavingProgressText('Subiendo imagen de portada ilustrativa...');
        const cleanCover = newCoverFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const coverPath = `covers/${Date.now()}_${cleanCover}`;
        try {
          let coverRes;
          try {
            coverRes = await uploadPdfToStorage(newCoverFile, coverPath, 'covers');
          } catch {
            coverRes = await uploadPdfToStorage(newCoverFile, coverPath, 'published_articles');
          }
          finalCoverUrl = coverRes.url;
        } catch (cErr) {
          console.warn('Advertencia al subir portada:', cErr);
        }
      }

      // 3. Upload new figure if selected
      const updatedFigures = [...editFigures];
      if (newFigureFile) {
        setSavingProgressPercent(75);
        setSavingProgressText('Subiendo figura científica...');
        const cleanFig = newFigureFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const figPath = `figures/${editingArticle.id}/${Date.now()}_${cleanFig}`;
        try {
          await uploadPdfToStorage(newFigureFile, figPath, 'published_articles');
          const newFigItem: ArticleFile = {
            id: `fig_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: newFigureFile.name,
            type: 'figure',
            format: newFigureFile.name.split('.').pop() || 'jpg',
            size: formatFileSize(newFigureFile.size),
            figureNumber: newFigureNumber || `Figura ${updatedFigures.length + 1}`,
            caption: newFigureCaption || newFigureFile.name,
            uploadedAt: new Date().toISOString()
          };
          updatedFigures.push(newFigItem);
        } catch (fErr) {
          console.warn('Advertencia subiendo figura:', fErr);
        }
      }

      // 4. Upload new supplementary file if selected
      const updatedSupplementary = [...editSupplementary];
      if (newSuppFile) {
        setSavingProgressPercent(85);
        setSavingProgressText('Subiendo material suplementario...');
        const cleanSupp = newSuppFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const suppPath = `supplementary/${editingArticle.id}/${Date.now()}_${cleanSupp}`;
        try {
          await uploadPdfToStorage(newSuppFile, suppPath, 'published_articles');
          const newSuppItem: ArticleFile = {
            id: `supp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: newSuppName || newSuppFile.name,
            type: 'supplementary',
            format: newSuppFile.name.split('.').pop() || 'pdf',
            size: formatFileSize(newSuppFile.size),
            uploadedAt: new Date().toISOString()
          };
          updatedSupplementary.push(newSuppItem);
        } catch (sErr) {
          console.warn('Advertencia subiendo suplementario:', sErr);
        }
      }

      setSavingProgressPercent(92);
      setSavingProgressText('Guardando en base de datos Supabase...');

      const authorsArray = editAuthors
        .split(/[,;\n]/)
        .map(a => a.trim())
        .filter(Boolean);

      const keywordsArray = editKeywords
        .split(/[,;]/)
        .map(k => k.trim())
        .filter(Boolean);

      const updatedArticle: Article = {
        ...editingArticle,
        title: editTitle.trim(),
        category: editCategory.trim(),
        publishedInVolumeId: editVolumeId,
        status: editStatus,
        doi: editDoi.trim() || undefined,
        authors: authorsArray.length > 0 ? authorsArray : editingArticle.authors,
        affiliations: editAffiliation.trim() ? [editAffiliation.trim()] : editingArticle.affiliations,
        abstract: editAbstract.trim(),
        keywords: keywordsArray.length > 0 ? keywordsArray : editingArticle.keywords,
        editorNotes: editEditorNotes.trim() || undefined,
        wordCount: editWordCount,
        pdfUrl: finalPdfUrl,
        cover_image_url: finalCoverUrl,
        manuscriptFile: {
          ...editingArticle.manuscriptFile,
          name: finalManuscriptName,
          size: finalManuscriptSize,
          url: finalPdfUrl,
          format: 'pdf'
        },
        figures: updatedFigures,
        supplementaryFiles: updatedSupplementary
      };

      if (onUpdateArticle) {
        await onUpdateArticle(updatedArticle);
      } else {
        await saveArticleToSupabase(updatedArticle);
      }

      setSavingProgressPercent(100);
      showNotification('Artículo y archivos actualizados con éxito en Supabase.', 'success');
      setEditingArticle(null);
    } catch (err: any) {
      console.error('Error al actualizar artículo:', err);
      showNotification(`Error: ${err.message || String(err)}`, 'error');
    } finally {
      setIsSavingArticle(false);
    }
  };

  // Confirm Delete Article Handler
  const handleConfirmDeleteArticle = async () => {
    if (!articleToDelete) return;
    setIsDeletingArticle(true);
    try {
      if (onDeleteArticle) {
        await onDeleteArticle(articleToDelete.id);
      } else {
        await deleteArticleFromSupabase(articleToDelete.id);
      }
      showNotification(`Artículo "${articleToDelete.title.substring(0, 35)}..." eliminado exitosamente de Supabase.`, 'success');
      setArticleToDelete(null);
    } catch (err: any) {
      console.error('Error al eliminar artículo:', err);
      showNotification(`Error al eliminar: ${err.message || String(err)}`, 'error');
    } finally {
      setIsDeletingArticle(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Error cargando perfiles en CMS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Update Role Handler
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    const success = await updateUserRole(userId, newRole);
    if (success) {
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
      showNotification(`Rol actualizado a "${newRole}" con éxito.`);
    } else {
      showNotification('No se pudo actualizar el rol.', 'error');
    }
    setUpdatingUserId(null);
  };

  // Create Official Account (Reviewer / Editor)
  const handleCreateOfficialAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccPassword.length < 6) {
      showNotification('La contraseña debe tener mínimo 6 caracteres.', 'error');
      return;
    }

    setCreatingAccount(true);
    try {
      const { user, error } = await createOfficialAccount({
        name: newAccName,
        email: newAccEmail,
        password: newAccPassword,
        role: newAccRole,
        affiliation: newAccAffiliation,
        specialty: newAccSpecialty
      });

      if (error || !user) {
        showNotification(error || 'Error al crear la cuenta oficial.', 'error');
      } else {
        setProfiles(prev => [user, ...prev]);
        showNotification(`Cuenta de ${newAccRole === 'editor' ? 'Editor en Jefe' : 'Revisor por Pares'} creada con éxito.`);
        setShowCreateAccountModal(false);
        // Reset form
        setNewAccName('');
        setNewAccEmail('');
        setNewAccPassword('');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error registrando cuenta.', 'error');
    } finally {
      setCreatingAccount(false);
    }
  };

  // Confirm Delete User
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    // Safety check: Cannot delete the creator account
    if (userToDelete.email.toLowerCase() === 'admcentralcolp@gmail.com') {
      showNotification('La cuenta principal del Director General / Creador no puede ser eliminada.', 'error');
      setUserToDelete(null);
      return;
    }

    setDeletingUser(true);
    try {
      const success = await deleteUserProfile(userToDelete.id);
      if (success) {
        setProfiles(prev => prev.filter(p => p.id !== userToDelete.id));
        showNotification(`La cuenta de ${userToDelete.name} (${userToDelete.email}) ha sido eliminada permanentemente.`);
      } else {
        showNotification('No se pudo eliminar el perfil de la base de datos.', 'error');
      }
    } catch (err: any) {
      showNotification('Error al eliminar usuario.', 'error');
    } finally {
      setDeletingUser(false);
      setUserToDelete(null);
    }
  };

  // Editorial Member: Open Add Modal
  const handleOpenAddMember = () => {
    setEditingMemberId(null);
    setMemName('');
    setMemRole('Editor Asociado');
    setMemInstitution('Colegio de Odontólogos de La Paz');
    setMemCountry('Bolivia');
    setMemSpecialty('Odontología General & Especialidades');
    setMemCategory('editorial');
    setShowMemberModal(true);
  };

  // Editorial Member: Open Edit Modal
  const handleOpenEditMember = (member: EditorialMember) => {
    setEditingMemberId(member.id);
    setMemName(member.name);
    setMemRole(member.role);
    setMemInstitution(member.institution);
    setMemCountry(member.country);
    setMemSpecialty(member.specialty);
    setMemCategory(member.category || 'editorial');
    setShowMemberModal(true);
  };

  const [isSavingMember, setIsSavingMember] = useState(false);

  // Editorial Member: Save (Add or Update directly in Supabase public.editorial_board)
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim() || !memRole.trim()) {
      showNotification('Complete el nombre y cargo del miembro.', 'error');
      return;
    }

    setIsSavingMember(true);
    try {
      if (editingMemberId) {
        // Actualizar fila en Supabase public.editorial_board
        const updatedMember = await updateEditorialMember(editingMemberId, {
          name: memName.trim(),
          role: memRole.trim(),
          institution: memInstitution.trim(),
          country: memCountry.trim(),
          specialty: memSpecialty.trim(),
          category: memCategory
        });

        // Actualizar estado reactivo
        const updated = editorialBoard.map(m => m.id === editingMemberId ? updatedMember : m);
        onUpdateEditorialBoard(updated);
        if (onRefreshEditorialBoard) {
          await onRefreshEditorialBoard();
        }
        showNotification(`✅ Cambios guardados en Supabase para "${memName}".`);
      } else {
        // Insertar en Supabase public.editorial_board
        const newMember = await addEditorialMember({
          name: memName.trim(),
          role: memRole.trim(),
          institution: memInstitution.trim(),
          country: memCountry.trim(),
          specialty: memSpecialty.trim(),
          category: memCategory,
          order_index: editorialBoard.length + 1
        });

        const updated = [...editorialBoard, newMember];
        onUpdateEditorialBoard(updated);
        if (onRefreshEditorialBoard) {
          await onRefreshEditorialBoard();
        }
        showNotification(`✅ Nuevo miembro "${memName}" guardado en Supabase.`);
      }

      setShowMemberModal(false);
    } catch (err: any) {
      console.error('Error al guardar miembro en Supabase:', err);
      showNotification(`Error al guardar en Supabase: ${err.message || String(err)}`, 'error');
    } finally {
      setIsSavingMember(false);
    }
  };

  // Editorial Member: Delete directly from Supabase public.editorial_board
  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (confirm(`¿Desea remover a "${memberName}" del Cuerpo Editorial / Consejo Asesor en Supabase?`)) {
      try {
        await deleteEditorialMember(memberId);
        const updated = editorialBoard.filter(m => m.id !== memberId);
        onUpdateEditorialBoard(updated);
        if (onRefreshEditorialBoard) {
          await onRefreshEditorialBoard();
        }
        showNotification(`✅ Miembro "${memberName}" eliminado de Supabase.`);
      } catch (err: any) {
        console.error('Error al eliminar miembro en Supabase:', err);
        showNotification(`Error al eliminar de Supabase: ${err.message || String(err)}`, 'error');
      }
    }
  };

  // Editorial Member: Sincronizar desde Supabase
  const handleRefreshEditorialMembers = async () => {
    try {
      const fresh = await getEditorialBoard();
      onUpdateEditorialBoard(fresh);
      if (onRefreshEditorialBoard) {
        await onRefreshEditorialBoard();
      }
      showNotification('✅ Consejo Editorial sincronizado desde Supabase.');
    } catch (err: any) {
      console.error('Error sincronizando consejo editorial:', err);
      showNotification(`Error al sincronizar: ${err.message || String(err)}`, 'error');
    }
  };

  // Editorial Member: Reset to Factory Defaults
  const handleResetEditorialBoard = async () => {
    if (confirm('¿Desea restablecer el Cuerpo Editorial consultando los registros base de Supabase?')) {
      await handleRefreshEditorialMembers();
    }
  };

  // =========================================================================
  // GESTIÓN DE PARTNERS & AUSPICIADORES (ESTADOS Y MANEJADORES)
  // =========================================================================
  const [partnersList, setPartnersList] = useState<Partner[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  // Partner Form Fields
  const [partnerName, setPartnerName] = useState('');
  const [partnerLogoUrl, setPartnerLogoUrl] = useState('');
  const [partnerWebsiteUrl, setPartnerWebsiteUrl] = useState('');
  const [partnerCategory, setPartnerCategory] = useState('Institucional');
  const [partnerOrderIndex, setPartnerOrderIndex] = useState<number>(1);
  const [partnerLogoFile, setPartnerLogoFile] = useState<File | null>(null);
  const [partnerLogoPreview, setPartnerLogoPreview] = useState<string | null>(null);
  const [isSavingPartner, setIsSavingPartner] = useState(false);
  const [partnerFilterCategory, setPartnerFilterCategory] = useState<string>('all');

  const fetchCmsPartners = async () => {
    setIsLoadingPartners(true);
    try {
      const data = await getPartners();
      setPartnersList(data);
    } catch (err: any) {
      console.warn('Error cargando partners en CMS:', err);
    } finally {
      setIsLoadingPartners(false);
    }
  };

  useEffect(() => {
    fetchCmsPartners();
  }, []);

  const handleOpenAddPartner = () => {
    setEditingPartnerId(null);
    setPartnerName('');
    setPartnerLogoUrl('');
    setPartnerWebsiteUrl('');
    setPartnerCategory('Institucional');
    setPartnerOrderIndex(partnersList.length + 1);
    setPartnerLogoFile(null);
    if (partnerLogoPreview) URL.revokeObjectURL(partnerLogoPreview);
    setPartnerLogoPreview(null);
    setShowPartnerModal(true);
  };

  const handleOpenEditPartner = (p: Partner) => {
    setEditingPartnerId(p.id);
    setPartnerName(p.name);
    setPartnerLogoUrl(p.logo_url);
    setPartnerWebsiteUrl(p.website_url || '');
    setPartnerCategory(p.category || 'Institucional');
    setPartnerOrderIndex(p.order_index ?? 1);
    setPartnerLogoFile(null);
    if (partnerLogoPreview) URL.revokeObjectURL(partnerLogoPreview);
    setPartnerLogoPreview(null);
    setShowPartnerModal(true);
  };

  const handlePartnerLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (partnerLogoPreview) URL.revokeObjectURL(partnerLogoPreview);
    setPartnerLogoFile(file);
    setPartnerLogoPreview(URL.createObjectURL(file));
  };

  const handleSavePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      showNotification('Por favor ingrese el nombre del partner.', 'error');
      return;
    }

    setIsSavingPartner(true);
    try {
      if (editingPartnerId) {
        const updated = await updatePartner(
          editingPartnerId,
          {
            name: partnerName.trim(),
            logo_url: partnerLogoUrl || undefined,
            website_url: partnerWebsiteUrl.trim() || undefined,
            category: partnerCategory,
            order_index: Number(partnerOrderIndex)
          },
          partnerLogoFile || undefined
        );

        setPartnersList((prev) =>
          prev.map((item) => (item.id === editingPartnerId ? updated : item))
        );
        showNotification(`✅ Partner "${updated.name}" actualizado exitosamente en Supabase.`);
      } else {
        const created = await addPartner(
          {
            name: partnerName.trim(),
            logo_url: partnerLogoUrl.trim() || '/colp_logo.png',
            website_url: partnerWebsiteUrl.trim() || undefined,
            category: partnerCategory,
            order_index: Number(partnerOrderIndex)
          },
          partnerLogoFile || undefined
        );

        setPartnersList((prev) => [...prev, created]);
        showNotification(`✅ Nuevo partner "${created.name}" registrado en Supabase.`);
      }

      setShowPartnerModal(false);
      setPartnerLogoFile(null);
      if (partnerLogoPreview) {
        URL.revokeObjectURL(partnerLogoPreview);
        setPartnerLogoPreview(null);
      }
    } catch (err: any) {
      console.error('Error guardando partner:', err);
      showNotification(`Error al guardar partner: ${err.message || String(err)}`, 'error');
    } finally {
      setIsSavingPartner(false);
    }
  };

  const handleDeletePartner = async (id: string, name: string) => {
    if (confirm(`¿Está seguro de eliminar a "${name}" de los partners en Supabase?`)) {
      try {
        await deletePartner(id);
        setPartnersList((prev) => prev.filter((p) => p.id !== id));
        showNotification(`✅ Partner "${name}" eliminado exitosamente de Supabase.`);
      } catch (err: any) {
        console.error('Error eliminando partner:', err);
        showNotification(`Error al eliminar partner: ${err.message || String(err)}`, 'error');
      }
    }
  };

  // Filtered users
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.affiliation && p.affiliation.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' ? true : p.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Filtered editorial members
  const filteredEditorialMembers = editorialBoard.filter(m => {
    if (editorialFilter === 'all') return true;
    return m.category === editorialFilter;
  });

  // Role Badge Helper
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return {
          label: 'Director General / Creador',
          class: 'bg-purple-950/80 text-purple-300 border-purple-500/40 shadow-purple-950/50',
          icon: Crown
        };
      case 'editor':
        return {
          label: 'Editor en Jefe',
          class: 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-amber-950/50',
          icon: Award
        };
      case 'reviewer':
        return {
          label: 'Revisor por Pares',
          class: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40 shadow-indigo-950/50',
          icon: ClipboardCheck
        };
      case 'author':
        return {
          label: 'Autor Investigador',
          class: 'bg-teal-950/80 text-teal-300 border-teal-500/40 shadow-teal-950/50',
          icon: PenTool
        };
      default:
        return {
          label: 'Lector / Público',
          class: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: GraduationCap
        };
    }
  };

  // Filtered articles for CMS manager
  const filteredArticles = articles.filter(art => {
    const q = articleSearchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      art.title.toLowerCase().includes(q) ||
      art.authors.some(a => a.toLowerCase().includes(q)) ||
      (art.doi && art.doi.toLowerCase().includes(q)) ||
      art.category.toLowerCase().includes(q) ||
      art.id.toLowerCase().includes(q) ||
      art.keywords.some(k => k.toLowerCase().includes(q))
    );

    const matchesStatus = articleStatusFilter === 'all' ? true : art.status === articleStatusFilter;
    const matchesVolume = articleVolumeFilter === 'all' ? true : art.publishedInVolumeId === articleVolumeFilter;
    const matchesCategory = articleCategoryFilter === 'all' ? true : art.category === articleCategoryFilter;

    return matchesSearch && matchesStatus && matchesVolume && matchesCategory;
  });

  const getArticleStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'published':
        return {
          label: 'Publicado Oficial',
          class: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400'
        };
      case 'under_review':
        return {
          label: 'En Arbitraje Doble Ciego',
          class: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
          dot: 'bg-indigo-400'
        };
      case 'revisions_required':
        return {
          label: 'Revisiones Requeridas',
          class: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400'
        };
      case 'accepted':
        return {
          label: 'Aceptado para Edición',
          class: 'bg-teal-950/80 text-teal-300 border-teal-500/40',
          dot: 'bg-teal-400'
        };
      case 'rejected':
        return {
          label: 'Rechazado',
          class: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-400'
        };
      default:
        return {
          label: 'Manuscrito Recibido',
          class: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-400'
        };
    }
  };

  return (
    <div className="space-y-8 fade-in" id="superadmin-cms-dashboard">
      
      {/* CMS Top Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/40 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-400/50 text-purple-300 text-xs font-mono mb-2 shadow-xs">
              <Crown className="w-3.5 h-3.5 text-purple-400" />
              <span>Acceso Exclusivo de Creador · Control Central CMS</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Panel de Dirección General & Control Editorial
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1">
              Usuario Creador: <strong className="text-purple-300">{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setIsDirectPublishModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-teal-600 to-cyan-600 hover:from-amber-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-amber-950/40 border border-amber-400/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              title="Publicar artículo de lanzamiento directamente en la edición activa"
            >
              <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-300" />
              <span>Lanzamiento Rápido PDF</span>
            </button>

            <button
              onClick={loadUsers}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
              title="Sincronizar directorio de usuarios con Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
              <span>Sincronizar Supabase</span>
            </button>
          </div>
        </div>

        {/* Real-time Supabase Connection Status (Internal CMS Diagnostic) */}
        {supabaseAlert && (
          <div 
            className={`mt-5 rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-md ${
              supabaseAlert.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-200 shadow-rose-950/50'
                : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200 shadow-emerald-950/40'
            }`}
          >
            <div className="flex items-center gap-3">
              {supabaseAlert.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/10">
                    {supabaseAlert.type === 'error' ? 'Diagnóstico Supabase en Vivo' : 'Conexión Supabase Activa'}
                  </span>
                  <span className="text-xs font-semibold">{supabaseAlert.message}</span>
                </div>
                {supabaseAlert.details && (
                  <p className="text-[11px] font-mono opacity-80 break-all">{supabaseAlert.details}</p>
                )}
              </div>
            </div>
            {onRefreshSupabaseData && (
              <button
                onClick={onRefreshSupabaseData}
                className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1.5 cursor-pointer text-white shrink-0 self-start sm:self-auto"
                title="Reintentar consulta en Supabase"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reconectar</span>
              </button>
            )}
          </div>
        )}

        {/* CMS Segmented Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50 border border-amber-400/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>Artículos & Archivos ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('volume_management')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'volume_management'
                ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/50'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <Landmark className="w-4 h-4 text-cyan-300" />
            <span>🏛️ Gestión del Volumen y Portada ({volumes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 border border-purple-400/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios & Cuentas Oficiales ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('editorial_board')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'editorial_board'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 border border-purple-400/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Cuerpo Editorial & Consejo Asesor ({editorialBoard.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'partners'
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-950/50 border border-teal-400/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <Handshake className="w-4 h-4 text-cyan-300" />
            <span>🤝 Gestión de Partners ({partnersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('indexing')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'indexing'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 border border-purple-400/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Bases de Datos & Indexación ({indexingList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 border border-purple-400/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Auditoría de Entornos</span>
          </button>
        </div>
      </div>

      {/* Dynamic Feedback Notification Banner */}
      {feedbackNotice && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 fade-in ${
          feedbackNotice.type === 'success' 
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200' 
            : 'bg-red-950/50 border-red-500/40 text-red-200'
        }`}>
          {feedbackNotice.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedbackNotice.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 0: GESTOR EDITORIAL DE ARTÍCULOS Y REPOSITORIO DE ARCHIVOS            */}
      {/* ========================================================================= */}
      {activeTab === 'articles' && (
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
          
          {/* Module Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-mono mb-2">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Módulo Editorial CMS · Control Central de Contenidos</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>Gestor de Artículos Científicos & Repositorio de Archivos</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl">
                Modifique metadatos, corrija o agregue manuscritos PDF, actualice portadas ilustrativas y gestione figuras científicas, o elimine artículos permanentemente de Supabase.
              </p>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => setIsDirectPublishModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-950/50 border border-amber-400/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>+ Nuevo Artículo (Lanzamiento Directo)</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Total Artículos</span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-white mt-0.5 block">{articles.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/20">
              <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold">Publicados</span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-emerald-300 mt-0.5 block">
                {articles.filter(a => a.status === 'published').length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20">
              <span className="text-[10px] font-mono uppercase text-amber-400 block font-semibold">En Proceso / Revisión</span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-amber-300 mt-0.5 block">
                {articles.filter(a => a.status !== 'published').length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-cyan-500/20">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-semibold">Con Portada Ilustrativa</span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-cyan-300 mt-0.5 block">
                {articles.filter(a => !!a.cover_image_url).length}
              </span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/10">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por título, autor, DOI o palabra clave..."
                value={articleSearchQuery}
                onChange={(e) => setArticleSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={articleStatusFilter}
                onChange={(e) => setArticleStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Todos los Estados ({articles.length})</option>
                <option value="published">Publicado Oficial</option>
                <option value="under_review">En Arbitraje por Pares</option>
                <option value="submitted">Manuscrito Recibido</option>
                <option value="revisions_required">Revisiones Requeridas</option>
                <option value="accepted">Aceptado</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>

            {/* Volume Filter */}
            <div>
              <select
                value={articleVolumeFilter}
                onChange={(e) => setArticleVolumeFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Todos los Volúmenes</option>
                {volumes.map(vol => (
                  <option key={vol.id} value={vol.id}>
                    {vol.title.split(':')[0]} {vol.isCurrent ? '(Activo)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={articleCategoryFilter}
                onChange={(e) => setArticleCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Todas las Especialidades</option>
                {DENTAL_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Articles List / Table */}
          <div className="space-y-4 pt-2">
            {filteredArticles.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-950/50 border border-white/10 space-y-3">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-white">No se encontraron artículos</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No hay artículos que coincidan con los criterios de búsqueda o filtros seleccionados.
                </p>
                <button
                  onClick={() => {
                    setArticleSearchQuery('');
                    setArticleStatusFilter('all');
                    setArticleVolumeFilter('all');
                    setArticleCategoryFilter('all');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-amber-300 font-mono transition-colors"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              filteredArticles.map((article) => {
                const statusBadge = getArticleStatusBadge(article.status);
                const coverPreviewSrc = getArticleCoverPreview(article);
                const assignedVolume = volumes.find(v => v.id === article.publishedInVolumeId);

                return (
                  <div
                    key={article.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-white/10 hover:border-amber-500/30 transition-all space-y-4 hover:shadow-xl"
                  >
                    <div className="flex flex-col md:flex-row items-start gap-4">
                      {/* Thumbnail Cover */}
                      <div className="relative w-28 sm:w-32 aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 shadow-md">
                        <img
                          src={coverPreviewSrc}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <span className={`absolute bottom-1 left-1 right-1 text-[9px] font-mono px-1 py-0.5 rounded text-center truncate ${
                          article.cover_image_url
                            ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-400/40'
                            : 'bg-slate-900/90 text-slate-400 border border-white/10'
                        }`}>
                          {article.cover_image_url ? 'Portada Propia' : 'Portada Defecto'}
                        </span>
                      </div>

                      {/* Main Details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${statusBadge.class}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                            <span>{statusBadge.label}</span>
                          </span>

                          {/* Category Badge */}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 text-amber-300 border border-white/10 font-medium">
                            {article.category}
                          </span>

                          {/* Volume Tag */}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-cyan-950/50 text-cyan-300 border border-cyan-500/30">
                            {assignedVolume ? assignedVolume.title.split(':')[0] : (article.publishedInVolumeId || 'Vol. 1 Núm. 1 (2026)')}
                          </span>

                          {/* DOI */}
                          {article.doi && (
                            <span className="text-[10px] font-mono text-emerald-400 truncate max-w-[200px]" title={article.doi}>
                              DOI: {article.doi.replace('https://doi.org/', '')}
                            </span>
                          )}
                        </div>

                        {/* Article Title */}
                        <h4 className="font-serif font-bold text-white text-sm sm:text-base leading-snug">
                          {article.title}
                        </h4>

                        {/* Authors & Affiliation */}
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-slate-200 font-medium">
                            {article.authors.join(', ')}
                          </span>
                          {article.affiliations && article.affiliations[0] && (
                            <>
                              <span className="text-slate-600">·</span>
                              <span className="text-slate-400 truncate max-w-sm">
                                {article.affiliations[0]}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Top Right Action Buttons */}
                      <div className="flex items-center gap-2 self-end md:self-start shrink-0 pt-2 md:pt-0">
                        <button
                          onClick={() => handleOpenEditArticle(article)}
                          className="px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Modificar metadatos, corregir PDF, portada y figuras"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar & Corregir Archivos</span>
                        </button>

                        <button
                          onClick={() => setArticleToDelete(article)}
                          className="p-2 rounded-xl bg-red-950/30 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Eliminar artículo permanentemente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Attached Files & Storage Repository Strip */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                      {/* PDF info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs text-xs">
                              {article.manuscriptFile?.name || 'manuscrito.pdf'}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 font-medium">
                              ({article.manuscriptFile?.size || 'Archivo PDF Oficial'})
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Almacenado en Supabase Storage
                          </span>
                        </div>
                      </div>

                      {/* Figures & Supplementary count */}
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{article.figures?.length || 0} Figuras</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                          <span>{article.supplementaryFiles?.length || 0} Anexos</span>
                        </span>
                      </div>

                      {/* Direct PDF Link */}
                      {(article.pdfUrl || article.manuscriptFile?.url) && (
                        <a
                          href={article.pdfUrl || article.manuscriptFile?.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 hover:underline text-[11px] font-mono"
                        >
                          <span>Ver / Descargar PDF</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: GESTIÓN DEL VOLUMEN Y PORTADA PRINCIPAL (PERSISTENCIA SUPABASE)     */}
      {/* ========================================================================= */}
      {activeTab === 'volume_management' && (
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-7" id="cms-volume-management-panel">
          
          {/* Module Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-2 shadow-xs">
                <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                <span>Módulo Editorial CMS · Gestión del Volumen y Portada Principal</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>Gestor de Fascículos, Portada y Presentación Institucional</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-3xl">
                Configure la presentación institucional oficial, actualice la imagen de portada y fecha del volumen activo, o cree nuevos volúmenes y alterne cuál se exhibe en la portada en tiempo real con persistencia en Supabase.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => {
                  setNewVolId(`v1n${(volumes.length || 1) + 1}`);
                  setNewVolTitle(`Vol. 1 Núm. ${(volumes.length || 1) + 1} (2026): Scientia Dentis - Innovación Estomatológica`);
                  setNewVolVolumeNumber(1);
                  setNewVolIssueNumber((volumes.length || 1) + 1);
                  setNewVolYear(2026);
                  setNewVolPublishedAt(new Date().toISOString().split('T')[0]);
                  setNewVolTheme('Odontología Multidisciplinaria & Investigación Clínica');
                  setNewVolInstitutionalPresentation(DEFAULT_INSTITUTIONAL_PRESENTATION);
                  setNewVolIsCurrent(true);
                  setCreateVolCoverFile(null);
                  if (createVolCoverPreview) URL.revokeObjectURL(createVolCoverPreview);
                  setCreateVolCoverPreview(null);
                  setShowCreateVolModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 border border-cyan-400/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Crear Nuevo Volumen</span>
              </button>

              {onRefreshVolumes && (
                <button
                  onClick={async () => {
                    try {
                      await onRefreshVolumes();
                      showNotification('Volúmenes sincronizados desde Supabase.');
                    } catch (e: any) {
                      showNotification('Error al sincronizar volúmenes: ' + e.message, 'error');
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
                  title="Sincronizar listado de volúmenes desde Supabase"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refrescar</span>
                </button>
              )}
            </div>
          </div>

          {/* 1. Volume Switcher Strip (List of Registered Volumes) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider font-mono">
                  Fascículos Registrados en Supabase ({volumes.length})
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Seleccione para editar o conmutar el volumen activo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {volumes.map((vol) => {
                const isCurrentActive = Boolean(vol.isCurrent);
                const isSelectedForEdit = vol.id === selectedVolId;

                return (
                  <div
                    key={vol.id}
                    onClick={() => setSelectedVolId(vol.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                      isSelectedForEdit
                        ? 'bg-slate-800/90 border-cyan-400/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/40'
                        : 'bg-slate-950/50 border-white/10 hover:border-white/25 hover:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                          Vol. {vol.volumeNumber} · Núm. {vol.issueNumber} ({vol.year})
                        </span>

                        {isCurrentActive ? (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono uppercase font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Activo en Portada</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-500">
                            Fascículo Histórico
                          </span>
                        )}
                      </div>

                      <h5 className="font-serif text-sm font-bold text-white line-clamp-2 leading-snug">
                        {vol.title}
                      </h5>

                      <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Publicado: {vol.publishedAt}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      {!isCurrentActive ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwitchActiveVolume(vol.id);
                          }}
                          disabled={isSavingVolume}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Activar en Portada</span>
                        </button>
                      ) : (
                        <div className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono text-center font-bold">
                          ✓ Portada Principal Actual
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVolId(vol.id);
                        }}
                        className={`py-1.5 px-3 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          isSelectedForEdit
                            ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        }`}
                      >
                        {isSelectedForEdit ? 'Editando' : 'Editar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Main Editor Panel for Selected Volume */}
          {currentSelectedVol && (
            <div className="bg-slate-950/60 rounded-3xl border border-white/15 p-6 sm:p-8 backdrop-blur-xl space-y-6">
              
              {/* Card Subheader */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-lg font-bold text-white">
                        Editor del Volumen: Vol. {currentSelectedVol.volumeNumber} Núm. {currentSelectedVol.issueNumber} ({currentSelectedVol.year})
                      </h4>
                      {currentSelectedVol.isCurrent && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                          Activo en Portada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">ID: {currentSelectedVol.id}</p>
                  </div>
                </div>

                {!currentSelectedVol.isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleSwitchActiveVolume(currentSelectedVol.id)}
                    disabled={isSavingVolume}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-200 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Establecer como Portada Activa</span>
                  </button>
                )}
              </div>

              {/* Form Layout: 2 Columns */}
              <form onSubmit={handleSaveVolumeDetails} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Cover Image Management (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                      Portada Principal del Volumen
                    </h5>
                  </div>

                  {/* 3D Preview Frame of Volume Cover */}
                  <div className="relative group mx-auto max-w-[260px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] bg-slate-900">
                    <img 
                      src={newVolCoverPreview || resolveVolumeCover(currentSelectedVol.id, currentSelectedVol.coverImage)} 
                      alt={`Portada ${currentSelectedVol.title}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient Overlay & Tag */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none" />
                    
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono">
                      <span className="bg-slate-950/80 px-2 py-0.5 rounded-full border border-cyan-400/40 text-cyan-300 font-bold">
                        {newVolCoverPreview ? 'Nueva Portada (Sin Guardar)' : 'Portada Actual'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-left p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10">
                      <p className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Scientia Dentis</p>
                      <p className="text-xs text-white font-medium truncate mt-0.5">{volTitle}</p>
                    </div>
                  </div>

                  {/* Cover Upload Controls */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-300">
                      Cambiar Imagen de Portada:
                    </label>

                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={handleVolCoverChange}
                        id="vol-cover-file-input"
                        className="hidden"
                      />
                      <label 
                        htmlFor="vol-cover-file-input"
                        className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-inner"
                      >
                        <UploadCloud className="w-4 h-4 text-cyan-400" />
                        <span>Seleccionar archivo (.png, .jpg, .webp)</span>
                      </label>
                    </div>

                    {newVolCoverFile && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-between text-xs text-cyan-200">
                        <div className="truncate mr-2">
                          <span className="block font-semibold truncate">{newVolCoverFile.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(newVolCoverFile.size / 1024 / 1024).toFixed(2)} MB · Listo para subir a Supabase
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewVolCoverFile(null);
                            if (newVolCoverPreview) URL.revokeObjectURL(newVolCoverPreview);
                            setNewVolCoverPreview(null);
                          }}
                          className="p-1 hover:bg-white/10 rounded-lg text-rose-300 transition-colors"
                          title="Descartar imagen seleccionada"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 leading-tight">
                      La imagen seleccionada se subirá automáticamente a Supabase Storage en el bucket público <strong className="text-slate-300">published_articles</strong> o <strong className="text-slate-300">covers</strong> bajo la ruta <code className="text-cyan-300 font-mono text-[10px]">volumes/{currentSelectedVol.id}_cover_...</code> y actualizará el campo <code className="text-cyan-300 font-mono text-[10px]">cover_image</code> en la tabla <strong className="text-slate-300">public.volumes</strong>.
                    </p>
                  </div>
                </div>

                {/* Right Column: Institutional Presentation & Metadata (8 cols) */}
                <div className="lg:col-span-8 space-y-5">
                  
                  {/* Institutional Presentation Section */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-cyan-400" />
                        <label className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          Presentación Institucional del Volumen
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVolInstitutionalPresentation(DEFAULT_INSTITUTIONAL_PRESENTATION)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer self-start sm:self-auto"
                      >
                        Restablecer texto oficial COLP
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Este texto se renderiza de forma dinámica y reactiva en el nuevo recuadro <strong className="text-white">"Presentación Institucional"</strong> del Hero en la portada principal (<code className="text-cyan-300 font-mono text-[10px]">CoverHero.tsx</code>).
                    </p>

                    <textarea
                      rows={6}
                      value={volInstitutionalPresentation}
                      onChange={(e) => setVolInstitutionalPresentation(e.target.value)}
                      placeholder="Redacte aquí el mensaje editorial o presentación institucional para este fascículo..."
                      className="w-full px-4 py-3 bg-slate-900 border border-white/15 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-sans leading-relaxed resize-y"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Caracteres: {volInstitutionalPresentation.length}</span>
                      <span>Palabras: {volInstitutionalPresentation.trim().split(/\s+/).filter(Boolean).length}</span>
                    </div>
                  </div>

                  {/* Volume Metadata Grid */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        Datos del Fascículo & Fecha de Publicación
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Fecha de Publicación */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Fecha de Publicación (published_at):</span>
                        </label>
                        <input 
                          type="date"
                          value={volPublishedAt}
                          onChange={(e) => setVolPublishedAt(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-all font-mono"
                          required
                        />
                      </div>

                      {/* Enfoque Temático */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Enfoque Temático / Monografía:
                        </label>
                        <input 
                          type="text"
                          value={volTheme}
                          onChange={(e) => setVolTheme(e.target.value)}
                          placeholder="Ej: Implantología & Cirugía Tisular"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                        />
                      </div>

                      {/* Título Oficial */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Título Oficial del Fascículo:
                        </label>
                        <input 
                          type="text"
                          value={volTitle}
                          onChange={(e) => setVolTitle(e.target.value)}
                          placeholder="Vol. 1 Núm. 1 (2026): Scientia Dentis - Revista Científica Oficial"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-serif font-semibold"
                          required
                        />
                      </div>

                      {/* Números: Vol, Núm, Año */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          Número de Volumen:
                        </label>
                        <input 
                          type="number"
                          min="1"
                          value={volVolumeNumber}
                          onChange={(e) => setVolVolumeNumber(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-all font-mono"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Número / Fascículo:
                          </label>
                          <input 
                            type="number"
                            min="1"
                            value={volIssueNumber}
                            onChange={(e) => setVolIssueNumber(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-all font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Año (Year):
                          </label>
                          <input 
                            type="number"
                            min="2020"
                            max="2035"
                            value={volYear}
                            onChange={(e) => setVolYear(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-all font-mono"
                            required
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Submit Button & Progress State */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-slate-400">
                      {isSavingVolume && (
                        <div className="flex items-center gap-2 text-cyan-300">
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>{volSavingProgress || 'Guardando cambios en Supabase...'}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingVolume}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-950/50 border border-cyan-400/40 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {isSavingVolume ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Guardando en Supabase...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Guardar Cambios en Supabase</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </form>
            </div>
          )}

          {/* Modal: Crear Nuevo Volumen */}
          {showCreateVolModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl fade-in overflow-y-auto">
              <div 
                className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative space-y-6 my-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-950/90 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-md">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-white">
                        Crear Nuevo Volumen / Fascículo
                      </h4>
                      <p className="text-xs text-slate-400">
                        Registrar una nueva edición semestral en la tabla <code className="text-cyan-300 font-mono text-[10px]">public.volumes</code> de Supabase.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateVolModal(false)}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleCreateNewVolumeSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ID */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                        Identificador ID Único (slug):
                      </label>
                      <input 
                        type="text"
                        value={newVolId}
                        onChange={(e) => setNewVolId(e.target.value)}
                        placeholder="v1n2"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    {/* Fecha de Publicación */}
                    <div>
                      <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Fecha de Publicación:</span>
                      </label>
                      <input 
                        type="date"
                        value={newVolPublishedAt}
                        onChange={(e) => setNewVolPublishedAt(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    {/* Título Completo */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                        Título Completo del Volumen:
                      </label>
                      <input 
                        type="text"
                        value={newVolTitle}
                        onChange={(e) => setNewVolTitle(e.target.value)}
                        placeholder="Vol. 1 Núm. 2 (2026): Scientia Dentis - Innovación Estomatológica"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 font-serif font-semibold focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    {/* Volumen, Número, Año */}
                    <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">Volumen:</label>
                        <input 
                          type="number"
                          min="1"
                          value={newVolVolumeNumber}
                          onChange={(e) => setNewVolVolumeNumber(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">Número:</label>
                        <input 
                          type="number"
                          min="1"
                          value={newVolIssueNumber}
                          onChange={(e) => setNewVolIssueNumber(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-300 mb-1">Año:</label>
                        <input 
                          type="number"
                          min="2020"
                          value={newVolYear}
                          onChange={(e) => setNewVolYear(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Enfoque Temático */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                        Enfoque Temático:
                      </label>
                      <input 
                        type="text"
                        value={newVolTheme}
                        onChange={(e) => setNewVolTheme(e.target.value)}
                        placeholder="Odontología Multidisciplinaria & Investigación Clínica"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Subida de Portada */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                        Imagen de Portada (.png, .jpg, .webp):
                      </label>
                      <input 
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={handleCreateVolCoverChange}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white file:text-xs"
                      />
                      {createVolCoverPreview && (
                        <div className="mt-2 flex items-center gap-3 p-2 bg-slate-950 rounded-xl border border-cyan-500/30">
                          <img src={createVolCoverPreview} alt="Preview" className="w-12 h-16 object-cover rounded-lg" />
                          <span className="text-xs text-cyan-300 font-mono">Vista previa de portada lista</span>
                        </div>
                      )}
                    </div>

                    {/* Presentación Institucional */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                        Presentación Institucional del Volumen:
                      </label>
                      <textarea 
                        rows={4}
                        value={newVolInstitutionalPresentation}
                        onChange={(e) => setNewVolInstitutionalPresentation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white leading-relaxed resize-y focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Checkbox is_current */}
                    <div className="sm:col-span-2 flex items-center gap-2.5 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                      <input 
                        type="checkbox"
                        id="new-vol-is-current"
                        checked={newVolIsCurrent}
                        onChange={(e) => setNewVolIsCurrent(e.target.checked)}
                        className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-900 border-white/20"
                      />
                      <label htmlFor="new-vol-is-current" className="text-xs text-cyan-200 font-medium cursor-pointer">
                        Establecer de inmediato como el volumen activo de la revista (is_current = true en la portada)
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowCreateVolModal(false)}
                      disabled={isCreatingVol}
                      className="px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/5 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isCreatingVol}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isCreatingVol ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{createVolProgress || 'Creando en Supabase...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Crear y Publicar Fascículo en Supabase</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: GESTIÓN DE USUARIOS Y CUENTAS OFICIALES                            */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-5">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Directorio de Usuarios y Control de Credenciales</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Crea cuentas oficiales para el comité de revisores y editores, o elimina cuentas problemáticas.
              </p>
            </div>

            {/* Action to create official reviewer/editor account */}
            <button
              onClick={() => setShowCreateAccountModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/50 border border-purple-400/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Cuenta Oficial (Revisor / Editor)</span>
            </button>
          </div>

          {/* Table Filters & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-3 border-t border-white/10">
            <div className="relative flex-1 md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo o filiación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-white/10 text-xs">
              {(['all', 'reviewer', 'editor', 'author'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg transition-all capitalize cursor-pointer text-[11px] ${
                    roleFilter === r
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'all' ? 'Todos' : r === 'reviewer' ? 'Revisores' : r === 'editor' ? 'Editores' : 'Autores'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3.5">Usuario / Identidad</th>
                  <th className="p-3.5">Filiación & Especialidad</th>
                  <th className="p-3.5">Rol / Privilegio</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/40">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No se encontraron usuarios en este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((user) => {
                    const badge = getRoleBadge(user.role);
                    const BadgeIcon = badge.icon;
                    const isCreator = user.email.toLowerCase() === 'admcentralcolp@gmail.com';

                    return (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        
                        {/* Name & Email */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-white shrink-0 ${
                              isCreator ? 'bg-purple-900 border-purple-400' : 'bg-slate-800 border-white/10'
                            }`}>
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCreator && (
                                  <span className="text-[9px] font-mono bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/40">
                                    Creador
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">{user.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Affiliation & Specialty */}
                        <td className="p-3.5">
                          <p className="font-medium text-slate-200">{user.affiliation || 'Sin filiación especificada'}</p>
                          <p className="text-[10px] text-cyan-400 font-mono">{user.specialty || 'General'}</p>
                        </td>

                        {/* Current Role Badge & Selector */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${badge.class}`}>
                              <BadgeIcon className="w-3 h-3" />
                              <span>{badge.label}</span>
                            </span>

                            {!isCreator && (
                              <select
                                value={user.role}
                                disabled={updatingUserId === user.id}
                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                className="bg-slate-950 border border-white/15 rounded-xl px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none focus:border-purple-400 cursor-pointer"
                              >
                                <option value="reviewer">Revisor</option>
                                <option value="editor">Editor</option>
                                <option value="author">Autor</option>
                              </select>
                            )}
                          </div>
                        </td>

                        {/* Actions (Delete Account) */}
                        <td className="p-3.5 text-right">
                          {isCreator ? (
                            <span className="text-[10px] font-mono text-slate-500 px-2 py-1 rounded bg-white/5 border border-white/5">
                              Protegido
                            </span>
                          ) : (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5 text-[11px]"
                              title={`Eliminar cuenta de ${user.name}`}
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                              <span>Eliminar</span>
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CUERPO EDITORIAL & CONSEJO CIENTÍFICO ASESOR EDITABLE              */}
      {/* ========================================================================= */}
      {activeTab === 'editorial_board' && (
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Gestión de Cuerpo Editorial & Consejo Científico Asesor</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Edita los nombres reales, instituciones, países y cargos que se muestran en el pie de página y en el modal institucional.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRefreshEditorialMembers}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                title="Sincronizar consejo editorial directamente desde Supabase"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Sincronizar Supabase</span>
              </button>

              <button
                onClick={handleResetEditorialBoard}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                title="Restablecer a los integrantes iniciales COLP"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Restablecer COLP</span>
              </button>

              {onOpenEditorialModal && (
                <button
                  onClick={onOpenEditorialModal}
                  className="px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-xs text-cyan-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Ver cómo lo ven los lectores en el portal"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ver en Portal</span>
                </button>
              )}

              <button
                onClick={handleOpenAddMember}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-amber-950/50 border border-amber-400/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Agregar Miembro</span>
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Filtrar:</span>
            <button
              onClick={() => setEditorialFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                editorialFilter === 'all'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-white/10'
              }`}
            >
              Todos ({editorialBoard.length})
            </button>
            <button
              onClick={() => setEditorialFilter('editorial')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                editorialFilter === 'editorial'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-white/10'
              }`}
            >
              Cuerpo Editorial ({editorialBoard.filter(m => m.category !== 'advisory').length})
            </button>
            <button
              onClick={() => setEditorialFilter('advisory')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                editorialFilter === 'advisory'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-white/10'
              }`}
            >
              Consejo Científico Asesor ({editorialBoard.filter(m => m.category === 'advisory').length})
            </button>
          </div>

          {/* Members Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEditorialMembers.map((member) => (
              <div 
                key={member.id} 
                className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30">
                      {member.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Globe2 className="w-3 h-3 text-cyan-400" />
                      <span>{member.country}</span>
                    </span>
                  </div>

                  <h5 className="font-serif font-bold text-white text-sm sm:text-base mt-1">
                    {member.name}
                  </h5>

                  <p className="text-xs text-slate-300 mt-1 leading-snug">
                    {member.institution}
                  </p>

                  <p className="text-[11px] text-cyan-400 font-mono mt-2">
                    {member.specialty}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {member.category === 'advisory' ? 'Consejo Asesor' : 'Cuerpo Editorial'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditMember(member)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Editar datos de este miembro"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/70 text-red-300 hover:text-red-200 transition-all cursor-pointer"
                      title="Eliminar este miembro del comité"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: GESTIÓN DE PARTNERS & AUSPICIADORES (CONECTADO A SUPABASE)          */}
      {/* ========================================================================= */}
      {activeTab === 'partners' && (
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-md space-y-6" id="cms-partners-panel">
          
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-mono mb-2 shadow-xs">
                <Handshake className="w-3.5 h-3.5 text-cyan-400" />
                <span>Módulo Editorial CMS · public.partners en Supabase</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>Gestión de Partners & Auspiciadores Estratégicos</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Administre los logos institucionales, universidades colaboradoras y casas comerciales que respaldan a Scientia Dentis. Todos los cambios se guardan directamente en Supabase y se exhiben en la vista "Partners".
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={fetchCmsPartners}
                disabled={isLoadingPartners}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="Sincronizar listado de partners desde Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingPartners ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sincronizar Supabase</span>
              </button>

              <button
                onClick={handleOpenAddPartner}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-teal-950/50 border border-teal-400/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Partner</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Filtrar:</span>
            <button
              onClick={() => setPartnerFilterCategory('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                partnerFilterCategory === 'all'
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-white/10'
              }`}
            >
              Todos ({partnersList.length})
            </button>
            <button
              onClick={() => setPartnerFilterCategory('Institucional')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                partnerFilterCategory === 'Institucional'
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-white/10'
              }`}
            >
              Institucionales ({partnersList.filter(p => (p.category || 'Institucional').includes('Institucional')).length})
            </button>
            <button
              onClick={() => setPartnerFilterCategory('Académico')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                partnerFilterCategory === 'Académico'
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-white/10'
              }`}
            >
              Académicos ({partnersList.filter(p => (p.category || '').includes('Académico')).length})
            </button>
            <button
              onClick={() => setPartnerFilterCategory('Auspiciador')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                partnerFilterCategory === 'Auspiciador'
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-white/10'
              }`}
            >
              Auspiciadores Comerciales ({partnersList.filter(p => (p.category || '').includes('Auspiciador')).length})
            </button>
          </div>

          {/* Partners Grid in CMS */}
          {isLoadingPartners && partnersList.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-teal-400 mx-auto" />
              <p className="text-xs font-mono text-slate-400">Consultando tabla public.partners en Supabase...</p>
            </div>
          ) : partnersList.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 bg-slate-950/40 space-y-4">
              <Handshake className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-serif text-lg font-bold text-white">No hay partners registrados aún</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Agregue el primer partner o auspiciador comercial para exhibirlo en la vista pública de Scientia Dentis.
                </p>
              </div>
              <button
                onClick={handleOpenAddPartner}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Primer Partner</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {partnersList
                .filter(p => {
                  if (partnerFilterCategory === 'all') return true;
                  return (p.category || 'Institucional').toLowerCase().includes(partnerFilterCategory.toLowerCase());
                })
                .map((partner) => (
                  <div
                    key={partner.id}
                    className="p-5 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-teal-500/40 transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      {/* Logo Preview Frame */}
                      <div className="w-full h-32 rounded-xl bg-slate-900 border border-white/5 p-4 flex items-center justify-center relative overflow-hidden mb-3.5">
                        <img 
                          src={partner.logo_url} 
                          alt={partner.name}
                          className="max-h-20 max-w-[85%] object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/colp_logo.png';
                          }}
                        />
                        <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-slate-950/80 px-2 py-0.5 rounded-md border border-white/10 text-slate-400">
                          #{partner.order_index ?? 1}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold px-2 py-0.5 rounded-full bg-teal-950/60 border border-teal-500/30">
                            {partner.category || 'Institucional'}
                          </span>
                        </div>

                        <h5 className="font-serif font-bold text-white text-sm mt-1 line-clamp-2">
                          {partner.name}
                        </h5>

                        {partner.website_url ? (
                          <a
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 truncate block flex items-center gap-1"
                          >
                            <Globe2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{partner.website_url.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-600 block">Sin enlace web registrado</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <span className="text-[10px] font-mono text-slate-500">
                        ID: {partner.id.substring(0, 8)}...
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditPartner(partner)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Editar partner"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-teal-400" />
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner.id, partner.name)}
                          className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/70 text-red-300 hover:text-red-200 transition-all cursor-pointer"
                          title="Eliminar partner de Supabase"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
            </div>
          )}

        </div>
      )}
      {activeTab === 'indexing' && (
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <span>Bases de Datos & Sistemas de Indexación</span>
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Panel exclusivo del CMS Super Admin para supervisar y actualizar los registros de visibilidad académica, folios y depósitos internacionales.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setNewIndexName('');
                  setNewIndexStatus('En Evaluación');
                  setNewIndexCategory('Iberoamérica');
                  setNewIndexDescription('');
                  setShowAddIndexModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-950/50 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Agregar Base / Indexación</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {indexingList.map((idx, index) => (
              <div 
                key={index} 
                className="p-4 bg-slate-950/70 border border-white/10 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg hover:border-cyan-500/30 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-serif font-bold text-white text-sm leading-tight">
                      {idx.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 shrink-0">
                      {idx.category}
                    </span>
                  </div>

                  <div className="inline-block">
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      idx.status.toLowerCase().includes('indexad') || idx.status.toLowerCase().includes('miembro') || idx.status.toLowerCase().includes('h5')
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                    }`}>
                      {idx.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {idx.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <select
                    value={idx.status}
                    onChange={(e) => {
                      const updated = [...indexingList];
                      updated[index] = { ...updated[index], status: e.target.value };
                      setIndexingList(updated);
                      showNotification(`Estado de "${idx.name}" actualizado a: ${e.target.value}`);
                    }}
                    className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono cursor-pointer"
                  >
                    <option value="Indexada (Folio Oficial)">Indexada (Folio Oficial)</option>
                    <option value="Miembro / Sello Verde">Miembro / Sello Verde</option>
                    <option value="Fase de Incorporación">Fase de Incorporación</option>
                    <option value="En Evaluación">En Evaluación</option>
                    <option value="Postulación Enviada">Postulación Enviada</option>
                    <option value="Prefijo 10.58472">Prefijo 10.58472</option>
                    <option value="Monitoreo Activo">Monitoreo Activo</option>
                  </select>

                  <button
                    onClick={() => {
                      if (confirm(`¿Desea retirar "${idx.name}" del listado de indexación?`)) {
                        setIndexingList(prev => prev.filter((_, i) => i !== index));
                        showNotification(`"${idx.name}" eliminada de la lista.`);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                    title="Eliminar de la lista"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Interoperability & OJS Harvest Card */}
          <div className="mt-6 p-5 bg-slate-950/90 border border-cyan-500/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <h5 className="font-serif font-bold text-sm text-white">
                Interoperabilidad OJS / Protocolos de Cosecha Automática
              </h5>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Los sistemas de indexación internacionales (Latindex, DOAJ, Scopus, Google Scholar) cosechan los artículos automáticamente a través del protocolo abierto OAI-PMH con identificadores permanentes DOI de Scientia Dentis.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-slate-500 block text-[10px]">Endpoint OAI-PMH:</span>
                <span className="text-cyan-300 break-all">/index.php/sd/oai?verb=Identify</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-slate-500 block text-[10px]">Prefijo DOI CrossRef:</span>
                <span className="text-cyan-300">10.58472/scientiadentis</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10">
                <span className="text-slate-500 block text-[10px]">Esquema de Metadatos:</span>
                <span className="text-cyan-300">Dublin Core / Highwire Press</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDITORÍA DE ENTORNOS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-md space-y-4">
          <div>
            <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <span>Auditoría de Entornos (Supervisión sin Cerrar Sesión)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Como Director General y Creador, puedes ingresar directamente a cualquier sección operativa para fiscalizar artículos y dictámenes:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <button
              onClick={() => onSwitchPerspective('editor')}
              className="p-4 rounded-2xl bg-amber-950/30 hover:bg-amber-950/60 border border-amber-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-amber-300">Panel Editorial</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">Ver asignación de revisores y aprobación de volúmenes</p>
            </button>

            <button
              onClick={() => onSwitchPerspective('reviewer')}
              className="p-4 rounded-2xl bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-indigo-300">Panel de Revisor</span>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">Ver formularios de rúbricas y criterios de evaluación</p>
            </button>

            <button
              onClick={() => onSwitchPerspective('author')}
              className="p-4 rounded-2xl bg-teal-950/30 hover:bg-teal-950/60 border border-teal-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-teal-300">Panel de Autor</span>
                <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">Inspeccionar el proceso de subida y metadatos IMRyD</p>
            </button>

            <button
              onClick={() => onSwitchPerspective('reader')}
              className="p-4 rounded-2xl bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-cyan-300">Portal Público</span>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">Consultar la experiencia de lectores y descarga de PDF</p>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR CUENTA OFICIAL (REVISOR / EDITOR)                            */}
      {/* ========================================================================= */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md fade-in overflow-y-auto">
          <div 
            className="relative w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />
            
            <button
              onClick={() => setShowCreateAccountModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-purple-400" />
                <h4 className="font-serif text-xl font-bold text-white">
                  Crear Cuenta Oficial Institucional
                </h4>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Genera accesos autorizados para miembros del comité científico o directores editoriales.
              </p>

              <form onSubmit={handleCreateOfficialAccount} className="space-y-4">
                
                {/* Role selection: Only Reviewer or Editor */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Tipo de Cuenta Oficial
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAccRole('reviewer')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        newAccRole === 'reviewer'
                          ? 'bg-indigo-950/80 border-indigo-400 text-white font-semibold'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold text-indigo-300">Revisor por Pares</span>
                      <span className="block text-[10px] text-slate-400">Arbitraje a doble ciego</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewAccRole('editor')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        newAccRole === 'editor'
                          ? 'bg-amber-950/80 border-amber-400 text-white font-semibold'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold text-amber-300">Editor en Jefe</span>
                      <span className="block text-[10px] text-slate-400">Aprobación y publicación</span>
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Nombre Completo & Grado Académico
                  </label>
                  <input
                    type="text"
                    required
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    placeholder="Ej. Dr. Mauricio Valenzuela, PhD"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Correo Electrónico Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={newAccEmail}
                    onChange={(e) => setNewAccEmail(e.target.value)}
                    placeholder="revisor.odontologia@universidad.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Contraseña Inicial (Mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newAccPassword}
                    onChange={(e) => setNewAccPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Affiliation */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Filiación / Universidad / Hospital
                  </label>
                  <input
                    type="text"
                    required
                    value={newAccAffiliation}
                    onChange={(e) => setNewAccAffiliation(e.target.value)}
                    placeholder="Colegio de Odontólogos de La Paz (COLP)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Specialty */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Especialidad Odontológica
                  </label>
                  <input
                    type="text"
                    value={newAccSpecialty}
                    onChange={(e) => setNewAccSpecialty(e.target.value)}
                    placeholder="Ej. Implantología Oral, Endodoncia, Periodoncia..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateAccountModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingAccount}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-950/50 cursor-pointer disabled:opacity-50"
                  >
                    {creatingAccount ? 'Guardando en Supabase...' : 'Crear y Habilitar Cuenta'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ELIMINAR USUARIO CONFIRMACIÓN                                      */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md fade-in">
          <div 
            className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-full bg-red-950 border border-red-500/30">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-white">¿Eliminar cuenta de usuario?</h4>
                <p className="text-xs text-slate-400">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-white/10 leading-relaxed">
              Está a punto de revocar y eliminar permanentemente la cuenta de:
              <br />
              <strong className="text-white block mt-1 text-sm">{userToDelete.name}</strong>
              <span className="font-mono text-cyan-400 text-[11px] block">{userToDelete.email}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Rol actual: {userToDelete.role}</span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deletingUser}
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {deletingUser ? 'Eliminando...' : 'Sí, Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AGREGAR O EDITAR MIEMBRO DEL CUERPO EDITORIAL                      */}
      {/* ========================================================================= */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md fade-in overflow-y-auto">
          <div 
            className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="font-serif text-lg font-bold text-white">
                  {editingMemberId ? 'Editar Miembro del Comité' : 'Agregar Nuevo Miembro al Comité'}
                </h4>
              </div>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Categoría
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMemCategory('editorial')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      memCategory === 'editorial'
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 font-semibold'
                        : 'bg-slate-950 border-white/10 text-slate-400'
                    }`}
                  >
                    Cuerpo Editorial
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemCategory('advisory')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      memCategory === 'advisory'
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 font-semibold'
                        : 'bg-slate-950 border-white/10 text-slate-400'
                    }`}
                  >
                    Consejo Científico Asesor
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Nombre Completo & Títulos Académicos
                </label>
                <input
                  type="text"
                  required
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  placeholder="Ej. Dra. Beatriz Villalobos, PhD"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Cargo / Rol Editorial
                </label>
                <input
                  type="text"
                  required
                  value={memRole}
                  onChange={(e) => setMemRole(e.target.value)}
                  placeholder="Ej. Editora en Jefa, Editor Asociado - Implantes..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Institución / Universidad / Hospital
                </label>
                <input
                  type="text"
                  required
                  value={memInstitution}
                  onChange={(e) => setMemInstitution(e.target.value)}
                  placeholder="Colegio de Odontólogos de La Paz (COLP)"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    required
                    value={memCountry}
                    onChange={(e) => setMemCountry(e.target.value)}
                    placeholder="Bolivia, Chile, Brasil..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Especialidad Científica
                  </label>
                  <input
                    type="text"
                    required
                    value={memSpecialty}
                    onChange={(e) => setMemSpecialty(e.target.value)}
                    placeholder="Biomateriales y Restauradora..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingMember}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingMember ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando en Supabase...</span>
                    </>
                  ) : (
                    <span>{editingMemberId ? 'Guardar Cambios en Supabase' : 'Agregar al Comité en Supabase'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR O EDITAR PARTNER / AUSPICIADOR (SUPABASE)                */}
      {/* ========================================================================= */}
      {showPartnerModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md fade-in overflow-y-auto"
          onClick={() => setShowPartnerModal(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-slate-900 border border-teal-500/40 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-teal-400" />
                <h4 className="font-serif text-lg font-bold text-white">
                  {editingPartnerId ? 'Editar Partner Estratégico' : 'Registrar Nuevo Partner'}
                </h4>
              </div>
              <button
                onClick={() => setShowPartnerModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePartnerSubmit} className="space-y-4">
              
              {/* Nombre de la institución/empresa */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Nombre de la Institución o Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Ej. Straumann LatAm / Facultad de Odontología UMSA"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Categoría del Partner
                </label>
                <select
                  value={partnerCategory}
                  onChange={(e) => setPartnerCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="Institucional">Institucional (Colegios & Asociaciones)</option>
                  <option value="Académico">Académico (Universidades & Sociedades)</option>
                  <option value="Auspiciador Comercial">Auspiciador Comercial (Casas Dentales / Industria)</option>
                </select>
              </div>

              {/* Subida de archivo de logo */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-slate-300">
                  Logo del Partner (.png, .svg, .jpg, .webp)
                </label>
                
                <div className="flex items-center gap-4">
                  {/* Vista previa */}
                  <div className="w-20 h-20 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center p-2 overflow-hidden shrink-0">
                    <img 
                      src={partnerLogoPreview || partnerLogoUrl || '/colp_logo.png'} 
                      alt="Logo preview"
                      className="max-h-16 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/colp_logo.png';
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <input 
                      type="file"
                      id="partner-logo-input"
                      accept="image/png,image/svg+xml,image/jpeg,image/webp"
                      onChange={handlePartnerLogoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="partner-logo-input"
                      className="px-3 py-2 rounded-xl border border-dashed border-teal-500/40 hover:border-teal-400 bg-teal-950/20 text-teal-300 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>{partnerLogoFile ? partnerLogoFile.name : 'Subir archivo de logo'}</span>
                    </label>

                    <input
                      type="text"
                      value={partnerLogoUrl}
                      onChange={(e) => setPartnerLogoUrl(e.target.value)}
                      placeholder="O ingrese URL pública de logo"
                      className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-teal-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Sitio web y Orden */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Sitio Web / Red Social (Opcional)
                  </label>
                  <input
                    type="url"
                    value={partnerWebsiteUrl}
                    onChange={(e) => setPartnerWebsiteUrl(e.target.value)}
                    placeholder="https://empresa.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={partnerOrderIndex}
                    onChange={(e) => setPartnerOrderIndex(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPartnerModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPartner}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingPartner ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando en Supabase...</span>
                    </>
                  ) : (
                    <span>{editingPartnerId ? 'Guardar Cambios en Supabase' : 'Registrar en Supabase'}</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR BASE DE DATOS / INDEXACIÓN */}
      {showAddIndexModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <h4 className="font-serif text-base font-bold text-white">
                  Registrar Base de Datos o Sistema de Indexación
                </h4>
              </div>
              <button 
                onClick={() => setShowAddIndexModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newIndexName.trim()) return;
                const newEntry = {
                  name: newIndexName.trim(),
                  status: newIndexStatus.trim(),
                  category: newIndexCategory.trim(),
                  description: newIndexDescription.trim() || 'Sistema de indexación y visibilidad académica científica.'
                };
                setIndexingList(prev => [...prev, newEntry]);
                showNotification(`"${newIndexName}" agregada exitosamente.`);
                setShowAddIndexModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nombre del Sistema o Base de Datos
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Scopus, Redalyc, Dialnet, PubMed..."
                  value={newIndexName}
                  onChange={(e) => setNewIndexName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Ámbito / Categoría
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Global, Iberoamérica, Regional..."
                    value={newIndexCategory}
                    onChange={(e) => setNewIndexCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Estado Actual
                  </label>
                  <select
                    value={newIndexStatus}
                    onChange={(e) => setNewIndexStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Indexada (Folio Oficial)">Indexada (Folio Oficial)</option>
                    <option value="Miembro / Sello Verde">Miembro / Sello Verde</option>
                    <option value="En Evaluación">En Evaluación</option>
                    <option value="Fase de Incorporación">Fase de Incorporación</option>
                    <option value="Postulación Enviada">Postulación Enviada</option>
                    <option value="Monitoreo Activo">Monitoreo Activo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Descripción o Criterios de Acreditación
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles de requisitos editoriales, folio asignado o enlace permanente..."
                  value={newIndexDescription}
                  onChange={(e) => setNewIndexDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddIndexModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-950/50"
                >
                  Guardar en CMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE ARTICLE & FILES EDIT MODAL                                  */}
      {/* ========================================================================= */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto fade-in">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-mono mb-2">
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Editor de Artículo & Corrección de Archivos</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">
                  {editingArticle.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-slate-400">
                  <span className="text-amber-400">ID: {editingArticle.id}</span>
                  {editingArticle.doi && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400">DOI: {editingArticle.doi}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isSavingArticle) setEditingArticle(null);
                }}
                disabled={isSavingArticle}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Tab Selector */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setEditModalTab('files')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  editModalTab === 'files'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40 border border-amber-400/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Archivos, PDF y Portada</span>
              </button>

              <button
                type="button"
                onClick={() => setEditModalTab('metadata')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  editModalTab === 'metadata'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/40 border border-amber-400/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Metadatos Editoriales y Textos</span>
              </button>
            </div>

            <form onSubmit={handleSaveArticleEdits} className="space-y-6">
              {/* TAB A: ARCHIVOS, PDF Y PORTADA */}
              {editModalTab === 'files' && (
                <div className="space-y-6 fade-in">
                  
                  {/* SECCIÓN 1: MANUSCRITO PDF OFICIAL */}
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div>
                        <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span>Archivo Manuscrito Oficial (PDF)</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Visualice el PDF actual o suba uno nuevo para reemplazarlo en Supabase Storage.
                        </p>
                      </div>

                      {/* Current PDF Link */}
                      {(editCurrentPdfUrl || editingArticle.manuscriptFile?.url) && (
                        <a
                          href={editCurrentPdfUrl || editingArticle.manuscriptFile?.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir PDF Actual</span>
                        </a>
                      )}
                    </div>

                    {/* Current File Info */}
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Archivo registrado:</span>
                        <span className="font-semibold text-white font-mono">
                          {editingArticle.manuscriptFile?.name || 'manuscrito_oficial.pdf'}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-2 font-mono">
                          ({editingArticle.manuscriptFile?.size || 'Tamaño N/D'})
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        Activo
                      </span>
                    </div>

                    {/* File Replacement Input */}
                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-slate-300">
                        Reemplazar / Cargar Nuevo Manuscrito PDF:
                      </label>

                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          id="edit-article-pdf-input"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewPdfFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="edit-article-pdf-input"
                          className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/15 hover:border-amber-400/60 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all text-center"
                        >
                          <UploadCloud className="w-7 h-7 text-amber-400 mb-1" />
                          <span className="text-xs text-white font-semibold">
                            Haga clic aquí para seleccionar el nuevo archivo PDF
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            Formato .pdf oficial • Máximo 25 MB
                          </span>
                        </label>
                      </div>

                      {/* Selected new PDF chip */}
                      {newPdfFile && (
                        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between gap-3 text-xs fade-in">
                          <div className="flex items-center gap-2 truncate">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-white truncate block">
                                Nuevo PDF seleccionado: {newPdfFile.name}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-300">
                                {formatFileSize(newPdfFile.size)} • Se subirá a Supabase Storage al guardar
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewPdfFile(null)}
                            className="px-2 py-1 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg shrink-0 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}

                      {/* Optional direct URL edit */}
                      <div className="pt-1">
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">
                          O editar directamente URL de alojamiento PDF:
                        </label>
                        <input
                          type="url"
                          value={editCurrentPdfUrl}
                          onChange={(e) => setEditCurrentPdfUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: IMAGEN DE PORTADA ILUSTRATIVA */}
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-cyan-400" />
                          <span>Imagen de Portada Ilustrativa del Artículo</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Aparece en el Mini Carrusel Continuo del Hero de la portada.
                        </p>
                      </div>

                      {/* Removal Toggle */}
                      {editCurrentCoverUrl && !coverMarkedForRemoval && (
                        <button
                          type="button"
                          onClick={() => setCoverMarkedForRemoval(true)}
                          className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-mono transition-colors"
                        >
                          Quitar Portada
                        </button>
                      )}
                      {coverMarkedForRemoval && (
                        <button
                          type="button"
                          onClick={() => setCoverMarkedForRemoval(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                        >
                          Restaurar Portada Anterior
                        </button>
                      )}
                    </div>

                    {/* Previews Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      {/* Current / Fallback Preview */}
                      <div className="space-y-1.5 text-center sm:text-left">
                        <span className="text-[11px] font-mono text-slate-400 block">
                          Visualización actual:
                        </span>
                        <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-white/10 max-w-xs shadow-md">
                          <img
                            src={
                              newCoverPreview ||
                              (!coverMarkedForRemoval && editCurrentCoverUrl) ||
                              getArticleCoverPreview({ ...editingArticle, cover_image_url: undefined })
                            }
                            alt="Previsualización de portada"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                          <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950/90 text-cyan-300 border border-cyan-400/30">
                            {newCoverPreview
                              ? 'Nueva Portada Seleccionada'
                              : coverMarkedForRemoval
                                ? 'Fallback por Especialidad'
                                : editCurrentCoverUrl
                                  ? 'Portada Oficial Cargada'
                                  : 'Portada por Defecto'}
                          </span>
                        </div>
                      </div>

                      {/* Upload Input for Cover */}
                      <div className="space-y-2">
                        <label className="block text-xs font-mono text-slate-300">
                          Seleccionar nueva imagen de portada:
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                            id="edit-article-cover-input"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const f = e.target.files[0];
                                setNewCoverFile(f);
                                setNewCoverPreview(URL.createObjectURL(f));
                                setCoverMarkedForRemoval(false);
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="edit-article-cover-input"
                            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/15 hover:border-cyan-400/60 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all text-center"
                          >
                            <ImageIcon className="w-6 h-6 text-cyan-400 mb-1" />
                            <span className="text-xs text-white font-semibold">
                              Cargar Imagen (.jpg, .png, .webp)
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              Máximo 5 MB • Relación recomendada 16:10
                            </span>
                          </label>
                        </div>

                        {newCoverFile && (
                          <div className="flex items-center justify-between text-xs text-emerald-300 bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/30">
                            <span className="truncate">{newCoverFile.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setNewCoverFile(null);
                                setNewCoverPreview(null);
                              }}
                              className="text-red-400 hover:text-red-300 text-[11px] shrink-0 ml-2"
                            >
                              Deshacer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 3: FIGURAS CIENTÍFICAS ADICIONALES */}
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-400" />
                          <span>Figuras Científicas Adicionales ({editFigures.length})</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Microfotografías, cortes histológicos, gráficos y diagramas clínicos.
                        </p>
                      </div>
                    </div>

                    {/* Existing Figures List */}
                    {editFigures.length > 0 ? (
                      <div className="space-y-2">
                        {editFigures.map((fig, idx) => (
                          <div
                            key={fig.id || idx}
                            className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 truncate">
                              <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-purple-950 text-purple-300 border border-purple-500/30 shrink-0">
                                {fig.figureNumber || `Fig. ${idx + 1}`}
                              </span>
                              <div className="truncate">
                                <span className="font-semibold text-white truncate block">
                                  {fig.name}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate block">
                                  {fig.caption || 'Sin pie de figura'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setEditFigures(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg shrink-0 transition-colors"
                              title="Eliminar figura"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No hay figuras adicionales registradas.</p>
                    )}

                    {/* Add New Figure Inline Form */}
                    <div className="pt-3 border-t border-white/5 space-y-3">
                      <span className="text-xs font-mono text-purple-300 font-semibold block">
                        + Adjuntar Nueva Figura Científica:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Número / Identificador:</label>
                          <input
                            type="text"
                            value={newFigureNumber}
                            onChange={(e) => setNewFigureNumber(e.target.value)}
                            placeholder="Figura 1"
                            className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">Pie de Figura / Descripción:</label>
                          <input
                            type="text"
                            value={newFigureCaption}
                            onChange={(e) => setNewFigureCaption(e.target.value)}
                            placeholder="Ej. Tomografía cone-beam del defecto periapical"
                            className="w-full px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          id="edit-new-fig-file"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewFigureFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="edit-new-fig-file"
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 rounded-xl cursor-pointer transition-colors"
                        >
                          {newFigureFile ? `Archivo: ${newFigureFile.name}` : 'Seleccionar Imagen de Figura'}
                        </label>
                        {newFigureFile && (
                          <span className="text-[11px] font-mono text-emerald-400">
                            Listo para subida ({formatFileSize(newFigureFile.size)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 4: MATERIAL SUPLEMENTARIO */}
                  <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-blue-400" />
                          <span>Material Suplementario y Anexos ({editSupplementary.length})</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Bases de datos Excel, protocolos clínicos o apéndices metodológicos.
                        </p>
                      </div>
                    </div>

                    {/* Existing Supplementary List */}
                    {editSupplementary.length > 0 ? (
                      <div className="space-y-2">
                        {editSupplementary.map((sup, idx) => (
                          <div
                            key={sup.id || idx}
                            className="p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between gap-3 text-xs"
                          >
                            <span className="font-semibold text-white truncate">
                              {sup.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditSupplementary(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg shrink-0 transition-colors"
                              title="Eliminar anexo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No hay archivos suplementarios registrados.</p>
                    )}

                    {/* Add Supplementary Form */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <span className="text-xs font-mono text-blue-300 font-semibold block">
                        + Adjuntar Archivo Suplementario:
                      </span>
                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <input
                          type="text"
                          value={newSuppName}
                          onChange={(e) => setNewSuppName(e.target.value)}
                          placeholder="Nombre del anexo (ej. Matriz de Datos)"
                          className="w-full sm:w-1/2 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-400"
                        />
                        <input
                          type="file"
                          id="edit-new-supp-file"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewSuppFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="edit-new-supp-file"
                          className="w-full sm:w-auto px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 rounded-xl cursor-pointer text-center"
                        >
                          {newSuppFile ? `Archivo: ${newSuppFile.name}` : 'Seleccionar Archivo'}
                        </label>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB B: METADATOS EDITORIALES Y TEXTOS */}
              {editModalTab === 'metadata' && (
                <div className="space-y-4 fade-in">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Título Completo del Artículo <span className="text-amber-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-serif"
                    />
                  </div>

                  {/* Category, Volume, Status, DOI (4 Cols) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Especialidad / Categoría
                      </label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {DENTAL_CATEGORIES.map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Volumen Asignado
                      </label>
                      <select
                        value={editVolumeId}
                        onChange={(e) => setEditVolumeId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {volumes.map((vol) => (
                          <option key={vol.id} value={vol.id}>
                            {vol.title.split(':')[0]} {vol.isCurrent ? '(Activo)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Estado Editorial
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as ArticleStatus)}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="published">Publicado Oficial</option>
                        <option value="under_review">En Arbitraje Doble Ciego</option>
                        <option value="submitted">Manuscrito Recibido</option>
                        <option value="revisions_required">Revisiones Requeridas</option>
                        <option value="accepted">Aceptado</option>
                        <option value="rejected">Rechazado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Identificador DOI
                      </label>
                      <input
                        type="text"
                        value={editDoi}
                        onChange={(e) => setEditDoi(e.target.value)}
                        placeholder="https://doi.org/10.48512/..."
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Authors & Affiliation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Autores (Separados por coma) <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editAuthors}
                        onChange={(e) => setEditAuthors(e.target.value)}
                        placeholder="Ej. Dra. Beatriz Villalobos, PhD, Dr. Carlos Baeza"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1">
                        Filiación Institucional Principal
                      </label>
                      <input
                        type="text"
                        value={editAffiliation}
                        onChange={(e) => setEditAffiliation(e.target.value)}
                        placeholder="Colegio de Odontólogos de La Paz (COLP)"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Abstract */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Resumen Académico (Abstract IMRyD) <span className="text-amber-400">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={editAbstract}
                      onChange={(e) => setEditAbstract(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-sans leading-relaxed"
                    />
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Palabras Clave (Keywords DeCS / MeSH, separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={editKeywords}
                      onChange={(e) => setEditKeywords(e.target.value)}
                      placeholder="Ej. Odontología, Biocementos, Cirugía Bucal, Regeneración Ósea"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  {/* Editor Notes */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Notas Editoriales & Dictamen COLP
                    </label>
                    <textarea
                      rows={2}
                      value={editEditorNotes}
                      onChange={(e) => setEditEditorNotes(e.target.value)}
                      placeholder="Resolución del Comité Editorial, observaciones o notas de preservación digital..."
                      className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* Upload Progress Bar if submitting */}
              {isSavingArticle && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2 fade-in">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-300 flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      {savingProgressText || 'Guardando cambios...'}
                    </span>
                    <span className="text-amber-400 font-bold">{savingProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${savingProgressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={isSavingArticle}
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSavingArticle}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-950/50 border border-amber-400/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSavingArticle ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Guardando en Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar Cambios y Archivos</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE ARTICLE CONFIRMATION MODAL                                         */}
      {/* ========================================================================= */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">¿Eliminar artículo de forma definitiva?</h4>
                <span className="text-[11px] font-mono text-red-400">Acción irreversible en base de datos</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2 text-xs">
              <p className="font-serif font-semibold text-white leading-snug">
                {articleToDelete.title}
              </p>
              <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                <p>Especialidad: <span className="text-slate-200">{articleToDelete.category}</span></p>
                <p>Autores: <span className="text-slate-200">{articleToDelete.authors.join(', ')}</span></p>
                {articleToDelete.doi && <p>DOI: <span className="text-emerald-400">{articleToDelete.doi}</span></p>}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta acción eliminará permanentemente el registro de la tabla <code className="text-red-400 font-mono">public.articles</code> en Supabase y sus revisiones asociadas.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                disabled={isDeletingArticle}
                onClick={() => setArticleToDelete(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingArticle}
                onClick={handleConfirmDeleteArticle}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/50 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeletingArticle ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Eliminar de Supabase</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <DirectPublishModal
        isOpen={isDirectPublishModalOpen}
        onClose={() => setIsDirectPublishModalOpen(false)}
        volumes={volumes}
        defaultVolumeId={volumes.find(v => v.isCurrent)?.id || 'v1n1'}
        onPublishSuccess={(newArticle) => {
          if (onDirectPublishSuccess) {
            onDirectPublishSuccess(newArticle);
          }
          showNotification(`Artículo "${newArticle.title}" publicado con éxito en la edición actual.`);
        }}
      />

    </div>
  );
}
