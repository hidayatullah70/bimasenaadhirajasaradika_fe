import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Globe,
  Search,
  TrendingUp,
  MousePointerClick,
  Eye,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Cpu,
  RefreshCw
} from 'lucide-react';

export function AdminSeoReporting() {
  const [gscStats] = useState({
    clicks: 1420,
    impressions: 28500,
    ctr: '4.98%',
    avgPosition: 6.4,
    indexedPages: 18,
    deindexedPages: 0
  });

  const coreWebVitals = [
    { metric: 'LCP (Largest Contentful Paint)', value: '1.2s', status: 'Bagus (Good)', score: 'green' },
    { metric: 'FID / INP (Interaction to Next Paint)', value: '42ms', status: 'Bagus (Good)', score: 'green' },
    { metric: 'CLS (Cumulative Layout Shift)', value: '0.01', status: 'Optimal', score: 'green' }
  ];

  const topSearchQueries = [
    { query: 'perusahaan outsourcing bekasi', clicks: 380, impressions: 4200, ctr: '9.0%', pos: 2.1 },
    { query: 'jasa pengamanan security gada pratama', clicks: 290, impressions: 5100, ctr: '5.6%', pos: 3.4 },
    { query: 'pt bhimasena adhirajasa radhika', clicks: 240, impressions: 1200, ctr: '20.0%', pos: 1.0 },
    { query: 'cleaning service gedung komersial', clicks: 190, impressions: 3800, ctr: '5.0%', pos: 5.2 },
    { query: 'penyedia tenaga kerja man power', clicks: 140, impressions: 2900, ctr: '4.8%', pos: 4.8 }
  ];

  const seoChecklist = [
    { label: 'Meta Title & Meta Description terisi optimal di seluruh landing page', status: 'passed' },
    { label: 'Sitemap XML (sitemap.xml) terdaftar dan terindeks di Google Search Console', status: 'passed' },
    { label: 'Robots.txt terkonfigurasi dengan proteksi direktori backend & auth', status: 'passed' },
    { label: 'Struktur Heading (H1, H2, H3) hierarkis dan semantik HTML5', status: 'passed' },
    { label: 'Protokol HTTPS & sertifikat TLS 1.3 valid', status: 'passed' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Laporan Algoritma Google & Pemantauan SEO (GSC & GA4)"
        subtitle="Analisis performa pencarian organik 28 hari terakhir, Core Web Vitals, dan kepatuhan algoritma indexing Google."
        breadcrumb={['Dashboard', 'Admin', 'SEO Reporting']}
      />

      {/* KPI GSC 28 Hari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Klik Organik (28 Hari)"
          value={`${gscStats.clicks.toLocaleString('id-ID')} Klik`}
          subtitle="Pencarian Google Search"
          icon={MousePointerClick}
          color="red"
          trend="+18.4%"
          trendDirection="up"
        />
        <KpiCard
          title="Total Impresi Tayang"
          value={`${gscStats.impressions.toLocaleString('id-ID')} Impresi`}
          subtitle="Tampil di hasil pencarian"
          icon={Eye}
          color="dark"
          trend="+22.1%"
          trendDirection="up"
        />
        <KpiCard
          title="Rata-rata CTR (Click-Through)"
          value={gscStats.ctr}
          subtitle="Rasio klik terhadap impresi"
          icon={TrendingUp}
          color="green"
          trend="Di atas rata-rata industri"
          trendDirection="up"
        />
        <KpiCard
          title="Posisi Rata-rata SERP"
          value={`#${gscStats.avgPosition}`}
          subtitle="Peringkat kata kunci utama"
          icon={Globe}
          color="yellow"
          trend="Halaman 1 Google"
          trendDirection="up"
        />
      </div>

      {/* Top Search Queries & Core Web Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card>
            <CardHeader
              title="Kata Kunci Teratas (Top Queries Google Search)"
              subtitle="Pencarian organik yang mendatangkan kunjungan terbanyak"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Kata Kunci (Query)</th>
                    <th className="py-2.5 px-3">Klik</th>
                    <th className="py-2.5 px-3">Impresi</th>
                    <th className="py-2.5 px-3">CTR</th>
                    <th className="py-2.5 px-3">Posisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {topSearchQueries.map((q, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-brand-dark">{q.query}</td>
                      <td className="py-2.5 px-3 font-bold text-brand-red font-mono">{q.clicks}</td>
                      <td className="py-2.5 px-3 font-mono">{q.impressions.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">{q.ctr}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">#{q.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader
              title="Google Core Web Vitals"
              subtitle="Skor performa dan kecepatan PageSpeed"
            />
            <div className="space-y-3 text-xs">
              {coreWebVitals.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{item.metric}</p>
                    <span className="text-emerald-700 font-semibold text-[11px]">{item.status}</span>
                  </div>
                  <span className="font-mono font-bold text-brand-dark text-sm bg-white px-2.5 py-1 rounded border border-slate-200">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* SEO Health Check & Checklist */}
      <Card>
        <CardHeader
          title="SEO Health Checklist & Kepatuhan Algoritma"
          subtitle="Verifikasi parameter teknis website"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {seoChecklist.map((chk, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="font-semibold text-emerald-950">{chk.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
