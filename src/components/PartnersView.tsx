import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  ExternalLink, 
  Handshake, 
  PlusCircle, 
  Globe2, 
  Sparkles, 
  ShieldCheck, 
  Mail, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Send,
  Award,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { Partner } from '../types';
import { getPartners } from '../services/partnersService';

interface PartnersViewProps {
  onNavigateHome: () => void;
  onNavigateCurrentIssue?: () => void;
}

export default function PartnersView({ onNavigateHome, onNavigateCurrentIssue }: PartnersViewProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  // Join modal form state
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [partnerType, setPartnerType] = useState('Auspiciador Comercial');
  const [proposalMessage, setProposalMessage] = useState('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  // Scroll revelation observer
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getPartners()
      .then((data) => {
        if (isMounted) {
          setPartners(data);
        }
      })
      .catch((err) => {
        console.warn('[PartnersView] Error cargando partners:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Intersection Observer for fluid scroll revelations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-reveal-id');
            if (id) {
              setVisibleElements((prev) => new Set(prev).add(id));
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const elements = document.querySelectorAll('[data-reveal-id]');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [partners, loading, filter]);

  const filteredPartners = partners.filter((p) => {
    if (filter === 'all') return true;
    return (p.category || 'Institucional').toLowerCase().includes(filter.toLowerCase());
  });

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProposal(true);

    setTimeout(() => {
      setIsSubmittingProposal(false);
      setProposalSubmitted(true);
      setTimeout(() => {
        setProposalSubmitted(false);
        setIsJoinModalOpen(false);
        setCompanyName('');
        setContactPerson('');
        setContactEmail('');
        setContactPhone('');
        setProposalMessage('');
      }, 2500);
    }, 1000);
  };

  const handleOpenDirectEmail = () => {
    const subject = encodeURIComponent(`Solicitud de Alianza / Patrocinio COLP - ${companyName || 'Nueva Empresa'}`);
    const body = encodeURIComponent(
      `Estimado Comité Editorial y Directiva del COLP (Scientia Dentis):\n\n` +
      `Nos ponemos en contacto para manifestar nuestro interés en formar parte de la Red de Partners de la Revista Científica Scientia Dentis.\n\n` +
      `Institución / Empresa: ${companyName || '[Nombre]'}\n` +
      `Contacto: ${contactPerson || '[Nombre]'}\n` +
      `Correo: ${contactEmail || '[Email]'}\n` +
      `Teléfono: ${contactPhone || '[Teléfono]'}\n` +
      `Tipo de Alianza: ${partnerType}\n\n` +
      `Mensaje: ${proposalMessage || 'Deseamos coordinar una reunión para conocer las modalidades de patrocinio y cooperación académica.'}\n\n` +
      `Saludos cordiales.`
    );
    window.open(`mailto:admcentralcolp@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  const handleOpenDirectWhatsApp = () => {
    const text = encodeURIComponent(
      `Hola COLP / Scientia Dentis, estoy interesado en participar como Partner / Auspiciador Estratégico. Empresa: ${companyName || 'Institución'}. Contacto: ${contactPerson || 'Representante'}.`
    );
    window.open(`https://wa.me/59177700000?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-12 pb-16 fade-in" id="partners-view-root">
      
      {/* 1. HERO HEADER SECTION */}
      <section 
        data-reveal-id="hero-header"
        className={`text-center max-w-4xl mx-auto space-y-5 transition-all duration-700 ease-out ${
          visibleElements.has('hero-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono transition-all border border-white/5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Portada</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/90 via-slate-900/90 to-teal-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Red de Cooperación Científica & Patrocinio</span>
          </div>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
          Nuestros Partners & <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">Auspiciadores Estratégicos</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-3xl mx-auto">
          Scientia Dentis colabora activamente con universidades, sociedades científicas estomatológicas, 
          laboratorios de biomateriales y empresas líderes de la industria dental. Juntos garantizamos 
          el modelo de <strong>Ciencia Abierta Diamante (sin APC)</strong>, asegurando acceso libre y 
          preservación permanente del conocimiento odontológico boliviano y latinoamericano.
        </p>

        {/* Filter Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-semibold'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border-white/10 hover:bg-white/5'
            }`}
          >
            Todos ({partners.length})
          </button>
          <button
            onClick={() => setFilter('Institucional')}
            className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'Institucional'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-semibold'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border-white/10 hover:bg-white/5'
            }`}
          >
            Institucionales
          </button>
          <button
            onClick={() => setFilter('Académico')}
            className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'Académico'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-semibold'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border-white/10 hover:bg-white/5'
            }`}
          >
            Universidades & Académicos
          </button>
          <button
            onClick={() => setFilter('Auspiciador')}
            className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'Auspiciador'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-semibold'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border-white/10 hover:bg-white/5'
            }`}
          >
            Auspiciadores Comerciales
          </button>
        </div>
      </section>

      {/* 2. PARTNERS GRID WITH FLUID SCROLL REVELATION */}
      <section className="max-w-7xl mx-auto px-2">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-cyan-300">Cargando red de aliados estratégicos desde Supabase...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* REGISTERED PARTNER CARDS */}
            {filteredPartners.map((partner, index) => {
              const revealId = `partner-card-${partner.id}`;
              const isVisible = visibleElements.has(revealId);
              const delayClass = `delay-[${(index % 6) * 100}ms]`;

              const CardContent = (
                <div 
                  data-reveal-id={revealId}
                  className={`group relative rounded-3xl p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 transition-all duration-700 ease-out hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.18)] flex flex-col justify-between h-full ${delayClass} ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  {/* Subtle top glow on hover */}
                  <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Logo Container with Monochromatic Neutral Filter */}
                  <div className="w-full h-36 rounded-2xl bg-slate-950/80 border border-white/5 p-5 flex items-center justify-center relative overflow-hidden group-hover:border-cyan-500/30 transition-colors">
                    <img 
                      src={partner.logo_url} 
                      alt={partner.name}
                      className="max-h-24 max-w-[85%] object-contain filter grayscale contrast-125 opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                      onError={(e) => {
                        // Fallback placeholder if custom image fails
                        (e.target as HTMLImageElement).src = '/colp_logo.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-radial from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>

                  {/* Partner Metadata */}
                  <div className="mt-5 space-y-2 flex-grow">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                        {partner.category || 'Institucional'}
                      </span>
                      {partner.website_url && (
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                          <span>Web Oficial</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-white text-base sm:text-lg group-hover:text-cyan-200 transition-colors leading-snug">
                      {partner.name}
                    </h3>
                  </div>

                  {/* Bottom link or info */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span className="text-[11px] font-mono flex items-center gap-1.5 text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Aliado Oficial COLP</span>
                    </span>

                    {partner.website_url ? (
                      <span className="text-[11px] font-mono text-cyan-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        <span>Visitar</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-600">Alianza Activa</span>
                    )}
                  </div>
                </div>
              );

              if (partner.website_url) {
                return (
                  <a
                    key={partner.id}
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-3xl"
                  >
                    {CardContent}
                  </a>
                );
              }

              return (
                <div key={partner.id}>
                  {CardContent}
                </div>
              );
            })}

            {/* 3. EXACTLY TWO INVITATION CARDS ("¿Quieres ser nuestro partner?") */}
            {/* INVITATION CARD 1: EMPRESAS & CASAS COMERCIALES */}
            <div
              data-reveal-id="invite-card-1"
              onClick={() => {
                setPartnerType('Auspiciador Comercial');
                setIsJoinModalOpen(true);
              }}
              className={`group cursor-pointer rounded-3xl p-6 border-2 border-dashed border-slate-700/80 hover:border-cyan-400 bg-slate-900/30 hover:bg-slate-800/40 transition-all duration-700 ease-out flex flex-col justify-between text-center relative overflow-hidden shadow-lg ${
                visibleElements.has('invite-card-1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="my-auto py-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <Handshake className="w-7 h-7 text-cyan-400" />
                </div>

                <div>
                  <h3 className="font-serif font-bold text-white text-lg group-hover:text-cyan-200 transition-colors">
                    ¿Quieres ser nuestro partner?
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                    Impulsa la visibilidad de tu marca odontológica o laboratorio en la revista científica de mayor alcance de La Paz.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-cyan-950/50 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                    <span>Únete aquí →</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500">
                Patrocinio Diamante, Oro & Simposios
              </div>
            </div>

            {/* INVITATION CARD 2: UNIVERSIDADES & SOCIEDADES CIENTÍFICAS */}
            <div
              data-reveal-id="invite-card-2"
              onClick={() => {
                setPartnerType('Convenio Universitario / Académico');
                setIsJoinModalOpen(true);
              }}
              className={`group cursor-pointer rounded-3xl p-6 border-2 border-dashed border-slate-700/80 hover:border-cyan-400 bg-slate-900/30 hover:bg-slate-800/40 transition-all duration-700 ease-out flex flex-col justify-between text-center relative overflow-hidden shadow-lg ${
                visibleElements.has('invite-card-2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="my-auto py-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-teal-300 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:bg-teal-500/20 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                  <PlusCircle className="w-7 h-7 text-teal-400" />
                </div>

                <div>
                  <h3 className="font-serif font-bold text-white text-lg group-hover:text-teal-200 transition-colors">
                    ¿Quieres ser nuestro partner?
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                    Convenios interinstitucionales para facultades de odontología, sociedades de especialidad e institutos de investigación.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-md shadow-teal-950/50 group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all">
                    <span>Únete aquí →</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 text-[10px] font-mono text-slate-500">
                Convenios Académicos & Arbitraje
              </div>
            </div>

          </div>
        )}
      </section>

      {/* 4. MODAL DE SOLICITUD DE PATROCINIO & ALIANZA ("ÚNETE AQUÍ") */}
      {isJoinModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl fade-in overflow-y-auto"
          onClick={() => setIsJoinModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 my-8 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950/90 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-md">
                  <Handshake className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Solicitud de Alianza & Patrocinio
                  </h3>
                  <p className="text-xs text-slate-400">
                    Scientia Dentis · Colegio de Odontólogos de La Paz (COLP)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {proposalSubmitted ? (
              <div className="py-12 text-center space-y-3 fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-serif text-xl font-bold text-white">¡Solicitud Registrada con Éxito!</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Gracias por tu interés en respaldar la investigación odontológica. El equipo directivo del COLP se pondrá en contacto a la brevedad.
                </p>
              </div>
            ) : (
              <form onSubmit={handleProposalSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Tipo de Alianza
                  </label>
                  <select
                    value={partnerType}
                    onChange={(e) => setPartnerType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  >
                    <option value="Auspiciador Comercial">Auspiciador Comercial (Casas Dentales / Biomateriales)</option>
                    <option value="Convenio Universitario / Académico">Convenio Universitario / Facultad de Odontología</option>
                    <option value="Sociedad Científica">Sociedad Científica Estomatológica</option>
                    <option value="Institucional">Organismo Institucional / Colegio Profesional</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Empresa o Institución *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ej. Straumann LatAm / UMSA"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Persona de Contacto *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Ej. Dr. Carlos Mendoza"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Correo Electrónico *
                    </label>
                    <input 
                      type="email" 
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contacto@empresa.com"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Teléfono / WhatsApp
                    </label>
                    <input 
                      type="text" 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+591 70000000"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Mensaje o Propuesta (Opcional)
                  </label>
                  <textarea 
                    rows={3}
                    value={proposalMessage}
                    onChange={(e) => setProposalMessage(e.target.value)}
                    placeholder="Detalles sobre el patrocinio, simposios de interés o modalidad de convenio..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                {/* Direct Action Triggers */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenDirectWhatsApp}
                      className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Contactar vía WhatsApp Directo"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">WhatsApp COLP</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenDirectEmail}
                      className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Enviar correo editorial directo"
                    >
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span className="hidden sm:inline">Email Editorial</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsJoinModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingProposal}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-cyan-950/50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingProposal ? (
                        <span>Enviando...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Solicitud</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
