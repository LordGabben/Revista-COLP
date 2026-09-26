import React, { useState, useEffect } from 'react';
import { Volume, Article, InstitutionalModalType, UserRole } from '../types';
import { JOURNAL_INFO, JOURNAL_IMPACT_METRICS } from '../data';
import { 
  BookOpen, 
  Download, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  ExternalLink, 
  Award, 
  ArrowDown, 
  Sparkles, 
  Check, 
  Clock, 
  Globe, 
  FileText, 
  FileCheck2,
  Users,
  Eye,
  Search
} from 'lucide-react';
import logoImg from '../assets/images/scientia_dentis_logo_1788278899814.jpg';

interface CoverHeroProps {
  currentVolume: Volume;
  featuredArticles: Article[];
  onExploreCatalog: () => void;
  onSelectArticle: (article: Article) => void;
  onOpenModal: (modal: InstitutionalModalType) => void;
  onChangeRole: (role: UserRole) => void;
}

export default function CoverHero({
  currentVolume,
  featuredArticles,
  onExploreCatalog,
  onSelectArticle,
  onOpenModal,
  onChangeRole
}: CoverHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [autoplayActive, setAutoplayActive] = useState(true);

  // Auto-advance featured slider every 6 seconds if not paused
  useEffect(() => {
    if (!autoplayActive || featuredArticles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredArticles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoplayActive, featuredArticles.length]);

  const activeArticle = featuredArticles[currentSlide] || featuredArticles[0];

  const handleDownloadFullIssue = () => {
    setIsDownloadingPdf(true);
    setDownloadSuccess(false);

    // Simulate high-resolution multi-page PDF compilation and download
    setTimeout(() => {
      setIsDownloadingPdf(false);
      setDownloadSuccess(true);

      // Create a dummy blob download for realistic browser interaction
      const element = document.createElement("a");
      const file = new Blob([
        `Scientia Dentis "Revista Científica"\nÓrgano Oficial del Colegio de Odontólogos de La Paz (COLP)\n\n${currentVolume.title}\ne-ISSN: 2448-8976\nFecha de Edición: ${currentVolume.publishedAt}\n\nSumario de Artículos Arbitrados y Evaluados por Pares a Doble Ciego.`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Scientia_Dentis_Vol${currentVolume.volumeNumber}_Num${currentVolume.issueNumber}_Edicion_Completa.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 1500);
  };

  const handlePrevSlide = () => {
    setAutoplayActive(false);
    setCurrentSlide(prev => (prev - 1 + featuredArticles.length) % featuredArticles.length);
  };

  const handleNextSlide = () => {
    setAutoplayActive(false);
    setCurrentSlide(prev => (prev + 1) % featuredArticles.length);
  };

  return (
    <section 
      className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-12"
      id="editorial-cover-hero"
    >
      {/* Decorative Atmospheric Mesh Grid & Light Beam */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.18),transparent_70%)] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Subtle Institutional Ribbon */}
      <div className="relative border-b border-white/10 px-6 sm:px-10 py-3.5 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3 backdrop-blur-md bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e9e5db] border border-amber-400/40 p-0.5 shrink-0 flex items-center justify-center shadow-xs">
            <img 
              src={logoImg} 
              alt="COLP Logo" 
              className="w-full h-full object-contain mix-blend-multiply" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-white tracking-wide">Colegio de Odontólogos de La Paz</span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="font-mono text-cyan-400 font-medium">{JOURNAL_INFO.issn}</span>
            <span className="text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-slate-400 hidden sm:inline">Arbitraje Doble Ciego Internacional</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button 
            onClick={() => onOpenModal('guidelines')}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hover:underline">Normas de Publicación</span>
          </button>
          <span className="text-slate-600" aria-hidden="true">/</span>
          <button 
            onClick={() => onOpenModal('about')}
            className="text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hover:underline">Consejo Científico</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Hero Showcase */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Monograph Cover in 3D Perspective + Actions */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* 3D Perspective Book Frame */}
            <div className="relative group perspective-1000 mb-6">
              {/* Subtle Ambient Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-teal-400/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity" />
              
              {/* Book Spine and Cover Container */}
              <div className="relative w-64 sm:w-72 aspect-[3/4] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border-2 border-slate-700/80 transform lg:rotate-y-[-6deg] group-hover:rotate-y-0 group-hover:scale-[1.02] transition-all duration-500 bg-slate-900 flex flex-col justify-between">
                
                {/* Book Texture / Overlay Scrim */}
                <img 
                  src={currentVolume.coverImage} 
                  alt={currentVolume.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Gradient Contrast Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70" />

                {/* Spine Highlight Effect */}
                <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-white/20 via-white/5 to-transparent pointer-events-none" />

                {/* Cover Header */}
                <div className="relative p-5 z-10 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-300 font-bold bg-slate-950/60 px-2 py-0.5 rounded border border-white/10">
                      Vol. {currentVolume.volumeNumber} · Núm. {currentVolume.issueNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300">
                      {currentVolume.year}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <h3 className="font-serif text-lg font-bold text-white leading-tight drop-shadow-md">
                      Scientia Dentis
                    </h3>
                    <p className="text-[11px] text-slate-300 italic font-serif mt-0.5">
                      "Revista Científica"
                    </p>
                  </div>
                </div>

                {/* Cover Footer */}
                <div className="relative p-5 z-10 text-left border-t border-white/10 bg-slate-950/80 backdrop-blur-xs">
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    Órgano Oficial COLP
                  </p>
                  <p className="text-xs text-white font-medium line-clamp-2 mt-1 leading-snug">
                    {currentVolume.title.split(':')[1] || currentVolume.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-mono">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Publicación: {currentVolume.publishedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Volume Action Buttons */}
            <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={onExploreCatalog}
                id="btn-explore-current-issue"
                className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-900/40 hover:shadow-cyan-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explorar Edición Actual</span>
              </button>

              <button
                onClick={handleDownloadFullIssue}
                disabled={isDownloadingPdf}
                id="btn-download-full-pdf"
                className="px-4 py-3 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 hover:text-white font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                title="Descargar el fascículo completo en formato PDF con metadatos"
              >
                {isDownloadingPdf ? (
                  <>
                    <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Compilando...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">¡Descargado!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>PDF Fascículo</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 mt-2.5 font-mono text-center lg:text-left">
              Fascículo Oficial en Acceso Abierto (Licencia CC BY 4.0)
            </p>
          </div>

          {/* Right Column: Editorial Mission, Featured Carousel & Submission Pitch */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title Lockup */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium mb-3 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edición Semestral Arbitrada • La Paz, Bolivia</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Scientia Dentis
              </h1>
              <p className="font-serif italic text-lg sm:text-xl text-cyan-300 font-semibold mt-1">
                "Revista Científica"
              </p>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl font-sans">
                La plataforma de divulgación científica del <strong>Colegio de Odontólogos de La Paz (COLP)</strong>. 
                Investigaciones clínicas originales, avances biomateriales, implantología y estomatología de vanguardia 
                con riguroso arbitraje de pares a doble ciego internacional.
              </p>
            </div>

            {/* Slider / Carousel of Featured Articles */}
            {featuredArticles.length > 0 && activeArticle && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-md relative overflow-hidden shadow-xl">
                {/* Header of the Slider Card */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                      Artículo Destacado {currentSlide + 1} de {featuredArticles.length}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">·</span>
                    <span className="text-xs text-slate-300 font-medium">
                      {activeArticle.category}
                    </span>
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevSlide}
                      title="Artículo anterior"
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      title="Siguiente artículo"
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Article Info */}
                <div className="space-y-2.5">
                  <h4 
                    onClick={() => onSelectArticle(activeArticle)}
                    className="font-serif text-base sm:text-lg font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer leading-snug line-clamp-2"
                  >
                    {activeArticle.title}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="line-clamp-1">{activeArticle.authors.join(', ')}</span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                    {activeArticle.abstract.replace('INTRODUCCIÓN:', '').split('MÉTODOS:')[0].trim()}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                      <span>DOI: {activeArticle.doi ? activeArticle.doi.replace('https://doi.org/', '') : '10.58472/sd.2026'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400">Revisado por Pares</span>
                    </div>

                    <button
                      onClick={() => onSelectArticle(activeArticle)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Leer Documento Completo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-1.5 mt-4 pt-2 border-t border-slate-800/60">
                  {featuredArticles.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAutoplayActive(false);
                        setCurrentSlide(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Ir al artículo ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div 
                onClick={() => onChangeRole('author')}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all cursor-pointer group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 group-hover:scale-110 transition-transform">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors">
                    Convocatoria Abierta: Enviar Manuscrito
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Recepción continua para el Vol. 12 Núm. 2. Sin costo de publicación (No APC).
                  </p>
                </div>
              </div>

              <div 
                onClick={() => onOpenModal('guidelines')}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all cursor-pointer group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors">
                    Directrices Éticas y Formato Vancouver
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Estructura IMRyD, listas CONSORT / PRISMA y declaración de uso de IA.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Impact Statistics Cards Grid */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {JOURNAL_IMPACT_METRICS.map((stat, i) => (
              <div 
                key={i} 
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors backdrop-blur-xs"
              >
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 block tabular-nums">
                  {stat.value}
                </span>
                <h5 className="font-semibold text-xs text-white mt-1">
                  {stat.label}
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Transition Anchor Button to Catalog */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onExploreCatalog}
            id="scroll-to-catalog-btn"
            className="group flex flex-col items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <span className="font-medium tracking-wide">Desplazarse al Catálogo de Artículos y Filtros</span>
            <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center group-hover:border-cyan-400 group-hover:bg-cyan-950/40 transition-all">
              <ArrowDown className="w-4 h-4 animate-bounce text-slate-300 group-hover:text-cyan-400" />
            </div>
          </button>
        </div>

      </div>
    </section>
  );
}
