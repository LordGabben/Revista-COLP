import React, { useState } from 'react';
import { 
  BookOpen, 
  Shield, 
  PenTool, 
  ClipboardCheck, 
  GraduationCap, 
  Search, 
  FileText, 
  Users, 
  Menu, 
  X,
  ChevronDown,
  Sparkles,
  Command
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
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Role descriptions with luminous cyberpunk/scientific accents
  const roleDetails: Record<UserRole, { label: string; roleTitle: string; icon: any; glowColor: string; pillClass: string }> = {
    reader: {
      label: "Lector / Público",
      roleTitle: "Comunidad Científica",
      icon: GraduationCap,
      glowColor: "cyan",
      pillClass: "bg-cyan-950/60 text-cyan-300 border-cyan-500/30 shadow-cyan-950/40"
    },
    author: {
      label: "Autor Investigador",
      roleTitle: "Dr. G. Martínez (COLP)",
      icon: PenTool,
      glowColor: "teal",
      pillClass: "bg-teal-950/60 text-teal-300 border-teal-500/30 shadow-teal-950/40"
    },
    reviewer: {
      label: "Revisor por Pares",
      roleTitle: "Dra. S. Mendoza, PhD",
      icon: ClipboardCheck,
      glowColor: "indigo",
      pillClass: "bg-indigo-950/60 text-indigo-300 border-indigo-500/30 shadow-indigo-950/40"
    },
    editor: {
      label: "Editor en Jefe",
      roleTitle: "Dra. B. Villalobos, PhD",
      icon: Shield,
      glowColor: "amber",
      pillClass: "bg-amber-950/60 text-amber-300 border-amber-500/30 shadow-amber-950/40"
    }
  };

  const currentRoleInfo = roleDetails[currentRole];
  const CurrentRoleIcon = currentRoleInfo.icon;

  return (
    <header className="sticky top-3 sm:top-4 z-50 mx-auto max-w-7xl px-3 sm:px-6 w-full" id="app-header">
      
      {/* Floating Island Container with Glassmorphism and Volumetric Edge */}
      <div className="backdrop-blur-2xl bg-slate-950/80 border border-white/10 rounded-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.08)] ring-1 ring-white/5 transition-all">
        
        {/* Main Header Row */}
        <div className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 lg:gap-6">
          
          {/* Brand Wordmark & Official Seal */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            id="brand-logo-button"
          >
            {/* Glowing Ring Around Seal */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/40 via-blue-600/30 to-teal-400/40 rounded-full blur-xs opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-cyan-400/50 bg-[#e9e5db] shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img 
                  src={logoImg} 
                  alt="Scientia Dentis Logo" 
                  className="w-full h-full object-contain mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            <div className="leading-tight">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="font-serif text-lg sm:text-xl font-black text-white tracking-tight group-hover:text-cyan-200 transition-colors">
                  Scientia Dentis
                </span>
                <span className="font-serif italic text-xs sm:text-sm font-semibold text-cyan-400">
                  "Revista Científica"
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans tracking-wide flex items-center gap-1.5">
                <span>Órgano Oficial COLP</span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="font-mono text-cyan-400/90 text-[10px] hidden sm:inline">{journalInfo.issn}</span>
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Higgsfield Clean Minimalist Style) */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-medium text-slate-300">
            <button
              onClick={onNavigateHome}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentRole === 'reader'
                  ? 'bg-white/10 text-white shadow-xs font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Portada
            </button>
            <button
              onClick={onNavigateCurrentIssue}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Edición Actual
            </button>
            <button
              onClick={onNavigateArchive}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Catálogo & Archivo
            </button>
            <button
              onClick={() => onOpenModal('guidelines')}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Guía de Autores
            </button>
            <button
              onClick={() => onOpenModal('about')}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Comité Editorial
            </button>
            <button
              onClick={() => onChangeRole('author')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                currentRole === 'author' 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold' 
                  : 'text-teal-400 hover:bg-teal-500/10'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Enviar Manuscrito</span>
            </button>
          </nav>

          {/* Right Utility: Interactive Search + Role Switcher Island */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Quick Floating Search Input with Keyboard Badge */}
            {onSearchChange && (
              <div className="relative hidden md:block w-40 lg:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-8 pr-12 py-1.5 bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 bg-white/5 border border-white/10 rounded px-1 py-0.5 pointer-events-none flex items-center gap-0.5">
                  <Command className="w-2.5 h-2.5" /> K
                </span>
              </div>
            )}

            {/* Role Switcher Pill with Ambient Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs shadow-md transition-all cursor-pointer ${currentRoleInfo.pillClass} hover:brightness-110 active:scale-95`}
                title="Cambiar perfil o panel de simulación OJS"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <CurrentRoleIcon className="w-3.5 h-3.5" />
                <div className="text-left hidden sm:block">
                  <span className="block text-[9px] uppercase font-mono font-bold tracking-wider opacity-75">
                    Panel
                  </span>
                  <span className="block font-semibold text-[11px] whitespace-nowrap">
                    {currentRoleInfo.label.split(' ')[0]}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {/* Role Dropdown Menu */}
              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 backdrop-blur-2xl bg-slate-950/95 border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 fade-in ring-1 ring-white/10"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
                    Simulación de Perfiles OJS
                  </div>

                  {(['reader', 'author', 'reviewer', 'editor'] as UserRole[]).map((role) => {
                    const info = roleDetails[role];
                    const Icon = info.icon;
                    const isSelected = currentRole === role;
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          onChangeRole(role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30' 
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" />
                          <div className="text-left">
                            <span className="block">{info.label}</span>
                            <span className="block text-[10px] text-slate-500 font-mono">{info.roleTitle}</span>
                          </div>
                        </div>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden px-4 pb-4 pt-2 border-t border-white/10 space-y-3 fade-in">
            {onSearchChange && (
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Buscar artículos por título, autor, palabras clave..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                onClick={() => {
                  onNavigateHome();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-white/5 hover:bg-white/10 text-white cursor-pointer"
              >
                Portada
              </button>
              <button
                onClick={() => {
                  onNavigateCurrentIssue();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-white/5 hover:bg-white/10 text-white cursor-pointer"
              >
                Edición Actual
              </button>
              <button
                onClick={() => {
                  onNavigateArchive();
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-white/5 hover:bg-white/10 text-white cursor-pointer"
              >
                Catálogo & Archivo
              </button>
              <button
                onClick={() => {
                  onChangeRole('author');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-teal-500/20 text-teal-300 border border-teal-500/30 cursor-pointer font-semibold"
              >
                Enviar Artículo
              </button>
              <button
                onClick={() => {
                  onOpenModal('guidelines');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-white/5 hover:bg-white/10 text-white cursor-pointer"
              >
                Guía de Autores
              </button>
              <button
                onClick={() => {
                  onOpenModal('about');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-left bg-white/5 hover:bg-white/10 text-white cursor-pointer"
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
