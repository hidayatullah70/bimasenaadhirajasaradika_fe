/**
 * Modal Deal LOST (Dibatalkan) — PT. BARAK IOMS
 * Source of Truth: PRD Section 15 (Opportunity Lost: capture explicit reason).
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { marketingAdapter } from '@/services/adapters/marketingAdapter';
import { AlertCircle } from 'lucide-react';

const COMMON_REASONS = [
  'Anggaran klien tidak mencukupi / Penawaran di atas plafon budget klien',
  'Klien memilih vendor BUJP kompetitor lain dengan harga lebih rendah',
  'Klien memutuskan mengelola pengamanan / tenaga kerja secara internal mandiri',
  'Proyek pembukaan lokasi/kawasan klien ditunda atau dibatalkan',
  'Ketidaksesuaian SLA atau ketentuan komersial (termin pembayaran Net 30 ditolak)',
];

export default function OpportunityLostModal({ isOpen, onClose, opportunity, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!opportunity) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = customReason.trim() ? `${selectedPreset} - ${customReason}` : selectedPreset;

    setLoading(true);
    try {
      const res = await marketingAdapter.markOpportunityLost(opportunity.id, finalReason);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`Peluang ${opportunity.companyName} ditandai sebagai LOST.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('Gagal mencatat status deal lost.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tandai Peluang Dibatalkan (LOST)"
      description="Sesuai SOP PRD Section 15, pencatatan alasan pembatalan (lost reason) wajib diisi untuk evaluasi tim komersial."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Deal Info Banner */}
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-ink flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-primary-red shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-primary-red">{opportunity.companyName}</p>
            <p className="text-muted">
              {opportunity.opportunityNumber} · Nilai: Rp {opportunity.monthlyValue?.toLocaleString('id-ID')}/bln
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Kategori Alasan Pembatalan (Lost Reason) <span className="text-primary-red">*</span>
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
          >
            {COMMON_REASONS.map((reason, idx) => (
              <option key={idx} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Keterangan Detail / Catatan Evaluasi Sales
          </label>
          <textarea
            rows={3}
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Jelaskan faktor spesifik dari feedback klien, vendor pemenang jika diketahui, dll..."
            className="w-full px-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Kembali
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading} className="bg-primary-red hover:bg-red-700">
            {loading ? 'Menyimpan...' : 'Konfirmasi LOST'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
