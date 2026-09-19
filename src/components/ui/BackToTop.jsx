import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      type="button"
      id="backToTop"
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className={`fixed z-50 bottom-5 right-5 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#D9BF1E] via-[#FDE346] to-[#FFF385] text-brand-red border-2 border-white/95 shadow-[0_8px_20px_rgba(253,227,70,0.45),0_3px_6px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_28px_rgba(253,227,70,0.65),0_6px_12px_rgba(0,0,0,0.25)] flex items-center justify-center transition-all duration-300 transform group active:scale-90 hover:scale-110 focus:outline-none cursor-pointer ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-8 scale-75 pointer-events-none'
      }`}
      style={{
        boxShadow:
          'inset 0 2px 4px rgba(255, 255, 255, 0.75), inset 0 -3px 5px rgba(0, 0, 0, 0.2), 0 8px 20px rgba(253, 227, 70, 0.45), 0 3px 6px rgba(0, 0, 0, 0.15)'
      }}
    >
      {/* 3D Top Inner Gloss Highlight */}
      <span className="absolute top-1 left-2 right-2 h-3.5 bg-gradient-to-b from-white/50 to-transparent rounded-full pointer-events-none" />

      {/* Arrow Icon with 3D Drop Shadow */}
      <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] text-brand-red transition-transform duration-200 group-hover:-translate-y-0.5 filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.25)]" />

      {/* Floating Tooltip (Desktop) */}
      <div className="hidden sm:flex items-center absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0">
        <div className="bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap border border-white/10">
          Kembali ke Atas
        </div>
        <div className="w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-slate-900/90 ml-[-1px]"></div>
      </div>
    </button>
  );
}
