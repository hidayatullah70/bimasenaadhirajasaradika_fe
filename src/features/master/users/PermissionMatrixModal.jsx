/**
 * Permission Matrix Modal — PT. BARAK IOMS
 * Visual interactive representation of RBAC authorization matrix across all roles.
 * Source of Truth: docs/PERMISSION-MATRIX.md
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Check, Minus, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROLE_LABELS, ROLES } from '@/constants/roles';

const MATRIX_DATA = [
  {
    module: 'Executive Dashboard & KPI',
    access: {
      [ROLES.DIREKTUR]: 'RW',
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
      [ROLES.DIREKTUR]: 'RW',
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
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: '-',
      [ROLES.HRD]: '-',
      [ROLES.OPERASIONAL]: '-',
      [ROLES.FINANCE]: '-',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: 'R',
      [ROLES.ADMIN_WEBSITE]: 'RW',
    },
  },
  {
    module: 'Tenaga Kerja (Employees)',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: 'R',
      [ROLES.HRD]: 'RW',
      [ROLES.OPERASIONAL]: 'RW',
      [ROLES.FINANCE]: 'R',
      [ROLES.MARKETING]: 'R',
      [ROLES.IT_SUPPORT]: 'R',
      [ROLES.ADMIN_WEBSITE]: 'R',
    },
  },
  {
    module: 'Kehadiran Biometrik (Attendance)',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: 'R',
      [ROLES.HRD]: 'RW',
      [ROLES.OPERASIONAL]: 'RW',
      [ROLES.FINANCE]: 'R',
      [ROLES.MARKETING]: 'R',
      [ROLES.IT_SUPPORT]: 'R',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Penempatan & Pos Site (Placements)',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: 'R',
      [ROLES.HRD]: 'RW',
      [ROLES.OPERASIONAL]: 'RW',
      [ROLES.FINANCE]: 'R',
      [ROLES.MARKETING]: 'R',
      [ROLES.IT_SUPPORT]: 'R',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Insiden Lapangan & Relief Guard',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: 'R',
      [ROLES.HRD]: 'R',
      [ROLES.OPERASIONAL]: 'RW',
      [ROLES.FINANCE]: '-',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Faktur & Piutang (Invoices)',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: 'R',
      [ROLES.HRD]: '-',
      [ROLES.OPERASIONAL]: '-',
      [ROLES.FINANCE]: 'RW',
      [ROLES.MARKETING]: 'R',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Payroll Ketenagakerjaan',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: 'R',
      [ROLES.HRD]: 'R',
      [ROLES.OPERASIONAL]: '-',
      [ROLES.FINANCE]: 'RW',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Rekonsiliasi Kas COD Kurir',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: 'RW',
      [ROLES.HRD]: '-',
      [ROLES.OPERASIONAL]: 'R',
      [ROLES.FINANCE]: 'RW',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Kasus Hukum & Kontrak Mitra',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: 'RW',
      [ROLES.HRD]: 'R',
      [ROLES.OPERASIONAL]: '-',
      [ROLES.FINANCE]: 'R',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Prospek & CRM Pipeline (Leads)',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: '-',
      [ROLES.HRD]: '-',
      [ROLES.OPERASIONAL]: '-',
      [ROLES.FINANCE]: '-',
      [ROLES.MARKETING]: 'RW',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'Aset IT & Tiket Helpdesk',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: '-',
      [ROLES.HRD]: '-',
      [ROLES.OPERASIONAL]: '-',
      [ROLES.FINANCE]: '-',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: 'RW',
      [ROLES.ADMIN_WEBSITE]: '-',
    },
  },
  {
    module: 'CMS Website & SEO Management',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: '-',
      [ROLES.HRD]: '-',
      [ROLES.OPERASIONAL]: '-',
      [ROLES.FINANCE]: '-',
      [ROLES.MARKETING]: '-',
      [ROLES.IT_SUPPORT]: '-',
      [ROLES.ADMIN_WEBSITE]: 'RW',
    },
  },
  {
    module: 'Audit Activity Feed',
    access: {
      [ROLES.DIREKTUR]: 'RW',
      [ROLES.LEGAL]: 'R',
      [ROLES.HRD]: 'R',
      [ROLES.OPERASIONAL]: 'R',
      [ROLES.FINANCE]: 'R',
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

  const renderBadge = (val) => {
    if (val === 'RW') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-accent-green/15 text-accent-green border border-accent-green/30">
          R/W
        </span>
      );
    }
    if (val === 'R') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-info/10 text-info border border-info/20">
          R
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-muted/40 font-mono text-xs">
        <Minus className="h-3 w-3" />
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40 flex-none">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary-red/10 text-primary-red flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink">
                3. Matriks Otorisasi & Hak Akses (Permission Matrix)
              </h2>
              <p className="text-xs text-muted">
                Standar matriks RBAC PT. BARAK IOMS untuk 8 peran pengguna dan 15 modul sumber daya.
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

        {/* Legend & Filter Controls */}
        <div className="px-5 py-3 bg-canvas/50 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs flex-none">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-green/15 text-accent-green border border-accent-green/30">
                R/W
              </span>
              <span className="text-slate font-medium">Baca & Tulis (Mutasi)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-info/10 text-info border border-info/20">
                R
              </span>
              <span className="text-slate font-medium">Baca Saja (Read-Only)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-muted/60 text-xs">-</span>
              <span className="text-muted">Tidak Memiliki Akses (Forbidden)</span>
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
                        className={`px-3 py-3 text-center ${
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
        <div className="p-4 border-t border-border flex items-center justify-between bg-canvas/30 flex-none text-xs">
          <p className="text-muted">
            Keterangan: Otorisasi dikontrol ketat di sisi server (backend) dan diproteksi melalui komponen layout di sisi klien.
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
