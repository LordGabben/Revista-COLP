import React, { useState } from 'react';
import { 
  BookOpen, 
  Shield, 
  PenTool, 
  ClipboardCheck, 
  GraduationCap, 
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
  Crown,
  Handshake
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
  onNavigateArchive?: () => void;
  onNavigatePartners: () => void;
  currentView?: 'home' | 'partners';
  currentUser: AuthUser | null;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
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
  onNavigatePartners,
  currentView = 'home',
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
    <header className="sticky top-3 sm:top-4 z-50 mx-auto max-w-7xl px-4 w-full" id="app-header">
      
      {/* Floating Island Container with Glassmorphism and Volumetric Edge */}
      <div className="backdrop-blur-md bg-slate-950/80 border border-slate-800 rounded-2xl shadow-[0_10px_35px_-5px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.08)] ring-1 ring-white/5 transition-all">
        
        {/* Main Header Row */}
        <div className="flex items-center justify-between w-full px-4 sm:px-6 py-2.5 gap-2 sm:gap-4">
          
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
                <span className="font-serif text-base sm:text-lg lg:text-xl font-black text-white tracking-tight group-hover:text-cyan-200 transition-colors">
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

          {/* Center Navigation Links (Harmonious & Responsive Spacing) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs md:text-sm font-medium text-slate-300 shrink">
            <button
              onClick={onNavigateHome}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                currentRole === 'reader' && currentView === 'home'
                  ? 'bg-white/10 text-white shadow-xs font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Portada
            </button>
            <button
              onClick={onNavigateCurrentIssue}
              className="px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5"
            >
              Edición Actual
            </button>
            <button
              onClick={onNavigatePartners}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'partners'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Handshake className="w-3.5 h-3.5 text-cyan-400" />
              <span>Partners</span>
            </button>
            <button
              onClick={() => onOpenModal('guidelines')}
              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
            >
              Guía de Autores
            </button>
            <button
              onClick={() => onOpenModal('about')}
              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer whitespace-nowrap"
            >
              Comité Editorial
            </button>

            {currentUser?.role === 'superadmin' && (
              <button
                onClick={() => onChangeRole('superadmin')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  currentRole === 'superadmin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold'
                    : 'text-purple-400 hover:bg-purple-500/10'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>SuperAdmin CMS</span>
              </button>
            )}
          </nav>

          {/* Right Utility: Authentication / User Island / CMS Access */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all border border-slate-700/70 hover:border-slate-600 cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Iniciar Sesión</span>
                </button>

                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-teal-400 hover:opacity-95 shadow-sm shadow-cyan-950/40 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                  <span>Crear Cuenta</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 pb-4 pt-2 border-t border-white/10 space-y-3 fade-in">
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
                  onNavigatePartners();
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 cursor-pointer ${
                  currentView === 'partners'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold'
                    : 'bg-white/5 hover:bg-white/10 text-white'
                }`}
              >
                <Handshake className="w-4 h-4 text-cyan-400" />
                <span>Partners</span>
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
                className="p-2.5 rounded-xl text-left bg-white/5 hover:bg-white/10 text-white cursor-pointer col-span-2 sm:col-span-1"
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
