import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import clsx from 'clsx';
import { SERVICE_TYPES } from '@/constants/business';
import FloatingAdminCTA from './FloatingAdminCTA';

function TikTokIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.068-.102a2.895 2.895 0 0 1 2.373-4.513c.277 0 .544.039.799.112V9.373a6.34 6.34 0 0 0-.799-.052 6.34 6.34 0 0 0-6.339 6.34 6.34 6.34 0 0 0 6.339 6.339 6.34 6.34 0 0 0 6.335-6.339V8.627a8.214 8.214 0 0 0 4.775 1.517V6.702a4.814 4.814 0 0 1-.999-.016z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    icon: Facebook,
    href: 'https://web.facebook.com/people/Barak-Sosialmedia/pfbid02FRdJAFAnGLEk8W19XUquC4Le5LqkpQfazmxfXCR3QSgrRrbkdRaeYYfkFcCDCRK1l/',
    label: 'Facebook',
    hoverText: 'group-hover:text-[#1877F2]',
    hoverBg: 'hover:bg-[#1877F2]/10 hover:border-[#1877F2]/40',
  },
  {
    icon: Instagram,
    href: 'https://www.instagram.com/baraksosialmendia/',
    label: 'Instagram',
    hoverText: 'group-hover:text-[#E4405F]',
    hoverBg: 'hover:bg-[#E4405F]/10 hover:border-[#E4405F]/40',
  },
  {
    icon: TikTokIcon,
    href: 'https://www.tiktok.com/@baraksosialmedia',
    label: 'TikTok',
    hoverText: 'group-hover:text-[#00F2FE]',
    hoverBg: 'hover:bg-[#00F2FE]/10 hover:border-[#00F2FE]/40',
  },
  {
    icon: Twitter,
    href: 'https://www.tiktok.com/@baraksosialmedia',
    label: 'Twitter',
    hoverText: 'group-hover:text-[#1DA1F2]',
    hoverBg: 'hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/40',
  },
];

export default function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="inline-block mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg"
              aria-label="PT. Bhimasena Adhirajasa Radhika — Beranda"
            >
              <img
                src="/assets/img/logo/logoAja.png"
                alt="PT. Bhimasena Adhirajasa Radhika"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain hover:scale-105 transition-transform"
              />
            </Link>
            <p className="text-sm text-white/70 leading-relaxed">
              PT. Bhimasena Adhirajasa Radhika — mitra strategis outsourcing yang profesional, kompeten, dan berintegritas.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {SOCIAL_LINKS.map(({ icon: SocialIcon, href, label, hoverText, hoverBg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={clsx(
                    'group h-9 w-9 rounded-lg bg-white/10 border border-white/5 flex items-center justify-center transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                    hoverBg
                  )}
                >
                  <SocialIcon
                    className={clsx('h-4 w-4 text-white/80 transition-colors duration-200', hoverText)}
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide mb-4 text-white/50">Layanan</h3>
            <ul className="space-y-2">
              {SERVICE_TYPES.map((s) => (
                <li key={s.slug}>
                  <Link to={`/layanan/${s.slug}`} className="text-sm text-white/70 hover:text-white transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Perusahaan */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide mb-4 text-white/50">Tautan Cepat</h3>
            <ul className="space-y-2">
              {[
                { label: 'Perusahaan', to: '/perusahaan/profil' },
                { label: 'Klien & Portofolio', to: '/client' },
                { label: 'Karir', to: '/career' },
                { label: 'News', to: '/news' },
                { label: 'Blog', to: '/blog' },
                { label: 'FAQ', to: '/faq' },
                { label: 'Kontak', to: '/contact' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/70 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide mb-4 text-white/50">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin className="h-4 w-4 text-primary-red flex-none mt-1" aria-hidden />
                <a
                  href="https://www.google.com/maps/place/PT.+Bimasena+Adhirajasa+Radhika/@-6.1721059,106.6502536,17z/data=!3m1!4b1!4m6!3m5!1s0x2e69f971d739eae9:0x145c3a84a4e07ee1!8m2!3d-6.1721059!4d106.6502536"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-relaxed hover:text-white transition-colors"
                  title="Buka lokasi PT. BARAK di Google Maps"
                >
                  Jl. Melati I RT. 002/RW.005 Kel. Tanah Tinggi Kec. Tangerang, Kota Tangerang, Banten 15119
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <Phone className="h-4 w-4 text-primary-red flex-none mt-1" aria-hidden />
                <div className="flex flex-col space-y-1">
                  <a
                    href="https://wa.me/6285124799305"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    0851 2479 9305 <span className="text-xs text-white/50">(Konsultasi)</span>
                  </a>
                  <a
                    href="https://wa.me/6285187845044"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    0851 8784 5044 <span className="text-xs text-white/50">(Pelamar)</span>
                  </a>

                </div>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <Mail className="h-4 w-4 text-primary-red flex-none mt-1" aria-hidden />
                <a
                  href="mailto:ptbimasenaadhirajasaradika@gmail.com"
                  className="hover:text-white transition-colors break-all"
                >
                  ptbimasenaadhirajasaradika@gmail.com
                </a>
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-5 inline-block px-4 py-2 bg-primary-red text-white text-sm font-semibold rounded-lg hover:bg-red-800 transition-colors shadow-sm"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {year} PT. Bhimasena Adhirajasa Radhika. Hak cipta dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-1 flex-wrap">
            <span>Sistem IOMS v1.0 by</span>
            <a
              href="https://wa.me/6281384224733"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors group inline-flex items-center gap-1 ml-0.5"
            >
              <span className="font-orbitron tracking-wide text-xs">
                <span className="text-white/90 group-hover:text-white transition-colors">Bionora</span>
                <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors font-medium">Dev</span>
              </span>
            </a>
          </p>
        </div>
      </div>
      {/* Floating 3D Admin CTA with WhatsApp actions */}
      <FloatingAdminCTA />
    </footer>
  );
}
