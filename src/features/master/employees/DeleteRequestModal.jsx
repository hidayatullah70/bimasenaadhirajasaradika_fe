/**
 * Delete Request Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 6.1, 11.1, 19, 39 / Requirement 5.
 * Non-destructive deletion workflow:
 * - Staff/HRD: Request Delete -> Pending Approval in Director Center.
 * - Director: Direct Approve / Soft Delete (Inactive) with audit.
 */

import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLES } from '@/constants/roles';
import employeeAdapter from '@/services/adapters/employeeAdapter';
import toast from 'react-hot-toast';

export default function DeleteRequestModal({ isOpen, employee, onClose, onSuccess }) {
  const { currentUser, hasRole } = useAuth();
  const isDirector = hasRole([ROLES.DIREKTUR]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Mohon cantumkan alasan penghapusan/penonaktifan.');
      return;
    }

    setLoading(true);
    try {
      if (isDirector) {
        // Direktur performs direct soft delete
        await employeeAdapter.softDeleteEmployee(employee.id || employee.id_karyawan, {
          deletedBy: `${currentUser.name} (Direktur Utama)`,
          reason: reason.trim(),
        });
        toast.success(`Karyawan ${employee.nama_lengkap_sesuai_KTP} berhasil dinonaktifkan (Soft Delete).`);
      } else {
        // HRD / Staff routes to Director approval
        await employeeAdapter.requestDeleteEmployee(employee.id || employee.id_karyawan, {
          reason: reason.trim(),
          requestedBy: `${currentUser?.name || 'HRD Staff'} (${currentUser?.role || 'HRD'})`,
          entityLabel: employee.nama_lengkap_sesuai_KTP,
        });
        toast.success(
          `Pengajuan hapus untuk ${employee.nama_lengkap_sesuai_KTP} telah dikirim ke Direktur Utama untuk disetujui.`
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Gagal memproses permohonan penghapusan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-danger/5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-danger/10 text-danger flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">
                {isDirector ? 'Konfirmasi Penonaktifan Karyawan' : 'Pengajuan Hapus Karyawan'}
              </h2>
              <p className="text-xs text-muted">
                {isDirector ? 'Otoritas Tertinggi Direksi (Soft Delete)' : 'Memerlukan Persetujuan Direktur Utama'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Info */}
          <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
            <p className="font-semibold text-ink text-sm">{employee.nama_lengkap_sesuai_KTP}</p>
            <p className="text-muted font-mono text-[11px]">
               ID: {employee.id_karyawan || employee.id} • NIK: {employee.NIK || '-'}
            </p>
            <p className="text-muted">
              {employee.jabatan || 'Staff'} • Departemen: {employee.departemen || 'Operasional'}
            </p>
          </div>

          {/* Workflow Notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
            <ShieldAlert className="h-4 w-4 flex-none text-amber-700 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              {isDirector ? (
                <p>
                  Sebagai Direktur Utama, tindakan ini akan melakukan <strong>Soft Delete</strong> (menonaktifkan akun
                  dan menyembunyikan dari penugasan aktif). Catatan audit akan dicatat permanen.
                </p>
              ) : (
                <p>
                  Sesuai <strong>Prinsip Tata Kelola PT. BARAK</strong>, penghapusan data karyawan{' '}
                  <strong>bukan operasi langsung yang destruktif</strong>. Permohonan Anda akan tercatat dalam{' '}
                  <strong>Pending Approval Direktur Utama</strong>.
                </p>
              )}
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-ink">
              Alasan {isDirector ? 'Penonaktifan' : 'Pengajuan Hapus'} <span className="text-danger">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Mengundurkan diri secara resmi, kontrak kerja berakhir, atau mutasi..."
              className="w-full p-2.5 text-xs rounded-lg border border-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-danger/20 focus:border-danger"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button
              type="submit"
              variant={isDirector ? 'danger' : 'primary'}
              size="sm"
              loading={loading}
              className="gap-1.5"
            >
              {isDirector ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Setujui & Nonaktifkan (Soft Delete)</span>
                </>
              ) : (
                <span>Kirim Pengajuan ke Direktur Utama</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
