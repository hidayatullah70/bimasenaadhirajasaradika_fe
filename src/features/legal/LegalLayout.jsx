/**
 * Legal Shell Layout — PT. BARAK IOMS
 * Tab navigation across Legal core functional modules:
 * Overview, Kasus Hukum & Somasi, Kontrak & PKS Klien, Kepatuhan & Perizinan SIO.
 * Source of Truth: PRD Section 12 / IMPLEMENTATION-PLAN Phase 6.
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, Scale, FileText, ShieldCheck } from 'lucide-react';

const TABS = [
  {
    to: '/ops/legal',
    label: 'Overview & Metrik',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/ops/legal/cases',
    label: 'Kasus Hukum & Somasi',
    icon: Scale,
    end: false,
  },
  {
    to: '/ops/legal/contracts',
    label: 'Kontrak & PKS Klien',
    icon: FileText,
    end: false,
  },
  {
    to: '/ops/legal/compliance',
    label: 'Kepatuhan & Perizinan SIO',
    icon: ShieldCheck,
    end: false,
  },
];

export default function LegalLayout() {
  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="border-b border-border bg-white rounded-xl shadow-xs p-4 sm:p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink">Divisi Hukum & Kepatuhan (Legal)</h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Penanganan kasus hukum operasional, eskalasi sengketa COD, penertiban somasi, pengelolaan kontrak PKS klien, dan perizinan SIO BUJP Polri.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20">
              Legal & Compliance Center
            </span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none" aria-label="Tabs Legal">
          {TABS.map((tab) => {
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
