/**
 * Employee Detail Drawer — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1 (Complete Employee Master profile).
 * Features: Sensitive data masking, document completeness checklist, assignment history.
 */

import React, { useState, useEffect } from 'react';
import {
  X, Shield, Eye, EyeOff, User, Phone, Mail, MapPin, Building,
  CreditCard, FileCheck, Calendar, History, Briefcase, CheckCircle2, Clock
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { PERMISSIONS } from '@/constants/permissions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import placementRepository from '@/data/repositories/placementRepository';

export default function EmployeeDetailDrawer({ employee, isOpen, onClose, onEdit }) {
  const { hasPermission } = useAuth();
  const canViewSensitive = hasPermission(PERMISSIONS.EMPLOYEE_VIEW_SENSITIVE);
  const [showSensitive, setShowSensitive] = useState(false);
  const [placements, setPlacements] = useState([]);
  const [loadingPlacements, setLoadingPlacements] = useState(false);

  useEffect(() => {
    if (!employee || !isOpen) return;
    const empId = employee.id || employee.id_karyawan;
    let active = true;
    async function loadPlacementHistory() {
      setLoadingPlacements(true);
      try {
        const res = await placementRepository.getHistoryByEmployeeId(empId);
        if (active && res.data) {
          setPlacements(res.data);
        }
      } catch (err) {
        console.warn('Failed to load placement history:', err);
      } finally {
        if (active) setLoadingPlacements(false);
      }
    }
    loadPlacementHistory();
    return () => {
      active = false;
    };
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  const mask = (val) => {
    if (!val) return '-';
    if (showSensitive && canViewSensitive) return val;
    return val.slice(0, 4) + '*'.repeat(Math.max(4, val.length - 4));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slide-left">
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-canvas/50">
          <div className="flex items-center gap-3">
            <div className="h-14 w-11 rounded-lg overflow-hidden bg-primary-red/10 border-2 border-primary-red/20 flex items-center justify-center text-primary-red font-bold text-lg flex-none shadow-xs">
              {employee.foto_3x4 ? (
                <img
                  src={employee.foto_3x4}
                  alt={employee.nama_lengkap_sesuai_KTP}
                  className="w-full h-full object-cover"
                />
              ) : (
                employee.nama_lengkap_sesuai_KTP ? employee.nama_lengkap_sesuai_KTP.charAt(0) : 'E'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-ink">{employee.nama_lengkap_sesuai_KTP}</h2>
                <Badge variant={employee.status_kerja === 'TETAP' ? 'success' : 'info'}>
                  {employee.status_kerja}
                </Badge>
              </div>
              <p className="text-xs text-muted font-mono">{employee.id_karyawan} • {employee.jenis_pekerjaan} ({employee.jabatan})</p>
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

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Sensitive Data Controls */}
          {canViewSensitive && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-info/5 border border-info/20 text-xs">
              <span className="flex items-center gap-1.5 text-info font-medium">
                <Shield className="h-4 w-4" />
                Data Sensitif Dilindungi Hak Akses HRD / Direksi
              </span>
              <button
                type="button"
                onClick={() => setShowSensitive(!showSensitive)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-info/30 text-info hover:bg-info/10 font-medium transition-colors"
              >
                {showSensitive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showSensitive ? 'Samarkan Data' : 'Buka Masking'}</span>
              </button>
            </div>
          )}

          {/* Section 1: Identitas & Biodata KTP */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary-red" />
              Identitas KTP & Kontak
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">NIK (Nomor Induk Kependudukan)</p>
                <p className="font-mono font-semibold text-ink text-sm mt-0.5">{mask(employee.NIK)}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">Jenis Kelamin</p>
                <p className="font-medium text-ink mt-0.5">{employee.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">Tempat & Tanggal Lahir</p>
                <p className="font-medium text-ink mt-0.5">{employee.tempat_lahir}, {employee.tanggal_lahir}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">No. Handphone / WhatsApp</p>
                <p className="font-medium text-ink mt-0.5 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted" />
                  {employee.nomor_telepon}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border sm:col-span-2">
                <p className="text-muted">Email</p>
                <p className="font-medium text-ink mt-0.5 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-muted" />
                  {employee.email}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border sm:col-span-2">
                <p className="text-muted">Alamat KTP</p>
                <p className="font-medium text-ink mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted flex-none" />
                  {employee.alamat_sesuai_KTP}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Penempatan & Operasional */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <Building className="h-4 w-4 text-primary-red" />
              Status Kerja & Penempatan Personel
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">Klien Penugasan</p>
                <p className="font-semibold text-ink text-sm mt-0.5">{employee.clientName || 'Standby Kantor Pusat'}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">Lokasi Penempatan</p>
                <p className="font-medium text-ink mt-0.5">{employee.locationName || 'Kantor Pusat BARAK'}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">Layanan / Divisi</p>
                <p className="font-medium text-ink mt-0.5">{employee.jenis_layanan} ({employee.departemen})</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">Posisi Kerja</p>
                <p className="font-semibold text-ink mt-0.5">{employee.jabatan || 'Staff'}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">Tanggal Bergabung</p>
                <p className="font-medium text-ink mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted" />
                  {employee.tanggal_masuk}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">Sertifikasi & Lisensi</p>
                <p className="font-semibold text-primary-red mt-0.5">{employee.sertifikasi || 'Gada Pratama'}</p>
              </div>
            </div>

            {/* Riwayat Penempatan & Rotasi (Requirement 4) */}
            <div className="mt-3 p-3 rounded-lg bg-canvas border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-muted" />
                  Riwayat Penempatan & Rotasi ({placements.length})
                </span>
                <span className="text-[10px] text-muted font-mono">Authoritative Placement</span>
              </div>

              {loadingPlacements ? (
                <p className="text-[11px] text-muted italic">Memuat riwayat penempatan...</p>
              ) : placements.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {placements.map((plc) => (
                    <div key={plc.id} className="py-2 first:pt-1 last:pb-0 flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-ink">{plc.clientName || 'Klien'}</span>
                          <span className="text-[10px] text-muted">• {plc.locationName || plc.siteName || '-'}</span>
                        </div>
                        <p className="text-[11px] text-muted font-mono mt-0.5">
                          {plc.shiftName || 'Shift'} • {plc.roleInUnit || plc.position || 'Staff'} • {plc.startDate} s/d {plc.endDate || 'Sekarang'}
                        </p>
                      </div>
                      <Badge
                        variant={plc.status === 'ACTIVE' ? 'success' : plc.status === 'ROTATED' ? 'warning' : 'outline'}
                        className="text-[10px] py-0 px-1.5"
                      >
                        {plc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted">Belum ada catatan rotasi penempatan (Personel Standby / Cadangan).</p>
              )}
            </div>
          </div>

          {/* Section 3: Data Keuangan & BPJS */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-primary-red" />
              Rekening Penggajian & Jaminan Sosial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">Bank Rekening</p>
                <p className="font-medium text-ink mt-0.5">{employee.nama_bank}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">Nomor Rekening</p>
                <p className="font-mono font-semibold text-ink mt-0.5">{mask(employee.nomor_rekening_bank)}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">NPWP</p>
                <p className="font-mono text-ink mt-0.5">{mask(employee.NPWP)}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">Status Pajak (PTKP)</p>
                <p className="font-semibold text-ink mt-0.5">{employee.status_pajak || 'TK0'}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">BPJS Kesehatan</p>
                <p className="font-mono text-ink mt-0.5">{mask(employee.BPJS_kesehatan)}</p>
              </div>
              <div className="p-3 rounded-lg bg-canvas border border-border">
                <p className="text-muted">BPJS Ketenagakerjaan</p>
                <p className="font-mono text-ink mt-0.5">{mask(employee.BPJS_ketenagakerjaan)}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Berkas & Dokumen Persyaratan */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-primary-red" />
              Kelengkapan Berkas Administrasi
            </h3>
            <div className="p-4 rounded-lg bg-canvas border border-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink">Status Kelengkapan</span>
                <span className="font-bold text-success">
                  {employee.kelengkapan_dokumen?.percentage ?? 100}% Lengkap
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div
                  className="bg-success h-2 rounded-full transition-all"
                  style={{ width: `${employee.kelengkapan_dokumen?.percentage ?? 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-muted">
                {['KTP Valid', 'Kartu Keluarga', 'SKCK Aktif', 'Ijazah Terakhir', 'Surat Dokter', 'Sertifikat Kompetensi'].map((item) => (
                  <span key={item} className="flex items-center gap-1 text-ink font-medium">
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Kontak Darurat */}
          {employee.kontak_darurat && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
              <p className="font-semibold text-amber-900">Kontak Darurat (Emergency Contact):</p>
              <p className="text-amber-800 mt-1">
                {employee.kontak_darurat.nama} ({employee.kontak_darurat.relasi}) —{' '}
                <span className="font-mono font-bold">{employee.kontak_darurat.nomor}</span>
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border bg-canvas/30 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
          {onEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
            >
              Ubah Data Karyawan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
