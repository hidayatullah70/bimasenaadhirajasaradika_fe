/**
 * Careers & Jobs CMS Management Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 17 (CMS: Careers), Section 2.1, Section 19.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Briefcase,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import CareerFormModal from './CareerFormModal';

export default function CareerListPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.CMS_EDIT);

  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsAdapter.getCareers({
        search,
        status,
        page,
        pageSize: 10,
      });
      if (res.data) {
        setCareers(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat daftar lowongan kerja.');
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      const res = await cmsAdapter.updateCareerStatus(job.id, nextStatus);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(
        nextStatus === 'PUBLISHED'
          ? `Lowongan ${job.title} kembali dibuka!`
          : `Lowongan ${job.title} resmi ditutup.`
      );
      loadData();
    } catch {
      toast.error('Gagal mengubah status lowongan.');
    }
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
              placeholder="Cari lowongan, lokasi, posisi..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-primary-red"
          >
            <option value="">Semua Status</option>
            <option value="PUBLISHED">Aktif Terbuka</option>
            <option value="CLOSED">Ditutup</option>
          </select>
        </div>

        {/* Create Button */}
        {canManage && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsFormOpen(true)}
            className="gap-1.5 self-start md:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Buka Lowongan Baru</span>
          </Button>
        )}
      </div>

      {/* Careers Table */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat direktori lowongan kerja publik..." />
        </div>
      ) : careers.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Tidak ada lowongan yang ditemukan"
            description="Belum ada lowongan pekerjaan yang cocok dengan kriteria pencarian Anda."
            actionLabel={canManage ? 'Buka Lowongan Baru' : undefined}
            onAction={canManage ? () => setIsFormOpen(true) : undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-border text-muted font-medium">
                  <th className="py-3 px-4">Posisi Lowongan & Departemen</th>
                  <th className="py-3 px-4">Lokasi & Tipe Kerja</th>
                  <th className="py-3 px-4">Kuota Personel</th>
                  <th className="py-3 px-4">Estimasi Gaji / Benefit</th>
                  <th className="py-3 px-4">Batas Lamaran</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {careers.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 max-w-[280px]">
                      <div className="font-semibold text-ink leading-snug flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary-red shrink-0" />
                        <span>{job.title}</span>
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">{job.departmentLabel || job.department}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-ink flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>{job.location}</span>
                      </div>
                      <div className="text-[10px] text-muted mt-0.5">{job.employmentType}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-ink">
                        <Users className="w-3.5 h-3.5 text-info" />
                        <span>{job.manpowerQuota} Orang</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium text-ink">
                      {job.salaryRange}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-muted" />
                        <span>{job.deadline}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          job.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {job.status === 'PUBLISHED' ? 'Aktif Terbuka' : 'Ditutup'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/career`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-muted hover:text-ink transition-colors"
                          title="Lihat Pratinjau Publik"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(job)}
                            className={`text-xs px-2.5 py-1 rounded border font-medium transition-colors ${
                              job.status === 'PUBLISHED'
                                ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {job.status === 'PUBLISHED' ? 'Tutup' : 'Buka'}
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
              Total: <span className="font-semibold text-ink">{meta.total}</span> lowongan (Halaman {meta.page} dari {meta.totalPages || 1})
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
        <CareerFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
