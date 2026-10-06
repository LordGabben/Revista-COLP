import React, { useState } from 'react';
import { Shield, Users, FileText, ClipboardCheck, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Plus, BookOpen, Layers, Send, ShieldCheck, Image, Paperclip, Download, FileCheck, Zap, Rocket } from 'lucide-react';
import { Article, ArticleStatus, Review, User, Volume } from '../types';
import { ACADEMIC_REVIEWERS } from '../data';
import DirectPublishModal from './DirectPublishModal';

interface EditorDashboardProps {
  articles: Article[];
  volumes: Volume[];
  onUpdateArticle: (article: Article) => void;
  onPublishArticle: (articleId: string, volumeId: string, doi: string) => void;
  onDirectPublishSuccess?: (newArticle: Article) => void;
}

export default function EditorDashboard({ 
  articles, 
  volumes, 
  onUpdateArticle, 
  onPublishArticle,
  onDirectPublishSuccess 
}: EditorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'submitted' | 'under_review' | 'accepted' | 'published'>('submitted');
  const [assigningReviewersToId, setAssigningReviewersToId] = useState<string | null>(null);
  const [viewingArticleReviewsId, setViewingArticleReviewsId] = useState<string | null>(null);
  const [publishingArticleId, setPublishingArticleId] = useState<string | null>(null);
  const [isDirectPublishModalOpen, setIsDirectPublishModalOpen] = useState(false);

  // Form decisions
  const [editorDecisionNotes, setEditorDecisionNotes] = useState('');
  const [targetVolumeId, setTargetVolumeId] = useState(volumes[0]?.id || '');
  const [customDoiSuffix, setCustomDoiSuffix] = useState('');

  // Grouping articles
  const submittedArticles = articles.filter(a => a.status === 'submitted');
  const reviewingArticles = articles.filter(a => a.status === 'under_review' || a.status === 'revisions_required');
  const acceptedArticles = articles.filter(a => a.status === 'accepted');
  const publishedArticles = articles.filter(a => a.status === 'published');

  // Match reviewer specialties with article category or title
  const getReviewerRecommendations = (art: Article) => {
    return ACADEMIC_REVIEWERS.map(rev => {
      const isAlreadyAssigned = art.reviewers.includes(rev.id);
      const categoryKeywords = art.category.toLowerCase().split(/\s+/);
      const titleKeywords = art.title.toLowerCase().split(/\s+/);
      const specialtyKeywords = (rev.specialty || '').toLowerCase().split(/,\s+/);
      
      const score = specialtyKeywords.filter(spec => 
        categoryKeywords.some(cat => spec.includes(cat) || cat.includes(spec)) ||
        titleKeywords.some(title => spec.includes(title) || title.includes(spec))
      ).length;

      return {
        reviewer: rev,
        relevanceScore: score,
        isAlreadyAssigned
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  const handleAssignReviewer = (articleId: string, reviewerId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    if (article.reviewers.includes(reviewerId)) {
      alert('Este revisor ya está asignado a este artículo.');
      return;
    }

    const updatedReviewers = [...article.reviewers, reviewerId];
    const updatedStatus: ArticleStatus = article.status === 'submitted' ? 'under_review' : article.status;

    const updated: Article = {
      ...article,
      reviewers: updatedReviewers,
      status: updatedStatus,
      editorNotes: `Revisor asignado: ${ACADEMIC_REVIEWERS.find(r => r.id === reviewerId)?.name}. Estado cambiado a evaluación por pares.`
    };

    onUpdateArticle(updated);
    alert(`Revisor ${ACADEMIC_REVIEWERS.find(r => r.id === reviewerId)?.name} asignado correctamente.`);
  };

  const handleEditorDecision = (articleId: string, decision: 'accepted' | 'revisions_required' | 'rejected') => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    if (decision === 'revisions_required' && !editorDecisionNotes.trim()) {
      alert('Debe rellenar las notas editoriales detallando las correcciones solicitadas al autor.');
      return;
    }

    const updated: Article = {
      ...article,
      status: decision,
      editorNotes: editorDecisionNotes || `Decisión editorial del ${new Date().toISOString().split('T')[0]}: ${decision.toUpperCase()}`
    };

    onUpdateArticle(updated);
    setViewingArticleReviewsId(null);
    setEditorDecisionNotes('');
    alert(`Se ha registrado la decisión de: ${decision === 'accepted' ? 'ACEPTAR' : decision === 'rejected' ? 'RECHAZAR' : 'REVISIONES REQUERIDAS'} correctamente.`);
  };

  const handlePublishArticleSubmit = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    const selectedVolume = volumes.find(v => v.id === targetVolumeId);
    const suffix = customDoiSuffix.trim() || Math.floor(Math.random() * 90000 + 10000);
    const doiUrl = `https://doi.org/10.48512/rcoab.${selectedVolume?.year || 2026}.${suffix}`;

    onPublishArticle(articleId, targetVolumeId, doiUrl);
    setPublishingArticleId(null);
    setCustomDoiSuffix('');
    alert('¡Excelente! El artículo ha sido publicado oficialmente. Ahora es accesible al público general en el archivo del volumen seleccionado.');
  };

  return (
    <div className="fade-in space-y-6" id="editor-dashboard">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">Panel del Comité Editorial</h2>
          <p className="text-xs text-slate-500">Supervise, arbitre, y publique artículos científicos para {volumes.find(v => v.isCurrent)?.title.split(':')[0]}.</p>
        </div>

        {/* PROMINENT DIRECT PUBLISHING BUTTON */}
        <button
          onClick={() => setIsDirectPublishModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-teal-600 to-cyan-600 hover:from-amber-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-amber-950/30 border border-amber-400/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Zap className="w-4 h-4 text-amber-200 fill-amber-300" />
          <span>Publicar Artículo Directo (Lanzamiento)</span>
        </button>
      </div>

      {/* Editor Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="editor-stats-row">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] font-mono uppercase">Nuevos Envíos</span>
            <span className="text-lg font-bold text-slate-800 font-mono">{submittedArticles.length}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] font-mono uppercase">En Evaluación</span>
            <span className="text-lg font-bold text-slate-800 font-mono">{reviewingArticles.length}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] font-mono uppercase">Listos p/ Publicar</span>
            <span className="text-lg font-bold text-slate-800 font-mono">{acceptedArticles.length}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-3xs flex items-center gap-3">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-lg shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] font-mono uppercase">Publicados</span>
            <span className="text-lg font-bold text-slate-800 font-mono">{publishedArticles.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-3xs flex gap-1 shrink-0 overflow-x-auto">
        {[
          { tab: 'submitted', label: `Nuevos Envíos (${submittedArticles.length})` },
          { tab: 'under_review', label: `En Evaluación (${reviewingArticles.length})` },
          { tab: 'accepted', label: `Aceptados / Listos (${acceptedArticles.length})` },
          { tab: 'published', label: `Publicados en Volúmenes (${publishedArticles.length})` },
          { tab: 'direct_publish', label: '⚡ Lanzamiento Rápido' }
        ].map((t) => (
          <button
            key={t.tab}
            onClick={() => {
              if (t.tab === 'direct_publish') {
                setIsDirectPublishModalOpen(true);
              } else {
                setActiveTab(t.tab as any);
                setAssigningReviewersToId(null);
                setViewingArticleReviewsId(null);
                setPublishingArticleId(null);
              }
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === t.tab
                ? 'bg-brand-600 text-white shadow-2xs'
                : t.tab === 'direct_publish'
                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-extrabold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT PANEL */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-3xs">
        
        {/* VIEW 1: NEW SUBMISSIONS (SUBMITTED) */}
        {activeTab === 'submitted' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <h3 className="font-serif font-bold text-slate-900 text-sm">Nuevos Manuscritos Recibidos</h3>
              <span className="text-[10px] text-slate-400 font-mono">Fase 1: Revisión Técnica & Asignación de Pares</span>
            </div>

            {submittedArticles.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">No hay nuevos manuscritos pendientes de revisión inicial.</p>
            ) : (
              <div className="space-y-4">
                {submittedArticles.map((art) => {
                  const isAssigning = assigningReviewersToId === art.id;
                  const recs = getReviewerRecommendations(art);

                  return (
                    <div key={art.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[9px] font-mono uppercase font-bold">
                              {art.category}
                            </span>
                            {art.aiDeclaration?.used ? (
                              <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-800 text-[9px] font-mono font-bold flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> IA Declarada ({art.aiDeclaration.sectionsUsed.length} apartados)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-mono font-bold flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5 text-slate-400" /> Sin uso de IA
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-bold text-slate-900 leading-snug mt-1.5">{art.title}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Autor de contacto: {art.authors[0]} ({art.authorEmails[0]})</p>
                          {art.aiDeclaration?.used && (
                            <div className="mt-2 text-[10.5px] bg-slate-900 text-slate-300 p-2 rounded-md font-mono space-y-1 border border-slate-800">
                              <span className="text-brand-400 font-bold block">Apartados con asistencia de IA:</span>
                              <div className="flex flex-wrap gap-1">
                                {art.aiDeclaration.sectionsUsed.map((sec, i) => (
                                  <span key={i} className="bg-slate-800 px-1.5 py-0.5 rounded text-[9.5px] text-slate-200 border border-slate-700">
                                    {sec}
                                  </span>
                                ))}
                              </div>
                              {art.aiDeclaration.toolsAndScope && (
                                <p className="text-[10px] text-slate-400 italic pt-0.5">"{art.aiDeclaration.toolsAndScope}"</p>
                              )}
                            </div>
                          )}

                          {/* Files repository display for editor */}
                          <div className="mt-3 pt-2 border-t border-slate-150">
                            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-1">Archivos Depositados ({1 + (art.figures?.length || 0) + (art.supplementaryFiles?.length || 0)}):</span>
                            <div className="flex flex-wrap gap-1.5">
                              {/* Manuscript badge */}
                              <div className="bg-white border border-slate-200 rounded px-2 py-1 flex items-center gap-1.5 text-[11px] font-mono">
                                <FileCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                                <span className="text-slate-800 truncate max-w-[160px]">{art.manuscriptFile?.name}</span>
                                <span className="text-[9px] bg-brand-50 text-brand-700 px-1 rounded uppercase font-bold">{art.manuscriptFile?.format || 'DOCX'}</span>
                                <button 
                                  onClick={() => alert(`Descargando manuscrito ${art.manuscriptFile?.name}...`)}
                                  className="text-slate-400 hover:text-brand-700 ml-0.5"
                                  title="Descargar"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Figures badges */}
                              {art.figures && art.figures.map(fig => (
                                <div key={fig.id} className="bg-white border border-slate-200 rounded px-2 py-1 flex items-center gap-1.5 text-[11px] font-mono">
                                  <Image className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span className="text-slate-800 truncate max-w-[140px]">{fig.figureNumber ? `${fig.figureNumber}` : fig.name}</span>
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 rounded border border-emerald-200 font-bold">
                                    {fig.dpi || 300} DPI
                                  </span>
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded uppercase font-bold">
                                    {fig.format}
                                  </span>
                                  <button 
                                    onClick={() => alert(`Descargando figura en alta resolución (${fig.dpi || 300} DPI): ${fig.name}...`)}
                                    className="text-slate-400 hover:text-indigo-700 ml-0.5"
                                    title="Descargar figura"
                                  >
                                    <Download className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}

                              {/* Supplementary badges */}
                              {art.supplementaryFiles && art.supplementaryFiles.map(sup => (
                                <div key={sup.id} className="bg-white border border-slate-200 rounded px-2 py-1 flex items-center gap-1.5 text-[11px] font-mono">
                                  <Paperclip className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span className="text-slate-800 truncate max-w-[130px]">{sup.name}</span>
                                  <button 
                                    onClick={() => alert(`Descargando documento anexo: ${sup.name}...`)}
                                    className="text-slate-400 hover:text-amber-700 ml-0.5"
                                    title="Descargar anexo"
                                  >
                                    <Download className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-500 font-mono block">Recibido: {art.submittedAt}</span>
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full mt-1 inline-block bg-teal-50 border border-teal-200 text-teal-800`}>
                            Formato: {art.formattingScore}% Match
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="text-xs text-slate-600">
                          Revisores asignados: <strong className="text-slate-800">{art.reviewers.length} de 2 recomendados</strong>
                        </div>
                        <button
                          onClick={() => setAssigningReviewersToId(isAssigning ? null : art.id)}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                        >
                          {isAssigning ? 'Ocultar Asignación' : 'Asignar Pares Revisores'}
                        </button>
                      </div>

                      {/* Reviewer Assignment drawer */}
                      {isAssigning && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 mt-3 fade-in">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-brand-600" /> Sugerencia Inteligente de Revisores por Especialidad:
                            </h5>
                            <span className="text-[10px] text-slate-400 font-mono">Scientia Dentis Matcher</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            {recs.map(({ reviewer, relevanceScore, isAlreadyAssigned }) => (
                              <div key={reviewer.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center bg-slate-50/50">
                                <div>
                                  <h6 className="font-bold text-slate-800">{reviewer.name}</h6>
                                  <p className="text-[10px] text-slate-500">{reviewer.affiliation}</p>
                                  <p className="text-[10px] text-brand-700 font-medium mt-0.5">Especialidad: {reviewer.specialty}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  {isAlreadyAssigned ? (
                                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded">
                                      Asignado
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAssignReviewer(art.id, reviewer.id)}
                                      className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-md text-[10.5px] cursor-pointer"
                                    >
                                      Asignar
                                    </button>
                                  )}
                                  <span className="block text-[9px] text-slate-400 mt-1 font-mono">Relevancia: {relevanceScore > 0 ? `Alto (${relevanceScore})` : 'Bajo'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: EVALUATION QUEUE */}
        {activeTab === 'under_review' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <h3 className="font-serif font-bold text-slate-900 text-sm">Monitoreo de Evaluación por Pares</h3>
              <span className="text-[10px] text-slate-400 font-mono">Fase 2: Arbitraje Científico Ciego</span>
            </div>

            {reviewingArticles.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">No hay artículos en fase de revisión activa en este momento.</p>
            ) : (
              <div className="space-y-4">
                {reviewingArticles.map((art) => {
                  const isViewingReviews = viewingArticleReviewsId === art.id;
                  
                  return (
                    <div key={art.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[9px] font-mono uppercase font-bold">
                              {art.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                              art.status === 'revisions_required' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {art.status === 'revisions_required' ? 'Solicitado a Autor: Correcciones' : 'En Arbitraje Activo'}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-slate-900 leading-snug mt-1.5">{art.title}</h4>
                          <p className="text-xs text-slate-500 font-medium">Revisores asignados de forma ciega: {art.reviewers.map(id => ACADEMIC_REVIEWERS.find(r => r.id === id)?.name.split(',')[0]).join('; ') || 'Ninguno'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-500 font-mono block">Enviado: {art.submittedAt}</span>
                          <span className="text-xs text-indigo-700 font-semibold font-mono block">Informes Recibidos: {art.reviews.length}</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="text-xs text-slate-600">
                          {art.reviews.length > 0 ? (
                            <span className="text-emerald-600 font-semibold">¡Informes de revisión disponibles para deliberación!</span>
                          ) : (
                            <span className="text-slate-500">Esperando informes de los árbitros asignados...</span>
                          )}
                        </div>
                        <button
                          onClick={() => setViewingArticleReviewsId(isViewingReviews ? null : art.id)}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                        >
                          {isViewingReviews ? 'Ocultar Informes' : 'Ver Informes & Decidir'}
                        </button>
                      </div>

                      {/* Editorial Decision form and reviews visualizer */}
                      {isViewingReviews && (
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 mt-3 fade-in text-xs">
                          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                            <h5 className="font-bold text-slate-800 text-xs">Dictámenes de Revisión por Pares recibidos:</h5>
                            <span className="text-[10px] text-slate-400 font-mono">Doble Ciego</span>
                          </div>

                          {art.reviews.length === 0 ? (
                            <p className="text-slate-400 text-center py-4 italic">No se han recibido informes de revisión para este artículo todavía.</p>
                          ) : (
                            <div className="space-y-3">
                              {art.reviews.map((rev) => (
                                <div key={rev.id} className="border border-slate-200 p-3.5 rounded-lg bg-slate-50/50 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-800">{rev.reviewerName}</span>
                                    <span className="px-2 py-0.5 rounded bg-slate-200 border text-[9.5px] font-mono uppercase font-semibold">
                                      Recomienda: {rev.recommendation === 'accept' ? 'Aceptar' : rev.recommendation === 'minor_revisions' ? 'Revisión Menor' : rev.recommendation === 'major_revisions' ? 'Revisión Mayor' : 'Rechazar'}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] bg-white p-1 rounded border">
                                    <span>Orig: <strong>{rev.originalityScore}</strong></span>
                                    <span>Mét: <strong>{rev.methodologyScore}</strong></span>
                                    <span>Rel: <strong>{rev.clinicalRelevanceScore}</strong></span>
                                    <span>Ét: <strong>{rev.ethicalScore}</strong></span>
                                  </div>
                                  <p className="italic text-slate-600 mt-1 leading-relaxed text-[11px]">"{rev.comments}"</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Editor Action panel */}
                          <div className="border-t border-slate-100 pt-4 space-y-3.5 bg-slate-50/40 p-4 rounded-xl border">
                            <h6 className="font-bold text-slate-800 text-xs">Instrucción Editorial para la decisión:</h6>
                            <textarea
                              rows={3}
                              value={editorDecisionNotes}
                              onChange={(e) => setEditorDecisionNotes(e.target.value)}
                              placeholder="Escriba aquí los comentarios definitivos para el autor. Es obligatorio si solicita revisiones formales..."
                              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 bg-white"
                            />
                            <div className="flex flex-wrap gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => handleEditorDecision(art.id, 'revisions_required')}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold cursor-pointer"
                              >
                                Solicitar Revisiones al Autor
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditorDecision(art.id, 'accepted')}
                                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold cursor-pointer"
                              >
                                Aceptar Manuscrito p/ Publicación
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditorDecision(art.id, 'rejected')}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold cursor-pointer"
                              >
                                Rechazar Manuscrito
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: ACCEPTED / PUBLISHING */}
        {activeTab === 'accepted' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <h3 className="font-serif font-bold text-slate-900 text-sm">Manuscritos Aprobados listos para Maquetación</h3>
              <span className="text-[10px] text-slate-400 font-mono">Fase 3: Asignación de DOI & Maquetación Editorial</span>
            </div>

            {acceptedArticles.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">No hay artículos aprobados en espera de maquetación final.</p>
            ) : (
              <div className="space-y-4">
                {acceptedArticles.map((art) => {
                  const isPublishing = publishingArticleId === art.id;

                  return (
                    <div key={art.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-mono uppercase font-bold">
                            {art.category} • Aprobado
                          </span>
                          <h4 className="font-serif font-bold text-slate-900 leading-snug mt-1.5">{art.title}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Autor principal: {art.authors[0]}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <button
                            onClick={() => setPublishingArticleId(isPublishing ? null : art.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                          >
                            Publicar Oficialmente
                          </button>
                        </div>
                      </div>

                      {/* Publishing Options Drawer */}
                      {isPublishing && (
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 mt-3 fade-in text-xs">
                          <h5 className="font-bold text-slate-800 border-b pb-1.5">Asignación de Volumen Editorial y Registro DOI</h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 font-mono uppercase tracking-wide text-[9px]">Seleccionar Volumen Destino:</label>
                              <select
                                value={targetVolumeId}
                                onChange={(e) => setTargetVolumeId(e.target.value)}
                                className="w-full p-2 border rounded-lg bg-white"
                              >
                                {volumes.map(v => (
                                  <option key={v.id} value={v.id}>{v.title}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-slate-700 font-mono uppercase tracking-wide text-[9px]">Sufijo DOI Único (Ej: rcoab.2026.12204):</label>
                              <input
                                type="text"
                                value={customDoiSuffix}
                                onChange={(e) => setCustomDoiSuffix(e.target.value)}
                                placeholder="Ej: 12204"
                                className="w-full p-2 border rounded-lg text-slate-800 font-mono"
                              />
                            </div>
                          </div>

                          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg text-emerald-950 flex gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Publicación de Acceso Abierto</p>
                              <p className="text-emerald-800 mt-0.5">Al presionar "Aprobar Maquetación y Publicar", el artículo se unirá inmediatamente a la tabla de contenidos pública y se le asignará una URL con DOI científico permanente de libre indexación.</p>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2.5 font-bold pt-2">
                            <button
                              type="button"
                              onClick={() => setPublishingArticleId(null)}
                              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePublishArticleSubmit(art.id)}
                              className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-lg cursor-pointer"
                            >
                              Aprobar Maquetación y Publicar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: PUBLISHED ARCHIVES */}
        {activeTab === 'published' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <h3 className="font-serif font-bold text-slate-900 text-sm">Artículos Publicados Indexados</h3>
              <span className="text-[10px] text-slate-400 font-mono">Fase 4: Ciencia Abierta & Consulta Pública</span>
            </div>

            {publishedArticles.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-8">No hay artículos publicados formalmente en los tomos activos.</p>
            ) : (
              <div className="space-y-3.5">
                {publishedArticles.map((art) => (
                  <div key={art.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[9px] uppercase font-bold">
                        {art.category}
                      </span>
                      <h4 className="font-serif font-bold text-slate-900 leading-tight mt-1">{art.title}</h4>
                      <p className="text-slate-500 text-[11px]">Volumen: <strong className="text-slate-700 font-mono">{volumes.find(v => v.id === art.publishedInVolumeId)?.title.split(':')[0]}</strong></p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-slate-400 text-[10px] block font-mono">DOI: {art.doi ? art.doi.replace('https://doi.org/', '') : 'N/D'}</span>
                      <span className="text-emerald-600 font-bold font-mono text-[11px] block mt-1">✓ Indexado en Scopus</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL: DIRECT PUBLISHING (LAUNCH FLOW) */}
      <DirectPublishModal
        isOpen={isDirectPublishModalOpen}
        onClose={() => setIsDirectPublishModalOpen(false)}
        volumes={volumes}
        defaultVolumeId={volumes.find(v => v.isCurrent)?.id || 'v12n2'}
        onPublishSuccess={(newArticle) => {
          if (onDirectPublishSuccess) {
            onDirectPublishSuccess(newArticle);
          }
          setActiveTab('published');
        }}
      />
    </div>
  );
}
