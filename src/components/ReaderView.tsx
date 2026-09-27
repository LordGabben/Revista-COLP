import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Calendar, ChevronRight, FileText, Download, Tag, Award, Users, ExternalLink, HelpCircle, FileCheck2, Sparkles, ShieldCheck, Image, Paperclip, Check, Clock, Eye, Archive, X } from 'lucide-react';
import { Article, Volume, InstitutionalModalType } from '../types';
import { DENTAL_CATEGORIES, JOURNAL_INFO, INDEXING_SYSTEMS } from '../data';

interface ReaderViewProps {
  articles: Article[];
  volumes: Volume[];
  externalSelectedArticle?: Article | null;
  onCloseExternalArticle?: () => void;
  externalSearchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenInstitutionalModal?: (modal: InstitutionalModalType) => void;
  onNavigateToAuthor?: () => void;
  externalSelectedVolumeId?: string | null;
  onClearVolumeFilter?: () => void;
}

export default function ReaderView({ 
  articles, 
  volumes,
  externalSelectedArticle,
  onCloseExternalArticle,
  externalSearchQuery = '',
  onSearchChange,
  onOpenInstitutionalModal,
  onNavigateToAuthor,
  externalSelectedVolumeId = null,
  onClearVolumeFilter
}: ReaderViewProps) {
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(externalSelectedArticle || null);
  const [selectedTab, setSelectedTab] = useState<'abstract' | 'pdf' | 'figures' | 'reviews'>('abstract');
  const [expandedAbstractId, setExpandedAbstractId] = useState<string | null>(null);
  const [selectedVolumeFilter, setSelectedVolumeFilter] = useState<string | null>(externalSelectedVolumeId);

  useEffect(() => {
    if (externalSelectedArticle) {
      setSelectedArticle(externalSelectedArticle);
      setSelectedTab('abstract');
    }
  }, [externalSelectedArticle]);

  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  useEffect(() => {
    if (externalSelectedVolumeId !== undefined) {
      setSelectedVolumeFilter(externalSelectedVolumeId);
    }
  }, [externalSelectedVolumeId]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleCloseModal = () => {
    setSelectedArticle(null);
    if (onCloseExternalArticle) {
      onCloseExternalArticle();
    }
  };

  const toggleQuickAbstract = (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedAbstractId(prev => prev === articleId ? null : articleId);
  };

  const publishedArticles = articles.filter(a => a.status === 'published');
  const currentVolume = volumes.find(v => v.isCurrent) || volumes[0];

  // Filter logic
  const filteredArticles = publishedArticles.filter(art => {
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.authors.some(auth => auth.toLowerCase().includes(searchQuery.toLowerCase())) ||
      art.keywords.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory ? art.category === selectedCategory : true;
    const matchesVolume = selectedVolumeFilter ? art.publishedInVolumeId === selectedVolumeFilter : true;
    return matchesSearch && matchesCategory && matchesVolume;
  });

  return (
    <div className="fade-in space-y-8" id="reader-view">
      
      {/* Floating Glassmorphic Search & Category Filter Section with Anchor ID */}
      <div className="backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)] scroll-mt-28 space-y-5" id="catalog-section">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Colección Científica Oficial
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Catálogo de Artículos Científicos
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Investigaciones arbitradas, metadatos abiertos y casos clínicos estomatológicos
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 rounded-full shadow-xs">
              {filteredArticles.length} artículos indexados
            </span>
          </div>
        </div>

        {/* Floating Search Bar with Luminous Glow & Keyboard Keycap */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por título, autor, resumen, palabras clave o DOI..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-24 py-3 bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
              id="search-input"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-500 bg-white/5 border border-white/10 rounded-md px-1.5 py-0.5 pointer-events-none">
                Ctrl+K
              </span>
            </div>
          </div>

          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="px-4 py-3 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>

        {/* Specialized Dental Categories Filter Chips (Translucent Neon Style) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono cursor-pointer transition-all ${
              selectedCategory === null
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-semibold'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Todas ({publishedArticles.length})
          </button>
          {DENTAL_CATEGORIES.map((cat) => {
            const count = publishedArticles.filter(a => a.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono cursor-pointer transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-semibold'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{cat}</span>
                {count > 0 && <span className="opacity-75 text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Articles List & Volumes Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Published Articles List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <h3 className="font-serif text-lg font-bold text-white">
              {selectedVolumeFilter 
                ? `Artículos de esta Edición` 
                : selectedCategory 
                  ? `Artículos en "${selectedCategory}"` 
                  : searchQuery 
                    ? `Resultados de búsqueda` 
                    : 'Publicaciones Recientes'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {filteredArticles.length} resultados encontrados
            </span>
          </div>

          {/* Active Volume Filter Banner */}
          {selectedVolumeFilter && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-cyan-950/40 border border-cyan-400/40 rounded-2xl backdrop-blur-md shadow-lg shadow-cyan-950/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                      Filtro de Edición Activo
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-white mt-0.5">
                    {volumes.find(v => v.id === selectedVolumeFilter)?.title || selectedVolumeFilter}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedVolumeFilter(null);
                  if (onClearVolumeFilter) onClearVolumeFilter();
                }}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 hover:border-cyan-400/40 self-end sm:self-auto shrink-0"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>Ver todos los volúmenes</span>
              </button>
            </div>
          )}

          {filteredArticles.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-white/10">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-medium">No se encontraron artículos con esos criterios.</p>
              <p className="text-slate-400 text-xs mt-1">Pruebe modificando su búsqueda o seleccionando otra especialidad dental.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((art, idx) => {
                const isQuickExpanded = expandedAbstractId === art.id;
                // Realistic metrics simulation for display
                const estimatedMinutes = Math.max(3, Math.round(art.wordCount / 200));
                const simulatedViews = 620 + (idx * 145);
                const simulatedDownloads = 140 + (idx * 38);

                return (
                  <div 
                    key={art.id} 
                    id={`article-card-${art.id}`}
                    className="glass-card glass-card-hover rounded-3xl p-6 sm:p-7 border border-white/10 relative overflow-hidden group cursor-pointer"
                    onClick={() => {
                      setSelectedArticle(art);
                      setSelectedTab('abstract');
                    }}
                  >
                    {/* Atmospheric Glow on Hover */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-all" />

                    <div>
                      {/* Category Tag as Translucent Neon Pill + Open Access badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 shadow-xs">
                            {art.category}
                          </span>
                          <span className="text-slate-600" aria-hidden="true">·</span>
                          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> CC BY 4.0 Open Access
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          DOI: {art.doi ? art.doi.replace('https://doi.org/', '') : '10.58472/sd.2026'}
                        </span>
                      </div>

                      {/* Article Title */}
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-cyan-200 leading-snug transition-colors">
                        {art.title}
                      </h4>

                      {/* Authors List */}
                      <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-400 font-medium">
                        <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="line-clamp-1">{art.authors.join(', ')}</span>
                      </div>

                      {/* Short abstract preview */}
                      <p className="text-xs sm:text-sm text-slate-300 mt-3 line-clamp-3 leading-relaxed font-sans">
                        {art.abstract.replace('INTRODUCCIÓN:', '').split('MÉTODOS:')[0].trim()}
                      </p>

                      {/* Discrete Metrics Bar */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5 text-slate-300" title="Tiempo estimado de lectura">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>~{estimatedMinutes} min lectura</span>
                        </span>
                        <span className="text-slate-700" aria-hidden="true">·</span>
                        <span className="flex items-center gap-1.5" title="Lecturas acumuladas">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{simulatedViews} vistas</span>
                        </span>
                        <span className="text-slate-700" aria-hidden="true">·</span>
                        <span className="flex items-center gap-1.5" title="Descargas del fascículo y PDF">
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          <span>{simulatedDownloads} descargas</span>
                        </span>
                        {art.aiDeclaration?.used ? (
                          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3 text-purple-400" /> Declaración IA
                          </span>
                        ) : (
                          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/40 border border-white/5 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3 text-slate-400" /> Sin IA Generativa
                          </span>
                        )}
                      </div>

                      {/* Quick Abstract Accordion (Higgsfield Style Smooth Preview) */}
                      {isQuickExpanded && (
                        <div 
                          className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-xs text-slate-300 space-y-3 fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
                              Estructura IMRyD del Manuscrito
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Arbitrado a doble ciego
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-xs leading-relaxed max-h-56 overflow-y-auto pr-1">
                            {art.abstract.split('\n\n').map((paragraph, pIdx) => {
                              const [heading, ...rest] = paragraph.split(':');
                              if (rest.length > 0) {
                                return (
                                  <div key={pIdx}>
                                    <strong className="text-cyan-300 font-mono text-[11px] block">{heading}:</strong>
                                    <p className="text-slate-300 mt-0.5">{rest.join(':').trim()}</p>
                                  </div>
                                );
                              }
                              return <p key={pIdx}>{paragraph}</p>;
                            })}
                          </div>

                          <div className="pt-2 flex justify-between items-center border-t border-white/10 text-xs">
                            <span className="text-[11px] text-slate-400">
                              Filiación: {art.affiliations[0] || 'Hospital Clínico COLP'}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedArticle(art);
                                setSelectedTab('abstract');
                              }}
                              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>Ver Completo</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        {art.keywords.slice(0, 3).map((kw, i) => (
                          <span key={i} className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 font-mono">
                            {kw}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Quick Abstract Button */}
                        <button
                          onClick={(e) => toggleQuickAbstract(art.id, e)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Desplegar resumen rápido en esta tarjeta"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{isQuickExpanded ? 'Ocultar Resumen' : 'Lectura Rápida'}</span>
                        </button>

                        {/* Open Full Article Button */}
                        <button
                          onClick={() => {
                            setSelectedArticle(art);
                            setSelectedTab('abstract');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>Leer Artículo</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: Volume Archives & Editorial policies */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Scientific Indexing Card (Glassmorphic) */}
          <div className="glass-card rounded-3xl p-6 shadow-xl border border-white/10 space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                Garantías Institucionales COLP
              </span>
              <h4 className="font-serif font-bold text-lg text-white">Indexación y Calidad Científica</h4>
              <p className="text-xs text-slate-400 mt-1">Criterios editoriales rigurosos evaluados por organismos internacionales:</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">Latindex 2.0</span>
                <span className="font-bold text-cyan-400">Folio 29481</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">DOAJ</span>
                <span className="font-bold text-cyan-400">Open Access</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">SciELO</span>
                <span className="font-bold text-cyan-400">En Evaluación</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-white/5">
                <span className="text-slate-400 block text-[10px]">Google Scholar</span>
                <span className="font-bold text-cyan-400">h5-index: 18</span>
              </div>
            </div>

            {onOpenInstitutionalModal && (
              <button
                onClick={() => onOpenInstitutionalModal('about')}
                className="w-full mt-2 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-cyan-300 hover:text-white rounded-xl transition-all font-medium cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Ver Criterios e Indexación Completa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Historical Archives */}
          <div className="glass-card rounded-3xl p-6 shadow-xl border border-white/10">
            <h4 className="font-serif font-bold text-white border-b border-white/10 pb-2.5 mb-3.5 flex items-center justify-between">
              <span>Archivos y Fascículos</span>
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </h4>
            <div className="space-y-3">
              {volumes.map((vol) => {
                const isSelected = selectedVolumeFilter === vol.id;
                return (
                  <div 
                    key={vol.id} 
                    className={`flex items-start gap-3 p-3.5 rounded-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50'
                        : vol.isCurrent 
                          ? 'border-cyan-400/40 bg-cyan-950/30 hover:bg-cyan-950/40' 
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/15'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedVolumeFilter(null);
                        if (onClearVolumeFilter) onClearVolumeFilter();
                      } else {
                        setSelectedVolumeFilter(vol.id);
                        setSearchQuery('');
                        setSelectedCategory(null);
                        const catalogEl = document.getElementById('catalog-section');
                        if (catalogEl) {
                          catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    }}
                  >
                    <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-cyan-300' : 'text-cyan-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-semibold text-white leading-tight">
                          {vol.title.split(':')[0]}
                        </h5>
                        {isSelected && (
                          <span className="text-[9px] font-mono uppercase text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded font-bold">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Año {vol.year} · {vol.articleCount || 8} Artículos
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guidelines for Authors Card */}
          <div className="glass-card rounded-3xl p-6 shadow-xl border border-white/10 space-y-3.5 text-xs">
            <h4 className="font-serif font-bold text-white flex items-center gap-1.5 text-sm">
              <HelpCircle className="w-4 h-4 text-cyan-400" /> Directrices para Autores
            </h4>
            <p className="text-slate-300 leading-relaxed">
              <strong>Scientia Dentis</strong> recibe manuscritos originales de investigación, casos clínicos de alto impacto y revisiones sistemáticas conforme a normativas <strong>Vancouver / ICMJE</strong>.
            </p>
            <ul className="space-y-1.5 text-slate-400 pl-4 list-disc font-sans">
              <li>Estructura IMRyD con resumen estructurado (máx. 250 palabras).</li>
              <li>Arbitraje a doble ciego con revisores externos.</li>
              <li>Sin cargos por publicación (No APC - 100% patrocinado por COLP).</li>
            </ul>
            
            <div className="pt-2 flex flex-col gap-2">
              {onOpenInstitutionalModal && (
                <button
                  onClick={() => onOpenInstitutionalModal('guidelines')}
                  className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Consultar Guía para Autores
                </button>
              )}
              {onNavigateToAuthor && (
                <button
                  onClick={onNavigateToAuthor}
                  className="w-full py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer text-center shadow-lg shadow-cyan-900/40"
                >
                  Enviar un Manuscrito
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ARTICLE READER MODAL (Classic OJS Layout) */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4" id="article-modal">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-start shrink-0">
              <div className="space-y-1.5">
                <span className="bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border border-brand-500 font-mono">
                  {selectedArticle.category} • Acceso Abierto CC BY-NC
                </span>
                <h3 className="font-serif text-base sm:text-lg lg:text-xl font-bold tracking-tight pr-4 leading-tight">
                  {selectedArticle.title}
                </h3>
                <div className="text-xs text-slate-400 flex flex-wrap gap-4 font-mono">
                  <span>Por: {selectedArticle.authors.join(', ')}</span>
                  <span>|</span>
                  <span>DOI: {selectedArticle.doi || 'En trámite'}</span>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white cursor-pointer p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-lg font-bold font-mono"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="bg-slate-100 border-b border-slate-200 px-5 flex gap-1 shrink-0 overflow-x-auto">
              <button
                onClick={() => setSelectedTab('abstract')}
                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  selectedTab === 'abstract' 
                    ? 'border-brand-600 text-brand-700 font-extrabold' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Resumen Académico
              </button>
              <button
                onClick={() => setSelectedTab('pdf')}
                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  selectedTab === 'pdf' 
                    ? 'border-brand-600 text-brand-700 font-extrabold' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Texto Completo (HTML / PDF)
              </button>
              <button
                onClick={() => setSelectedTab('figures')}
                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'figures' 
                    ? 'border-brand-600 text-brand-700 font-extrabold' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Image className="w-3.5 h-3.5" /> Figuras & Materiales ({ (selectedArticle.figures?.length || 0) + (selectedArticle.supplementaryFiles?.length || 0) })
              </button>
              <button
                onClick={() => setSelectedTab('reviews')}
                className={`py-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  selectedTab === 'reviews' 
                    ? 'border-brand-600 text-brand-700 font-extrabold' 
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Historial de Revisión por Pares ({selectedArticle.reviews.length})
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              
              {/* TAB 1: ABSTRACT */}
              {selectedTab === 'abstract' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Affiliations */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-2">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">Filiaciones de los Autores:</h5>
                    <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1">
                      {selectedArticle.affiliations.map((aff, i) => (
                        <li key={i}>
                          <strong>{selectedArticle.authors[i] || 'Coautor'}</strong> - {aff} ({selectedArticle.authorEmails[i]})
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Structured Abstract Sections */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-3xs space-y-4">
                    <h4 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                      Resumen Estructurado
                    </h4>
                    
                    {selectedArticle.abstract.includes('INTRODUCCIÓN:') ? (
                      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                        {selectedArticle.abstract.split('\n\n').map((section, idx) => {
                          const [title, ...rest] = section.split(':');
                          const content = rest.join(':').trim();
                          return (
                            <div key={idx} className="space-y-1">
                              <h5 className="font-bold text-brand-800 text-xs tracking-wider uppercase font-mono">
                                {title}
                              </h5>
                              <p className="text-slate-600 text-xs sm:text-sm">{content}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700 leading-relaxed">{selectedArticle.abstract}</p>
                    )}
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">Palabras clave:</span>
                    {selectedArticle.keywords.map((kw, i) => (
                      <span key={i} className="text-xs text-brand-800 bg-brand-50 border border-brand-100 px-2.5 py-0.5 rounded-full font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* AI Usage Transparency Card (COPE / ICMJE) */}
                  <div className="bg-slate-900 text-white rounded-xl p-5 shadow-3xs space-y-3 border border-slate-800" id="reader-ai-disclosure">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-400" />
                        <h5 className="font-serif font-bold text-sm text-white">Declaración de Transparencia sobre el Uso de Inteligencia Artificial</h5>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        Norma COPE / ICMJE
                      </span>
                    </div>

                    {selectedArticle.aiDeclaration?.used ? (
                      <div className="space-y-3 text-xs">
                        <p className="text-slate-300">
                          En conformidad con las políticas éticas editoriales de la Revista Científica de Odontología, los autores declaran formalmente el empleo de herramientas de IA generativa y tecnologías asistivas en los siguientes componentes:
                        </p>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">Apartados y componentes con asistencia de IA:</span>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {selectedArticle.aiDeclaration.sectionsUsed.map((sec, idx) => (
                              <span key={idx} className="bg-slate-800 border border-slate-700 text-brand-300 px-2.5 py-1 rounded-md text-xs font-mono font-medium">
                                • {sec}
                              </span>
                            ))}
                          </div>
                        </div>

                        {selectedArticle.aiDeclaration.toolsAndScope && (
                          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300 italic">
                            <span className="text-[10px] font-mono text-slate-400 block not-italic font-bold uppercase mb-0.5">Descripción de herramientas y alcance:</span>
                            "{selectedArticle.aiDeclaration.toolsAndScope}"
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-mono pt-1">
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>Supervisión y autoría humana certificada. La IA no califica ni figura como autor.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 text-xs text-slate-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Los autores certifican que no se emplearon modelos de Inteligencia Artificial generativa ni software de generación sintética en la elaboración del manuscrito ni en sus anexos.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: TEXTO COMPLETO (PDF SIMULATOR) */}
              {selectedTab === 'pdf' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="flex items-start gap-2.5">
                      <FileCheck2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-amber-900">Maquetación Científica Final PDF</h5>
                        <p className="text-amber-700">Este es un artículo publicado de libre acceso. Puede descargar el manuscrito formal formateado para impresión.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert(`Simulando la descarga de ${selectedArticle.manuscriptFile.name} (${selectedArticle.manuscriptFile.size}). Archivo listo.`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg font-bold shadow-xs cursor-pointer whitespace-nowrap transition-colors"
                    >
                      <Download className="w-4 h-4" /> Descargar PDF ({selectedArticle.manuscriptFile.size})
                    </button>
                  </div>

                  {/* Scientific Paper Body Simulation */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-3xs space-y-6 text-slate-800">
                    {/* Header elements of classic journal article */}
                    <div className="border-b-2 border-slate-900 pb-4 text-center">
                      <h4 className="font-serif font-extrabold text-base tracking-wide uppercase text-slate-700">
                        {JOURNAL_INFO.name}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">
                        {selectedArticle.doi ? `DOI: ${selectedArticle.doi}` : ''} • Recibido: {selectedArticle.submittedAt} • Aceptado para publicación
                      </p>
                    </div>

                    <h1 className="font-serif text-xl sm:text-2xl font-bold text-center text-slate-900 leading-snug">
                      {selectedArticle.title}
                    </h1>

                    <div className="text-center text-xs font-semibold text-slate-700">
                      {selectedArticle.authors.map((auth, i) => (
                        <span key={i}>
                          {auth}<sup>{i+1}</sup>{i < selectedArticle.authors.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>

                    <div className="text-[10px] text-center text-slate-500 border-b border-slate-100 pb-6 max-w-xl mx-auto leading-relaxed">
                      {selectedArticle.affiliations.map((aff, i) => (
                        <p key={i}>
                          <sup>{i+1}</sup> {aff}
                        </p>
                      ))}
                    </div>

                    {/* Scientific Two-Column Layout Vibe */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm leading-relaxed text-justify">
                      <div className="space-y-4">
                        <h4 className="font-serif font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">
                          Introducción
                        </h4>
                        <p>
                          La odontología basada en la evidencia exige un análisis meticuloso de cada procedimiento de rehabilitación o tratamiento de conductos. Con el advenimiento de nuevos materiales, los clínicos requieren pruebas robustas in vitro e in vivo antes de someter a sus pacientes a protocolos complejos.
                        </p>
                        <p>
                          El presente estudio, en consonancia con las normativas éticas vigentes, profundiza en las interacciones clínicas y las tasas de éxito obtenidas de forma empírica en un contexto clínico estricto.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-serif font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">
                          Discusión
                        </h4>
                        <p>
                          Los resultados demuestran de forma categórica que la utilización de técnicas avanzadas y materiales de última generación (como biocerámicos estables o aleaciones de titanio-zirconio hidrófilas) reducen sustancialmente la incidencia de fracasos a largo plazo.
                        </p>
                        <p>
                          Es crucial destacar que estos resultados guardan consistencia con la bibliografía indexada internacional, reforzando la necesidad de instaurar guías clínicas de práctica estricta en consultorios y clínicas universitarias.
                        </p>
                      </div>
                    </div>

                    {/* Formal Ethical, Conflict of Interest and AI Disclosures (ICMJE Standard) */}
                    <div className="mt-8 pt-6 border-t border-slate-200 bg-slate-50/80 p-4 rounded-xl space-y-3 text-xs">
                      <h4 className="font-serif font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-1 font-mono">
                        Declaraciones Éticas y Cumplimiento Editorial (COPE / ICMJE)
                      </h4>

                      <div className="space-y-2 text-slate-700 leading-relaxed">
                        <div>
                          <strong>• Aval ético / Consentimiento informado:</strong> El protocolo de investigación fue evaluado y aprobado por el Comité de Ética en Investigación Institucional. Todos los pacientes otorgaron su consentimiento informado por escrito previo a la toma de muestras o intervenciones clínicas.
                        </div>
                        <div>
                          <strong>• Declaración de Conflicto de Intereses:</strong> Los autores declaran que no existen intereses financieros, vínculos comerciales o patrocinios de marcas odontológicas comerciales que hayan condicionado el diseño o las conclusiones del presente manuscrito.
                        </div>
                        <div>
                          <strong>• Conformidad autoral y Cesión de derechos:</strong> Todos los autores revisaron y aprobaron la versión final del manuscrito, cediendo los derechos de publicación bajo licencia internacional Creative Commons Atribución-NoComercial 4.0.
                        </div>
                        <div>
                          <strong>• Declaración de Uso de Inteligencia Artificial (IA):</strong>{' '}
                          {selectedArticle.aiDeclaration?.used ? (
                            <span>
                              Se utilizó tecnología asistida por IA en los apartados de:{' '}
                              <strong className="text-brand-800">
                                {selectedArticle.aiDeclaration.sectionsUsed.join(', ')}
                              </strong>
                              .{' '}
                              {selectedArticle.aiDeclaration.toolsAndScope && (
                                <span className="italic">
                                  Detalle reportado: "{selectedArticle.aiDeclaration.toolsAndScope}".
                                </span>
                              )}{' '}
                              Los autores asumen plena y exclusiva responsabilidad por el contenido.
                            </span>
                          ) : (
                            <span>
                              Los autores declaran expresamente que no se emplearon modelos de inteligencia artificial generativa en ninguna fase de redacción, generación de figuras o procesamiento del manuscrito.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vancouver References list */}
                    <div className="mt-8 pt-6 border-t-2 border-slate-200 space-y-3">
                      <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                        Referencias Bibliográficas (Vancouver)
                      </h4>
                      <ol className="list-decimal list-inside text-xs text-slate-500 space-y-2.5">
                        {selectedArticle.references.map((ref, idx) => (
                          <li key={idx} className="pl-1 leading-normal">
                            {ref}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FIGURES & SUPPLEMENTARY ASSETS */}
              {selectedTab === 'figures' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="bg-slate-900 text-white rounded-xl p-5 shadow-3xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-brand-400" />
                        <h4 className="font-serif font-bold text-sm">Repositorio de Figuras en Alta Resolución & Material Suplementario</h4>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Archivos originales de alta fidelidad científica (≥300 DPI, TIFF, EPS, JPG, PDF) y tablas de datos brutos.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700 text-brand-300 shrink-0">
                      Open Data / FAIR
                    </span>
                  </div>

                  {/* Figures gallery */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-indigo-600" /> Figuras y Gráficos Científicos ({selectedArticle.figures?.length || 0})
                    </h5>

                    {(!selectedArticle.figures || selectedArticle.figures.length === 0) ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
                        Este artículo no incluye figuras adicionales cargadas de forma independiente.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedArticle.figures.map((fig) => (
                          <div key={fig.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs space-y-3 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                <span className="text-xs font-bold text-slate-900 font-mono">
                                  {fig.figureNumber || 'Figura'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[9.5px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                                    {fig.dpi || 300} DPI
                                  </span>
                                  <span className="text-[9.5px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono uppercase font-bold">
                                    {fig.format}
                                  </span>
                                </div>
                              </div>

                              <h6 className="font-semibold text-slate-800 text-xs mt-2">{fig.name}</h6>
                              {fig.caption && (
                                <p className="text-xs text-slate-500 mt-1 italic leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                                  "{fig.caption}"
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-slate-400 font-mono">{fig.size}</span>
                              <button
                                onClick={() => alert(`Iniciando descarga en alta resolución (${fig.dpi || 300} DPI - formato ${fig.format.toUpperCase()}): ${fig.name}`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" /> Descargar ({fig.format.toUpperCase()})
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Supplementary files list */}
                  <div className="space-y-4 pt-2">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-amber-600" /> Archivos Anexos & Tablas Suplementarias ({selectedArticle.supplementaryFiles?.length || 0})
                    </h5>

                    {(!selectedArticle.supplementaryFiles || selectedArticle.supplementaryFiles.length === 0) ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
                        No hay archivos complementarios asociados a este artículo.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedArticle.supplementaryFiles.map((sup) => (
                          <div key={sup.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-3xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
                                <Paperclip className="w-4 h-4" />
                              </div>
                              <div>
                                <h6 className="font-bold text-xs text-slate-800">{sup.name}</h6>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  Formato: {sup.format.toUpperCase()} • Tamaño: {sup.size} • Anexo científico verificado
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => alert(`Descargando archivo complementario: ${sup.name}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PEER REVIEW HISTORY */}
              {selectedTab === 'reviews' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3 text-xs text-indigo-900">
                    <Award className="w-5 h-5 text-indigo-700 shrink-0" />
                    <div>
                      <h5 className="font-bold">Política de Revisión Ciega Abierta (Post-Publicación)</h5>
                      <p className="text-indigo-700">Como parte de nuestro compromiso con la transparencia científica y el Colegio de Odontólogos de La Paz (COLP), Scientia Dentis expone las evaluaciones por pares de los artículos aprobados, omitiendo detalles personales de los evaluadores que así lo requieran o exhibiendo los informes oficiales.</p>
                    </div>
                  </div>

                  {selectedArticle.reviews.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm shadow-3xs">
                      Este artículo histórico fue indexado bajo migración de volumen heredado. No hay actas de revisión digitales asociadas.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedArticle.reviews.map((rev, i) => (
                        <div key={rev.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-700">
                                <Users className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="text-xs sm:text-sm font-bold text-slate-800">Evaluación del Revisor #{i+1}</h5>
                                <p className="text-[10px] text-slate-500 font-mono">Presentado el: {rev.submittedAt}</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Recomendación: {rev.recommendation === 'accept' ? 'Aceptar' : rev.recommendation === 'minor_revisions' ? 'Revisiones Menores' : rev.recommendation === 'major_revisions' ? 'Revisiones Mayores' : 'Rechazar'}
                            </span>
                          </div>

                          {/* Scores grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg text-center text-xs">
                            <div className="border-r border-slate-200 last:border-0">
                              <span className="text-[9px] text-slate-500 block">Originalidad</span>
                              <span className="font-bold text-slate-800 text-base">{rev.originalityScore} / 5</span>
                            </div>
                            <div className="border-r border-slate-200 last:border-0 sm:block">
                              <span className="text-[9px] text-slate-500 block">Metodología</span>
                              <span className="font-bold text-slate-800 text-base">{rev.methodologyScore} / 5</span>
                            </div>
                            <div className="border-r border-slate-200 last:border-0">
                              <span className="text-[9px] text-slate-500 block">Relevancia Clínica</span>
                              <span className="font-bold text-slate-800 text-base">{rev.clinicalRelevanceScore} / 5</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 block">Rigor Ético</span>
                              <span className="font-bold text-slate-800 text-base">{rev.ethicalScore} / 5</span>
                            </div>
                          </div>

                          {/* Review comments */}
                          <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                            <h6 className="font-bold text-slate-800 text-xs uppercase tracking-wide font-mono">Comentarios del Revisor:</h6>
                            <p className="bg-slate-50/50 p-4 border border-slate-100 rounded-lg italic">
                              "{rev.comments}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-500 font-mono">CC BY-NC-ND 4.0 Internacioanal</span>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Cerrar Artículo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
