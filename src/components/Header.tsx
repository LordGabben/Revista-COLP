import React, { useState } from 'react';
import { 
  BookOpen, 
  User as UserIcon, 
  Shield, 
  PenTool, 
  ClipboardCheck, 
  GraduationCap, 
  Search, 
  FileText, 
  Users, 
  Menu, 
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { UserRole, JournalConfig, InstitutionalModalType } from '../types';
import logoImg from '../assets/images/scientia_dentis_logo_1788278899814.jpg';

interface HeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  journalInfo: JournalConfig;
  onOpenModal: (modal: InstitutionalModalType) => void;
  onNavigateHome: () => void;
  onNavigateCurrentIssue: () => void;
  onNavigateArchive: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Header({ 
  currentRole, 
  onChangeRole, 
  journalInfo,
  onOpenModal,
  onNavigateHome,
  onNavigateCurrentIssue,
  onNavigateArchive,
  searchQuery = '',
  onSearchChange
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Role descriptions and metadata
  const roleDetails: Record<UserRole, { label: string; roleTitle: string; icon: any; badgeColor: string }> = {
    reader: {
      label: "Lector / Público",
      roleTitle: "Comunidad Científica General",
      icon: GraduationCap,
      badgeColor: "bg-slate-100 text-slate-800 border-slate-300"
    },
    author: {
      label: "Autor Investigador",
      roleTitle: "Dr. Gonzalo Martínez-Rojas (Autor)",
      icon: PenTool,
      badgeColor: "bg-teal-50 text-teal-800 border-teal-300"
    },
    reviewer: {
      label: "Revisor por Pares",
      roleTitle: "Dra. Sofía Mendoza, PhD (Árbitro)",
      icon: ClipboardCheck,
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-300"
    },
    editor: {
      label: "Editor en Jefe",
      roleTitle: "Dra. Beatriz Villalobos, PhD (Editora)",
      icon: Shield,
      badgeColor: "bg-amber-50 text-amber-900 border-amber-300"
    }
  };

  const currentRoleInfo = roleDetails[currentRole];
  const CurrentRoleIcon = currentRoleInfo.icon;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" id="app-header">
      
      {/* Simulation & Institutional Utility Strip */}
      <div className="bg-slate-950 text-white py-2 px-4 sm:px-8 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          
          {/* Institutional Trust markers */}
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">
              Órgano Oficial del Colegio de Odontólogos de La Paz (COLP)
            </span>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">·</span>
            <span className="font-mono text-cyan-400 hidden sm:inline font-semibold">
              {journalInfo.issn}
            </span>
          </div>

          {/* Quick Institutional Policy Links + Role Selector */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
              <button 
                onClick={() => onOpenModal('guidelines')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Guía Autores (Vancouver)
              </button>
              <span className="text-slate-700" aria-hidden="true">/</span>
              <button 
                onClick={() => onOpenModal('about')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Comité Editorial
              </button>
              <span className="text-slate-700" aria-hidden="true">/</span>
              <button 
                onClick={() => onOpenModal('terms')} 
                className="hover:text-white transition-colors cursor-pointer"
              >
                Acceso Abierto (CC BY 4.0)
              </button>
            </div>

            {/* Role Switcher Pills */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 px-2 hidden sm:inline">
                Panel:
              </span>
              {(['reader', 'author', 'reviewer', 'editor'] as UserRole[]).map((role) => {
                const isSelected = currentRole === role;
                const info = roleDetails[role];
                const Icon = info.icon;
                return (
                  <button
                    key={role}
                    id={`nav-role-${role}`}
                    onClick={() => onChangeRole(role)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{role === 'reader' ? 'Lector' : role === 'author' ? 'Autor' : role === 'reviewer' ? 'Revisor' : 'Editor'}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Wordmark & Seal */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 sm:gap-4 cursor-pointer group shrink-0"
            id="brand-logo-button"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-slate-800 bg-[#e9e5db] shadow-md flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <img 
                src={logoImg} 
                alt="Scientia Dentis Logo" 
                className="w-full h-full object-contain mix-blend-multiply"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="leading-tight">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-serif text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  Scientia Dentis
                </span>
                <span className="font-serif italic text-sm sm:text-base font-semibold text-blue-700">
                  "Revista Científica"
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Órgano Oficial del Colegio de Odontólogos de La Paz
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-700">
            <button
              onClick={onNavigateHome}
              className={`hover:text-blue-600 transition-colors cursor-pointer ${currentRole === 'reader' ? 'text-blue-700 font-semibold' : ''}`}
            >
              Inicio / Portada
            </button>
            <button
              onClick={onNavigateCurrentIssue}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Edición Actual
            </button>
            <button
              onClick={onNavigateArchive}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Catálogo & Archivo
            </button>
            <button
              onClick={() => onChangeRole('author')}
              className={`hover:text-blue-600 transition-colors cursor-pointer ${currentRole === 'author' ? 'text-blue-700 font-semibold' : ''}`}
            >
              Enviar Artículo
            </button>
            <button
              onClick={() => onOpenModal('guidelines')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Guía de Autores
            </button>
            <button
              onClick={() => onOpenModal('about')}
              className="hover:text-blue-600 transition-colors cursor-pointer"
            >
              Comité Editorial
            </button>
          </nav>

          {/* Right Action: Active User / Quick Role Badge + Mobile Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Quick Search Input */}
            {onSearchChange && (
              <div className="relative hidden md:block w-44 lg:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 transition-colors"
                />
              </div>
            )}

            {/* Current Active Persona Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs shadow-2xs ${currentRoleInfo.badgeColor}`}>
              <CurrentRoleIcon className="w-4 h-4 shrink-0 text-current" />
              <div className="hidden sm:block text-left">
                <span className="block text-[10px] uppercase font-mono font-bold tracking-wider opacity-75">
                  {currentRoleInfo.label}
                </span>
                <span className="block font-semibold truncate max-w-[130px]">
                  {currentRole === 'reader' ? 'Acceso Público' : currentRole === 'author' ? 'Dr. G. Martínez' : currentRole === 'reviewer' ? 'Dra. S. Mendoza' : 'Dra. B. Villalobos'}
                </span>
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-4 pt-4 border-t border-slate-200 space-y-3 fade-in pb-2">
            {onSearchChange && (
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar artículos por título, autor..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-800"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                onClick={() => {
                  onNavigateHome();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg text-left bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer"
              >
                Inicio / Portada
              </button>
              <button
                onClick={() => {
                  onNavigateCurrentIssue();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg text-left bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer"
              >
                Edición Actual
              </button>
              <button
                onClick={() => {
                  onNavigateArchive();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg text-left bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer"
              >
                Catálogo & Archivo
              </button>
              <button
                onClick={() => {
                  onChangeRole('author');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg text-left bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold cursor-pointer"
              >
                Enviar Artículo
              </button>
              <button
                onClick={() => {
                  onOpenModal('guidelines');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg text-left bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer"
              >
                Guía de Autores
              </button>
              <button
                onClick={() => {
                  onOpenModal('about');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-lg text-left bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer"
              >
                Comité Editorial
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
