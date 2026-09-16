import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { api } from '../../services/api/apiClient';
import {
  Users,
  Building2,
  Receipt,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function OwnerOverview({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardSummary('owner');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat ringkasan eksekutif');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Eksekutif Direksi" subtitle="Memuat data performa..." />
        <LoadingSkeleton type="cards" count={4} />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Eksekutif Direksi" />
        <ErrorState message={error} onRetry={fetchSummary} />
      </div>
    );
  }

  const { kpi, servicesSummary, recentActivities, recentInvoices } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Ringkasan Eksekutif Direksi"
        subtitle="Konsolidasi performa operasional, keuangan, dan utilisasi tenaga kerja PT. Bhimasena Adhirajasa Radhika."
        breadcrumb={['Dashboard', 'Owner', 'Overview']}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Tenaga Kerja Aktif"
          value={`${kpi.totalEmployees} Orang`}
          subtitle="Terserap di 6 pilar layanan"
          icon={Users}
          color="red"
          trend="+8.5%"
          trendDirection="up"
        />
        <KpiCard
          title="Mitra & Site Aktif"
          value={`${kpi.totalClients} Korporasi`}
          subtitle={`${kpi.activeSites} Site operasional`}
          icon={Building2}
          color="dark"
          trend="+3 Klien"
          trendDirection="up"
        />
        <KpiCard
          title="Rata-rata Presensi SLA"
          value={kpi.attendanceRate}
          subtitle="Standar minimum 98.0%"
          icon={CheckCircle2}
          color="green"
          trend="Melampaui Target"
          trendDirection="up"
        />
        <KpiCard
          title="Omset Tagihan Berjalan"
          value={kpi.monthlyRevenue}
          subtitle="Piutang: Rp 505 Jt"
          icon={Receipt}
          color="yellow"
          trend="+12% MoM"
          trendDirection="up"
        />
      </div>

      {/* Grid: 6 Services Breakdown & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 6 Services Breakdown */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader
              title="Distribusi Tenaga Kerja per Pilar Layanan"
              subtitle="Sebaran alokasi personil pada 6 layanan utama outsourcing"
            />
            <div className="space-y-4">
              {servicesSummary.map((srv, idx) => {
                const percentage = Math.round((srv.activePersonnel / 1520) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-brand-dark">
                      <span>{srv.title}</span>
                      <span className="text-slate-500">
                        {srv.activePersonnel} Personel ({percentage}%) • {srv.clientCount} Klien
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? 'bg-brand-red'
                            : idx === 1
                            ? 'bg-amber-500'
                            : idx === 2
                            ? 'bg-emerald-600'
                            : idx === 3
                            ? 'bg-cyan-500'
                            : idx === 4
                            ? 'bg-blue-600'
                            : 'bg-purple-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Audit & Activity Feed */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader
              title="Log Audit & Aktivitas Terkini"
              subtitle="Pencatatan tindakan manajerial lintas divisi"
              action={
                <button
                  onClick={() => onNavigate('owner-audit')}
                  className="text-xs font-semibold text-brand-red hover:underline"
                >
                  Lihat Semua
                </button>
              }
            />
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-brand-dark">{act.action}</span>
                    <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                  </div>
                  <p className="text-slate-600 leading-snug">{act.description}</p>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-700">{act.user}</span>
                    <span>•</span>
                    <StatusBadge status={act.role} type="role" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
