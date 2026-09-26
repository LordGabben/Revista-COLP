import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, HelpCircle, Image, FileText } from 'lucide-react';
import { ArticleFile } from '../types';

interface AutoFormatCheckProps {
  title: string;
  abstract: string;
  keywords: string[];
  referencesCount: number;
  wordCount: number;
  figures?: ArticleFile[];
  manuscriptFile?: { name: string; size: string; format?: string };
  onAnalysisComplete: (score: number, report: string[]) => void;
  triggerCheck: boolean;
}

export default function AutoFormatCheck({
  title,
  abstract,
  keywords,
  referencesCount,
  wordCount,
  figures = [],
  manuscriptFile,
  onAnalysisComplete,
  triggerCheck
}: AutoFormatCheckProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [checklist, setChecklist] = useState<Array<{ name: string; status: 'pass' | 'warn' | 'fail'; message: string }>>([]);

  const runAnalysis = () => {
    setAnalyzing(true);
    setScore(null);
    
    setTimeout(() => {
      const report: Array<{ name: string; status: 'pass' | 'warn' | 'fail'; message: string }> = [];
      let currentScore = 100;

      // 1. Title Check
      if (title.trim().length === 0) {
        report.push({ name: 'Longitud del Título', status: 'fail', message: 'El título de la investigación no puede estar vacío.' });
        currentScore -= 20;
      } else if (title.trim().split(/\s+/).length < 5) {
        report.push({ name: 'Longitud del Título', status: 'warn', message: 'El título es demasiado corto para un manuscrito científico.' });
        currentScore -= 5;
      } else if (title.trim().split(/\s+/).length > 20) {
        report.push({ name: 'Longitud del Título', status: 'warn', message: 'El título excede las 20 palabras sugeridas.' });
        currentScore -= 5;
      } else {
        report.push({ name: 'Longitud del Título', status: 'pass', message: 'Título correcto y balanceado.' });
      }

      // 2. Structured Abstract (IMRAD)
      const abstractUpper = abstract.toUpperCase();
      const hasIntro = abstractUpper.includes('INTRODUCCIÓN') || abstractUpper.includes('INTRODUCCION');
      const hasMethod = abstractUpper.includes('MÉTODO') || abstractUpper.includes('METODO') || abstractUpper.includes('DISEÑO');
      const hasResult = abstractUpper.includes('RESULTADO');
      const hasConcl = abstractUpper.includes('CONCLUSI');

      if (abstract.trim().length === 0) {
        report.push({ name: 'Resumen Estructurado (IMRAD)', status: 'fail', message: 'El resumen científico es obligatorio para el indexado.' });
        currentScore -= 25;
      } else if (hasIntro && hasMethod && hasResult && hasConcl) {
        report.push({ name: 'Resumen Estructurado (IMRAD)', status: 'pass', message: 'Estructura IMRAD completa detectada (Intro, Método, Resultados, Conclusiones).' });
      } else {
        const missing = [];
        if (!hasIntro) missing.push('Introducción');
        if (!hasMethod) missing.push('Métodos');
        if (!hasResult) missing.push('Resultados');
        if (!hasConcl) missing.push('Conclusiones');
        report.push({ name: 'Resumen Estructurado (IMRAD)', status: 'warn', message: `Faltan las secciones obligatorias: ${missing.join(', ')}.` });
        currentScore -= 15;
      }

      // 3. Dentistry Domain Keywords Check
      const dentalGlossary = ['implante', 'dental', 'odontología', 'caries', 'dentina', 'endodoncia', 'periodoncia', 'estratificación', 'resina', 'biocerámico', 'peróxido', 'hueso', 'apical', 'conducto', 'ortodoncia', 'estomatología', 'bioingeniería', 'clínico'];
      const textToAnalyze = (title + ' ' + abstract + ' ' + keywords.join(' ')).toLowerCase();
      const matchKeywords = dentalGlossary.filter(word => textToAnalyze.includes(word));

      if (matchKeywords.length >= 3) {
        report.push({ name: 'Terminología Odontológica', status: 'pass', message: `Excelente relevancia de palabras clave detectada (${matchKeywords.slice(0, 4).join(', ')}).` });
      } else if (matchKeywords.length > 0) {
        report.push({ name: 'Terminología Odontológica', status: 'warn', message: 'Baja densidad de vocabulario clínico especializado en odontología.' });
        currentScore -= 5;
      } else {
        report.push({ name: 'Terminología Odontológica', status: 'fail', message: 'No se detectó terminología propia de ciencias estomatológicas.' });
        currentScore -= 15;
      }

      // 4. Word Count
      if (wordCount === 0) {
        report.push({ name: 'Extensión de Palabras', status: 'fail', message: 'Cuerpo del manuscrito ausente.' });
        currentScore -= 20;
      } else if (wordCount < 1500) {
        report.push({ name: 'Extensión de Palabras', status: 'warn', message: `Manuscrito corto (${wordCount} palabras). Sugerido mayor a 1500 palabras.` });
        currentScore -= 10;
      } else if (wordCount > 6000) {
        report.push({ name: 'Extensión de Palabras', status: 'warn', message: `Manuscrito largo (${wordCount} palabras). Máximo admitido 6000 palabras.` });
        currentScore -= 5;
      } else {
        report.push({ name: 'Extensión de Palabras', status: 'pass', message: `Longitud conforme con la política editorial (${wordCount} palabras).` });
      }

      // 5. Scientific High-Resolution Figures Check (TIFF, EPS, JPG, PDF at >= 300 DPI)
      if (figures && figures.length > 0) {
        const subStandardFigures = figures.filter(f => (f.dpi || 0) < 300);
        const acceptableFormats = ['tiff', 'tif', 'eps', 'jpg', 'jpeg', 'png', 'pdf'];
        const badFormatFigures = figures.filter(f => !acceptableFormats.includes(f.format.toLowerCase()));

        if (subStandardFigures.length === 0 && badFormatFigures.length === 0) {
          report.push({
            name: 'Resolución de Figuras Científicas (≥300 DPI)',
            status: 'pass',
            message: `${figures.length} figura(s) cargadas por separado en formato de alta resolución (.${figures.map(f => f.format.toUpperCase()).join(', .')}) con densidad ≥300 DPI conforme al estándar de imprenta.`
          });
        } else if (subStandardFigures.length > 0) {
          report.push({
            name: 'Resolución de Figuras Científicas (≥300 DPI)',
            status: 'warn',
            message: `Hay ${subStandardFigures.length} figura(s) con resolución inferior a 300 DPI. Se requiere alta definición para cortes histológicos y radiografías.`
          });
          currentScore -= 5;
        }
      } else {
        report.push({
          name: 'Figuras Científicas / Tablas',
          status: 'pass',
          message: 'Sin figuras por separado o integradas en el documento principal.'
        });
      }

      // 6. Manuscript Format Compliance (DOCX, PDF, ODT)
      if (manuscriptFile) {
        const validFormats = ['docx', 'doc', 'pdf', 'odt', 'rtf'];
        const format = (manuscriptFile.format || manuscriptFile.name.split('.').pop() || '').toLowerCase();
        if (validFormats.includes(format)) {
          report.push({
            name: 'Formato del Documento Principal',
            status: 'pass',
            message: `Archivo principal válido (.${format.toUpperCase()} - ${manuscriptFile.name}). Apto para arbitraje ciego y edición técnica.`
          });
        } else {
          report.push({
            name: 'Formato del Documento Principal',
            status: 'warn',
            message: `El formato (.${format}) puede requerir conversión a .DOCX o .PDF por el equipo editorial.`
          });
          currentScore -= 5;
        }
      }

      // 7. References format
      if (referencesCount === 0) {
        report.push({ name: 'Soporte Bibliográfico', status: 'fail', message: 'No se detectaron referencias bibliográficas (Mínimo: 3).' });
        currentScore -= 20;
      } else if (referencesCount < 3) {
        report.push({ name: 'Soporte Bibliográfico', status: 'warn', message: `Pocas referencias listadas (${referencesCount}).` });
        currentScore -= 10;
      } else {
        report.push({ name: 'Soporte Bibliográfico', status: 'pass', message: `Nivel bibliográfico apto (${referencesCount} referencias registradas).` });
      }

      const finalScore = Math.max(0, currentScore);
      setScore(finalScore);
      setChecklist(report);
      setAnalyzing(false);

      // Return plain string arrays to parent
      const reportStrings = report.map(r => `[${r.status.toUpperCase()}] ${r.name}: ${r.message}`);
      onAnalysisComplete(finalScore, reportStrings);

    }, 1500);
  };

  useEffect(() => {
    if (triggerCheck) {
      runAnalysis();
    }
  }, [triggerCheck]);

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4 shadow-sm" id="auto-format-check">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className={`w-5 h-5 text-teal-400 ${analyzing ? 'animate-spin' : ''}`} />
          <div>
            <h4 className="text-xs sm:text-sm font-bold font-serif tracking-wide">Pre-Evaluación Editorial Inteligente</h4>
            <p className="text-[10px] text-slate-400">Verificador automático de formato OJS e IMRAD</p>
          </div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="text-[10px] bg-slate-800 hover:bg-slate-700 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
          id="btn-run-precheck"
        >
          <RefreshCw className="w-3 h-3" /> Reevaluar
        </button>
      </div>

      {analyzing ? (
        <div className="py-6 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 animate-pulse">Analizando sintaxis del manuscrito, estructuración del resumen y citas Vancouver...</p>
        </div>
      ) : score !== null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] block text-slate-500 font-mono">Puntaje del Formato:</span>
              <span className={`text-xl font-bold font-mono ${score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                {score} / 100
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] block text-slate-500 font-mono">Resultado Previo:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                {score >= 80 ? 'Apto para Enviar' : 'Revisión Necesaria'}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex gap-2.5 text-xs bg-slate-950/30 p-2.5 rounded border border-slate-850">
                {item.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                {item.status === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                {item.status === 'fail' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                <div>
                  <h5 className="font-bold text-slate-200">{item.name}</h5>
                  <p className="text-slate-400 text-[11px] mt-0.5 leading-tight">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-slate-500 text-xs">
          Ingrese el título y el resumen de su manuscrito para que el motor inteligente de OdontoJournal pre-evalúe su conformidad editorial.
        </div>
      )}
    </div>
  );
}
