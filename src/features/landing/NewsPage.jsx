/**
 * Public News Page — PT. BARAK
 * Source of Truth: PRD Section 2.1 (Public Landing Page) & Section 17 (CMS: News).
 * Supports full article reading view with bottom-right "Kembali" button.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, User, ArrowRight, ArrowLeft, Newspaper, Tag, Clock, Share2, ShieldCheck, ChevronRight } from 'lucide-react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';
import { StateLoading } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await cmsAdapter.getArticles({ status: 'PUBLISHED' });
        if (res.data) {
          setArticles(res.data);
          const articleId = searchParams.get('id');
          if (articleId) {
            const found = res.data.find((a) => a.id === articleId || a.slug === articleId);
            if (found) setSelectedArticle(found);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, [searchParams]);

  const handleOpenArticle = (art) => {
    setSelectedArticle(art);
    setSearchParams({ id: art.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedArticle(null);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Tautan artikel berhasil disalin!');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <PublicNavbar />
      <main className="pt-16 flex-1">
        {/* Hero Section */}
        <section className="bg-ink py-16 sm:py-20">
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
        <section className="py-12 sm:py-16 bg-canvas">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="py-16">
                <StateLoading message="Memuat artikel berita terbaru..." />
              </div>
            ) : selectedArticle ? (
              /* ── DETAIL TAMPILAN UTUH ARTIKEL ── */
              <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-border p-6 sm:p-10 lg:p-12 shadow-sm animate-fade-in">
                {/* Breadcrumbs Navigation */}
                <div className="flex items-center gap-2 text-xs text-muted mb-6 pb-4 border-b border-border">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="hover:text-primary-red transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>Berita</span>
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 truncate max-w-xs">{selectedArticle.title}</span>
                </div>

                {/* Article Header Metadata */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary-red/10 text-primary-red border border-primary-red/20">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{selectedArticle.categoryLabel || selectedArticle.category}</span>
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {selectedArticle.publishedAt
                          ? new Date(selectedArticle.publishedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                          : '-'}
                      </span>
                    </span>
                    <span className="text-xs text-muted flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>3 menit baca</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight">
                    {selectedArticle.title}
                  </h1>

                  {/* Author Card */}
                  <div className="flex items-center justify-between gap-4 py-4 px-5 rounded-2xl bg-canvas border border-border/80 my-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-red/10 text-primary-red flex items-center justify-center font-bold text-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-ink">{selectedArticle.author}</div>
                        <div className="text-xs text-muted">{selectedArticle.authorRole || 'Tim Redaksi PT. BARAK'}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-primary-red px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Bagikan Tautan"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Bagikan</span>
                    </button>
                  </div>
                </div>

                {/* Excerpt Lead Box */}
                {selectedArticle.excerpt && (
                  <div className="my-6 p-4 sm:p-5 rounded-2xl bg-amber-50/60 border-l-4 border-primary-yellow text-slate-700 text-sm sm:text-base leading-relaxed italic">
                    "{selectedArticle.excerpt}"
                  </div>
                )}

                {/* Full Article Content */}
                <div className="mt-8 space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed">
                  {selectedArticle.content ? (
                    selectedArticle.content.split('\n\n').map((paragraph, idx) => {
                      if (paragraph.includes('\n-') || paragraph.includes('\n1.') || paragraph.includes('\n2.')) {
                        const lines = paragraph.split('\n');
                        return (
                          <div key={idx} className="space-y-2.5 my-4">
                            {lines.map((line, lIdx) => {
                              const trimmed = line.trim();
                              if (trimmed.startsWith('-') || /^\d+\./.test(trimmed)) {
                                return (
                                  <div key={lIdx} className="flex items-start gap-3 ml-2 sm:ml-4 text-slate-800">
                                    <span className="w-2 h-2 rounded-full bg-primary-red flex-shrink-0 mt-2" />
                                    <span className="flex-1 leading-relaxed">
                                      {trimmed.replace(/^-\s*|^\d+\.\s*/, '')}
                                    </span>
                                  </div>
                                );
                              }
                              return (
                                <p key={lIdx} className="font-semibold text-ink">
                                  {line}
                                </p>
                              );
                            })}
                          </div>
                        );
                      }
                      return (
                        <p key={idx} className="leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })
                  ) : (
                    <p>{selectedArticle.excerpt}</p>
                  )}
                </div>

                {/* Trust & Verification Badge */}
                <div className="mt-10 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-xs text-muted">
                  <ShieldCheck className="w-5 h-5 text-accent-green flex-shrink-0" />
                  <span>
                    Diterbitkan secara resmi oleh Divisi Komunikasi & Kepatuhan Legal PT. BIMASENA ADHIRAJASA RADIKA.
                  </span>
                </div>

                {/* Bottom Navigation with KEMBALI Button at the Bottom Right */}
                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4">
                  <div className="text-xs text-muted hidden sm:block">
                    PT. BARAK IOMS &copy; {new Date().getFullYear()} — Seluruh hak cipta dilindungi.
                  </div>
                  {/* Button Kembali di kanan bawah */}
                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-red text-white hover:bg-red-800 transition-all font-semibold shadow-xs hover:shadow-md active:scale-95 cursor-pointer text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Kembali</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border p-12 text-center">
                <Newspaper className="w-12 h-12 text-muted mx-auto mb-3" />
                <h3 className="text-base font-bold text-ink">Belum ada artikel yang dipublikasikan</h3>
                <p className="text-xs text-muted mt-1">Silakan kunjungi kembali halaman ini nanti.</p>
              </div>
            ) : (
              /* ── GRID DAFTAR ARTIKEL BERITA ── */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((art) => (
                  <article
                    key={art.id}
                    onClick={() => handleOpenArticle(art)}
                    className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md hover:border-primary-red/30 transition-all flex flex-col justify-between cursor-pointer group"
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

                      <h3 className="text-base font-bold text-ink leading-snug group-hover:text-primary-red transition-colors">
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
                      <span className="text-primary-red font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
