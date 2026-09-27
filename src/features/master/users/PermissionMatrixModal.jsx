/**
 * Permission Matrix Modal — PT. BARAK IOMS
 * Visual interactive representation of Granular RBAC authorization matrix across all roles.
 * Source of Truth: docs/PRD.md (Section 6.9: Matrix Otorisasi & Hak Akses)
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Minus, Info, CheckCircle2, Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROLE_LABELS, ROLES } from '@/constants/roles';

const MATRIX_DATA = [
  {
    module: 'Executive Dashboard & KPI',
    access: {
      [ROLES.DIREKTUR]: 'C, R, U, E, X',
      [ROLES.LEGAL]: 'R',
      [ROLES.HRD]: 'R',
      [ROLES.OPERASIONAL]: 'R',
      [ROLES.FINANCE]: 'R',
      [ROLES.MARKETING]: 'R',
      [ROLES.IT_SUPPORT]: 'R',
      [ROLES.ADMIN_WEBSITE]: 'R',
    },
  },
  {
    module: 'Approval Center (Otoritas Direksi)',
    access: {
      [ROLES.DIREKTUR]: 'R, X (approval)',
      [ROLES.LEGAL]: '-',
      [ROLES.HRD]: '-',
      [ROLES.OPERASIONAL]: '-',
      [ROLES.FINANCE]: '-',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Manajemen Pengguna & Staf',
    access: {
      [ROLES.DIREKTUR]: 'C, R, U, D, X (full)',
      [ROLES.LEGAL]: '-',
      [ROLES.HRD]: '-',
      [ROLES.OPERASIONAL]: '-',
      [ROLES.FINANCE]: '-',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: 'R, U (reset pass)',
      [ROLES.ADMIN_WEBSITE]: 'C, R, U (registrasi)',
    },
  },
  {
    module: 'Tenaga Kerja (Employees)',
    access: {
      [ROLES.DIREKTUR]: 'R, E',
      [ROLES.LEGAL]: 'R, E',
      [ROLES.HRD]: 'C, R, U, D, E',
      [ROLES.OPERASIONAL]: 'R, U (pos/shift)',
      [ROLES.FINANCE]: 'R (bank BCA)',
      [ROLES.MARKETING]: 'R (kualifikasi)',
      [ROLES.IT_SUPPORT]: 'R (akun/email)',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Kehadiran Biometrik (Attendance)',
    access: {
      [ROLES.DIREKTUR]: 'R, E, X (reopen)',
      [ROLES.LEGAL]: 'R',
      [ROLES.HRD]: 'C, R, U, E, X (lock)',
      [ROLES.OPERASIONAL]: 'R, U (izin site)',
      [ROLES.FINANCE]: 'R, E',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: 'R (scanner)',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Penempatan & Pos Site (Placements)',
    access: {
      [ROLES.DIREKTUR]: 'R, E',
      [ROLES.LEGAL]: 'R',
      [ROLES.HRD]: 'R, U (admin/PKWT)',
      [ROLES.OPERASIONAL]: 'C, R, U, D, X (plotting)',
      [ROLES.FINANCE]: 'R (billing/site)',
      [ROLES.MARKETING]: 'R (kapasitas)',
      [ROLES.IT_SUPPORT]: 'R (geo-tag)',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Insiden Lapangan & Relief Guard',
    access: {
      [ROLES.DIREKTUR]: 'R, X (high risk)',
      [ROLES.LEGAL]: 'R, U, X (BAP)',
      [ROLES.HRD]: 'R, U (SP staf)',
      [ROLES.OPERASIONAL]: 'C, R, U, X (dispatch)',
      [ROLES.FINANCE]: 'R (lembur/klaim)',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Faktur & Piutang (Invoices)',
    access: {
      [ROLES.DIREKTUR]: 'R, E, X (write-off)',
      [ROLES.LEGAL]: 'R, X (somasi)',
      [ROLES.HRD]: '-',
      [ROLES.OPERASIONAL]: 'R (hari kerja)',
      [ROLES.FINANCE]: 'C, R, U, D, E, X (tagih)',
      [ROLES.MARKETING]: 'R (status bayar)',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Payroll Ketenagakerjaan',
    access: {
      [ROLES.DIREKTUR]: 'R, E, X (approve)',
      [ROLES.LEGAL]: 'R (UMK rule)',
      [ROLES.HRD]: 'R, U, E (pre-check)',
      [ROLES.OPERASIONAL]: '-',
      [ROLES.FINANCE]: 'C, R, U, E, X (submit)',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Rekonsiliasi Kas COD Kurir',
    access: {
      [ROLES.DIREKTUR]: 'R, E, X (write-off)',
      [ROLES.LEGAL]: 'R, U, X (litigasi)',
      [ROLES.HRD]: 'R (evaluasi)',
      [ROLES.OPERASIONAL]: 'R, U (verif fisik)',
      [ROLES.FINANCE]: 'C, R, U, E, X (reconcile)',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Kasus Hukum & Kontrak Mitra (PKS)',
    access: {
      [ROLES.DIREKTUR]: 'R, E, X (sign/tutup)',
      [ROLES.LEGAL]: 'C, R, U, D, E, X',
      [ROLES.HRD]: 'R (ketenagakerjaan)',
      [ROLES.OPERASIONAL]: 'R (lingkup SOP)',
      [ROLES.FINANCE]: 'R (termin bayar)',
      [ROLES.MARKETING]: 'R, U (draft tender)',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Prospek & CRM Pipeline (Leads)',
    access: {
      [ROLES.DIREKTUR]: 'R, E, X (strategic)',
      [ROLES.LEGAL]: '-',
      [ROLES.HRD]: '-',
      [ROLES.OPERASIONAL]: 'R (feasibility)',
      [ROLES.FINANCE]: 'R (prakiraan)',
      [ROLES.MARKETING]: 'C, R, U, D, E, X',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: 'R, C (web lead)',
    },
  },
  {
    module: 'Aset IT & Tiket Helpdesk',
    access: {
      [ROLES.DIREKTUR]: 'R, E',
      [ROLES.LEGAL]: '-',
      [ROLES.HRD]: 'R (inventaris staf)',
      [ROLES.OPERASIONAL]: 'R (gadget/HT)',
      [ROLES.FINANCE]: 'R (depresiasi)',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: 'C, R, U, D, E, X',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'CMS Website & SEO Management',
    access: {
      [ROLES.DIREKTUR]: 'R',
      [ROLES.LEGAL]: '-',
      [ROLES.HRD]: 'R (info karir)',
      [ROLES.OPERASIONAL]: '-',
      [ROLES.FINANCE]: '-',
      [ROLES.MARKETING]: 'R, U (konten promo)',
      [ROLES.IT_SUPPORT]: 'R (DNS/infra)',
      [ROLES.ADMIN_WEBSITE]: 'C, R, U, D, E, X',
    },
  },
  {
    module: 'Audit Activity Feed',
    access: {
      [ROLES.DIREKTUR]: 'R, E, X (forensik)',
      [ROLES.LEGAL]: 'R, E',
      [ROLES.HRD]: 'R',
      [ROLES.OPERASIONAL]: 'R',
      [ROLES.FINANCE]: 'R, E',
      [ROLES.MARKETING]: 'R',
      [ROLES.IT_SUPPORT]: 'R',
      [ROLES.ADMIN_WEBSITE]: 'R',
    },
  },
];

const ROLES_ORDER = [
  ROLES.DIREKTUR,
  ROLES.LEGAL,
  ROLES.HRD,
  ROLES.OPERASIONAL,
  ROLES.FINANCE,
  ROLES.MARKETING,
  ROLES.IT_SUPPORT,
  ROLES.ADMIN_WEBSITE,
];

export default function PermissionMatrixModal({ isOpen, onClose }) {
  const [highlightRole, setHighlightRole] = useState(null);

  if (!isOpen) return null;

  const renderBadge = (rawVal) => {
    if (!rawVal || rawVal === '-') {
      return (
        <span className="inline-flex items-center text-muted/30 font-mono text-xs">
          <Minus className="h-3 w-3" />
        </span>
      );
    }

    // Split actions and scope note (e.g., "R, E, X (reopen)")
    const match = rawVal.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    const actions = match ? match[1].trim() : rawVal;
    const note = match && match[2] ? match[2].trim() : null;

    const hasWorkflow = actions.includes('X');
    const hasCreateOrDelete = actions.includes('C') || actions.includes('D');
    const hasUpdate = actions.includes('U');

    let badgeClass = 'bg-info/10 text-info border-info/20'; // Read-only default

    if (hasWorkflow) {
      badgeClass = 'bg-primary-red/10 text-primary-red border-primary-red/30 font-bold';
    } else if (hasCreateOrDelete) {
      badgeClass = 'bg-accent-green/15 text-accent-green border-accent-green/30 font-bold';
    } else if (hasUpdate) {
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-300 font-semibold';
    }

    return (
      <div className="flex flex-col items-center justify-center gap-0.5">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] tracking-tight border ${badgeClass}`}>
          {actions}
        </span>
        {note && (
          <span className="text-[9px] text-muted italic font-medium leading-none whitespace-nowrap">
            ({note})
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40 flex-none">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary-red/10 text-primary-red flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink">
                Matriks Otorisasi Granular & Hak Akses (Granular RBAC Matrix)
              </h2>
              <p className="text-xs text-muted">
                Standar tata kelola hak akses PT. BARAK IOMS — Mengatur 15 modul, 8 peran, prinsip pemisahan wewenang (Maker-Checker), dan hak otoritas tertinggi Direktur.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Governance Rules & Legend Controls */}
        <div className="px-5 py-3 bg-canvas/50 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs flex-none">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-red/10 text-primary-red border border-primary-red/30">
                X
              </span>
              <span className="text-slate font-medium">Tindakan Workflow (Approve/Lock/Reopen/Dispatch)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-green/15 text-accent-green border border-accent-green/30">
                C / D
              </span>
              <span className="text-slate font-medium">Create / Soft-Delete</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-300">
                U
              </span>
              <span className="text-slate font-medium">Update</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-info/10 text-info border border-info/20">
                R / E
              </span>
              <span className="text-slate font-medium">Read / Export</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-muted/60 text-xs">-</span>
              <span className="text-muted">Forbidden</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Info className="h-3.5 w-3.5" />
            <span>Sorot Kolom:</span>
            <select
              value={highlightRole || ''}
              onChange={(e) => setHighlightRole(e.target.value || null)}
              className="px-2 py-1 border border-border rounded-lg bg-white text-xs font-medium text-ink focus:outline-none"
            >
              <option value="">Semua Peran</option>
              {ROLES_ORDER.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-canvas sticky top-0 z-10 border-b border-border font-bold text-ink">
              <tr>
                <th className="px-4 py-3 min-w-[220px] bg-canvas">Modul & Sumber Daya</th>
                {ROLES_ORDER.map((r) => (
                  <th
                    key={r}
                    className={`px-3 py-3 text-center whitespace-nowrap ${
                      highlightRole === r ? 'bg-primary-red/10 text-primary-red' : 'bg-canvas'
                    }`}
                  >
                    {ROLE_LABELS[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MATRIX_DATA.map((row, idx) => (
                <tr key={row.module} className="hover:bg-canvas/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-ink">
                    <span className="text-muted font-normal mr-2">{idx + 1}.</span>
                    {row.module}
                  </td>
                  {ROLES_ORDER.map((r) => {
                    const val = row.access[r] || '-';
                    const isHigh = highlightRole === r;
                    return (
                      <td
                        key={r}
                        className={`px-2 py-2 text-center align-middle ${
                          isHigh ? 'bg-primary-red/5 font-semibold' : ''
                        }`}
                      >
                        {renderBadge(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-canvas/30 flex-none text-xs">
          <div className="flex items-center gap-2 text-muted">
            <Lock className="h-4 w-4 text-primary-red shrink-0" />
            <span>
              <strong>Prinsip Segregation of Duties</strong>: Pembuat draf transaksi tidak dapat menyetujui transaksi final. Otoritas tertinggi dan persetujuan eksekutif berada pada <strong>Direktur</strong>.
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="self-end sm:self-auto">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
