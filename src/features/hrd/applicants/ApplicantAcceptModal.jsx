/**
 * Applicant Accept Modal — PT. BARAK IOMS
 * Confirms acceptance of applicant and transfers full profile into Master Data Terpadu.
 */

import React, { useState } from 'react';
import { X, CheckCircle2, UserCheck, Building2, MapPin, Calendar, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MOCK_CLIENTS, MOCK_LOCATIONS } from '@/services/mock/mockMasterData';

export default function ApplicantAcceptModal({
  applicant,
  isOpen,
  onClose,
  onConfirm,
  clients = [],
  locations = [],
}) {
  const allClients = clients && clients.length > 0 ? clients : MOCK_CLIENTS;
  const allLocations = locations && locations.length > 0 ? locations : MOCK_LOCATIONS;

  const [formData, setFormData] = useState({
    status_kerja: 'TETAP',
    penugasan_klien: allClients[0]?.id || '',
    lokasi_penugasan: allLocations[0]?.id || '',
    jabatan: applicant?.posisi || 'Staff',
    tanggal_masuk: new Date().toISOString().split('T')[0],
    jenis_kelamin: 'L',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !applicant) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(applicant.id, formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-accent-green/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green flex-none">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">Terima Pelamar Kerja</h2>
              <p className="text-xs text-muted">
                Data akan otomatis ditambahkan ke Master Data Terpadu (Karyawan)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-white/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Pelamar Preview Card */}
          <div className="p-3 bg-canvas rounded-lg border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink text-sm">{applicant.namaLengkap}</span>
              <span className="font-mono text-[11px] text-muted">{applicant.nik}</span>
            </div>
            <p className="text-muted">
              Layanan: <strong className="text-ink">{applicant.departemen}</strong> • Posisi: <strong className="text-ink">{applicant.posisi}</strong>
            </p>
            <p className="text-muted">
              Rekening BCA: <span className="font-mono text-ink font-semibold">{applicant.nomorRekening || '-'}</span> (a.n {applicant.namaPemilikRekening || applicant.namaLengkap})
            </p>
          </div>

          <div className="border-t border-border pt-3">
            <h4 className="font-bold text-ink mb-3 uppercase tracking-wider text-[11px]">
              Konfirmasi Status Penempatan Awal
            </h4>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Status Kerja */}
                <div>
                  <label className="block font-medium text-ink mb-1">Status Kerja</label>
                  <select
                    value={formData.status_kerja}
                    onChange={(e) => setFormData({ ...formData, status_kerja: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
                  >
                    <option value="TETAP">TETAP (PKWTT)</option>
                    <option value="KONTRAK">KONTRAK (PKWT)</option>
                    <option value="PROBATION">PROBATION (Percobaan)</option>
                    <option value="KEMITRAAN">KEMITRAAN</option>
                  </select>
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block font-medium text-ink mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              {/* Tanggal Mulai Masuk */}
              <div>
                <label className="block font-medium text-ink mb-1">Tanggal Mulai Bekerja</label>
                <input
                  type="date"
                  value={formData.tanggal_masuk}
                  onChange={(e) => setFormData({ ...formData, tanggal_masuk: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
                  required
                />
              </div>

              {/* Posisi / Role Kerja */}
              <div>
                <label className="block font-medium text-ink mb-1">Posisi Kerja / Jabatan</label>
                <input
                  type="text"
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  placeholder="Contoh: Staff, Danru, Driver Kurir..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
                  required
                />
              </div>

              {/* Klien Penugasan */}
              <div>
                <label className="block font-medium text-ink mb-1">Klien Penempatan Awal</label>
                <select
                  value={formData.penugasan_klien}
                  onChange={(e) => setFormData({ ...formData, penugasan_klien: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
                >
                  <option value="">-- Standby / Cadangan Kantor Pusat --</option>
                  {allClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lokasi Penugasan */}
              <div>
                <label className="block font-medium text-ink mb-1">Lokasi Proyek / Area</label>
                <select
                  value={formData.lokasi_penugasan}
                  onChange={(e) => setFormData({ ...formData, lokasi_penugasan: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
                >
                  <option value="">-- Area Pusat / Mengikuti Klien --</option>
                  {allLocations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 bg-accent-green hover:bg-accent-green/90 text-white font-semibold"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Memproses...' : 'Konfirmasi Masuk Master Data'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
