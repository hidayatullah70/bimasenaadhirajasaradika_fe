/**
 * Contract Detail Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1 & 12.1.
 *
 * Detailed view of employee contract, terms, and document compliance checklist.
 */

import React from 'react';
import {
  X, FileText, CheckCircle2, Clock, Calendar,
  User, Building2, Briefcase, FileCheck2, Paperclip, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ContractDetailModal({
  isOpen,
  contract,
  onClose,
  onEdit,
  onExtend,
  onDelete,
}) {
  if (!isOpen || !contract) return null;

  const isExpiring = contract.status === 'EXPIRING_SOON';
  const isPermanent = contract.contractType === 'PKWTT';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-red/10 text-primary-red flex items-center justify-center flex-none">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-ink">{contract.employeeName}</h2>
                <Badge variant={isPermanent ? 'success' : isExpiring ? 'warning' : 'info'}>
                  {contract.contractType}
                </Badge>
              </div>
              <p className="text-xs text-muted font-mono mt-0.5">
                {contract.contractNumber} • NIK: {contract.employeeNik || '-'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* Status Alert if Pending Delete */}
          {contract.pendingDelete && (
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 flex items-center gap-2.5 text-warning-text">
              <AlertTriangle className="h-4 w-4 text-warning flex-none" />
              <div>
                <p className="font-bold">Permohonan Penghapusan Menunggu Persetujuan Direktur Utama</p>
                <p className="text-[11px] text-muted">
                  Alasan pengajuan: <em>"{contract.deleteReason || 'Tidak ada catatan'}"</em>
                </p>
              </div>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-canvas border border-border">
              <span className="text-[10px] text-muted uppercase font-semibold">Jabatan & Bagian</span>
              <p className="font-semibold text-ink text-xs mt-0.5 truncate">{contract.position || '-'}</p>
              <p className="text-[11px] text-muted truncate">{contract.department || '-'}</p>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-border">
              <span className="text-[10px] text-muted uppercase font-semibold">Penempatan Klien</span>
              <p className="font-semibold text-ink text-xs mt-0.5 truncate">{contract.clientName || 'Head Office'}</p>
              <p className="text-[11px] text-muted font-mono">{contract.employeeId}</p>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-border col-span-2 sm:col-span-1">
              <span className="text-[10px] text-muted uppercase font-semibold">Masa Berlaku</span>
              <p className="font-semibold text-ink text-xs mt-0.5">
                {isPermanent ? (
                  <span className="text-success font-bold">Permanen (Tetap)</span>
                ) : isExpiring ? (
                  <span className="text-danger font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {contract.daysRemaining} Hari Lagi
                  </span>
                ) : (
                  <span>{contract.daysRemaining} Hari</span>
                )}
              </p>
              <p className="text-[10px] text-muted font-mono">
                {contract.startDate} s/d {isPermanent ? 'Selamanya' : contract.endDate}
              </p>
            </div>
          </div>

          {/* Document Completeness Progress */}
          <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary-red" />
                <span className="font-bold text-ink">Kelengkapan Berkas & Kepatuhan Legalitas</span>
              </div>
              <span className="font-bold text-ink">{contract.documentCompleteness || 100}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  (contract.documentCompleteness || 100) === 100
                    ? 'bg-success'
                    : (contract.documentCompleteness || 100) >= 75
                    ? 'bg-info'
                    : 'bg-warning'
                }`}
                style={{ width: `${contract.documentCompleteness || 100}%` }}
              />
            </div>
          </div>

          {/* Checklist Documents Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-ink text-xs flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary-red" />
              <span>Daftar Berkas Terlampir ({contract.documents?.length || 0})</span>
            </h3>

            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-white">
              {(contract.documents || []).map((doc, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between gap-2 hover:bg-canvas/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`h-4 w-4 flex-none ${
                        doc.status === 'VERIFIED'
                          ? 'text-success'
                          : doc.status === 'RENEWAL_NEEDED'
                          ? 'text-danger'
                          : 'text-muted'
                      }`}
                    />
                    <span className="font-medium text-ink">{doc.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        doc.status === 'VERIFIED'
                          ? 'bg-success/10 text-success'
                          : doc.status === 'RENEWAL_NEEDED'
                          ? 'bg-danger/10 text-danger'
                          : 'bg-muted/10 text-muted'
                      }`}
                    >
                      {doc.status === 'VERIFIED' ? 'Terverifikasi' : doc.status === 'RENEWAL_NEEDED' ? 'Perlu Diperbarui' : 'Belum Ada'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes or Attachments */}
          {contract.notes && (
            <div className="p-3 rounded-xl bg-canvas border border-border">
              <span className="text-[10px] text-muted uppercase font-semibold">Catatan Khusus / Klausul</span>
              <p className="text-ink mt-0.5 text-xs">{contract.notes}</p>
            </div>
          )}

          {contract.fileName && (
            <div className="p-3 rounded-xl bg-canvas border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary-red" />
                <span className="font-medium text-ink truncate">{contract.fileName}</span>
              </div>
              <span className="text-[10px] text-muted">Salinan PDF Terlampir</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-2 bg-canvas/30">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs"
          >
            Tutup
          </Button>

          <div className="flex items-center gap-2">
            {!contract.pendingDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onDelete(contract);
                }}
                className="text-xs text-danger hover:bg-danger/5 border-danger/20"
              >
                Hapus
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                onExtend(contract);
              }}
              className="text-xs text-ink hover:text-primary-red"
            >
              Perpanjang
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onClose();
                onEdit(contract);
              }}
              className="text-xs bg-primary-red hover:bg-primary-red/90 text-white font-semibold"
            >
              Edit Kontrak
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
