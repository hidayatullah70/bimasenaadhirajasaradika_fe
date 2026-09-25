/**
 * Modal Pembuatan & Edit Artikel Berita/Blog — PT. BARAK IOMS
 * Source of Truth: PRD Section 17 (CMS: Articles & SEO Metadata)
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';

const CATEGORIES = [
  { value: 'KEAMANAN', label: 'Keamanan & Sekuriti (Security)' },
  { value: 'TEKNOLOGI', label: 'Teknologi & Fasilitas (Barrier Gate/CCTV)' },
  { value: 'LOGISTIK', label: 'Logistik & Ekspedisi Kurir (COD)' },
  { value: 'HRD', label: 'Ketenagakerjaan & HR Outsourcing' },
  { value: 'CLEANING', label: 'Kebersihan & Sanitasi Industri' },
];

export default function ArticleFormModal({ isOpen, onClose, article, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('content'); // 'content' | 'seo'

  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    category: article?.category || 'KEAMANAN',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    author: article?.author || 'Mayor (Purn.) Sudrajat',
    authorRole: article?.authorRole || 'Direktur Operasional & Keamanan',
    status: article?.status || 'PUBLISHED',
    featured: article?.featured || false,
    metaTitle: article?.metaTitle || '',
    metaDescription: article?.metaDescription || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'title' && !article && !prev.slug) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      toast.error('Judul, Ringkasan (Excerpt), dan Isi Konten wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const selectedCat = CATEGORIES.find((c) => c.value === formData.category);
      const payload = {
        ...formData,
        categoryLabel: selectedCat ? selectedCat.label : formData.category,
      };

      let res;
      if (article) {
        res = await cmsAdapter.updateArticle(article.id, payload);
      } else {
        res = await cmsAdapter.createArticle(payload);
      }

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(article ? 'Artikel berhasil diperbarui!' : 'Artikel baru berhasil diterbitkan!');
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('Gagal menyimpan artikel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={article ? 'Edit Artikel Publik' : 'Tulis Artikel Berita / Blog Baru'}
      description="Publikasikan wawasan industri, panduan keamanan, dan berita resmi kegiatan PT. BARAK ke website portal publik."
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Switch tab: Konten Utama vs SEO */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setTab('content')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'content'
                ? 'border-primary-red text-primary-red'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            Konten & Penulis
          </button>
          <button
            type="button"
            onClick={() => setTab('seo')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'seo'
                ? 'border-primary-red text-primary-red'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            Metadata SEO & Social Share
          </button>
        </div>

        {tab === 'content' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-ink mb-1">
                  Judul Artikel <span className="text-primary-red">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Standar Operasional Pengamanan Terpadu BUJP"
                  required
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Kategori Artikel <span className="text-primary-red">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Nama Penulis (Author)
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Contoh: Mayor (Purn.) Sudrajat"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Jabatan / Peran Penulis
                </label>
                <input
                  type="text"
                  name="authorRole"
                  value={formData.authorRole}
                  onChange={handleChange}
                  placeholder="Contoh: Direktur Operasional & Keamanan"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Ringkasan Singkat (Excerpt) <span className="text-primary-red">*</span>
              </label>
              <textarea
                name="excerpt"
                rows={2}
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Rangkuman 1-2 kalimat pengantar yang tampil di kartu daftar artikel..."
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Isi Lengkap Artikel (Full Content) <span className="text-primary-red">*</span>
              </label>
              <textarea
                name="content"
                rows={7}
                value={formData.content}
                onChange={handleChange}
                placeholder="Tuliskan naskah artikel berita, panduan teknis, atau pengumuman secara terperinci..."
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink mr-2">Status:</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="text-xs border border-border rounded px-2 py-1 bg-white focus:outline-none focus:border-primary-red font-medium"
                  >
                    <option value="PUBLISHED">Tayang (Published)</option>
                    <option value="DRAFT">Konsep (Draft)</option>
                  </select>
                </div>

                <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="rounded border-border text-primary-red focus:ring-primary-red"
                  />
                  <span>Tandai sebagai Artikel Pilihan (Featured)</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                URL Slug Ramah SEO <span className="text-primary-red">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="standar-operasional-pengamanan-terpadu-bujp"
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red font-mono"
              />
              <p className="text-[11px] text-muted mt-1">
                URL Publik:{' '}
                <span className="font-mono text-ink">
                  https://www.barak.co.id/news/{formData.slug || 'slug-artikel'}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Meta Title (Maks 60 Karakter)
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                placeholder={formData.title || 'Judul untuk Google Search'}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Meta Description (Maks 160 Karakter)
              </label>
              <textarea
                name="metaDescription"
                rows={3}
                value={formData.metaDescription}
                onChange={handleChange}
                placeholder={formData.excerpt || 'Deskripsi singkat cuplikan hasil pencarian Google...'}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            {loading ? 'Menyimpan...' : article ? 'Perbarui Artikel' : 'Simpan & Terbitkan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
