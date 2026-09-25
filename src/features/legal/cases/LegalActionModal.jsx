/**
 * Legal Action Modal — PT. BARAK IOMS
 * Record legal action (Somasi, BAP Polisi, Mediasi, Surat Peringatan).
 * Source of Truth: PRD Section 12.4 & Section 22 (Audit Log).
 */

import React, { useState } from 'react';
import { Scale, X, Send } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LegalActionModal({ isOpen, onClose, legalCase, onSubmit }) {
  const [formData, setFormData] = useState({
    actionType: 'SOMASI_1',
    title: '',
    description: '',
    recordedBy: 'Farhan Maulana (Legal)',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !legalCase) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Judul tindakan dan deskripsi hasil tindakan hukum wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(legalCase.id, formData);
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan tindakan hukum.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border flex items-center justify-between bg-primary-red/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary-red/10 text-primary-red">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Catat Tindakan Hukum / Surat Resmi</h3>
              <p className="text-xs text-muted">Dokumentasikan penerbitan somasi, koordinasi aparat, atau mediasi</p>
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
            <p className="font-semibold text-ink">{legalCase.caseNumber} — {legalCase.subject}</p>
            <p className="text-muted">Pihak Terkait: <span className="text-ink font-medium">{legalCase.targetEntity}</span></p>
            <p className="text-muted">Klien: <span className="text-ink font-medium">{legalCase.clientName}</span></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Kategori Tindakan Hukum <span className="text-primary-red">*</span>
              </label>
              <select
                name="actionType"
                value={formData.actionType}
                onChange={handleChange}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="SOMASI_1">Surat Somasi I (Peringatan Tertulis)</option>
                <option value="SOMASI_2">Surat Somasi II (Teguran Keras)</option>
                <option value="WARNING_LETTER">Surat Peringatan Disiplin (SP)</option>
                <option value="POLICE_COORDINATION">Koordinasi Kepolisian / Polsek</option>
                <option value="MEDIATION">Mediasi & Musyawarah Damai</option>
                <option value="LEGAL_OPINION">Legal Opinion & Telaah Hukum</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Petugas Legal / PIC <span className="text-primary-red">*</span>
              </label>
              <input
                type="text"
                name="recordedBy"
                value={formData.recordedBy}
                onChange={handleChange}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Judul Tindakan / Perihal Surat <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Penerbitan Surat Somasi I No. 041/LEG-BRK/IX/2026..."
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Rincian Hasil & Dokumentasi Tindakan <span className="text-primary-red">*</span>
            </label>
            <textarea
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan isi pokok somasi, batas tenggat waktu tanggapan, atau hasil pertemuan koordinasi..."
              className="w-full text-xs border border-border rounded-lg p-2.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              required
            />
            <p className="text-[11px] text-muted mt-1">
              Tindakan ini akan tercatat permanen dalam riwayat penanganan perkara hukum dan Audit Log.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5 bg-primary-red hover:bg-primary-red/90">
              <Send className="h-4 w-4" />
              <span>Simpan Tindakan Hukum</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
