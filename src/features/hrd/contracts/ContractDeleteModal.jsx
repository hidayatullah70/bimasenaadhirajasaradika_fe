/**
 * Contract Delete Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 6.1 (Direktur), Section 11.1 (HRD Contracts), Section 19 (RBAC).
 *
 * Implements authoritative Maker-Checker segregation of duties:
 * - HRD / Staff: Initiates "Request Delete Contract & Documents" -> Enqueued to Direktur Utama Approval Center.
 * - Direktur Utama: Direct executive soft-delete with full audit trail logging.
 */

import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLES } from '@/constants/roles';
import contractAdapter from '@/services/adapters/contractAdapter';
import toast from 'react-hot-toast';

export default function ContractDeleteModal({ isOpen, contract, onClose, onSuccess }) {
  const { currentUser, hasRole } = useAuth();
  const isDirector = hasRole([ROLES.DIREKTUR]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !contract) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Mohon cantumkan alasan penghapusan / pembatalan kontrak.');
      return;
    }

    setLoading(true);
    try {
      if (isDirector) {
        // Direktur performs direct soft delete
        await contractAdapter.deleteContract(contract.id, {
          deletedBy: `${currentUser?.name || 'Juli Priyanto'} (Direktur Utama)`,
          reason: reason.trim(),
        });
        toast.success(`Kontrak ${contract.employeeName} (${contract.contractNumber}) berhasil dihapus.`);
      } else {
        // HRD / Staff routes to Direktur Utama approval queue
        await contractAdapter.requestDeleteContract(contract.id, {
          reason: reason.trim(),
          requestedBy: `${currentUser?.name || 'Siti Rahmawati'} (${currentUser?.role || 'HRD'})`,
        });
        toast.success(
          `Pengajuan hapus kontrak ${contract.employeeName} telah dikirim ke Direktur Utama untuk disetujui.`
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Gagal memproses permohonan penghapusan kontrak.');
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
                {isDirector ? 'Konfirmasi Penghapusan Kontrak' : 'Pengajuan Hapus Kontrak & Dokumen'}
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
          <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-ink text-sm">{contract.employeeName}</p>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-red/10 text-primary-red font-mono">
                {contract.contractType}
              </span>
            </div>
            <p className="text-muted font-mono text-[11px]">
              No. Kontrak: {contract.contractNumber} • NIK: {contract.employeeNik || '-'}
            </p>
            <p className="text-muted">
              {contract.position || 'Staff'} • Penempatan: {contract.clientName || 'Head Office'}
            </p>
          </div>

          {/* Workflow Alert */}
          {!isDirector && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="h-4 w-4 text-amber-600 flex-none" />
                <span>Tata Kelola Maker-Checker (Pusat Persetujuan)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Permohonan ini akan otomatis diteruskan ke <strong>Pusat Persetujuan Direktur Utama</strong>.
                Data kontrak tidak akan dihapus sampai Direktur Utama memberikan persetujuan formal.
              </p>
            </div>
          )}

          {/* Reason Input */}
          <div className="space-y-1">
            <label className="block text-muted font-medium">
              Alasan Penghapusan / Pembatalan Kontrak <span className="text-danger">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Contoh: Karyawan mengundurkan diri (Resign), PHK masa evaluasi, pembatalan penempatan..."
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:outline-none focus:ring-1 focus:ring-danger focus:border-danger"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={loading}
              className="text-xs bg-danger hover:bg-danger/90 text-white font-semibold"
            >
              {loading
                ? 'Memproses...'
                : isDirector
                ? 'Hapus Sekarang (Soft Delete)'
                : 'Kirim Pengajuan ke Direktur Utama'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
