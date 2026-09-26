import React from 'react';
import { BookOpen, User as UserIcon, Shield, PenTool, ClipboardCheck, GraduationCap, RefreshCw } from 'lucide-react';
import { UserRole, JournalConfig } from '../types';
import logoImg from '../assets/images/scientia_dentis_logo_1788278899814.jpg';

interface HeaderProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  journalInfo: JournalConfig;
}

export default function Header({ currentRole, onChangeRole, journalInfo }: HeaderProps) {
  // Define mock users for each role
  const mockUsers: Record<UserRole, { name: string; title: string; institution: string; icon: any; color: string }> = {
    reader: {
      name: "Invitado Académico",
      title: "Lector / Investigador",
      institution: "Público General",
      icon: GraduationCap,
      color: "bg-slate-100 text-slate-800 border-slate-200"
    },
    author: {
      name: "Dr. Gonzalo Martínez-Rojas",
      title: "Autor Principal",
      institution: "Colegio de Odontólogos de La Paz",
      icon: PenTool,
      color: "bg-teal-50 text-teal-800 border-teal-200"
    },
    reviewer: {
      name: "Dra. Sofía Mendoza, PhD",
      title: "Revisora Científica (Par)",
      institution: "Comité de Bioética & Arbitraje COLP",
      icon: ClipboardCheck,
      color: "bg-indigo-50 text-indigo-800 border-indigo-200"
    },
    editor: {
      name: "Dra. Beatriz Villalobos, PhD",
      title: "Editora Jefa (Scientia Dentis)",
      institution: "Colegio de Odontólogos de La Paz (COLP)",
      icon: Shield,
      color: "bg-amber-50 text-amber-800 border-amber-200"
    }
  };

  const activeUser = mockUsers[currentRole];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" id="app-header">
      {/* Simulation/Role Selector Banner */}
      <div className="bg-slate-950 text-white py-2 px-4 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">
              Entorno OJS Simulado: <strong className="text-white font-serif">Scientia Dentis</strong> • Órgano Oficial del COLP
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
            <span className="text-slate-400 mr-1.5 font-medium">Cambiar de Panel:</span>
            {(['reader', 'author', 'reviewer', 'editor'] as UserRole[]).map((role) => {
              const info = mockUsers[role];
              const isSelected = currentRole === role;
              const IconComp = info.icon;
              return (
                <button
                  key={role}
                  id={`btn-role-${role}`}
                  onClick={() => onChangeRole(role)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer font-medium whitespace-nowrap ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-xs scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span className="capitalize text-[11px]">{role === 'reader' ? 'Público' : role === 'author' ? 'Autor' : role === 'reviewer' ? 'Revisor' : 'Editor'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Official Circular Seal Logo */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-brand-800 shadow-md bg-[#e9e5db] flex items-center justify-center transition-transform group-hover:scale-105">
                <img 
                  src={logoImg} 
                  alt="Scientia Dentis - Órgano Oficial del Colegio de Odontólogos de La Paz" 
                  className="w-full h-full object-contain mix-blend-multiply"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-[10px] font-semibold tracking-wider font-mono">
                  {journalInfo.issn}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {journalInfo.institution}
                </span>
              </div>

              <div className="mt-0.5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Scientia Dentis
                  </h1>
                  <span className="font-serif italic text-sm sm:text-base font-semibold text-brand-700">
                    "Revista Científica"
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-600 tracking-normal">
                  Órgano Oficial del Colegio de Odontólogos de La Paz
                </p>
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className={`flex items-center gap-3 px-4 py-2 border rounded-xl shadow-xs shrink-0 transition-all ${activeUser.color}`} id="active-user-profile">
            <div className="p-1.5 bg-white/80 rounded-lg">
              <activeUser.icon className="w-5 h-5 text-current" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 font-mono">
                {activeUser.title}
              </p>
              <h4 className="font-semibold text-slate-900 text-xs">
                {activeUser.name}
              </h4>
              <p className="text-[10px] text-slate-600">
                {activeUser.institution}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

