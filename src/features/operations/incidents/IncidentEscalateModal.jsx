/**
 * Incident Escalate Modal — PT. BARAK IOMS
 * Cross-Department Escalation Workflow: Operations -> HRD / Legal / Director
 * Source of Truth: PRD Section 13 & Section 18.
 */

import React, { useState } from 'react';
import { AlertTriangle, Send, X, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function IncidentEscalateModal({ isOpen, onClose, incident, onEscalate }) {
  const [targetDept, setTargetDept] = useState('LEGAL');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !incident) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan eskalasi wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onEscalate(incident.id, { targetDept, reason });
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal melakukan eskalasi insiden.');
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
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Eskalasi Lintas Departemen</h3>
              <p className="text-xs text-muted">Eskalasi insiden lapangan ke divisi terkait</p>
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
            <p className="font-semibold text-ink">{incident.incidentNumber} — {incident.title}</p>
            <p className="text-muted">Klien: <span className="text-ink font-medium">{incident.clientName}</span> ({incident.locationName})</p>
            <p className="text-muted">Tingkat Keparahan: <span className="font-bold text-primary-red">{incident.severity}</span></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Departemen Tujuan Eskalasi <span className="text-primary-red">*</span>
            </label>
            <select
              value={targetDept}
              onChange={(e) => setTargetDept(e.target.value)}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
            >
              <option value="LEGAL">Divisi Legal (Tindak Pidana, Kerusakan, Koordinasi Aparat Polsek)</option>
              <option value="HRD">Divisi HRD (Pelanggaran Disiplin Personel, Surat Peringatan SP)</option>
              <option value="DIRECTOR">Direksi / Direktur Utama (Insiden Kritis Kerugian Besar)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Alasan & Dasar Eskalasi <span className="text-primary-red">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan secara rinci mengapa insiden ini memerlukan tindakan lanjutan dari departemen tujuan..."
              className="w-full text-sm border border-border rounded-lg p-3 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
            />
            <p className="text-[11px] text-muted mt-1">
              Tindakan eskalasi ini akan tercatat permanen di Audit Trail sistem.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5">
              <Send className="h-4 w-4" />
              <span>Kirim Eskalasi</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
