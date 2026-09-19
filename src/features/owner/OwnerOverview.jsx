import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import {
  Users,
  Building2,
  Receipt,
  CheckCircle2,
  ShieldCheck,
  Printer,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  Layers
} from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function OwnerOverview({ onNavigate }) {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  // Approval items across departments
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'appr-1',
      dept: 'HRD',
      title: 'Pengajuan Kontrak PKWT Personel Batch 4 (15 Personel)',
      applicant: 'Robyn Topani (HRD)',
      date: '19 Sep 2026',
      amount: 'Rp 67.500.000 / bln',
      status: 'pending'
    },
    {
      id: 'appr-2',
      dept: 'Finance',
      title: 'Diskon Khusus Termin Tagihan PT. Astra International (2.5%)',
      applicant: 'Bagas Pratama (Finance)',
      date: '19 Sep 2026',
      amount: 'Potongan Rp 1.250.000',
      status: 'pending'
    },
    {
      id: 'appr-3',
      dept: 'Marketing',
      title: 'Persetujuan Proposal Tender Pengadaan Security Kawasan GIIC',
      applicant: 'Nazi Rinaldi (Marketing)',
      date: '18 Sep 2026',
      amount: 'Nilai Prospek Rp 250.000.000',
      status: 'pending'
    }
  ]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardSummary('direktur');
      if (res?.success && res?.data) {
        setData(res.data);
      } else {
        throw new Error(res?.message || 'Gagal memuat ringkasan eksekutif');
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

  const handleApprove = (id, isApproved = true) => {
    setPendingApprovals(prev =>
      prev.map(item => (item.id === id ? { ...item, status: isApproved ? 'approved' : 'rejected' } : item))
    );
    addToast(
      isApproved
        ? 'Otoritas Direksi: Permohonan berhasil disetujui resmi!'
        : 'Permohonan telah ditolak oleh Direksi.',
      isApproved ? 'success' : 'warning'
    );
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Eksekutif Direksi" subtitle="Memuat data performa..." />
        <LoadingSkeleton type="cards" count={4} />
        <LoadingSkeleton type="table" count={3} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Eksekutif Direksi" />
        <ErrorState message={error || 'Data tidak tersedia'} onRetry={fetchSummary} />
      </div>
    );
  }

  const kpi = data.kpi || {};
  const servicesSummary = Array.isArray(data.servicesSummary) ? data.servicesSummary : [];
  const recentActivities = Array.isArray(data.recentActivities) ? data.recentActivities : [];
  const totalEmp = Number(kpi.totalEmployees) || 1;
  const pendingCount = pendingApprovals.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 print:p-0">
      <PageHeader
        title="Ringkasan Eksekutif & Supervisi Direksi"
        subtitle="Konsolidasi performa operasional, keuangan, kepatuhan SLA, dan pusat persetujuan manajerial PT. Bhimasena Adhirajasa Radhika."
        breadcrumb={['Dashboard', 'Direktur', 'Overview']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={FileCheck}
              onClick={() => setIsApprovalModalOpen(true)}
              className="relative"
            >
              Approval Center
              {pendingCount > 0 && (
                <span className="bg-brand-red text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-1">
                  {pendingCount}
                </span>
              )}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Printer}
              onClick={handleExportPDF}
            >
              Export Laporan Eksekutif (PDF)
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Tenaga Kerja Aktif"
          value={`${kpi.totalEmployees ?? kpi.activeEmployees ?? 0} Orang`}
          subtitle="Terserap di pilar layanan"
          icon={Users}
          color="red"
          trend="+8.5%"
          trendDirection="up"
        />
        <KpiCard
          title="Mitra & Site Aktif"
          value={`${kpi.totalClients ?? 0} Korporasi`}
          subtitle={`${kpi.activeSites ?? 0} Site operasional`}
          icon={Building2}
          color="dark"
          trend="+3 Klien"
          trendDirection="up"
        />
        <KpiCard
          title="Rata-rata Presensi SLA"
          value={typeof kpi.attendanceRate === 'number' ? `${kpi.attendanceRate}%` : (kpi.attendanceRate || '99.4%')}
          subtitle="Standar minimum 98.0%"
          icon={CheckCircle2}
          color="green"
          trend="Melampaui Target"
          trendDirection="up"
        />
        <KpiCard
          title="Omset Tagihan Berjalan"
          value={kpi.monthlyRevenue ? (typeof kpi.monthlyRevenue === 'number' ? `Rp ${kpi.monthlyRevenue.toLocaleString('id-ID')}` : kpi.monthlyRevenue) : 'Rp 450.000.000'}
          subtitle={`Piutang: ${kpi.pendingReceivables ? (typeof kpi.pendingReceivables === 'number' ? `Rp ${kpi.pendingReceivables.toLocaleString('id-ID')}` : kpi.pendingReceivables) : 'Rp 85 Jt'}`}
          icon={Receipt}
          color="yellow"
          trend="+12% MoM"
          trendDirection="up"
        />
      </div>

      {/* Grid: Services Breakdown & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Services Breakdown */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader
              title="Distribusi Tenaga Kerja per Pilar Layanan"
              subtitle="Sebaran alokasi personil pada layanan outsourcing aktif"
            />
            <div className="space-y-4">
              {servicesSummary.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Belum ada rincian pilar layanan</p>
              ) : (
                servicesSummary.map((srv, idx) => {
                  const personnelCount = Number(srv.activePersonnel || srv.personnel_count || srv.total || 0);
                  const percentage = totalEmp > 0 ? Math.min(100, Math.round((personnelCount / totalEmp) * 100)) : 0;
                  return (
                    <div key={srv.id || idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-brand-dark">
                        <span>{srv.title || srv.name || `Layanan ${srv.code || ''}`}</span>
                        <span className="text-slate-500">
                          {personnelCount} Personel ({percentage}%) • {srv.clientCount || srv.client_count || 1} Klien
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
                          style={{ width: `${Math.max(percentage, 8)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
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
                  className="text-xs font-semibold text-brand-red hover:underline cursor-pointer"
                >
                  Lihat Semua
                </button>
              }
            />
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Belum ada aktivitas tercatat</p>
              ) : (
                recentActivities.slice(0, 5).map((act, idx) => (
                  <div key={act.id || idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-brand-dark">{act.action || 'ACTIVITY'}</span>
                      <span className="text-[10px] text-slate-400">{act.created_at || act.timestamp || '-'}</span>
                    </div>
                    <p className="text-slate-600 leading-snug">{act.description || `${act.action} pada resource ${act.resource}`}</p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700">{act.user_name || act.user || 'Staf'}</span>
                      <span>•</span>
                      <StatusBadge status={act.role_name || act.role || 'direktur'} type="role" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Approval Center Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        title="Pusat Otoritas & Approval Direksi"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Berikut adalah permohonan manajerial lintas departemen yang memerlukan persetujuan eksekutif Direktur:
          </p>

          <div className="space-y-3">
            {pendingApprovals.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-brand-dark text-white">
                      {item.dept}
                    </span>
                    <span className="text-slate-400">{item.date}</span>
                  </div>
                  <h4 className="font-bold text-brand-dark text-sm">{item.title}</h4>
                  <p className="text-slate-500 mt-0.5">Pemohon: {item.applicant} • Nilai: <span className="font-semibold text-brand-red">{item.amount}</span></p>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'pending' ? (
                    <>
                      <Button
                        variant="primary"
                        size="xs"
                        className="!bg-emerald-600 hover:!bg-emerald-700"
                        icon={CheckCircle}
                        onClick={() => handleApprove(item.id, true)}
                      >
                        Setujui
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        className="!text-red-700 !border-red-300 hover:!bg-red-50"
                        icon={XCircle}
                        onClick={() => handleApprove(item.id, false)}
                      >
                        Tolak
                      </Button>
                    </>
                  ) : (
                    <span
                      className={`font-bold px-2.5 py-1 rounded text-[11px] ${
                        item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsApprovalModalOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
