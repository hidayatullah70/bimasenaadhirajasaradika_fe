/**
 * Applicant Reject Modal — PT. BARAK IOMS
 * Archives rejected applicant into "Data Arsip Pelamar Ditolak" with a stated reason.
 */

import React, { useState } from 'react';
import { X, XCircle, Archive, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const STANDARD_REASONS = [
  'Kualifikasi kompetensi belum sesuai standar kebutuhan operasional.',
  'Kuota formasi penempatan untuk wilayah terkait saat ini sudah terpenuhi.',
  'Berkas dokumen pendukung belum lengkap / tidak memenuhi syarat administrasi.',
  'Kandidat berhalangan hadir saat konfirmasi / wawancara penjajakan.',
  'Tidak lolos verifikasi eKTP / data catatan kepolisian (SKCK).',
];

export default function ApplicantRejectModal({
  applicant,
  isOpen,
  onClose,
  onConfirm,
}) {
  const [selectedReason, setSelectedReason] = useState(STANDARD_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !applicant) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalReason = isCustom ? customReason.trim() || selectedReason : selectedReason;
    try {
      await onConfirm(applicant.id, finalReason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-error/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-error/20 flex items-center justify-center text-error flex-none">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Arsipkan Pelamar Ditolak</h2>
              <p className="text-xs text-muted">
                Data akan dipindahkan ke folder Arsip Pelamar Ditolak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-white/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-canvas rounded-lg border border-border">
            <p className="font-bold text-ink text-sm">{applicant.namaLengkap}</p>
            <p className="text-muted mt-0.5">
              NIK: <span className="font-mono text-ink">{applicant.nik}</span> • Layanan: <strong className="text-ink">{applicant.departemen}</strong>
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-none mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Pelamar ini tidak akan dihapus dari sistem. Rekaman ini diarsipkan secara aman di tab <strong>Arsip Pelamar Ditolak</strong> dan dapat ditinjau atau dipulihkan kembali sewaktu-waktu.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1.5">
              Alasan Penolakan / Catatan Arsip
            </label>
            <select
              value={isCustom ? 'custom' : selectedReason}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustom(true);
                } else {
                  setIsCustom(false);
                  setSelectedReason(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium mb-2"
            >
              {STANDARD_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="custom">+ Tulis Alasan Khusus Lainnya...</option>
            </select>

            {isCustom && (
              <textarea
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tuliskan catatan detail alasan penolakan..."
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink placeholder:text-muted focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                required
              />
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 bg-error hover:bg-error/90 text-white font-semibold"
            >
              <XCircle className="h-4 w-4" />
              <span>{isSubmitting ? 'Mengarsipkan...' : 'Tolak & Masukkan ke Arsip'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
