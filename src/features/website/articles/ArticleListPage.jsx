/**
 * Articles & News CMS Management Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 17 (CMS: News & Blog), Section 19 (RBAC), Section 22.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import ArticleFormModal from './ArticleFormModal';

const CATEGORIES = [
  { value: '', label: 'Semua Kategori' },
  { value: 'KEAMANAN', label: 'Keamanan & Sekuriti' },
  { value: 'TEKNOLOGI', label: 'Teknologi & Fasilitas' },
  { value: 'LOGISTIK', label: 'Logistik & Kurir COD' },
  { value: 'HRD', label: 'Ketenagakerjaan & HR' },
  { value: 'CLEANING', label: 'Kebersihan & Sanitasi' },
];

export default function ArticleListPage() {
  const { hasPermission } = useAuth();
  const canPublish = hasPermission(PERMISSIONS.CMS_PUBLISH);
  const canEdit = hasPermission(PERMISSIONS.CMS_EDIT);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsAdapter.getArticles({
        search,
        category,
        status,
        page,
        pageSize: 10,
      });
      if (res.data) {
        setArticles(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat daftar artikel.');
    } finally {
      setLoading(false);
    }
  }, [search, category, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus artikel "${title}"?`)) return;

    try {
      const res = await cmsAdapter.deleteArticle(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Artikel berhasil dihapus!');
      loadData();
    } catch {
      toast.error('Gagal menghapus artikel.');
    }
  };

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (art) => {
    setEditingArticle(art);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Search & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Cari judul artikel, topik, penulis..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-primary-red"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-primary-red"
          >
            <option value="">Semua Status Publikasi</option>
            <option value="PUBLISHED">Tayang (Published)</option>
            <option value="DRAFT">Konsep (Draft)</option>
          </select>
        </div>

        {/* Create Button */}
        {canPublish && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="gap-1.5 self-start md:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tulis Artikel Baru</span>
          </Button>
        )}
      </div>

      {/* Articles Table */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat daftar publikasi artikel & berita portal..." />
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Tidak ada artikel yang ditemukan"
            description="Belum ada publikasi artikel yang cocok dengan kata kunci filter pencarian Anda."
            actionLabel={canPublish ? 'Tulis Artikel Pertama' : undefined}
            onAction={canPublish ? handleOpenCreate : undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-muted font-medium">
                  <th className="py-3 px-4">Judul Artikel & Slug</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Penulis (Author)</th>
                  <th className="py-3 px-4">Tanggal Tayang</th>
                  <th className="py-3 px-4 text-center">Dibaca</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 max-w-[320px]">
                      <div className="font-semibold text-ink leading-snug line-clamp-2">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-muted font-mono mt-0.5 flex items-center gap-1">
                        <span>/news/{art.slug}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {art.categoryLabel || art.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-ink font-medium flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>{art.author}</span>
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">{art.authorRole}</div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
                        <span>{art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('id-ID') : 'Belum Terbit'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center text-xs text-slate-600 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-muted" />
                        <span>{art.viewsCount}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          art.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {art.status === 'PUBLISHED' ? 'Tayang' : 'Konsep (Draft)'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/news`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-muted hover:text-ink transition-colors"
                          title="Lihat Pratinjau Publik"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(art)}
                            className="p-1 text-info hover:text-blue-700 transition-colors"
                            title="Edit Artikel"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canPublish && (
                          <button
                            type="button"
                            onClick={() => handleDelete(art.id, art.title)}
                            className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                            title="Hapus Artikel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted">
            <div>
              Total: <span className="font-semibold text-ink">{meta.total}</span> artikel (Halaman {meta.page} dari {meta.totalPages || 1})
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isFormOpen && (
        <ArticleFormModal
          isOpen={isFormOpen}
          article={editingArticle}
          onClose={() => setIsFormOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
