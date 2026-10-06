import React, { useState, useRef } from 'react';
import { PenTool, FileText, ArrowRight, ArrowLeft, CheckCircle2, UserPlus, Trash2, ShieldAlert, FileCode2, Clock, CheckCircle, XCircle, AlertCircle, Eye, RefreshCw, Layers, Sparkles, Bot, CheckSquare, ShieldCheck, UploadCloud, Image, FileUp, Download, Check, Plus, AlertTriangle, Paperclip, FileCheck, FileSpreadsheet, ExternalLink, ArrowUp, ArrowDown, Edit3, Mail, UserCheck, Award, MoveUp, MoveDown } from 'lucide-react';
import { Article, ArticleStatus, AIDeclaration, ArticleFile, AuthorContributor, AuthorRoleType } from '../types';
import { DENTAL_CATEGORIES, AI_USAGE_SECTIONS_LIST } from '../data';
import AutoFormatCheck from './AutoFormatCheck';
import { submitManuscript } from '../services/articlesService';

export const ROLE_CONFIG: Record<AuthorRoleType, { label: string; shortLabel: string; badgeBg: string; textCol: string; borderCol: string; desc: string }> = {
  primary: {
    label: "Primer Autor / Principal",
    shortLabel: "1° Autor",
    badgeBg: "bg-emerald-50",
    textCol: "text-emerald-800",
    borderCol: "border-emerald-300",
    desc: "Líder de la investigación, concepción y redacción principal"
  },
  corresponding: {
    label: "Autor de Correspondencia",
    shortLabel: "Correspondencia",
    badgeBg: "bg-brand-50",
    textCol: "text-brand-800",
    borderCol: "border-brand-300",
    desc: "Responsable del contacto editorial y envío en OJS"
  },
  coauthor: {
    label: "Coautor / Investigador",
    shortLabel: "Coautor",
    badgeBg: "bg-slate-100",
    textCol: "text-slate-800",
    borderCol: "border-slate-300",
    desc: "Contribución sustancial en análisis y redacción"
  },
  senior: {
    label: "Autor Senior / Tutor",
    shortLabel: "Senior / Director",
    badgeBg: "bg-purple-50",
    textCol: "text-purple-800",
    borderCol: "border-purple-300",
    desc: "Director de grupo de investigación o tutor principal"
  },
  methodologist: {
    label: "Metodólogo / Bioestadístico",
    shortLabel: "Metodología",
    badgeBg: "bg-indigo-50",
    textCol: "text-indigo-800",
    borderCol: "border-indigo-300",
    desc: "Diseño metodológico y análisis bioestadístico"
  },
  collaborator: {
    label: "Colaborador Clínico",
    shortLabel: "Colaborador",
    badgeBg: "bg-amber-50",
    textCol: "text-amber-800",
    borderCol: "border-amber-300",
    desc: "Recolección de datos clínicos o muestras de laboratorio"
  }
};

interface AuthorDashboardProps {
  articles: Article[];
  onAddArticle: (article: Article) => void;
  onUpdateArticle: (article: Article) => void;
}

