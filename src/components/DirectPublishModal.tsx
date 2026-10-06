import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  BookOpen, 
  Users, 
  Layers, 
  Tag, 
  FileCheck2, 
  Calendar,
  Lock,
  Globe2,
  Sparkles
} from 'lucide-react';
import { Article, Volume } from '../types';
import { DENTAL_CATEGORIES } from '../data';
import { publishDirectArticle, formatFileSize } from '../services/articlesService';

interface DirectPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  volumes: Volume[];
  defaultVolumeId?: string;
  onPublishSuccess: (newArticle: Article) => void;
}

export default function DirectPublishModal({
  isOpen,
  onClose,
  volumes,
  defaultVolumeId,
  onPublishSuccess
}: DirectPublishModalProps) {
  const currentVolume = volumes.find(v => v.isCurrent) || volumes[0];
  const initialVolumeId = defaultVolumeId || currentVolume?.id || 'v12n2';

  // Form State
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [affiliation, setAffiliation] = useState('Colegio de Odontólogos de La Paz (COLP)');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState(DENTAL_CATEGORIES[0] || 'Implantología Oral');
  const [keywords, setKeywords] = useState('');
  const [volumeId, setVolumeId] = useState(initialVolumeId);
  const [customDoi, setCustomDoi] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Status & Progress State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishedArticle, setPublishedArticle] = useState<Article | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Por favor seleccione un archivo en formato PDF (.pdf válido).');
        return;
      }
      // Check maximum 25MB
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage('El tamaño máximo permitido para el manuscrito PDF es de 25 MB.');
        return;
      }
      setPdfFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Por favor arrastre únicamente un archivo PDF válido (.pdf).');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage('El archivo excede el tamaño máximo permitido de 25 MB.');
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validations
    if (!title.trim()) {
      setErrorMessage('Por favor ingrese el título del artículo.');
      return;
    }
    if (!authors.trim()) {
      setErrorMessage('Por favor ingrese los autores del artículo.');
      return;
    }
    if (!abstract.trim()) {
      setErrorMessage('Por favor complete el resumen o abstract del artículo.');
      return;
    }
    if (!pdfFile) {
      setErrorMessage('Debe seleccionar el archivo PDF final del artículo maquetado.');
      return;
    }

    setIsSubmitting(true);
    setProgressPercent(10);
    setProgressStatus('Iniciando subida directa...');

    try {
      const authorsArray = authors
        .split(/[,;\n]/)
        .map(a => a.trim())
        .filter(Boolean);

      const keywordsArray = keywords
        .split(/[,;]/)
        .map(k => k.trim())
        .filter(Boolean);

      const result = await publishDirectArticle({
        title: title.trim(),
        abstract: abstract.trim(),
        authors: authorsArray,
        affiliations: affiliation.trim() ? [affiliation.trim()] : undefined,
        category,
        keywords: keywordsArray.length > 0 ? keywordsArray : ['Odontología', category],
        volumeId,
        pdfFile,
        doi: customDoi.trim() || undefined,
        onProgress: (status, percent) => {
          setProgressStatus(status);
          if (percent !== undefined) setProgressPercent(percent);
        }
      });

      if (result.success && result.article) {
        setPublishedArticle(result.article);
        onPublishSuccess(result.article);
      } else {
        setErrorMessage(result.error || 'Ocurrió un error al procesar la publicación directa.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado durante la publicación del artículo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setAuthors('');
    setAffiliation('Colegio de Odontólogos de La Paz (COLP)');
    setAbstract('');
    setCategory(DENTAL_CATEGORIES[0] || 'Implantología Oral');
    setKeywords('');
    setCustomDoi('');
    setPdfFile(null);
    setPublishedArticle(null);
    setErrorMessage(null);
    setProgressStatus('');
    setProgressPercent(0);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 fade-in"
      id="direct-publish-modal-backdrop"
    >
      <div 
        className="backdrop-blur-2xl bg-slate-900/95 border border-amber-500/30 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(245,158,11,0.15)] ring-1 ring-white/10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-teal-500 to-cyan-500 shrink-0" />

        {/* Modal Header */}
        <div className="bg-slate-950/90 px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-xs shrink-0">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30">
                  Lanzamiento Oficial Directo
                </span>
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                  Omite el arbitraje por pares
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight mt-0.5">
                Publicar Artículo Directo en Edición Actual
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* Error Notice */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-200 flex items-start gap-3 fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block text-red-300">Error en la publicación:</span>
                <span className="text-xs text-red-200/90 leading-relaxed">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Success Card view if article was published */}
          {publishedArticle ? (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-4 text-emerald-200 text-center fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 text-emerald-300 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                  Publicación Exitosa
                </span>
                <h4 className="font-serif text-lg font-bold text-white mt-1">
                  "{publishedArticle.title}"
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Autores: <strong>{publishedArticle.authors.join(', ')}</strong>
                </p>
                <p className="text-[11px] font-mono text-cyan-300 mt-1">
                  DOI Oficial: {publishedArticle.doi}
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10 text-left text-xs text-slate-300 space-y-1">
                <p>• <strong>Estado:</strong> <span className="text-emerald-400 font-mono font-bold uppercase">Publicado (Status: published)</span></p>
                <p>• <strong>Volumen:</strong> {volumes.find(v => v.id === publishedArticle.publishedInVolumeId)?.title || publishedArticle.publishedInVolumeId}</p>
                <p>• <strong>Archivo PDF:</strong> {publishedArticle.manuscriptFile.name} ({publishedArticle.manuscriptFile.size})</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {publishedArticle.pdfUrl && (
                  <a
                    href={publishedArticle.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-cyan-950/40 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Ver / Descargar PDF Subido</span>
                  </a>
                )}

                <button
                  onClick={handleResetForm}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Publicar Otro Artículo</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/5 text-slate-300 hover:text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  Cerrar y Ver en Portada
                </button>
              </div>
            </div>
          ) : (
            /* Main Publishing Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Canal Exclusivo de Lanzamiento Editorial:</strong> Utiliza este formulario para cargar artículos científicos terminados en formato PDF. Al publicarse, aparecerán inmediatamente en el catálogo de lectura de la edición activa y en la portada principal.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Título Completo del Artículo Científico <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Evaluación clínica y tomográfica del sellado apical con biocerámicos..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 placeholder-slate-500"
                />
              </div>

              {/* Authors & Affiliation (2 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Autores (Separados por coma) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    placeholder="Ej. Dra. Beatriz Villalobos, PhD, Dr. Carlos Baeza"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 placeholder-slate-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Separar múltiples autores con comas o punto y coma.</span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Filiación Institucional Principal
                  </label>
                  <input
                    type="text"
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    placeholder="Colegio de Odontólogos de La Paz (COLP)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 placeholder-slate-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Institución académica u hospitalaria de los autores.</span>
                </div>
              </div>

              {/* Category, Volume & DOI (3 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Categoría / Especialidad <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {DENTAL_CATEGORIES.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Volumen de Destino <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={volumeId}
                    onChange={(e) => setVolumeId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {volumes.map((vol) => (
                      <option key={vol.id} value={vol.id}>
                        {vol.title.split(':')[0]} {vol.isCurrent ? '(Activo)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    DOI (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customDoi}
                    onChange={(e) => setCustomDoi(e.target.value)}
                    placeholder="Auto (10.48512/...)"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              {/* Abstract / Resumen */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Resumen Académico (Abstract) <span className="text-amber-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Introducción, Métodos, Resultados y Conclusiones del estudio..."
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 placeholder-slate-500 leading-relaxed font-sans"
                />
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Palabras Clave (Keywords DeCS / MeSH)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Ej. Biocementos, Endodoncia, Tomografía Computarizada, Sellado Apical"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 placeholder-slate-500 font-mono"
                />
              </div>

              {/* PDF FILE INPUT ZONE */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Archivo Manuscrito Final en PDF (.pdf) <span className="text-amber-400">*</span>
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    pdfFile 
                      ? 'border-emerald-500/50 bg-emerald-950/20' 
                      : 'border-white/15 bg-slate-950 hover:border-amber-400/50 hover:bg-white/[0.02]'
                  }`}
                >
                  {pdfFile ? (
                    <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
                      <div className="flex items-center gap-3 text-left truncate">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-white truncate text-xs">{pdfFile.name}</p>
                          <p className="text-[10px] font-mono text-emerald-400">{formatFileSize(pdfFile.size)} • PDF listo para almacenar</p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfFile(null);
                        }}
                        className="px-2.5 py-1 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors shrink-0"
                      >
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <UploadCloud className="w-8 h-8 text-amber-400 mx-auto" />
                      <p className="text-xs font-semibold text-white">
                        Haga clic para seleccionar el PDF o arrástrelo aquí
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        Solo archivos .PDF oficiales • Máximo 25 MB • Subida directa a Supabase Storage
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar during upload */}
              {isSubmitting && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2 fade-in">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-amber-300 flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      {progressStatus || 'Procesando publicación...'}
                    </span>
                    <span className="text-amber-400 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !pdfFile}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-teal-600 to-cyan-600 hover:from-amber-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-amber-950/40 flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Subiendo y Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Publicar Inmediatamente en la Edición Actual</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
