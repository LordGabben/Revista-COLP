import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CoverHero from './components/CoverHero';
import ReaderView from './components/ReaderView';
import AuthorDashboard from './components/AuthorDashboard';
import ReviewerDashboard from './components/ReviewerDashboard';
import EditorDashboard from './components/EditorDashboard';
import SuperAdminCMS from './components/SuperAdminCMS';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import InstitutionalModals from './components/InstitutionalModals';
import PartnersView from './components/PartnersView';

import { JOURNAL_INFO, EDITORIAL_BOARD_MEMBERS, INITIAL_VOLUMES, INITIAL_ARTICLES } from './data';
import { Article, Review, UserRole, Volume, InstitutionalModalType, AuthUser, EditorialMember } from './types';
import { AlertTriangle, CheckCircle2, XCircle, RefreshCw, X } from 'lucide-react';
import { 
  fetchArticles, 
  fetchVolumes, 
  saveArticleToSupabase, 
  deleteArticleFromSupabase,
  saveReviewToSupabase, 
  isSupabaseConfigured,
  getCurrentUserProfile,
  logoutUser,
  supabase
} from './lib/supabase';
import { getVolumes, getCurrentVolume } from './services/volumesService';
import { 
  getPublishedArticles, 
  getAllArticlesForEditor, 
  publishArticleToVolume, 
  updateArticleStatus 
} from './services/articlesService';
import { getEditorialBoard, DEFAULT_EDITORIAL_BOARD } from './services/editorialService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('reader');
  const [currentView, setCurrentView] = useState<'home' | 'partners'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [volumes, setVolumes] = useState<Volume[]>(INITIAL_VOLUMES);
  const [activeModal, setActiveModal] = useState<InstitutionalModalType>(null);
  const [selectedArticleForReader, setSelectedArticleForReader] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVolumeFilter, setSelectedVolumeFilter] = useState<string | null>(null);
  const [supabaseAlert, setSupabaseAlert] = useState<{ type: 'error' | 'success'; message: string; details?: string } | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Editable Editorial Board & Scientific Council directly from Supabase (Zero LocalStorage)
  const [editorialBoard, setEditorialBoard] = useState<EditorialMember[]>(DEFAULT_EDITORIAL_BOARD);

  const handleUpdateEditorialBoard = (updated: EditorialMember[]) => {
    setEditorialBoard(updated);
  };

  const handleRefreshEditorialBoard = async () => {
    try {
      const remoteEditorial = await getEditorialBoard();
      if (remoteEditorial && remoteEditorial.length > 0) {
        setEditorialBoard(remoteEditorial);
      }
    } catch (e) {
      console.warn('[App] Error refrescando consejo editorial desde Supabase:', e);
    }
  };

  // 1. Load initial user session and data
  useEffect(() => {
    // Check locally saved user session first
    const storedUser = localStorage.getItem('oj_auth_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        setCurrentRole(parsed.role);
      } catch (e) {
        console.warn('Error parseando usuario local');
      }
    }

    // Check real Supabase user session
    if (isSupabaseConfigured) {
      getCurrentUserProfile().then(user => {
        if (user) {
          setCurrentUser(user);
          setCurrentRole(user.role);
          localStorage.setItem('oj_auth_user', JSON.stringify(user));
        }
      });

      // Listen to auth state changes
      if (supabase) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await getCurrentUserProfile();
            if (profile) {
              setCurrentUser(profile);
              setCurrentRole(profile.role);
              localStorage.setItem('oj_auth_user', JSON.stringify(profile));
            }
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setCurrentRole('reader');
            localStorage.removeItem('oj_auth_user');
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      }
    }
  }, []);

  // 2. Load articles & volumes directly from Supabase (without fallback to memory/LocalStorage)
  useEffect(() => {
    async function loadData() {
      setIsLoadingData(true);
      try {
        if (!isSupabaseConfigured) {
          throw new Error('Faltan credenciales de Supabase en variables de entorno (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY). Por favor configure su archivo .env.');
        }

        const [remoteVolumes, remoteArticles, remoteEditorial] = await Promise.all([
          getVolumes(),
          getAllArticlesForEditor(),
          getEditorialBoard()
        ]);
        setVolumes(remoteVolumes);
        setArticles(remoteArticles);
        if (remoteEditorial && remoteEditorial.length > 0) {
          setEditorialBoard(remoteEditorial);
        }
        setSupabaseAlert({
          type: 'success',
          message: `Conexión en tiempo real con Supabase verificada: ${remoteVolumes.length} volúmenes, ${remoteArticles.length} artículos y ${remoteEditorial.length} miembros del comité cargados.`
        });
      } catch (err: any) {
        console.error('Error al consultar Supabase en loadData:', err);
        setSupabaseAlert({
          type: 'error',
          message: 'Error al consultar datos en Supabase',
          details: err.message || String(err)
        });
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, []);

  const handleRefreshArticles = async () => {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Faltan credenciales de Supabase en variables de entorno (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).');
      }

      const [remoteVolumes, remoteArticles, remoteEditorial] = await Promise.all([
        getVolumes(),
        getAllArticlesForEditor(),
        getEditorialBoard()
      ]);
      setVolumes(remoteVolumes);
      setArticles(remoteArticles);
      if (remoteEditorial && remoteEditorial.length > 0) {
        setEditorialBoard(remoteEditorial);
      }
      setSupabaseAlert({
        type: 'success',
        message: `Sincronización completada con Supabase (${remoteArticles.length} artículos, ${remoteEditorial.length} miembros).`
      });
    } catch (err: any) {
      console.error('Error al sincronizar con Supabase:', err);
      setSupabaseAlert({
        type: 'error',
        message: 'Error al sincronizar con Supabase',
        details: err.message || String(err)
      });
    }
  };

  // Reactive Volume mutations & refresh handlers
  const handleUpdateVolumeSuccess = (updatedVolume: Volume) => {
    setVolumes(prev => {
      if (updatedVolume.isCurrent) {
        return prev.map(v => v.id === updatedVolume.id ? updatedVolume : { ...v, isCurrent: false });
      }
      return prev.map(v => v.id === updatedVolume.id ? updatedVolume : v);
    });
  };

  const handleCreateVolumeSuccess = (newVolume: Volume) => {
    setVolumes(prev => {
      if (newVolume.isCurrent) {
        return [newVolume, ...prev.map(v => ({ ...v, isCurrent: false }))];
      }
      return [newVolume, ...prev];
    });
  };

  const handleRefreshVolumes = async () => {
    try {
      const remote = await getVolumes();
      setVolumes(remote);
      return remote;
    } catch (e) {
      console.error('Error refrescando volúmenes:', e);
      throw e;
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K to jump to search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (currentRole !== 'reader') {
          setCurrentRole('reader');
        }
        setTimeout(() => {
          const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
          if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRole]);

  // Auth Handlers
  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setCurrentRole('reader');
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Editorial and peer-review state mutations (directly executed against Supabase)
  const handleAddArticle = async (newArticle: Article) => {
    try {
      await saveArticleToSupabase(newArticle);
      setArticles(prev => [newArticle, ...prev.filter(a => a.id !== newArticle.id)]);
      setSupabaseAlert({
        type: 'success',
        message: `Artículo "${newArticle.title}" registrado correctamente en Supabase.`
      });
    } catch (err: any) {
      console.error('Error al guardar artículo en Supabase:', err);
      setSupabaseAlert({
        type: 'error',
        message: 'Error al registrar artículo en Supabase',
        details: err.message || String(err)
      });
    }
  };

  const handleUpdateArticle = async (updatedArticle: Article) => {
    try {
      await saveArticleToSupabase(updatedArticle);
      setArticles(prev => prev.map(art => art.id === updatedArticle.id ? updatedArticle : art));
      setSupabaseAlert({
        type: 'success',
        message: 'Artículo actualizado exitosamente en Supabase'
      });
      setTimeout(() => setSupabaseAlert(null), 3000);
    } catch (err: any) {
      console.error('Error al actualizar artículo en Supabase:', err);
      setSupabaseAlert({
        type: 'error',
        message: 'Error al actualizar artículo en Supabase',
        details: err.message || String(err)
      });
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      await deleteArticleFromSupabase(articleId);
      setArticles(prev => prev.filter(art => art.id !== articleId));
      setSupabaseAlert({
        type: 'success',
        message: 'Artículo y registros vinculados eliminados correctamente de Supabase'
      });
      setTimeout(() => setSupabaseAlert(null), 4000);
    } catch (err: any) {
      console.error('Error al eliminar artículo en Supabase:', err);
      setSupabaseAlert({
        type: 'error',
        message: 'Error al eliminar artículo en Supabase',
        details: err.message || String(err)
      });
    }
  };

  const handleAddReview = async (articleId: string, review: Review) => {
    try {
      await saveReviewToSupabase(review);
      setArticles(prev => prev.map(art => {
        if (art.id === articleId) {
          const updatedReviews = [...art.reviews.filter(r => r.id !== review.id), review];
          return {
            ...art,
            reviews: updatedReviews,
            status: 'under_review' as const,
            editorNotes: `Nuevo dictamen cargado por ${review.reviewerName} el ${review.submittedAt}.`
          };
        }
        return art;
      }));
      setSupabaseAlert({
        type: 'success',
        message: 'Dictamen de arbitraje guardado en Supabase (public.reviews).'
      });
    } catch (err: any) {
      console.error('Error al guardar dictamen en Supabase:', err);
      setSupabaseAlert({
        type: 'error',
        message: 'Error al guardar revisión en Supabase',
        details: err.message || String(err)
      });
    }
  };

  const handlePublishArticle = async (articleId: string, volumeId: string, doi: string) => {
    try {
      await publishArticleToVolume(articleId, volumeId, doi);
      setArticles(prev => prev.map(art => {
        if (art.id === articleId) {
          return {
            ...art,
            status: 'published' as const,
            publishedInVolumeId: volumeId,
            doi: doi,
            editorNotes: `Publicado oficialmente en el volumen [${volumeId}] con DOI: ${doi}.`
          };
        }
        return art;
      }));
      setSupabaseAlert({
        type: 'success',
        message: `Artículo publicado en Supabase (Volumen ${volumeId}, DOI: ${doi}).`
      });
    } catch (err: any) {
      console.error('Error publicando artículo en Supabase:', err);
      setSupabaseAlert({
        type: 'error',
        message: 'Error al publicar artículo en Supabase',
        details: err.message || String(err)
      });
    }
  };

  // Direct fast publication handler (Launch Flow)
  const handleDirectPublish = (newArticle: Article) => {
    // 1. Immediately update state to reflect in ReaderView and CoverHero
    const updated = [newArticle, ...articles.filter(a => a.id !== newArticle.id)];
    setArticles(updated);

    // 2. Refresh volumes and articles from Supabase in background
    handleRefreshArticles();
  };

  // Smooth scroll helper
  const scrollToCatalog = () => {
    setTimeout(() => {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const handleNavigateCurrentIssue = () => {
    setCurrentView('home');
    if (currentRole !== 'reader') {
      setCurrentRole('reader');
    }
    setSelectedVolumeFilter(currentVolume?.id || 'v1n1');
    scrollToCatalog();
  };

  const handleNavigateArchive = () => {
    setCurrentView('home');
    if (currentRole !== 'reader') {
      setCurrentRole('reader');
    }
    setSelectedVolumeFilter(null);
    scrollToCatalog();
  };

  const handleSelectVolume = (volumeId: string) => {
    setCurrentView('home');
    if (currentRole !== 'reader') {
      setCurrentRole('reader');
    }
    setSelectedVolumeFilter(volumeId);
    setSelectedArticleForReader(null);
    scrollToCatalog();
  };

  const handleSelectFeaturedArticle = (article: Article) => {
    setCurrentView('home');
    if (currentRole !== 'reader') {
      setCurrentRole('reader');
    }
    setSelectedArticleForReader(article);
  };

  // Reload real Supabase data
  const handleResetDemo = async () => {
    if (confirm('¿Desea recargar los datos directamente desde Supabase?')) {
      await handleRefreshArticles();
    }
  };

  // Published articles and active volume directly from Supabase state
  const publishedArticles = articles.filter(a => a.status === 'published');
  const currentVolume = volumes.find(v => v.isCurrent) || volumes[0] || INITIAL_VOLUMES[0];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 relative overflow-x-hidden" id="app-root-container">
      
      {/* Volumetric Ambient Lighting Orbs (Higgsfield Aesthetic) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-cyan-500/15 via-indigo-600/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/4 -left-48 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 -right-48 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-48 left-1/3 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Main Floating Navigation Header */}
      <div className="relative z-50 pt-3 sm:pt-4">
        <Header 
          currentRole={currentRole} 
          onChangeRole={setCurrentRole} 
          journalInfo={JOURNAL_INFO}
          onOpenModal={setActiveModal}
          onNavigateHome={() => {
            setCurrentView('home');
            setCurrentRole('reader');
            setSelectedArticleForReader(null);
            setSelectedVolumeFilter(null);
          }}
          onNavigateCurrentIssue={handleNavigateCurrentIssue}
          onNavigateArchive={handleNavigateArchive}
          onNavigatePartners={() => {
            setCurrentView('partners');
            setCurrentRole('reader');
            setSelectedArticleForReader(null);
          }}
          currentView={currentView}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Workspace */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow w-full space-y-6">

        {/* PUBLIC READER PORTAL */}
        {currentRole === 'reader' && (
          <>
            {currentView === 'partners' ? (
              <PartnersView 
                onNavigateHome={() => setCurrentView('home')}
                onNavigateCurrentIssue={handleNavigateCurrentIssue}
              />
            ) : (
              <>
                {/* Landing Hero "Telón Editorial" */}
                <CoverHero 
                  currentVolume={currentVolume}
                  previousVolumes={volumes.filter(v => !v.isCurrent)}
                  featuredArticles={publishedArticles}
                  onExploreCatalog={() => {
                    setSelectedVolumeFilter(null);
                    scrollToCatalog();
                  }}
                  onSelectArticle={handleSelectFeaturedArticle}
                  onOpenModal={setActiveModal}
                  onChangeRole={(role) => {
                    if (role === 'author' && !currentUser) {
                      handleOpenAuthModal('register');
                    } else {
                      setCurrentRole(role);
                    }
                  }}
                  onSelectVolume={handleSelectVolume}
                />

                {/* Reader View & Catalog */}
                <ReaderView 
                  articles={articles} 
                  volumes={volumes}
                  externalSelectedArticle={selectedArticleForReader}
                  onCloseExternalArticle={() => setSelectedArticleForReader(null)}
                  externalSearchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onOpenInstitutionalModal={setActiveModal}
                  onNavigateToAuthor={() => {
                    if (!currentUser) {
                      handleOpenAuthModal('register');
                    } else {
                      setCurrentRole('author');
                    }
                  }}
                  externalSelectedVolumeId={selectedVolumeFilter}
                  onClearVolumeFilter={() => setSelectedVolumeFilter(null)}
                />
              </>
            )}
          </>
        )}

        {/* AUTHOR RESEARCHER DASHBOARD */}
        {currentRole === 'author' && (
          <div className="fade-in bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            {!currentUser && (
              <div className="mb-6 p-4 rounded-2xl bg-teal-950/50 border border-teal-500/40 text-teal-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-white">¿Eres autor o investigador del área odontológica?</p>
                  <p className="text-slate-300 mt-0.5">Inicia sesión o regístrate para vincular tus manuscritos a tu cuenta oficial y recibir notificaciones de arbitraje.</p>
                </div>
                <button
                  onClick={() => handleOpenAuthModal('register')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs shrink-0 cursor-pointer shadow-md"
                >
                  Registrarme como Autor
                </button>
              </div>
            )}
            <AuthorDashboard 
              articles={articles} 
              onAddArticle={handleAddArticle} 
              onUpdateArticle={handleUpdateArticle}
            />
          </div>
        )}

        {/* PEER REVIEWER DASHBOARD */}
        {currentRole === 'reviewer' && (
          <div className="fade-in bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <ReviewerDashboard 
              articles={articles} 
              onAddReview={handleAddReview} 
            />
          </div>
        )}

        {/* EDITOR IN CHIEF DASHBOARD */}
        {currentRole === 'editor' && (
          <div className="fade-in bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <EditorDashboard 
              articles={articles} 
              volumes={volumes} 
              onUpdateArticle={handleUpdateArticle} 
              onPublishArticle={handlePublishArticle} 
              onDirectPublishSuccess={handleDirectPublish}
              onRefreshArticles={handleRefreshArticles}
              supabaseAlert={supabaseAlert}
            />
          </div>
        )}

        {/* SUPERADMIN CMS DASHBOARD (Centralized User & Role Management) */}
        {currentRole === 'superadmin' && (
          <div className="fade-in">
            <SuperAdminCMS 
              currentUser={currentUser || {
                id: 'usr_superadmin_creator',
                name: 'Director General / Creador COLP',
                email: 'admcentralcolp@gmail.com',
                role: 'superadmin',
                affiliation: 'Colegio de Odontólogos de La Paz (COLP)'
              }}
              articles={articles}
              volumes={volumes}
              onSwitchPerspective={setCurrentRole}
              editorialBoard={editorialBoard}
              onUpdateEditorialBoard={handleUpdateEditorialBoard}
              onRefreshEditorialBoard={handleRefreshEditorialBoard}
              onOpenEditorialModal={() => setActiveModal('about')}
              onDirectPublishSuccess={handleDirectPublish}
              onUpdateArticle={handleUpdateArticle}
              onDeleteArticle={handleDeleteArticle}
              onUpdateVolumeSuccess={handleUpdateVolumeSuccess}
              onCreateVolumeSuccess={handleCreateVolumeSuccess}
              onRefreshVolumes={handleRefreshVolumes}
              supabaseAlert={supabaseAlert}
              onRefreshSupabaseData={handleRefreshArticles}
            />
          </div>
        )}

      </main>

      {/* Authentication & Registration Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Institutional Legal & Informational Modals */}
      <InstitutionalModals 
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSelectModal={setActiveModal}
        editorialBoardMembers={editorialBoard}
      />

      {/* Institutional Footer */}
      <div className="relative z-10">
        <Footer 
          journalInfo={JOURNAL_INFO}
          onOpenModal={setActiveModal}
          onResetDemo={handleResetDemo}
        />
      </div>

    </div>
  );
}
