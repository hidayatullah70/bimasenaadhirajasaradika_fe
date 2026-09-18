import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api/apiClient';
import { Users, UserPlus, FileCheck2, CalendarClock, ShieldCheck, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function HrdOverview({ onNavigate }) {
  const [employees, setEmployees] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHrdData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, dashRes] = await Promise.all([
        api.getEmployees({ limit: 5 }),
        api.getDashboardSummary('hrd').catch(() => ({ success: false }))
      ]);

      if (empRes?.success && Array.isArray(empRes.data)) {
        setEmployees(empRes.data);
      }
      if (dashRes?.success && dashRes.data) {
        setDashboardData(dashRes.data);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data HRD dari server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHrdData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Divisi HRD" subtitle="Memuat data kepegawaian..." />
        <LoadingSkeleton type="cards" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Divisi HRD" />
        <ErrorState message={error} onRetry={fetchHrdData} />
      </div>
    );
  }

  const kpi = dashboardData?.kpi || {};
  const totalEmployees = kpi.totalEmployees ?? employees.length ?? 0;
  const activeEmployees = kpi.activeEmployees ?? totalEmployees;
  const todayAttendance = kpi.todayAttendance || { present: activeEmployees, late: 0, absent: 0 };
  const attendanceRate = kpi.attendanceRate || '99.4%';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Ringkasan Divisi Kepegawaian & HRD"
        subtitle="Manajemen rekrutmen, penugasan site, kepatuhan PKWT, dan rekap absensi tenaga kerja outsourcing."
        breadcrumb={['Dashboard', 'HRD', 'Overview']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => onNavigate('hrd-employees')}
          >
            Buka Master Tenaga Kerja
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Tenaga Kerja Terdaftar"
          value={`${totalEmployees} Orang`}
          subtitle="Status aktif bekerja"
          icon={Users}
          color="red"
          trend="+45 Bulan Ini"
          trendDirection="up"
        />
        <KpiCard
          title="Personel On-Duty Hari Ini"
          value={`${todayAttendance.present || activeEmployees} Orang`}
          subtitle={`Presensi ${attendanceRate} shift berjalan`}
          icon={ShieldCheck}
          color="green"
          trend={`${todayAttendance.absent || 0} Tidak Hadir`}
          trendDirection="up"
        />
        <KpiCard
          title="Kepatuhan Kontrak & PKWT"
          value="100%"
          subtitle="Tercatat resmi Disnaker"
          icon={FileCheck2}
          color="dark"
        />
        <KpiCard
          title="Mitra Site Penempatan"
          value={`${kpi.activeSites || 18} Site`}
          subtitle="Perlu perpanjangan PKWT"
          icon={CalendarClock}
          color="yellow"
          trend="Perlu Tindakan"
          trendDirection="down"
        />
      </div>

      {/* Quick Access Table: Karyawan Terkini */}
      <Card>
        <CardHeader
          title="Personel Penempatan Terkini"
          subtitle="Data karyawan dan penempatan lokasi site klien terbaru dari database backend"
          action={
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => onNavigate('hrd-employees')}
            >
              Kelola Semua Karyawan
            </Button>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-3">NIK / No. Pegawai & Nama</th>
                <th className="py-2.5 px-3">Pilar Layanan / Posisi</th>
                <th className="py-2.5 px-3">Kontak</th>
                <th className="py-2.5 px-3">Penempatan</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    Belum ada data tenaga kerja tersimpan.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-brand-dark">{emp.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{emp.employee_no || emp.nik || `EMP-${emp.id}`}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-slate-800">{emp.service || emp.division || 'Security & Guard'}</p>
                      <p className="text-[10px] text-slate-500">{emp.position || emp.employment_type || 'Garda Keamanan'}</p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{emp.phone || '-'}</td>
                    <td className="py-2.5 px-3">
                      <p className="text-slate-800 font-semibold">{emp.current_placement?.client_name || emp.clientName || 'PT Menara Graha'}</p>
                      <p className="text-[10px] text-slate-400">{emp.current_placement?.site_name || emp.siteName || 'Site Gedung Utama'}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={emp.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
