import React from 'react';
import {
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
  SlidersHorizontal,
  HardDrive,
  Headphones
} from 'lucide-react';
import { useAuth } from '../../app/context/AuthContext';
import { StatusBadge } from '../shared/StatusBadge';
import { Avatar } from '../ui/Avatar';

export function DashboardSidebar({ currentPath, onNavigate, onCloseMobile, onNavigateLanding }) {
  const { user, role, logout, switchRole } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {}
    if (onNavigateLanding) {
      onNavigateLanding('login');
    } else {
      window.location.reload();
    }
  };

  // Navigation schema configured by role as per 01-PRD.md & 02-USER-FLOW.md
  const getNavSections = () => {
    switch (role) {
      case 'direktur':
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
      case 'it_support':
        return [
          {
            title: 'IT & Infrastruktur',
            items: [
              { id: 'it-overview', label: 'Ringkasan Sistem & Server', icon: LayoutDashboard },
              { id: 'it-assets', label: 'Aset IT & Perangkat Site', icon: HardDrive },
              { id: 'it-helpdesk', label: 'Tiket Helpdesk & Insiden', icon: Headphones }
            ]
          }
        ];
      case 'admin':
        return [
          {
            title: 'Administrator Web',
            items: [
              { id: 'admin-overview', label: 'Ringkasan Admin & Security', icon: LayoutDashboard },
              { id: 'admin-users', label: 'Pengguna & Reset Password', icon: UserCog },
              { id: 'admin-settings', label: 'Pengaturan Website & Config', icon: SlidersHorizontal },
              { id: 'admin-seo', label: 'Laporan SEO & Algoritma Google', icon: Activity }
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
          <img
            src="/assets/logoBarakTrans.png"
            alt="Logo Bhimasena"
            className="w-10 h-10 object-contain shrink-0"
          />
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-tight leading-tight">BARAK</h2>
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
              { id: 'owner', label: 'Direktur' },
              { id: 'hrd', label: 'HRD' },
              { id: 'operasional', label: 'Operasional' },
              { id: 'finance', label: 'Finance' },
              { id: 'marketing', label: 'Marketing' },
              { id: 'it_support', label: 'IT Support' },
              { id: 'admin', label: 'Admin Web' }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={async () => {
                  await switchRole(r.id);
                  const nextPath = (r.id === 'owner' || r.id === 'direktur') ? 'owner-overview' : `${r.id}-overview`;
                  onNavigate(nextPath);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`px-2 py-1 rounded text-[11px] font-medium border text-center transition-colors ${
                  (role === r.id || (r.id === 'owner' && role === 'direktur') || (r.id === 'direktur' && role === 'owner'))
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
            <Avatar
              src={user?.avatar}
              name={user?.name}
              size="md"
              className="ring-1 ring-white/10"
            />
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">{user?.name || 'Staff'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
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
