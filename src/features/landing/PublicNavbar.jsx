/**
 * Public Navbar — PT. BARAK landing page navigation.
 * CRITICAL: Does NOT include a link to /ops/login (PRD §2.2 / AGENTS.md).
 * Uses real brand assets from /public/assets/img/logo/.
 */

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  Building2,
  Target,
  Users,
  UserCheck,
  Award,
  Shield,
  Truck,
  ParkingCircle,
  Sparkles,
  Eye,
  Briefcase,
  Search,
  Mail,
  Handshake,
  LayoutGrid,
} from 'lucide-react';
import clsx from 'clsx';

const NAV_LINKS = [
  {
    label: 'Beranda',
    to: '/',
  },
  {
    label: 'Perusahaan',
    to: '/perusahaan',
    icon: Building2,
    children: [
      { label: 'Profil Perusahaan', to: '/perusahaan/profil', icon: Building2 },
      { label: 'Visi, Misi & Budaya', to: '/perusahaan/visi-misi', icon: Target },
      { label: 'Dewan Direksi', to: '/perusahaan/direksi', icon: Users },
      { label: 'Manajemen', to: '/perusahaan/manajemen', icon: UserCheck },
      { label: 'Sertifikat & Penghargaan', to: '/perusahaan/sertifikat', icon: Award },
    ],
  },
  {
    label: 'Layanan',
    to: '/layanan',
    icon: LayoutGrid,
    children: [
      { label: 'Jasa Pengamanan / Security', to: '/layanan/security', icon: Shield },
      { label: 'Ekspedisi Kurir', to: '/layanan/kurir', icon: Truck },
      { label: 'Parkir', to: '/layanan/parkir', icon: ParkingCircle },
      { label: 'Cleaning Service', to: '/layanan/cleaning-service', icon: Sparkles },
      { label: 'Man Power', to: '/layanan/man-power', icon: Users },
      { label: 'Loss Prevention', to: '/layanan/loss-prevention', icon: Eye },
    ],
  },
  {
    label: 'Klien & Portfolio',
    to: '/client',
    icon: Handshake,
    children: [
      { label: 'Klien Kami', to: '/client', icon: Building2 },
      { label: 'Portfolio Klien', to: '/client?tab=portfolio', icon: Briefcase },
    ],
  },
  { label: 'Karir', to: '/career' },
  { label: 'News', to: '/news' },
  { label: 'Blog', to: '/blog' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Kontak', to: '/contact' },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenMobileDropdown(null);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase().trim();
    if (query.includes('keamanan') || query.includes('security') || query.includes('satpam')) {
      navigate('/layanan/security');
    } else if (query.includes('kurir') || query.includes('ekspedisi') || query.includes('cod')) {
      navigate('/layanan/kurir');
    } else if (query.includes('parkir')) {
      navigate('/layanan/parkir');
    } else if (query.includes('cleaning') || query.includes('bersih')) {
      navigate('/layanan/cleaning-service');
    } else if (query.includes('karir') || query.includes('loker') || query.includes('kerja')) {
      navigate('/career');
    } else if (query.includes('klien') || query.includes('portfolio') || query.includes('proyek')) {
      navigate('/client');
    } else if (query.includes('profil') || query.includes('tentang') || query.includes('direksi')) {
      navigate('/perusahaan/profil');
    } else {
      navigate(`/news`);
    }
    setSearchQuery('');
  };

  const toggleMobileDropdown = (label) => {
    setOpenMobileDropdown((prev) => (prev === label ? null : label));
  };

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200'
          : 'bg-accent-green shadow-xs'
      )}
    >
      <nav
        className="w-full px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3"
        aria-label="Navigasi utama"
      >
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center flex-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red rounded-lg py-1"
          aria-label="PT. Bhimasena Adhirajasa Radhika — Beranda"
        >
          <img
            src="/assets/img/logo/logoNavbar.png"
            alt="PT. Bhimasena Adhirajasa Radhika"
            className="h-8 sm:h-9 md:h-10 lg:h-9 xl:h-11 w-auto max-w-[150px] sm:max-w-[180px] md:max-w-[210px] lg:max-w-[170px] xl:max-w-[240px] object-contain transition-all"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
          {NAV_LINKS.map((link) => {
            const hasChildren = Boolean(link.children);
            const isPerusahaanActive =
              link.to === '/perusahaan' &&
              (location.pathname.startsWith('/perusahaan') || location.pathname.startsWith('/tentang'));
            const isLayananActive =
              link.to === '/layanan' && location.pathname.startsWith('/layanan');
            const isClientActive =
              link.to === '/client' &&
              (location.pathname.startsWith('/client') || location.pathname.startsWith('/portfolio'));

            const isGroupActive = isPerusahaanActive || isLayananActive || isClientActive;

            return hasChildren ? (
              <div key={link.label} className="relative group py-2">
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-1 px-1.5 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-[13px] font-medium transition-colors',
                      scrolled
                        ? isGroupActive || isActive
                          ? 'text-primary-red font-bold'
                          : 'text-slate-700 hover:text-primary-red hover:bg-slate-100/70'
                        : isGroupActive || isActive
                          ? 'text-white font-bold bg-white/20'
                          : 'text-white hover:text-primary-red hover:bg-white/10'
                    )
                  }
                >
                  <span>{link.label}</span>
                  <ChevronDown
                    className={clsx(
                      'h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180',
                      scrolled ? 'text-slate-400 group-hover:text-primary-red' : 'text-white/80 group-hover:text-primary-red'
                    )}
                    aria-hidden="true"
                  />
                </NavLink>

                {/* Submenu Dropdown Card (Matching Image 1) */}
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-2 w-72">
                    <div className="space-y-0.5">
                      {link.children.map((sub) => {
                        const SubIcon = sub.icon || Building2;
                        return (
                          <NavLink
                            key={sub.to}
                            to={sub.to}
                            className={({ isActive }) =>
                              clsx(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group/item',
                                isActive
                                   ? 'bg-accent-green/10 text-accent-green font-semibold'
                                   : 'text-slate-700 hover:bg-slate-50 hover:text-accent-green'
                              )
                            }
                          >
                            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-500 group-hover/item:bg-accent-green/15 group-hover/item:text-accent-green transition-colors flex-none">
                              <SubIcon className="w-4 h-4" />
                            </span>
                            <span className="truncate">{sub.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'px-1.5 xl:px-2.5 py-1.5 rounded-lg text-xs xl:text-[13px] font-medium transition-colors',
                    scrolled
                      ? isActive
                        ? 'text-primary-red font-bold'
                        : 'text-slate-700 hover:text-primary-red hover:bg-slate-100/70'
                      : isActive
                        ? 'text-white font-bold bg-white/20'
                        : 'text-white hover:text-primary-red hover:bg-white/10'
                  )
                }
              >
                {link.label}
              </NavLink>
            );
          })}
        </div>

        {/* Right Area: Search + Hubungi Kami CTA */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 flex-none">
          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..."
              className={clsx(
                'w-28 sm:w-32 lg:w-36 xl:w-44 pl-3 pr-8 py-1.5 rounded-full text-xs transition-all border focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
                scrolled
                  ? 'bg-slate-100 text-ink border-slate-300 placeholder:text-slate-400 focus:bg-slate-100 focus:border-slate-400'
                  : 'bg-white/15 text-ink placeholder:text-white/80 border-white/60 focus:bg-white/15 focus:border-white focus:text-ink font-medium'
              )}
            />
            <button
              type="submit"
              aria-label="Cari"
              className={clsx(
                'absolute right-2.5 top-1/2 -translate-y-1/2',
                scrolled ? 'text-slate-400 hover:text-slate-700' : 'text-white/80 hover:text-white'
              )}
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Hubungi Kami CTA Button */}
          <Link
            to="/contact"
            id="public-cta-consultation"
            className="flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 bg-primary-red hover:bg-red-800 text-white rounded-full text-xs xl:text-sm font-semibold transition-all shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red"
          >
            <Mail className="w-4 h-4" />
            <span>Hubungi Kami</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className={clsx(
            'lg:hidden flex items-center justify-center h-9 w-9 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2',
            scrolled
              ? 'text-slate-800 hover:bg-slate-100 focus-visible:ring-slate-800'
              : 'text-white hover:bg-white/20 focus-visible:ring-white'
          )}
          aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Search */}
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari layanan, karir, informasi..."
                className="w-full pl-3 pr-9 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-red bg-white"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="px-4 py-3 space-y-1 max-h-[75vh] overflow-y-auto">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.label} className="border-b border-slate-100 pb-1">
                  <button
                    type="button"
                    onClick={() => toggleMobileDropdown(link.label)}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 text-left"
                  >
                    <span>{link.label}</span>
                    <ChevronDown
                      className={clsx(
                        'h-4 w-4 text-slate-400 transition-transform duration-200',
                        openMobileDropdown === link.label && 'rotate-180 text-primary-red'
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {openMobileDropdown === link.label && (
                    <div className="ml-3 pl-3 border-l-2 border-slate-200 mt-1 space-y-1 mb-2">
                      {link.children.map((sub) => {
                        const SubIcon = sub.icon || Building2;
                        return (
                          <NavLink
                            key={sub.to}
                            to={sub.to}
                            className={({ isActive }) =>
                              clsx(
                                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                                isActive
                                  ? 'text-primary-red bg-red-50 font-bold'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              )
                            }
                          >
                            <SubIcon className="w-3.5 h-3.5 text-slate-400 flex-none" />
                            <span>{sub.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    clsx(
                      'block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'text-primary-red bg-red-50 font-bold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}

            <div className="pt-4 mt-2">
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 bg-primary-red text-white rounded-xl text-sm font-bold shadow-md hover:bg-red-800 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Hubungi Kami</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
