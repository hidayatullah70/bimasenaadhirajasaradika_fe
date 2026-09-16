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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHrdData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getEmployees({ limit: 5 });
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data HRD');
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
          value="1,520 Orang"
          subtitle="Status aktif bekerja"
          icon={Users}
          color="red"
          trend="+45 Bulan Ini"
          trendDirection="up"
        />
        <KpiCard
          title="Personel On-Duty Hari Ini"
          value="1,511 Orang"
          subtitle="Presensi 99.4% shift berjalan"
          icon={ShieldCheck}
          color="green"
          trend="9 Personel Cuti/Izin"
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
          title="Kontrak Berakhir &lt; 60 Hari"
          value="18 Orang"
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
          subtitle="Data karyawan dan penempatan lokasi site klien terbaru"
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
                <th className="py-2.5 px-3">NIK & Nama</th>
                <th className="py-2.5 px-3">Pilar Layanan</th>
                <th className="py-2.5 px-3">Jabatan</th>
                <th className="py-2.5 px-3">Site Penempatan</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-brand-dark">{emp.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{emp.nik}</p>
                  </td>
                  <td className="py-2.5 px-3 font-medium">{emp.service}</td>
                  <td className="py-2.5 px-3 text-slate-600">{emp.position}</td>
                  <td className="py-2.5 px-3">
                    <p className="text-slate-800 font-semibold">{emp.clientName}</p>
                    <p className="text-[10px] text-slate-400">{emp.siteName}</p>
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={emp.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
