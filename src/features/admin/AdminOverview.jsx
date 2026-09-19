import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  ShieldAlert,
  Users,
  Search,
  Globe,
  Lock,
  KeyRound,
  Server,
  Settings
} from 'lucide-react';

export function AdminOverview({ onNavigate }) {
  const [systemStats] = useState({
    totalUsers: 6,
    activeSessions: 4,
    pendingResetRequests: 1,
    failedLoginAttempts: 2,
    seoScore: 94,
    serverUptime: '99.98%'
  });

  const recentSecurityEvents = [
    {
      id: 'sec-1',
      event: 'Permintaan Reset Kata Sandi Baru',
      user: 'Bagas Pratama (Finance)',
      ip: '180.252.164.22',
      time: '10 menit yang lalu',
      status: 'pending',
      severity: 'medium'
    },
    {
      id: 'sec-2',
      event: 'Percobaan Login Gagal (Wrong Password)',
      user: 'unknown@external-ip.net',
      ip: '114.124.201.88',
      time: '1 jam yang lalu',
      status: 'blocked',
      severity: 'high'
    },
    {
      id: 'sec-3',
      event: 'Perubahan Otoritas Role Pengguna',
      user: 'Juli Priyanto (Direktur)',
      ip: '182.1.88.190',
      time: '3 jam yang lalu',
      status: 'success',
      severity: 'low'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Pusat Kendali Administrator Website & Keamanan"
        subtitle="Pengawasan akses pengguna, permohonan reset password, status algoritma Google/SEO, dan integritas sistem."
        breadcrumb={['Dashboard', 'Admin', 'Overview']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={KeyRound}
              onClick={() => onNavigate('admin-users')}
            >
              Permintaan Reset Password ({systemStats.pendingResetRequests})
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Search}
              onClick={() => onNavigate('admin-seo')}
            >
              Laporan SEO & Algoritma Google
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Akun Pengguna Terdaftar"
          value={`${systemStats.totalUsers} Akun`}
          subtitle="6 Role operasional aktif"
          icon={Users}
          color="dark"
        />
        <KpiCard
          title="Permintaan Reset Password"
          value={`${systemStats.pendingResetRequests} Pending`}
          subtitle="Memerlukan tindakan admin"
          icon={KeyRound}
          color="yellow"
          trend="1 Menunggu"
          trendDirection="down"
        />
        <KpiCard
          title="Skor Kesehatan SEO & Google"
          value={`${systemStats.seoScore}/100`}
          subtitle="Core Web Vitals Optimal"
          icon={Globe}
          color="green"
          trend="Grade A+"
          trendDirection="up"
        />
        <KpiCard
          title="Keamanan & Percobaan Gagal"
          value={`${systemStats.failedLoginAttempts} Percobaan`}
          subtitle="Sistem proteksi rate-limit aktif"
          icon={ShieldAlert}
          color="red"
        />
      </div>

      {/* Security Logs & Quick Configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card>
            <CardHeader
              title="Log Keamanan & Percobaan Akses Sistem"
              subtitle="Pencatatan real-time upaya login, kegagalan otentikasi, dan IP address pengakses"
              action={
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => onNavigate('admin-users')}
                >
                  Kelola Pengguna
                </Button>
              }
            />
            <div className="space-y-3">
              {recentSecurityEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          evt.severity === 'high'
                            ? 'bg-red-100 text-red-800'
                            : evt.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {evt.severity.toUpperCase()}
                      </span>
                      <span className="font-bold text-brand-dark">{evt.event}</span>
                    </div>
                    <p className="text-slate-600">
                      User: <span className="font-semibold">{evt.user}</span> • IP: <span className="font-mono">{evt.ip}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">{evt.time}</p>
                  </div>

                  {evt.status === 'pending' ? (
                    <Button
                      variant="primary"
                      size="xs"
                      className="!bg-brand-red whitespace-nowrap"
                      onClick={() => onNavigate('admin-users')}
                    >
                      Proses Reset
                    </Button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Tercatat</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader
              title="Status Server & Konfigurasi Cepat"
              subtitle="Indikator kesiapan infrastruktur backend"
            />
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-700">Database & REST API Engine</span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                  Online (Uptime {systemStats.serverUptime})
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-700">Status Domain Utama</span>
                </div>
                <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                  bimasenaadhirajasaradika.com
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-slate-700">Sertifikat SSL / HTTPS</span>
                </div>
                <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
                  Aktif (TLS 1.3)
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  icon={Settings}
                  onClick={() => onNavigate('admin-settings')}
                >
                  Pengaturan Website
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
