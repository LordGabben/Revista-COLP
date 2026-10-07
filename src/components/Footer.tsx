import React from 'react';
import { BookOpen, MapPin, Mail, Phone, ExternalLink, ShieldCheck, Scale, FileText, Users, Award, HeartHandshake } from 'lucide-react';
import { JournalConfig, InstitutionalModalType } from '../types';
import logoImg from '../assets/images/scientia_dentis_logo_1788278899814.jpg';
import ColpLogo from './ColpLogo';

interface FooterProps {
  journalInfo: JournalConfig;
  onOpenModal: (modal: InstitutionalModalType) => void;
  onResetDemo: () => void;
}

export default function Footer({ journalInfo, onOpenModal, onResetDemo }: FooterProps) {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 shrink-0 mt-16" id="app-footer">
      
      {/* Main 4-Column Institutional Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Institutional Seal (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-[#e9e5db] border-2 border-amber-400/50 p-1 shrink-0 flex items-center justify-center shadow-lg">
                <img 
                  src={logoImg} 
                  alt="Colegio de Odontólogos de La Paz" 
                  className="w-full h-full object-contain mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-white tracking-tight leading-tight">
                  Scientia Dentis
                </h4>
                <p className="font-serif italic text-xs text-amber-300/90 font-medium">
                  "Revista Científica"
                </p>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Órgano Oficial del Colegio de Odontólogos de La Paz
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Publicación científica semestral arbitrada por pares a doble ciego. Difusión estomatológica internacional,
              bioingeniería tisular, periodoncia, ortodoncia, cirugía y odontología digital bajo estándares de ciencia abierta.
            </p>

            <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
              <span className="px-2.5 py-1 bg-slate-900 text-cyan-300 border border-slate-800 rounded">
                Órgano Oficial COLP
              </span>
              <span className="px-2.5 py-1 bg-slate-900 text-emerald-300 border border-slate-800 rounded">
                Open Access CC BY 4.0
              </span>
              <span className="px-2.5 py-1 bg-slate-900 text-amber-300 border border-slate-800 rounded">
                No APC (Gratuito)
              </span>
            </div>
          </div>

          {/* Col 2: Secciones Institucionales & Políticas (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="font-serif font-bold text-sm text-white border-b border-slate-800 pb-2">
              Políticas & Normativa
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onOpenModal('guidelines')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer group text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Guía para Autores (Normas Vancouver)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('terms')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer group text-left"
                >
                  <Scale className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Términos de Uso y Licencia CC-BY 4.0</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('privacy')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer group text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Política de Privacidad y Bioética</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('about')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer group text-left"
                >
                  <Users className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Comité Editorial y Consejo Asesor</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('guidelines')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer group text-left"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Declaración de Helsinki y Ética en IA</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Arbitraje & Preservación (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h5 className="font-serif font-bold text-sm text-white border-b border-slate-800 pb-2">
              Garantías OJS
            </h5>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="leading-snug">
                <strong className="text-slate-200">Revisión por Pares:</strong> Arbitraje doble ciego por revisores externos.
              </p>
              <p className="leading-snug">
                <strong className="text-slate-200">Anti-Plagio:</strong> Chequeo sistemático de similitud documental.
              </p>
              <p className="leading-snug">
                <strong className="text-slate-200">Preservación:</strong> Red PKP PN y archivos LOCKSS permanentes.
              </p>
            </div>
          </div>

          {/* Col 4: Sede & Contacto COLP (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
              <ColpLogo 
                className="w-10 h-10" 
                allowUpload={true} 
                alt="Colegio de Odontólogos de La Paz" 
              />
              <h5 className="font-serif font-bold text-sm text-white">
                Colegio de Odontólogos de La Paz
              </h5>
            </div>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Pasaje Jauregui N° 2248, Edif. Quipus 2do piso, Sopocachi, La Paz, Bolivia</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href="mailto:admcentralcolp@gmail.com" className="text-slate-200 hover:underline">
                  admcentralcolp@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <a href="tel:+59122444004" className="text-slate-200 hover:underline">
                  +591 (2) 2444004
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onResetDemo}
                id="footer-reset-demo-btn"
                className="text-[11px] text-teal-400 hover:text-teal-300 font-mono underline decoration-dotted cursor-pointer flex items-center gap-1.5"
                title="Restaura la base de datos simulada OJS a los datos de fábrica"
              >
                <span>Restaurar datos simulados de prueba OJS</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 text-center md:text-left">
          <p>
            &copy; {new Date().getFullYear()} <strong>Scientia Dentis "Revista Científica"</strong>. 
            Órgano Oficial del Colegio de Odontólogos de La Paz (COLP). Todos los derechos de autor reservados bajo 
            licencia Creative Commons Atribución 4.0 Internacional (CC BY 4.0).
          </p>
          <div className="flex items-center gap-4 shrink-0 font-mono text-[10px]">
            <span className="text-slate-400">OJS / PKP 3.4 Core</span>
            <span className="text-slate-400">·</span>
            <span className="text-cyan-400">La Paz - Bolivia</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
