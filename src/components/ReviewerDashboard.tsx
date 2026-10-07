import React, { useState } from 'react';
import { ClipboardCheck, FileText, MessageSquare, Star, Send, Layers, HelpCircle, CheckCircle2, Sparkles, ShieldCheck, Image, Paperclip, Download, FileCheck } from 'lucide-react';
import { Article, Review, User } from '../types';
import { ACADEMIC_REVIEWERS } from '../data';
import { submitReview } from '../services/articlesService';

interface ReviewerDashboardProps {
  articles: Article[];
  onAddReview: (articleId: string, review: Review) => void;
}

export default function ReviewerDashboard({ articles, onAddReview }: ReviewerDashboardProps) {
  // Mock logged-in reviewer is Dra. Sofía Mendoza, PhD (rev4)
  const activeReviewer: User = ACADEMIC_REVIEWERS.find(r => r.id === 'rev4') || ACADEMIC_REVIEWERS[3];

  const assignedArticles = articles.filter(art => 
    art.reviewers.includes(activeReviewer.id) && 
    art.status === 'under_review'
  );

  const completedArticles = articles.filter(art => 
    art.reviews.some(rev => rev.reviewerId === activeReviewer.id)
  );

  const [reviewingArticle, setReviewingArticle] = useState<Article | null>(null);

  // Form states
  const [originality, setOriginality] = useState(5);
  const [methodology, setMethodology] = useState(4);
  const [relevance, setRelevance] = useState(5);
  const [ethical, setEthical] = useState(5);
  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState<'accept' | 'minor_revisions' | 'major_revisions' | 'reject'>('minor_revisions');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingArticle) return;
    if (!comments.trim()) {
      alert('Por favor ingrese sus comentarios y observaciones técnicas.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const result = await submitReview({
        articleId: reviewingArticle.id,
        reviewerId: activeReviewer.id,
        reviewerName: activeReviewer.name,
        originalityScore: originality,
        methodologyScore: methodology,
        clinicalRelevanceScore: relevance,
        ethicalScore: ethical,
        comments: comments.trim(),
        recommendation
      });

      if (result.success && result.review) {
        onAddReview(reviewingArticle.id, result.review);
      } else {
        throw new Error('No se pudo registrar la revisión en Supabase.');
      }

      setReviewingArticle(null);
      resetForm();
      alert('¡Excelente! Su arbitraje por pares ha sido registrado en la base de datos de Scientia Dentis (COLP) y ya es visible para el Comité Editorial.');
    } catch (err: any) {
      alert('Error registrando evaluación: ' + err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const resetForm = () => {
    setOriginality(5);
    setMethodology(4);
    setRelevance(5);
    setEthical(5);
    setComments('');
    setRecommendation('minor_revisions');
  };

  return (
    <div className="fade-in space-y-6" id="reviewer-dashboard">
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-900">Panel de Revisión por Pares (Double-Blind Peer Review)</h2>
        <p className="text-xs text-slate-500">Evalúe los manuscritos clínicos odontológicos asignados a su línea de investigación.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Workspace (Left Column) */}
        <div className="lg:col-span-8 space-y-6">
          {reviewingArticle ? (
            /* ACTIVE REVIEW FORM */
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs" id="active-review-form">
              <div className="bg-slate-900 text-white p-5">
                <h3 className="font-serif font-bold text-base">Ficha de Arbitraje Científico</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Artículo: {reviewingArticle.title}</p>
              </div>

              <form onSubmit={handleSubmitReview} className="p-6 space-y-5">
                {/* Reference Material Info & Files Explorer */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 uppercase font-mono text-[9.5px]">Manuscrito Bajo Evaluación (Revisión Ciega):</h4>
                    <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-mono font-bold">{reviewingArticle.category}</span>
                  </div>
                  <p className="text-slate-700 leading-normal font-sans italic bg-white p-3 rounded border border-slate-200">
                    "{reviewingArticle.abstract.replace('INTRODUCCIÓN:', '').split('MÉTODOS:')[0].trim()}..."
                  </p>

                  {/* Scientific Assets for Reviewer */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Archivos y Figuras para Dictamen Clínico:</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Manuscript */}
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileCheck className="w-4 h-4 text-brand-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-medium text-slate-800 block truncate text-[11px]">{reviewingArticle.manuscriptFile?.name}</span>
                            <span className="text-[9.5px] text-slate-400 font-mono">Texto completo ciego ({reviewingArticle.manuscriptFile?.format || 'DOCX'})</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => alert(`Descargando manuscrito para revisión: ${reviewingArticle.manuscriptFile?.name}`)}
                          className="p-1 text-slate-400 hover:text-brand-600 cursor-pointer shrink-0"
                          title="Descargar manuscrito"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Figures */}
                      {reviewingArticle.figures && reviewingArticle.figures.map((fig) => (
                        <div key={fig.id} className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Image className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div className="truncate">
                              <span className="font-medium text-slate-800 block truncate text-[11px]">
                                {fig.figureNumber ? `${fig.figureNumber}: ` : ''}{fig.name}
                              </span>
                              <div className="flex items-center gap-1 text-[9px] font-mono">
                                <span className="text-emerald-700 bg-emerald-50 px-1 rounded font-bold">{fig.dpi || 300} DPI</span>
                                <span className="text-slate-500 uppercase">{fig.format}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => alert(`Descargando figura en alta resolución (${fig.dpi || 300} DPI): ${fig.name}`)}
                            className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer shrink-0"
                            title="Descargar figura"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Supplementary */}
                      {reviewingArticle.supplementaryFiles && reviewingArticle.supplementaryFiles.map((sup) => (
                        <div key={sup.id} className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Paperclip className="w-4 h-4 text-amber-600 shrink-0" />
                            <div className="truncate">
                              <span className="font-medium text-slate-800 block truncate text-[11px]">{sup.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono uppercase">{sup.format} anexo</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => alert(`Descargando anexo: ${sup.name}`)}
                            className="p-1 text-slate-400 hover:text-amber-600 cursor-pointer shrink-0"
                            title="Descargar anexo"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Declaration Transparency Inspection for Reviewer */}
                <div className="bg-slate-900 text-white rounded-lg p-4 text-xs space-y-2 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-300 flex items-center gap-1.5 font-mono text-[10px] uppercase">
                      <Sparkles className="w-3.5 h-3.5" /> Declaración de Transparencia de IA (COPE / ICMJE)
                    </span>
                    {reviewingArticle.aiDeclaration?.used ? (
                      <span className="px-2 py-0.5 rounded bg-purple-900/80 border border-purple-700 text-purple-200 text-[9px] font-mono font-bold uppercase">
                        Uso Declarado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[9px] font-mono">
                        Sin Uso de IA
                      </span>
                    )}
                  </div>

                  {reviewingArticle.aiDeclaration?.used ? (
                    <div className="space-y-2 text-[11px] text-slate-300 pt-1">
                      <div>
                        <span className="text-slate-400 block text-[9.5px] font-mono">Apartados / componentes asistidos:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {reviewingArticle.aiDeclaration.sectionsUsed.map((sec, idx) => (
                            <span key={idx} className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px] text-brand-300">
                              {sec}
                            </span>
                          ))}
                        </div>
                      </div>
                      {reviewingArticle.aiDeclaration.toolsAndScope && (
                        <div>
                          <span className="text-slate-400 block text-[9.5px] font-mono">Descripción del autor:</span>
                          <p className="italic bg-slate-950/60 p-2 rounded border border-slate-800 text-slate-300">
                            "{reviewingArticle.aiDeclaration.toolsAndScope}"
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5" /> Supervisión humana e integridad científica confirmada por los autores.
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Los autores certifican que no se utilizaron modelos de IA generativa en la redacción, procesamiento ni diseño de figuras.
                    </p>
                  )}
                </div>

                {/* Scorecards */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-xs font-mono uppercase border-b border-slate-100 pb-1">Evaluación Cuantitativa (Escala de 1 a 5):</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Originality */}
                    <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-700">Originalidad y Novedad:</label>
                        <span className="font-mono font-bold text-brand-700">{originality} / 5</span>
                      </div>
                      <input
                        type="range" min="1" max="5" value={originality}
                        onChange={(e) => setOriginality(Number(e.target.value))}
                        className="w-full accent-brand-600"
                      />
                      <p className="text-[10px] text-slate-400">¿El aporte es novedoso para la comunidad dental?</p>
                    </div>

                    {/* Methodology */}
                    <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-700">Diseño y Metodología:</label>
                        <span className="font-mono font-bold text-brand-700">{methodology} / 5</span>
                      </div>
                      <input
                        type="range" min="1" max="5" value={methodology}
                        onChange={(e) => setMethodology(Number(e.target.value))}
                        className="w-full accent-brand-600"
                      />
                      <p className="text-[10px] text-slate-400">¿La instrumentación y controles son adecuados?</p>
                    </div>

                    {/* Clinical Relevance */}
                    <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-700">Relevancia Clínica:</label>
                        <span className="font-mono font-bold text-brand-700">{relevance} / 5</span>
                      </div>
                      <input
                        type="range" min="1" max="5" value={relevance}
                        onChange={(e) => setRelevance(Number(e.target.value))}
                        className="w-full accent-brand-600"
                      />
                      <p className="text-[10px] text-slate-400">¿Tiene aplicabilidad directa en el consultorio?</p>
                    </div>

                    {/* Ethical standards */}
                    <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-slate-700">Rigor Ético / Citas:</label>
                        <span className="font-mono font-bold text-brand-700">{ethical} / 5</span>
                      </div>
                      <input
                        type="range" min="1" max="5" value={ethical}
                        onChange={(e) => setEthical(Number(e.target.value))}
                        className="w-full accent-brand-600"
                      />
                      <p className="text-[10px] text-slate-400">¿Cumple con Helsinki y consentimiento informado?</p>
                    </div>
                  </div>
                </div>

                {/* Technical Comments */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 font-mono uppercase tracking-wide text-[10px]">Comentarios y Correcciones Críticas (Visible para Editor y Autor):</label>
                  <textarea
                    rows={4}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Escriba sugerencias detalladas. Ej: Sugiero ampliar la muestra clínica e incorporar radiografías apicales de control..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500 text-slate-800"
                  />
                </div>

                {/* Recommendation Picker */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 font-mono uppercase tracking-wide text-[10px]">Recomendación Editorial Definitiva:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { val: 'accept', label: 'Aceptar sin Cambios', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
                      { val: 'minor_revisions', label: 'Revisiones Menores', color: 'border-amber-200 bg-amber-50 text-amber-800' },
                      { val: 'major_revisions', label: 'Revisiones Mayores', color: 'border-orange-200 bg-orange-50 text-orange-800' },
                      { val: 'reject', label: 'Rechazar de plano', color: 'border-rose-200 bg-rose-50 text-rose-800' }
                    ].map((rec) => (
                      <button
                        key={rec.val}
                        type="button"
                        onClick={() => setRecommendation(rec.val as any)}
                        className={`p-2.5 rounded-lg border text-center text-[10.5px] font-bold cursor-pointer transition-all ${
                          recommendation === rec.val
                            ? `${rec.color} ring-2 ring-brand-500 font-extrabold scale-102`
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {rec.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => { setReviewingArticle(null); resetForm(); }}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-lg shadow-xs cursor-pointer transition-colors"
                  >
                    {isSubmittingReview ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Guardando en Base de Datos...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Enviar Arbitraje Técnico
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ASSIGNED ARTICLES INDEX */
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4" id="assigned-reviews-index">
              <h3 className="font-serif font-bold text-slate-900 border-b border-slate-100 pb-2">
                Evaluaciones Científicas Pendientes
              </h3>

              {assignedArticles.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-medium">No tiene evaluaciones científicas pendientes asignadas.</p>
                  <p className="text-slate-400 text-xs">El Editor Jefe le notificará en cuanto un nuevo manuscrito clínico requiera de su área de peritaje.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedArticles.map((art) => (
                    <div 
                      key={art.id} 
                      className="border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-indigo-400 hover:shadow-xs transition-all bg-slate-50/20 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                          <span className="bg-indigo-50 text-indigo-800 font-semibold px-2 py-0.5 rounded border border-indigo-200 uppercase text-[9px]">
                            {art.category}
                          </span>
                          <span>Asignado: {art.submittedAt}</span>
                        </div>
                        <h4 className="font-serif font-bold text-slate-900 leading-snug">{art.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{art.abstract.split('\n\n')[0]}</p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-mono">Doble Ciego: Autores Anónimos</span>
                        <button
                          onClick={() => setReviewingArticle(art)}
                          className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" /> Evaluar Manuscrito
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informational Sidebar (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Reviewer Profile stats */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
            <h4 className="font-serif font-bold text-slate-900 border-b border-slate-100 pb-2">
              Su Perfil de Arbitraje
            </h4>
            <div className="text-xs space-y-3 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[9px] font-mono uppercase">Especialidad Clínica:</span>
                <span className="font-semibold text-slate-800">{activeReviewer.specialty}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] font-mono uppercase">Institución Afiliada:</span>
                <span className="font-semibold text-slate-800">{activeReviewer.affiliation}</span>
              </div>
              <div className="pt-2 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="font-bold text-slate-800 font-mono text-base">{completedArticles.length}</span>
                  <span className="text-[9px] text-slate-400 block">Completados</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="font-bold text-indigo-700 font-mono text-base">{assignedArticles.length}</span>
                  <span className="text-[9px] text-slate-400 block">Pendientes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviewer Ethics */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-3xs space-y-3 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-serif font-bold text-slate-900 flex items-center gap-1">
              <ClipboardCheck className="w-4 h-4 text-brand-700" /> Ética de Evaluación
            </h4>
            <p>
              El proceso de revisión doble ciego requiere mantener estricta reserva de la información. Queda totalmente prohibido divulgar, reproducir o apropiarse de partes de los manuscritos en proceso.
            </p>
            <p className="font-semibold text-slate-800">
              En caso de detectar conflicto de interés o sospechar plagio, repórtelo de inmediato al Editor Jefe.
            </p>
          </div>
        </div>
      </div>

      {/* COMPLETED REVIEWS LOG */}
      {completedArticles.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
          <h3 className="font-serif font-bold text-slate-900 border-b border-slate-100 pb-2">
            Historial de Evaluaciones Enviadas
          </h3>
          <div className="space-y-3">
            {completedArticles.map((art) => {
              const myReview = art.reviews.find(r => r.reviewerId === activeReviewer.id);
              if(!myReview) return null;
              return (
                <div key={art.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <span className="bg-slate-200 text-slate-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">{art.category}</span>
                    <h5 className="font-serif font-bold text-slate-800 text-xs sm:text-sm">{art.title}</h5>
                    <p className="text-[10px] text-slate-500 italic">"Comentarios: {myReview.comments.slice(0, 100)}..."</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider font-mono">
                      Recomendado: {myReview.recommendation}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-1 font-mono">Enviado: {myReview.submittedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
