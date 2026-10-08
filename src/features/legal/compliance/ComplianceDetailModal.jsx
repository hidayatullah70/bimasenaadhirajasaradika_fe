/**
 * Compliance Detail Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 12.3 (Compliance & SIO BUJP Register).
 *
 * Detailed view of compliance items with full metadata and direct actions (Edit, Delete).
 */

import React from 'react';
import { X, ShieldCheck, Building, Calendar, FileText, AlertTriangle, Edit2, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ComplianceDetailModal({ isOpen, item, onClose, onEdit, onDelete }) {
  if (!isOpen || !item) return null;

  const isPendingDelete = Boolean(item.pendingDelete);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-success/15 text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Patuh & Berlaku Sah
          </span>
        );
      case 'ATTENTION_NEEDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning/15 text-warning-dark">
            <Clock className="h-3.5 w-3.5" />
            Perlu Perhatian / Pembaruan
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-danger/15 text-danger">
            <AlertTriangle className="h-3.5 w-3.5" />
            Kadaluwarsa
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-surface text-muted">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-red/10 text-primary-red flex items-center justify-center flex-none">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary-red">{item.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface border border-border text-muted">
                  {item.category}
                </span>
              </div>
              <h2 className="text-base font-bold text-ink mt-0.5">{item.licenseName}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Pending Delete Banner */}
          {isPendingDelete && (
            <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/20 flex items-start gap-2.5 text-warning-dark">
              <AlertTriangle className="h-4 w-4 flex-none mt-0.5 text-warning" />
              <div>
                <p className="font-bold text-ink text-[11px]">Sedang Dalam Pengajuan Hapus ke Direktur Utama</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Alasan: &ldquo;{item.deleteReason || 'Menunggu verifikasi'}&rdquo; diajukan oleh{' '}
                  <strong>{item.deleteRequestedBy || 'Staff Legal'}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Status & Number Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-canvas border border-border">
            <div>
              <p className="text-[10px] text-muted font-medium">Nomor Surat / Sertifikat</p>
              <p className="font-mono font-bold text-ink text-sm tracking-wide">{item.licenseNumber}</p>
            </div>
            <div>{getStatusBadge(item.status)}</div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 rounded-xl bg-canvas border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-muted text-[10px]">
                <Building className="h-3 w-3" />
                <span>Instansi Penerbit</span>
              </div>
              <p className="font-semibold text-ink">{item.issuingAuthority}</p>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-muted text-[10px]">
                <Calendar className="h-3 w-3" />
                <span>Masa Berlaku</span>
              </div>
              <p className="font-semibold text-ink">
                {item.validFrom ? `${item.validFrom} s/d ` : ''}
                {item.validUntil || 'Berlaku Efektif'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-muted text-[10px]">
                <Clock className="h-3 w-3" />
                <span>Frekuensi Audit</span>
              </div>
              <p className="font-semibold text-ink">{item.auditFrequency || 'Tahunan'}</p>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-muted text-[10px]">
                <Calendar className="h-3 w-3" />
                <span>Tanggal Audit Terakhir</span>
              </div>
              <p className="font-semibold text-ink">{item.lastAuditDate || 'Belum Dijadwalkan'}</p>
            </div>
          </div>

          {/* Remarks */}
          <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted text-[10px]">
              <FileText className="h-3 w-3" />
              <span>Catatan Kepatuhan & Ruang Lingkup Legalitas</span>
            </div>
            <p className="text-ink leading-relaxed">
              {item.remarks || 'Tidak ada catatan tambahan untuk dokumen perizinan ini.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-canvas">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted"
          >
            Tutup
          </Button>

          <div className="flex items-center gap-2">
            {!isPendingDelete && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onDelete(item);
                }}
                className="text-xs text-danger hover:bg-danger/10 border-danger/30 gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Izin</span>
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="text-xs gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Dokumen</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
