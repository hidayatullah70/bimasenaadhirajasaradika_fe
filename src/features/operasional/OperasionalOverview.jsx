import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api/apiClient';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Radio,
  ArrowRight
} from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function OperasionalOverview({ onNavigate }) {
  const [sites, setSites] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOps = async () => {
    setLoading(true);
    try {
      const [sitesRes, dashRes] = await Promise.all([
        api.getSites(),
        api.getDashboardSummary('operasional').catch(() => ({ success: false }))
      ]);

      if (sitesRes?.success && Array.isArray(sitesRes.data)) {
        setSites(sitesRes.data);
      }
      if (dashRes?.success && dashRes.data) {
        setDashboardData(dashRes.data);
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

  const kpi = dashboardData?.kpi || {};
  const activeSites = Number(kpi.activeSites) || Number(kpi.totalSites) || sites.length || 0;
  const totalSites = Number(kpi.totalSites) || activeSites;
  const activePlacements = Number(kpi.activePlacements) || sites.reduce((acc, s) => acc + (Number(s.active_personnel || s.required_personnel) || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Monitoring Operasional & Pengawasan Site"
        subtitle="Kesiapan pos jaga, kepatuhan jadwal shift, disposisi personel, dan status pengawasan lapangan."
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
          value={`${activeSites} Lokasi`}
          subtitle="Gedung, pabrik, kawasan komersial"
          icon={Building2}
          color="dark"
        />
        <KpiCard
          title="Kekuatan Personel Tergelar"
          value={`${activePlacements} Personel`}
          subtitle="Tersebar di seluruh shift"
          icon={ShieldCheck}
          color="green"
          trend="Pos Siaga Penuh"
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
          subtitle="Siaga respons cepat"
          icon={Radio}
          color="red"
        />
      </div>

      {/* Site Monitoring Table */}
      <Card>
        <CardHeader
          title="Status Kesiapan Site Utama Terkini"
          subtitle="Pemantauan lokasi kerja dan alokasi personil langsung dari database backend"
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
                <th className="py-2.5 px-3">Kode & Nama Site</th>
                <th className="py-2.5 px-3">Mitra Klien</th>
                <th className="py-2.5 px-3">Lokasi / Kota</th>
                <th className="py-2.5 px-3">Kekuatan Personel</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    Belum ada data lokasi kerja tersimpan.
                  </td>
                </tr>
              ) : (
                sites.map((site) => (
                  <tr key={site.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-brand-dark">{site.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{site.site_code || `SITE-${site.id}`}</p>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{site.client_name || site.clientName || `Klien ID #${site.client_id}`}</td>
                    <td className="py-2.5 px-3 text-slate-600">{site.city || site.address || '-'}</td>
                    <td className="py-2.5 px-3 font-semibold text-brand-dark">
                      {site.active_personnel ?? site.required_personnel ?? 0} Personel (Kebutuhan: {site.required_personnel || 0})
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={site.status} />
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
