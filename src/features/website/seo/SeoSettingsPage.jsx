/**
 * SEO & Metadata Settings Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 17 (SEO Metadata: meta_title, meta_description, slug, canonical, og_image).
 */

import React, { useState, useEffect } from 'react';
import { Globe, Save, Search, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StateLoading } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';

export default function SeoSettingsPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await cmsAdapter.getAllPagesSeo();
      if (res.data) setPages(res.data);
    } catch {
      toast.error('Gagal memuat pengaturan SEO.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (pageKey, field, val) => {
    setPages((prev) =>
      prev.map((p) => (p.pageKey === pageKey ? { ...p, [field]: val } : p))
    );
  };

  const handleSave = async (page) => {
    setSavingKey(page.pageKey);
    try {
      const res = await cmsAdapter.updatePageSeo(page.pageKey, page);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Metadata SEO halaman ${page.pageName} berhasil disimpan!`);
    } catch {
      toast.error('Gagal menyimpan metadata SEO.');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
        <StateLoading message="Memuat konfigurasi SEO halaman publik portal..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-border shadow-xs">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-primary-red shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-ink">
              Pengaturan Optimasi Mesin Pencari (Search Engine Optimization — SEO)
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Atur judul halaman (*Title Tag*), deskripsi penelusuran (*Meta Description*), dan pratinjau sosial media (*Open Graph*) untuk memaksimalkan visibilitas portal publik PT. BARAK di hasil pencarian Google.
            </p>
          </div>
        </div>
      </div>

      {/* Pages SEO Cards */}
      <div className="space-y-6">
        {pages.map((p) => {
          const isSaving = savingKey === p.pageKey;

          return (
            <Card key={p.pageKey}>
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-ink">{p.pageName}</CardTitle>
                    <p className="text-xs text-muted font-mono mt-0.5">Route: {p.slug}</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSave(p)}
                    disabled={isSaving}
                    className="gap-1.5 self-start sm:self-auto"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                {/* Google Search Snippet Preview */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1 mb-1.5">
                    <Search className="w-3 h-3 text-info" />
                    <span>Pratinjau Hasil Pencarian Google</span>
                  </span>
                  <div className="space-y-0.5 font-sans">
                    <div className="text-[11px] text-emerald-800 font-mono truncate">
                      {p.canonical || `https://www.barak.co.id${p.slug}`}
                    </div>
                    <div className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer line-clamp-1">
                      {p.metaTitle || p.pageName}
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {p.metaDescription || 'Deskripsi halaman belum diatur.'}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Meta Title Tag (Maksimal 60 Karakter Disarankan)
                    </label>
                    <input
                      type="text"
                      value={p.metaTitle}
                      onChange={(e) => handleChange(p.pageKey, 'metaTitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
                    />
                    <div className="text-[11px] text-muted mt-1 text-right">
                      {p.metaTitle?.length || 0} / 60 karakter
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Meta Description (Maksimal 160 Karakter Disarankan)
                    </label>
                    <textarea
                      rows={2}
                      value={p.metaDescription}
                      onChange={(e) => handleChange(p.pageKey, 'metaDescription', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
                    />
                    <div className="text-[11px] text-muted mt-1 text-right">
                      {p.metaDescription?.length || 0} / 160 karakter
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Canonical URL
                    </label>
                    <input
                      type="text"
                      value={p.canonical}
                      onChange={(e) => handleChange(p.pageKey, 'canonical', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Open Graph Image (Social Share)
                    </label>
                    <input
                      type="text"
                      value={p.ogImage}
                      onChange={(e) => handleChange(p.pageKey, 'ogImage', e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
