/**
 * Operations Shell Layout — PT. BARAK IOMS
 * Tab navigation across Operations core functional modules:
 * Overview, Kesiapan Manpower, Laporan Insiden, Pergantian Personel, Jurnal Patroli.
 * Source of Truth: PRD Section 13 / IMPLEMENTATION-PLAN Phase 4.
 */

import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, Users, AlertTriangle, UserCheck, ClipboardList, ClipboardCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';

const TABS = [
  {
    to: '/ops/operations',
    label: 'Overview & Metrik',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/ops/operations/manpower',
    label: 'Kesiapan Manpower',
    icon: Users,
    end: false,
  },
  {
    to: '/ops/operations/incidents',
    label: 'Laporan Insiden',
    icon: AlertTriangle,
    end: false,
  },
  {
    to: '/ops/operations/replacement',
    label: 'Pergantian Personel',
    icon: UserCheck,
    end: false,
  },
  {
    to: '/ops/operations/field-reports',
    label: 'Jurnal Patroli',
    icon: ClipboardList,
    end: false,
  },
  {
    to: '/ops/operations/activity-reports',
    label: 'Laporan Kegiatan PIC',
    icon: ClipboardCheck,
    end: false,
  },
];

export default function OperationsLayout() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPicKorlap = Boolean(currentUser?.isPicKorlap);

  // Jika akun PIC Korlap, kunci navigasi hanya di /ops/operations/activity-reports
  useEffect(() => {
    if (isPicKorlap && location.pathname !== '/ops/operations/activity-reports') {
      navigate('/ops/operations/activity-reports', { replace: true });
    }
  }, [isPicKorlap, location.pathname, navigate]);

  const visibleTabs = isPicKorlap
    ? TABS.filter((tab) => tab.to === '/ops/operations/activity-reports')
    : TABS;

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="border-b border-border bg-white rounded-xl shadow-xs p-4 sm:p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink">
              {isPicKorlap ? `Laporan Kegiatan Lapangan — ${currentUser?.name}` : 'Divisi Operasional Lapangan'}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              {isPicKorlap
                ? 'Pencatatan laporan kunjungan supervisi pos, upload dokumentasi foto 16:9, dan rekapitulasi kegiatan.'
                : 'Pemantauan pos jaga, kesiapan manpower penugasan, penanganan insiden, jurnal patroli, dan laporan kegiatan PIC.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPicKorlap ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20">
                <ShieldAlert className="h-3.5 w-3.5" />
                Akses Terbatas: Koordinator Lapangan (PIC)
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20">
                Operations Control Center
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none" aria-label="Tabs Operasional">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors rounded-t-lg',
                    isActive
                      ? 'border-primary-red text-primary-red bg-primary-red/5 font-semibold'
                      : 'border-transparent text-muted hover:text-ink hover:border-border'
                  )
                }
              >
                <Icon className="h-4 w-4 flex-none" aria-hidden />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Child Route Outlet */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
