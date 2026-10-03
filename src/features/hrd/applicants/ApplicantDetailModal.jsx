/**
 * Applicant Detail Modal — PT. BARAK IOMS
 * Displays complete data submitted from Landing Page (Formulir Lamaran Kerja).
 */

import React from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ApplicantDetailModal({
  applicant,
  isOpen,
  onClose,
  onAccept,
  onReject,
  onRestore,
}) {
  if (!isOpen || !applicant) return null;

  const isMasuk = applicant.status === 'MASUK';
  const isDiterima = applicant.status === 'DITERIMA';
  const isDitolak = applicant.status === 'DITOLAK';

  const getStatusBadge = () => {
    if (isDiterima) {
      return (
        <Badge variant="success" className="gap-1 px-2.5 py-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> Diterima (Resmi Karyawan)
        </Badge>
      );
    }
    if (isDitolak) {
      return (
        <Badge variant="danger" className="gap-1 px-2.5 py-1">
          <XCircle className="h-3.5 w-3.5" /> Ditolak (Arsip)
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className="gap-1 px-2.5 py-1">
        <Clock className="h-3.5 w-3.5" /> Menunggu Review (Masuk)
      </Badge>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted font-bold">{applicant.id}</span>
              {getStatusBadge()}
            </div>
            <h2 className="text-lg font-bold text-ink mt-1">{applicant.namaLengkap}</h2>
            <p className="text-xs text-muted">
              Melamar pada {applicant.tanggalLamar || '-'} via Formulir Lamaran Kerja Website
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* Status Banners */}
          {isDiterima && (
            <div className="p-3.5 rounded-xl bg-accent-green/10 border border-accent-green/30 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-accent-green flex-none mt-0.5" />
              <div>
                <p className="font-bold text-ink text-sm">Pelamar Telah Diterima</p>
                <p className="text-muted mt-0.5">
                  Data pelamar ini telah resmi dimasukkan ke dalam <strong className="text-ink">Master Data Terpadu</strong> dengan ID Karyawan:{' '}
                  <span className="font-mono font-bold text-accent-green">{applicant.employeeId || 'BRK-EMP-xxx'}</span>.
                </p>
              </div>
            </div>
          )}

          {isDitolak && (
            <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-error flex-none mt-0.5" />
                <div>
                  <p className="font-bold text-ink text-sm">Data Arsip Pelamar Ditolak</p>
                  <p className="text-muted mt-0.5">
                    <strong>Alasan / Catatan Penolakan:</strong> {applicant.catatanPenolakan || 'Kualifikasi belum sesuai kebutuhan operasional.'}
                  </p>
                  {applicant.rejectedAt && (
                    <p className="text-[11px] text-muted mt-1">
                      Diarsipkan pada: {new Date(applicant.rejectedAt).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
              {onRestore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRestore(applicant)}
                  className="gap-1.5 flex-none text-ink bg-white hover:bg-canvas"
                  title="Kembalikan pelamar ini ke status Masuk / Review"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-primary-red" />
                  <span>Buka Kembali</span>
                </Button>
              )}
            </div>
          )}

          {/* Section 1: Formasi yang Dilamar */}
          <div>
            <h3 className="font-bold text-ink uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-primary-red" />
              Posisi & Layanan yang Dilamar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-canvas/60 rounded-xl border border-border">
              <div>
                <p className="text-muted">Departemen / Layanan</p>
                <p className="font-semibold text-ink text-sm mt-0.5">{applicant.departemen}</p>
              </div>
              <div>
                <p className="text-muted">Posisi Kerja Target</p>
                <p className="font-semibold text-ink text-sm mt-0.5">{applicant.posisi}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted">Catatan Pelamar / Pengalaman</p>
                <p className="font-medium text-ink mt-0.5 italic">
                  "{applicant.catatan || 'Tidak ada catatan tambahan.'}"
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Data Pribadi Sesuai eKTP */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border">
              <User className="w-4 h-4 text-primary-red" />
              <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                1. DATA PRIBADI SESUAI eKTP
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-canvas/40 rounded-lg border border-border sm:col-span-2">
                <p className="text-muted">Nama Lengkap (sesuai eKTP)</p>
                <p className="font-bold text-ink text-sm mt-0.5">{applicant.namaLengkap}</p>
              </div>
              <div className="p-3 bg-canvas/40 rounded-lg border border-border">
                <p className="text-muted">NIK (16 Digit eKTP)</p>
                <p className="font-mono font-bold text-ink text-sm mt-0.5">{applicant.nik}</p>
              </div>
              <div className="p-3 bg-canvas/40 rounded-lg border border-border">
                <p className="text-muted">Usia</p>
                <p className="font-semibold text-ink text-sm mt-0.5">{applicant.usia} Tahun</p>
              </div>
              <div className="p-3 bg-canvas/40 rounded-lg border border-border">
                <p className="text-muted">Tempat & Tanggal Lahir</p>
                <p className="font-medium text-ink mt-0.5">
                  {applicant.tempatLahir ? `${applicant.tempatLahir}, ` : ''}{applicant.tglLahir || '-'}
                </p>
              </div>
              <div className="p-3 bg-canvas/40 rounded-lg border border-border">
                <p className="text-muted">Nomor SIM</p>
                <p className="font-medium text-ink mt-0.5">{applicant.nomorSim || '-'}</p>
              </div>
              <div className="p-3 bg-canvas/40 rounded-lg border border-border sm:col-span-2">
                <p className="text-muted">Alamat Lengkap (sesuai eKTP)</p>
                <p className="font-medium text-ink mt-0.5 flex items-start gap-1.5">
                  <MapPin className="h-4 w-4 text-muted flex-none mt-0.5" />
                  <span>{applicant.alamatLengkap || '-'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Kontak & Komunikasi */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border">
              <Phone className="w-4 h-4 text-primary-red" />
              <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                2. KONTAK & KOMUNIKASI
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-canvas/40 rounded-lg border border-border">
                <p className="text-muted">Email Aktif</p>
                <p className="font-medium text-ink mt-0.5 flex items-center gap-1.5 truncate">
                  <Mail className="h-3.5 w-3.5 text-muted" />
                  <span>{applicant.email || '-'}</span>
                </p>
              </div>
              <div className="p-3 bg-canvas/40 rounded-lg border border-border">
                <p className="text-muted">Nomor HP / WhatsApp</p>
                <p className="font-medium text-ink mt-0.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-accent-green" />
                  <a
                    href={`https://wa.me/${(applicant.noHpWa || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-primary-red font-semibold"
                  >
                    {applicant.noHpWa || '-'}
                  </a>
                </p>
              </div>
              <div className="p-3 bg-canvas/40 rounded-lg border border-border">
                <p className="text-muted">Nomor HP Darurat</p>
                <p className="font-medium text-ink mt-0.5 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-error" />
                  <span>{applicant.noHpDarurat || '-'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Informasi Rekening Bank BCA */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border">
              <CreditCard className="w-4 h-4 text-primary-red" />
              <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                3. INFORMASI REKENING BANK BCA
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-canvas/60 rounded-xl border border-border">
              <div>
                <p className="text-muted">Nomor Rekening BCA</p>
                <p className="font-mono font-bold text-ink text-sm mt-0.5">
                  {applicant.nomorRekening || '-'}
                </p>
              </div>
              <div>
                <p className="text-muted">Nama Pemilik Rekening</p>
                <p className="font-semibold text-ink text-sm mt-0.5">
                  {applicant.namaPemilikRekening || applicant.namaLengkap}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Berkas Dokumen Lamaran */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border">
              <FileText className="w-4 h-4 text-primary-red" />
              <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                4. BERKAS DOKUMEN LAMARAN
              </h3>
            </div>
            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-amber-950 flex items-start gap-3.5 shadow-xs" style={{ color: '#451a03' }}>
              <div className="w-10 h-10 rounded-xl bg-amber-200/80 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800 mt-0.5">
                <AlertCircle className="w-5 h-5 text-amber-800" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm leading-relaxed" style={{ color: '#451a03' }}>
                <p className="font-bold text-amber-900 text-sm sm:text-base">
                  Catatan :
                </p>
                <p className="text-amber-950">
                  silahkan kirim file berisi : <strong>(CV, eKTP, SIM, KK, Ijazah Terakhir, Foto Selfie)</strong> dalam bentuk file <strong>Foto/PDF</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border bg-canvas/40 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Tutup
          </Button>

          {isMasuk && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(applicant)}
                className="gap-1.5 text-error border-error/30 hover:bg-error/10 hover:border-error"
              >
                <XCircle className="h-4 w-4" />
                <span>Tolak & Arsipkan</span>
              </Button>
              <Button
                size="sm"
                onClick={() => onAccept(applicant)}
                className="gap-1.5 bg-accent-green hover:bg-accent-green/90 text-white font-semibold"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Terima Jadi Karyawan</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
