/**
 * Website CMS Dashboard Page — PT. BARAK IOMS
 * Authoritative overview for Content Management, News/Blog, Careers, FAQ, and Incoming Inquiries.
 * Source of Truth: PRD Section 17 (CMS) & Section 18.
 */

import React, { useState, useEffect } from 'react';
import {
  Globe,
  FileText,
  Briefcase,
  Users,
  Plus,
  ArrowUpRight,
  Inbox,
  Eye,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StateLoading } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';
import ArticleFormModal from './articles/ArticleFormModal';
import CareerFormModal from './careers/CareerFormModal';

export default function WebsiteDashboard() {
  const [stats, setStats] = useState(null);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, inqRes, artRes] = await Promise.all([
        cmsAdapter.getCMSStats(),
        cmsAdapter.getInquiries({ pageSize: 4 }),
        cmsAdapter.getArticles({ pageSize: 4 }),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (inqRes.data) setRecentInquiries(inqRes.data);
      if (artRes.data) setRecentArticles(artRes.data);
    } catch {
      toast.error('Gagal memuat analitik website CMS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-xl border border-border shadow-xs">
        <StateLoading message="Memuat metrik konten publik dan formulir inquiry..." />
      </div>
    );
  }

  const kpis = [
    {
      title: 'Artikel Berita & Blog',
      value: stats?.totalArticles || 0,
      sub: `${stats?.publishedArticles || 0} Tayang · ${stats?.draftArticles || 0} Konsep`,
      icon: <FileText className="h-5 w-5 text-primary-red" />,
      iconBg: 'bg-primary-red/10',
    },
    {
      title: 'Lowongan Karir Aktif',
      value: stats?.activeCareers || 0,
      sub: `Dari total ${stats?.totalCareers || 0} posisi`,
      icon: <Briefcase className="h-5 w-5 text-info" />,
      iconBg: 'bg-info/10',
    },
    {
      title: 'Lead Website Masuk',
      value: stats?.totalInquiries || 0,
      sub: 'Formulir konsultasi /contact',
      icon: <Users className="h-5 w-5 text-accent-green" />,
      iconBg: 'bg-accent-green/10',
    },
    {
      title: 'Total Pembaca Artikel',
      value: stats?.totalViews ? stats.totalViews.toLocaleString('id-ID') : 0,
      sub: `${stats?.totalFaqs || 0} Butir Tanya Jawab FAQ`,
      icon: <Eye className="h-5 w-5 text-primary-yellow" />,
      iconBg: 'bg-primary-yellow/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-bold text-ink">Pusat Publikasi & CMS Portal Publik PT. BARAK</h2>
          <p className="text-xs text-muted">
            Kelola artikel berita, direktori lowongan rekrutmen satpam/kurir, FAQ, dan tanggapi inquiry calon klien.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCareerModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Buka Karir</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsArticleModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tulis Artikel</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-xl border border-border shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-muted">{kpi.title}</p>
              <p className="text-2xl font-bold text-ink mt-1">{kpi.value}</p>
              <p className="text-[11px] text-muted mt-1">{kpi.sub}</p>
            </div>
            <div className={`p-3 rounded-xl ${kpi.iconBg}`}>{kpi.icon}</div>
          </div>
        ))}
      </div>

      {/* Grid: Inquiries & Latest Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incoming Inquiries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Inbox className="w-4 h-4 text-warning" />
                <span>Permohonan Konsultasi Terbaru (Inquiry)</span>
              </CardTitle>
              <Link to="/ops/website/inquiries" className="text-xs text-primary-red hover:underline flex items-center gap-1">
                <span>Semua ({stats?.totalInquiries})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-ink flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-primary-red" />
                      <span>{inq.company}</span>
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Lead Tersinkron
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">
                    PIC: <strong className="text-ink font-medium">{inq.name}</strong> ({inq.phone}) · Layanan: {inq.serviceLabel || inq.service}
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-1 italic bg-slate-50 p-1.5 rounded">
                    "{inq.message || 'Tanpa pesan tambahan.'}"
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Latest Articles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-red" />
                <span>Publikasi Artikel Terbaru</span>
              </CardTitle>
              <Link to="/ops/website/articles" className="text-xs text-primary-red hover:underline flex items-center gap-1">
                <span>Semua Artikel</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentArticles.map((art) => (
                <div key={art.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-ink leading-snug line-clamp-2">{art.title}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Kategori: <span className="font-medium text-slate-700">{art.categoryLabel || art.category}</span> · Oleh: {art.author}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('id-ID') : 'Draft'}</span>
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${
                      art.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {art.status === 'PUBLISHED' ? 'Tayang' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {isArticleModalOpen && (
        <ArticleFormModal
          isOpen={isArticleModalOpen}
          onClose={() => setIsArticleModalOpen(false)}
          onSuccess={loadDashboardData}
        />
      )}

      {isCareerModalOpen && (
        <CareerFormModal
          isOpen={isCareerModalOpen}
          onClose={() => setIsCareerModalOpen(false)}
          onSuccess={loadDashboardData}
        />
      )}
    </div>
  );
}
