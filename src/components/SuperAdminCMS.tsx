import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  UserCheck, 
  Key, 
  Lock, 
  Award, 
  ClipboardCheck, 
  PenTool, 
  GraduationCap, 
  Search, 
  Filter, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  Eye,
  Settings,
  Sparkles,
  BookOpen,
  ArrowRight,
  UserPlus,
  Trash2,
  Edit3,
  PlusCircle,
  Building,
  Globe2,
  X,
  Crown,
  RotateCcw
} from 'lucide-react';
import { AuthUser, UserRole, Article, EditorialMember } from '../types';
import { 
  fetchAllProfiles, 
  updateUserRole, 
  createOfficialAccount, 
  deleteUserProfile 
} from '../lib/supabase';
import { EDITORIAL_BOARD_MEMBERS } from '../data';

interface SuperAdminCMSProps {
  currentUser: AuthUser;
  articles: Article[];
  onSwitchPerspective: (role: UserRole) => void;
  editorialBoard: EditorialMember[];
  onUpdateEditorialBoard: (updated: EditorialMember[]) => void;
  onOpenEditorialModal?: () => void;
}

export default function SuperAdminCMS({
  currentUser,
  articles,
  onSwitchPerspective,
  editorialBoard,
  onUpdateEditorialBoard,
  onOpenEditorialModal
}: SuperAdminCMSProps) {
  // Navigation Tabs inside CMS
  const [activeTab, setActiveTab] = useState<'users' | 'editorial_board' | 'audit'>('users');

  // User Management State
  const [profiles, setProfiles] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Create Official Account Modal (Only for Reviewer or Editor)
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccRole, setNewAccRole] = useState<'reviewer' | 'editor'>('reviewer');
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPassword, setNewAccPassword] = useState('');
  const [newAccAffiliation, setNewAccAffiliation] = useState('Colegio de Odontólogos de La Paz (COLP)');
  const [newAccSpecialty, setNewAccSpecialty] = useState('Implantología Oral');
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Delete User Confirmation
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Editorial Member Modal (Add or Edit)
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memName, setMemName] = useState('');
  const [memRole, setMemRole] = useState('');
  const [memInstitution, setMemInstitution] = useState('');
  const [memCountry, setMemCountry] = useState('Bolivia');
  const [memSpecialty, setMemSpecialty] = useState('');
  const [memCategory, setMemCategory] = useState<'editorial' | 'advisory'>('editorial');
  const [editorialFilter, setEditorialFilter] = useState<'all' | 'editorial' | 'advisory'>('all');

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackNotice({ text, type });
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Error cargando perfiles en CMS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Update Role Handler
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUserId(userId);
    const success = await updateUserRole(userId, newRole);
    if (success) {
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
      showNotification(`Rol actualizado a "${newRole}" con éxito.`);
    } else {
      showNotification('No se pudo actualizar el rol.', 'error');
    }
    setUpdatingUserId(null);
  };

  // Create Official Account (Reviewer / Editor)
  const handleCreateOfficialAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccPassword.length < 6) {
      showNotification('La contraseña debe tener mínimo 6 caracteres.', 'error');
      return;
    }

    setCreatingAccount(true);
    try {
      const { user, error } = await createOfficialAccount({
        name: newAccName,
        email: newAccEmail,
        password: newAccPassword,
        role: newAccRole,
        affiliation: newAccAffiliation,
        specialty: newAccSpecialty
      });

      if (error || !user) {
        showNotification(error || 'Error al crear la cuenta oficial.', 'error');
      } else {
        setProfiles(prev => [user, ...prev]);
        showNotification(`Cuenta de ${newAccRole === 'editor' ? 'Editor en Jefe' : 'Revisor por Pares'} creada con éxito.`);
        setShowCreateAccountModal(false);
        // Reset form
        setNewAccName('');
        setNewAccEmail('');
        setNewAccPassword('');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error registrando cuenta.', 'error');
    } finally {
      setCreatingAccount(false);
    }
  };

  // Confirm Delete User
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    // Safety check: Cannot delete the creator account
    if (userToDelete.email.toLowerCase() === 'admcentralcolp@gmail.com') {
      showNotification('La cuenta principal del Director General / Creador no puede ser eliminada.', 'error');
      setUserToDelete(null);
      return;
    }

    setDeletingUser(true);
    try {
      const success = await deleteUserProfile(userToDelete.id);
      if (success) {
        setProfiles(prev => prev.filter(p => p.id !== userToDelete.id));
        showNotification(`La cuenta de ${userToDelete.name} (${userToDelete.email}) ha sido eliminada permanentemente.`);
      } else {
        showNotification('No se pudo eliminar el perfil de la base de datos.', 'error');
      }
    } catch (err: any) {
      showNotification('Error al eliminar usuario.', 'error');
    } finally {
      setDeletingUser(false);
      setUserToDelete(null);
    }
  };

  // Editorial Member: Open Add Modal
  const handleOpenAddMember = () => {
    setEditingMemberId(null);
    setMemName('');
    setMemRole('Editor Asociado');
    setMemInstitution('Colegio de Odontólogos de La Paz');
    setMemCountry('Bolivia');
    setMemSpecialty('Odontología General & Especialidades');
    setMemCategory('editorial');
    setShowMemberModal(true);
  };

  // Editorial Member: Open Edit Modal
  const handleOpenEditMember = (member: EditorialMember) => {
    setEditingMemberId(member.id);
    setMemName(member.name);
    setMemRole(member.role);
    setMemInstitution(member.institution);
    setMemCountry(member.country);
    setMemSpecialty(member.specialty);
    setMemCategory(member.category || 'editorial');
    setShowMemberModal(true);
  };

  // Editorial Member: Save (Add or Update)
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim() || !memRole.trim()) {
      showNotification('Complete el nombre y cargo del miembro.', 'error');
      return;
    }

    if (editingMemberId) {
      // Update existing
      const updated = editorialBoard.map(m => {
        if (m.id === editingMemberId) {
          return {
            ...m,
            name: memName.trim(),
            role: memRole.trim(),
            institution: memInstitution.trim(),
            country: memCountry.trim(),
            specialty: memSpecialty.trim(),
            category: memCategory
          };
        }
        return m;
      });
      onUpdateEditorialBoard(updated);
      showNotification(`Miembro "${memName}" actualizado con éxito.`);
    } else {
      // Add new
      const newMember: EditorialMember = {
        id: 'member_' + Date.now(),
        name: memName.trim(),
        role: memRole.trim(),
        institution: memInstitution.trim(),
        country: memCountry.trim(),
        specialty: memSpecialty.trim(),
        category: memCategory
      };
      const updated = [...editorialBoard, newMember];
      onUpdateEditorialBoard(updated);
      showNotification(`Nuevo miembro "${memName}" agregado al comité.`);
    }

    setShowMemberModal(false);
  };

  // Editorial Member: Delete
  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (confirm(`¿Desea remover a "${memberName}" del Cuerpo Editorial / Consejo Asesor?`)) {
      const updated = editorialBoard.filter(m => m.id !== memberId);
      onUpdateEditorialBoard(updated);
      showNotification(`Miembro "${memberName}" removido.`);
    }
  };

  // Editorial Member: Reset to Factory Defaults
  const handleResetEditorialBoard = () => {
    if (confirm('¿Desea restablecer el Cuerpo Editorial a los integrantes oficiales iniciales del COLP?')) {
      const defaultList: EditorialMember[] = EDITORIAL_BOARD_MEMBERS.map((m, idx) => ({
        id: 'default_colp_' + idx,
        name: m.name,
        role: m.role,
        institution: m.institution,
        country: m.country,
        specialty: m.specialty,
        category: m.role.toLowerCase().includes('asesor') ? 'advisory' : 'editorial'
      }));
      onUpdateEditorialBoard(defaultList);
      showNotification('Cuerpo Editorial restablecido a los valores oficiales de fábrica.');
    }
  };

  // Filtered users
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.affiliation && p.affiliation.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' ? true : p.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Filtered editorial members
  const filteredEditorialMembers = editorialBoard.filter(m => {
    if (editorialFilter === 'all') return true;
    return m.category === editorialFilter;
  });

  // Role Badge Helper
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return {
          label: 'Director General / Creador',
          class: 'bg-purple-950/80 text-purple-300 border-purple-500/40 shadow-purple-950/50',
          icon: Crown
        };
      case 'editor':
        return {
          label: 'Editor en Jefe',
          class: 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-amber-950/50',
          icon: Award
        };
      case 'reviewer':
        return {
          label: 'Revisor por Pares',
          class: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40 shadow-indigo-950/50',
          icon: ClipboardCheck
        };
      case 'author':
        return {
          label: 'Autor Investigador',
          class: 'bg-teal-950/80 text-teal-300 border-teal-500/40 shadow-teal-950/50',
          icon: PenTool
        };
      default:
        return {
          label: 'Lector / Público',
          class: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: GraduationCap
        };
    }
  };

  return (
    <div className="space-y-8 fade-in" id="superadmin-cms-dashboard">
      
      {/* CMS Top Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/40 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-400/50 text-purple-300 text-xs font-mono mb-2 shadow-xs">
              <Crown className="w-3.5 h-3.5 text-purple-400" />
              <span>Acceso Exclusivo de Creador · Control Central CMS</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Panel de Dirección General & Control Editorial
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1">
              Usuario Creador: <strong className="text-purple-300">{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
              title="Sincronizar directorio de usuarios con Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
              <span>Sincronizar Supabase</span>
            </button>
          </div>
        </div>

        {/* CMS Segmented Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 border border-purple-400/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios & Cuentas Oficiales ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('editorial_board')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'editorial_board'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 border border-purple-400/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Cuerpo Editorial & Consejo Asesor ({editorialBoard.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 border border-purple-400/40'
                : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Auditoría de Entornos</span>
          </button>
        </div>
      </div>

      {/* Dynamic Feedback Notification Banner */}
      {feedbackNotice && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 fade-in ${
          feedbackNotice.type === 'success' 
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200' 
            : 'bg-red-950/50 border-red-500/40 text-red-200'
        }`}>
          {feedbackNotice.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedbackNotice.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: GESTIÓN DE USUARIOS Y CUENTAS OFICIALES                            */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-5">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span>Directorio de Usuarios y Control de Credenciales</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Crea cuentas oficiales para el comité de revisores y editores, o elimina cuentas problemáticas.
              </p>
            </div>

            {/* Action to create official reviewer/editor account */}
            <button
              onClick={() => setShowCreateAccountModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-950/50 border border-purple-400/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Cuenta Oficial (Revisor / Editor)</span>
            </button>
          </div>

          {/* Table Filters & Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-3 border-t border-white/10">
            <div className="relative flex-1 md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo o filiación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-white/10 text-xs">
              {(['all', 'reviewer', 'editor', 'author'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg transition-all capitalize cursor-pointer text-[11px] ${
                    roleFilter === r
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'all' ? 'Todos' : r === 'reviewer' ? 'Revisores' : r === 'editor' ? 'Editores' : 'Autores'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] uppercase font-mono tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="p-3.5">Usuario / Identidad</th>
                  <th className="p-3.5">Filiación & Especialidad</th>
                  <th className="p-3.5">Rol / Privilegio</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/40">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No se encontraron usuarios en este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((user) => {
                    const badge = getRoleBadge(user.role);
                    const BadgeIcon = badge.icon;
                    const isCreator = user.email.toLowerCase() === 'admcentralcolp@gmail.com';

                    return (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        
                        {/* Name & Email */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-white shrink-0 ${
                              isCreator ? 'bg-purple-900 border-purple-400' : 'bg-slate-800 border-white/10'
                            }`}>
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isCreator && (
                                  <span className="text-[9px] font-mono bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/40">
                                    Creador
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">{user.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Affiliation & Specialty */}
                        <td className="p-3.5">
                          <p className="font-medium text-slate-200">{user.affiliation || 'Sin filiación especificada'}</p>
                          <p className="text-[10px] text-cyan-400 font-mono">{user.specialty || 'General'}</p>
                        </td>

                        {/* Current Role Badge & Selector */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${badge.class}`}>
                              <BadgeIcon className="w-3 h-3" />
                              <span>{badge.label}</span>
                            </span>

                            {!isCreator && (
                              <select
                                value={user.role}
                                disabled={updatingUserId === user.id}
                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                className="bg-slate-950 border border-white/15 rounded-xl px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none focus:border-purple-400 cursor-pointer"
                              >
                                <option value="reviewer">Revisor</option>
                                <option value="editor">Editor</option>
                                <option value="author">Autor</option>
                              </select>
                            )}
                          </div>
                        </td>

                        {/* Actions (Delete Account) */}
                        <td className="p-3.5 text-right">
                          {isCreator ? (
                            <span className="text-[10px] font-mono text-slate-500 px-2 py-1 rounded bg-white/5 border border-white/5">
                              Protegido
                            </span>
                          ) : (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1.5 text-[11px]"
                              title={`Eliminar cuenta de ${user.name}`}
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                              <span>Eliminar</span>
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CUERPO EDITORIAL & CONSEJO CIENTÍFICO ASESOR EDITABLE              */}
      {/* ========================================================================= */}
      {activeTab === 'editorial_board' && (
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Gestión de Cuerpo Editorial & Consejo Científico Asesor</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Edita los nombres reales, instituciones, países y cargos que se muestran en el pie de página y en el modal institucional.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetEditorialBoard}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                title="Restablecer a los integrantes iniciales COLP"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Restablecer COLP</span>
              </button>

              {onOpenEditorialModal && (
                <button
                  onClick={onOpenEditorialModal}
                  className="px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-xs text-cyan-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Ver cómo lo ven los lectores en el portal"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ver en Portal</span>
                </button>
              )}

              <button
                onClick={handleOpenAddMember}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-teal-600 hover:from-amber-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-amber-950/50 border border-amber-400/30 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Agregar Miembro</span>
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">Filtrar:</span>
            <button
              onClick={() => setEditorialFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                editorialFilter === 'all'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-white/10'
              }`}
            >
              Todos ({editorialBoard.length})
            </button>
            <button
              onClick={() => setEditorialFilter('editorial')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                editorialFilter === 'editorial'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-white/10'
              }`}
            >
              Cuerpo Editorial ({editorialBoard.filter(m => m.category !== 'advisory').length})
            </button>
            <button
              onClick={() => setEditorialFilter('advisory')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                editorialFilter === 'advisory'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-white/10'
              }`}
            >
              Consejo Científico Asesor ({editorialBoard.filter(m => m.category === 'advisory').length})
            </button>
          </div>

          {/* Members Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEditorialMembers.map((member) => (
              <div 
                key={member.id} 
                className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30">
                      {member.role}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Globe2 className="w-3 h-3 text-cyan-400" />
                      <span>{member.country}</span>
                    </span>
                  </div>

                  <h5 className="font-serif font-bold text-white text-sm sm:text-base mt-1">
                    {member.name}
                  </h5>

                  <p className="text-xs text-slate-300 mt-1 leading-snug">
                    {member.institution}
                  </p>

                  <p className="text-[11px] text-cyan-400 font-mono mt-2">
                    {member.specialty}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {member.category === 'advisory' ? 'Consejo Asesor' : 'Cuerpo Editorial'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditMember(member)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Editar datos de este miembro"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/70 text-red-300 hover:text-red-200 transition-all cursor-pointer"
                      title="Eliminar este miembro del comité"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDITORÍA DE ENTORNOS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-md space-y-4">
          <div>
            <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <span>Auditoría de Entornos (Supervisión sin Cerrar Sesión)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Como Director General y Creador, puedes ingresar directamente a cualquier sección operativa para fiscalizar artículos y dictámenes:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <button
              onClick={() => onSwitchPerspective('editor')}
              className="p-4 rounded-2xl bg-amber-950/30 hover:bg-amber-950/60 border border-amber-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-amber-300">Panel Editorial</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">Ver asignación de revisores y aprobación de volúmenes</p>
            </button>

            <button
              onClick={() => onSwitchPerspective('reviewer')}
              className="p-4 rounded-2xl bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-indigo-300">Panel de Revisor</span>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">Ver formularios de rúbricas y criterios de evaluación</p>
            </button>

            <button
              onClick={() => onSwitchPerspective('author')}
              className="p-4 rounded-2xl bg-teal-950/30 hover:bg-teal-950/60 border border-teal-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-teal-300">Panel de Autor</span>
                <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">Inspeccionar el proceso de subida y metadatos IMRyD</p>
            </button>

            <button
              onClick={() => onSwitchPerspective('reader')}
              className="p-4 rounded-2xl bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-cyan-300">Portal Público</span>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">Consultar la experiencia de lectores y descarga de PDF</p>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR CUENTA OFICIAL (REVISOR / EDITOR)                            */}
      {/* ========================================================================= */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md fade-in overflow-y-auto">
          <div 
            className="relative w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />
            
            <button
              onClick={() => setShowCreateAccountModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-purple-400" />
                <h4 className="font-serif text-xl font-bold text-white">
                  Crear Cuenta Oficial Institucional
                </h4>
              </div>
              <p className="text-xs text-slate-400 mb-5">
                Genera accesos autorizados para miembros del comité científico o directores editoriales.
              </p>

              <form onSubmit={handleCreateOfficialAccount} className="space-y-4">
                
                {/* Role selection: Only Reviewer or Editor */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Tipo de Cuenta Oficial
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAccRole('reviewer')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        newAccRole === 'reviewer'
                          ? 'bg-indigo-950/80 border-indigo-400 text-white font-semibold'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold text-indigo-300">Revisor por Pares</span>
                      <span className="block text-[10px] text-slate-400">Arbitraje a doble ciego</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewAccRole('editor')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        newAccRole === 'editor'
                          ? 'bg-amber-950/80 border-amber-400 text-white font-semibold'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="block text-xs font-bold text-amber-300">Editor en Jefe</span>
                      <span className="block text-[10px] text-slate-400">Aprobación y publicación</span>
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Nombre Completo & Grado Académico
                  </label>
                  <input
                    type="text"
                    required
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    placeholder="Ej. Dr. Mauricio Valenzuela, PhD"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Correo Electrónico Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={newAccEmail}
                    onChange={(e) => setNewAccEmail(e.target.value)}
                    placeholder="revisor.odontologia@universidad.edu"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Contraseña Inicial (Mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newAccPassword}
                    onChange={(e) => setNewAccPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Affiliation */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Filiación / Universidad / Hospital
                  </label>
                  <input
                    type="text"
                    required
                    value={newAccAffiliation}
                    onChange={(e) => setNewAccAffiliation(e.target.value)}
                    placeholder="Colegio de Odontólogos de La Paz (COLP)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Specialty */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Especialidad Odontológica
                  </label>
                  <input
                    type="text"
                    value={newAccSpecialty}
                    onChange={(e) => setNewAccSpecialty(e.target.value)}
                    placeholder="Ej. Implantología Oral, Endodoncia, Periodoncia..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateAccountModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingAccount}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-950/50 cursor-pointer disabled:opacity-50"
                  >
                    {creatingAccount ? 'Guardando en Supabase...' : 'Crear y Habilitar Cuenta'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ELIMINAR USUARIO CONFIRMACIÓN                                      */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md fade-in">
          <div 
            className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-full bg-red-950 border border-red-500/30">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-white">¿Eliminar cuenta de usuario?</h4>
                <p className="text-xs text-slate-400">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-white/10 leading-relaxed">
              Está a punto de revocar y eliminar permanentemente la cuenta de:
              <br />
              <strong className="text-white block mt-1 text-sm">{userToDelete.name}</strong>
              <span className="font-mono text-cyan-400 text-[11px] block">{userToDelete.email}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Rol actual: {userToDelete.role}</span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deletingUser}
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {deletingUser ? 'Eliminando...' : 'Sí, Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AGREGAR O EDITAR MIEMBRO DEL CUERPO EDITORIAL                      */}
      {/* ========================================================================= */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md fade-in overflow-y-auto">
          <div 
            className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h4 className="font-serif text-lg font-bold text-white">
                  {editingMemberId ? 'Editar Miembro del Comité' : 'Agregar Nuevo Miembro al Comité'}
                </h4>
              </div>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Categoría
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMemCategory('editorial')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      memCategory === 'editorial'
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 font-semibold'
                        : 'bg-slate-950 border-white/10 text-slate-400'
                    }`}
                  >
                    Cuerpo Editorial
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemCategory('advisory')}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      memCategory === 'advisory'
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 font-semibold'
                        : 'bg-slate-950 border-white/10 text-slate-400'
                    }`}
                  >
                    Consejo Científico Asesor
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Nombre Completo & Títulos Académicos
                </label>
                <input
                  type="text"
                  required
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  placeholder="Ej. Dra. Beatriz Villalobos, PhD"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Cargo / Rol Editorial
                </label>
                <input
                  type="text"
                  required
                  value={memRole}
                  onChange={(e) => setMemRole(e.target.value)}
                  placeholder="Ej. Editora en Jefa, Editor Asociado - Implantes..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Institución / Universidad / Hospital
                </label>
                <input
                  type="text"
                  required
                  value={memInstitution}
                  onChange={(e) => setMemInstitution(e.target.value)}
                  placeholder="Colegio de Odontólogos de La Paz (COLP)"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    required
                    value={memCountry}
                    onChange={(e) => setMemCountry(e.target.value)}
                    placeholder="Bolivia, Chile, Brasil..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Especialidad Científica
                  </label>
                  <input
                    type="text"
                    required
                    value={memSpecialty}
                    onChange={(e) => setMemSpecialty(e.target.value)}
                    placeholder="Biomateriales y Restauradora..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md cursor-pointer"
                >
                  {editingMemberId ? 'Guardar Cambios' : 'Agregar al Comité'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
