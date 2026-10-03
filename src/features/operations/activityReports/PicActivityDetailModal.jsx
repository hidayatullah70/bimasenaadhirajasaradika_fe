/**
 * PIC Activity Report Detail Modal — PT. BARAK IOMS
 * Displays complete field report details with full 16:9 photo preview and verification action.
 */

import React, { useState } from 'react';
import {
  ClipboardCheck, X, MapPin, Building2, Calendar, Clock,
  UserCheck, ShieldCheck, CheckCircle2, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import picActivityReportAdapter from '@/services/adapters/picActivityReportAdapter';
import toast from 'react-hot-toast';

export default function PicActivityDetailModal({ isOpen, onClose, report, canVerify, onVerified }) {
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen || !report) return null;

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await picActivityReportAdapter.verifyReport(report.id);
      if (res.data) {
        toast.success(`Laporan ${report.id} berhasil diverifikasi.`);
        if (onVerified) onVerified(res.data);
        onClose();
      } else {
        toast.error(res.error?.message || 'Gagal memverifikasi laporan.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat memverifikasi.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadPhoto = () => {
    if (!report.fotoKunjungan) return;
    const a = document.createElement('a');
    a.href = report.fotoKunjungan;
    a.download = `Foto_Kunjungan_${report.picName}_${report.tanggalKunjungan}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-canvas/40 flex items-center justify-between flex-none">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-red/10 text-primary-red">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-ink">{report.id}</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    report.status === 'DIVERIFIKASI'
                      ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                      : 'bg-primary-yellow/20 text-amber-800 border border-primary-yellow/30'
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <p className="text-xs text-muted">
                Laporan Kunjungan {report.picName} • {report.tanggalKunjungan} {report.jamKunjungan}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* 16:9 Photo Display */}
          <div className="relative rounded-xl overflow-hidden border border-border bg-black aspect-video shadow-xs">
            <img
              src={report.fotoKunjungan}
              alt="Foto Kunjungan 16:9"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              <span>RASIO 16:9 HD</span>
            </div>
            <button
              onClick={handleDownloadPhoto}
              className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/70 hover:bg-black/90 text-white text-[11px] font-medium backdrop-blur-xs transition-colors"
              title="Unduh foto asli 16:9"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh Foto</span>
            </button>
          </div>

          {/* Meta Information Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-canvas/40 border border-border rounded-xl">
              <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Nama PIC</p>
              <p className="text-sm font-bold text-ink mt-0.5 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5 text-primary-red" />
                <span>{report.picName}</span>
              </p>
            </div>
            <div className="p-3 bg-canvas/40 border border-border rounded-xl">
              <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Tanggal & Jam</p>
              <p className="text-xs font-bold text-ink mt-0.5 flex items-center gap-1 font-mono">
                <Calendar className="h-3.5 w-3.5 text-muted" />
                <span>{report.tanggalKunjungan} {report.jamKunjungan}</span>
              </p>
            </div>
            <div className="p-3 bg-canvas/40 border border-border rounded-xl sm:col-span-2">
              <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Nama Lokasi / Site</p>
              <p className="text-xs font-bold text-ink mt-0.5 truncate flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary-red flex-none" />
                <span className="truncate">{report.namaLokasi}</span>
              </p>
            </div>
          </div>

          {/* Region */}
          <div className="p-3 bg-canvas/40 border border-border rounded-xl flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary-red flex-none" />
            <div>
              <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Wilayah / Area Kunjungan</p>
              <p className="text-xs font-semibold text-ink mt-0.5">{report.lokasiKunjungan}</p>
            </div>
          </div>

          {/* Activity Description */}
          <div className="p-4 bg-canvas/30 border border-border rounded-xl space-y-1.5">
            <h4 className="font-bold text-ink text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardCheck className="h-4 w-4 text-primary-red" />
              <span>Uraian Kegiatan Kunjungan Lapangan</span>
            </h4>
            <p className="text-xs text-ink leading-relaxed whitespace-pre-line">
              {report.isiKegiatan}
            </p>
          </div>

          {/* Verification Status Banner if verified */}
          {report.status === 'DIVERIFIKASI' && (
            <div className="p-3 rounded-xl bg-accent-green/10 border border-accent-green/30 flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-accent-green flex-none" />
              <div>
                <p className="font-bold text-ink text-xs">Laporan Telah Diverifikasi Operasional</p>
                <p className="text-[11px] text-muted">
                  Diverifikasi oleh: {report.verifiedBy} pada{' '}
                  {report.verifiedAt ? new Date(report.verifiedAt).toLocaleString('id-ID') : '-'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-canvas/40 flex items-center justify-between flex-none">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>

          {canVerify && report.status !== 'DIVERIFIKASI' && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleVerify}
              disabled={isVerifying}
              className="gap-1.5 bg-accent-green hover:bg-green-700"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Verifikasi Laporan PIC</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
