import React, { useState, useEffect, useRef } from 'react';
import colpVectorSvg from '../assets/images/colp_vector_logo.svg';
import { Upload, RotateCcw } from 'lucide-react';

interface ColpLogoProps {
  className?: string;
  allowUpload?: boolean;
  alt?: string;
}

export default function ColpLogo({ 
  className = "w-12 h-12", 
  allowUpload = false,
  alt = "Colegio de Odontólogos de La Paz" 
}: ColpLogoProps) {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom logo from localStorage if user previously selected their exact PNG file
  useEffect(() => {
    const saved = localStorage.getItem('colp_custom_logo');
    if (saved) {
      setCustomLogoUrl(saved);
    }

    // Listen for custom logo updates across components
    const handleLogoUpdate = (e: CustomEvent<string | null>) => {
      setCustomLogoUrl(e.detail);
    };

    window.addEventListener('colp_logo_updated' as any, handleLogoUpdate as any);
    return () => {
      window.removeEventListener('colp_logo_updated' as any, handleLogoUpdate as any);
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setCustomLogoUrl(dataUrl);
        try {
          localStorage.setItem('colp_custom_logo', dataUrl);
          // Broadcast to all other logo instances (CoverHero, Footer, Header)
          window.dispatchEvent(new CustomEvent('colp_logo_updated', { detail: dataUrl }));
        } catch (err) {
          console.error('Error guardando logo en LocalStorage:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefault = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem('colp_custom_logo');
    setCustomLogoUrl(null);
    window.dispatchEvent(new CustomEvent('colp_logo_updated', { detail: null }));
  };

  const currentSrc = customLogoUrl || colpVectorSvg;

  return (
    <div className={`relative group inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Real unadulterated logo image (Transparent background, no white margins) */}
      <img
        src={currentSrc}
        alt={alt}
        className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />

      {/* Hidden file input for uploading the user's exact PNG without alterations */}
      {allowUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,image/png,image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Interactive Floating Quick Upload Overlay on Hover for Admins/Editors */}
          <div className="absolute inset-0 bg-slate-950/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 backdrop-blur-xs cursor-pointer shadow-lg">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white transition-colors cursor-pointer"
              title="Cargar tu archivo oficial (LOGO TRANSPARENTE COLP.png)"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            {customLogoUrl && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="p-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors cursor-pointer"
                title="Restaurar emblema vectorial predeterminado"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
