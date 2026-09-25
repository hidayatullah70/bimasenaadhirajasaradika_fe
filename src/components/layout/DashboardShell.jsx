/**
 * Shared dashboard shell factory for role dashboards.
 * Each role gets: greeting, KPI row (from data selectors), quick links, permission guards.
 * KPI values computed from mock data — not hardcoded (PRD §38).
 */

import React from 'react';
import clsx from 'clsx';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_LABELS } from '@/constants/roles';
import { Card, CardContent } from '@/components/ui/Card';
import PageHeader from '@/components/layout/PageHeader';
import KpiCard from '@/components/ui/KpiCard';
import RequirePermission from '@/app/guards/RequirePermission';

/**
 * @param {{
 *   kpis: Array<{ title, value, subtitle?, icon, iconBg?, trend? }>,
 *   widgets?: React.ReactNode,
 *   actions?: React.ReactNode,
 *   description?: string,
 * }} props
 */
export default function DashboardShell({ kpis = [], widgets, actions, description }) {
  const { currentUser } = useAuth();
  const roleLabel = ROLE_LABELS[currentUser?.role] ?? currentUser?.role ?? '';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Sore';

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${currentUser?.name?.split(' ')[0] ?? ''}!`}
        description={description || `Dashboard ${roleLabel} — PT. Bhimasena Adhirajasa Radhika`}
        actions={actions}
      />

      {/* KPI row */}
      {kpis.length > 0 && (
        <div className={clsx(
          'grid gap-4 mb-6',
          kpis.length === 1 ? 'grid-cols-1' :
          kpis.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          kpis.length <= 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        )}>
          {kpis.map((kpi, i) => (
            <KpiCard key={i} {...kpi} />
          ))}
        </div>
      )}

      {/* Widgets */}
      {widgets}
    </div>
  );
}
