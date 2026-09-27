import React from 'react';
import { X, ShieldCheck, BookOpen, Award, Users, Scale, FileText, CheckCircle2, AlertCircle, Building2, Globe2, ExternalLink, Printer } from 'lucide-react';
import { InstitutionalModalType } from '../types';
import { JOURNAL_INFO, EDITORIAL_BOARD_MEMBERS, INDEXING_SYSTEMS } from '../data';
import logoImg from '../assets/images/scientia_dentis_logo_1788278899814.jpg';

interface InstitutionalModalsProps {
  activeModal: InstitutionalModalType;
  onClose: () => void;
  onSelectModal: (modal: InstitutionalModalType) => void;
}

export default function InstitutionalModals({ activeModal, onClose, onSelectModal }: InstitutionalModalsProps) {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 fade-in" id="institutional-modal-backdrop">
      <div className="backdrop-blur-2xl bg-slate-950/95 border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(6,182,212,0.15)] ring-1 ring-white/10 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e9e5db] border border-cyan-400/40 p-0.5 shrink-0 flex items-center justify-center shadow-xs">
              <img 
                src={logoImg} 
                alt="COLP Logo" 
                className="w-full h-full object-contain mix-blend-multiply"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                Colegio de Odontólogos de La Paz · {JOURNAL_INFO.issn}
              </p>
              <h3 className="font-serif text-lg font-bold text-white leading-tight">
                {activeModal === 'privacy' && 'Política de Privacidad y Protección de Datos'}
                {activeModal === 'terms' && 'Términos de Uso y Política de Acceso Abierto (CC-BY 4.0)'}
                {activeModal === 'guidelines' && 'Guía para Autores y Normas Éticas de Publicación'}
                {activeModal === 'about' && 'Acerca de Scientia Dentis y Consejo Editorial'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Imprimir documento normativo"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              id="close-institutional-modal"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs (Higgsfield Segmented Style) */}
        <div className="bg-slate-900/60 border-b border-white/10 px-6 py-2.5 flex flex-wrap gap-2 text-xs font-mono">
          <button
            onClick={() => onSelectModal('about')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeModal === 'about' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs font-semibold' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Acerca de & Consejo
          </button>
          <button
            onClick={() => onSelectModal('guidelines')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeModal === 'guidelines' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs font-semibold' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Guía para Autores (Vancouver)
          </button>
          <button
            onClick={() => onSelectModal('terms')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeModal === 'terms' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs font-semibold' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Términos y Acceso Abierto
          </button>
          <button
            onClick={() => onSelectModal('privacy')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeModal === 'privacy' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs font-semibold' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Privacidad & Bioética
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed font-sans max-h-[70vh]">
          
          {/* TAB 1: ACERCA DE LA REVISTA & CONSEJO EDITORIAL */}
          {activeModal === 'about' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-5">
                <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold block mb-1">
                  Misión y Visión Científica
                </span>
                <h4 className="font-serif text-2xl font-bold text-white">
                  Scientia Dentis "Revista Científica"
                </h4>
                <p className="mt-2 text-slate-300 text-sm">
                  Fundada como el <strong>Órgano Oficial del Colegio de Odontólogos de La Paz (COLP)</strong>, 
                  es una revista científica periódica semestral, arbitrada bajo la modalidad de revisión por pares 
                  ciega doble, dedicada a la difusión de investigaciones inéditas, revisiones sistemáticas 
                  y casos clínicos de impacto en el campo estomatológico nacional e internacional.
                </p>
              </div>

              {/* Objetivos editoriales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/70 rounded-2xl border border-white/10">
                  <h5 className="font-serif font-bold text-white flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-cyan-400" /> Excelencia y Rigor Científico
                  </h5>
                  <p className="text-xs text-slate-400">
                    Fomentar la producción de conocimiento odontológico original con metodologías estandarizadas, 
                    bioestadística robusta y estricto apego a directrices biomédicas internacionales.
                  </p>
                </div>
                <div className="p-4 bg-slate-900/70 rounded-2xl border border-white/10">
                  <h5 className="font-serif font-bold text-white flex items-center gap-2 mb-2">
                    <Globe2 className="w-4 h-4 text-cyan-400" /> Ciencia Abierta y Sin Barreras
                  </h5>
                  <p className="text-xs text-slate-400">
                    Garantizar el acceso universal y gratuito (Platinum Open Access) financiado íntegramente por 
                    el Colegio de Odontólogos de La Paz, sin costos de procesamiento ni suscripción.
                  </p>
                </div>
              </div>

              {/* Consejo Editorial y Asesor */}
              <div className="space-y-4 pt-2">
                <h5 className="font-serif font-bold text-lg text-white border-b border-white/10 pb-2">
                  Cuerpo Editorial y Consejo Científico Asesor
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EDITORIAL_BOARD_MEMBERS.map((member, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-cyan-500/40 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                            {member.role}
                          </p>
                          <h6 className="font-serif font-bold text-white text-sm mt-0.5">
                            {member.name}
                          </h6>
                          <p className="text-xs text-slate-400 mt-1">
                            {member.institution} · <span className="font-medium text-slate-200">{member.country}</span>
                          </p>
                          <span className="inline-block mt-2 text-[10px] bg-white/5 text-slate-300 px-2 py-0.5 rounded-md font-mono border border-white/5">
                            {member.specialty}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indexación */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h5 className="font-serif font-bold text-base text-white">
                  Sistemas de Indexación y Visibilidad Académica
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {INDEXING_SYSTEMS.map((idx, i) => (
                    <div key={i} className="p-3.5 bg-slate-900/60 rounded-xl border border-white/10 text-xs">
                      <span className="font-bold text-white block">{idx.name}</span>
                      <span className="text-cyan-400 font-mono text-[11px] font-semibold">{idx.status}</span>
                      <p className="text-slate-400 text-[11px] mt-1">{idx.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GUÍA PARA AUTORES */}
          {activeModal === 'guidelines' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold block mb-1">
                  Normativa Editorial
                </span>
                <h4 className="font-serif text-2xl font-bold text-white">
                  Directrices y Guía para Autores (Normas ICMJE / Vancouver)
                </h4>
                <p className="mt-2 text-slate-300 text-sm">
                  Los manuscritos remitidos a <em>Scientia Dentis</em> deben cumplir estrictamente con los Requisitos de Uniformidad 
                  para Manuscritos Presentados a Revistas Biomédicas del Comité Internacional de Editores de Revistas Médicas (ICMJE).
                </p>
              </div>

              {/* Secciones de la Guía */}
              <div className="space-y-4">
                <div className="p-4 bg-cyan-950/30 rounded-2xl border border-cyan-500/30">
                  <h5 className="font-semibold text-cyan-300 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Tipos de Artículos Aceptados
                  </h5>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
                    <li><strong>Artículos Originales de Investigación:</strong> Hasta 4,500 palabras (sin incluir referencias). Estructura IMRyD: Introducción, Material y Métodos, Resultados, Discusión y Conclusiones.</li>
                    <li><strong>Revisiones Sistemáticas y Metaanálisis:</strong> Elaboradas conforme a las guías PRISMA, con registro previo en PROSPERO recomendado.</li>
                    <li><strong>Casos Clínicos Quirúrgicos o Estomatológicos:</strong> Hasta 2,500 palabras, guiados por la directriz CARE, con consentimiento informado firmado del paciente.</li>
                    <li><strong>Comunicaciones Breves y Cartas al Editor:</strong> Discusión científica y aportes metodológicos breves (hasta 1,200 palabras).</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10">
                  <h5 className="font-semibold text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" /> Requisitos de Formato y Estructura
                  </h5>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                    <div className="space-y-1">
                      <p><strong>Resumen Estructurado:</strong> Máximo 250 palabras en español e inglés (Abstract). Cuatro apartados obligatorios: Introducción, Métodos, Resultados, Conclusiones.</p>
                      <p><strong>Palabras Clave:</strong> De 3 a 6 términos normalizados en los Descriptores en Ciencias de la Salud (DeCS) o Medical Subject Headings (MeSH).</p>
                    </div>
                    <div className="space-y-1">
                      <p><strong>Referencias Bibliográficas:</strong> Estilo Vancouver numeradas correlativamente en superíndice conforme aparecen en el texto. Se debe incluir DOI activo en todas las citas que dispongan de él.</p>
                      <p><strong>Figuras e Imágenes:</strong> Mínimo 300 DPI (fotografías clínicas a color) y 600 DPI (micrografías, radiografías y gráficos de líneas). Formatos TIFF o EPS.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-950/30 rounded-2xl border border-amber-500/30">
                  <h5 className="font-semibold text-amber-300 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" /> Ética, Consentimiento y Uso de Inteligencia Artificial (IA)
                  </h5>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
                    <li><strong>Aprobación de Comité de Bioética:</strong> Toda investigación que involucre pacientes humanos o material biológico debe consignar el número de aprobación del Comité de Ética institucional correspondiente.</li>
                    <li><strong>Declaración de IA:</strong> Los autores deben declarar transparentemente en el formulario de envío si emplearon herramientas de Inteligencia Artificial generativa (traducción, asistencia en redacción o código estadístico). La IA no puede ser listada como autora ni tiene responsabilidad legal sobre los contenidos.</li>
                    <li><strong>Conflicto de Intereses:</strong> Declarar cualquier vínculo financiero, comercial o patrocinio con fabricantes de implantes, biomateriales o instrumental odontológico evaluado.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TÉRMINOS Y ACCESO ABIERTO */}
          {activeModal === 'terms' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold block mb-1">
                  Propiedad Intelectual y Licenciamiento
                </span>
                <h4 className="font-serif text-2xl font-bold text-white">
                  Términos de Uso y Política de Acceso Abierto
                </h4>
                <p className="mt-2 text-slate-300 text-sm">
                  <em>Scientia Dentis</em> se adhiere a los principios de la Iniciativa de Budapest para el Acceso Abierto (BOAI) 
                  y la Declaración de San Francisco sobre la Evaluación de la Investigación (DORA).
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-cyan-950/30 rounded-2xl border border-cyan-500/30 flex items-start gap-4">
                  <Scale className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
                  <div className="text-xs text-slate-300 space-y-2">
                    <h5 className="font-bold text-sm text-white">Licencia Creative Commons Atribución 4.0 Internacional (CC BY 4.0)</h5>
                    <p>
                      Todo el contenido publicado en <em>Scientia Dentis</em> está bajo una licencia Creative Commons Attribution 4.0 International (CC BY 4.0).
                      Los lectores y la comunidad científica son libres de compartir, copiar, redistribuir, adaptar y remezclar el material en cualquier soporte, 
                      siempre que se cite adecuadamente la autoría original y la fuente de publicación.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 space-y-2">
                    <h5 className="font-serif font-bold text-white text-sm">Política de Sin Cargos (No APC)</h5>
                    <p className="text-slate-400">
                      La revista no cobra a los autores por el envío de manuscritos, la revisión por pares, el procesamiento editorial 
                      ni por la publicación final (Article Processing Charges = $0 USD). La totalidad de la gestión es solventada por el 
                      presupuesto de fomento a la investigación del <strong>Colegio de Odontólogos de La Paz</strong>.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 space-y-2">
                    <h5 className="font-serif font-bold text-white text-sm">Política de Autoarchivo (Green OA)</h5>
                    <p className="text-slate-400">
                      Se autoriza a los autores a depositar la versión final publicada (versión del editor) en repositorios institucionales, 
                      temáticos o páginas personales inmediatamente después de su publicación, sin período de embargo.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 text-xs space-y-2">
                  <h5 className="font-serif font-bold text-white text-sm">Preservación Digital Permanente</h5>
                  <p className="text-slate-400">
                    Los artículos y volúmenes de <em>Scientia Dentis</em> cuentan con preservación digital a través de la Red de Preservación 
                    de PKP (PKP Preservation Network), que emplea el software LOCKSS para crear archivos distribuidos descentralizados y garantizar 
                    la disponibilidad a perpetuidad de todos los números emitidos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: POLÍTICA DE PRIVACIDAD */}
          {activeModal === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold block mb-1">
                  Tratamiento de Información y Bioética
                </span>
                <h4 className="font-serif text-2xl font-bold text-white">
                  Política de Privacidad y Confidencialidad
                </h4>
                <p className="mt-2 text-slate-300 text-sm">
                  Garantías de seguridad para los datos personales de autores, revisores pares y resguardo estricto 
                  de la privacidad de pacientes involucrados en estudios clínicos y casos odontológicos.
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 space-y-2">
                  <h5 className="font-serif font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" /> 1. Datos de Autores, Revisores y Lectores
                  </h5>
                  <p>
                    Los nombres, direcciones de correo electrónico, números ORCID y filiaciones institucionales 
                    ingresados en este sistema se usarán exclusivamente para los fines declarados por la revista:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Gestión editorial y comunicación directa durante el proceso de arbitraje ciego.</li>
                    <li>Atribución de autoría y crédito académico en los metadatos de publicación internacional (Crossref/DOI).</li>
                    <li>No se facilitarán ni venderán a terceros para ningún fin comercial o publicitario ajeno a la vida académica del COLP.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 space-y-2">
                  <h5 className="font-serif font-bold text-white text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" /> 2. Protección de Pacientes y Casos Clínicos Odontológicos
                  </h5>
                  <p>
                    En cumplimiento de la <strong>Declaración de Helsinki</strong> de la Asociación Médica Mundial:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li>Los pacientes tienen derecho a la privacidad. No se publicarán nombres, iniciales ni números de cédula/historia clínica.</li>
                    <li>Las fotografías clínicas de rostro completo deben incorporar barras opacas que cubran la región ocular para impedir el reconocimiento facial, a menos que el paciente haya otorgado consentimiento expreso firmado para su difusión académica.</li>
                    <li>Los archivos radiográficos y tomográficos (CBCT) deben ser despojados de cualquier metadato DICOM que identifique al paciente antes de su envío.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/10 space-y-2">
                  <h5 className="font-serif font-bold text-white text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" /> 3. Confidencialidad del Proceso de Arbitraje Doble Ciego
                  </h5>
                  <p>
                    Los manuscritos bajo revisión son documentos estrictamente confidenciales. Los revisores asignados por el Comité 
                    no pueden compartir, discutir ni utilizar ninguna información o hipótesis contenida en los trabajos no publicados. 
                    La identidad del revisor se mantiene en reserva anónima permanente ante los autores y viceversa.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-950 border-t border-white/10 px-6 py-3.5 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Última actualización: Enero 2026 · Comité Editorial COLP
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-medium transition-all cursor-pointer shadow-md shadow-cyan-950/40"
          >
            Entendido y Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
