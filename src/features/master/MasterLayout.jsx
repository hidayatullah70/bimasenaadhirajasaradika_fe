/**
 * Master Data Shell Layout — PT. BARAK IOMS
 * Tab navigation across core master data entities:
 * Karyawan, Klien, Lokasi & Proyek, Shift, Penugasan, Pengguna Sistem.
 * Source of Truth: PRD Section 11.1, 9, 20 / IMPLEMENTATION-PLAN Phase 2.
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { Users, Building2, MapPin, Clock, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { PERMISSIONS } from '@/constants/permissions';

const TABS = [
  {
    to: '/ops/master/employees',
    label: 'Karyawan',
    icon: Users,
    permission: PERMISSIONS.EMPLOYEE_VIEW,
  },
  {
    to: '/ops/master/clients',
    label: 'Klien Mitra',
    icon: Building2,
    permission: PERMISSIONS.CLIENT_VIEW,
  },
  {
    to: '/ops/master/locations',
    label: 'Lokasi & Proyek',
    icon: MapPin,
    permission: PERMISSIONS.LOCATION_VIEW,
  },
  {
    to: '/ops/master/shifts',
    label: 'Shift Kerja',
    icon: Clock,
    permission: PERMISSIONS.SHIFT_VIEW,
  },
  {
    to: '/ops/master/assignments',
    label: 'Penugasan Personel',
    icon: UserCheck,
    permission: PERMISSIONS.ASSIGNMENT_VIEW,
  },
  {
    to: '/ops/master/users',
    label: 'Pengguna & Akses',
    icon: ShieldCheck,
    permission: PERMISSIONS.USER_VIEW,
  },
];

export default function MasterLayout() {
  const { hasPermission } = useAuth();
  const visibleTabs = TABS.filter((tab) => !tab.permission || hasPermission(tab.permission));

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="border-b border-border bg-white rounded-xl shadow-xs p-4 sm:p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink">Master Data Terpadu</h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Sumber data tunggal otoritatif untuk personalia, klien, penempatan, dan akun operasional PT. BARAK.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20">
              Single Source of Truth
            </span>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none" aria-label="Tabs Master Data">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
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

      {/* Tab Content Outlet */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
