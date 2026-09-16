import React, { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import { useAuth } from '../../app/context/AuthContext';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

export function DashboardShell({ currentPath, onNavigate, onNavigateLanding, children }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, isAuthenticated, role, switchRole } = useAuth();

  // If not authenticated, show unauthorized state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-brand-neutral flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-card p-8 text-center border border-slate-200 shadow-md">
          <div className="w-16 h-16 rounded-full bg-red-100 text-brand-red flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-brand-dark mb-2">Sesi Tidak Ditemukan (401)</h2>
          <p className="text-sm text-slate-500 mb-6">
            Anda harus masuk ke dalam akun staf/manajemen PT. Bhimasena Adhirajasa Radhika untuk mengakses modul ini.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              icon={LogIn}
              onClick={() => onNavigateLanding('login')}
            >
              Menuju Halaman Login
            </Button>
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={() => onNavigateLanding('landing')}
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-neutral overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <DashboardSidebar
          currentPath={currentPath}
          onNavigate={onNavigate}
        />
      </div>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-brand-dark z-10 shadow-2xl">
            <DashboardSidebar
              currentPath={currentPath}
              onNavigate={onNavigate}
              onCloseMobile={() => setMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardTopbar
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
          onNavigateLanding={() => onNavigateLanding('landing')}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
