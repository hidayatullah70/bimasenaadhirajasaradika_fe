import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, UserCheck, MessageSquareText } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../app/context/AuthContext';

export function LandingNavbar({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Tentang Kami', href: '#tentang' },
    { label: '6 Layanan', href: '#layanan' },
    { label: 'Keunggulan', href: '#keunggulan' },
    { label: 'Proses Kerja', href: '#proses' },
    { label: 'Mitra Klien', href: '#klien' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Kontak', href: '#kontak' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md border-b border-slate-200/80 py-2 sm:py-2.5'
          : 'bg-brand-yellow shadow-sm border-b border-brand-yellow-dark/30 py-3 sm:py-3.5'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#hero" className="flex items-center group transition-transform hover:scale-[1.02]" aria-label="PT. Bhimasena Adhirajasa Radhika">
          <img
            src="/logoBarak_trans.png"
            alt="PT. Bhimasena Adhirajasa Radhika"
            className="h-12 sm:h-14 md:h-16 w-auto max-w-[240px] sm:max-w-[300px] md:max-w-[360px] object-contain"
          />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-xs sm:text-sm font-bold text-brand-red hover:underline hover:decoration-brand-green hover:decoration-2 underline-offset-8 transition-all py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={MessageSquareText}
            className={!isScrolled ? 'bg-white/90 hover:bg-white text-brand-dark border-transparent shadow-xs font-bold' : 'font-bold'}
            onClick={() => {
              const el = document.querySelector('#kontak');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Konsultasi Layanan
          </Button>

          {isAuthenticated ? (
            <Button
              variant="dark"
              size="sm"
              icon={UserCheck}
              onClick={() => onNavigate && onNavigate('dashboard')}
            >
              Buka Dashboard ({user?.role?.toUpperCase()})
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={Shield}
              className="shadow-sm shadow-red-900/10 font-bold"
              onClick={() => onNavigate && onNavigate('login')}
            >
              Portal Internal
            </Button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg text-brand-red transition-colors ${
              isScrolled ? 'hover:bg-slate-100' : 'hover:bg-brand-yellow-dark/20'
            }`}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3 py-2 rounded-lg text-sm font-bold text-brand-red hover:bg-slate-50 hover:underline hover:decoration-brand-green hover:decoration-2 underline-offset-4 transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Button
              variant="outline"
              size="md"
              icon={MessageSquareText}
              className="w-full text-center justify-center font-bold"
              onClick={() => {
                setMobileMenuOpen(false);
                const el = document.querySelector('#kontak');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Konsultasi Layanan
            </Button>

            {isAuthenticated ? (
              <Button
                variant="dark"
                size="md"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate && onNavigate('dashboard');
                }}
              >
                Buka Dashboard ({user?.role})
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                icon={Shield}
                className="w-full justify-center font-bold shadow-md shadow-red-900/10"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate && onNavigate('login');
                }}
              >
                Portal Internal
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
