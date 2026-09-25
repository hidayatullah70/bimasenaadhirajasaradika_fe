/**
 * Modal Deal WON & Handover ke Operasional & Finance — PT. BARAK IOMS
 * Source of Truth: PRD Section 15 (Opportunity WON), Section 18 (Cross-department workflow: Marketing -> Ops & Finance).
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { marketingAdapter } from '@/services/adapters/marketingAdapter';
import { CheckCircle2, Shield, DollarSign } from 'lucide-react';

export default function OpportunityWonModal({ isOpen, onClose, opportunity, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    signedContractNumber: opportunity
      ? `PKS/BRK-${opportunity.companyName.substring(0, 3).toUpperCase()}/2026/09/01`
      : '',
    manpowerQuota: opportunity?.estimatedManpower || 6,
    monthlyBilling: opportunity?.monthlyValue || 36000000,
    billingTerm: 'Net 30 Hari',
    operationsPic: 'Hadi Suprianto (Korlap Operasional)',
    financePic: 'Siti Rahma (Finance Billing & AR)',
    notes: 'PKS ditandatangani. Siap dilakukan penempatan personel satpam dan pembukaan akun billing.',
  });

  if (!opportunity) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.signedContractNumber) {
      toast.error('Nomor Kontrak PKS wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await marketingAdapter.markOpportunityWon(opportunity.id, formData);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        `Selamat! Deal ${opportunity.companyName} RESMI WON. Data diserahterimakan ke Operasional & Finance.`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('Gagal mencatat status Deal WON.');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tandai Deal Menang (WON) & Serah Terima Klien"
      description="Menutup peluang penjualan sebagai MENANG (100%) dan memicu sinkronisasi serah terima pos ke Operasional dan akun tagihan ke Finance."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Deal Info Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-ink flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-accent-green shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-accent-green">{opportunity.companyName}</p>
            <p className="text-muted">
              Peluang: {opportunity.opportunityNumber} · Layanan: {opportunity.serviceInterest}
            </p>
            <p className="text-muted">
              Nilai Kontrak Bulanan Saat Ini:{' '}
              <span className="font-bold text-ink">{formatRupiah(opportunity.monthlyValue)}</span> (Tahunan:{' '}
              {formatRupiah(opportunity.annualValue || opportunity.monthlyValue * 12)})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nomor Kontrak PKS Resmi <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="signedContractNumber"
              value={formData.signedContractNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Termin Pembayaran Invoice
            </label>
            <select
              name="billingTerm"
              value={formData.billingTerm}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
            >
              <option value="Net 14 Hari">Net 14 Hari</option>
              <option value="Net 30 Hari">Net 30 Hari (Standar)</option>
              <option value="Net 45 Hari">Net 45 Hari</option>
              <option value="CBD (Cash Before Delivery)">CBD (Cash Before Delivery)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Kuota Manpower Final (Personel)
            </label>
            <input
              type="number"
              name="manpowerQuota"
              min="1"
              value={formData.manpowerQuota}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Tagihan Bulanan Final (Rp)
            </label>
            <input
              type="number"
              name="monthlyBilling"
              min="1000000"
              step="500000"
              value={formData.monthlyBilling}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-info" />
              <span>PIC Penerima Operasional (Pos & Manpower)</span>
            </label>
            <input
              type="text"
              name="operationsPic"
              value={formData.operationsPic}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-accent-green" />
              <span>PIC Penerima Finance (Billing & AR)</span>
            </label>
            <input
              type="text"
              name="financePic"
              value={formData.financePic}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink mb-1">
              Instruksi Khusus & Catatan Serah Terima (Handover Notes)
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading} className="bg-accent-green hover:bg-emerald-600 border-none">
            {loading ? 'Memproses Serah Terima...' : 'Konfirmasi WON & Kirim Handover'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
