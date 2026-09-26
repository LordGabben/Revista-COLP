import React, { useState } from 'react';
import { Search, Filter, BookOpen, Calendar, ChevronRight, FileText, Download, Tag, Award, Users, ExternalLink, HelpCircle, FileCheck2, Sparkles, ShieldCheck, Image, Paperclip } from 'lucide-react';
import { Article, Volume } from '../types';
import { DENTAL_CATEGORIES, JOURNAL_INFO } from '../data';

interface ReaderViewProps {
  articles: Article[];
  volumes: Volume[];
}

export default function ReaderView({ articles, volumes }: ReaderViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedTab, setSelectedTab] = useState<'abstract' | 'pdf' | 'figures' | 'reviews'>('abstract');

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
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fade-in space-y-8" id="reader-view">
      {/* Editorial Hero Banner */}
      {currentVolume && !selectedCategory && !searchQuery && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-0" id="current-volume-hero">
          <div className="lg:col-span-4 h-64 lg:h-auto relative bg-brand-900 overflow-hidden">
            <img 
              src={currentVolume.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover opacity-85 mix-blend-overlay"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
              <span className="bg-brand-600/95 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-2">
                Número Actual
              </span>
              <h3 className="font-serif text-lg font-bold leading-tight">
                {currentVolume.title}
              </h3>
              <p className="text-xs text-brand-100 mt-1 flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5" /> Publicado: {currentVolume.publishedAt}
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold font-mono text-brand-700 uppercase tracking-widest mb-1">
                Scientia Dentis "Revista Científica" • Órgano Oficial COLP
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
                Tabla de Contenidos - {currentVolume.title.split(':')[0]}
              </h2>
              <p className="text-slate-500 text-sm mt-3">
                Explore las últimas investigaciones odontológicas de vanguardia evaluadas por pares académicos internacionales bajo estándares de ciencia abierta.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-slate-600">
                <span><strong>{publishedArticles.filter(a => a.publishedInVolumeId === currentVolume.id).length}</strong> Artículos en este número</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Acceso Abierto Libre (CC BY-NC)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Category Filter Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por título, autor, resumen, palabras clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-slate-800"
            id="search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              selectedCategory === null
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Todas las Especialidades
          </button>
          {DENTAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Articles List & Volumes Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Published Articles List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <h3 className="font-serif text-lg font-bold text-slate-900">
              {selectedCategory ? `Artículos en "${selectedCategory}"` : searchQuery ? `Resultados de búsqueda` : 'Artículos Publicados'}
            </h3>
            <span className="text-xs text-slate-500 font-medium font-mono">
              Mostrando {filteredArticles.length} resultados
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-xl p-12 text-center shadow-3xs">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No se encontraron artículos publicados con esos criterios.</p>
              <p className="text-slate-400 text-xs mt-1">Pruebe modificando su búsqueda o seleccionando otra especialidad dental.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((art) => (
                <div 
                  key={art.id} 
                  id={`article-card-${art.id}`}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  onClick={() => {
                    setSelectedArticle(art);
                    setSelectedTab('abstract');
                  }}
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-mono mb-2">
                      <span className="bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded border border-slate-200 uppercase text-[10px]">
                        {art.category}
                      </span>
                      <span>DOI: {art.doi ? art.doi.replace('https://doi.org/', '') : 'N/D'}</span>
                    </div>

                    <h4 className="font-serif text-md sm:text-lg font-bold text-slate-900 group-hover:text-brand-700 leading-snug transition-colors">
                      {art.title}
                    </h4>

                    {/* Authors List */}
                    <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-600 font-medium">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{art.authors.join(', ')}</span>
                    </div>

                    {/* Short preview of abstract */}
                    <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                      {art.abstract.replace('INTRODUCCIÓN:', '').split('MÉTODOS:')[0].trim()}
                    </p>

                    {/* AI Declaration Badge */}
                    <div className="mt-3 flex items-center gap-2">
                      {art.aiDeclaration?.used ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-mono font-semibold border border-purple-200">
                          <Sparkles className="w-2.5 h-2.5" /> Declaración de IA ({art.aiDeclaration.sectionsUsed.length} apartados)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200">
                          <ShieldCheck className="w-2.5 h-2.5 text-slate-400" /> Sin IA Generativa
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata and Open button */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex flex-wrap gap-1.5">
                      {art.keywords.slice(0, 3).map((kw, i) => (
                        <span key={i} className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-mono">
                          {kw}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Leer Artículo <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Volume Archives & Editorial policies */}
        <div className="lg:col-span-4 space-y-6">
          {/* Scientific Indexing Card */}
          <div className="bg-brand-900 text-white rounded-xl p-5 shadow-2xs space-y-4">
            <div>
              <h4 className="font-serif font-bold text-base">Indexación y Métricas</h4>
              <p className="text-[11px] text-brand-100 mt-1">Nuestra revista cumple rigurosos criterios y está indexada en prestigiosas bases internacionales:</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="bg-brand-950/50 p-2 rounded border border-brand-800">
                <span className="text-slate-400 block text-[9px]">Scopus</span>
                <span className="font-bold text-teal-400">Q2 (SJR 0.42)</span>
              </div>
              <div className="bg-brand-950/50 p-2 rounded border border-brand-800">
                <span className="text-slate-400 block text-[9px]">Latindex</span>
                <span className="font-bold text-teal-400">Catálogo 2.0</span>
              </div>
              <div className="bg-brand-950/50 p-2 rounded border border-brand-800">
                <span className="text-slate-400 block text-[9px]">DOAJ</span>
                <span className="font-bold text-teal-400">Sello de Calidad</span>
              </div>
              <div className="bg-brand-950/50 p-2 rounded border border-brand-800">
                <span className="text-slate-400 block text-[9px]">Google Scholar</span>
                <span className="font-bold text-teal-400">h5-index: 18</span>
              </div>
            </div>
          </div>

          {/* Historical Archives */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs">
            <h4 className="font-serif font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">
              Archivos de la Revista
            </h4>
            <div className="space-y-3">
              {volumes.map((vol) => (
                <div 
                  key={vol.id} 
                  className={`flex items-start gap-2.5 p-2 rounded-lg transition-colors cursor-pointer hover:bg-slate-50 ${vol.isCurrent ? 'border-l-2 border-brand-600 bg-brand-50/10' : ''}`}
                  onClick={() => {
                    const artsOfVol = publishedArticles.filter(a => a.publishedInVolumeId === vol.id);
                    if(artsOfVol.length > 0) {
                      setSearchQuery('');
                      setSelectedCategory(null);
                      // Set search target or volume filter to simulate OJS archive jump
                      const firstArtOfVol = artsOfVol[0];
                      setSelectedArticle(firstArtOfVol);
                    } else {
                      alert(`El volumen "${vol.title}" no tiene artículos simulados editados en esta versión.`);
                    }
                  }}
                >
                  <FileText className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800 leading-tight">
                      {vol.title.split(':')[0]}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Año {vol.year} • Publicado el {vol.publishedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines for Authors */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-3xs space-y-3 text-xs">
            <h4 className="font-serif font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-brand-600" /> Directrices de Envío
            </h4>
            <p className="text-slate-600 leading-relaxed">
              <strong>Scientia Dentis</strong> acepta manuscritos originales de investigación, casos clínicos de alto interés y revisiones en odontología. Todos los envíos se someten a un proceso riguroso de <strong>revisión por pares doble ciego</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
              <li>Estructura exigida: Introducción, Métodos, Resultados y Discusión (IMRAD).</li>
              <li>Resumen estructurado indispensable.</li>
              <li>Referencias obligatorias en estilo Vancouver.</li>
            </ul>
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
                onClick={() => setSelectedArticle(null)}
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
