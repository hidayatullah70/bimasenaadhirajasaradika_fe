import React from 'react';

export function WhatsAppCta() {
  const whatsappUrl =
    'https://wa.me/6285124799305?text=Halo%20PT.%20BARAK%2C%20saya%20tertarik%20dengan%20layanan%20Anda';

  return (
    <div className="fixed z-50 bottom-[4.75rem] right-5 sm:bottom-[6.5rem] sm:right-8">
      {/* Subtle pulsing background radar wave */}
      <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping -z-10 pointer-events-none" />

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp PT. Bhimasena Adhirajasa Radhika"
        className="relative group w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#4CE585] text-white border-2 border-white/95 shadow-[0_8px_20px_rgba(37,211,102,0.45),0_3px_6px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_28px_rgba(37,211,102,0.65),0_6px_12px_rgba(0,0,0,0.25)] flex items-center justify-center transition-all duration-300 transform active:scale-90 hover:scale-110 focus:outline-none cursor-pointer"
        style={{
          boxShadow:
            'inset 0 2px 4px rgba(255, 255, 255, 0.55), inset 0 -3px 5px rgba(0, 0, 0, 0.25), 0 8px 20px rgba(37, 211, 102, 0.45), 0 3px 6px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* 3D Top Inner Gloss Highlight */}
        <span className="absolute top-1 left-2 right-2 h-3.5 bg-gradient-to-b from-white/40 to-transparent rounded-full pointer-events-none" />

        {/* WhatsApp Official Logo SVG */}
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 fill-white filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-200 group-hover:scale-105"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.477-.15-.678.15-.201.3-.778.98-.954 1.18-.176.2-.352.226-.653.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.3-.019-.462.132-.612.136-.135.301-.35.452-.526.15-.175.201-.3.301-.5.1-.2.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.239-.245-.589-.494-.509-.678-.519l-.578-.01c-.201 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.08 2.912 1.23 3.113c.15.2 2.126 3.246 5.151 4.553.72.311 1.282.497 1.72.637.723.23 1.381.197 1.901.12.58-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12c0 1.892.526 3.662 1.438 5.176L2 22l4.966-1.402A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.182a8.14 8.14 0 01-4.156-1.134l-.298-.177-3.084.87.824-3.007-.194-.31A8.14 8.14 0 013.818 12C3.818 7.481 7.481 3.818 12 3.818c4.519 0 8.182 3.637 8.182 8.182 0 4.519-3.663 8.182-8.182 8.182z"
          />
        </svg>

        {/* Online Pulse Indicator Dot */}
        <span className="absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-xs" />

        {/* Floating Tooltip (Desktop) */}
        <div className="hidden sm:flex items-center absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0">
          <div className="bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap flex items-center gap-1.5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
            <span>Chat WhatsApp</span>
          </div>
          <div className="w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-slate-900/90 ml-[-1px]"></div>
        </div>
      </a>
    </div>
  );
}
