import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CoverHero from './components/CoverHero';
import ReaderView from './components/ReaderView';
import AuthorDashboard from './components/AuthorDashboard';
import ReviewerDashboard from './components/ReviewerDashboard';
import EditorDashboard from './components/EditorDashboard';
import Footer from './components/Footer';
import InstitutionalModals from './components/InstitutionalModals';

import { INITIAL_ARTICLES, INITIAL_VOLUMES, JOURNAL_INFO } from './data';
import { Article, Review, UserRole, Volume, InstitutionalModalType } from './types';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('reader');
  const [articles, setArticles] = useState<Article[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [activeModal, setActiveModal] = useState<InstitutionalModalType>(null);
  const [selectedArticleForReader, setSelectedArticleForReader] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Load initial state from LocalStorage or Data defaults
  useEffect(() => {
    const storedArticles = localStorage.getItem('oj_articles');
    const storedVolumes = localStorage.getItem('oj_volumes');

    if (storedArticles) {
      try {
        setArticles(JSON.parse(storedArticles));
      } catch (e) {
        setArticles(INITIAL_ARTICLES);
      }
    } else {
      setArticles(INITIAL_ARTICLES);
    }

    if (storedVolumes) {
      try {
        setVolumes(JSON.parse(storedVolumes));
      } catch (e) {
        setVolumes(INITIAL_VOLUMES);
      }
    } else {
      setVolumes(INITIAL_VOLUMES);
    }
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

  // 2. Persist state changes
  const saveState = (updatedArticles: Article[], updatedVolumes?: Volume[]) => {
    setArticles(updatedArticles);
    localStorage.setItem('oj_articles', JSON.stringify(updatedArticles));

    if (updatedVolumes) {
      setVolumes(updatedVolumes);
      localStorage.setItem('oj_volumes', JSON.stringify(updatedVolumes));
    }
  };

  // 3. Editorial and peer-review state mutations
  const handleAddArticle = (newArticle: Article) => {
    const updated = [newArticle, ...articles];
    saveState(updated);
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    const updated = articles.map(art => art.id === updatedArticle.id ? updatedArticle : art);
    saveState(updated);
  };

  const handleAddReview = (articleId: string, review: Review) => {
    const updated = articles.map(art => {
      if (art.id === articleId) {
        const updatedReviews = [...art.reviews, review];
        return {
          ...art,
          reviews: updatedReviews,
          editorNotes: `Nuevo dictamen de revisión cargado por ${review.reviewerName} el ${review.submittedAt}.`
        };
      }
      return art;
    });
    saveState(updated);
  };

  const handlePublishArticle = (articleId: string, volumeId: string, doi: string) => {
    const updated = articles.map(art => {
      if (art.id === articleId) {
        return {
          ...art,
          status: 'published' as const,
          publishedInVolumeId: volumeId,
          doi,
          editorNotes: `Publicado oficialmente en el volumen [${volumeId}] con DOI: ${doi}.`
        };
      }
      return art;
    });
    saveState(updated);
  };

  // Smooth scroll helper
  const scrollToCatalog = () => {
    if (currentRole !== 'reader') {
      setCurrentRole('reader');
    }
    setTimeout(() => {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation handlers
  const handleNavigateHome = () => {
    if (currentRole !== 'reader') {
      setCurrentRole('reader');
    }
    scrollToTop();
  };

  const handleNavigateCurrentIssue = () => {
    scrollToCatalog();
  };

  const handleNavigateArchive = () => {
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
    if (confirm('¿Desea restaurar el entorno simulado? Se borrarán todos los nuevos envíos y evaluaciones que haya registrado para volver a los valores iniciales de fábrica.')) {
      localStorage.removeItem('oj_articles');
      localStorage.removeItem('oj_volumes');
      setArticles(INITIAL_ARTICLES);
      setVolumes(INITIAL_VOLUMES);
      setCurrentRole('reader');
      setSelectedArticleForReader(null);
      setSearchQuery('');
      alert('Entorno de prueba restaurado con éxito.');
    }
  };

  // Published articles and active volume
  const publishedArticles = articles.filter(a => a.status === 'published');
  const currentVolume = volumes.find(v => v.isCurrent) || volumes[0] || INITIAL_VOLUMES[0];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 relative overflow-x-hidden" id="app-root-container">
      
      {/* Volumetric Ambient Lighting Orbs (Higgsfield Aesthetic) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Central Beam */}
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-cyan-500/15 via-indigo-600/10 to-transparent rounded-full blur-[140px]" />
        {/* Left Cyan Ambient Orb */}
        <div className="absolute top-1/4 -left-48 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px]" />
        {/* Right Violet/Indigo Ambient Orb */}
        <div className="absolute top-1/2 -right-48 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px]" />
        {/* Bottom Teal Ambient Glow */}
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[400px] bg-teal-500/10 rounded-full blur-[150px]" />
        {/* Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(3,7,18,0.75)_100%)]" />
      </div>

      {/* Floating Header */}
      <div className="relative z-50">
        <Header 
          currentRole={currentRole} 
          onChangeRole={setCurrentRole} 
          journalInfo={JOURNAL_INFO}
          onOpenModal={setActiveModal}
          onNavigateHome={handleNavigateHome}
          onNavigateCurrentIssue={handleNavigateCurrentIssue}
          onNavigateArchive={handleNavigateArchive}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Main Content Workspace */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow w-full">
        {currentRole === 'reader' && (
          <>
            {/* Landing Hero "Telón Editorial" */}
            <CoverHero 
              currentVolume={currentVolume}
              featuredArticles={publishedArticles.slice(0, 4)}
              onExploreCatalog={scrollToCatalog}
              onSelectArticle={handleSelectFeaturedArticle}
              onOpenModal={setActiveModal}
              onChangeRole={setCurrentRole}
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
              onNavigateToAuthor={() => setCurrentRole('author')}
            />
          </>
        )}

        {currentRole === 'author' && (
          <div className="fade-in bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <AuthorDashboard 
              articles={articles} 
              onAddArticle={handleAddArticle} 
              onUpdateArticle={handleUpdateArticle}
            />
          </div>
        )}

        {currentRole === 'reviewer' && (
          <div className="fade-in bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <ReviewerDashboard 
              articles={articles} 
              onAddReview={handleAddReview} 
            />
          </div>
        )}

        {currentRole === 'editor' && (
          <div className="fade-in bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <EditorDashboard 
              articles={articles} 
              volumes={volumes} 
              onUpdateArticle={handleUpdateArticle} 
              onPublishArticle={handlePublishArticle} 
            />
          </div>
        )}
      </main>

      {/* Institutional Legal & Informational Modals */}
      <InstitutionalModals 
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSelectModal={setActiveModal}
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
