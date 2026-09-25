/**
 * COD Collection Modal — PT. BARAK IOMS
 * Record collection attempt on courier COD discrepancy.
 * Source of Truth: PRD Section 12.5 & Section 14.
 */

import React, { useState } from 'react';
import { PhoneCall, X, Send } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CODCollectionModal({ isOpen, onClose, codCase, onSubmit }) {
  const [formData, setFormData] = useState({
    contactMethod: 'Panggilan Telepon Langsung',
    pic: 'Fauzi (Staff Ops & Collection)',
    result: '',
    promisedAmount: '',
    nextAction: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !codCase) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.result.trim() || !formData.nextAction.trim()) {
      setError('Hasil komunikasi dan rencana tindak lanjut wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(codCase.id, formData);
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan catatan penagihan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border flex items-center justify-between bg-primary-red/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary-red/10 text-primary-red">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Catat Upaya Penagihan COD</h3>
              <p className="text-xs text-muted">Log penagihan selisih setoran kurir lapangan</p>
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
            <p className="font-semibold text-ink">{codCase.caseNumber} — Kurir: {codCase.courierName}</p>
            <p className="text-muted">Klien: <span className="text-ink font-medium">{codCase.clientName}</span></p>
            <p className="text-muted">Selisih Belum Disetor: <span className="font-bold text-primary-red">Rp {codCase.outstandingAmount.toLocaleString('id-ID')}</span></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Metode Kontak <span className="text-primary-red">*</span>
              </label>
              <select
                name="contactMethod"
                value={formData.contactMethod}
                onChange={handleChange}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="Panggilan Telepon Langsung">Panggilan Telepon Langsung</option>
                <option value="WhatsApp & Pesan Teks">WhatsApp & Pesan Teks</option>
                <option value="Pemanggilan ke Posko / Hub">Pemanggilan ke Posko / Hub</option>
                <option value="Kunjungan Alamat Domisili">Kunjungan Alamat Domisili</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Petugas PIC Penagih
              </label>
              <input
                type="text"
                name="pic"
                value={formData.pic}
                onChange={handleChange}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nominal yang Dijanjikan Kurir (Rp)
            </label>
            <input
              type="number"
              name="promisedAmount"
              value={formData.promisedAmount}
              onChange={handleChange}
              placeholder="Contoh: 500000"
              max={codCase.outstandingAmount}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Hasil Komunikasi / Klarifikasi Kurir <span className="text-primary-red">*</span>
            </label>
            <textarea
              rows={2}
              name="result"
              value={formData.result}
              onChange={handleChange}
              placeholder="Jelaskan alasan kurir dan tanggapan atas kekurangan setoran uang COD..."
              className="w-full text-xs border border-border rounded-lg p-2.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Rencana Tindak Lanjut (Next Action) <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="nextAction"
              value={formData.nextAction}
              onChange={handleChange}
              placeholder="Contoh: Penagihan ulang tgl 24 September / Potong gaji..."
              className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5">
              <Send className="h-4 w-4" />
              <span>Simpan Catatan</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
