/**
 * Invoice Form Modal — PT. BARAK IOMS
 * Create client billing invoice.
 * Source of Truth: PRD Section 14 (Finance Module).
 */

import React, { useState } from 'react';
import { FileText, X, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function InvoiceFormModal({ isOpen, onClose, clients, onSubmit }) {
  const [formData, setFormData] = useState({
    clientId: '',
    billingPeriod: 'September 2026',
    serviceDescription: '',
    subtotal: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const subtotalNum = Number(formData.subtotal) || 0;
  const taxAmount = Math.round(subtotalNum * 0.11);
  const totalAmount = subtotalNum + taxAmount;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.serviceDescription.trim() || !subtotalNum) {
      setError('Klien, Deskripsi Layanan, dan Subtotal nominal wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const client = clients.find((c) => c.id === formData.clientId);
      await onSubmit({
        ...formData,
        clientName: client ? client.name : 'Klien Korporasi',
        subtotal: subtotalNum,
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal membuat tagihan faktur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-border overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border flex items-center justify-between bg-primary-red/5 flex-none">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary-red/10 text-primary-red">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Terbitkan Tagihan (Invoice) Baru</h3>
              <p className="text-xs text-muted">Faktur resmi penagihan jasa outsourcing kepada klien</p>
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

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs bg-primary-red/10 text-primary-red rounded-lg border border-primary-red/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Klien Tertagih <span className="text-primary-red">*</span>
            </label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              required
            >
              <option value="">Pilih Klien</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type || 'Korporasi'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Periode Tagihan <span className="text-primary-red">*</span>
              </label>
              <input
                type="text"
                name="billingPeriod"
                value={formData.billingPeriod}
                onChange={handleChange}
                placeholder="Contoh: September 2026"
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Subtotal Nilai Jasa (Rp) <span className="text-primary-red">*</span>
              </label>
              <input
                type="number"
                name="subtotal"
                value={formData.subtotal}
                onChange={handleChange}
                placeholder="Contoh: 36000000"
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Deskripsi / Rincian Penempatan Jasa <span className="text-primary-red">*</span>
            </label>
            <textarea
              rows={2}
              name="serviceDescription"
              value={formData.serviceDescription}
              onChange={handleChange}
              placeholder="Contoh: Jasa Pengamanan & Manpower Central Hub Rawa Bokor (6 Personel)"
              className="w-full text-sm border border-border rounded-lg p-2.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Tanggal Terbit Faktur
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Tanggal Jatuh Tempo Pembayaran
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              />
            </div>
          </div>

          {/* Tax & Total Summary Box */}
          <div className="p-3 bg-surface rounded-xl border border-border space-y-1.5 text-xs">
            <div className="flex justify-between text-muted">
              <span>Subtotal:</span>
              <span className="font-medium text-ink">Rp {subtotalNum.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>PPN 11%:</span>
              <span className="font-medium text-ink">Rp {taxAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-ink pt-1.5 border-t border-border">
              <span>Total Tagihan Bersih:</span>
              <span className="text-primary-red font-bold">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Catatan Rekening / Instruksi Transfer
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Rekening BCA PT Bhimasena Adhirajasa Radhika..."
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Terbitkan Faktur</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
