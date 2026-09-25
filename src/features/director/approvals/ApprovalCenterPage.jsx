/**
 * ApprovalCenterPage — Executive Approval Center
 * Source of Truth: PRD Section 6.1 (Direktur), Section 18 (Cross-department workflow: Director approval),
 * Section 22 (Audit Log), Section 39 (Approval).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CheckSquare, Search, Filter, CheckCircle2, XCircle,
  Clock, DollarSign, Users, AlertCircle, FileText,
  ShieldAlert, RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import directorAdapter from '@/services/adapters/directorAdapter';
import toast from 'react-hot-toast';

export default function ApprovalCenterPage() {
  const context = useOutletContext();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected item for review modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [directorNotes, setDirectorNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await directorAdapter.getPendingApprovals({
        search,
        department: departmentFilter,
        status: statusFilter,
      });
      if (res.data) {
        setApprovals(res.data);
      }
    } catch (err) {
      console.error('Failed to load approvals', err);
      toast.error('Gagal memuat daftar persetujuan.');
    } finally {
      setLoading(false);
    }
  }, [search, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const openReviewModal = (item) => {
    setSelectedItem(item);
    setDirectorNotes('');
  };

  const closeReviewModal = () => {
    setSelectedItem(null);
    setDirectorNotes('');
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const res = await directorAdapter.approveItem(selectedItem.id, {
        notes: directorNotes || 'Disetujui oleh Direktur Utama sesuai pertimbangan kepatuhan operasional.',
        actorName: 'Juli Priyanto (Direktur)',
      });

      if (res.data) {
        toast.success(`Pengajuan "${selectedItem.title}" berhasil disetujui!`);
        closeReviewModal();
        fetchApprovals();
        if (context?.setBadgeCounts) {
          context.setBadgeCounts((prev) => ({
            ...prev,
            pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
          }));
        }
      } else {
        toast.error(res.error?.message || 'Gagal memproses persetujuan.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat memproses persetujuan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    if (!directorNotes.trim()) {
      toast.error('Wajib mengisi alasan penolakan pada catatan Direktur.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await directorAdapter.rejectItem(selectedItem.id, {
        reason: directorNotes,
        actorName: 'Juli Priyanto (Direktur)',
      });

      if (res.data) {
        toast.success(`Pengajuan "${selectedItem.title}" telah ditolak dan dikembalikan ke pengusul.`);
        closeReviewModal();
        fetchApprovals();
        if (context?.setBadgeCounts) {
          context.setBadgeCounts((prev) => ({
            ...prev,
            pendingApprovals: Math.max(0, prev.pendingApprovals - 1),
          }));
        }
      } else {
        toast.error(res.error?.message || 'Gagal menolak pengajuan.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat menolak pengajuan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;
  const approvedCount = approvals.filter((a) => a.status === 'APPROVED').length;
  const rejectedCount = approvals.filter((a) => a.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-4">
          <span className="p-3 bg-amber-50 rounded-xl text-amber-600 flex-none">
            <Clock className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted">Menunggu Persetujuan Direktur</p>
            <p className="text-xl font-bold text-ink mt-0.5">{pendingCount} Pengajuan</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-4">
          <span className="p-3 bg-emerald-50 rounded-xl text-emerald-600 flex-none">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted">Telah Disetujui (Approved)</p>
            <p className="text-xl font-bold text-ink mt-0.5">{approvedCount} Item</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex items-center gap-4">
          <span className="p-3 bg-rose-50 rounded-xl text-rose-600 flex-none">
            <XCircle className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-medium text-muted">Ditolak / Dikembalikan (Rejected)</p>
            <p className="text-xl font-bold text-ink mt-0.5">{rejectedCount} Item</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nomor, judul, atau pengusul..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary-red"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter:</span>
              </div>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-border rounded-lg text-ink"
              >
                <option value="">Semua Departemen</option>
                <option value="FINANCE">Finance (Payroll)</option>
                <option value="LEGAL">Legal (PKS & Kasus)</option>
                <option value="OPERASIONAL">Operasional (CapEx)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-border rounded-lg text-ink"
              >
                <option value="">Semua Status</option>
                <option value="PENDING">Menunggu Persetujuan</option>
                <option value="APPROVED">Disetujui</option>
                <option value="REJECTED">Ditolak</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchApprovals}
                title="Refresh"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary-red" />
              Antrean Persetujuan Lintas Departemen
            </CardTitle>
            <span className="text-xs text-muted">
              Menampilkan {approvals.length} berkas pengajuan
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-muted">
              <RefreshCw className="h-6 w-6 text-primary-red animate-spin mx-auto mb-2" />
              Memuat data antrean persetujuan...
            </div>
          ) : approvals.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted">
              Tidak ditemukan pengajuan sesuai kriteria pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-muted uppercase text-2xs tracking-wider border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ID / Urgensi</th>
                    <th className="px-4 py-3 font-semibold">Judul Pengajuan</th>
                    <th className="px-4 py-3 font-semibold">Departemen & Pengusul</th>
                    <th className="px-4 py-3 font-semibold">Nilai Finansial</th>
                    <th className="px-4 py-3 font-semibold">Dampak</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {approvals.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-ink">{item.id}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-2xs font-semibold ${
                              item.priority === 'HIGH'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            Prioritas {item.priority}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="font-semibold text-ink line-clamp-1">{item.title}</p>
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">{item.description}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.department}
                        </span>
                        <p className="text-2xs text-muted mt-1 truncate">{item.submittedBy}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-ink">
                        {item.amount ? (
                          <span className="font-mono font-bold text-emerald-700">
                            Rp {item.amount.toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted">
                        {item.headcount ? (
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3" /> {item.headcount} Orang
                          </span>
                        ) : (
                          <span>Operasional</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Badge status={item.status} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <Button
                          size="xs"
                          onClick={() => openReviewModal(item)}
                          className={
                            item.status === 'PENDING'
                              ? 'bg-primary-red hover:bg-red-700 text-white font-medium'
                              : 'bg-slate-100 hover:bg-slate-200 text-ink'
                          }
                        >
                          {item.status === 'PENDING' ? 'Tinjau & Putuskan' : 'Rincian Berkas'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review & Decision Modal */}
      {selectedItem && (
        <Modal
          isOpen={true}
          onClose={closeReviewModal}
          title="Tinjauan Berkas Pengajuan Keputusan Direktur"
          size="lg"
        >
          <div className="space-y-4">
            {/* Header info card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="px-2 py-0.5 text-2xs font-bold rounded-full bg-slate-200 text-slate-800">
                    {selectedItem.department} · {selectedItem.type}
                  </span>
                  <h3 className="text-base font-bold text-ink mt-1.5">{selectedItem.title}</h3>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    Nomor Pengajuan: {selectedItem.id} · Ref: {selectedItem.referenceId}
                  </p>
                </div>
                <Badge status={selectedItem.status} />
              </div>

              <p className="text-xs text-ink/90 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                {selectedItem.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <p className="text-muted">Diajukan Oleh</p>
                  <p className="font-semibold text-ink">{selectedItem.submittedBy}</p>
                </div>
                <div>
                  <p className="text-muted">Nilai Finansial</p>
                  <p className="font-bold text-emerald-700 font-mono">
                    {selectedItem.amount ? `Rp ${selectedItem.amount.toLocaleString('id-ID')}` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Target Urgensi</p>
                  <p className="font-semibold text-amber-700">{selectedItem.urgencyText}</p>
                </div>
              </div>
            </div>

            {/* Detailed Parameters */}
            {selectedItem.details && (
              <div className="p-3 bg-white border border-border rounded-xl space-y-2">
                <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary-red" />
                  Parameter & Verifikasi Lintas Divisi
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg font-mono">
                  {Object.entries(selectedItem.details).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-muted">{key}:</span>
                      <span className="font-semibold text-ink">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Director Notes or Input */}
            {selectedItem.status === 'PENDING' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1">
                  Catatan / Instruksi Direktur Utama
                  <span className="text-muted font-normal">(Wajib jika menolak)</span>
                </label>
                <textarea
                  rows={3}
                  value={directorNotes}
                  onChange={(e) => setDirectorNotes(e.target.value)}
                  placeholder="Tambahkan catatan pertimbangan eksekutif atau alasan penolakan..."
                  className="w-full p-2.5 text-xs sm:text-sm bg-white border border-border rounded-lg focus:outline-hidden focus:ring-1 focus:ring-primary-red"
                />
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <p className="text-muted">Telah Diputuskan Oleh:</p>
                <p className="font-semibold text-ink">{selectedItem.actorName || 'Direktur Utama'}</p>
                {selectedItem.directorNotes && (
                  <p className="text-ink mt-1">Catatan: {selectedItem.directorNotes}</p>
                )}
                {selectedItem.rejectionReason && (
                  <p className="text-rose-700 mt-1">Alasan Penolakan: {selectedItem.rejectionReason}</p>
                )}
              </div>
            )}

            {/* Actions for PENDING */}
            {selectedItem.status === 'PENDING' && (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  onClick={closeReviewModal}
                  disabled={isSubmitting}
                >
                  Tutup
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white w-full sm:w-auto"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Tolak Pengajuan
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Setujui & Tanda Tangani
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
