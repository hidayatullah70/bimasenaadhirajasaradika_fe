/**
 * Website CMS Shell Layout — PT. BARAK IOMS
 * Tab navigation across Website CMS core functional modules:
 * Overview & Metrik, Artikel & Berita, Lowongan Karir, Tanya Jawab (FAQ), Inquiry Calon Klien, Pengaturan SEO.
 * Source of Truth: PRD Section 17 (Admin Website / CMS) / IMPLEMENTATION-PLAN Phase 9.
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { LayoutDashboard, Newspaper, Briefcase, HelpCircle, Inbox, Globe2 } from 'lucide-react';

const TABS = [
  {
    to: '/ops/website',
    label: 'Overview & Metrik',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/ops/website/articles',
    label: 'Artikel & Berita',
    icon: Newspaper,
    end: false,
  },
  {
    to: '/ops/website/careers',
    label: 'Lowongan Karir',
    icon: Briefcase,
    end: false,
  },
  {
    to: '/ops/website/faqs',
    label: 'Tanya Jawab (FAQ)',
    icon: HelpCircle,
    end: false,
  },
  {
    to: '/ops/website/inquiries',
    label: 'Inquiry Calon Klien',
    icon: Inbox,
    end: false,
  },
  {
    to: '/ops/website/seo',
    label: 'Pengaturan SEO',
    icon: Globe2,
    end: false,
  },
];

export default function WebsiteLayout() {
  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="border-b border-border bg-white rounded-xl shadow-xs p-4 sm:p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink">Manajemen Konten Publik & Website CMS</h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Pengelolaan konten portal resmi www.barak.co.id, publikasi artikel berita industri, direktori lowongan kerja, FAQ, optimasi metadata SEO, dan penerusan inquiry calon klien ke modul Leads Marketing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20">
              Content Management & Lead Capture
            </span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none" aria-label="Tabs Website CMS">
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
