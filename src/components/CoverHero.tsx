import React, { useState, useEffect } from 'react';
import { Volume, Article, InstitutionalModalType, UserRole } from '../types';
import { 
  JOURNAL_INFO, 
  INITIAL_VOLUMES, 
  INITIAL_ARTICLES,
  coverBiomaterialsImg, 
  coverEndodonticsImg, 
  coverPediatricImg, 
  coverZygomaticImg 
} from '../data';
import { 
  BookOpen, 
  Download, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Award, 
  ArrowDown, 
  Check, 
  FileText, 
  Users,
  PenTool,
  Archive,
  Sparkles,
  ShieldCheck,
  Landmark
} from 'lucide-react';
import logoImg from '../assets/images/scientia_dentis_logo_1788278899814.jpg';
import ColpLogo from './ColpLogo';
import dentalHeroImg from '../assets/images/dental_research_hero_1790466211700.jpg';
import { resolveVolumeCover } from '../lib/supabase';

export const DEFAULT_INSTITUTIONAL_PRESENTATION = 
  'Scientia Dentis es el Órgano Oficial de difusión científica y académica del Ilustre Colegio de Odontólogos de La Paz (COLP). Publicación arbitrada por pares a doble ciego, orientada a la difusión de investigaciones estomatológicas de vanguardia, innovaciones clínicas, biomateriales y salud pública bucal bajo los más rigurosos estándares éticos de Ciencia Abierta (Acceso Abierto Diamante sin cobro de APC).';

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

function getArticleCover(article: Article): string {
  if (article.cover_image_url && article.cover_image_url.trim().length > 0) {
    return article.cover_image_url;
  }
  return CATEGORY_DEFAULT_COVERS[article.category] || coverBiomaterialsImg;
}

interface CoverHeroProps {
  currentVolume?: Volume;
  featuredArticles?: Article[];
  previousVolumes?: Volume[];
  onExploreCatalog: () => void;
  onSelectArticle?: (article: Article) => void;
  onOpenModal: (modal: InstitutionalModalType) => void;
  onChangeRole: (role: UserRole) => void;
  onSelectVolume?: (volumeId: string) => void;
}

