import React, { useState, useEffect, useRef } from 'react';
import { Headset, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

/**
 * 3D WhatsApp Icon with realistic depth, glossy reflection, and brand gradients.
 * Supports 'green' (Konsultasi) and 'blue' (Loker/Karir).
 */
function WhatsApp3DIcon({ variant = 'green', className = 'w-12 h-12' }) {
  const isBlue = variant === 'blue';
  const gradId = isBlue ? 'wa3dGradBlue' : 'wa3dGradGreen';
  const highlightId = isBlue ? 'wa3dHighlightBlue' : 'wa3dHighlightGreen';
  const shadowId = isBlue ? 'wa3dDropBlue' : 'wa3dDropGreen';

  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={gradId} cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor={isBlue ? '#38BDF8' : '#4EFA8B'} />
          <stop offset="50%" stopColor={isBlue ? '#0284C7' : '#25D366'} />
          <stop offset="100%" stopColor={isBlue ? '#0369A1' : '#128C7E'} />
        </radialGradient>
        <linearGradient id={highlightId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* 3D Sphere Base */}
      <circle cx="18" cy="18" r="16.5" fill={`url(#${gradId})`} />

      {/* 3D Top-edge Reflection Highlight */}
      <ellipse cx="18" cy="9.5" rx="10" ry="5" fill={`url(#${highlightId})`} />

      {/* Bottom Inner Shadow inside sphere */}
      <path
        d="M3 18C3 26.2843 9.71573 33 18 33C26.2843 33 33 26.2843 33 18C33 24 26.5 30.5 18 30.5C9.5 30.5 3 24 3 18Z"
        fill={isBlue ? '#075985' : '#0A5C52'}
        fillOpacity="0.4"
      />

      {/* WhatsApp Speech Bubble & Phone Symbol */}
      <path
        filter={`url(#${shadowId})`}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.8 22.2C26.4 22 24.4 21 24.1 20.8C23.7 20.6 23.5 20.5 23.2 20.9C22.9 21.3 22.1 22.3 21.9 22.5C21.6 22.8 21.4 22.8 21 22.6C20.6 22.4 19.3 21.9 17.8 20.6C16.6 19.5 15.8 18.2 15.6 17.8C15.4 17.4 15.6 17.1 15.8 16.9C16 16.7 16.2 16.4 16.4 16.2C16.6 16 16.7 15.8 16.8 15.6C16.9 15.4 16.8 15.1 16.7 14.9C16.6 14.7 15.9 12.8 15.6 12C15.3 11.2 15 11.3 14.7 11.3C14.5 11.3 14.2 11.3 14 11.3C13.7 11.3 13.3 11.4 12.9 11.8C12.6 12.2 11.6 13.2 11.6 15.1C11.6 17.1 13 18.9 13.2 19.2C13.4 19.4 16 23.4 20 25.1C21 25.5 21.7 25.7 22.3 25.9C23.3 26.2 24.1 26.2 24.8 26.1C25.5 26 27 25.2 27.3 24.2C27.6 23.3 27.6 22.5 27.5 22.3C27.4 22.2 27.2 22.3 26.8 22.2Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export default function FloatingAdminCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const containerRef = useRef(null);

  // Close WhatsApp popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Tampilkan tombol Back To Top jika scroll telah melewati minimal setengah layar tampilan
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight / 2);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll back to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none pointer-events-auto"
      aria-label="Kontak Admin dan Navigasi PT. BARAK"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. ADMIN CTA GROUP (POPOVER WA + TOMBOL HEADSET ADMIN)
      ────────────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex flex-col items-end"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* POPOVER ACTION BUTTONS (WA KONSULTASI & WA LOKER) */}
        <div
          className={clsx(
            'flex flex-col items-end gap-3.5 mb-3.5 transition-all duration-300 ease-out',
            isOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-5 pointer-events-none'
          )}
        >
          {/* 1.1 Tombol WA Konsultasi (Atas) */}
          <a
            href="https://wa.me/6285124799305"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group/item focus-visible:outline-none"
            title="Chat WhatsApp Konsultasi Layanan"
          >
            {/* Label Pill: Border Hijau, Background Putih, Teks Ink Jelas */}
            <div className="bg-white border-2 border-[#25D366] py-1.5 px-4 rounded-full shadow-lg transition-transform duration-200 group-hover/item:scale-102 flex flex-col items-end text-right">
              <span className="text-xs sm:text-sm text-[#0F172A] tracking-tight leading-tight">
                Chat Konsultasi
              </span>
            </div>

            {/* 3D Circular Button: WhatsApp Hijau (w-12 h-12 mr-1, Terpusat dengan Trigger) */}
            <div className="relative w-12 h-12 mr-1 rounded-full flex items-center justify-center flex-none transition-transform duration-200 group-hover/item:scale-110 active:scale-95 shadow-[0_6px_16px_rgba(37,211,102,0.45)]">
              <WhatsApp3DIcon variant="green" className="w-12 h-12" />
            </div>
          </a>

          {/* 1.2 Tombol WA Loker (Bawah/Tengah) */}
          <a
            href="https://wa.me/6285174334336"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group/item focus-visible:outline-none"
            title="Chat WhatsApp Lowongan Kerja / Karir"
          >
            {/* Label Pill: Border Hijau, Background Putih, Teks Ink Jelas */}
            <div className="bg-white border-2 border-[#25D366] py-1.5 px-4 rounded-full shadow-lg transition-transform duration-200 group-hover/item:scale-102 flex flex-col items-end text-right">
              <span className="text-xs sm:text-sm text-[#0F172A] tracking-tight leading-tight">
                Chat Loker
              </span>
            </div>

            {/* 3D Circular Button: WhatsApp Hijau (Ukuran Sama Besar w-12 h-12 mr-1) */}
            <div className="relative w-12 h-12 mr-1 rounded-full flex items-center justify-center flex-none transition-transform duration-200 group-hover/item:scale-110 active:scale-95 shadow-[0_6px_16px_rgba(37,211,102,0.45)]">
              <WhatsApp3DIcon variant="green" className="w-12 h-12" />
            </div>
          </a>
        </div>

        {/* MAIN TRIGGER BUTTON: ICON ADMIN (HEADSET) 3 DIMENSI */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Bantuan Admin PT. BARAK via WhatsApp"
          className={clsx(
            'relative w-14 h-14 rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-300',
            'bg-gradient-to-b from-[#10B981] via-[#059669] to-[#047857]',
            'shadow-[0_8px_24px_rgba(16,185,129,0.5),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.3)]',
            'hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300'
          )}
        >
          {/* Pulsing Beacon Ring (Menarik Perhatian) */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-40 animate-ping pointer-events-none" />
          )}

          {/* 3D Glossy Reflection on Top Half */}
          <span className="absolute inset-x-2 top-1 h-5 rounded-t-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

          {/* Icon Admin (Headset) TETAP TERLIHAT (Bukan tanda X) */}
          <Headset className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] transition-transform duration-200 group-hover:scale-108" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOMBOL CTA "BACK TO TOP" (3 DIMENSI)
          Default: hidden
          Tampil saat scroll minimal setengah layar tampilan (> window.innerHeight / 2)
          Posisi: Di bawah tombol Admin
          Background: Primary-Red (#BA1D23)
          Panah Atas: Primary-Yellow (#F9CE3B)
      ────────────────────────────────────────────────────────────── */}
      <div
        className={clsx(
          'transition-all duration-300 ease-out flex items-center justify-center',
          showBackToTop
            ? 'max-h-16 opacity-100 mt-3 pointer-events-auto'
            : 'max-h-0 opacity-0 mt-0 pointer-events-none overflow-hidden'
        )}
      >
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Kembali ke bagian atas halaman"
          title="Kembali ke Atas"
          className={clsx(
            'group/top relative w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300',
            'bg-gradient-to-b from-[#EF4444] via-[#BA1D23] to-[#881317]',
            'shadow-[0_8px_24px_rgba(186,29,35,0.48),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.35)]',
            'hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400'
          )}
        >
          {/* 3D Glossy Reflection on Top Half */}
          <span className="absolute inset-x-2 top-1 h-5 rounded-t-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

          {/* Panah Atas Warna Primary-Yellow (#F9CE3B) */}
          <ChevronUp className="w-7 h-7 sm:w-8 sm:h-8 text-[#F9CE3B] stroke-[3] drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover/top:-translate-y-1" />
        </button>
      </div>
    </div>
  );
}
