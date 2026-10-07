/**
 * Applicant Form Modal (Tambah Pelamar Baru Manual & Ubah Data Pelamar) — PT. BARAK IOMS
 * Desain, urutan field, validasi, dan elemen 100% identik dengan Formulir Lamaran Kerja di Landing Page.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  CreditCard,
  FileText,
  AlertCircle,
  Briefcase,
  Save,
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const DEPARTMENT_SERVICES = [
  'Head Office (HO)',
  'Jasa Pengamanan / Security',
  'Ekspedisi Kurir',
  'Parkir',
  'Cleaning Service',
  'Man Power',
  'Loss Prevention',
];

const DEPARTMENT_POSITIONS = {
  'Head Office (HO)': [
    'Staff Operasional HO',
    'HR & GA Staff',
    'Finance & Accounting Staff',
    'IT Support & Developer',
    'Legal & Compliance Staff',
    'Marketing & Business Development',
  ],
  'Jasa Pengamanan / Security': [
    'Staff / Anggota Security',
    'Danru (Komandan Regu)',
    'Koordinator Lapangan',
    'Chief Security',
    'Petugas Patroli',
  ],
  'Ekspedisi Kurir': [
    'Driver / Kurir Ekspedisi',
    'Petugas Sorter / Logistik',
    'Drop Point Staff',
    'Koordinator Drop Point',
    'Transporter',
  ],
  'Parkir': [
    'Petugas Tiketing Parkir',
    'Valet Runner / Driver',
    'Kasir Pos Parkir',
    'Koordinator Area Parkir',
  ],
  'Cleaning Service': [
    'Cleaner Staff / Housekeeping',
    'Team Leader Cleaning',
    'Specialist Floor Care & Sanitasi',
    'Gardener / Landscape',
  ],
  'Man Power': [
    'Staff Admin Operasional',
    'Operator Forklift / Gudang',
    'Resepsionis / Front Desk',
    'Office Helper / General Worker',
  ],
  'Loss Prevention': [
    'Loss Prevention Officer (LPO)',
    'Supervisor Pengawalan & Aset',
    'Petugas Investigasi & Audit Fisik',
  ],
};

export default function ApplicantFormModal({
  isOpen,
  applicant,
  onClose,
  onSave,
}) {
  const initialDept = applicant?.departemen || DEPARTMENT_SERVICES[0];
  const initialPos = applicant?.posisi || DEPARTMENT_POSITIONS[initialDept]?.[0] || 'Staff / Anggota Security';

  const [formData, setFormData] = useState({
    departemen: initialDept,
    posisi: initialPos,
    namaLengkap: '',
    nik: '',
    usia: '',
    tempatLahir: '',
    tglLahir: '',
    nomorSim: '',
    alamatLengkap: '',
    email: '',
    noHpWa: '',
    noHpDarurat: '',
    namaBank: 'BCA',
    nomorRekening: '',
    namaPemilikRekening: '',
    catatan: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (applicant) {
      setFormData({
        departemen: applicant.departemen || DEPARTMENT_SERVICES[0],
        posisi: applicant.posisi || DEPARTMENT_POSITIONS[applicant.departemen]?.[0] || 'Staff / Anggota Security',
        namaLengkap: applicant.namaLengkap || '',
        nik: applicant.nik || '',
        usia: applicant.usia || '',
        tempatLahir: applicant.tempatLahir || '',
        tglLahir: applicant.tglLahir || '',
        nomorSim: applicant.nomorSim || '',
        alamatLengkap: applicant.alamatLengkap || '',
        email: applicant.email || '',
        noHpWa: applicant.noHpWa || '',
        noHpDarurat: applicant.noHpDarurat || '',
        namaBank: 'BCA',
        nomorRekening: applicant.nomorRekening || '',
        namaPemilikRekening: applicant.namaPemilikRekening || applicant.namaLengkap || '',
        catatan: applicant.catatan || '',
      });
    } else {
      setFormData({
        departemen: DEPARTMENT_SERVICES[0],
        posisi: DEPARTMENT_POSITIONS[DEPARTMENT_SERVICES[0]][0],
        namaLengkap: '',
        nik: '',
        usia: '',
        tempatLahir: '',
        tglLahir: '',
        nomorSim: '',
        alamatLengkap: '',
        email: '',
        noHpWa: '',
        noHpDarurat: '',
        namaBank: 'BCA',
        nomorRekening: '',
        namaPemilikRekening: '',
        catatan: '',
      });
    }
    setErrors({});
  }, [applicant, isOpen]);

  if (!isOpen) return null;

  const isCourier = formData.departemen === 'Ekspedisi Kurir';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.departemen) newErrors.departemen = 'Departemen / Layanan wajib dipilih';
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Nama lengkap wajib diisi';

    const cleanNik = (formData.nik || '').replace(/\D/g, '');
    if (!cleanNik) {
      newErrors.nik = 'NIK wajib diisi';
    } else if (cleanNik.length !== 16) {
      newErrors.nik = 'NIK harus tepat 16 digit';
    }

    if (!formData.usia) {
      newErrors.usia = 'Usia wajib diisi';
    } else if (Number(formData.usia) < 18 || Number(formData.usia) > 60) {
      newErrors.usia = 'Usia harus antara 18 - 60 tahun';
    }

    if (!formData.tempatLahir.trim()) newErrors.tempatLahir = 'Tempat lahir wajib diisi';
    if (!formData.tglLahir) newErrors.tglLahir = 'Tanggal lahir wajib diisi';
    if (!formData.alamatLengkap.trim()) newErrors.alamatLengkap = 'Alamat lengkap wajib diisi';
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.noHpWa.trim()) newErrors.noHpWa = 'Nomor HP / WhatsApp wajib diisi';
    if (!formData.noHpDarurat.trim()) newErrors.noHpDarurat = 'Nomor HP Darurat wajib diisi';
    if (!formData.nomorRekening.trim()) newErrors.nomorRekening = 'Nomor rekening BCA wajib diisi';
    if (!formData.namaPemilikRekening.trim()) {
      newErrors.namaPemilikRekening = 'Nama pemilik rekening wajib diisi';
    }

    if (isCourier && !formData.nomorSim?.trim()) {
      newErrors.nomorSim = 'Nomor SIM wajib diisi untuk posisi Ekspedisi Kurir';
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

    const payload = {
      ...formData,
      usia: Number(formData.usia) || 25,
      posisi: formData.posisi || `Pelamar - ${formData.departemen}`,
      catatan: formData.catatan.trim() || 'Data diinput manual oleh HRD sesuai Formulir Lamaran Kerja.',
      status: applicant?.status || 'MASUK',
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border flex flex-col max-h-[92vh] overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded-t-2xl flex-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-red/20 border border-primary-red/40 flex items-center justify-center text-primary-red">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {applicant ? 'Ubah Data Pelamar' : 'Formulir Lamaran Kerja (Input Manual)'}
              </h2>
              <p className="text-xs text-white/70">
                Posisi: <span className="font-semibold text-primary-yellow">{formData.departemen}</span> • Jabodetabek & Banten
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none cursor-pointer"
            aria-label="Tutup formulir lamaran"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5 text-xs">
          {/* Posisi Terpilih / Pilihan Departemen */}
          <div className="bg-canvas border border-border rounded-xl p-3.5 sm:p-4 text-xs" style={{ color: '#0F172A' }}>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-departemen" className="font-bold text-ink flex items-center gap-1.5 mb-1" style={{ color: '#0F172A' }}>
                    <span>Departemen / Layanan</span>
                    <span className="text-danger font-bold text-error">*</span>
                  </label>
                  <select
                    id="modal-departemen"
                    name="departemen"
                    value={formData.departemen}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      const positions = DEPARTMENT_POSITIONS[newDept] || ['Staff Operasional'];
                      setFormData((prev) => ({
                        ...prev,
                        departemen: newDept,
                        posisi: positions[0] || 'Staff Operasional',
                      }));
                    }}
                    style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red font-medium"
                  >
                    {DEPARTMENT_SERVICES.map((dept) => (
                      <option key={dept} value={dept} style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-posisi" className="font-bold text-ink flex items-center gap-1.5 mb-1" style={{ color: '#0F172A' }}>
                    <span>Posisi Kerja Target (Jabatan / Role)</span>
                    <span className="text-danger font-bold text-error">*</span>
                  </label>
                  <select
                    id="modal-posisi"
                    name="posisi"
                    value={formData.posisi}
                    onChange={handleChange}
                    style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red font-medium"
                  >
                    {(DEPARTMENT_POSITIONS[formData.departemen] || ['Staff Operasional']).map((pos) => (
                      <option key={pos} value={pos} style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="modal-catatan" className="font-bold text-ink flex items-center gap-1.5 mb-1" style={{ color: '#0F172A' }}>
                  <span>Catatan Pelamar / Pengalaman</span>
                  <span className="text-muted font-normal">(Opsional)</span>
                </label>
                <textarea
                  id="modal-catatan"
                  name="catatan"
                  rows={2}
                  value={formData.catatan}
                  onChange={handleChange}
                  placeholder="Contoh: Pengalaman kerja sebelumnya, keahlian khusus, sertifikasi, atau catatan lain..."
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red resize-none"
                />
              </div>

              <p className="text-[11px] text-muted">
                Pilih divisi layanan dan posisi kerja target yang ingin dilamar di PT. BARAK.
              </p>
            </div>
          </div>

          {/* Section 1: Data Identitas eKTP */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border">
              <User className="w-4 h-4 text-primary-red" />
              <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                1. DATA PRIBADI SESUAI eKTP
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  Nama Lengkap (sesuai eKTP) <span className="text-error font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="namaLengkap"
                  value={formData.namaLengkap}
                  onChange={handleChange}
                  placeholder="Contoh: Muhammad Fauzi Pratama"
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.namaLengkap ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.namaLengkap && (
                  <p className="text-[11px] text-error mt-1">{errors.namaLengkap}</p>
                )}
              </div>

              {/* NIK */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  NIK (16 Digit eKTP) <span className="text-error font-bold">*</span>
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
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red font-mono',
                    errors.nik ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.nik && <p className="text-[11px] text-error mt-1">{errors.nik}</p>}
              </div>

              {/* Usia */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  Usia (Tahun) <span className="text-error font-bold">*</span>
                </label>
                <input
                  type="number"
                  name="usia"
                  min={18}
                  max={60}
                  value={formData.usia}
                  onChange={handleChange}
                  placeholder="Contoh: 25"
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.usia ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.usia && <p className="text-[11px] text-error mt-1">{errors.usia}</p>}
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  Tempat Lahir <span className="text-error font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="tempatLahir"
                  value={formData.tempatLahir}
                  onChange={handleChange}
                  placeholder="Kota / Kabupaten Lahir"
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.tempatLahir ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.tempatLahir && (
                  <p className="text-[11px] text-error mt-1">{errors.tempatLahir}</p>
                )}
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  Tanggal Lahir <span className="text-error font-bold">*</span>
                </label>
                <input
                  type="date"
                  name="tglLahir"
                  value={formData.tglLahir}
                  onChange={handleChange}
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.tglLahir ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.tglLahir && (
                  <p className="text-[11px] text-error mt-1">{errors.tglLahir}</p>
                )}
              </div>

              {/* Nomor SIM */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  Nomor SIM (Khusus Ekspedisi Kurir){' '}
                  {isCourier ? (
                    <span className="text-error font-bold">* (Wajib Diisi)</span>
                  ) : (
                    <span className="text-muted font-normal">(Opsional)</span>
                  )}
                </label>
                <input
                  type="text"
                  name="nomorSim"
                  value={formData.nomorSim}
                  onChange={handleChange}
                  placeholder={
                    isCourier
                      ? 'Contoh: SIM C / SIM A (Wajib untuk Ekspedisi Kurir)'
                      : 'Nomor SIM (opsional jika bukan Ekspedisi Kurir)'
                  }
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.nomorSim ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.nomorSim && (
                  <p className="text-[11px] text-error mt-1">{errors.nomorSim}</p>
                )}
              </div>

              {/* Alamat Lengkap Sesuai eKTP */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  Alamat Lengkap (sesuai eKTP) <span className="text-error font-bold">*</span>
                </label>
                <textarea
                  name="alamatLengkap"
                  rows={2}
                  value={formData.alamatLengkap}
                  onChange={handleChange}
                  placeholder="Jl. Nama Jalan No. RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi, Kode Pos"
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red resize-none',
                    errors.alamatLengkap ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.alamatLengkap && (
                  <p className="text-[11px] text-error mt-1">{errors.alamatLengkap}</p>
                )}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  Email Aktif <span className="text-error font-bold">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.email ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.email && <p className="text-[11px] text-error mt-1">{errors.email}</p>}
              </div>

              {/* No HP / WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  Nomor HP / WhatsApp <span className="text-error font-bold">*</span>
                </label>
                <input
                  type="tel"
                  name="noHpWa"
                  value={formData.noHpWa}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.noHpWa ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.noHpWa && <p className="text-[11px] text-error mt-1">{errors.noHpWa}</p>}
              </div>

              {/* No HP Darurat */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  Nomor HP Darurat <span className="text-error font-bold">*</span>
                </label>
                <input
                  type="tel"
                  name="noHpDarurat"
                  value={formData.noHpDarurat}
                  onChange={handleChange}
                  placeholder="No. Orang Tua / Kerabat"
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.noHpDarurat ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.noHpDarurat && (
                  <p className="text-[11px] text-error mt-1">{errors.noHpDarurat}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Data Rekening Bank BCA */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border">
              <CreditCard className="w-4 h-4 text-primary-red" />
              <h3 className="text-sm font-bold text-ink uppercase tracking-wide">
                3. INFORMASI REKENING BANK BCA
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nomor Rekening BCA */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  Nomor Rekening BCA <span className="text-error font-bold">*</span>
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
                  placeholder="Nomor rekening BCA"
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red font-mono',
                    errors.nomorRekening ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.nomorRekening && (
                  <p className="text-[11px] text-error mt-1">{errors.nomorRekening}</p>
                )}
              </div>

              {/* Nama Pemilik Rekening */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1" style={{ color: '#0F172A' }}>
                  Nama Pemilik Rekening <span className="text-error font-bold">*</span>
                </label>
                <input
                  type="text"
                  name="namaPemilikRekening"
                  value={formData.namaPemilikRekening}
                  onChange={handleChange}
                  placeholder="Sesuai buku tabungan BCA"
                  style={{ color: '#0F172A', backgroundColor: '#FFFFFF' }}
                  className={clsx(
                    'w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-ink placeholder:text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red',
                    errors.namaPemilikRekening ? 'border-error ring-1 ring-error/30' : 'border-border'
                  )}
                />
                {errors.namaPemilikRekening && (
                  <p className="text-[11px] text-error mt-1">{errors.namaPemilikRekening}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Berkas Dokumen Lamaran (Banner Catatan) */}
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
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-border flex items-center justify-between gap-3 flex-none" style={{ color: '#0F172A' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ color: '#0F172A' }}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-ink hover:text-primary-red hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          <Button
            type="button"
            onClick={handleSubmit}
            className="gap-2 bg-primary-red hover:bg-primary-red/90 text-white font-semibold px-5 py-2 rounded-xl"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Data Pelamar</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
