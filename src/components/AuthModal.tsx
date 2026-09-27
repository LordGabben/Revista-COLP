import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Award, 
  Shield, 
  PenTool, 
  ClipboardCheck, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { loginUser, registerAuthor } from '../lib/supabase';
import logoImg from '../assets/images/scientia_dentis_logo_1788278899814.jpg';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login'
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [specialty, setSpecialty] = useState('Implantología Oral');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPredefinedCredentials, setShowPredefinedCredentials] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { user, error } = await loginUser(email.trim(), password);
      if (error || !user) {
        setErrorMsg(error || 'Credenciales incorrectas. Verifique su email y contraseña.');
      } else {
        setSuccessMsg(`¡Bienvenido/a ${user.name}!`);
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión con el servicio de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const { user, error } = await registerAuthor({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        affiliation: affiliation.trim(),
        specialty
      });

      if (error || !user) {
        setErrorMsg(error || 'No se pudo completar el registro. Intente nuevamente.');
      } else {
        setSuccessMsg('¡Cuenta de Autor creada con éxito en Supabase!');
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error registrando la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (loginEmail: string, pass: string) => {
    setEmail(loginEmail);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-400" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Header with Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e9e5db] border border-cyan-400/40 p-0.5 shrink-0 flex items-center justify-center shadow-md">
              <img 
                src={logoImg} 
                alt="COLP Logo" 
                className="w-full h-full object-contain mix-blend-multiply" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Scientia Dentis
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300 font-semibold">
                  COLP Auth
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Sistema Editorial & Arbitraje Científico Odontológico
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 rounded-2xl border border-white/10 mb-6">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Crear Cuenta de Autor</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORM: INICIAR SESIÓN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                  Correo Electrónico Institucional o Personal
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@odontocentro.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-950/50 border border-cyan-400/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Sistema Editorial</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Pre-assigned accounts quick login section */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPredefinedCredentials(!showPredefinedCredentials)}
                  className="w-full py-1.5 text-xs text-cyan-400 hover:text-cyan-300 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-mono">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Cuentas Oficiales Preasignadas (Acceso Rápido)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {showPredefinedCredentials ? 'Ocultar' : 'Ver Accesos'}
                  </span>
                </button>

                {showPredefinedCredentials && (
                  <div className="mt-2 space-y-2 fade-in">
                    {/* SuperAdmin: Director General / Creador */}
                    <div 
                      onClick={() => setDemoCredentials('admcentralcolp@gmail.com', 'ScientiaCOLP2026!')}
                      className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-purple-400/60 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Director General / Creador (SuperAdmin)</p>
                          <p className="text-[10px] font-mono text-purple-300">admcentralcolp@gmail.com</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">
                        Autocompletar
                      </span>
                    </div>

                    {/* Editor */}
                    <div 
                      onClick={() => setDemoCredentials('editor@scientiadentis.org', 'EditorCOLP2026!')}
                      className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Editora en Jefa (Dra. Villalobos)</p>
                          <p className="text-[10px] font-mono text-amber-300">editor@scientiadentis.org</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                        Autocompletar
                      </span>
                    </div>

                    {/* Reviewer */}
                    <div 
                      onClick={() => setDemoCredentials('revisor@scientiadentis.org', 'RevisorCOLP2026!')}
                      className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 hover:border-indigo-400/60 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-indigo-400" />
                        <div>
                          <p className="text-xs font-bold text-white">Revisor por Pares (Dra. Mendoza)</p>
                          <p className="text-[10px] font-mono text-indigo-300">revisor@scientiadentis.org</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/30">
                        Autocompletar
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* FORM: REGISTRO DE AUTOR INVESTIGADOR */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                  Nombre Completo y Títulos Académicos
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Dr. Mauricio Valenzuela, PhD"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                  Correo Electrónico (Para notificaciones de arbitraje)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="autor.investigador@universidad.edu"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                  Filiación Institucional / Universidad / Hospital
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    placeholder="Ej. Facultad de Odontología, COLP La Paz"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                  Especialidad Odontológica Primaria
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all"
                >
                  <option value="Implantología Oral">Implantología Oral</option>
                  <option value="Endodoncia">Endodoncia</option>
                  <option value="Periodoncia">Periodoncia</option>
                  <option value="Ortodoncia y Ortopedia Maxilar">Ortodoncia y Ortopedia Maxilar</option>
                  <option value="Odontopediatría">Odontopediatría</option>
                  <option value="Odontología Restauradora y Estética">Odontología Restauradora y Estética</option>
                  <option value="Patología y Medicina Oral">Patología y Medicina Oral</option>
                  <option value="Cirugía Maxilofacial">Cirugía Maxilofacial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">
                  Contraseña (Mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                Al registrarse, acepta las directrices éticas de arbitraje ciego y la política de Acceso Abierto Libre (CC BY 4.0) de Scientia Dentis COLP.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-950/50 border border-teal-400/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creando cuenta en Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Registrar Cuenta de Autor Investigador</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
