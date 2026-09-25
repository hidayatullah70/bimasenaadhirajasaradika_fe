/**
 * DirectorLayout — PT. BARAK IOMS
 * Unified layout and tab navigation for Executive Director Module.
 * Source of Truth: PRD Section 6.1 (Direktur Role), Section 10 (Director Dashboard),
 * Section 18 (Approval Center), Section 19 (RBAC), and IMPLEMENTATION-PLAN Phase 10.
 */

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard, CheckSquare, AlertTriangle, FileText,
  History, ShieldCheck
} from 'lucide-react';
import directorAdapter from '@/services/adapters/directorAdapter';

const TABS = [
  {
    to: '/ops/director',
    label: 'Overview & Cockpit',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/ops/director/approvals',
    label: 'Approval Center',
    icon: CheckSquare,
    badgeKey: 'pendingApprovals',
    end: false,
  },
  {
    to: '/ops/director/risk',
    label: 'Manajemen Risiko & Alerts',
    icon: AlertTriangle,
    badgeKey: 'riskCount',
    end: false,
  },
  {
    to: '/ops/director/reports',
    label: 'Laporan Manajemen',
    icon: FileText,
    end: false,
  },
  {
    to: '/ops/director/activity',
    label: 'Log Aktivitas Eksekutif',
    icon: History,
    end: false,
  },
];

export default function DirectorLayout() {
  const [badgeCounts, setBadgeCounts] = useState({ pendingApprovals: 0, riskCount: 0 });

  useEffect(() => {
    let mounted = true;
    async function loadBadges() {
      try {
        const [approvalsRes, risksRes] = await Promise.all([
          directorAdapter.getPendingApprovals(),
          directorAdapter.getExecutiveRisks(),
        ]);
        if (mounted) {
          const pending = approvalsRes.data ? approvalsRes.data.filter((a) => a.status === 'PENDING').length : 0;
          const risks = risksRes.data ? risksRes.data.length : 0;
          setBadgeCounts({ pendingApprovals: pending, riskCount: risks });
        }
      } catch (err) {
        console.error('Failed to load director layout badges', err);
      }
    }
    loadBadges();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="border-b border-border bg-white rounded-xl shadow-xs p-4 sm:p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary-red/10 text-primary-red">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-ink">
                Konsol Eksekutif & Pengambilan Keputusan Direktur
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted mt-1">
              PT. Bhimasena Adhirajasa Radhika — Monitoring Lintas Divisi, Approval Center & Manajemen Risiko Terpadu
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-red/10 text-primary-red border border-primary-red/20">
              <span className="w-2 h-2 rounded-full bg-primary-red animate-pulse" />
              Mode Otoritas Eksekutif
            </span>
          </div>
        </div>

        {/* Tab Links */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar border-t border-border pt-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const badgeValue = tab.badgeKey ? badgeCounts[tab.badgeKey] : 0;

            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 transition-all whitespace-nowrap',
                    isActive
                      ? 'border-primary-red text-primary-red bg-primary-red/5'
                      : 'border-transparent text-muted hover:text-ink hover:bg-slate-50'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {badgeValue > 0 && (
                  <span
                    className={clsx(
                      'px-1.5 py-0.5 text-xs rounded-full font-bold leading-none',
                      tab.badgeKey === 'riskCount'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-primary-red text-white'
                    )}
                  >
                    {badgeValue}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Outlet Sub-Page Content */}
      <Outlet context={{ badgeCounts, setBadgeCounts }} />
    </div>
  );
}
