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
      className={`fixed z-50 bottom-5 right-5 sm:bottom-8 sm:right-8 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-brand-yellow hover:bg-[#ebd034] text-brand-red border-2 border-white/95 shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 transform group active:scale-90 hover:scale-110 focus:outline-none ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-8 scale-75 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3] transition-transform duration-200 group-hover:-translate-y-0.5 filter drop-shadow-xs" />
    </button>
  );
}
