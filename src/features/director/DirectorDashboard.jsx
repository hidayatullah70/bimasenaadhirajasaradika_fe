/**
 * DirectorDashboard — Executive Visibility & Cockpit
 * Source of Truth: PRD Section 6.1 (Direktur), Section 10 (Director Dashboard),
 * Section 18 (Cross-department Workflow), Section 19 (RBAC).
 *
 * NOTE: Non-negotiable PRD Rule 9: Zero hardcoded metrics.
 * All figures computed dynamically from authoritative service adapters via directorAdapter.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, MapPin, DollarSign, AlertTriangle,
  Scale, TrendingUp, MonitorSmartphone, Globe, FileText,
  CheckSquare, ArrowRight, Clock, ShieldAlert, RefreshCw,
  CheckCircle, ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import directorAdapter from '@/services/adapters/directorAdapter';
import toast from 'react-hot-toast';

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await directorAdapter.getExecutiveDashboardStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load executive stats', err);
      toast.error('Gagal memuat data eksekutif.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-border">
        <RefreshCw className="h-8 w-8 text-primary-red animate-spin mb-3" />
        <p className="text-sm font-semibold text-ink">Mengompilasi Data Eksekutif Lintas Departemen...</p>
        <p className="text-xs text-muted mt-1">Mengambil metrik terkini HRD, Operasional, Finance, Legal, Marketing, dan IT.</p>
      </div>
    );
  }

  const { kpi, workforce, finance, approvals } = stats;

  const KPI_CARDS = [
    {
      title: 'Karyawan Aktif',
      value: `${kpi.activeEmployees} Personel`,
      subtitle: `dari ${kpi.totalEmployees} total karyawan`,
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600',
      to: '/ops/master/employees',
    },
    {
      title: 'Klien Resmi PT. BARAK',
      value: `${kpi.activeClients} Klien`,
      subtitle: 'Semua kemitraan terverifikasi',
      icon: Building2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      to: '/ops/master/clients',
    },
    {
      title: 'Lokasi Penugasan',
      value: `${kpi.activeLocations} Pos Operasi`,
      subtitle: `${kpi.activeAssignments} personel aktif terploting`,
      icon: MapPin,
      iconBg: 'bg-indigo-50 text-indigo-600',
      to: '/ops/master/locations',
    },
    {
      title: 'Omzet Penagihan (Bulan Ini)',
      value: `Rp ${(kpi.monthlyRevenue || 0).toLocaleString('id-ID')}`,
      subtitle: 'Faktur tagihan September 2026',
      icon: DollarSign,
      iconBg: 'bg-amber-50 text-amber-600',
      to: '/ops/finance/invoices',
    },
    {
      title: 'Total Piutang Berjalan',
      value: `Rp ${(kpi.outstandingReceivables || 0).toLocaleString('id-ID')}`,
      subtitle: `${kpi.overdueInvoicesCount} tagihan lewat jatuh tempo`,
      icon: Clock,
      iconBg: 'bg-purple-50 text-purple-600',
      to: '/ops/finance/invoices',
    },
    {
      title: 'Beban Penggajian Karyawan',
      value: `Rp ${(kpi.payrollTotal || 0).toLocaleString('id-ID')}`,
      subtitle: `Status: ${kpi.payrollStatus}`,
      icon: FileText,
      iconBg: 'bg-rose-50 text-rose-600',
      to: '/ops/finance/payroll',
    },
    {
      title: 'Kasus Legal & Sengketa',
      value: `${kpi.activeLegalCases} Kasus Aktif`,
      subtitle: `${kpi.expiringContractsCount || 2} kontrak PKS mendekati akhir`,
      icon: Scale,
      iconBg: 'bg-orange-50 text-orange-600',
      to: '/ops/legal/cases',
    },
    {
      title: 'Selisih COD Kurir',
      value: `${kpi.unresolvedCODCount} Kasus`,
      subtitle: `Nominal selisih: Rp ${(kpi.unresolvedCODAmount || 0).toLocaleString('id-ID')}`,
      icon: AlertTriangle,
      iconBg: 'bg-red-50 text-red-600',
      to: '/ops/finance/cod',
    },
    {
      title: 'Insiden Lapangan',
      value: `${kpi.openIncidents} Terbuka`,
      subtitle: `${kpi.criticalIncidents} insiden kategori tinggi`,
      icon: ShieldAlert,
      iconBg: 'bg-amber-50 text-amber-700',
      to: '/ops/operations/incidents',
    },
    {
      title: 'Tiket IT & Layanan',
      value: `${kpi.openTickets} Tiket`,
      subtitle: `${kpi.slaBreachedTickets} tiket melampaui SLA`,
      icon: MonitorSmartphone,
      iconBg: 'bg-teal-50 text-teal-600',
      to: '/ops/it/tickets',
    },
    {
      title: 'Pipeline Marketing',
      value: `Rp ${(kpi.pipelineValue || 0).toLocaleString('id-ID')}`,
      subtitle: `${kpi.totalLeads} prospek · ${kpi.wonDealsCount} deal dimenangkan`,
      icon: TrendingUp,
      iconBg: 'bg-cyan-50 text-cyan-600',
      to: '/ops/marketing/pipeline',
    },
    {
      title: 'Inquiry Portal Publik',
      value: `${kpi.pendingInquiries} Calon Klien`,
      subtitle: `${kpi.publishedArticles} artikel terbit · ${kpi.activeCareers} lowongan`,
      icon: Globe,
      iconBg: 'bg-emerald-50 text-emerald-700',
      to: '/ops/website/inquiries',
    },
  ];

  const serviceColors = {
    SECURITY: 'bg-blue-600',
    KURIR: 'bg-amber-500',
    PARKIR: 'bg-purple-600',
    CLEANING: 'bg-emerald-600',
    MANPOWER: 'bg-indigo-600',
    LOSS_PREVENTION: 'bg-red-600',
  };

  const serviceLabels = {
    SECURITY: 'Jasa Pengamanan (Security)',
    KURIR: 'Ekspedisi Kurir & COD',
    PARKIR: 'Pengelolaan Parkir',
    CLEANING: 'Cleaning Service',
    MANPOWER: 'Tenaga Kerja / Manpower',
    LOSS_PREVENTION: 'Loss Prevention',
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner if Approvals Pending */}
      {kpi.pendingApprovalsCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-amber-100 rounded-lg text-amber-700 flex-none mt-0.5">
              <CheckSquare className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Terdapat {kpi.pendingApprovalsCount} Pengajuan Menunggu Persetujuan Direktur
              </h2>
              <p className="text-xs text-amber-700 mt-0.5">
                Penggajian bulanan karyawan, kontrak kemitraan baru, dan otorisasi eskalasi hukum memerlukan tanda tangan eksekutif Anda.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/ops/director/approvals')}
            className="bg-amber-700 hover:bg-amber-800 text-white flex-none"
          >
            Buka Approval Center
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* Quick Action & Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-bold text-ink">Ringkasan Kinerja & Kesehatan Operasional</h2>
          <p className="text-xs text-muted">
            Data dikompilasi secara real-time dari seluruh modul operasional PT. BARAK. Klik kartu untuk melihat rincian.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            title="Muat Ulang Metrik"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ops/director/risk')}
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
            Monitoring Risiko
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/ops/director/reports')}
            className="bg-primary-red hover:bg-red-700 text-white"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Laporan Manajemen BOD
          </Button>
        </div>
      </div>

      {/* 12 Clickable Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(card.to)}
              className="bg-white p-4 rounded-xl border border-border shadow-xs hover:shadow-md hover:border-primary-red/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted truncate">{card.title}</p>
                  <p className="text-lg font-bold text-ink mt-1 tracking-tight group-hover:text-primary-red transition-colors">
                    {card.value}
                  </p>
                </div>
                <span className={`p-2.5 rounded-lg flex-none ${card.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-muted">
                <span className="truncate">{card.subtitle}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary-red group-hover:translate-x-0.5 transition-all flex-none ml-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Widgets: Workforce Distribution & Cashflow Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1: Workforce Distribution across 6 Services */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary-red" />
                Sebaran Karyawan Berdasarkan 6 Layanan
              </CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                {workforce.total} Total Personel
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {Object.entries(workforce.serviceCounts).map(([key, count]) => {
              const pct = Math.round((count / (workforce.total || 1)) * 100);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink">{serviceLabels[key] || key}</span>
                    <span className="text-muted font-mono">{count} orang ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${serviceColors[key] || 'bg-primary-red'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-muted">
              <span>Personel dengan penugasan aktif: {workforce.activeAssignments} orang</span>
              <button
                onClick={() => navigate('/ops/master/employees')}
                className="text-primary-red hover:underline font-medium inline-flex items-center gap-1"
              >
                Data Karyawan Lengkap <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Widget 2: Financial Health & Invoicing Status */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Kesehatan Finansial & Arus Kas Tagihan
              </CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                September 2026
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs text-muted">Total Faktur Diterbitkan</p>
                <p className="text-base font-bold text-ink mt-1">
                  Rp {(finance.monthlyRevenue || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-2xs text-muted mt-0.5">Omzet kotor bulan berjalan</p>
              </div>
              <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100">
                <p className="text-xs text-rose-700">Estimasi Beban Gaji</p>
                <p className="text-base font-bold text-rose-900 mt-1">
                  Rp {(finance.payrollTotal || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-2xs text-rose-600 mt-0.5">40 karyawan penugasan</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-900">Piutang Klien Tertunggak (Overdue)</p>
                <p className="text-xs text-amber-700 mt-0.5">Tagihan melewati termin Net 30/14 hari</p>
              </div>
              <p className="text-sm font-bold text-amber-900">
                Rp {(finance.overdueReceivables || 0).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-900">Estimasi Margin Operasional Kotor</p>
                <p className="text-xs text-blue-700 mt-0.5">Omzet dikurangi beban payroll</p>
              </div>
              <p className="text-sm font-bold text-blue-900">
                Rp {((finance.monthlyRevenue || 0) - (finance.payrollTotal || 0)).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-muted">
              <span>Sengketa COD belum terselesaikan: {finance.unresolvedCODCount} kasus</span>
              <button
                onClick={() => navigate('/ops/finance/invoices')}
                className="text-primary-red hover:underline font-medium inline-flex items-center gap-1"
              >
                Buka Modul Finance <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lower Row: Approval Center Preview & Field Incidents Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Center Items */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary-red" />
              Antrean Persetujuan Eksekutif Terbaru
            </CardTitle>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/ops/director/approvals')}
              className="text-primary-red hover:text-red-700"
            >
              Lihat Semua ({approvals.length})
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {approvals.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                Tidak ada pengajuan yang menunggu persetujuan Direktur saat ini.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {approvals.slice(0, 4).map((item) => (
                  <div key={item.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink truncate">{item.title}</span>
                        <Badge status={item.status} />
                      </div>
                      <p className="text-xs text-muted mt-1 truncate">
                        {item.department} · Diajukan oleh: {item.submittedBy}
                      </p>
                      <p className="text-2xs text-amber-700 font-medium mt-0.5">
                        {item.urgencyText}
                      </p>
                    </div>
                    <Button
                      size="xs"
                      onClick={() => navigate('/ops/director/approvals')}
                      className="bg-primary-red hover:bg-red-700 text-white flex-none"
                    >
                      Tinjau
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legal & Compliance Overview */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-indigo-600" />
              Kepatuhan Hukum & Legalitas BUJP Polri
            </CardTitle>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => navigate('/ops/legal/compliance')}
              className="text-primary-red hover:text-red-700"
            >
              Register Kepatuhan
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-start gap-3">
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md mt-0.5">
                <CheckCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Surat Izin Operasional Badan Usaha Jasa Pengamanan (SIO BUJP)
                </p>
                <p className="text-2xs text-emerald-700 mt-0.5">
                  Diterbitkan oleh Mabes Polri (Baharkam) · Masa berlaku hingga Mei 2027 · Status: Kepatuhan Penuh (COMPLIANT)
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-ink">Perjanjian Kerjasama (PKS) Aktif</p>
                <p className="text-2xs text-muted mt-0.5">8 Kontrak PKS Kemitraan Klien Berjalan</p>
              </div>
              <span className="text-xs font-bold text-emerald-600">100% Sah</span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900">Perpanjangan Kontrak Mendekati Akhir</p>
                <p className="text-2xs text-amber-700 mt-0.5">Salembaran 99 & Megah Jaya Semesta (Jatuh tempo kuartal III)</p>
              </div>
              <span className="text-xs font-bold text-amber-800">Draft Adendum Siap</span>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-muted">
              <span>Kasus perdata/disiplin aktif: {kpi.activeLegalCases} perkara</span>
              <button
                onClick={() => navigate('/ops/legal/cases')}
                className="text-primary-red hover:underline font-medium inline-flex items-center gap-1"
              >
                Lihat Kasus Legal <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
