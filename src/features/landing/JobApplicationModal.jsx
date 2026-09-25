/**
 * Modal Formulir Lamaran Kerja — PT. BARAK
 * Form pendaftaran lowongan karir dengan data eKTP, rekening, catatan pengiriman berkas ZIP/PDF,
 * dan pengiriman langsung ke WhatsApp Rekrutmen +6285187845044.
 */

import React, { useState } from 'react';
import { 
  X, 
  Send, 
  User, 
  CreditCard, 
  FileText, 
  Phone, 
  AlertCircle,
  Briefcase
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const BANK_OPTIONS = [
  'BCA (Bank Central Asia)',
  'Bank Mandiri',
  'BRI (Bank Rakyat Indonesia)',
  'BNI (Bank Negara Indonesia)',
  'BSI (Bank Syariah Indonesia)',
  'Bank Danamon',
  'CIMB Niaga',
  'Bank Permata',
  'Bank BTN',
  'Bank Lainnya',
];

export default function JobApplicationModal({ isOpen, onClose, job }) {
  const [formData, setFormData] = useState({
    namaLengkap: '',
    nik: '',
    tempatLahir: '',
    tglLahir: '',
    usia: '',
    alamatLengkap: '',
    nomorSim: '',
    email: '',
    noHpWa: '',
    noHpDarurat: '',
    namaBank: 'BCA (Bank Central Asia)',
    nomorRekening: '',
    namaPemilikRekening: '',
  });


  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Nama Lengkap wajib diisi';
    if (!formData.nik.trim()) {
      newErrors.nik = 'NIK wajib diisi';
    } else if (!/^\d{16}$/.test(formData.nik.trim())) {
      newErrors.nik = 'NIK harus berjumlah 16 digit angka';
    }
    if (!formData.tempatLahir.trim()) newErrors.tempatLahir = 'Tempat lahir wajib diisi';
    if (!formData.tglLahir) newErrors.tglLahir = 'Tanggal lahir wajib diisi';
    if (!formData.usia) newErrors.usia = 'Usia wajib diisi';
    if (!formData.alamatLengkap.trim()) newErrors.alamatLengkap = 'Alamat sesuai eKTP wajib diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.noHpWa.trim()) newErrors.noHpWa = 'Nomor HP / WhatsApp wajib diisi';
    if (!formData.noHpDarurat.trim()) newErrors.noHpDarurat = 'Nomor HP darurat wajib diisi';
    if (!formData.nomorRekening.trim()) newErrors.nomorRekening = 'Nomor rekening wajib diisi';
    if (!formData.namaPemilikRekening.trim()) newErrors.namaPemilikRekening = 'Nama pemilik rekening wajib diisi';

    // Khusus posisi Kurir, nomor SIM sangat disarankan / wajib
    const isCourier = job?.title?.toLowerCase().includes('kurir') || job?.department?.toLowerCase().includes('ekspedisi');
    if (isCourier && !formData.nomorSim.trim()) {
      newErrors.nomorSim = 'Nomor SIM wajib diisi untuk posisi Kurir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon lengkapi semua data wajib pada formulir');
      return;
    }

    setIsSubmitting(true);

    const targetWaNumber = '6285187845044';
    const jobTitle = job?.title || 'Umum / Lowongan Terbuka';

    // Format text pesan WhatsApp rapi dan komprehensif
    const textLines = [
      `*FORMULIR LAMARAN KERJA - PT. BARAK*`,
      `----------------------------------------`,
      `*Posisi yang Dilamar:* ${jobTitle}`,
      `*Penempatan:* ${job?.location || 'Jabodetabek & Banten'}`,
      ``,
      `*1. DATA PRIBADI (SESUAI eKTP):*`,
      `• *Nama Lengkap:* ${formData.namaLengkap}`,
      `• *NIK:* ${formData.nik}`,
      `• *Tempat, Tgl Lahir:* ${formData.tempatLahir}, ${formData.tglLahir}`,
      `• *Usia:* ${formData.usia} Tahun`,
      `• *Alamat (eKTP):* ${formData.alamatLengkap}`,
      `• *Nomor SIM:* ${formData.nomorSim || '-'}`,
      `• *Email:* ${formData.email}`,
      `• *No. HP / WA:* ${formData.noHpWa}`,
      `• *No. HP Darurat:* ${formData.noHpDarurat}`,
      ``,
      `*2. DATA REKENING BANK:*`,
      `• *Nama Bank:* ${formData.namaBank}`,
      `• *Nomor Rekening:* ${formData.nomorRekening}`,
      `• *Nama Pemilik Rekening:* ${formData.namaPemilikRekening}`,
      ``,
      `*3. BERKAS DOKUMEN LAMPIRAN:*`,
      `• *Berkas Persyaratan:* CV, eKTP, SIM, KK, Ijazah Terakhir, Foto Selfie`,
      `• *Format Berkas:* File ZIP / PDF`,
      `• *Keterangan:* Dikirimkan langsung melalui chat WhatsApp ini ke nomor admin +6285187845044`,
      `----------------------------------------`,
      `Halo Tim Rekrutmen & HRD PT. BARAK, saya telah mengisi formulir data diri di atas secara lengkap dan benar. File berkas dokumen persyaratan (CV, eKTP, SIM, KK, Ijazah Terakhir, Foto Selfie) dalam bentuk zip/PDF akan saya kirimkan langsung melalui chat WhatsApp ini. Mohon diproses untuk tahapan seleksi berikutnya. Terima kasih.`,
    ];

    const waMessage = textLines.join('\n');
    const waUrl = `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(waMessage)}`;

    toast.success('Formulir berhasil diproses! Mengarahkan ke WhatsApp Rekrutmen...', { duration: 4000 });

    // Buka WhatsApp di tab baru
    setTimeout(() => {
      window.open(waUrl, '_blank');
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const isCourier = job?.title?.toLowerCase().includes('kurir') || job?.department?.toLowerCase().includes('ekspedisi');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-application-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-modal border border-border flex flex-col my-auto max-h-[92vh] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-ink border-b border-white/10 text-white flex-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-red/20 border border-primary-red/40 flex items-center justify-center text-primary-red">
              <Briefcase className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 id="job-application-title" className="text-base sm:text-lg font-bold text-white leading-tight">
                Formulir Lamaran Kerja
              </h2>
              <p className="text-xs text-white/70 mt-0.5">
                Posisi: <span className="text-primary-yellow font-semibold">{job?.title || 'Umum'}</span>
                {job?.location && <span> &bull; {job.location}</span>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none"
            aria-label="Tutup formulir lamaran"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Posisi Terpilih Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="font-semibold text-ink">Departemen:</span>
              <span>{job?.departmentLabel || job?.department || 'Operasional'}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 text-[11px]">
              {job?.employmentType || 'Full-time PKWT'}
            </span>
          </div>

          {/* Section 1: Data Identitas eKTP */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border">
              <User className="w-4 h-4 text-primary-red" />
              <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                1. Data Pribadi Sesuai eKTP
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap (sesuai eKTP) <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="namaLengkap"
                  value={formData.namaLengkap}
                  onChange={handleChange}
                  placeholder="Contoh: Muhammad Fauzi Pratama"
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.namaLengkap ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.namaLengkap && (
                  <p className="text-[11px] text-danger mt-1">{errors.namaLengkap}</p>
                )}
              </div>

              {/* NIK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIK (16 Digit eKTP) <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="nik"
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData((prev) => ({ ...prev, nik: val }));
                    if (errors.nik) setErrors((prev) => ({ ...prev, nik: null }));
                  }}
                  placeholder="3271xxxxxxxxxxxx"
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red font-mono',
                    errors.nik ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.nik && <p className="text-[11px] text-danger mt-1">{errors.nik}</p>}
              </div>

              {/* Usia */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usia (Tahun) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="usia"
                  min={18}
                  max={60}
                  value={formData.usia}
                  onChange={handleChange}
                  placeholder="Contoh: 25"
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.usia ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.usia && <p className="text-[11px] text-danger mt-1">{errors.usia}</p>}
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Lahir <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={handleChange}
                  placeholder="Kota / Kabupaten Lahir"
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.tempatLahir ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.tempatLahir && (
                  <p className="text-[11px] text-danger mt-1">{errors.tempatLahir}</p>
                )}
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Lahir <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="tglLahir"
                  value={formData.tglLahir}
                  onChange={handleChange}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.tglLahir ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.tglLahir && (
                  <p className="text-[11px] text-danger mt-1">{errors.tglLahir}</p>
                )}
              </div>

              {/* Nomor SIM (Khusus Kurir) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor SIM {isCourier ? <span className="text-danger">* (Wajib Kurir)</span> : <span className="text-muted font-normal">(Bila ada)</span>}
                </label>
                <input
                  type="text"
                  name="nomorSim"
                  value={formData.nomorSim}
                  onChange={handleChange}
                  placeholder={isCourier ? "Contoh: SIM C 1234-5678-xxxx" : "SIM A / C / B1 (jika ada)"}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.nomorSim ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.nomorSim && (
                  <p className="text-[11px] text-danger mt-1">{errors.nomorSim}</p>
                )}
              </div>


              {/* Alamat Lengkap Sesuai eKTP */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap (sesuai eKTP) <span className="text-danger">*</span>
                </label>
                <textarea
                  name="alamatLengkap"
                  rows={2}
                  value={formData.alamatLengkap}
                  onChange={handleChange}
                  placeholder="Jl. Nama Jalan No. RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi, Kode Pos"
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red resize-none',
                    errors.alamatLengkap ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.alamatLengkap && (
                  <p className="text-[11px] text-danger mt-1">{errors.alamatLengkap}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Kontak & Komunikasi */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border">
              <Phone className="w-4 h-4 text-primary-red" />
              <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                2. Kontak & Komunikasi
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Aktif <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.email ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.email && <p className="text-[11px] text-danger mt-1">{errors.email}</p>}
              </div>

              {/* No HP / WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  name="noHpWa"
                  value={formData.noHpWa}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.noHpWa ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.noHpWa && <p className="text-[11px] text-danger mt-1">{errors.noHpWa}</p>}
              </div>

              {/* No HP Darurat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP Darurat <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  name="noHpDarurat"
                  value={formData.noHpDarurat}
                  onChange={handleChange}
                  placeholder="No. Orang Tua / Kerabat"
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.noHpDarurat ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.noHpDarurat && (
                  <p className="text-[11px] text-danger mt-1">{errors.noHpDarurat}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Data Rekening Bank */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border">
              <CreditCard className="w-4 h-4 text-primary-red" />
              <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                3. Informasi Rekening Bank
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nama Bank */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Bank <span className="text-danger">*</span>
                </label>
                <select
                  name="namaBank"
                  value={formData.namaBank}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                >
                  {BANK_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nomor Rekening */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Rekening <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="nomorRekening"
                  value={formData.nomorRekening}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData((prev) => ({ ...prev, nomorRekening: val }));
                    if (errors.nomorRekening) setErrors((prev) => ({ ...prev, nomorRekening: null }));
                  }}
                  placeholder="Nomor rekening bank"
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red font-mono',
                    errors.nomorRekening ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.nomorRekening && (
                  <p className="text-[11px] text-danger mt-1">{errors.nomorRekening}</p>
                )}
              </div>

              {/* Nama Pemilik Rekening */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pemilik Rekening <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="namaPemilikRekening"
                  value={formData.namaPemilikRekening}
                  onChange={handleChange}
                  placeholder="Sesuai buku tabungan"
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.namaPemilikRekening ? 'border-danger' : 'border-border'
                  )}
                />
                {errors.namaPemilikRekening && (
                  <p className="text-[11px] text-danger mt-1">{errors.namaPemilikRekening}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Catatan Pengiriman Berkas Dokumen */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border">
              <FileText className="w-4 h-4 text-primary-red" />
              <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                4. Berkas Dokumen Lamaran
              </h3>
            </div>

            <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 text-amber-950 flex items-start gap-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-200/80 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800 mt-0.5">
                <AlertCircle className="w-5 h-5 text-amber-800" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
                <p className="font-bold text-amber-900 text-sm sm:text-base">
                  Catatan :
                </p>
                <p className="text-amber-950">
                  silahkan kirim file berisi : <strong>(CV, eKTP, SIM, KK, Ijazah Terakhir, Foto Selfie)</strong> dalam bentuk file <strong>zip/PDF</strong> dari WA Pelamar ke nomor WA admin <span className="font-bold text-primary-red">+6285187845044</span>
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Dispatch Notice */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-green shrink-0 animate-pulse" />
            <p className="leading-relaxed">
              Saat tombol <strong>"Kirim Lamaran"</strong> ditekan, data formulir Anda akan otomatis dikirimkan ke 
              WhatsApp Rekrutmen PT. BARAK (<span className="font-bold">6285187845044</span>).
            </p>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-border flex items-center justify-between gap-3 flex-none">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-ink hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={clsx(
              'px-5 py-2.5 bg-primary-red hover:bg-red-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2',
              isSubmitting && 'opacity-60 cursor-not-allowed'
            )}
          >
            <span>Kirim Lamaran (via WhatsApp)</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
