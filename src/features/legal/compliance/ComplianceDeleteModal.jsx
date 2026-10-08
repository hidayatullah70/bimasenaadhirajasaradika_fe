/**
 * Compliance Delete Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 6.1 (Direktur Role), Section 12.3 (Compliance & SIO BUJP),
 * Section 19 (RBAC), and Governance Rule: All deletions require Direktur Utama approval.
 *
 * Implements authoritative Maker-Checker segregation of duties:
 * - Legal / Staff: Initiates "Request Delete Compliance/SIO Document" -> Enqueued to Direktur Utama Approval Center.
 * - Direktur Utama: Direct executive soft-delete with full audit trail logging.
 */

import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, ShieldCheck, Building } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLES } from '@/constants/roles';
import legalAdapter from '@/services/adapters/legalAdapter';
import toast from 'react-hot-toast';

export default function ComplianceDeleteModal({ isOpen, item, onClose, onSuccess }) {
  const { currentUser, hasRole } = useAuth();
  const isDirector = hasRole([ROLES.DIREKTUR]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Mohon cantumkan alasan penghapusan / pencabutan dokumen perizinan.');
      return;
    }

    setLoading(true);
    try {
      if (isDirector) {
        // Direktur performs direct soft delete
        await legalAdapter.deleteComplianceItem(item.id, {
          deletedBy: `${currentUser?.name || 'Juli Priyanto'} (Direktur Utama)`,
          reason: reason.trim(),
        });
        toast.success(`Dokumen perizinan "${item.licenseName}" berhasil dihapus.`);
      } else {
        // Legal / Staff routes to Direktur Utama approval queue
        await legalAdapter.requestDeleteComplianceItem(item.id, {
          reason: reason.trim(),
          requestedBy: `${currentUser?.name || 'Farhan Maulana'} (${currentUser?.role || 'Legal'})`,
        });
        toast.success(
          `Pengajuan hapus perizinan "${item.licenseName}" telah dikirim ke Direktur Utama untuk disetujui.`
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Gagal memproses permohonan penghapusan perizinan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-danger/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center flex-none">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">
                {isDirector ? 'Konfirmasi Penghapusan Perizinan' : 'Pengajuan Hapus Dokumen Perizinan (SIO)'}
              </h2>
              <p className="text-xs text-muted">
                {isDirector
                  ? 'Otoritas Tertinggi Direksi (Soft Delete)'
                  : 'Wajib Melalui Persetujuan Direktur Utama'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Info */}
          <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface border border-border text-muted">
                  {item.category}
                </span>
                <p className="font-bold text-ink text-sm mt-1">{item.licenseName}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-red/10 text-primary-red font-mono flex-none">
                {item.id}
              </span>
            </div>

            <div className="space-y-1 text-muted pt-1 border-t border-border">
              <div className="flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 flex-none" />
                <span className="truncate">{item.issuingAuthority}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink">
                <ShieldCheck className="h-3.5 w-3.5 text-primary-red flex-none" />
                <span className="truncate">No: {item.licenseNumber}</span>
              </div>
            </div>
          </div>

          {/* Maker-Checker Governance Notice */}
          {!isDirector ? (
            <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-2.5 text-warning-dark">
              <ShieldAlert className="h-4 w-4 flex-none mt-0.5 text-warning" />
              <div className="space-y-1">
                <p className="font-bold text-[11px] text-ink">Tata Kelola Maker-Checker (Segregation of Duties)</p>
                <p className="text-[11px] leading-relaxed text-muted">
                  Dokumen legalitas dan perizinan operasional badan usaha tidak dapat langsung dihapus oleh staf Legal. Permohonan ini akan diteruskan ke antrean <strong>Pusat Persetujuan (Approval Center) Direktur Utama</strong> untuk diverifikasi sebelum dieksekusi secara permanen di sistem.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-danger">
              <AlertTriangle className="h-4 w-4 flex-none mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-[11px]">Tindakan Eksekutif Direksi</p>
                <p className="text-[11px] leading-relaxed text-muted">
                  Sebagai Direktur Utama, tindakan ini akan menonaktifkan dokumen perizinan dari register aktif dan mencatat jejak audit resmi atas nama Anda.
                </p>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="font-semibold text-ink flex items-center justify-between">
              <span>Alasan Penghapusan / Pembatalan Izin <span className="text-danger">*</span></span>
              <span className="text-[10px] text-muted font-normal">Wajib diisi</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Dokumen izin telah diperbarui dengan nomor SIO baru / Regulasi dicabut oleh instansi berwenang..."
              className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant={isDirector ? 'danger' : 'primary'}
              size="sm"
              disabled={loading || !reason.trim()}
              className="text-xs gap-1.5"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : isDirector ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Hapus Sekarang</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Kirim Pengajuan ke Direktur Utama</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
