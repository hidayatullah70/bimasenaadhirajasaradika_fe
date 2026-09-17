import React from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react';
import { COMPANY_INFO } from '../../services/mock/mockData';

export function LandingFooter({ onNavigate }) {
  return (
    <footer className="bg-slate-100 text-slate-700 border-t border-slate-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-200">
          {/* Col 1: Identity & Legal */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <img
                src="/logoBarak_trans.png"
                alt="PT. Bhimasena Adhirajasa Radhika"
                className="h-12 sm:h-14 md:h-16 w-auto max-w-[260px] sm:max-w-[320px] md:max-w-[380px] object-contain"
              />
            </div>

            <div className="p-3.5 bg-white/90 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-green">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Legalitas Resmi & Patuh Regulasi Ketenagakerjaan</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                {COMPANY_INFO.legal}
              </p>
            </div>

            {/* Social Media Links from live site */}
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-700 mb-2.5">
                Ikuti Kami :
              </p>
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=61566252555725"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook PT. BARAK"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* X / Twitter */}
                <a
                  href="https://x.com/Baraksosial0728"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter X PT. BARAK"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-[#38bdf8] hover:bg-[#0284c7] text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/baraksosialmendia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram PT. BARAK"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/barak-sosialmedia-58a578405/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn PT. BARAK"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-[#0A66C2] hover:bg-[#084e96] text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@baraksosialmedia"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok PT. BARAK"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1e293b] hover:bg-black text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.77 1.81-.06 3.26-1.61 3.26-3.42V.02z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: 6 Layanan Utama */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-brand-dark text-xs font-bold uppercase tracking-wider">6 Pilar Layanan</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#layanan" className="text-slate-600 hover:text-brand-red transition-colors flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                  Pengamanan / Security
                </a>
              </li>
              <li>
                <a href="#layanan" className="text-slate-600 hover:text-brand-red transition-colors flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow-dark"></span>
                  Ekspedisi Kurir
                </a>
              </li>
              <li>
                <a href="#layanan" className="text-slate-600 hover:text-brand-red transition-colors flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                  Man Power (Gudang & Pabrik)
                </a>
              </li>
              <li>
                <a href="#layanan" className="text-slate-600 hover:text-brand-red transition-colors flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                  Cleaning Service & Sanitasi
                </a>
              </li>
              <li>
                <a href="#layanan" className="text-slate-600 hover:text-brand-red transition-colors flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  Pengelolaan Parkir
                </a>
              </li>
              <li>
                <a href="#layanan" className="text-slate-600 hover:text-brand-red transition-colors flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  Loss Prevention Ritel
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Kantor & Kontak */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-brand-dark text-xs font-bold uppercase tracking-wider">Kantor Pusat & Kontak</h4>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                <a
                  href="https://maps.app.goo.gl/BsRT6XkbrJW8oRsB6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-red transition-colors leading-relaxed"
                >
                  {COMPANY_INFO.address}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>
                    <a
                      href="https://wa.me/6285124799305"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-red transition-colors font-medium text-slate-700"
                    >
                      {COMPANY_INFO.phone} <span className="text-slate-500 text-[11px]">(WA Konsultasi)</span>
                    </a>
                  </div>
                  <div>
                    <a
                      href="https://wa.me/6285174334336"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-red transition-colors text-slate-500 text-[11px]"
                    >
                      {COMPANY_INFO.whatsappRecruitment} <span>(WA Pelamar Kerja)</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-green flex-shrink-0" />
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="hover:text-brand-red transition-colors break-all"
                >
                  {COMPANY_INFO.email}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>{COMPANY_INFO.operationalHours}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('login')}
                className="text-xs font-semibold text-brand-red hover:underline underline-offset-4"
              >
                Akses Portal Staf & Manajemen &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="flex items-center flex-wrap gap-1.5">
            <span>© 2026 PT. Bhimasena Adhirajasa Radhika. Hak Cipta Dilindungi Undang-Undang by</span>
            <a
              href="https://wa.me/6281384224733"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-nasalization tracking-wide text-[13px] hover:opacity-80 transition-opacity duration-200"
            >
              <span className="text-slate-500 font-semibold">Bionora</span>
              <span className="text-[#00A3FF] font-semibold">Dev</span>
            </a>
          </p>
          <div className="flex items-center gap-6 font-medium">
            <span>Standar Mutu & K3</span>
            <span>Kerahasiaan Data Klien</span>
            <span>Pakta Integritas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
