import React from 'react';
import {
  Shield,
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  CalendarCheck,
  Receipt,
  Target,
  FileText,
  Activity,
  UserCog,
  LogOut,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../app/context/AuthContext';
import { StatusBadge } from '../shared/StatusBadge';

export function DashboardSidebar({ currentPath, onNavigate, onCloseMobile }) {
  const { user, role, logout, switchRole } = useAuth();

  // Navigation schema configured by role as per 01-PRD.md & 02-USER-FLOW.md
  const getNavSections = () => {
    switch (role) {
      case 'owner':
        return [
          {
            title: 'Eksekutif',
            items: [
              { id: 'owner-overview', label: 'Ringkasan Eksekutif', icon: LayoutDashboard },
              { id: 'owner-users', label: 'Pengguna & Akses Role', icon: UserCog },
              { id: 'owner-workforce', label: 'Pemetaan Tenaga Kerja', icon: Users },
              { id: 'owner-audit', label: 'Audit & Log Aktivitas', icon: Activity }
            ]
          }
        ];
      case 'hrd':
        return [
          {
            title: 'Kepegawaian & HRD',
            items: [
              { id: 'hrd-overview', label: 'Ringkasan HRD', icon: LayoutDashboard },
              { id: 'hrd-employees', label: 'Master Tenaga Kerja', icon: Users },
              { id: 'hrd-placements', label: 'Penempatan & Mutasi', icon: Briefcase },
              { id: 'hrd-attendance', label: 'Rekap Absensi Harian', icon: CalendarCheck }
            ]
          }
        ];
      case 'operasional':
        return [
          {
            title: 'Operasional Lapangan',
            items: [
              { id: 'operasional-overview', label: 'Monitoring Operasional', icon: LayoutDashboard },
              { id: 'operasional-sites', label: 'Kelola Klien & Site', icon: Building2 },
              { id: 'operasional-placements', label: 'Disposisi Personel', icon: Users },
              { id: 'operasional-attendance', label: 'Inspeksi & Absensi', icon: CalendarCheck }
            ]
          }
        ];
      case 'finance':
        return [
          {
            title: 'Keuangan & Billing',
            items: [
              { id: 'finance-overview', label: 'Ringkasan Finansial', icon: LayoutDashboard },
              { id: 'finance-invoices', label: 'Daftar Invoice & Piutang', icon: Receipt },
              { id: 'finance-payroll-ops', label: 'Ringkasan Beban Ops', icon: FileText }
            ]
          }
        ];
      case 'marketing':
        return [
          {
            title: 'Sales & Kemitraan',
            items: [
              { id: 'marketing-overview', label: 'Ringkasan Pipeline', icon: LayoutDashboard },
              { id: 'marketing-leads', label: 'Daftar Prospek & Lead', icon: Target },
              { id: 'marketing-proposals', label: 'Pelacakan Proposal', icon: FileText }
            ]
          }
        ];
      default:
        return [];
    }
  };

  const sections = getNavSections();

  const handleNav = (id) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 h-full bg-brand-dark text-slate-300 flex flex-col border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-red flex items-center justify-center text-white shadow-sm">
            <Shield className="w-5 h-5 text-brand-yellow fill-brand-yellow/20" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-tight leading-tight">BHIMASENA</h2>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">PORTAL OPERASI</p>
          </div>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Akses Aktif</span>
          <span className="text-xs font-bold text-white capitalize">{user?.roleLabel || role}</span>
        </div>
        <StatusBadge status={role} type="role" />
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            {section.items.map((item) => {
              const isActive = currentPath === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-btn text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-red text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        ))}

        {/* Evaluator Quick Role Switcher */}
        <div className="pt-4 border-t border-slate-800">
          <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Simulasi Role
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 px-2">
            {[
              { id: 'owner', label: 'Owner' },
              { id: 'hrd', label: 'HRD' },
              { id: 'operasional', label: 'Operasional' },
              { id: 'finance', label: 'Finance' },
              { id: 'marketing', label: 'Marketing' }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  switchRole(r.id);
                  onNavigate(`${r.id}-overview`);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition-colors ${
                  role === r.id
                    ? 'bg-brand-yellow/20 text-brand-yellow border-brand-yellow/40 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User Footer with Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand-red/80 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.avatar || 'BA'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">{user?.name || 'Staff'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Keluar / Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-red hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
