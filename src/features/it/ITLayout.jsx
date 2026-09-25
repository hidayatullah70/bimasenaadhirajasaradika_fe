/**
 * IT Support Shell Layout — PT. BARAK IOMS
 * Tab navigation across IT core modules:
 * Overview & Monitoring, Tiket Gangguan & Helpdesk, Inventaris Aset Posko, Pemeliharaan Preventif.
 * Source of Truth: PRD Section 16 (IT Support Module) / IMPLEMENTATION-PLAN Phase 8.
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, Ticket, Server, Wrench } from 'lucide-react';

const TABS = [
  {
    to: '/ops/it',
    label: 'Overview & Sistem',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/ops/it/tickets',
    label: 'Tiket & Helpdesk',
    icon: Ticket,
    end: false,
  },
  {
    to: '/ops/it/assets',
    label: 'Inventaris Aset Posko',
    icon: Server,
    end: false,
  },
  {
    to: '/ops/it/maintenance',
    label: 'Pemeliharaan Preventif',
    icon: Wrench,
    end: false,
  },
];

export default function ITLayout() {
  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="border-b border-border bg-white rounded-xl shadow-xs p-4 sm:p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink">Divisi Teknologi Informasi & Dukungan Teknis (IT Support)</h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Penyediaan infrastruktur teknis posko pengamanan, penanganan tiket kendala operasional posko & kantor, inventarisasi perangkat barrier gate/CCTV, serta monitoring kesehatan sistem IOMS.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-info/10 text-info border border-info/20">
              IT Infrastructure & SLA Center
            </span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none" aria-label="Tabs IT Support">
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
