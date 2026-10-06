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

import { INITIAL_ARTICLES, INITIAL_VOLUMES, JOURNAL_INFO, EDITORIAL_BOARD_MEMBERS } from './data';
import { Article, Review, UserRole, Volume, InstitutionalModalType, AuthUser, EditorialMember } from './types';
import { 
  fetchArticles, 
  fetchVolumes, 
  saveArticleToSupabase, 
  saveReviewToSupabase, 
  isSupabaseConfigured,
  getCurrentUserProfile,
  logoutUser,
  supabase
} from './lib/supabase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('reader');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [articles, setArticles] = useState<Article[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [activeModal, setActiveModal] = useState<InstitutionalModalType>(null);
  const [selectedArticleForReader, setSelectedArticleForReader] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVolumeFilter, setSelectedVolumeFilter] = useState<string | null>(null);

  // Editable Editorial Board & Scientific Council
  const [editorialBoard, setEditorialBoard] = useState<EditorialMember[]>(() => {
    const stored = localStorage.getItem('oj_editorial_board');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Error parseando editorial board local');
      }
    }
    return EDITORIAL_BOARD_MEMBERS.map((m, idx) => ({
      id: 'colp_ed_' + idx,
      name: m.name,
      role: m.role,
      institution: m.institution,
      country: m.country,
      specialty: m.specialty,
      category: (m.role.toLowerCase().includes('asesor') ? 'advisory' : 'editorial') as 'editorial' | 'advisory'
    }));
  });

  const handleUpdateEditorialBoard = (updated: EditorialMember[]) => {
    setEditorialBoard(updated);
    try {
      localStorage.setItem('oj_editorial_board', JSON.stringify(updated));
    } catch (e) {
      console.error('Error guardando editorial board:', e);
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

  // 2. Load articles & volumes with Supabase remote sync and local fallback
  useEffect(() => {
    async function loadData() {
      // Immediate local load to prevent any layout shift
      const storedArticles = localStorage.getItem('oj_articles');
      const storedVolumes = localStorage.getItem('oj_volumes');

      let initialArticlesList = INITIAL_ARTICLES;
      let initialVolumesList = INITIAL_VOLUMES;

      if (storedArticles) {
        try {
          initialArticlesList = JSON.parse(storedArticles);
        } catch (e) {
          initialArticlesList = INITIAL_ARTICLES;
        }
      }
      if (storedVolumes) {
        try {
          initialVolumesList = JSON.parse(storedVolumes);
        } catch (e) {
          initialVolumesList = INITIAL_VOLUMES;
        }
      }

      setArticles(initialArticlesList);
      setVolumes(initialVolumesList);

      // Asynchronous remote sync if Supabase is reachable
      if (isSupabaseConfigured) {
        try {
          const [remoteVolumes, remoteArticles] = await Promise.all([
            fetchVolumes(),
            fetchArticles()
          ]);
          if (remoteVolumes && remoteVolumes.length > 0) {
            setVolumes(remoteVolumes);
            localStorage.setItem('oj_volumes', JSON.stringify(remoteVolumes));
          }
          if (remoteArticles && remoteArticles.length > 0) {
            setArticles(remoteArticles);
            localStorage.setItem('oj_articles', JSON.stringify(remoteArticles));
          }
        } catch (err) {
          console.warn('Supabase remote sync fallback:', err);
        }
      }
    }

    loadData();
  }, []);

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
    localStorage.setItem('oj_auth_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setCurrentRole('reader');
    localStorage.removeItem('oj_auth_user');
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // State persistence helper
  const saveState = (updatedArticles: Article[]) => {
    setArticles(updatedArticles);
    try {
      localStorage.setItem('oj_articles', JSON.stringify(updatedArticles));
    } catch (e) {
      console.error('Error guardando en LocalStorage:', e);
    }
  };

  // Editorial and peer-review state mutations (with safe background sync)
  const handleAddArticle = (newArticle: Article) => {
    const updated = [newArticle, ...articles];
    saveState(updated);
    saveArticleToSupabase(newArticle).catch(err => console.warn('Supabase background sync:', err));
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    const updated = articles.map(art => art.id === updatedArticle.id ? updatedArticle : art);
    saveState(updated);
    saveArticleToSupabase(updatedArticle).catch(err => console.warn('Supabase background sync:', err));
  };

  const handleAddReview = (articleId: string, review: Review) => {
    let targetArticle: Article | undefined;
    const updated = articles.map(art => {
      if (art.id === articleId) {
        const updatedReviews = [...art.reviews, review];
        const artWithReview = {
          ...art,
          reviews: updatedReviews,
          editorNotes: `Nuevo dictamen de revisión cargado por ${review.reviewerName} el ${review.submittedAt}.`
        };
        targetArticle = artWithReview;
        return artWithReview;
      }
      return art;
    });
    saveState(updated);
    saveReviewToSupabase(review).catch(err => console.warn('Supabase review sync:', err));
    if (targetArticle) {
      saveArticleToSupabase(targetArticle).catch(err => console.warn('Supabase article sync:', err));
    }
  };

  const handlePublishArticle = (articleId: string, volumeId: string, doi: string) => {
    let publishedArt: Article | undefined;
    const updated = articles.map(art => {
      if (art.id === articleId) {
        const pub = {
          ...art,
          status: 'published' as const,
          publishedInVolumeId: volumeId,
          doi: doi,
          editorNotes: `Publicado oficialmente en el volumen [${volumeId}] con DOI: ${doi}.`
        };
        publishedArt = pub;
        return pub;
      }
      return art;
    });
    saveState(updated);
    if (publishedArt) {
      saveArticleToSupabase(publishedArt).catch(err => console.warn('Supabase publish sync:', err));
    }
  };

  // Direct fast publication handler (Launch Flow)
  const handleDirectPublish = (newArticle: Article) => {
    // 1. Immediately update local state to reflect in ReaderView and CoverHero
    const updated = [newArticle, ...articles.filter(a => a.id !== newArticle.id)];
    saveState(updated);

    // 2. Fetch fresh articles from Supabase in background
    if (isSupabaseConfigured) {
      fetchArticles().then(remoteArticles => {
        if (remoteArticles && remoteArticles.length > 0) {
          setArticles(remoteArticles);
          localStorage.setItem('oj_articles', JSON.stringify(remoteArticles));
        }
      }).catch(err => console.warn('Supabase remote sync:', err));
    }
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
    if (currentRole !== 'reader') {
      setCurrentRole('reader');
    }
    setSelectedVolumeFilter(currentVolume.id);
    scrollToCatalog();
  };

  const handleNavigateArchive = () => {
    if (currentRole !== 'reader') {
      setCurrentRole('reader');
    }
    setSelectedVolumeFilter(null);
    scrollToCatalog();
  };

  const handleSelectVolume = (volumeId: string) => {
    if (currentRole !== 'reader') {
      setCurrentRole('reader');
    }
    setSelectedVolumeFilter(volumeId);
    setSelectedArticleForReader(null);
    scrollToCatalog();
  };

  const handleSelectFeaturedArticle = (article: Article) => {
    if (currentRole !== 'reader') {
      setCurrentRole('reader');
    }
    setSelectedArticleForReader(article);
  };

  // Reset demo states
  const handleResetDemo = () => {
    if (confirm('¿Desea restaurar el entorno? Se borrarán los datos temporales en caché y se recargarán los de fábrica.')) {
      localStorage.removeItem('oj_articles');
      localStorage.removeItem('oj_volumes');
      localStorage.removeItem('oj_auth_user');
      localStorage.removeItem('oj_editorial_board');
      setArticles(INITIAL_ARTICLES);
      setVolumes(INITIAL_VOLUMES);
      setEditorialBoard(EDITORIAL_BOARD_MEMBERS.map((m, idx) => ({
        id: 'colp_ed_' + idx,
        name: m.name,
        role: m.role,
        institution: m.institution,
        country: m.country,
        specialty: m.specialty,
        category: (m.role.toLowerCase().includes('asesor') ? 'advisory' : 'editorial') as 'editorial' | 'advisory'
      })));
      setCurrentUser(null);
      setCurrentRole('reader');
      setSelectedArticleForReader(null);
      setSelectedVolumeFilter(null);
      setSearchQuery('');
    }
  };

  // Published articles and active volume
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
            setCurrentRole('reader');
            setSelectedArticleForReader(null);
            setSelectedVolumeFilter(null);
          }}
          onNavigateCurrentIssue={handleNavigateCurrentIssue}
          onNavigateArchive={handleNavigateArchive}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentUser={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Workspace */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow w-full">
        
        {/* PUBLIC READER PORTAL */}
        {currentRole === 'reader' && (
          <>
            {/* Landing Hero "Telón Editorial" */}
            <CoverHero 
              currentVolume={currentVolume}
              previousVolumes={volumes.filter(v => !v.isCurrent)}
              featuredArticles={publishedArticles.slice(0, 4)}
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
              onOpenEditorialModal={() => setActiveModal('about')}
              onDirectPublishSuccess={handleDirectPublish}
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
