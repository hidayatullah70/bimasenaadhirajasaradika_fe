import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api/apiClient';
import { INITIAL_SITES } from '../../services/mock/mockData';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Radio,
  ArrowRight,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function OperasionalOverview({ onNavigate }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOps = async () => {
    setLoading(true);
    try {
      const res = await api.getSites();
      if (res.success) {
        setSites(res.data);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat ringkasan operasional');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOps();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Monitoring Operasional Lapangan" subtitle="Memuat data pengawasan..." />
        <LoadingSkeleton type="cards" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Monitoring Operasional Lapangan" />
        <ErrorState message={error} onRetry={fetchOps} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Monitoring Operasional & Pengawasan Site"
        subtitle="Kesiapan pos jaga, kepatuhan jadwal shift, disposisi personel, dan status insiden lapangan."
        breadcrumb={['Dashboard', 'Operasional', 'Overview']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Building2}
            onClick={() => onNavigate('operasional-sites')}
          >
            Kelola Site & Klien
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Site Aktif Terkelola"
          value="14 Lokasi"
          subtitle="Gedung, pabrik, hub logistik"
          icon={Building2}
          color="dark"
        />
        <KpiCard
          title="Kepatuhan Shift Hari Ini"
          value="99.8%"
          subtitle="Seluruh pos terisi penuh"
          icon={ShieldCheck}
          color="green"
          trend="Nir-Keterlambatan"
          trendDirection="up"
        />
        <KpiCard
          title="Insiden Keamanan / Isu Kritis"
          value="0 Kasus"
          subtitle="Status kondusif & aman"
          icon={AlertTriangle}
          color="yellow"
          trend="Aman Terkendali"
          trendDirection="up"
        />
        <KpiCard
          title="Kesiapan Buffer / Backup"
          value="100%"
          subtitle="Siaga respons < 3 jam"
          icon={Radio}
          color="red"
        />
      </div>

      {/* Site Monitoring Table */}
      <Card>
        <CardHeader
          title="Status Kesiapan Site Utama Terkini"
          subtitle="Pemantauan pengawas regu (Danru/Supervisor) dan skor SLA harian"
          action={
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => onNavigate('operasional-sites')}
            >
              Lihat Seluruh Site
            </Button>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-3">Nama Site & Lokasi</th>
                <th className="py-2.5 px-3">Mitra Klien</th>
                <th className="py-2.5 px-3">Danru / Supervisor Jaga</th>
                <th className="py-2.5 px-3">Kekuatan Personel</th>
                <th className="py-2.5 px-3">Skor SLA Harian</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sites.map((site) => (
                <tr key={site.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3">
                    <p className="font-bold text-brand-dark">{site.name}</p>
                    <p className="text-[10px] text-slate-400">{site.location}</p>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{site.clientName}</td>
                  <td className="py-2.5 px-3 text-slate-600">{site.assignedSupervisor}</td>
                  <td className="py-2.5 px-3 font-semibold text-brand-dark">{site.totalPersonnel} Personel</td>
                  <td className="py-2.5 px-3 font-bold text-brand-green">{site.slaScore}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={site.status} />
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
