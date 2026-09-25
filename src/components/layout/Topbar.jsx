/**
 * Topbar — internal app shell top navigation.
 * Contains: hamburger (mobile), breadcrumb, global search trigger, notification bell, profile menu.
 * Source of Truth: UI-GUIDELINE §5 (App Shell).
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Search, Bell, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_LABELS } from '@/constants/roles';
import toast from 'react-hot-toast';

export default function Topbar({ onMobileMenuOpen, unreadCount = 0, onSearchOpen }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    toast.success('Berhasil keluar.');
    navigate('/ops/login');
  };

  return (
    <header className="h-14 flex-none bg-surface border-b border-border flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Mobile menu trigger */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate"
        aria-label="Buka menu navigasi"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Global Search trigger */}
      <button
        onClick={onSearchOpen}
        id="global-search-trigger"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-canvas text-muted text-sm hover:border-slate/40 hover:text-ink transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate"
        aria-label="Buka pencarian global (Ctrl+K)"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Cari...</span>
        <kbd className="hidden sm:inline ml-1 text-xs font-mono bg-border text-muted px-1.5 py-0.5 rounded">
          Ctrl K
        </kbd>
      </button>

      {/* Notification Bell */}
      <Link
        to="/ops/notifications"
        id="notification-bell"
        className="relative flex items-center justify-center h-9 w-9 rounded-lg text-muted hover:text-ink hover:bg-canvas border border-transparent hover:border-border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate"
        aria-label={`Notifikasi${unreadCount > 0 ? ` — ${unreadCount} belum dibaca` : ''}`}
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-red text-white text-[10px] font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      {/* Profile dropdown */}
      <div ref={profileRef} className="relative">
        <button
          onClick={() => setProfileOpen((v) => !v)}
          id="profile-menu-trigger"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium text-slate hover:text-ink hover:bg-canvas border border-transparent hover:border-border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate"
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          aria-label="Menu profil"
        >
          <div className="h-7 w-7 rounded-full bg-primary-red/10 flex items-center justify-center flex-none">
            <span className="text-primary-red font-bold text-xs" aria-hidden>
              {currentUser?.name?.[0] ?? 'U'}
            </span>
          </div>
          <span className="hidden md:block max-w-[120px] truncate">{currentUser?.name}</span>
          <ChevronDown className={clsx('h-4 w-4 text-muted transition-transform', profileOpen && 'rotate-180')} aria-hidden />
        </button>

        {profileOpen && (
          <div
            className="absolute right-0 top-full mt-1 w-56 bg-surface rounded-xl border border-border shadow-dropdown z-50"
            role="menu"
            aria-label="Menu profil"
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-ink truncate">{currentUser?.name}</p>
              <p className="text-xs text-muted truncate">{currentUser?.email}</p>
              <p className="text-xs text-primary-red font-medium mt-0.5">
                {ROLE_LABELS[currentUser?.role] ?? currentUser?.role}
              </p>
            </div>
            <div className="py-1">
              <Link
                to="/ops/profile"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate hover:text-ink hover:bg-canvas transition-colors"
              >
                <User className="h-4 w-4 text-muted" aria-hidden />
                Profil Saya
              </Link>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate hover:text-danger hover:bg-danger/5 transition-colors"
              >
                <LogOut className="h-4 w-4 text-muted" aria-hidden />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
