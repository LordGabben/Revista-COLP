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
  Command,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
  Crown
} from 'lucide-react';
import { UserRole, JournalConfig, InstitutionalModalType, AuthUser } from '../types';
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
  currentUser: AuthUser | null;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
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
  onSearchChange,
  currentUser,
  onOpenAuthModal,
  onLogout
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
      roleTitle: currentUser?.name || "Autor Registrado",
      icon: PenTool,
      glowColor: "teal",
      pillClass: "bg-teal-950/60 text-teal-300 border-teal-500/30 shadow-teal-950/40"
    },
    reviewer: {
      label: "Revisor por Pares",
      roleTitle: currentUser?.name || "Comité Evaluador",
      icon: ClipboardCheck,
      glowColor: "indigo",
      pillClass: "bg-indigo-950/60 text-indigo-300 border-indigo-500/30 shadow-indigo-950/40"
    },
    editor: {
      label: "Editor en Jefe",
      roleTitle: currentUser?.name || "Dirección Editorial",
      icon: Shield,
      glowColor: "amber",
      pillClass: "bg-amber-950/60 text-amber-300 border-amber-500/30 shadow-amber-950/40"
    },
    superadmin: {
      label: "SuperAdmin CMS",
      roleTitle: currentUser?.name || "Administrador Master",
      icon: Crown,
      glowColor: "purple",
      pillClass: "bg-purple-950/80 text-purple-300 border-purple-500/40 shadow-purple-950/50"
    }
  };

  const currentRoleInfo = roleDetails[currentRole] || roleDetails.reader;
  const CurrentRoleIcon = currentRoleInfo.icon;

  const handleAuthorAction = () => {
    if (currentUser) {
      onChangeRole('author');
    } else {
      onOpenAuthModal('register');
    }
  };

  return (
    <header className="sticky top-3 sm:top-4 z-50 mx-auto max-w-7xl px-3 sm:px-6 w-full" id="app-header">
      
      {/* Floating Island Container with Glassmorphism and Volumetric Edge */}
      <div className="backdrop-blur-2xl bg-slate-950/80 border border-white/10 rounded-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.08)] ring-1 ring-white/5 transition-all">
        
        {/* Main Header Row */}
        <div className="px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 lg:gap-3 2xl:gap-6 min-w-0">
          
          {/* Brand Wordmark & Official Seal */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
            id="brand-logo-button"
          >
            {/* Glowing Ring Around Seal */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/40 via-blue-600/30 to-teal-400/40 rounded-full blur-xs opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-cyan-400/50 bg-[#e9e5db] shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
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
                <span className="font-serif text-base sm:text-lg 2xl:text-xl font-black text-white tracking-tight group-hover:text-cyan-200 transition-colors">
                  Scientia Dentis
                </span>
                <span className="font-serif italic text-xs sm:text-sm font-semibold text-cyan-400">
                  "Revista Científica"
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans tracking-wide flex items-center gap-1.5">
                <span>Órgano Oficial COLP</span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="text-slate-400 text-[10px] hidden sm:inline">La Paz, Bolivia</span>
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Higgsfield Clean Minimalist Style) */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 text-[11px] 2xl:text-xs font-medium text-slate-300 shrink">
            <button
              onClick={onNavigateHome}
              className={`px-2 2xl:px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                currentRole === 'reader'
                  ? 'bg-white/10 text-white shadow-xs font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Portada
            </button>
            <button
              onClick={onNavigateCurrentIssue}
              className="px-2 2xl:px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
            >
              Edición Actual
            </button>
            <button
              onClick={onNavigateArchive}
              className="px-2 2xl:px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
            >
              Catálogo & Archivo
            </button>
            <button
              onClick={() => onOpenModal('guidelines')}
              className="px-2 2xl:px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
            >
              Guía de Autores
            </button>
            <button
              onClick={() => onOpenModal('about')}
              className="px-2 2xl:px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
            >
              Comité Editorial
            </button>
            
            <button
              onClick={handleAuthorAction}
              className={`px-2 2xl:px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                currentRole === 'author' 
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold' 
                  : 'text-teal-400 hover:bg-teal-500/10'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Enviar Manuscrito</span>
            </button>

            {currentUser?.role === 'superadmin' && (
              <button
                onClick={() => onChangeRole('superadmin')}
                className={`px-2 2xl:px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  currentRole === 'superadmin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold'
                    : 'text-purple-400 hover:bg-purple-500/10'
                }`}
              >
                <Crown className="w-3 h-3" />
                <span>SuperAdmin CMS</span>
              </button>
            )}
          </nav>

          {/* Right Utility: Interactive Search + Authentication / User Island */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Quick Floating Search Input with Keyboard Badge (Shown on ultra-wide screens to prevent header overflow) */}
            {onSearchChange && (
              <div className="relative hidden 2xl:block w-36 2xl:w-44">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-8 pr-10 py-1.5 bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 bg-white/5 border border-white/10 rounded px-1 py-0.5 pointer-events-none flex items-center gap-0.5">
                  <Command className="w-2.5 h-2.5" /> K
                </span>
              </div>
            )}

            {/* Authenticated User Session / Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs shadow-md transition-all cursor-pointer ${currentRoleInfo.pillClass} hover:brightness-110 active:scale-95`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <CurrentRoleIcon className="w-3.5 h-3.5" />
                  <div className="text-left hidden sm:block">
                    <span className="block text-[9px] uppercase font-mono font-bold tracking-wider opacity-75">
                      {currentRoleInfo.label}
                    </span>
                    <span className="block font-semibold text-[11px] whitespace-nowrap max-w-[120px] truncate">
                      {currentUser.name}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 backdrop-blur-2xl bg-slate-950/95 border border-white/15 rounded-2xl shadow-2xl p-2 z-50 fade-in ring-1 ring-white/10"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    {/* User Profile Card */}
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-cyan-400/40 flex items-center justify-center font-bold text-white shrink-0">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-xs text-white truncate">{currentUser.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                          <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300 font-semibold uppercase">
                            {currentRoleInfo.label}
                          </span>
                        </div>
                      </div>
                      {currentUser.affiliation && (
                        <p className="text-[10px] text-slate-400 mt-2 border-t border-white/5 pt-1.5 truncate">
                          {currentUser.affiliation}
                        </p>
                      )}
                    </div>

                    {/* Navigation Shortcuts based on role */}
                    <div className="space-y-1 text-xs">
                      {currentUser.role === 'superadmin' && (
                        <button
                          onClick={() => {
                            onChangeRole('superadmin');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-purple-300 hover:bg-purple-950/50 hover:text-white transition-all cursor-pointer font-medium"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>SuperAdmin CMS</span>
                        </button>
                      )}

                      {currentUser.role === 'editor' && (
                        <button
                          onClick={() => {
                            onChangeRole('editor');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-amber-300 hover:bg-amber-950/50 hover:text-white transition-all cursor-pointer font-medium"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Panel de Edición en Jefe</span>
                        </button>
                      )}

                      {currentUser.role === 'reviewer' && (
                        <button
                          onClick={() => {
                            onChangeRole('reviewer');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-indigo-300 hover:bg-indigo-950/50 hover:text-white transition-all cursor-pointer font-medium"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          <span>Panel de Revisor por Pares</span>
                        </button>
                      )}

                      {(currentUser.role === 'author' || currentUser.role === 'superadmin') && (
                        <button
                          onClick={() => {
                            onChangeRole('author');
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-teal-300 hover:bg-teal-950/50 hover:text-white transition-all cursor-pointer font-medium"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Panel de Autor (Mis Artículos)</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onChangeRole('reader');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Vista de Lector Público</span>
                      </button>
                    </div>

                    {/* Logout Option */}
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-all cursor-pointer text-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Public / Guest Auth Buttons */
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/10 hover:border-cyan-400/40 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </button>

                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-cyan-950/40 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear Cuenta</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden px-4 pb-4 pt-2 border-t border-white/10 space-y-3 fade-in">
            {onSearchChange && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/70 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Buscar artículos..."
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
                  handleAuthorAction();
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

            {/* Mobile Auth actions */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              {currentUser ? (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="text-white font-semibold block">{currentUser.name}</span>
                    <span className="text-[10px] text-cyan-400 font-mono">{currentRoleInfo.label}</span>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => {
                      onOpenAuthModal('login');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-center font-medium"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuthModal('register');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-teal-600 text-white text-center font-semibold"
                  >
                    Crear Cuenta
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
