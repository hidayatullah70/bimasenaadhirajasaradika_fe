/**
 * Contract Monitoring Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1 & 12.1 (Employee Contracts & Expiry Alerts).
 *
 * Implements complete CRUD for HRD Employee Contracts & Compliance Documents:
 * - Create: "+ Buat Kontrak & Dokumen Baru" button & modal form.
 * - Read: Search & filter by contract type, status, and detail view modal.
 * - Update: Edit contract terms, renewal, and document verification statuses.
 * - Delete: Segregation of duties Maker-Checker workflow (HRD request delete -> Direktur Utama approval).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck2, Search, AlertTriangle, CheckCircle2,
  Calendar, ChevronLeft, ChevronRight, Clock, ShieldCheck,
  Plus, Eye, Edit2, Trash2, RefreshCw, FileText
} from 'lucide-react';
import contractAdapter from '@/services/adapters/contractAdapter';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import ContractFormModal from './ContractFormModal';
import ContractDetailModal from './ContractDetailModal';
import ContractDeleteModal from './ContractDeleteModal';
import toast from 'react-hot-toast';

export default function ContractMonitoringPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailContract, setDetailContract] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingContract, setDeletingContract] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contractAdapter.getContracts({ search, type, status, page, pageSize: 12 });
      if (res.data) {
        setContracts(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat data kontrak karyawan.');
    } finally {
      setLoading(false);
    }
  }, [search, type, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingContract(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (contract) => {
    setEditingContract(contract);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (contract) => {
    setDetailContract(contract);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (contract) => {
    setDeletingContract(contract);
    setIsDeleteOpen(true);
  };

  const handleExtend = async (contract) => {
    const newDate = prompt(
      `Masukkan tanggal perpanjangan kontrak untuk ${contract.employeeName} (YYYY-MM-DD):`,
      '2027-12-31'
    );
    if (!newDate) return;

    try {
      await contractAdapter.extendContract(contract.id, {
        newEndDate: newDate,
        notes: 'Perpanjangan kontrak kerja tahunan',
      });
      toast.success(`Kontrak ${contract.employeeName} berhasil diperpanjang hingga ${newDate}.`);
      loadData();
    } catch {
      toast.error('Gagal memperpanjang kontrak.');
    }
  };

  const expiringCount = contracts.filter((c) => c.status === 'EXPIRING_SOON' && !c.pendingDelete).length;
  const pendingDeleteCount = contracts.filter((c) => c.pendingDelete).length;

  return (
    <div className="space-y-4">
      {/* Alert Banner if any expiring soon */}
      {expiringCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-warning flex-none" />
            <div>
              <p className="font-bold">Peringatan Masa Berlaku Kontrak Karyawan</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Terdapat <strong>{expiringCount} karyawan</strong> yang masa kontrak kerjanya akan habis dalam waktu kurang dari 30 hari. Segera lakukan evaluasi atau perpanjangan.
              </p>
            </div>
          </div>
          <Badge variant="warning">Mendesak</Badge>
        </div>
      )}

      {/* Alert Banner if any pending delete approval */}
      {pendingDeleteCount > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-primary-red flex-none" />
            <div>
              <p className="font-bold">Pengajuan Hapus Menunggu Persetujuan Direktur Utama</p>
              <p className="text-[11px] text-rose-800 mt-0.5">
                Terdapat <strong>{pendingDeleteCount} berkas kontrak</strong> dalam antrean verifikasi penghapusan Direktur Utama.
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-red/10 text-primary-red">
            {pendingDeleteCount} Menunggu Direktur
          </span>
        </div>
      )}

      {/* Top Action & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama karyawan, nomor kontrak, atau NIK..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Jenis Ikatan</option>
            <option value="PKWT">PKWT (Kontrak)</option>
            <option value="PKWTT">PKWTT (Tetap)</option>
            <option value="PROBATION">Probation (Percobaan)</option>
            <option value="MITRA">Mitra Kerja</option>
            <option value="MAGANG">Magang</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="EXPIRING_SOON">Akan Habis (&lt;30 Hari)</option>
            <option value="PENDING_DELETE">Menunggu Hapus</option>
          </select>

          {/* Primary Action Button: Buat Kontrak & Dokumen Baru */}
          <Button
            type="button"
            variant="primary"
            onClick={handleOpenCreate}
            className="bg-primary-red hover:bg-primary-red/90 text-white gap-2 font-semibold text-xs shadow-xs ml-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Kontrak & Dokumen Baru</span>
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <StateLoading message="Memuat pemantauan kontrak & berkas karyawan..." />
        ) : contracts.length === 0 ? (
          <StateEmpty
            title="Tidak ada kontrak ditemukan"
            description="Tidak ada data yang cocok dengan kriteria pencarian atau belum ada kontrak yang diterbitkan."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas/50 border-b border-border text-muted uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Karyawan</th>
                  <th className="px-4 py-3.5">Nomor Kontrak</th>
                  <th className="px-4 py-3.5">Jenis Ikatan</th>
                  <th className="px-4 py-3.5">Masa Berlaku</th>
                  <th className="px-4 py-3.5">Sisa Waktu</th>
                  <th className="px-4 py-3.5">Kelengkapan Dokumen</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contracts.map((c) => {
                  const isExpiring = c.status === 'EXPIRING_SOON' && !c.pendingDelete;
                  const isPermanent = c.contractType === 'PKWTT';

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-primary-red/5 transition-colors ${
                        c.pendingDelete ? 'bg-rose-50/40 opacity-90' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{c.employeeName}</p>
                        <p className="text-[11px] font-mono text-muted">
                          {c.employeeId} • {c.position || 'Staff'}
                        </p>
                        {c.clientName && (
                          <p className="text-[10px] text-muted truncate max-w-[180px]">
                            {c.clientName}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-muted">
                        {c.contractNumber}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            isPermanent
                              ? 'success'
                              : c.contractType === 'PROBATION'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {c.contractType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted font-mono">
                        {c.startDate} s/d {isPermanent ? 'Permanen' : c.endDate}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {isPermanent ? (
                          <span className="text-success text-[11px] font-bold">Permanen</span>
                        ) : isExpiring ? (
                          <span className="text-error font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {c.daysRemaining} Hari Lagi
                          </span>
                        ) : (
                          <span className="text-muted">{c.daysRemaining} Hari</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              c.documentCompleteness === 100
                                ? 'text-success'
                                : c.documentCompleteness >= 75
                                ? 'text-info'
                                : 'text-warning'
                            }`}
                          />
                          <span className="font-semibold text-ink">
                            {c.documentCompleteness || 100}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {c.pendingDelete ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-warning/15 text-warning-text border border-warning/30">
                            <Clock className="h-3 w-3" />
                            Approval Direktur
                          </span>
                        ) : isExpiring ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-danger/10 text-danger">
                            Segera Habis
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-success/10 text-success">
                            Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Detail Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(c)}
                            className="p-1.5 rounded-lg border border-border bg-white text-muted hover:text-ink hover:bg-canvas transition-colors"
                            title="Lihat Detail & Checklist Dokumen"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg border border-border bg-white text-muted hover:text-primary-red hover:bg-canvas transition-colors"
                            title="Edit Kontrak & Dokumen"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Extend Button */}
                          <button
                            type="button"
                            onClick={() => handleExtend(c)}
                            className="p-1.5 rounded-lg border border-border bg-white text-muted hover:text-primary-red hover:bg-canvas transition-colors"
                            title="Perpanjang Masa Kontrak"
                          >
                            <Clock className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Button (Routes to Direktur Utama approval) */}
                          {c.pendingDelete ? (
                            <span
                              className="p-1.5 text-muted opacity-50 cursor-not-allowed"
                              title="Permohonan penghapusan sedang menunggu persetujuan Direktur Utama"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(c)}
                              className="p-1.5 rounded-lg border border-border bg-white text-muted hover:text-danger hover:border-danger/30 hover:bg-danger/5 transition-colors"
                              title="Hapus Kontrak (Masuk Approval Direktur)"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && contracts.length > 0 && (
          <div className="p-3.5 border-t border-border bg-canvas/30 flex items-center justify-between text-xs text-muted">
            <p>
              Menampilkan <span className="font-medium text-ink">{(page - 1) * 12 + 1}</span> -{' '}
              <span className="font-medium text-ink">{Math.min(page * 12, meta.total)}</span> dari{' '}
              <span className="font-medium text-ink">{meta.total}</span> data kontrak
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn-pagination-nav"
                title="Halaman Sebelumnya"
                aria-label="Halaman Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4 text-primary-red" strokeWidth={2.5} />
              </button>
              <span className="px-2 font-medium text-ink">
                Halaman {page} dari {meta.totalPages || 1}
              </span>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="btn-pagination-nav"
                title="Halaman Berikutnya"
                aria-label="Halaman Berikutnya"
              >
                <ChevronRight className="h-4 w-4 text-primary-red" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ContractFormModal
        isOpen={isFormOpen}
        initialData={editingContract}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadData}
      />

      <ContractDetailModal
        isOpen={isDetailOpen}
        contract={detailContract}
        onClose={() => setIsDetailOpen(false)}
        onEdit={handleOpenEdit}
        onExtend={handleExtend}
        onDelete={handleOpenDelete}
      />

      <ContractDeleteModal
        isOpen={isDeleteOpen}
        contract={deletingContract}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
