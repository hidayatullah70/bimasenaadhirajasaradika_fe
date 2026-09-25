/**
 * Payment Record Modal — PT. BARAK IOMS
 * Record client invoice payment / bank transfer.
 * Source of Truth: PRD Section 14 (Finance Module) & Section 22 (Audit Log).
 */

import React, { useState } from 'react';
import { CreditCard, X, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PaymentRecordModal({ isOpen, onClose, invoice, onSubmit }) {
  const [formData, setFormData] = useState({
    amount: invoice?.remainingAmount || 0,
    paymentMethod: 'Bank Transfer (BCA)',
    referenceNumber: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !invoice) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountNum = Number(formData.amount);
    if (!amountNum || amountNum <= 0) {
      setError('Nominal pembayaran harus lebih besar dari 0.');
      return;
    }
    if (amountNum > invoice.remainingAmount) {
      setError(`Nominal pembayaran melebihi sisa tagihan (Rp ${invoice.remainingAmount.toLocaleString('id-ID')}).`);
      return;
    }
    if (!formData.referenceNumber.trim()) {
      setError('Nomor referensi / bukti transfer bank wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(invoice.id, formData);
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal mencatat pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border flex items-center justify-between bg-accent-green/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent-green/10 text-accent-green">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Catat Pembayaran Tagihan</h3>
              <p className="text-xs text-muted">Pelunasan atau pembayaran termin invoice klien</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-primary-red/10 text-primary-red rounded-lg border border-primary-red/20">
              {error}
            </div>
          )}

          <div className="p-3 bg-surface rounded-lg border border-border text-xs space-y-1">
            <p className="font-semibold text-ink">{invoice.invoiceNumber} — {invoice.clientName}</p>
            <p className="text-muted">Total Tagihan: <span className="font-semibold text-ink">Rp {invoice.totalAmount.toLocaleString('id-ID')}</span></p>
            <p className="text-muted">Sisa Belum Dibayar: <span className="font-bold text-primary-red">Rp {invoice.remainingAmount.toLocaleString('id-ID')}</span></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nominal Setoran / Pembayaran (Rp) <span className="text-primary-red">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              max={invoice.remainingAmount}
              min={1000}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Metode Pembayaran <span className="text-primary-red">*</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-green/20"
              >
                <option value="Bank Transfer (BCA)">Bank Transfer (BCA)</option>
                <option value="Bank Transfer (Mandiri)">Bank Transfer (Mandiri)</option>
                <option value="Bank Transfer (BRI)">Bank Transfer (BRI)</option>
                <option value="Giro / Cek">Giro / Bilyet Cek</option>
                <option value="Tunai / Kasir">Tunai / Kasir Langsung</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                No. Referensi / Bukti Transfer <span className="text-primary-red">*</span>
              </label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="Contoh: TRF-BCA-9912041"
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Catatan / Berita Acara Penerimaan
            </label>
            <textarea
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Pelunasan termin 1 / Setoran resmi bank..."
              className="w-full text-xs border border-border rounded-lg p-2.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-green/20"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5 bg-accent-green hover:bg-accent-green/90">
              <CheckCircle2 className="h-4 w-4" />
              <span>Simpan Pembayaran</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
