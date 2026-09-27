import React, { useState, useEffect } from 'react';
import { Volume, Article, InstitutionalModalType, UserRole } from '../types';
import { JOURNAL_INFO, JOURNAL_IMPACT_METRICS } from '../data';
import { 
  BookOpen, 
  Download, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Award, 
  ArrowDown, 
  Sparkles, 
  Check, 
  FileText, 
  FileCheck2,
  Users,
  Eye,
  Clock,
  PenTool,
  ExternalLink
} from 'lucide-react';
import logoImg from '../assets/images/scientia_dentis_logo_1788278899814.jpg';
import dentalHeroImg from '../assets/images/dental_research_hero_1790466211700.jpg';

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
      className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] mb-12 bg-slate-950"
      id="editorial-cover-hero"
    >
      {/* Background Volumetric Image Banner with Cinematic Masking */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img 
          src={dentalHeroImg} 
          alt="Dental Research Laboratory" 
          className="w-full h-full object-cover object-center opacity-25 scale-105 filter blur-[0.5px]"
          referrerPolicy="no-referrer"
        />
        {/* Multidirectional Gradients for Atmospheric Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/90" />
        <div className="absolute -top-40 left-1/3 w-[600px] h-[400px] bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -left-32 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[150px]" />
      </div>

      {/* Top Glass Ribbon Bar */}
      <div className="relative border-b border-white/10 px-6 sm:px-10 py-3.5 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3 backdrop-blur-xl bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e9e5db] border border-cyan-400/40 p-0.5 shrink-0 flex items-center justify-center shadow-xs">
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
            <span className="font-mono text-cyan-400 font-semibold">{JOURNAL_INFO.issn}</span>
            <span className="text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
            <span className="text-slate-400 hidden sm:inline">Arbitraje por Pares Doble Ciego</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button 
            onClick={() => onOpenModal('guidelines')}
            className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hover:underline">Normas Vancouver</span>
          </button>
          <span className="text-slate-700" aria-hidden="true">/</span>
          <button 
            onClick={() => onOpenModal('about')}
            className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hover:underline">Comité Científico</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Hero Showcase */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: 3D Monograph Cover & Spotlight */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* 3D Perspective Book Frame with Volumetric Shadow & Spotlight Glow */}
            <div className="relative group perspective-1000 mb-6">
              
              {/* Volumetric Spotlight Orb Behind Book */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/30 via-blue-600/25 to-teal-400/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 pointer-events-none" />

              {/* Book Spine and Cover Container */}
              <div className="relative w-64 sm:w-72 aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(6,182,212,0.2)] border-2 border-white/20 transform lg:rotate-y-[-6deg] group-hover:rotate-y-0 group-hover:scale-[1.02] transition-all duration-500 bg-slate-900 flex flex-col justify-between">
                
                {/* Book Cover Photography */}
                <img 
                  src={currentVolume.coverImage} 
                  alt={currentVolume.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Gradient Contrast Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/70" />

                {/* Spine Highlight Reflection Effect */}
                <div className="absolute top-0 bottom-0 left-0 w-5 bg-gradient-to-r from-white/25 via-white/10 to-transparent pointer-events-none" />

                {/* Cover Header */}
                <div className="relative p-5 z-10 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-300 font-bold bg-slate-950/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-cyan-500/40 shadow-xs">
                      Vol. {currentVolume.volumeNumber} · Núm. {currentVolume.issueNumber}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-300">
                      {currentVolume.year}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <h3 className="font-serif text-xl font-bold text-white leading-tight drop-shadow-lg">
                      Scientia Dentis
                    </h3>
                    <p className="text-xs text-cyan-300 italic font-serif mt-0.5">
                      "Revista Científica"
                    </p>
                  </div>
                </div>

                {/* Cover Footer */}
                <div className="relative p-5 z-10 text-left border-t border-white/10 bg-slate-950/85 backdrop-blur-md">
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                    Órgano Oficial COLP
                  </p>
                  <p className="text-xs text-white font-medium line-clamp-2 mt-1 leading-snug">
                    {currentVolume.title.split(':')[1] || currentVolume.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-mono">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span>Publicado: {currentVolume.publishedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Volume Action Buttons */}
            <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={onExploreCatalog}
                id="btn-explore-current-issue"
                className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.55)] border border-cyan-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
              >
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Explorar Artículos</span>
                <ArrowDown className="w-3.5 h-3.5 opacity-80 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={handleDownloadFullIssue}
                disabled={isDownloadingPdf}
                id="btn-download-full-pdf"
                className="px-4 py-3 backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/20 text-slate-200 hover:text-white font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:border-cyan-400/40 shadow-sm"
                title="Descargar el fascículo completo en formato PDF con metadatos"
              >
                {isDownloadingPdf ? (
                  <>
                    <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Compilando...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-xs">¡Descargado!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs">PDF Fascículo</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 mt-2.5 font-mono text-center lg:text-left flex items-center justify-center lg:justify-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Edición en Acceso Abierto Libre (CC BY 4.0)</span>
            </p>
          </div>

          {/* Right Column: Editorial Mission, Featured Carousel & Submission Pitch */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title Lockup with Pulsing Glow Badge */}
            <div>
              {/* Pulsing Glow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-medium mb-3.5 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span>Nueva Edición Semestral · La Paz, Bolivia</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.12]">
                Scientia Dentis
              </h1>
              <p className="font-serif italic text-lg sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-blue-400 font-semibold mt-1">
                "Revista Científica"
              </p>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mt-4 max-w-2xl font-sans">
                Órgano Oficial del <strong>Colegio de Odontólogos de La Paz (COLP)</strong>. 
                Investigaciones biomédicas estomatológicas, implantología oseointegrada, avances tisulares 
                y casos clínicos de excelencia con arbitraje ciego internacional.
              </p>
            </div>

            {/* Slider / Carousel of Featured Articles (Glassmorphism Higsfield Style) */}
            {featuredArticles.length > 0 && activeArticle && (
              <div className="glass-card rounded-2xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden shadow-2xl border border-white/10">
                
                {/* Header of the Slider Card */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                      Destacado {currentSlide + 1} de {featuredArticles.length}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">·</span>
                    <span className="text-xs text-cyan-300 font-medium">
                      {activeArticle.category}
                    </span>
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevSlide}
                      title="Artículo anterior"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      title="Siguiente artículo"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
                      <span className="text-emerald-400 font-medium">Arbitrado por Pares</span>
                    </div>

                    <button
                      onClick={() => onSelectArticle(activeArticle)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Leer Documento Completo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-1.5 mt-4 pt-2 border-t border-white/10">
                  {featuredArticles.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAutoplayActive(false);
                        setCurrentSlide(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx ? 'w-6 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Ir al artículo ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions Strip (Neomorphic & Glass Glow) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div 
                onClick={() => onChangeRole('author')}
                className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-teal-950/30 hover:border-teal-400/40 transition-all cursor-pointer group flex items-start gap-3 shadow-lg"
              >
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 group-hover:scale-105 transition-transform shadow-teal-500/20">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs sm:text-sm text-white group-hover:text-teal-300 transition-colors flex items-center gap-1.5">
                    <span>Enviar Manuscrito</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Convocatoria abierta para el Vol. 12 Núm. 2. Sin costo (No APC).
                  </p>
                </div>
              </div>

              <div 
                onClick={() => onOpenModal('guidelines')}
                className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-cyan-950/30 hover:border-cyan-400/40 transition-all cursor-pointer group flex items-start gap-3 shadow-lg"
              >
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 group-hover:scale-105 transition-transform shadow-cyan-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                    <span>Directrices Vancouver</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Estructura IMRyD, listas CONSORT / PRISMA y ética en IA.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Impact Statistics Cards Grid with Luminous Accent */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {JOURNAL_IMPACT_METRICS.map((stat, i) => (
              <div 
                key={i} 
                className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all backdrop-blur-md"
              >
                <span className="font-mono text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 block tabular-nums">
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

        {/* Transition Anchor Button to Catalog with Floating Animation */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={onExploreCatalog}
            id="scroll-to-catalog-btn"
            className="group flex flex-col items-center gap-2 text-xs text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <span className="font-medium tracking-wide">Desplazarse al Catálogo de Artículos y Filtros</span>
            <div className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center group-hover:border-cyan-400 group-hover:bg-cyan-950/50 shadow-md group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
              <ArrowDown className="w-4 h-4 animate-bounce text-slate-300 group-hover:text-cyan-400" />
            </div>
          </button>
        </div>

      </div>
    </section>
  );
}
