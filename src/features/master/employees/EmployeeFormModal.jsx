/**
 * Employee Form Modal (Create / Edit) — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1 (Mandatory Employee Master fields).
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Camera, Upload, Trash2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MOCK_CLIENTS, MOCK_LOCATIONS } from '@/services/mock/mockMasterData';
import { EMPLOYEE_SERVICE_TYPES, PTKP_OPTIONS, getServiceLabel, getCustomServices, saveCustomService, isCertificationService } from '@/constants/business';
import { resizeImageTo3x4 } from '@/utils/imageResize';
import EmployeeImportModal from './EmployeeImportModal';
import toast from 'react-hot-toast';

const DEFAULT_JABATAN_OPTIONS = [
  'Staff',
  'Danru (Komandan Regu)',
  'Koordinator Lapangan',
  'Supervisor',
  'Chief Security',
  'Team Leader',
  'Admin Operasional',
  'Operator Forklift / Logistik',
  'Driver / Pengemudi',
  'Petugas Kebersihan',
];

export default function EmployeeFormModal({ isOpen, employee, onClose, onSave, onImportSuccess, clients = [], locations = [] }) {
  const allClients = clients && clients.length > 0 ? clients : MOCK_CLIENTS;
  const allLocations = locations && locations.length > 0 ? locations : MOCK_LOCATIONS;

  const [formData, setFormData] = useState({
    nama_lengkap_sesuai_KTP: '',
    NIK: '',
    jenis_kelamin: 'L',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '1990-01-01',
    tanggal_masuk: new Date().toISOString().split('T')[0],
    alamat_sesuai_KTP: '',
    nomor_telepon: '',
    email: '',
    status_kerja: 'TETAP',
    jenis_pekerjaan: 'Head Office (HO)',
    jabatan: 'Staff',
    departemen: 'Operasional',
    jenis_layanan: 'head-office',
    penugasan_klien: allClients[0]?.id || '',
    lokasi_penugasan: allLocations[0]?.id || '',
    sertifikasi: '',
    nama_bank: 'BCA',
    nomor_rekening_bank: '',
    rekening_atas_nama: '',
    NPWP: '',
    status_pajak: 'TK0',
    BPJS_kesehatan: '',
    BPJS_ketenagakerjaan: '',
    emergency_nama: '',
    emergency_relasi: 'Istri',
    emergency_nomor: '',
    foto_3x4: '',
  });

  const [errors, setErrors] = useState({});
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Dynamic custom job roles / jabatan state
  const [customJabatanList, setCustomJabatanList] = useState(() => {
    try {
      const stored = localStorage.getItem('barak_custom_jabatans');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isInputtingNewJabatan, setIsInputtingNewJabatan] = useState(false);
  const [newJabatanInput, setNewJabatanInput] = useState('');

  // Dynamic custom services / layanan state
  const [customServiceList, setCustomServiceList] = useState(() => {
    return getCustomServices();
  });
  const [isInputtingNewLayanan, setIsInputtingNewLayanan] = useState(false);
  const [newLayananInput, setNewLayananInput] = useState('');

  const allJabatanOptions = useMemo(() => {
    const combined = [...DEFAULT_JABATAN_OPTIONS, ...customJabatanList];
    if (employee?.jabatan && !combined.includes(employee.jabatan)) {
      combined.push(employee.jabatan);
    }
    return Array.from(new Set(combined.filter(Boolean)));
  }, [customJabatanList, employee]);

  const allServiceOptions = useMemo(() => {
    const combined = [...EMPLOYEE_SERVICE_TYPES];
    const existingKeys = new Set(combined.map((s) => s.key));
    customServiceList.forEach((cs) => {
      if (!existingKeys.has(cs.key)) {
        combined.push(cs);
        existingKeys.add(cs.key);
      }
    });
    if (employee?.jenis_layanan && !existingKeys.has(employee.jenis_layanan)) {
      const customLabel = employee.jenis_pekerjaan || getServiceLabel(employee.jenis_layanan) || employee.jenis_layanan;
      combined.push({
        key: employee.jenis_layanan,
        label: customLabel,
        slug: employee.jenis_layanan,
      });
    }
    return combined;
  }, [customServiceList, employee]);

  const isHeadOffice = useMemo(() => {
    const key = (formData.jenis_layanan || '').toLowerCase();
    const label = (formData.jenis_pekerjaan || '').toLowerCase();
    return key === 'head-office' || key === 'ho' || label.includes('head office') || label.includes('(ho)');
  }, [formData.jenis_layanan, formData.jenis_pekerjaan]);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    setIsInputtingNewJabatan(false);
    setNewJabatanInput('');
    setIsInputtingNewLayanan(false);
    setNewLayananInput('');
    if (employee) {
      setFormData({
        nama_lengkap_sesuai_KTP: employee.nama_lengkap_sesuai_KTP || '',
        NIK: (employee.NIK || '').replace(/\D/g, '').slice(0, 16),
        jenis_kelamin: employee.jenis_kelamin || 'L',
        tempat_lahir: employee.tempat_lahir || 'Jakarta',
        tanggal_lahir: employee.tanggal_lahir || '1990-01-01',
        tanggal_masuk: employee.tanggal_masuk || employee.tanggal_bergabung || new Date().toISOString().split('T')[0],
        alamat_sesuai_KTP: employee.alamat_sesuai_KTP || '',
        nomor_telepon: employee.nomor_telepon || '',
        email: employee.email || '',
        status_kerja: employee.status_kerja || 'TETAP',
        jenis_layanan: employee.jenis_layanan || 'security',
        jenis_pekerjaan: employee.jenis_pekerjaan || getServiceLabel(employee.jenis_layanan || 'security'),
        jabatan: employee.jabatan || 'Staff',
        departemen: employee.departemen || 'Operasional',
        penugasan_klien: employee.penugasan_klien || MOCK_CLIENTS[0]?.id || '',
        lokasi_penugasan: employee.lokasi_penugasan || MOCK_LOCATIONS[0]?.id || '',
        sertifikasi: employee.sertifikasi || '',
        nama_bank: 'BCA',
        nomor_rekening_bank: employee.nomor_rekening_bank || '',
        rekening_atas_nama: employee.rekening_atas_nama || employee.nama_pemilik_rekening || employee.nama_lengkap_sesuai_KTP || '',
        NPWP: employee.NPWP || '',
        status_pajak: employee.status_pajak || employee.ptkp || 'TK0',
        BPJS_kesehatan: employee.BPJS_kesehatan || '',
        BPJS_ketenagakerjaan: employee.BPJS_ketenagakerjaan || '',
        emergency_nama: employee.kontak_darurat?.nama || '',
        emergency_relasi: employee.kontak_darurat?.relasi || 'Keluarga',
        emergency_nomor: employee.kontak_darurat?.nomor || '',
        foto_3x4: employee.foto_3x4 || '',
      });
    } else {
      setFormData({
        nama_lengkap_sesuai_KTP: '',
        NIK: '',
        jenis_kelamin: 'L',
        tempat_lahir: 'Jakarta',
        tanggal_lahir: '1995-05-15',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        alamat_sesuai_KTP: '',
        nomor_telepon: '',
        email: '',
        status_kerja: 'TETAP',
        jenis_layanan: 'head-office',
        jenis_pekerjaan: 'Head Office (HO)',
        jabatan: 'Staff',
        departemen: 'Operasional',
        penugasan_klien: MOCK_CLIENTS[0]?.id || '',
        lokasi_penugasan: MOCK_LOCATIONS[0]?.id || '',
        sertifikasi: '',
        nama_bank: 'BCA',
        nomor_rekening_bank: '',
        rekening_atas_nama: '',
        NPWP: '',
        status_pajak: 'TK0',
        BPJS_kesehatan: '',
        BPJS_ketenagakerjaan: '',
        emergency_nama: '',
        emergency_relasi: 'Istri',
        emergency_nomor: '',
        foto_3x4: '',
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Attach camera stream when camera modal opens
  useEffect(() => {
    if (isCameraModalOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraModalOpen]);

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa berkas gambar (JPG, PNG, atau WebP).');
      return;
    }

    try {
      const resized = await resizeImageTo3x4(file, 300, 400);
      setFormData((prev) => ({ ...prev, foto_3x4: resized }));
      toast.success('Foto berhasil disesuaikan ke ukuran 3x4.');
    } catch (err) {
      toast.error(err.message || 'Gagal memproses foto.');
    } finally {
      e.target.value = '';
    }
  };

  const startLiveCamera = async () => {
    try {
      setIsCameraModalOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setIsCameraModalOpen(false);
      // Fallback: trigger input file dengan capture="user"
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        toast.error('Tidak dapat mengakses kamera perangkat.');
      }
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraModalOpen(false);
  };

  const captureFromLiveCamera = async () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawData = canvas.toDataURL('image/jpeg', 0.95);

      const resized3x4 = await resizeImageTo3x4(rawData, 300, 400);
      setFormData((prev) => ({ ...prev, foto_3x4: resized3x4 }));
      stopLiveCamera();
      toast.success('Foto berhasil diambil & disesuaikan ke ukuran 3x4.');
    } catch {
      toast.error('Gagal mengambil gambar dari kamera.');
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.nama_lengkap_sesuai_KTP.trim()) {
      errs.nama_lengkap_sesuai_KTP = 'Nama lengkap wajib diisi.';
    }
    const cleanNik = (formData.NIK || '').replace(/\D/g, '');
    if (!cleanNik) {
      errs.NIK = 'NIK wajib diisi.';
    } else if (cleanNik.length !== 16) {
      errs.NIK = `NIK harus tepat 16 digit angka (saat ini ${cleanNik.length} digit).`;
    }
    if (!formData.nomor_telepon.trim()) {
      errs.nomor_telepon = 'Nomor telepon wajib diisi.';
    }
    if (!formData.alamat_sesuai_KTP.trim()) {
      errs.alamat_sesuai_KTP = 'Alamat KTP wajib diisi.';
    }
    if (!formData.tanggal_masuk) {
      errs.tanggal_masuk = 'Tanggal bergabung wajib diisi.';
    }
    if (isInputtingNewJabatan && !formData.jabatan?.trim()) {
      errs.jabatan = 'Nama jabatan/role baru wajib diisi.';
    }
    if (isInputtingNewLayanan && !formData.jenis_pekerjaan?.trim()) {
      errs.jenis_layanan = 'Nama layanan baru wajib diisi.';
    }
    setErrors(errs);
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      const firstErrorMessage = Object.values(errs)[0];
      toast.error(firstErrorMessage);
      formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const finalJabatan = (formData.jabatan || 'Staff').trim();
    if (finalJabatan && !allJabatanOptions.includes(finalJabatan)) {
      const updatedCustom = Array.from(new Set([...customJabatanList, finalJabatan]));
      setCustomJabatanList(updatedCustom);
      try {
        localStorage.setItem('barak_custom_jabatans', JSON.stringify(updatedCustom));
      } catch {
        // ignore
      }
    }

    const finalLayananLabel = (formData.jenis_pekerjaan || formData.jenis_layanan || 'Head Office (HO)').trim();
    const finalLayananKey = (formData.jenis_layanan || finalLayananLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();

    if (finalLayananLabel && !EMPLOYEE_SERVICE_TYPES.some((s) => s.key === finalLayananKey || s.label.toLowerCase() === finalLayananLabel.toLowerCase())) {
      saveCustomService({ key: finalLayananKey, label: finalLayananLabel, slug: finalLayananKey });
      setCustomServiceList(getCustomServices());
    }

    const isHo = isHeadOffice;

    const clientObj = isHo ? null : allClients.find((c) => c.id === formData.penugasan_klien || c.code === formData.penugasan_klien);
    const locObj = isHo ? null : allLocations.find((l) => l.id === formData.lokasi_penugasan || l.code === formData.lokasi_penugasan);

    const sObj = allServiceOptions.find((s) => s.key === finalLayananKey) || { key: finalLayananKey, label: finalLayananLabel };
    const serviceLabel = sObj ? sObj.label : finalLayananLabel;

    const isCertRequired = isCertificationService(finalLayananKey || finalLayananLabel);
    const finalSertifikasi = isCertRequired ? (formData.sertifikasi || (finalLayananKey === 'kurir' ? 'SIM C / A' : 'Gada Pratama')) : '';

    const payload = {
      ...formData,
      jenis_layanan: finalLayananKey,
      jenis_pekerjaan: serviceLabel,
      jabatan: finalJabatan,
      sertifikasi: finalSertifikasi,
      penugasan_klien: isHo ? '' : formData.penugasan_klien,
      lokasi_penugasan: isHo ? '' : formData.lokasi_penugasan,
      clientName: isHo ? 'Kantor Pusat PT. BARAK' : (clientObj ? clientObj.name : ''),
      locationName: isHo ? 'Kantor Pusat BARAK' : (locObj ? locObj.name : ''),
      departemen: isHo ? (formData.departemen === 'Operasional' ? 'Head Office' : formData.departemen) : formData.departemen,
      kontak_darurat: {
        nama: formData.emergency_nama,
        relasi: formData.emergency_relasi,
        nomor: formData.emergency_nomor,
      },
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-ink">
                {employee ? 'Ubah Data Karyawan' : 'Tambah Karyawan Baru'}
              </h2>
              {!employee && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportModalOpen(true)}
                  className="gap-1.5 text-xs text-primary-red border-primary-red/40 hover:bg-red-50 bg-white shadow-xs"
                  title="Import data karyawan sekaligus dari file Excel (.xlsx)"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-primary-red" />
                  <span>Import Excel (.xlsx)</span>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted">
              Pencatatan Master Karyawan terpusat per standar regulasi ketenagakerjaan dan SOP BARAK.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Card Pas Foto 3x4 */}
          <div className="p-3.5 bg-canvas/70 rounded-xl border border-border flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Frame 3x4 Preview */}
            <div className="relative w-24 h-32 flex-none rounded-lg border-2 border-dashed border-border bg-white overflow-hidden shadow-xs flex items-center justify-center group">
              {formData.foto_3x4 ? (
                <>
                  <img
                    src={formData.foto_3x4}
                    alt="Pas Foto 3x4"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 bg-primary-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    3x4
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, foto_3x4: '' })}
                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-[10px]"
                    title="Hapus Foto"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-muted p-2 text-center">
                  <Camera className="h-6 w-6 mb-1 text-muted/60" />
                  <span className="text-[10px] font-semibold text-slate">Pas Foto</span>
                  <span className="text-[9px] text-muted">3 × 4</span>
                </div>
              )}
            </div>

            {/* Controls & Action Buttons */}
            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <label className="font-bold text-ink">Foto Karyawan (Ukuran 3x4)</label>
                <span className="text-[10px] bg-accent-green/15 text-accent-green font-semibold px-2 py-0.5 rounded-full">
                  Auto-Resize 3:4
                </span>
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Upload foto dari penyimpanan perangkat atau langsung gunakan kamera device. Foto secara otomatis di-crop dan di-resize ke ukuran standar pas foto 3x4 (300 × 400 pixel).
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                {/* Hidden inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 bg-white text-xs h-8"
                >
                  <Upload className="h-3.5 w-3.5 text-primary-red" />
                  <span>Pilih dari Device</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={startLiveCamera}
                  className="gap-1.5 bg-white text-xs h-8"
                >
                  <Camera className="h-3.5 w-3.5 text-info" />
                  <span>Kamera Device Langsung</span>
                </Button>

                {formData.foto_3x4 && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, foto_3x4: '' })}
                    className="text-[11px] text-error hover:underline px-2 py-1"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Baris 1: Nama & NIK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Nama Lengkap (sesuai KTP) *</label>
              <input
                type="text"
                value={formData.nama_lengkap_sesuai_KTP}
                onChange={(e) => setFormData({ ...formData, nama_lengkap_sesuai_KTP: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-ink focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red ${
                  errors.nama_lengkap_sesuai_KTP ? 'border-error ring-1 ring-error/30' : 'border-border'
                }`}
                placeholder="Contoh: Budi Prasetyo"
              />
              {errors.nama_lengkap_sesuai_KTP && <p className="text-error text-[11px] mt-1">{errors.nama_lengkap_sesuai_KTP}</p>}
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">NIK (16 Digit) *</label>
              <input
                type="text"
                maxLength={16}
                value={formData.NIK}
                onChange={(e) => setFormData({ ...formData, NIK: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                className={`w-full px-3 py-2 font-mono border rounded-lg bg-white text-ink focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red ${
                  errors.NIK ? 'border-error ring-1 ring-error/30' : 'border-border'
                }`}
                placeholder="3201xxxxxxxxxxxx"
              />
              {errors.NIK && <p className="text-error text-[11px] mt-1">{errors.NIK}</p>}
            </div>
          </div>

          {/* Baris 2: Gender, Tempat & Tanggal Lahir */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Jenis Kelamin</label>
              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Tempat Lahir</label>
              <input
                type="text"
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
              />
            </div>
          </div>

          {/* Baris 3: Kontak & Alamat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Nomor Telepon / WA *</label>
              <input
                type="tel"
                value={formData.nomor_telepon}
                onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-ink ${
                  errors.nomor_telepon ? 'border-error ring-1 ring-error/30' : 'border-border'
                }`}
                placeholder="0812xxxxxxxx"
              />
              {errors.nomor_telepon && <p className="text-error text-[11px] mt-1">{errors.nomor_telepon}</p>}
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Email Perusahaan / Pribadi</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
                placeholder="budi@barak.co.id"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-medium text-ink mb-1">Alamat Lengkap (KTP) *</label>
              <textarea
                rows={2}
                value={formData.alamat_sesuai_KTP}
                onChange={(e) => setFormData({ ...formData, alamat_sesuai_KTP: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-ink ${
                  errors.alamat_sesuai_KTP ? 'border-error ring-1 ring-error/30' : 'border-border'
                }`}
                placeholder="Alamat domisili sesuai KTP..."
              />
              {errors.alamat_sesuai_KTP && <p className="text-error text-[11px] mt-1">{errors.alamat_sesuai_KTP}</p>}
            </div>
          </div>

          {/* Baris 4: Jabatan, Layanan, Status Kerja, Tanggal Bergabung */}
          <div className="border-t border-border pt-3">
            <h4 className="font-bold text-ink mb-2">Penempatan & Jabatan</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-ink">Layanan</label>
                  {isInputtingNewLayanan ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsInputtingNewLayanan(false);
                        const defaultSvc = allServiceOptions[0] || EMPLOYEE_SERVICE_TYPES[0];
                        setFormData((prev) => ({
                          ...prev,
                          jenis_layanan: defaultSvc.key,
                          jenis_pekerjaan: defaultSvc.label,
                        }));
                      }}
                      className="text-[11px] text-primary-red hover:underline font-semibold"
                    >
                      ← Pilih List
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsInputtingNewLayanan(true);
                        setNewLayananInput('');
                        setFormData((prev) => ({ ...prev, jenis_layanan: '', jenis_pekerjaan: '' }));
                      }}
                      className="text-[11px] text-primary-red hover:underline font-semibold"
                    >
                      + Ketik Baru
                    </button>
                  )}
                </div>

                {isInputtingNewLayanan ? (
                  <div>
                    <input
                      type="text"
                      autoFocus
                      value={newLayananInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewLayananInput(val);
                        const slug = val.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || val.trim();
                        setFormData((prev) => ({
                          ...prev,
                          jenis_layanan: slug,
                          jenis_pekerjaan: val,
                        }));
                      }}
                      placeholder="Ketik layanan baru..."
                      className={`w-full px-3 py-2 border rounded-lg bg-white text-ink focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red ${
                        errors.jenis_layanan ? 'border-error ring-1 ring-error/30' : 'border-primary-red/60'
                      }`}
                    />
                    {errors.jenis_layanan && (
                      <p className="text-error text-[10px] mt-1">{errors.jenis_layanan}</p>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.jenis_layanan}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsInputtingNewLayanan(true);
                        setNewLayananInput('');
                        setFormData((prev) => ({ ...prev, jenis_layanan: '', jenis_pekerjaan: '' }));
                      } else {
                        const selectedKey = e.target.value;
                        const sObj = allServiceOptions.find((s) => s.key === selectedKey);
                        const serviceLabel = sObj ? sObj.label : selectedKey;
                        setFormData((prev) => ({
                          ...prev,
                          jenis_layanan: selectedKey,
                          jenis_pekerjaan: serviceLabel,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
                  >
                    {allServiceOptions.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                    <option value="__NEW__" className="text-primary-red font-semibold">+ Ketik Baru...</option>
                  </select>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-ink">Jabatan / Role *</label>
                  {isInputtingNewJabatan ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsInputtingNewJabatan(false);
                        setFormData((prev) => ({ ...prev, jabatan: allJabatanOptions[0] || 'Staff' }));
                      }}
                      className="text-[11px] text-primary-red hover:underline font-semibold"
                    >
                      ← Pilih List
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsInputtingNewJabatan(true);
                        setNewJabatanInput('');
                        setFormData((prev) => ({ ...prev, jabatan: '' }));
                      }}
                      className="text-[11px] text-primary-red hover:underline font-semibold"
                    >
                      + Ketik Baru
                    </button>
                  )}
                </div>

                {isInputtingNewJabatan ? (
                  <div>
                    <input
                      type="text"
                      autoFocus
                      value={newJabatanInput}
                      onChange={(e) => {
                        setNewJabatanInput(e.target.value);
                        setFormData((prev) => ({ ...prev, jabatan: e.target.value }));
                      }}
                      placeholder="Ketik jabatan baru..."
                      className={`w-full px-3 py-2 border rounded-lg bg-white text-ink focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red ${
                        errors.jabatan ? 'border-error ring-1 ring-error/30' : 'border-primary-red/60'
                      }`}
                    />
                    {errors.jabatan && (
                      <p className="text-error text-[10px] mt-1">{errors.jabatan}</p>
                    )}
                  </div>
                ) : (
                  <select
                    value={formData.jabatan}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsInputtingNewJabatan(true);
                        setNewJabatanInput('');
                        setFormData((prev) => ({ ...prev, jabatan: '' }));
                      } else {
                        setFormData((prev) => ({ ...prev, jabatan: e.target.value }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
                  >
                    {allJabatanOptions.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                    <option value="__NEW__" className="text-primary-red font-semibold">
                      + Tambah Jabatan Baru (Ketik Manual)...
                    </option>
                  </select>
                )}
              </div>
              <div>
                <label className="block font-medium text-ink mb-1">Status Ikatan Kerja</label>
                <select
                  value={formData.status_kerja}
                  onChange={(e) => setFormData({ ...formData, status_kerja: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
                >
                  <option value="TETAP">TETAP (PKWTT)</option>
                  <option value="KONTRAK">KONTRAK (PKWT)</option>
                  <option value="PROBATION">PROBATION (Percobaan)</option>
                  <option value="KEMITRAAN">KEMITRAAN</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-ink mb-1">Tanggal Bergabung *</label>
                <input
                  type="date"
                  value={formData.tanggal_masuk}
                  onChange={(e) => setFormData({ ...formData, tanggal_masuk: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg bg-white text-ink ${
                    errors.tanggal_masuk ? 'border-error ring-1 ring-error/30' : 'border-border'
                  }`}
                />
                {errors.tanggal_masuk && <p className="text-error text-[11px] mt-1">{errors.tanggal_masuk}</p>}
              </div>
            </div>

            {isHeadOffice ? (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-primary-red/10 flex items-center justify-center text-primary-red flex-none font-bold">
                  HO
                </div>
                <div>
                  <p className="font-semibold text-ink">Penempatan Internal: Kantor Pusat PT. BARAK</p>
                  <p className="text-muted text-[11px]">Karyawan Head Office ditempatkan di Kantor Pusat (HO) tanpa ikatan proyek klien alih daya.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block font-medium text-ink mb-1">Klien Penempatan</label>
                  <select
                    value={formData.penugasan_klien}
                    onChange={(e) => {
                      const newCId = e.target.value;
                      const matches = allLocations.filter((l) => l.clientId === newCId);
                      setFormData((prev) => ({
                        ...prev,
                        penugasan_klien: newCId,
                        lokasi_penugasan: matches.length > 0 ? matches[0].id : prev.lokasi_penugasan,
                      }));
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
                  >
                    {allClients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-ink mb-1">Lokasi Kerja</label>
                  <select
                    value={formData.lokasi_penugasan}
                    onChange={(e) => setFormData({ ...formData, lokasi_penugasan: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
                  >
                    {(allLocations.filter((l) => l.clientId === formData.penugasan_klien).length > 0
                      ? allLocations.filter((l) => l.clientId === formData.penugasan_klien)
                      : allLocations
                    ).map((l) => (
                      <option key={l.id} value={l.id}>{l.name} - {l.city}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {isCertificationService(formData.jenis_layanan || formData.jenis_pekerjaan) && (
              <div className="mt-3">
                <label className="block font-medium text-ink mb-1">Sertifikasi & Lisensi</label>
                <input
                  type="text"
                  value={formData.sertifikasi}
                  onChange={(e) => setFormData({ ...formData, sertifikasi: e.target.value })}
                  placeholder={
                    (formData.jenis_layanan || '').includes('kurir')
                      ? 'Contoh: SIM C, SIM A, SIM B1 Umum...'
                      : 'Contoh: Gada Pratama, Gada Madya, Gada Utama...'
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
                />
              </div>
            )}

            {!employee && !isHeadOffice && (
              <div className="mt-3 p-3 bg-primary-red/5 border border-primary-red/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 text-xs text-ink">
                  <FileSpreadsheet className="h-4 w-4 text-primary-red flex-none" />
                  <span>Ingin menginput banyak data personel sekaligus untuk lokasi klien ini?</span>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsImportModalOpen(true)}
                  className="gap-1.5 text-xs bg-primary-red hover:bg-red-700 flex-none"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Import Excel (.xlsx)</span>
                </Button>
              </div>
            )}
          </div>

          {/* Baris 5: Data Rekening BCA, NPWP, Status Pajak (PTKP), & BPJS */}
          <div className="border-t border-border pt-3">
            <h4 className="font-bold text-ink mb-2">Rekening BCA & Perpajakan</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-ink mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  value={formData.nomor_rekening_bank}
                  onChange={(e) => setFormData({ ...formData, nomor_rekening_bank: e.target.value })}
                  className="w-full px-3 py-2 font-mono border border-border rounded-lg bg-white text-ink"
                  placeholder="123000xxxxxxx"
                />
              </div>
              <div>
                <label className="block font-medium text-ink mb-1">Rekening atas nama</label>
                <input
                  type="text"
                  value={formData.rekening_atas_nama}
                  onChange={(e) => setFormData({ ...formData, rekening_atas_nama: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
                  placeholder="Nama pemilik rekening BCA..."
                />
              </div>
              <div>
                <label className="block font-medium text-ink mb-1">NPWP</label>
                <input
                  type="text"
                  value={formData.NPWP}
                  onChange={(e) => setFormData({ ...formData, NPWP: e.target.value })}
                  className="w-full px-3 py-2 font-mono border border-border rounded-lg bg-white text-ink"
                  placeholder="00.000.000.0-000.000"
                />
              </div>
              <div>
                <label className="block font-medium text-ink mb-1">Status Pajak (PTKP)</label>
                <select
                  value={formData.status_pajak}
                  onChange={(e) => setFormData({ ...formData, status_pajak: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
                >
                  {PTKP_OPTIONS.map((ptkp) => (
                    <option key={ptkp.value} value={ptkp.value}>
                      {ptkp.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-ink mb-1">BPJS Kesehatan</label>
                <input
                  type="text"
                  value={formData.BPJS_kesehatan}
                  onChange={(e) => setFormData({ ...formData, BPJS_kesehatan: e.target.value })}
                  className="w-full px-3 py-2 font-mono border border-border rounded-lg bg-white text-ink"
                  placeholder="0001xxxxxxxx"
                />
              </div>
              <div>
                <label className="block font-medium text-ink mb-1">BPJS Ketenagakerjaan</label>
                <input
                  type="text"
                  value={formData.BPJS_ketenagakerjaan}
                  onChange={(e) => setFormData({ ...formData, BPJS_ketenagakerjaan: e.target.value })}
                  className="w-full px-3 py-2 font-mono border border-border rounded-lg bg-white text-ink"
                  placeholder="1901xxxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1.5">
              <Save className="h-4 w-4" />
              Simpan Data Karyawan
            </Button>
          </div>
        </form>

        {/* Live Camera Modal (3x4 Capture) */}
        {isCameraModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden p-4 space-y-3 animate-scale-up">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary-red" />
                  <h3 className="font-bold text-ink text-sm">Ambil Foto (Kamera Langsung 3x4)</h3>
                </div>
                <button
                  type="button"
                  onClick={stopLiveCamera}
                  className="p-1 rounded-lg hover:bg-canvas text-muted hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* 3x4 Target Box Viewfinder */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[180px] h-[240px] border-2 border-primary-yellow border-dashed rounded-lg shadow-2xl flex flex-col items-center justify-between p-2 bg-black/10">
                    <span className="bg-black/70 text-primary-yellow text-[10px] font-bold px-2 py-0.5 rounded">
                      Bingkai Pas Foto 3x4
                    </span>
                    <span className="bg-black/70 text-white text-[9px] px-2 py-0.5 rounded">
                      Posisikan wajah & bahu di dalam area
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={stopLiveCamera}>
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={captureFromLiveCamera}
                  className="gap-1.5"
                >
                  <Camera className="h-4 w-4" />
                  Jepret Foto Sekarang
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Import Excel Karyawan */}
        <EmployeeImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={() => {
            setIsImportModalOpen(false);
            if (onImportSuccess) onImportSuccess();
            else if (onClose) onClose();
          }}
          clients={allClients}
          locations={allLocations}
          initialClientId={formData.penugasan_klien}
          initialLocationId={formData.lokasi_penugasan}
        />
      </div>
    </div>
  );
}
