/**
 * Sidebar navigation — PT. BARAK IOMS Internal App Shell.
 * Collapsible on desktop, drawer on mobile.
 * Only shows modules the current user has permission to access.
 * Source of Truth: PRD §8 (App Shell) / AGENTS.md §Coding Rules.
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard, Users, Shield, Briefcase, DollarSign,
  TrendingUp, MonitorSmartphone, Globe, Database, X, ChevronLeft,
  ChevronRight, Building2, LogOut,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLES, ROLE_LABELS } from '@/constants/roles';
import { PERMISSIONS } from '@/constants/permissions';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  {
    label: 'Direktur',
    to: '/ops/director',
    icon: LayoutDashboard,
    roles: [ROLES.DIREKTUR],
    permission: PERMISSIONS.DIRECTOR_DASHBOARD,
  },
  {
    label: 'Master Data',
    to: '/ops/master',
    icon: Database,
    roles: [
      ROLES.DIREKTUR,
      ROLES.HRD,
      ROLES.OPERASIONAL,
      ROLES.LEGAL,
      ROLES.FINANCE,
      ROLES.MARKETING,
      ROLES.IT_SUPPORT,
      ROLES.ADMIN_WEBSITE,
    ],
    permission: PERMISSIONS.EMPLOYEE_VIEW,
  },
  {
    label: 'HRD',
    to: '/ops/hrd',
    icon: Users,
    roles: [ROLES.HRD, ROLES.DIREKTUR],
    permission: PERMISSIONS.ATTENDANCE_VIEW,
  },
  {
    label: 'Legal',
    to: '/ops/legal',
    icon: Shield,
    roles: [ROLES.LEGAL, ROLES.DIREKTUR],
    permission: PERMISSIONS.LEGAL_CASE_VIEW,
  },
  {
    label: 'Operasional',
    to: '/ops/operations',
    icon: Briefcase,
    roles: [ROLES.OPERASIONAL, ROLES.DIREKTUR],
    permission: PERMISSIONS.OPERATIONS_VIEW,
  },
  {
    label: 'Finance',
    to: '/ops/finance',
    icon: DollarSign,
    roles: [ROLES.FINANCE, ROLES.DIREKTUR],
    permission: PERMISSIONS.INVOICE_VIEW,
  },
  {
    label: 'Marketing',
    to: '/ops/marketing',
    icon: TrendingUp,
    roles: [ROLES.MARKETING, ROLES.DIREKTUR],
    permission: PERMISSIONS.LEAD_VIEW,
  },
  {
    label: 'IT Support',
    to: '/ops/it',
    icon: MonitorSmartphone,
    roles: [ROLES.IT_SUPPORT, ROLES.DIREKTUR],
    permission: PERMISSIONS.IT_TICKET_VIEW,
  },
  {
    label: 'Website',
    to: '/ops/website',
    icon: Globe,
    roles: [ROLES.ADMIN_WEBSITE, ROLES.DIREKTUR],
    permission: PERMISSIONS.CMS_VIEW,
  },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { currentUser, hasPermission, logout } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => {
    const roleAllowed = !item.roles || item.roles.includes(currentUser?.role);
    const permAllowed = !item.permission || hasPermission(item.permission);
    return roleAllowed && permAllowed;
  });

  const handleLogout = async () => {
    await logout();
    toast.success('Berhasil keluar.');
    navigate('/ops/login');
  };

  const NavItem = ({ item }) => (
    <NavLink
      to={item.to}
      onClick={onMobileClose}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
          isActive
            ? 'bg-primary-red/10 text-primary-red'
            : 'text-slate hover:bg-canvas hover:text-ink'
        )
      }
      aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={clsx(
              'h-5 w-5 flex-none transition-colors',
              isActive ? 'text-primary-red' : 'text-muted group-hover:text-ink'
            )}
            aria-hidden
          />
          {!collapsed && (
            <span className="truncate">{item.label}</span>
          )}
          {collapsed && (
            <span className="sr-only">{item.label}</span>
          )}
        </>
      )}
    </NavLink>
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-4 border-b border-border flex-none',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/assets/img/logo/logoAja.png"
            alt="PT. Bhimasena Adhirajasa Radhika"
            className="h-8 w-8 object-contain flex-none"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-ink text-sm leading-tight truncate">PT. BARAK</p>
              <p className="text-muted text-xs leading-tight truncate">IOMS</p>
            </div>
          )}
        </div>
        {/* Desktop collapse toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center h-7 w-7 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate"
          aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center h-7 w-7 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          aria-label="Tutup navigasi"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-border flex-none">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-primary-red/10 flex items-center justify-center flex-none">
              <span className="text-primary-red font-bold text-sm" aria-hidden>
                {currentUser?.name?.[0] ?? '?'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{currentUser?.name}</p>
              <p className="text-xs text-muted truncate">
                {ROLE_LABELS[currentUser?.role] ?? currentUser?.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5"
        aria-label="Navigasi internal"
      >
        {visibleItems.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>

      {/* Bottom: logout */}
      <div className="px-3 py-3 border-t border-border flex-none">
        <button
          onClick={handleLogout}
          className={clsx(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate hover:bg-danger/10 hover:text-danger transition-all duration-150',
            collapsed && 'justify-center'
          )}
          aria-label="Keluar dari sistem"
        >
          <LogOut className="h-5 w-5 flex-none" aria-hidden />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={clsx(
          'hidden lg:flex flex-col bg-surface border-r border-border transition-all duration-200 flex-none h-screen sticky top-0',
          collapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Sidebar navigasi"
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-surface border-r border-border shadow-modal lg:hidden"
            aria-label="Sidebar navigasi"
          >
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
