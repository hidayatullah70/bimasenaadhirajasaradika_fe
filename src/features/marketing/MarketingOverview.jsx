import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api/apiClient';
import { Target, TrendingUp, Users2, FileText, Plus, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';

export function MarketingOverview({ onNavigate }) {
  const [leads, setLeads] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketingData = async () => {
    setLoading(true);
    try {
      const [leadsRes, dashRes] = await Promise.all([
        api.getLeads({ limit: 5 }),
        api.getDashboardSummary('marketing').catch(() => ({ success: false }))
      ]);

      if (leadsRes?.success && Array.isArray(leadsRes.data)) {
        setLeads(leadsRes.data);
      }
      if (dashRes?.success && dashRes.data) {
        setDashboardData(dashRes.data);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat ringkasan marketing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Pemasaran & Business Development" subtitle="Memuat data pipeline..." />
        <LoadingSkeleton type="cards" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Pemasaran & Business Development" />
        <ErrorState message={error} onRetry={fetchMarketingData} />
      </div>
    );
  }

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const kpi = dashboardData?.kpi || {};
  const openLeads = kpi.openLeadsCount ?? leads.filter(l => l.status !== 'won' && l.status !== 'lost').length;
  const wonLeads = kpi.wonLeadsCount ?? leads.filter(l => l.status === 'won').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Ringkasan Pipeline Pemasaran & Kemitraan"
        subtitle="Manajemen prospek baru, pelacakan proposal alih daya, dan konversi kontrak tender."
        breadcrumb={['Dashboard', 'Marketing', 'Overview']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => onNavigate('marketing-leads')}
          >
            Tambah Prospek Klien
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Prospek Berjalan"
          value={`${openLeads} Prospek`}
          subtitle="Pipeline aktif saat ini"
          icon={Target}
          color="red"
          trend="+22% MoM"
          trendDirection="up"
        />
        <KpiCard
          title="Kontrak Dimenangkan (Won)"
          value={`${wonLeads} Klien`}
          subtitle="SPK & Kontrak disepakati"
          icon={Users2}
          color="dark"
        />
        <KpiCard
          title="Tingkat Konversi Prospek"
          value="68.5%"
          subtitle="Lead ke SPK kontrak"
          icon={TrendingUp}
          color="green"
          trend="+5.2%"
          trendDirection="up"
        />
        <KpiCard
          title="Total Nilai Pipeline"
          value={formatRupiah(leads.reduce((acc, l) => acc + (Number(l.estimated_value) || 0), 0))}
          subtitle="Estimasi potensi kontrak"
          icon={FileText}
          color="yellow"
        />
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader
          title="Prospek Kemitraan Terkini"
          subtitle="Perkembangan tahapan calon klien dari formulir website dan tender langsung di database backend"
          action={
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => onNavigate('marketing-leads')}
            >
              Kelola Seluruh Pipeline
            </Button>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-3">Nama Perusahaan & PIC</th>
                <th className="py-2.5 px-3">Sumber Prospek</th>
                <th className="py-2.5 px-3">Estimasi Nilai Kontrak</th>
                <th className="py-2.5 px-3">Tahapan Pipeline</th>
                <th className="py-2.5 px-3">Tgl Masuk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    Belum ada data prospek tersimpan.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-brand-dark">{lead.company_name || lead.company || 'Perusahaan Prospek'}</p>
                      <p className="text-slate-400 text-[11px]">{lead.contact_name || lead.picName} ({lead.phone || lead.picPhone || '-'})</p>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{lead.source || 'Website Form'}</td>
                    <td className="py-2.5 px-3 font-bold text-brand-dark">{formatRupiah(lead.estimated_value || lead.estimatedValue)}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={lead.status || lead.stage} type="lead" />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{lead.created_at ? lead.created_at.split(' ')[0] : 'Hari Ini'}</td>
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
