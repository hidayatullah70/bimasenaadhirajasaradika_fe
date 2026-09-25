/**
 * Public News Page — PT. BARAK
 * Source of Truth: PRD Section 2.1 (Public Landing Page) & Section 17 (CMS: News).
 */

import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Newspaper, Tag } from 'lucide-react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';
import { StateLoading } from '@/components/ui/StateViews';

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await cmsAdapter.getArticles({ status: 'PUBLISHED' });
        if (res.data) setArticles(res.data);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-ink py-20">
          <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent-green/20 text-accent-green border border-accent-green/30 mb-3">
              Warta & Berita Resmi
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Berita & Publikasi PT. BARAK
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base">
              Informasi terkini mengenai sertifikasi kepatuhan Polri, inovasi teknologi keamanan posko, dan perkembangan industri outsourcing di Indonesia.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 bg-canvas">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="py-16">
                <StateLoading message="Memuat artikel berita terbaru..." />
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border p-12 text-center">
                <Newspaper className="w-12 h-12 text-muted mx-auto mb-3" />
                <h3 className="text-base font-bold text-ink">Belum ada artikel yang dipublikasikan</h3>
                <p className="text-xs text-muted mt-1">Silakan kunjungi kembali halaman ini nanti.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((art) => (
                  <article
                    key={art.id}
                    className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md hover:border-primary-red/30 transition-all flex flex-col justify-between"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary-red/10 text-primary-red">
                          <Tag className="w-3 h-3" />
                          <span>{art.categoryLabel || art.category}</span>
                        </span>
                        <span className="text-[11px] text-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('id-ID') : '-'}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-ink leading-snug hover:text-primary-red transition-colors">
                        {art.title}
                      </h3>

                      <p className="text-xs text-muted mt-2.5 line-clamp-3 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User className="w-3.5 h-3.5 text-muted" />
                        <span>{art.author}</span>
                      </div>
                      <span className="text-primary-red font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer">
                        <span>Baca Rinci</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
