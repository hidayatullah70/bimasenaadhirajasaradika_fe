/**
 * Reopen Attendance Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.2 & AGENTS.md Workflow Rules.
 * Privileged operation: Unlocking finalized attendance requires mandatory reason and audit trail.
 */

import React, { useState } from 'react';
import { X, Unlock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function ReopenModal({ isOpen, sheet, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !sheet) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 8) {
      toast.error('Alasan pembukaan kembali lembar absensi minimal 8 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(reason);
      setReason('');
      onClose();
    } catch {
      toast.error('Gagal membuka kembali lembar absensi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-amber-50">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="h-5 w-5 text-warning flex-none" />
            <h2 className="text-base font-bold">Otorisasi Pembukaan Kunci (Reopen)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
            <p className="text-muted">Lembar Absensi yang akan dibuka:</p>
            <p className="font-bold text-ink text-sm">{sheet.clientName}</p>
            <p className="text-muted">{sheet.locationName} — <strong className="text-primary-red">{sheet.periodName}</strong></p>
          </div>

          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-amber-900 leading-relaxed text-[11px]">
            <strong>Perhatian Pengamanan Data:</strong> Membuka kembali absensi yang telah difinalisasi akan mempengaruhi perhitungan penggajian Finance. Tindakan ini akan dicatat permanen dalam <strong>Audit Trail</strong> beserta identitas penanggung jawab.
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">
              Alasan Pembukaan Kembali (Wajib Diisi) *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Koreksi absensi pergantian shift malam atas izin Danru pos JNT..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="warning"
              size="sm"
              loading={submitting}
              className="gap-1.5"
            >
              <Unlock className="h-4 w-4" />
              Buka Kunci Lembar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