export default function CoverHero({
  currentVolume: propCurrentVolume,
  featuredArticles,
  previousVolumes,
  onExploreCatalog,
  onSelectArticle,
  onOpenModal,
  onChangeRole,
  onSelectVolume
}: CoverHeroProps) {
  const currentVolume = propCurrentVolume || INITIAL_VOLUMES[0];

  // Articles for the continuous infinite marquee carousel
  const rawArticles = (featuredArticles && featuredArticles.length > 0)
    ? featuredArticles
    : INITIAL_ARTICLES.filter(a => a.status === 'published');

  // Support seamless infinite loop by replicating elements if list is small
  const marqueeArticles = rawArticles.length === 0
    ? []
    : rawArticles.length < 5
      ? [...rawArticles, ...rawArticles, ...rawArticles, ...rawArticles]
      : [...rawArticles, ...rawArticles];

  // Archive volumes list (previous issues)
  const archiveVolumes: Volume[] = (previousVolumes && previousVolumes.length > 0)
    ? previousVolumes
    : INITIAL_VOLUMES.filter(v => !v.isCurrent);

  const [activeCoverIndex, setActiveCoverIndex] = useState(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDownloadingArchivePdf, setIsDownloadingArchivePdf] = useState(false);
  const [archiveDownloadSuccess, setArchiveDownloadSuccess] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Dynamic continuous auto-advance every 2.8s (2800ms) with smooth transitions, paused on hover
  useEffect(() => {
    if (autoplayPaused || archiveVolumes.length <= 1) return;
    const timer = setInterval(() => {
      setActiveCoverIndex(prev => (prev + 1) % archiveVolumes.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [autoplayPaused, archiveVolumes.length]);

  const activeArchiveVol = archiveVolumes[activeCoverIndex] || archiveVolumes[0] || INITIAL_VOLUMES[1] || INITIAL_VOLUMES[0];

  const handlePrevVolume = () => {
    setAutoplayPaused(true);
    setActiveCoverIndex(prev => (prev - 1 + archiveVolumes.length) % archiveVolumes.length);
  };

  const handleNextVolume = () => {
    setAutoplayPaused(true);
    setActiveCoverIndex(prev => (prev + 1) % archiveVolumes.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNextVolume();
      } else {
        handlePrevVolume();
      }
    }
    setTouchStartX(null);
  };

  const handleDownloadFullIssue = () => {
    setIsDownloadingPdf(true);
    setDownloadSuccess(false);

    if (currentVolume.pdfUrl) {
      window.open(currentVolume.pdfUrl, '_blank');
      setIsDownloadingPdf(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
      return;
    }

    setTimeout(() => {
      setIsDownloadingPdf(false);
      setDownloadSuccess(true);

      const element = document.createElement("a");
      const file = new Blob([
        `Scientia Dentis "Revista Científica"\nÓrgano Oficial del Colegio de Odontólogos de La Paz (COLP)\n\n${currentVolume.title}\nFecha de Edición: ${currentVolume.publishedAt}\n\nSumario de Artículos Arbitrados y Evaluados por Pares a Doble Ciego.`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Scientia_Dentis_Vol${currentVolume.volumeNumber}_Num${currentVolume.issueNumber}_Edicion_Completa.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 600);
  };

  const handleDownloadArchiveIssue = (vol: Volume) => {
    setIsDownloadingArchivePdf(true);
    setArchiveDownloadSuccess(false);

    if (vol.pdfUrl) {
      window.open(vol.pdfUrl, '_blank');
      setIsDownloadingArchivePdf(false);
      setArchiveDownloadSuccess(true);
      setTimeout(() => setArchiveDownloadSuccess(false), 3000);
      return;
    }

    setTimeout(() => {
      setIsDownloadingArchivePdf(false);
      setArchiveDownloadSuccess(true);

      const element = document.createElement("a");
      const file = new Blob([
        `Scientia Dentis "Revista Científica"\nÓrgano Oficial del Colegio de Odontólogos de La Paz (COLP)\n\n${vol.title}\nAño: ${vol.year}\n\nFascículo Histórico de Investigación Estomatológica.`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = vol.pdfUrl || `Scientia_Dentis_Vol${vol.volumeNumber}_Num${vol.issueNumber}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setTimeout(() => setArchiveDownloadSuccess(false), 4000);
    }, 600);
  };

  const handleExploreThisArchive = (vol: Volume) => {
    if (onSelectVolume) {
      onSelectVolume(vol.id);
    } else {
      onExploreCatalog();
    }
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
        <div className="flex items-center gap-3.5">
          <ColpLogo 
            className="w-12 h-12 sm:w-14 sm:h-14" 
            allowUpload={true} 
            alt="Colegio de Odontólogos de La Paz" 
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-white tracking-wide text-xs sm:text-sm">Colegio de Odontólogos de La Paz</span>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
              <span className="text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
              <span>La Paz, Bolivia</span>
              <span className="text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
              <span className="hidden sm:inline">Arbitraje por Pares Doble Ciego</span>
            </div>
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
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Institutional Identity + 3D Monograph Cover of Current Volume */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* 1. RESTORED INSTITUTIONAL PRESENTATION BLOCK */}
            <div className="mb-6 w-full">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-medium mb-3 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                <span>Nueva Edición Semestral · La Paz, Bolivia</span>
              </div>

              {/* H1 Main Title */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.08] drop-shadow-sm">
                Scientia Dentis
              </h1>

              {/* Subtitle */}
              <p className="font-serif italic text-lg sm:text-xl text-cyan-400 font-semibold mt-1">
                "Revista Científica"
              </p>

              {/* Descriptive Paragraph */}
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mt-3.5 max-w-xl">
                Órgano Oficial del Colegio de Odontólogos de La Paz (COLP). Investigaciones biomédicas estomatológicas, implantología oseointegrada, avances tisulares y casos clínicos de excelencia con arbitraje ciego internacional.
              </p>
            </div>

            {/* 3D Perspective Book Frame with Volumetric Shadow & Spotlight Glow */}
            <div className="relative group perspective-1000 mb-6">
              
              {/* Volumetric Spotlight Orb Behind Book */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/30 via-blue-600/25 to-teal-400/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 pointer-events-none" />

              {/* Book Spine and Cover Container */}
              <div className="relative w-60 sm:w-68 aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(6,182,212,0.2)] border-2 border-white/20 transform lg:rotate-y-[-6deg] group-hover:rotate-y-0 group-hover:scale-[1.02] transition-all duration-500 bg-slate-900 flex flex-col justify-between">
                
                {/* Book Cover Photography */}
                <img 
                  src={resolveVolumeCover(currentVolume.id, currentVolume.coverImage)} 
                  alt={currentVolume.title} 
                  onError={(e) => {
                    e.currentTarget.src = resolveVolumeCover(currentVolume.id);
                  }}
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

            {/* Direct Volume Action Button (Centered / Aligned with Cover Card) */}
            <div className="w-full max-w-60 sm:max-w-68 flex justify-center lg:justify-start mt-2">
              <button
                onClick={onExploreCatalog}
                id="btn-explore-current-issue"
                className="w-full px-5 py-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.55)] border border-cyan-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
              >
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Explorar Artículos</span>
                <ArrowDown className="w-3.5 h-3.5 opacity-80 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
            
            <p className="text-[11px] text-slate-400 mt-2.5 font-mono text-center lg:text-left flex items-center justify-center lg:justify-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Edición en Acceso Abierto Libre (CC BY 4.0)</span>
            </p>
          </div>

          {/* Right Column: Proportionate Header + Interactive 3D Cover Flow Showcase or Inaugural Showcase */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* 2. RESTRUCTURED PROPORTIONATE HEADER */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-2 backdrop-blur-md">
                {archiveVolumes.length > 0 ? (
                  <>
                    <Archive className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Colección y Memoria Científica</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Lanzamiento Oficial 2026 · Edición Inaugural</span>
                  </>
                )}
              </div>

              <h2 className="font-serif text-xl md:text-2xl font-semibold text-slate-100 tracking-tight">
                {archiveVolumes.length > 0 ? 'Archivo Histórico de Ediciones' : 'Vol. 1 Núm. 1 (2026)'}
              </h2>
              <p className="text-xs md:text-sm text-cyan-400/80 font-sans mt-0.5">
                {archiveVolumes.length > 0 
                  ? 'Fascículos anteriores arbitrados e indexados' 
                  : 'Primer Fascículo Científico del Colegio de Odontólogos de La Paz (COLP)'}
              </p>
            </div>

            {/* 3. FLUID & DYNAMIC 3D COVER FLOW OR INAUGURAL 2026 SHOWCASE */}
            {archiveVolumes.length > 0 ? (
            <div 
              className="bg-slate-900/60 rounded-3xl p-5 sm:p-6 border border-white/10 backdrop-blur-xl relative shadow-2xl overflow-hidden"
              onMouseEnter={() => setAutoplayPaused(true)}
              onMouseLeave={() => setAutoplayPaused(false)}
            >
              {/* Header Bar of Carousel */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    Fascículos Publicados
                  </span>
                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {activeCoverIndex + 1} de {archiveVolumes.length}
                  </span>
                </div>

                {/* Left and Right Nav Buttons (Glassmorphic) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevVolume}
                    title="Volumen anterior"
                    aria-label="Volumen anterior"
                    className="p-2 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-slate-300 hover:text-white transition-all cursor-pointer shadow-md hover:border-cyan-400/40 active:scale-90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextVolume}
                    title="Siguiente volumen"
                    aria-label="Siguiente volumen"
                    className="p-2 backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-slate-300 hover:text-white transition-all cursor-pointer shadow-md hover:border-cyan-400/40 active:scale-90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3D Cover Flow Stage with Touch Swipe */}
              <div 
                className="relative py-4 min-h-[250px] sm:min-h-[280px] flex items-center justify-center overflow-hidden perspective-1000"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                
                {/* Volumetric Center Spotlight Glow (Cyan & Indigo gradient) */}
                <div className="absolute w-64 h-64 bg-gradient-to-tr from-cyan-500/25 via-indigo-600/20 to-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                {/* 3D Stack of Covers with 700ms smooth transition */}
                <div className="relative w-full flex items-center justify-center">
                  {archiveVolumes.map((vol, idx) => {
                    const total = archiveVolumes.length;
                    // Calculate circular relative offset
                    let offset = (idx - activeCoverIndex + total) % total;
                    if (offset > total / 2) offset -= total;

                    const isActive = offset === 0;
                    const isPrev = offset === -1 || (offset === total - 1 && total === 2);
                    const isNext = offset === 1 || (offset === -(total - 1) && total === 2);
                    const isVisible = isActive || isPrev || isNext;

                    if (!isVisible) {
                      return null;
                    }

                    // Dynamic 3D transform and styling based on slot
                    let transformClass = "translate-x-0 scale-100 z-30 opacity-100 rotate-y-0";
                    let cardBorderClass = "border border-cyan-400/50 shadow-2xl shadow-cyan-500/20 ring-1 ring-cyan-400/40";

                    if (isPrev) {
                      transformClass = "-translate-x-28 sm:-translate-x-34 scale-90 z-10 opacity-60 rotate-y-[16deg] blur-[0.2px] cursor-pointer hover:opacity-85";
                      cardBorderClass = "border border-white/15 shadow-xl";
                    } else if (isNext) {
                      transformClass = "translate-x-28 sm:translate-x-34 scale-90 z-10 opacity-60 -rotate-y-[16deg] blur-[0.2px] cursor-pointer hover:opacity-85";
                      cardBorderClass = "border border-white/15 shadow-xl";
                    }

                    return (
                      <div
                        key={vol.id}
                        onClick={() => {
                          if (!isActive) {
                            setAutoplayPaused(true);
                            setActiveCoverIndex(idx);
                          } else {
                            handleExploreThisArchive(vol);
                          }
                        }}
                        className={`absolute w-40 sm:w-46 aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-700 ease-in-out bg-slate-900 select-none ${transformClass} ${cardBorderClass}`}
                        style={{
                          transformStyle: 'preserve-3d'
                        }}
                      >
                        {/* Cover Image */}
                        <img 
                          src={resolveVolumeCover(vol.id, vol.coverImage)} 
                          alt={vol.title} 
                          onError={(e) => {
                            e.currentTarget.src = resolveVolumeCover(vol.id);
                          }}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />

                        {/* Ambient Scrim */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />

                        {/* Spine Reflection */}
                        <div className="absolute top-0 bottom-0 left-0 w-3.5 bg-gradient-to-r from-white/25 via-white/5 to-transparent pointer-events-none" />

                        {/* Cover Text Info inside the 3D book */}
                        <div className="absolute inset-0 p-3 flex flex-col justify-between text-left z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded-full border border-cyan-400/30">
                              Vol. {vol.volumeNumber} · Núm. {vol.issueNumber}
                            </span>
                            <span className="text-[10px] font-mono text-slate-300 font-semibold">
                              {vol.year}
                            </span>
                          </div>

                          <div className="bg-slate-950/85 backdrop-blur-md p-2 rounded-xl border border-white/10">
                            <p className="text-[11px] font-serif font-bold text-white line-clamp-2 leading-tight">
                              {vol.title.split(':')[1]?.trim() || vol.title}
                            </p>
                            <p className="text-[9px] font-mono text-cyan-400 mt-1">
                              {vol.articleCount || 8} Artículos
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ficha de Información del Volumen Seleccionado */}
              <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-white/10 backdrop-blur-md mt-2 space-y-3">
                
                {/* Meta Top Line */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/70 border border-amber-500/40 text-amber-300 shadow-xs">
                      Volumen Anterior Indexado
                    </span>
                    <span className="text-slate-600" aria-hidden="true">·</span>
                    <span className="text-xs font-mono text-slate-300 font-semibold">
                      Año {activeArchiveVol.year}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 font-medium">
                    {activeArchiveVol.articleCount || 8} Artículos Arbitrados
                  </span>
                </div>

                {/* Thematic Title */}
                <div>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-white leading-snug">
                    {activeArchiveVol.title}
                  </h4>
                  {activeArchiveVol.theme && (
                    <p className="text-xs text-cyan-300 font-sans mt-0.5">
                      Enfoque temático: <strong>{activeArchiveVol.theme}</strong>
                    </p>
                  )}
                </div>

                {/* Action Buttons for this Archive Issue */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                  <button
                    onClick={() => handleExploreThisArchive(activeArchiveVol)}
                    id="btn-explore-archive-volume"
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-950/50 flex items-center gap-2 cursor-pointer transition-all active:scale-95 group"
                  >
                    <BookOpen className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span>Explorar esta edición</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => handleDownloadArchiveIssue(activeArchiveVol)}
                    disabled={isDownloadingArchivePdf}
                    className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isDownloadingArchivePdf ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        <span>Descargando...</span>
                      </>
                    ) : archiveDownloadSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">¡Descargado!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Fascículo PDF</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {archiveVolumes.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => {
                      setAutoplayPaused(true);
                      setActiveCoverIndex(dotIdx);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeCoverIndex === dotIdx 
                        ? 'w-7 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.7)]' 
                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    aria-label={`Ir al volumen ${dotIdx + 1}`}
                  />
                ))}
              </div>

              {/* Módulo: Presentación Institucional en Archivo */}
              <div className="rounded-2xl bg-slate-950/80 border border-white/10 p-4 sm:p-5 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-all mt-4">
                <div className="flex items-center gap-2.5 mb-2.5 border-b border-white/5 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/90 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-sm shrink-0">
                    <Landmark className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold font-serif text-white tracking-wide">
                      Presentación Institucional
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Colegio de Odontólogos de La Paz
                    </p>
                  </div>
                  <span className="text-[9px] font-mono uppercase text-cyan-400/90 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full ml-auto font-semibold">
                    Órgano Oficial COLP
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans text-justify">
                  {currentVolume.institutional_presentation || currentVolume.institutionalPresentation || DEFAULT_INSTITUTIONAL_PRESENTATION}
                </p>
              </div>

            </div>
            ) : (
              /* Inaugural 2026 Showcase Panel */
              <div className="bg-slate-900/60 rounded-3xl p-6 sm:p-7 border border-cyan-500/30 backdrop-blur-xl relative shadow-2xl overflow-hidden space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
                      Edición Oficial 2026 · Activa
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-semibold">
                    Vol. 1 Núm. 1 (2026)
                  </span>
                </div>

                <div className="space-y-2.5">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">
                    {currentVolume.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    Primer volumen oficial publicado bajo el modelo de Ciencia Abierta por el Ilustre Colegio de Odontólogos de La Paz (COLP). Incorpora arbitraje por pares a doble ciego, identificador permanente DOI y preservación digital estomatológica.
                  </p>
                </div>

                {/* Módulo: Presentación Institucional */}
                <div className="rounded-2xl bg-slate-950/85 border border-white/10 p-5 sm:p-6 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-inner">
                  <div className="flex items-center gap-2.5 mb-3 border-b border-white/5 pb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-950/90 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-sm shrink-0">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold font-serif text-white tracking-wide">
                        Presentación Institucional
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Colegio de Odontólogos de La Paz
                      </p>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase text-cyan-400/90 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full ml-auto font-semibold">
                      Órgano Oficial COLP
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans text-justify">
                    {currentVolume.institutional_presentation || currentVolume.institutionalPresentation || DEFAULT_INSTITUTIONAL_PRESENTATION}
                  </p>
                </div>

                {/* Call to Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                  <button
                    onClick={onExploreCatalog}
                    className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-950/50 flex items-center gap-2 cursor-pointer transition-all active:scale-95 group"
                  >
                    <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Explorar Artículos de este Volumen</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Colegio de Odontólogos de La Paz</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Strip (Author Submission & Vancouver Guide) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
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
                    Convocatoria abierta para el Vol. 1 Núm. 1 (2026). Sin costo (No APC).
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

        {/* Infinite Marquee Ticker of Published Scientific Article Covers */}
        <div className="mt-12 pt-8 border-t border-white/10" id="marquee-articles-section">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 px-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <h4 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <span>Portadas Ilustrativas · Artículos Científicos</span>
                <span className="text-[11px] text-cyan-400 font-normal hidden md:inline">
                  (Desplazamiento Continuo)
                </span>
              </h4>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="hidden sm:inline">Pausa al colocar el cursor</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-cyan-400 flex items-center gap-1 font-sans">
                <BookOpen className="w-3.5 h-3.5 inline" /> Clic para lectura completa
              </span>
            </div>
          </div>

          {/* Marquee Panorámico Continuo con Máscaras de Gradiente en los Extremos */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-950/40 border border-white/5 p-2 sm:p-3">
            {/* Edge Shadow Masks for Seamless In/Out Effect */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-slate-950 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-slate-950 to-transparent z-10" />

            {/* Marquee Track */}
            <div className="animate-marquee flex gap-4 sm:gap-5 py-1">
              {marqueeArticles.map((article, index) => {
                const coverSrc = getArticleCover(article);
                const primaryAuthor = (article.authors && article.authors.length > 0)
                  ? article.authors[0]
                  : 'Autor Principal COLP';

                return (
                  <div
                    key={`${article.id}-${index}`}
                    onClick={() => onSelectArticle && onSelectArticle(article)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (onSelectArticle) onSelectArticle(article);
                      }
                    }}
                    className="group cursor-pointer shrink-0 w-64 sm:w-72 bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-400/60 rounded-2xl p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_30px_-8px_rgba(6,182,212,0.35)] backdrop-blur-md flex flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver artículo: ${article.title}`}
                  >
                    {/* Cover Thumbnail with 16/10 Editorial Aspect Ratio */}
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-white/10 shadow-inner">
                      <img
                        src={coverSrc}
                        alt={`Portada: ${article.title}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Gradient Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                      {/* Floating Category Badge */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-950/85 text-cyan-300 border border-cyan-400/40 backdrop-blur-md shadow-sm">
                          {article.category || 'Estomatología'}
                        </span>
                      </div>

                      {/* Hover Quick Read Action Pill */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-semibold shadow-lg shadow-cyan-500/30">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Leer Artículo</span>
                        </span>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="mt-3 flex-1 flex flex-col justify-between">
                      {/* Truncated Title (2 Lines) */}
                      <h5 className="font-serif text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h5>

                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                          <Users className="w-3 h-3 text-cyan-400/80 shrink-0" />
                          <span className="truncate">{primaryAuthor}</span>
                        </div>

                        <span className="text-[10px] font-mono text-emerald-400 font-medium shrink-0 flex items-center gap-0.5">
                          <span>DOI</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
