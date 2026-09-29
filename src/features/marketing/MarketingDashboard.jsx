/**
 * Marketing Dashboard Page — PT. BARAK IOMS
 * Authoritative KPI dashboard and quick overview for Marketing & Commercial operations.
 * Source of Truth: PRD Section 15 (Marketing Module) & Section 18 (Cross-department workflow).
 */

import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, Users, ArrowUpRight, Plus, CheckCircle2, ChevronRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { StateLoading } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { marketingAdapter } from '@/services/adapters/marketingAdapter';
import LeadFormModal from './leads/LeadFormModal';

export default function MarketingDashboard() {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentHandovers, setRecentHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, leadsRes, handoversRes] = await Promise.all([
        marketingAdapter.getMarketingStats(),
        marketingAdapter.getLeads({ pageSize: 5 }),
        marketingAdapter.getHandovers({ pageSize: 4 }),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (leadsRes.data) setRecentLeads(leadsRes.data);
      if (handoversRes.data) setRecentHandovers(handoversRes.data);
    } catch {
      toast.error('Gagal memuat metrik dashboard marketing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl border border-border shadow-xs">
        <StateLoading message="Menghitung analitik pipeline dan database prospek pemasaran..." />
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Prospek (Leads)',
      value: stats?.totalLeads || 0,
      sub: `${stats?.newLeads || 0} Baru masuk`,
      icon: <Target className="h-5 w-5 text-primary-red" />,
      iconBg: 'bg-primary-red/10',
    },
    {
      title: 'Prospek Terkualifikasi (Qualified)',
      value: stats?.qualifiedLeads || 0,
      sub: 'Profil & anggaran tervalidasi',
      icon: <Users className="h-5 w-5 text-blue-600" />,
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Penawaran Harga (Quotation)',
      value: 3,
      sub: 'Draft PKS & kalkulasi margin',
      icon: <ArrowUpRight className="h-5 w-5 text-purple-600" />,
      iconBg: 'bg-purple-50',
    },
    {
      title: 'Tahap Negosiasi Akhir',
      value: 2,
      sub: 'Kajian term komersial B2B',
      icon: <TrendingUp className="h-5 w-5 text-amber-600" />,
      iconBg: 'bg-amber-50',
    },
    {
      title: 'Deal WON Dimenangkan',
      value: stats?.wonOpportunitiesCount || 0,
      sub: `Nilai: ${formatRupiah(stats?.wonValue || 0)} /bln`,
      icon: <DollarSign className="h-5 w-5 text-accent-green" />,
      iconBg: 'bg-accent-green/10',
    },
    {
      title: 'Pipeline & Win Rate',
      value: `${stats?.conversionRate || 0}%`,
      sub: `Total: ${formatRupiah(stats?.totalPipelineValue || 0)}`,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-bold text-ink">Ringkasan Kinerja Komersial PT. BARAK</h2>
          <p className="text-xs text-muted">
            Pantauan akuisisi klien baru dari tahap prospek, survei lapangan, hingga serah terima resmi ke Operasional.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/ops/marketing/pipeline">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Lihat CRM Pipeline</span>
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsLeadModalOpen(true)}
            className="text-xs gap-1.5 bg-primary-red hover:bg-red-700 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Lead</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col justify-between h-full"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-2xs font-bold uppercase tracking-wider text-muted line-clamp-1">{kpi.title}</p>
              <div className={`p-2 rounded-lg ${kpi.iconBg} flex-shrink-0`}>{kpi.icon}</div>
            </div>
            <div className="mt-2">
              <p className="text-lg sm:text-xl font-bold text-ink">{kpi.value}</p>
              <p className="text-2xs text-muted mt-0.5 line-clamp-1">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>


      {/* Grid: Leads by Source & Stage Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Distribusi Sumber Prospek (Lead Source)</span>
              <span className="text-xs font-normal text-muted">15 Prospek Aktif</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.leadsBySource && Object.entries(stats.leadsBySource).map(([src, count]) => {
              const pct = Math.round((count / (stats.totalLeads || 1)) * 100);
              const labelMap = {
                WEBSITE: 'Website BARAK',
                REFERRAL: 'Rekomendasi Klien',
                OUTBOUND: 'Kanvasing Tim Sales',
                EVENT: 'Pameran / Expo',
                TENDER_RFP: 'Tender / RFP Resmi',
              };
              return (
                <div key={src} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-ink">{labelMap[src] || src}</span>
                    <span className="text-muted">{count} lead ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-primary-red h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Pipeline Stage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Tahapan Peluang Aktif (Pipeline Stages)</span>
              <Link to="/ops/marketing/pipeline" className="text-xs text-primary-red hover:underline flex items-center gap-1">
                <span>Buka Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.oppsByStage && Object.entries(stats.oppsByStage).map(([stage, count]) => {
              const labelMap = {
                PROSPECTING: 'Penjajakan Awal (25%)',
                SURVEY_LOCATION: 'Survei Lokasi & Titik Rawan (40%)',
                PROPOSAL_SENT: 'Proposal & Penawaran Terkirim (60%)',
                NEGOTIATION: 'Negosiasi Komersial Draft PKS (80%)',
              };
              return (
                <div key={stage} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                  <span className="font-medium text-ink">{labelMap[stage] || stage}</span>
                  <span className="font-bold px-2 py-0.5 rounded bg-white border border-border text-primary-red">
                    {count} Peluang
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Grid: Recent Leads & Recent Handovers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Prospek Terbaru</CardTitle>
              <Link to="/ops/marketing/leads" className="text-xs text-primary-red hover:underline">
                Lihat Semua ({stats?.totalLeads}) →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between px-5 py-3 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-ink flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-primary-red" />
                      <span>{lead.companyName}</span>
                    </p>
                    <p className="text-[11px] text-muted">
                      {lead.leadNumber} · {lead.serviceInterest}
                    </p>
                  </div>
                  <Badge status={lead.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Handovers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Serah Terima Klien WON Terbaru</CardTitle>
              <Link to="/ops/marketing/handover" className="text-xs text-accent-green hover:underline">
                Lihat Semua Handover →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentHandovers.map((h) => (
                <div key={h.id} className="px-5 py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-ink">{h.companyName}</p>
                    <span className="text-[10px] font-bold text-accent-green bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      WON
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">
                    No. PKS: <span className="font-mono text-ink">{h.signedContractNumber}</span> · {h.serviceType}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                    <span>Kuota: {h.manpowerQuota} Personel</span>
                    <span className="font-semibold text-ink">{formatRupiah(h.monthlyBilling)}/bln</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {isLeadModalOpen && (
        <LeadFormModal
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          onSuccess={loadDashboardData}
        />
      )}
    </div>
  );
}
