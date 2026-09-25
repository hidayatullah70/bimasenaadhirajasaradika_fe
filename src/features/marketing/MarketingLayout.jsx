/**
 * Marketing Shell Layout — PT. BARAK IOMS
 * Tab navigation across Marketing core functional modules:
 * Overview & Metrik, Manajemen Leads, CRM & Pipeline, Handover Klien WON.
 * Source of Truth: PRD Section 15 & 18 / IMPLEMENTATION-PLAN Phase 7.
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, Target, GitPullRequest, CheckCircle2 } from 'lucide-react';

const TABS = [
  {
    to: '/ops/marketing',
    label: 'Overview & Metrik',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/ops/marketing/leads',
    label: 'Manajemen Leads',
    icon: Target,
    end: false,
  },
  {
    to: '/ops/marketing/pipeline',
    label: 'CRM & Pipeline',
    icon: GitPullRequest,
    end: false,
  },
  {
    to: '/ops/marketing/handover',
    label: 'Handover Klien WON',
    icon: CheckCircle2,
    end: false,
  },
];

export default function MarketingLayout() {
  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="border-b border-border bg-white rounded-xl shadow-xs p-4 sm:p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink">Divisi Pemasaran & Penjualan (Marketing)</h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Akuisisi prospek bisnis baru, manajemen pipeline peluang deal, survei & quotation penawaran, serta serah terima (handover) klien WON ke Operasional & Finance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-yellow/20 text-ink border border-primary-yellow/40">
              Commercial & CRM Pipeline
            </span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none" aria-label="Tabs Marketing">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                    isActive
                      ? 'border-primary-red text-primary-red font-semibold'
                      : 'border-transparent text-muted hover:text-ink hover:border-border'
                  )
                }
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Child Routes Outlet */}
      <Outlet />
    </div>
  );
}
