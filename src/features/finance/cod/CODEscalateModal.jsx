/**
 * COD Escalate Modal — PT. BARAK IOMS
 * Escalate unresolved COD discrepancy to Legal Division.
 * Source of Truth: PRD Section 12.5 (COD Case) & Section 18 (Cross-department workflow).
 */

import React, { useState } from 'react';
import { Scale, X, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CODEscalateModal({ isOpen, onClose, codCase, onEscalate }) {
  const [reason, setReason] = useState(
    'Kurir tidak dapat dihubungi dan telah melewati batas toleransi waktu penyetoran. Mohon bantuan somasi/penelusuran penjamin kerja.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !codCase) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan eskalasi ke Divisi Legal wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onEscalate(codCase.id, { reason });
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal melakukan eskalasi.');
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
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Eskalasi ke Divisi Legal</h3>
              <p className="text-xs text-muted">Pelimpahan kasus selisih COD tak tertagih</p>
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
            <p className="font-semibold text-ink">{codCase.caseNumber} — {codCase.courierName}</p>
            <p className="text-muted">Klien: <span className="text-ink font-medium">{codCase.clientName}</span></p>
            <p className="text-muted">Nilai Selisih Kasus: <span className="font-bold text-primary-red">Rp {codCase.outstandingAmount.toLocaleString('id-ID')}</span></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Alasan Pelimpahan ke Legal <span className="text-primary-red">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs border border-border rounded-lg p-2.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              required
            />
            <p className="text-[11px] text-muted mt-1">
              Divisi Legal akan menerbitkan surat peringatan / somasi kepada kurir dan penjamin kerja resmi. Tindakan ini tercatat di Audit Log.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5 bg-primary-red hover:bg-primary-red/90">
              <ShieldAlert className="h-4 w-4" />
              <span>Kirim ke Divisi Legal</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
