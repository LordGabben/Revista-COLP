import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ReaderView from './components/ReaderView';
import AuthorDashboard from './components/AuthorDashboard';
import ReviewerDashboard from './components/ReviewerDashboard';
import EditorDashboard from './components/EditorDashboard';

import { INITIAL_ARTICLES, INITIAL_VOLUMES, JOURNAL_INFO } from './data';
import { Article, Review, UserRole, Volume } from './types';
import { ShieldAlert, BookOpen, GraduationCap, Award } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('reader');
  const [articles, setArticles] = useState<Article[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);

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
        
        // If article now has 2 or more reviews, we can keep the under_review status
        // or notify the editor. Let's append the review and update notes
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

  // Reset demo states to help testers
  const handleResetDemo = () => {
    if (confirm('¿Desea restaurar el entorno simulado? Se borrarán todos los nuevos envíos y evaluaciones que haya registrado para volver a los valores originales.')) {
      localStorage.removeItem('oj_articles');
      localStorage.removeItem('oj_volumes');
      setArticles(INITIAL_ARTICLES);
      setVolumes(INITIAL_VOLUMES);
      setCurrentRole('reader');
      alert('Entorno restaurado con éxito.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="app-root-container">
      {/* Upper Navigation and role selectors */}
      <Header 
        currentRole={currentRole} 
        onChangeRole={setCurrentRole} 
        journalInfo={JOURNAL_INFO} 
      />

      {/* Main Content Workspace wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {currentRole === 'reader' && (
          <ReaderView 
            articles={articles} 
            volumes={volumes} 
          />
        )}

        {currentRole === 'author' && (
          <AuthorDashboard 
            articles={articles} 
            onAddArticle={handleAddArticle} 
            onUpdateArticle={handleUpdateArticle}
          />
        )}

        {currentRole === 'reviewer' && (
          <ReviewerDashboard 
            articles={articles} 
            onAddReview={handleAddReview} 
          />
        )}

        {currentRole === 'editor' && (
          <EditorDashboard 
            articles={articles} 
            volumes={volumes} 
            onUpdateArticle={handleUpdateArticle} 
            onPublishArticle={handlePublishArticle} 
          />
        )}
      </main>

      {/* Premium Academic Footer */}
      <footer className="bg-slate-900 text-white mt-12 border-t-4 border-brand-700 shrink-0" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-slate-400">
            {/* Branding / Institution */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-500" />
                <span className="font-serif font-bold text-sm text-white tracking-wide">{JOURNAL_INFO.shortName} • OJS</span>
              </div>
              <p className="leading-relaxed">
                <strong>Scientia Dentis "Revista Científica"</strong> es el Órgano Oficial del Colegio de Odontólogos de La Paz (COLP). Sistema Open Journal Systems (OJS) para garantizar flujos de investigación estomatológica rigurosa, transparente y de acceso abierto.
              </p>
              <button
                onClick={handleResetDemo}
                className="text-[10px] text-teal-400 font-bold font-mono hover:underline cursor-pointer flex items-center gap-1 mt-2 bg-slate-800 px-2.5 py-1 rounded border border-slate-700"
              >
                Resetear Entorno de Prueba OJS
              </button>
            </div>

            {/* Scientific Policies */}
            <div className="space-y-2.5">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Políticas Editoriales</h4>
              <ul className="space-y-1.5 pl-0">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0"></span>
                  <span>Evaluación por pares doble ciego independiente</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0"></span>
                  <span>Protección anti-plagio (Crossref Similarity Check)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0"></span>
                  <span>Políticas de autoarchivo CC BY-NC-ND 4.0</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0"></span>
                  <span>Preservación digital permanente (LOCKSS/CLOCKSS)</span>
                </li>
              </ul>
            </div>

            {/* License & Contact */}
            <div className="space-y-3 text-slate-400">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono">Soporte y Contacto</h4>
              <p className="leading-relaxed">
                Colegio de Odontólogos de La Paz (COLP)<br />
                Comité Editorial: <span className="text-slate-200">scientia.dentis@colp.org.bo</span><br />
                ISSN Electrónico: <span className="text-slate-200 font-mono">2448-8976</span>
              </p>
              <div className="flex gap-3 pt-1">
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 uppercase text-[9px] font-bold font-mono">CC BY-NC</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 uppercase text-[9px] font-bold font-mono">Open Access</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 uppercase text-[9px] font-bold font-mono">COLP Oficial</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} Scientia Dentis "Revista Científica" - Órgano Oficial del Colegio de Odontólogos de La Paz. Todos los derechos de los artículos son cedidos bajo licencia internacional Creative Commons.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