export default function AuthorDashboard({ articles, onAddArticle, onUpdateArticle }: AuthorDashboardProps) {
  // We assume the logged-in author is Dr. Gonzalo Martínez-Rojas
  const authorName = "Dr. Gonzalo Martínez-Rojas";
  const authorEmail = "gmartinez@clinicadental.cl";

  const authorArticles = articles.filter(art => 
    art.authors.some(auth => auth.includes("Gonzalo Martínez-Rojas")) || 
    art.authorEmails.includes(authorEmail)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Form states - Step 1: Policies & Ethics
  const [reqAccepted, setReqAccepted] = useState(false);
  const [ethicsAccepted, setEthicsAccepted] = useState(false);
  const [authorshipAgreed, setAuthorshipAgreed] = useState(false);
  const [conflictAgreed, setConflictAgreed] = useState(false);

  // AI Declaration states
  const [aiUsed, setAiUsed] = useState<boolean>(false);
  const [aiSections, setAiSections] = useState<string[]>([]);
  const [aiDetails, setAiDetails] = useState('');
  const [aiHumanConfirmed, setAiHumanConfirmed] = useState(false);

  // Step 2 & 3 states
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [category, setCategory] = useState(DENTAL_CATEGORIES[0]);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [wordCount, setWordCount] = useState(2500);
  const [realManuscriptFile, setRealManuscriptFile] = useState<File | null>(null);
  const [submitProgress, setSubmitProgress] = useState<string>('');

  // Multi-File states (Manuscript, High-Res Figures, Supplementary)
  const [manuscriptFile, setManuscriptFile] = useState<{
    name: string;
    size: string;
    format: string;
  }>({
    name: 'Manuscrito_Ciego_Scientia_Dentis.docx',
    size: '1.4 MB',
    format: 'docx'
  });

  const [figures, setFigures] = useState<ArticleFile[]>([
    {
      id: 'fig_init_1',
      name: 'Figura_1_Radiografia_Periapical_Oseointegracion_300dpi.tiff',
      type: 'figure',
      format: 'tiff',
      size: '14.8 MB',
      dpi: 300,
      figureNumber: 'Figura 1',
      caption: 'Serie radiográfica periapical con posicionador Rinn estandarizado a 70 kVp, 8 mA, mostrando estabilidad de la cresta ósea marginal a los 36 meses.',
      uploadedAt: new Date().toISOString().split('T')[0]
    },
    {
      id: 'fig_init_2',
      name: 'Figura_2_Grafico_Vectorial_Perdida_Osea_600dpi.eps',
      type: 'figure',
      format: 'eps',
      size: '4.2 MB',
      dpi: 600,
      figureNumber: 'Figura 2',
      caption: 'Diagrama vectorial de dispersión y curvas de supervivencia Kaplan-Meier comparando grupos control y experimental (p < 0.001).',
      uploadedAt: new Date().toISOString().split('T')[0]
    }
  ]);

  const [supplementaryFiles, setSupplementaryFiles] = useState<ArticleFile[]>([
    {
      id: 'sup_init_1',
      name: 'Certificado_Comite_Etica_Institucional_Aprobado.pdf',
      type: 'ethics',
      format: 'pdf',
      size: '850 KB',
      caption: 'Dictamen oficial favorable y acta de aprobación del Comité Ético Científico Universitario.',
      uploadedAt: new Date().toISOString().split('T')[0]
    }
  ]);

  // Temporary figure form states
  const [tempFigNumber, setTempFigNumber] = useState('Figura 3');
  const [tempFigCaption, setTempFigCaption] = useState('');
  const [tempFigDpi, setTempFigDpi] = useState<number>(300);
  const [tempFigFormat, setTempFigFormat] = useState('tiff');

  const fileInputManuscriptRef = useRef<HTMLInputElement>(null);
  const fileInputFiguresRef = useRef<HTMLInputElement>(null);
  const fileInputSuppRef = useRef<HTMLInputElement>(null);

  const [references, setReferences] = useState<string[]>([
    "Buser D, et al. Supervivencia de implantes periodontales. J Periodontol. 2018.",
    "Langeland K. Criterios de éxito en Endodoncia. Int Endod J. 2016."
  ]);
  const [newReferenceText, setNewReferenceText] = useState('');

  // Authors & Contributors roster state (with dynamic ordering and role management)
  const [authorsList, setAuthorsList] = useState<AuthorContributor[]>([
    {
      id: 'auth_primary_user',
      name: "Dr. Gonzalo Martínez-Rojas",
      email: "gmartinez@clinicadental.cl",
      affiliation: "Servicio de Odontología, Hospital Clínico Regional",
      role: 'primary',
      isCorresponding: true,
      orcid: '0000-0002-8419-2041'
    }
  ]);

  // Form states for adding a new co-author / contributor
  const [coAuthorName, setCoAuthorName] = useState('');
  const [coAuthorEmail, setCoAuthorEmail] = useState('');
  const [coAuthorAffiliation, setCoAuthorAffiliation] = useState('');
  const [coAuthorRole, setCoAuthorRole] = useState<AuthorRoleType>('coauthor');
  const [coAuthorIsCorresponding, setCoAuthorIsCorresponding] = useState(false);
  const [coAuthorOrcid, setCoAuthorOrcid] = useState('');

  // Editing state for an existing author
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAffiliation, setEditAffiliation] = useState('');
  const [editRole, setEditRole] = useState<AuthorRoleType>('coauthor');
  const [editIsCorresponding, setEditIsCorresponding] = useState(false);
  const [editOrcid, setEditOrcid] = useState('');

  // AutoFormat stats
  const [formattingScore, setFormattingScore] = useState(0);
  const [formattingReport, setFormattingReport] = useState<string[]>([]);
  const [triggerCheck, setTriggerCheck] = useState(false);

  // Status mapping
  const statusDetails: Record<ArticleStatus, { label: string; color: string; bg: string; icon: any }> = {
    submitted: { label: "Recibido - Esperando Editor", color: "text-blue-700 border-blue-200", bg: "bg-blue-50", icon: Clock },
    under_review: { label: "En Revisión por Pares", color: "text-indigo-700 border-indigo-200", bg: "bg-indigo-50", icon: Layers },
    revisions_required: { label: "Revisiones Requeridas", color: "text-amber-700 border-amber-200", bg: "bg-amber-50", icon: AlertCircle },
    accepted: { label: "Aceptado para Publicación", color: "text-emerald-700 border-emerald-200", bg: "bg-emerald-50", icon: CheckCircle },
    rejected: { label: "Rechazado", color: "text-rose-700 border-rose-200", bg: "bg-rose-50", icon: XCircle },
    published: { label: "Publicado", color: "text-teal-700 border-teal-200", bg: "bg-teal-50", icon: CheckCircle2 }
  };

  // Handlers for real file uploads
  const handleManuscriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRealManuscriptFile(file);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'docx';
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setManuscriptFile({
      name: file.name,
      size: sizeMb,
      format: ext
    });
  };

  const handleFiguresUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFigList: ArticleFile[] = [];
    const nextIndex = figures.length + 1;

    Array.from(files).forEach((file: File, i: number) => {
      const ext = (file.name.split('.').pop()?.toLowerCase() || 'tiff') as any;
      const sizeStr = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' 
        : Math.round(file.size / 1024) + ' KB';
      
      newFigList.push({
        id: 'fig_' + Date.now() + '_' + i,
        name: file.name,
        type: 'figure',
        format: ext,
        size: sizeStr,
        dpi: 300,
        figureNumber: `Figura ${nextIndex + i}`,
        caption: `Figura clínica ${nextIndex + i}: Archivo en alta resolución (${ext.toUpperCase()} a 300 DPI).`,
        uploadedAt: new Date().toISOString().split('T')[0]
      });
    });

    setFigures([...figures, ...newFigList]);
    if (fileInputFiguresRef.current) fileInputFiguresRef.current.value = '';
  };

  const handleSupplementaryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newSuppList: ArticleFile[] = [];
    Array.from(files).forEach((file: File, i: number) => {
      const ext = (file.name.split('.').pop()?.toLowerCase() || 'pdf') as any;
      const sizeStr = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' 
        : Math.round(file.size / 1024) + ' KB';
      
      newSuppList.push({
        id: 'sup_' + Date.now() + '_' + i,
        name: file.name,
        type: 'supplementary',
        format: ext,
        size: sizeStr,
        caption: `Documento complementario anexo (${file.name}).`,
        uploadedAt: new Date().toISOString().split('T')[0]
      });
    });

    setSupplementaryFiles([...supplementaryFiles, ...newSuppList]);
    if (fileInputSuppRef.current) fileInputSuppRef.current.value = '';
  };

  const handleAddPresetFigure = (format: 'tiff' | 'eps' | 'jpg' | 'pdf', dpi: number, name: string, caption: string, size: string) => {
    const nextFigNum = `Figura ${figures.length + 1}`;
    const newFig: ArticleFile = {
      id: 'fig_preset_' + Date.now(),
      name,
      type: 'figure',
      format,
      dpi,
      figureNumber: nextFigNum,
      caption,
      size,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setFigures([...figures, newFig]);
  };

  const handleRemoveFigure = (id: string) => {
    setFigures(figures.filter(f => f.id !== id));
  };

  const handleRemoveSupplementary = (id: string) => {
    setSupplementaryFiles(supplementaryFiles.filter(s => s.id !== id));
  };

  const handleToggleAiSection = (section: string) => {
    if (aiSections.includes(section)) {
      setAiSections(aiSections.filter(s => s !== section));
    } else {
      setAiSections([...aiSections, section]);
    }
  };

  // Dynamic Authors & Roles handlers
  const moveAuthor = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newList = [...authorsList];
      const temp = newList[index];
      newList[index] = newList[index - 1];
      newList[index - 1] = temp;
      setAuthorsList(newList);
    } else if (direction === 'down' && index < authorsList.length - 1) {
      const newList = [...authorsList];
      const temp = newList[index];
      newList[index] = newList[index + 1];
      newList[index + 1] = temp;
      setAuthorsList(newList);
    }
  };

  const handleSetAuthorRole = (id: string, newRole: AuthorRoleType) => {
    setAuthorsList(authorsList.map(a => a.id === id ? { ...a, role: newRole } : a));
  };

  const handleToggleCorresponding = (id: string) => {
    setAuthorsList(authorsList.map(a => a.id === id ? { ...a, isCorresponding: !a.isCorresponding } : a));
  };

  const handleAddAuthor = () => {
    if (coAuthorName.trim() && coAuthorEmail.trim() && coAuthorAffiliation.trim()) {
      const newAuth: AuthorContributor = {
        id: 'auth_' + Date.now(),
        name: coAuthorName.trim(),
        email: coAuthorEmail.trim(),
        affiliation: coAuthorAffiliation.trim(),
        role: coAuthorRole,
        isCorresponding: coAuthorIsCorresponding,
        orcid: coAuthorOrcid.trim() || undefined
      };
      setAuthorsList([...authorsList, newAuth]);
      setCoAuthorName('');
      setCoAuthorEmail('');
      setCoAuthorAffiliation('');
      setCoAuthorRole('coauthor');
      setCoAuthorIsCorresponding(false);
      setCoAuthorOrcid('');
    } else {
      alert('Por favor complete todos los datos requeridos: nombre, correo institucional y filiación.');
    }
  };

  const handleAddPresetAuthor = (name: string, email: string, affiliation: string, role: AuthorRoleType, isCorresponding: boolean, orcid?: string) => {
    const newAuth: AuthorContributor = {
      id: 'auth_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name,
      email,
      affiliation,
      role,
      isCorresponding,
      orcid
    };
    setAuthorsList([...authorsList, newAuth]);
  };

  const handleRemoveAuthor = (id: string) => {
    if (authorsList.length <= 1) {
      alert('El manuscrito debe contar con al menos un autor registrado en la nómina.');
      return;
    }
    setAuthorsList(authorsList.filter(a => a.id !== id));
  };

  const startEditAuthor = (author: AuthorContributor) => {
    setEditingAuthorId(author.id);
    setEditName(author.name);
    setEditEmail(author.email);
    setEditAffiliation(author.affiliation);
    setEditRole(author.role);
    setEditIsCorresponding(author.isCorresponding);
    setEditOrcid(author.orcid || '');
  };

  const cancelEditAuthor = () => {
    setEditingAuthorId(null);
  };

  const saveEditAuthor = () => {
    if (!editingAuthorId) return;
    if (!editName.trim() || !editEmail.trim() || !editAffiliation.trim()) {
      alert('Nombre, correo y filiación son obligatorios.');
      return;
    }
    setAuthorsList(authorsList.map(a => {
      if (a.id === editingAuthorId) {
        return {
          ...a,
          name: editName.trim(),
          email: editEmail.trim(),
          affiliation: editAffiliation.trim(),
          role: editRole,
          isCorresponding: editIsCorresponding,
          orcid: editOrcid.trim() || undefined
        };
      }
      return a;
    }));
    setEditingAuthorId(null);
  };

  const handleAddReference = () => {
    if (newReferenceText.trim()) {
      setReferences([...references, newReferenceText.trim()]);
      setNewReferenceText('');
    }
  };

  const handleRemoveReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const handleAnalysisComplete = (score: number, report: string[]) => {
    setFormattingScore(score);
    setFormattingReport(report);
  };

  const handleNextStep = () => {
    if (activeStep === 1) {
      if (!reqAccepted || !ethicsAccepted || !authorshipAgreed || !conflictAgreed) {
        alert('Debe leer y aceptar todas las directrices éticas, de originalidad, conformidad autoral y conflicto de intereses.');
        return;
      }

      if (aiUsed) {
        if (aiSections.length === 0) {
          alert('Ha indicado que utilizó IA. Por favor seleccione al menos un apartado o componente donde fue utilizada (ej. Aval ético, página de título, tablas/figuras, etc.).');
          return;
        }
        if (!aiDetails.trim()) {
          alert('Por favor describa brevemente las herramientas de IA empleadas y el alcance de su uso.');
          return;
        }
        if (!aiHumanConfirmed) {
          alert('Debe certificar el compromiso ético de supervisión humana y autoría sobre el material asistido por IA.');
          return;
        }
      }
    }

    if (activeStep === 2 && (!title.trim() || !abstract.trim())) {
      alert('Por favor complete el título y el resumen de su manuscrito.');
      return;
    }
    
    if (activeStep === 3) {
      if (authorsList.length === 0) {
        alert('Debe incluir al menos un autor en el manuscrito.');
        return;
      }
      // Trigger formatting precheck automatically for step 4
      setTriggerCheck(true);
    } else {
      setTriggerCheck(false);
    }

    setActiveStep(activeStep + 1);
  };

  const handlePrevStep = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitProgress('Subiendo manuscrito y registrando en la base de datos Supabase...');

    try {
      const keywords = keywordsInput.split(',').map(k => k.trim()).filter(Boolean);

      const res = await submitManuscript({
        title,
        abstract,
        authors: authorsList.map(a => a.name),
        authorEmails: authorsList.map(a => a.email),
        affiliations: authorsList.map(a => a.affiliation),
        contributors: authorsList,
        keywords: keywords.length > 0 ? keywords : ["Odontología", "Investigación", "Caso Clínico"],
        category,
        wordCount,
        pdfFile: realManuscriptFile,
        manuscriptFile,
        figures,
        supplementaryFiles,
        references,
        aiDeclaration: {
          used: aiUsed,
          sectionsUsed: aiUsed ? aiSections : [],
          toolsAndScope: aiUsed ? aiDetails : undefined,
          humanSupervisionConfirmed: true
        },
        hasStructuredAbstract: abstract.toUpperCase().includes('INTRODUCCIÓN') || abstract.toUpperCase().includes('INTRODUCCION'),
        formattingScore,
        formattingReport,
        onProgress: (msg) => setSubmitProgress(msg)
      });

      if (res.success && res.article) {
        onAddArticle(res.article);
        resetForm();
        alert('¡Excelente! Su manuscrito ha sido subido a Supabase Storage y registrado exitosamente en el sistema Scientia Dentis (COLP) con estado "Recibido - Esperando Editor".');
      } else {
        alert(res.error || 'Ocurrió un error al enviar el manuscrito a Supabase.');
      }
    } catch (err: any) {
      alert('Error en el envío: ' + err.message);
    } finally {
      setIsSubmitting(false);
      setSubmitProgress('');
    }
  };

  const resetForm = () => {
    setActiveStep(1);
    setTitle('');
    setAbstract('');
    setCategory(DENTAL_CATEGORIES[0]);
    setKeywordsInput('');
    setWordCount(2500);
    setManuscriptFile({
      name: 'Manuscrito_Ciego_Scientia_Dentis.docx',
      size: '1.4 MB',
      format: 'docx'
    });
    setFigures([
      {
        id: 'fig_init_1',
        name: 'Figura_1_Radiografia_Periapical_Oseointegracion_300dpi.tiff',
        type: 'figure',
        format: 'tiff',
        size: '14.8 MB',
        dpi: 300,
        figureNumber: 'Figura 1',
        caption: 'Serie radiográfica periapical con posicionador Rinn estandarizado mostrando estabilidad de la cresta ósea.',
        uploadedAt: new Date().toISOString().split('T')[0]
      }
    ]);
    setSupplementaryFiles([]);
    setReferences([
      "Buser D, et al. Supervivencia de implantes periodontales. J Periodontol. 2018.",
      "Langeland K. Criterios de éxito en Endodoncia. Int Endod J. 2016."
    ]);
    setAuthorsList([
      {
        id: 'auth_primary_user',
        name: "Dr. Gonzalo Martínez-Rojas",
        email: "gmartinez@clinicadental.cl",
        affiliation: "Servicio de Odontología, Hospital Clínico Regional",
        role: 'primary',
        isCorresponding: true,
        orcid: '0000-0002-8419-2041'
      }
    ]);
    setReqAccepted(false);
    setEthicsAccepted(false);
    setAuthorshipAgreed(false);
    setConflictAgreed(false);
    setAiUsed(false);
    setAiSections([]);
    setAiDetails('');
    setAiHumanConfirmed(false);
    setFormattingScore(0);
    setFormattingReport([]);
  };

  // Authors responses to revisions requested
  const handleAuthorRevisionSubmit = (art: Article) => {
    const updated: Article = {
      ...art,
      status: 'under_review',
      title: art.title.startsWith('[Corregido]') ? art.title : "[Corregido] " + art.title,
      editorNotes: 'Nueva versión con manuscrito y figuras corregidas enviada por el autor el ' + new Date().toISOString().split('T')[0] + '. Listo para reevaluación por pares.',
      formattingScore: Math.min(100, (art.formattingScore || 80) + 10)
    };
    onUpdateArticle(updated);
    alert('¡Manuscrito con enmiendas y figuras corregidas enviado al editor exitosamente!');
  };

  return (
    <div className="fade-in space-y-6" id="author-dashboard">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">Panel del Investigador</h2>
          <p className="text-xs text-slate-500">Gestione sus artículos de investigación y realice nuevos envíos automatizados.</p>
        </div>
        {!isSubmitting && (
          <button
            onClick={() => setIsSubmitting(true)}
            id="btn-new-submission"
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <PenTool className="w-4 h-4" /> Nuevo Envío Científico
          </button>
        )}
      </div>

      {isSubmitting ? (
        /* WIZARD SUBMISSION FORM */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs" id="submission-wizard">
          {/* Progress bar and Step names */}
          <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif font-bold text-base">Formulario de Envío Académico</h3>
              <button
                onClick={() => { if (confirm('¿Desea cancelar el envío actual? Se perderán los datos introducidos.')) { setIsSubmitting(false); resetForm(); } }}
                className="text-xs text-slate-400 hover:text-white cursor-pointer font-bold font-mono"
              >
                Cancelar x
              </button>
            </div>
            
            {/* Step badges */}
            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
              {[
                { step: 1, label: "1. Políticas" },
                { step: 2, label: "2. Metadatos" },
                { step: 3, label: "3. Autores" },
                { step: 4, label: "4. Pre-check" },
                { step: 5, label: "5. Confirmar" }
              ].map((s) => (
                <div
                  key={s.step}
                  className={`py-2 rounded-md border font-semibold ${
                    activeStep === s.step
                      ? 'bg-brand-600 border-brand-500 text-white shadow-xs'
                      : activeStep > s.step
                      ? 'bg-slate-800 border-slate-700 text-slate-400 line-through'
                      : 'bg-slate-950/40 border-slate-900/60 text-slate-500'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* STEP 1: POLICIES */}
            {activeStep === 1 && (
              <div className="space-y-6 fade-in">
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-slate-800 text-sm">Paso 1: Requisitos de Envío, Código Ético y Declaración de IA</h4>
                  <p className="text-xs text-slate-500">La publicación en Scientia Dentis (Órgano Oficial del Colegio de Odontólogos de La Paz) exige la adhesión estricta a directrices de investigación (ICMJE/COPE) y la declaración transparente de originalidad y uso de tecnologías asistidas por IA.</p>
                </div>

                {/* General Ethical & Legal Requirements */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
                  <h5 className="font-serif font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5 uppercase tracking-wider font-mono">
                    1. Requisitos Generales y Compromisos de Publicación
                  </h5>

                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      id="req-checkbox"
                      checked={reqAccepted}
                      onChange={(e) => setReqAccepted(e.target.checked)}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded shrink-0 mt-0.5"
                    />
                    <label htmlFor="req-checkbox" className="text-slate-700 leading-normal font-medium cursor-pointer">
                      <strong>Declaración de originalidad (Anti-Plagio):</strong> Certifico que este manuscrito es inédito y original, no ha sido publicado previamente en otra revista, ni se encuentra en proceso de evaluación por otra editorial científica.
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      id="ethics-checkbox"
                      checked={ethicsAccepted}
                      onChange={(e) => setEthicsAccepted(e.target.checked)}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded shrink-0 mt-0.5"
                    />
                    <label htmlFor="ethics-checkbox" className="text-slate-700 leading-normal font-medium cursor-pointer">
                      <strong>Aval ético y Consentimiento informado de pacientes:</strong> Confirmo que en caso de tratarse de investigaciones clínicas o con tejidos biológicos humanos, el protocolo cuenta con la aprobación del Comité de Ética en Investigación de la institución correspondiente y los participantes firmaron el consentimiento informado.
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      id="authorship-checkbox"
                      checked={authorshipAgreed}
                      onChange={(e) => setAuthorshipAgreed(e.target.checked)}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded shrink-0 mt-0.5"
                    />
                    <label htmlFor="authorship-checkbox" className="text-slate-700 leading-normal font-medium cursor-pointer">
                      <strong>Conformidad autoral y Cesión de derechos:</strong> Certifico la plena conformidad de todos los autores con la versión remitida, su contribución intelectual efectiva y la cesión de derechos no exclusivos para publicación en acceso abierto bajo licencia Creative Commons (CC BY-NC 4.0).
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      id="conflict-checkbox"
                      checked={conflictAgreed}
                      onChange={(e) => setConflictAgreed(e.target.checked)}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded shrink-0 mt-0.5"
                    />
                    <label htmlFor="conflict-checkbox" className="text-slate-700 leading-normal font-medium cursor-pointer">
                      <strong>Declaración de Conflicto de Intereses:</strong> Declaro de forma transparente que los autores no presentan intereses comerciales, patrocinios financieros o relaciones con fabricantes de biomateriales dentales que puedan sesgar los resultados, o bien que han sido expresamente detallados en la portada.
                    </label>
                  </div>
                </div>

                {/* AI Usage Declaration Section (COPE / ICMJE guidelines) */}
                <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4 text-xs shadow-md border border-slate-800" id="ai-declaration-section">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-brand-600/30 border border-brand-500/40 rounded-lg text-brand-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                          Declaración de Uso de Inteligencia Artificial (IA Generativa)
                        </h5>
                        <p className="text-[11px] text-slate-400">Directrices éticas de transparencia en publicaciones científicas odontológicas (COPE / ICMJE / WAME).</p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-brand-950 border border-brand-800 text-brand-300 font-mono text-[9px] font-bold uppercase">
                      Obligatorio OJS
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-slate-300 font-medium">
                      ¿Se utilizaron herramientas de Inteligencia Artificial (IA Generativa, Modelos de Lenguaje como ChatGPT/Claude/Gemini o software asistivo) en la preparación del manuscrito, sus datos o sus documentos anexos?
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <label 
                        onClick={() => { setAiUsed(false); setAiSections([]); setAiDetails(''); }}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          !aiUsed 
                            ? 'bg-brand-950/60 border-brand-500 text-white shadow-xs' 
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="ai-usage-radio"
                          checked={!aiUsed}
                          onChange={() => { setAiUsed(false); setAiSections([]); setAiDetails(''); }}
                          className="w-4 h-4 text-brand-500 focus:ring-brand-400 border-slate-700 bg-slate-900"
                        />
                        <div>
                          <strong className="text-white block font-semibold">No se utilizó IA</strong>
                          <span className="text-[11px] text-slate-400">El manuscrito y anexos fueron redactados e integrados 100% de forma convencional por los autores.</span>
                        </div>
                      </label>

                      <label 
                        onClick={() => setAiUsed(true)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          aiUsed 
                            ? 'bg-brand-950/60 border-brand-500 text-white shadow-xs' 
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="ai-usage-radio"
                          checked={aiUsed}
                          onChange={() => setAiUsed(true)}
                          className="w-4 h-4 text-brand-500 focus:ring-brand-400 border-slate-700 bg-slate-900"
                        />
                        <div>
                          <strong className="text-white block font-semibold">Sí, se utilizó IA / LLMs</strong>
                          <span className="text-[11px] text-slate-400">Se emplearon herramientas de IA generativa en uno o más apartados de la investigación.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Expanded fields when AI was used */}
                  {aiUsed && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 fade-in">
                      <div className="space-y-2">
                        <label className="font-bold text-brand-300 font-mono uppercase tracking-wide text-[10px] block">
                          ¿En qué apartados y componentes se usó la IA? (Seleccione todos los que apliquen):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {AI_USAGE_SECTIONS_LIST.map((sec) => {
                            const isSelected = aiSections.includes(sec);
                            return (
                              <button
                                type="button"
                                key={sec}
                                onClick={() => handleToggleAiSection(sec)}
                                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-brand-600/40 border-brand-400 text-white font-semibold'
                                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] border ${
                                  isSelected ? 'bg-brand-500 border-brand-400 text-white' : 'border-slate-600'
                                }`}>
                                  {isSelected && '✓'}
                                </span>
                                <span className="text-[11px] leading-tight">{sec}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-brand-300 font-mono uppercase tracking-wide text-[10px] block">
                          Herramientas empleadas, versión y alcance del uso:
                        </label>
                        <textarea
                          rows={3}
                          value={aiDetails}
                          onChange={(e) => setAiDetails(e.target.value)}
                          placeholder="Ejemplo: Se utilizó Claude 3.5 Sonnet para la revisión gramatical del abstract en inglés y ChatGPT-4o para el formateo de tablas comparativas y la estructura de la carta de cesión de derechos. Los autores validaron los datos clínicos contra las historias médicas originales."
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs leading-relaxed"
                        />
                      </div>

                      <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="ai-human-confirm"
                          checked={aiHumanConfirmed}
                          onChange={(e) => setAiHumanConfirmed(e.target.checked)}
                          className="w-4 h-4 text-brand-500 focus:ring-brand-400 border-slate-700 bg-slate-900 rounded shrink-0 mt-0.5 cursor-pointer"
                        />
                        <label htmlFor="ai-human-confirm" className="text-slate-300 text-[11px] leading-normal cursor-pointer font-medium">
                          <strong>Compromiso Ético y Responsabilidad Humana (No Coautoría de IA):</strong> Certifico que los autores humanos asumen plena responsabilidad por la integridad y exactitud del material. Ninguna herramienta de IA figura ni figurará como coautor del manuscrito.
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex gap-2.5 text-xs text-amber-900">
                  <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Aviso OJS de Conflicto de Intereses y Bioética Odontológica</h5>
                    <p className="text-amber-700 mt-0.5">Cualquier relación de patrocinio con laboratorios o fabricantes de implantes dentales, resinas, o cementos biocerámicos evaluados en este estudio deberá ser expresamente detallada en el cuerpo del artículo y en la página de título.</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: METADATA & IMRAD ABSTRACT & MULTI-FILE UPLOADER */}
            {activeStep === 2 && (
              <div className="space-y-6 fade-in">
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-slate-800 text-sm">Paso 2: Metadatos, IMRAD y Carga Integral de Archivos</h4>
                  <p className="text-xs text-slate-500">Ingrese los metadatos de su manuscrito y adjunte por separado el texto editable, figuras en alta resolución (≥300 DPI) y anexos éticos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 font-mono uppercase tracking-wide text-[10px]">Título del Manuscrito:</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Análisis volumétrico del conducto radicular obturado con biocerámicos..."
                      className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 font-mono uppercase tracking-wide text-[10px]">Área de la Odontología:</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-brand-500 text-slate-800"
                    >
                      {DENTAL_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700 font-mono uppercase tracking-wide text-[10px]">Resumen Estructurado (Estilo IMRAD):</label>
                    <span className="text-[10px] text-slate-400 font-mono">Sugerencia: Divida en INTRODUCCIÓN, MÉTODOS, RESULTADOS, CONCLUSIONES</span>
                  </div>
                  <textarea
                    rows={5}
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="INTRODUCCIÓN: El objetivo de este estudio clínico...&#10;&#10;MÉTODOS: Se reclutaron 30 pacientes...&#10;&#10;RESULTADOS: La pérdida ósea promedio fue de...&#10;&#10;CONCLUSIONES: La formulación clínica probada..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-sans text-xs focus:outline-none focus:border-brand-500 text-slate-800 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 font-mono uppercase tracking-wide text-[10px]">Palabras clave (Separadas por comas):</label>
                    <input
                      type="text"
                      value={keywordsInput}
                      onChange={(e) => setKeywordsInput(e.target.value)}
                      placeholder="Implantes dentales, Oseointegración, Vancouver"
                      className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 font-mono uppercase tracking-wide text-[10px]">Conteo de Palabras Estimado:</label>
                    <input
                      type="number"
                      value={wordCount}
                      onChange={(e) => setWordCount(Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                {/* ADVANCED MULTI-FILE UPLOAD CENTER */}
                <div className="bg-slate-900 text-white rounded-xl p-5 shadow-3xs space-y-5 border border-slate-800">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-brand-400" />
                      <h5 className="font-serif font-bold text-sm text-white">Centro de Carga de Archivos Científicos (Estándar OJS)</h5>
                    </div>
                    <span className="text-[10px] font-mono text-brand-300 bg-brand-950 px-2.5 py-0.5 rounded border border-brand-800">
                      DOCX • PDF • TIFF • EPS • JPG • XLS (≥300 DPI)
                    </span>
                  </div>

                  {/* Section A: Main Manuscript File */}
                  <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center">
                      <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-brand-400" />
                        1. Archivo Principal del Manuscrito (Editable / Ciego):
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">Formatos: .DOCX, .PDF, .ODT, .RTF</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1 bg-slate-900 border border-slate-700 p-2.5 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            manuscriptFile.format.toLowerCase().includes('docx') 
                              ? 'bg-blue-900 text-blue-200 border border-blue-700' 
                              : 'bg-rose-900 text-rose-200 border border-rose-700'
                          }`}>
                            {manuscriptFile.format.toUpperCase()}
                          </span>
                          <span className="text-xs font-mono text-slate-200 truncate">{manuscriptFile.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono ml-2 shrink-0">{manuscriptFile.size}</span>
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputManuscriptRef} 
                        onChange={handleManuscriptUpload} 
                        accept=".docx,.doc,.pdf,.odt,.rtf" 
                        className="hidden" 
                      />

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputManuscriptRef.current?.click()}
                          className="px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap transition-colors"
                        >
                          <FileUp className="w-3.5 h-3.5" /> Seleccionar Archivo
                        </button>
                        <button
                          type="button"
                          onClick={() => setManuscriptFile({ name: 'Manuscrito_Anonimizado_Scientia_Dentis.docx', size: '1.4 MB', format: 'docx' })}
                          className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-mono cursor-pointer border border-slate-700"
                          title="Cargar muestra DOCX editable"
                        >
                          DOCX
                        </button>
                        <button
                          type="button"
                          onClick={() => setManuscriptFile({ name: 'Manuscrito_Maquetado_Scientia_Dentis.pdf', size: '2.8 MB', format: 'pdf' })}
                          className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-mono cursor-pointer border border-slate-700"
                          title="Cargar muestra PDF maquetado"
                        >
                          PDF
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Separate High-Resolution Figures (>= 300 DPI) */}
                  <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Image className="w-3.5 h-3.5 text-brand-400" />
                          2. Figuras Científicas en Alta Resolución (Separadas del Texto):
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Requeridas por separado en .TIFF, .EPS, .JPG o .PDF con resolución mínima de <strong>300 ppp/dpi</strong> (o 600 ppp para gráficos lineales).
                        </p>
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputFiguresRef} 
                        onChange={handleFiguresUpload} 
                        accept=".tiff,.tif,.eps,.jpg,.jpeg,.png,.pdf" 
                        multiple 
                        className="hidden" 
                      />

                      <button
                        type="button"
                        onClick={() => fileInputFiguresRef.current?.click()}
                        className="px-3 py-1.5 bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" /> Subir Figuras Locales
                      </button>
                    </div>

                    {/* Quick Preset Buttons for Scientific Figures */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Añadir Muestra:</span>
                      <button
                        type="button"
                        onClick={() => handleAddPresetFigure(
                          'tiff',
                          300,
                          `Figura_${figures.length + 1}_Radiografia_Panoramica_300dpi.tiff`,
                          'Ortopantomografía estandarizada de control postoperatorio a 24 meses.',
                          '16.4 MB'
                        )}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-brand-300 rounded text-[11px] font-mono border border-slate-700 cursor-pointer"
                      >
                        + Radiografía (.TIFF 300 DPI)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPresetFigure(
                          'eps',
                          600,
                          `Figura_${figures.length + 1}_Diagrama_Vectorial_Sobrevida_600dpi.eps`,
                          'Curvas de sobrevida actuarial y regresión Cox multivariada.',
                          '5.1 MB'
                        )}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-brand-300 rounded text-[11px] font-mono border border-slate-700 cursor-pointer"
                      >
                        + Gráfico Vectorial (.EPS 600 DPI)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPresetFigure(
                          'jpg',
                          300,
                          `Figura_${figures.length + 1}_Fotografia_Clinica_Intraoral_300dpi.jpg`,
                          'Fotografía clínica macro intraoral con flash anular y polarizador cruzado.',
                          '7.8 MB'
                        )}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-brand-300 rounded text-[11px] font-mono border border-slate-700 cursor-pointer"
                      >
                        + Foto Clínica (.JPG 300 DPI)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddPresetFigure(
                          'pdf',
                          300,
                          `Figura_${figures.length + 1}_Corte_Tomografico_CBCT_300dpi.pdf`,
                          'Reconstrucción multiplanar CBCT en ventana ósea a 90 kVp.',
                          '4.2 MB'
                        )}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-brand-300 rounded text-[11px] font-mono border border-slate-700 cursor-pointer"
                      >
                        + Tomografía (.PDF 300 DPI)
                      </button>
                    </div>

                    {/* Render uploaded figures list */}
                    <div className="space-y-2 pt-2">
                      {figures.length === 0 ? (
                        <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center text-slate-400 text-xs">
                          No se han cargado figuras individuales en alta resolución todavía. Se recomienda al menos una figura clínica o diagrama estadístico.
                        </div>
                      ) : (
                        figures.map((fig) => (
                          <div key={fig.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-brand-950 border border-brand-700 text-brand-300 text-[10px] font-mono font-bold">
                                  {fig.figureNumber || 'Figura'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  fig.format === 'tiff' ? 'bg-amber-900 text-amber-200 border border-amber-700' :
                                  fig.format === 'eps' ? 'bg-indigo-900 text-indigo-200 border border-indigo-700' :
                                  fig.format === 'jpg' || fig.format === 'jpeg' ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' :
                                  'bg-slate-800 text-slate-200 border border-slate-700'
                                }`}>
                                  {fig.format.toUpperCase()}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5" /> {fig.dpi || 300} DPI
                                </span>
                                <span className="text-xs font-mono text-slate-300 font-medium truncate max-w-[200px] sm:max-w-xs">{fig.name}</span>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-auto">
                                <span className="text-[11px] text-slate-400 font-mono">{fig.size}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFigure(fig.id)}
                                  className="text-rose-400 hover:text-rose-300 text-xs cursor-pointer p-1"
                                  title="Eliminar figura"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Caption editor */}
                            <div className="pt-1">
                              <input
                                type="text"
                                value={fig.caption || ''}
                                onChange={(e) => {
                                  const updated = figures.map(f => f.id === fig.id ? { ...f, caption: e.target.value } : f);
                                  setFigures(updated);
                                }}
                                placeholder="Pie de figura / Descripción metodológica..."
                                className="w-full text-[11px] bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Section C: Supplementary Files & Ethics */}
                  <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-brand-400" />
                          3. Documentos Complementarios y Anexos Éticos:
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Dictamen de comité ético, consentimientos informados, cesión de derechos o matrices de datos crudos (.PDF, .XLSX, .CSV).
                        </p>
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputSuppRef} 
                        onChange={handleSupplementaryUpload} 
                        accept=".pdf,.docx,.xlsx,.csv" 
                        multiple 
                        className="hidden" 
                      />

                      <button
                        type="button"
                        onClick={() => fileInputSuppRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer border border-slate-700 whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adjuntar Anexo
                      </button>
                    </div>

                    {/* Quick buttons for supplementary items */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const newSup: ArticleFile = {
                            id: 'sup_' + Date.now(),
                            name: 'Aval_Etico_Comite_Bioetica_Certificado.pdf',
                            type: 'ethics',
                            format: 'pdf',
                            size: '1.1 MB',
                            caption: 'Certificado de aprobación formal del Comité Ético Científico Universitario.',
                            uploadedAt: new Date().toISOString().split('T')[0]
                          };
                          setSupplementaryFiles([...supplementaryFiles, newSup]);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono border border-slate-700 cursor-pointer"
                      >
                        + Aval de Comité de Ética (.PDF)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newSup: ArticleFile = {
                            id: 'sup_' + Date.now(),
                            name: 'Matriz_Datos_Clinicos_Crudos.xlsx',
                            type: 'dataset',
                            format: 'xlsx',
                            size: '340 KB',
                            caption: 'Base de datos desidentificada con mediciones volumétricas y densitometría.',
                            uploadedAt: new Date().toISOString().split('T')[0]
                          };
                          setSupplementaryFiles([...supplementaryFiles, newSup]);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono border border-slate-700 cursor-pointer"
                      >
                        + Matriz de Datos Crudos (.XLSX)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newSup: ArticleFile = {
                            id: 'sup_' + Date.now(),
                            name: 'Carta_Cesion_Derechos_Firmada.pdf',
                            type: 'supplementary',
                            format: 'pdf',
                            size: '620 KB',
                            caption: 'Declaración de conformidad autoral y cesión de derechos con firmas autógrafas.',
                            uploadedAt: new Date().toISOString().split('T')[0]
                          };
                          setSupplementaryFiles([...supplementaryFiles, newSup]);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono border border-slate-700 cursor-pointer"
                      >
                        + Cesión de Derechos (.PDF)
                      </button>
                    </div>

                    {/* Render supplementary files list */}
                    {supplementaryFiles.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {supplementaryFiles.map((sup) => (
                          <div key={sup.id} className="bg-slate-900 border border-slate-800 rounded p-2 flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2 truncate">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono uppercase font-bold border border-slate-700">
                                {sup.format.toUpperCase()}
                              </span>
                              <span className="font-mono text-slate-300 text-[11px] truncate">{sup.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">({sup.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSupplementary(sup.id)}
                              className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* References builder */}
                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <label className="font-bold text-slate-700 font-mono uppercase tracking-wide text-[10px]">Referencias Bibliográficas (Vancouver):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newReferenceText}
                      onChange={(e) => setNewReferenceText(e.target.value)}
                      placeholder="Autor AA, et al. Título del artículo. Nombre de la revista. Año;vol(num):pág-pág."
                      className="flex-1 p-2 border border-slate-300 rounded-lg text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddReference}
                      className="px-3 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 cursor-pointer"
                    >
                      Añadir Ref
                    </button>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 max-h-32 overflow-y-auto space-y-1">
                    {references.length === 0 ? (
                      <p className="text-slate-400 text-xs text-center py-2">No hay referencias agregadas aún.</p>
                    ) : (
                      references.map((ref, i) => (
                        <div key={i} className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 gap-2">
                          <span className="text-[11px] text-slate-600 line-clamp-1">{i + 1}. {ref}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveReference(i)}
                            className="text-rose-500 hover:text-rose-700 text-[10px] font-mono cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: AUTHORS ROSTER, REORDERING & ROLE MANAGEMENT */}
            {activeStep === 3 && (
              <div className="space-y-5 fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200">
                  <div className="space-y-0.5">
                    <h4 className="font-serif font-bold text-slate-800 text-base flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-brand-600" />
                      Paso 3: Nómina, Orden y Roles de los Autores
                    </h4>
                    <p className="text-xs text-slate-500">
                      Configure el orden exacto de citación académica (Vancouver), asigne roles de contribución y designe el autor de correspondencia.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 font-mono text-[11px] font-bold">
                    {authorsList.length} {authorsList.length === 1 ? 'Autor Registrado' : 'Autores Registrados'}
                  </span>
                </div>

                {/* Information Banner */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 leading-relaxed">
                    <span className="font-bold">Directriz Editorial OJS / ICMJE sobre Autoría y Orden:</span>
                    <p className="text-[11px] text-amber-800">
                      El <strong>primer autor</strong> encabezará la cita bibliográfica oficial (ej. <em>{authorsList[0]?.name || 'Primer Autor'} et al.</em>). Utilice las flechas <strong>Subir ⬆️ / Bajar ⬇️</strong> para establecer la jerarquía y seleccione el rol de cada investigador (Coautor, Autor Senior, Metodólogo, etc.).
                    </p>
                  </div>
                </div>

                {/* Form to Add New Author */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 font-mono text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-brand-600" /> Agregar Investigador / Coautor a la Nómina:
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 font-mono text-[10px]">Nombre Completo y Grado:</label>
                      <input
                        type="text"
                        value={coAuthorName}
                        onChange={(e) => setCoAuthorName(e.target.value)}
                        placeholder="Ej. Dra. Valentina Soto"
                        className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 bg-white text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 font-mono text-[10px]">Correo Electrónico:</label>
                      <input
                        type="email"
                        value={coAuthorEmail}
                        onChange={(e) => setCoAuthorEmail(e.target.value)}
                        placeholder="vsoto@odontologia.edu"
                        className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 bg-white text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 font-mono text-[10px]">Filiación Institucional / Universidad:</label>
                      <input
                        type="text"
                        value={coAuthorAffiliation}
                        onChange={(e) => setCoAuthorAffiliation(e.target.value)}
                        placeholder="Facultad de Odontología, U. de Chile"
                        className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 bg-white text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 font-mono text-[10px]">Identificador ORCID iD (Opcional):</label>
                      <input
                        type="text"
                        value={coAuthorOrcid}
                        onChange={(e) => setCoAuthorOrcid(e.target.value)}
                        placeholder="0000-0002-1234-5678"
                        className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 bg-white font-mono text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <label className="font-bold text-slate-700 font-mono text-[10px]">Rol Académico:</label>
                        <select
                          value={coAuthorRole}
                          onChange={(e) => setCoAuthorRole(e.target.value as AuthorRoleType)}
                          className="p-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:outline-none font-medium"
                        >
                          <option value="coauthor">Coautor / Investigador</option>
                          <option value="primary">Primer Autor / Principal</option>
                          <option value="senior">Autor Senior / Tutor</option>
                          <option value="methodologist">Metodólogo / Bioestadístico</option>
                          <option value="collaborator">Colaborador Clínico</option>
                        </select>
                      </div>

                      <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 select-none">
                        <input
                          type="checkbox"
                          checked={coAuthorIsCorresponding}
                          onChange={(e) => setCoAuthorIsCorresponding(e.target.checked)}
                          className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                        />
                        <span className="text-[11px] font-medium text-slate-700 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-brand-600" /> Autor de Correspondencia
                        </span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddAuthor}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-brand-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      <Plus className="w-4 h-4" /> Agregar Autor a la Lista
                    </button>
                  </div>

                  {/* Preset Co-Authors for Quick Testing */}
                  <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Muestras Rápidas:</span>
                    <button
                      type="button"
                      onClick={() => handleAddPresetAuthor(
                        'Dra. María Elena Díaz',
                        'mediaz@universidad.cl',
                        'Dpto. de Periodoncia, Universidad de Valparaíso',
                        'coauthor',
                        false,
                        '0000-0003-4921-1188'
                      )}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-300 font-medium cursor-pointer"
                    >
                      + Dra. M.E. Díaz (Coautora - Periodoncia)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetAuthor(
                        'Dr. Camilo Pizarro-Araneda',
                        'cpizarro@estadistica-biomedica.org',
                        'Unidad de Bioestadística & Epidemiología Clínica',
                        'methodologist',
                        false,
                        '0000-0001-9023-4567'
                      )}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 rounded text-[11px] border border-indigo-200 font-medium cursor-pointer"
                    >
                      + Dr. C. Pizarro (Bioestadístico / Metodólogo)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetAuthor(
                        'Dra. Beatriz Villalobos, PhD',
                        'bvillalobos@investigaciondental.cl',
                        'Laboratorio de Biomateriales e Ingeniería Tisular Dental',
                        'senior',
                        true,
                        '0000-0002-1825-0097'
                      )}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-purple-700 rounded text-[11px] border border-purple-200 font-medium cursor-pointer"
                    >
                      + Dra. B. Villalobos (Autora Senior / Correspondencia)
                    </button>
                  </div>
                </div>

                {/* Inline Edit Card if an author is being edited */}
                {editingAuthorId && (
                  <div className="bg-brand-50/70 border-2 border-brand-300 rounded-xl p-4 space-y-3 fade-in shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-brand-200">
                      <span className="font-bold text-brand-900 text-xs flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-brand-700" /> Editando Datos del Autor Seleccionado
                      </span>
                      <button
                        type="button"
                        onClick={cancelEditAuthor}
                        className="text-slate-400 hover:text-slate-600 text-xs font-mono"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 font-mono text-[10px]">Nombre Completo:</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 font-mono text-[10px]">Correo Electrónico:</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 font-mono text-[10px]">Filiación:</label>
                        <input
                          type="text"
                          value={editAffiliation}
                          onChange={(e) => setEditAffiliation(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 font-mono text-[10px]">ORCID iD:</label>
                        <input
                          type="text"
                          value={editOrcid}
                          onChange={(e) => setEditOrcid(e.target.value)}
                          placeholder="0000-0000-0000-0000"
                          className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <label className="font-bold text-slate-700 font-mono text-[10px]">Rol:</label>
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as AuthorRoleType)}
                            className="p-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                          >
                            <option value="primary">Primer Autor / Principal</option>
                            <option value="coauthor">Coautor / Investigador</option>
                            <option value="senior">Autor Senior / Tutor</option>
                            <option value="methodologist">Metodólogo / Bioestadístico</option>
                            <option value="collaborator">Colaborador Clínico</option>
                          </select>
                        </div>

                        <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 select-none">
                          <input
                            type="checkbox"
                            checked={editIsCorresponding}
                            onChange={(e) => setEditIsCorresponding(e.target.checked)}
                            className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                          />
                          <span className="text-[11px] font-medium text-slate-700">Autor de Correspondencia</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={cancelEditAuthor}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={saveEditAuthor}
                          className="px-4 py-1.5 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-xs font-bold"
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* REGISTERED AUTHORS LIST WITH INTERACTIVE REORDERING & ROLE CONTROLS */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-800 font-mono uppercase tracking-wide text-xs flex items-center gap-1.5">
                      <span>Nómina Ordenada de Autores ({authorsList.length}):</span>
                    </h5>
                    <span className="text-[11px] text-slate-400 font-mono">
                      * El orden 1°, 2°, 3° define la cabecera del artículo.
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="divide-y divide-slate-100">
                      {authorsList.map((author, index) => {
                        const roleMeta = ROLE_CONFIG[author.role] || ROLE_CONFIG.coauthor;
                        const isFirst = index === 0;
                        const isLast = index === authorsList.length - 1;

                        return (
                          <div
                            key={author.id}
                            className={`p-3.5 sm:p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 transition-colors ${
                              isFirst ? 'bg-emerald-50/30' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            {/* Left: Position Number & Move Controls */}
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                              <div className="flex flex-col items-center justify-center">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs border ${
                                  isFirst 
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' 
                                    : 'bg-slate-100 text-slate-700 border-slate-300'
                                }`}>
                                  {index + 1}°
                                </span>
                              </div>

                              {/* Up / Down Reorder Buttons */}
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  disabled={isFirst}
                                  onClick={() => moveAuthor(index, 'up')}
                                  title="Mover autor hacia arriba (Subir posición en la cita)"
                                  className={`p-1 rounded border transition-all cursor-pointer ${
                                    isFirst
                                      ? 'text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50'
                                      : 'text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900 bg-white'
                                  }`}
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isLast}
                                  onClick={() => moveAuthor(index, 'down')}
                                  title="Mover autor hacia abajo (Bajar posición en la cita)"
                                  className={`p-1 rounded border transition-all cursor-pointer ${
                                    isLast
                                      ? 'text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50'
                                      : 'text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900 bg-white'
                                  }`}
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Author Identity & Affiliation */}
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-bold text-slate-800 text-sm">{author.name}</span>
                                  {isFirst && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold uppercase tracking-wider">
                                      Primer Autor
                                    </span>
                                  )}
                                  {author.isCorresponding && (
                                    <span className="px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                                      <Mail className="w-2.5 h-2.5" /> Correspondencia
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                                  <span>{author.email}</span>
                                  <span>•</span>
                                  <span className="text-slate-600 line-clamp-1">{author.affiliation}</span>
                                </div>

                                {author.orcid && (
                                  <div className="flex items-center gap-1 pt-0.5">
                                    <span className="w-3 h-3 rounded-full bg-[#a6ce39] text-white flex items-center justify-center text-[8px] font-bold">iD</span>
                                    <a
                                      href={`https://orcid.org/${author.orcid}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] font-mono text-slate-500 hover:text-brand-600 flex items-center gap-0.5"
                                    >
                                      https://orcid.org/{author.orcid}
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right: Dynamic Role Selector, Corresponding Switch & Action Buttons */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                              {/* Role Selector */}
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Rol:</label>
                                <select
                                  value={author.role}
                                  onChange={(e) => handleSetAuthorRole(author.id, e.target.value as AuthorRoleType)}
                                  className={`px-2 py-1 rounded text-xs font-semibold border cursor-pointer ${roleMeta.badgeBg} ${roleMeta.textCol} ${roleMeta.borderCol}`}
                                  title={roleMeta.desc}
                                >
                                  <option value="primary">Primer Autor / Principal</option>
                                  <option value="coauthor">Coautor / Investigador</option>
                                  <option value="senior">Autor Senior / Tutor</option>
                                  <option value="methodologist">Metodólogo / Estadístico</option>
                                  <option value="collaborator">Colaborador Clínico</option>
                                </select>
                              </div>

                              {/* Corresponding toggle button */}
                              <button
                                type="button"
                                onClick={() => handleToggleCorresponding(author.id)}
                                title={author.isCorresponding ? "Quitar como autor de correspondencia" : "Designar como autor de correspondencia"}
                                className={`px-2.5 py-1 rounded text-[11px] font-medium border flex items-center gap-1 cursor-pointer transition ${
                                  author.isCorresponding
                                    ? 'bg-brand-50 border-brand-300 text-brand-800 font-semibold'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                                }`}
                              >
                                <Mail className={`w-3 h-3 ${author.isCorresponding ? 'text-brand-600' : 'text-slate-400'}`} />
                                <span className="hidden sm:inline">{author.isCorresponding ? 'Contacto OJS' : 'Hacer Contacto'}</span>
                              </button>

                              {/* Edit details button */}
                              <button
                                type="button"
                                onClick={() => startEditAuthor(author)}
                                title="Editar nombre, correo, filiación u ORCID"
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete button (with protection for single author) */}
                              <button
                                type="button"
                                onClick={() => handleRemoveAuthor(author.id)}
                                title="Eliminar autor de la nómina"
                                disabled={authorsList.length <= 1}
                                className={`p-1.5 rounded-lg transition ${
                                  authorsList.length <= 1
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer'
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PRE-EVALUATION WITH AUTOFORMATCHECK */}
            {activeStep === 4 && (
              <div className="space-y-4 fade-in">
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-slate-800 text-sm">Paso 4: Pre-evaluación Automática de Conformidad</h4>
                  <p className="text-xs text-slate-500">Nuestro motor de Inteligencia Artificial analiza preliminarmente el formato, IMRAD, resolución de figuras (≥300 DPI) y calidad de referencias.</p>
                </div>

                <AutoFormatCheck
                  title={title}
                  abstract={abstract}
                  keywords={keywordsInput.split(',').map(k => k.trim()).filter(Boolean)}
                  referencesCount={references.length}
                  wordCount={wordCount}
                  manuscriptFile={manuscriptFile}
                  figures={figures}
                  onAnalysisComplete={handleAnalysisComplete}
                  triggerCheck={triggerCheck}
                />
              </div>
            )}

            {/* STEP 5: CONFIRMATION */}
            {activeStep === 5 && (
              <div className="space-y-4 fade-in text-xs">
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-slate-800 text-sm">Paso 5: Resumen Final e Inventario de Archivos</h4>
                  <p className="text-xs text-slate-500">Por favor, verifique el resumen de los datos, el orden de autores y el inventario de archivos adjuntos antes de formalizar la postulación a arbitraje.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div>
                    <span className="text-slate-400 block text-[9px] font-mono uppercase">Título:</span>
                    <span className="font-serif font-bold text-slate-800 text-sm leading-tight block">{title}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 block text-[9px] font-mono uppercase">Especialidad:</span>
                      <span className="font-semibold text-slate-700">{category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-mono uppercase">Puntaje Formato:</span>
                      <span className="font-bold text-brand-700 font-mono">{formattingScore} / 100</span>
                    </div>
                  </div>

                  {/* Complete Authors Roster in Step 5 */}
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold">
                      Nómina Oficial de Autores Ordenada ({authorsList.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {authorsList.map((auth, idx) => {
                        const roleMeta = ROLE_CONFIG[auth.role] || ROLE_CONFIG.coauthor;
                        return (
                          <div key={auth.id} className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px]">
                                <span className="font-mono text-slate-400 font-bold">{idx + 1}°.</span>
                                <span>{auth.name}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${roleMeta.badgeBg} ${roleMeta.textCol} ${roleMeta.borderCol} border`}>
                                {roleMeta.shortLabel}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">{auth.affiliation}</div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                              <span>{auth.email}</span>
                              {auth.isCorresponding && (
                                <span className="text-brand-600 font-bold flex items-center gap-0.5">
                                  <Mail className="w-2.5 h-2.5" /> Contacto
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Complete Files Inventory in Step 5 */}
                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    <span className="text-slate-500 block text-[10px] font-mono uppercase font-bold">Inventario de Archivos a Depositar en OJS:</span>
                    
                    {/* Manuscript item */}
                    <div className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-brand-600" />
                        <div>
                          <div className="font-mono font-bold text-slate-800 text-[11px]">{manuscriptFile.name}</div>
                          <div className="text-[10px] text-slate-500">Texto principal ({manuscriptFile.format.toUpperCase()}) • {manuscriptFile.size}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-brand-50 border border-brand-200 text-brand-800 text-[10px] font-mono font-bold">
                        Manuscrito
                      </span>
                    </div>

                    {/* Figures items */}
                    {figures.map(fig => (
                      <div key={fig.id} className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image className="w-4 h-4 text-indigo-600" />
                          <div>
                            <div className="font-mono font-bold text-slate-800 text-[11px]">
                              {fig.figureNumber ? `${fig.figureNumber}: ` : ''}{fig.name}
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1">{fig.caption || 'Figura científica'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
                            {fig.dpi || 300} DPI
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono uppercase">
                            {fig.format}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Supplementary items */}
                    {supplementaryFiles.map(sup => (
                      <div key={sup.id} className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-amber-600" />
                          <div className="font-mono font-bold text-slate-800 text-[11px]">{sup.name}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono uppercase">
                          {sup.type} ({sup.size})
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* AI Declaration Summary in Step 5 */}
                  <div className="border-t border-slate-200 pt-3">
                    <span className="text-slate-400 block text-[9px] font-mono uppercase mb-1">Declaración de Uso de Inteligencia Artificial (COPE/ICMJE):</span>
                    {aiUsed ? (
                      <div className="bg-slate-900 text-white rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-brand-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Uso de IA declarado afirmativamente
                          </span>
                          <span className="px-2 py-0.5 rounded bg-brand-950 border border-brand-800 text-[10px] text-brand-300 font-mono">
                            {aiSections.length} apartados
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {aiSections.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                        {aiDetails && (
                          <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded border border-slate-800">
                            "{aiDetails}"
                          </p>
                        )}
                        <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Supervisión humana certificada sin coautoría de IA
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>No se utilizó Inteligencia Artificial generativa en la elaboración de este manuscrito.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900 leading-normal flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-emerald-950">Listo para revisión</h5>
                    <p className="text-emerald-800">Al pulsar en "Enviar a Revisión Ciega", el manuscrito, sus figuras en alta resolución (≥300 DPI) y sus anexos éticos se registrarán en el sistema, enviando notificaciones automatizadas al Editor del Comité Clínico.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center">
            {activeStep > 1 ? (
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 cursor-pointer text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
            ) : (
              <div />
            )}

            {activeStep < 5 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                id="btn-confirm-submission"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs"
              >
                Enviar a Revisión Ciega
              </button>
            )}
          </div>
        </div>
      ) : (
        /* MY SUBMISSIONS PORTAL */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs">
            <h3 className="font-serif font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
              Sus Envíos en Evaluación Editorial
            </h3>

            {authorArticles.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <FileCode2 className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-medium">Usted no ha realizado ningún envío científico todavía.</p>
                <button
                  onClick={() => setIsSubmitting(true)}
                  className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  Postule su primer artículo de investigación ahora &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {authorArticles.map((art) => {
                  const statusInfo = statusDetails[art.status];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div 
                      key={art.id} 
                      className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:border-slate-300 transition-all bg-slate-50/20"
                    >
                      <div className="p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[9px] uppercase font-bold">
                              {art.category}
                            </span>
                            {art.aiDeclaration?.used ? (
                              <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-800 font-mono text-[9px] uppercase font-bold flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> IA Declarada ({art.aiDeclaration.sectionsUsed.length})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[9px] uppercase font-bold flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5 text-slate-400" /> Sin uso de IA
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-mono">Presentado: {art.submittedAt}</span>
                          </div>
                          <h4 className="font-serif font-bold text-slate-900 leading-snug">{art.title}</h4>
                          <p className="text-xs text-slate-500 font-medium">Autores: {art.authors.join(', ')}</p>
                        </div>

                        {/* Status chip */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full font-mono text-xs font-bold shrink-0 ${statusInfo.bg} ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>

                      {/* Detail / Collapsible Panel */}
                      <div className="bg-slate-50/50 border-t border-slate-200 p-4 space-y-3 text-xs">
                        {/* AutoFormat Score & Files in the panel */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-slate-600 border-b border-slate-200 pb-2">
                          <span>Reporte Pre-check automático: <strong className="text-slate-800">{art.formattingScore}/100</strong></span>
                          <span className="flex items-center gap-1 font-mono">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            {art.manuscriptFile?.name} ({art.manuscriptFile?.size})
                          </span>
                        </div>

                        {/* Attached Figures & Supplementary Repository for Author */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                            Archivos Depositados en el Manuscrito:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Manuscript card */}
                            <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-2 truncate">
                                <FileCheck className="w-4 h-4 text-brand-600 shrink-0" />
                                <span className="font-mono text-[11px] text-slate-800 truncate font-semibold">
                                  {art.manuscriptFile?.name}
                                </span>
                              </div>
                              <button
                                onClick={() => alert(`Descargando manuscrito ${art.manuscriptFile?.name}...`)}
                                className="p-1 hover:bg-slate-100 rounded text-brand-700 cursor-pointer"
                                title="Descargar"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Figures cards */}
                            {art.figures && art.figures.map(fig => (
                              <div key={fig.id} className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2 truncate">
                                  <Image className="w-4 h-4 text-indigo-600 shrink-0" />
                                  <div className="truncate">
                                    <span className="font-mono text-[11px] text-slate-800 truncate block font-medium">
                                      {fig.figureNumber ? `${fig.figureNumber}: ` : ''}{fig.name}
                                    </span>
                                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                      {fig.dpi || 300} DPI • {fig.format.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => alert(`Descargando figura en alta resolución (${fig.dpi || 300} DPI): ${fig.name}...`)}
                                  className="p-1 hover:bg-slate-100 rounded text-brand-700 cursor-pointer"
                                  title="Descargar figura"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}

                            {/* Supplementary files cards */}
                            {art.supplementaryFiles && art.supplementaryFiles.map(sup => (
                              <div key={sup.id} className="bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2 truncate">
                                  <Paperclip className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span className="font-mono text-[11px] text-slate-800 truncate">
                                    {sup.name}
                                  </span>
                                </div>
                                <button
                                  onClick={() => alert(`Descargando documento anexo: ${sup.name}...`)}
                                  className="p-1 hover:bg-slate-100 rounded text-brand-700 cursor-pointer"
                                  title="Descargar anexo"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Reviewer reports if revisions are requested or accepted */}
                        {art.status === 'revisions_required' && (
                          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-amber-900 font-bold">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span>Comentarios del Revisor / Editor para Corrección</span>
                            </div>
                            <p className="text-amber-800 italic bg-white/50 p-3 rounded border border-amber-150">
                              "{art.editorNotes || "Se solicitan correcciones formales de estilo y figuras en mayor resolución antes de revaluar."}"
                            </p>
                            {art.reviews.length > 0 && (
                              <div className="space-y-1">
                                <span className="font-bold text-slate-700 block">Evaluaciones de Pares:</span>
                                {art.reviews.map((rev, i) => (
                                  <div key={i} className="text-[11px] text-slate-600 pl-3 border-l-2 border-slate-300">
                                    Revisor #{i+1}: "{rev.comments}" (Recomendación: <span className="font-semibold">{rev.recommendation}</span>)
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="pt-2 text-right">
                              <button
                                onClick={() => handleAuthorRevisionSubmit(art)}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs cursor-pointer transition-colors"
                              >
                                Enviar Manuscrito y Figuras Corregidas
                              </button>
                            </div>
                          </div>
                        )}

                        {art.status === 'published' && (
                          <div className="bg-teal-50 border border-teal-200 text-teal-900 p-3.5 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-bold">¡Publicación Científica Formalizada!</p>
                              <p className="text-teal-700">El artículo se encuentra en el volumen activo y ya cuenta con DOI único: <strong>{art.doi}</strong>.</p>
                            </div>
                            <span className="px-3 py-1 bg-teal-600 text-white font-bold rounded text-[11px] uppercase font-mono">Indexado</span>
                          </div>
                        )}

                        {art.status === 'under_review' && (
                          <div className="bg-indigo-50 border border-indigo-200 text-indigo-950 p-3 rounded-lg flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                            <span>El artículo se encuentra en revisión ciega por pares odontólogos. {art.reviewers.length} revisores asignados de forma anónima.</span>
                          </div>
                        )}

                        {art.status === 'submitted' && (
                          <div className="bg-blue-50 border border-blue-200 text-blue-950 p-3 rounded-lg">
                            Su manuscrito y figuras se han cargado en la plataforma OJS correctamente. El editor general revisará el cumplimiento inicial para proceder a la asignación de revisores idóneos de su área.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
