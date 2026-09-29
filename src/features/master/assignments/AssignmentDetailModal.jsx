/**
 * Placement / Assignment Detail Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.2, 13 / Requirement 9.
 */

import React from 'react';
import { X, UserCheck, MapPin, Building2, Clock, Calendar, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AssignmentDetailModal({ isOpen, assignment, onClose, onEdit, onTransfer }) {
  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary-red/10 text-primary-red flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-ink">Detail Penempatan Personel</h2>
                <Badge
                  variant={
                    assignment.status === 'ACTIVE'
                      ? 'success'
                      : assignment.status === 'ROTATED'
                      ? 'warning'
                      : 'outline'
                  }
                >
                  {assignment.status}
                </Badge>
              </div>
              <p className="text-xs text-muted font-mono">{assignment.id} • {assignment.assignmentCode || '-'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Employee Card */}
          <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Personel Bertugas</span>
            <p className="font-bold text-ink text-sm">{assignment.employeeName}</p>
            <p className="text-muted font-mono text-[11px]">
              NIK: {assignment.employeeNik || '-'} • ID: {assignment.employeeId || '-'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded bg-white border border-border text-[11px] font-medium text-slate">
                Jabatan: {assignment.roleInUnit || 'Anggota'}
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-border text-[11px] font-medium text-slate uppercase">
                Layanan: {assignment.serviceType || 'Security'}
              </span>
            </div>
          </div>

          {/* Placement Destination Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-border bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-[11px]">Klien Mitra</span>
              </div>
              <p className="font-bold text-ink">{assignment.clientName || '-'}</p>
              <p className="text-[11px] font-mono text-muted">ID: {assignment.clientId || '-'}</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-[11px]">Lokasi Penugasan (Site)</span>
              </div>
              <p className="font-bold text-ink">{assignment.locationName || '-'}</p>
              <p className="text-[11px] font-mono text-muted">ID: {assignment.locationId || '-'}</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-[11px]">Shift Kerja</span>
              </div>
              <p className="font-bold text-ink">{assignment.shiftName || 'Shift Standard'}</p>
              <p className="text-[11px] text-muted">Jadwal Operasional Pos</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-[11px]">Periode Penempatan</span>
              </div>
              <p className="font-bold text-ink">
                {assignment.startDate || '-'} s/d {assignment.endDate || 'Selesai'}
              </p>
              <p className="text-[11px] text-muted">Durasi Kontrak Unit</p>
            </div>
          </div>

          {/* Notes */}
          {assignment.notes && (
            <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Instruksi Khusus / Catatan</span>
              <p className="text-ink leading-relaxed">{assignment.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-canvas/30 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Tutup
          </Button>
          <div className="flex items-center gap-2">
            {onTransfer && assignment.status === 'ACTIVE' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onTransfer(assignment);
                }}
                className="text-xs"
              >
                Rotasi / Transfer
              </Button>
            )}
            {onEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(assignment);
                }}
                className="text-xs"
              >
                Ubah Penugasan
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
