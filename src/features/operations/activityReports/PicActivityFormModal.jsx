/**
 * PIC Activity Report Form Modal — PT. BARAK IOMS
 * Form Laporan Kegiatan Lapangan oleh Koordinator Lapangan (PIC 1 - PIC 8).
 * Features automatic 16:9 image aspect ratio cropping & resizing.
 */

import React, { useState, useRef } from 'react';
import {
  ClipboardCheck, X, Upload, Camera, Send, Loader2,
  MapPin, Building2, UserCheck, AlertCircle, Trash2, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PIC_LIST, VISIT_REGIONS } from '@/services/mock/mockPicActivityData';
import { MOCK_LOCATIONS } from '@/services/mock/mockMasterData';
import { resizeImageTo16x9 } from '@/utils/imageResize';
import picActivityReportAdapter from '@/services/adapters/picActivityReportAdapter';
import toast from 'react-hot-toast';

export default function PicActivityFormModal({ isOpen, onClose, onSuccess }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    picName: PIC_LIST[0],
    lokasiKunjungan: VISIT_REGIONS[0],
    namaLokasi: '',
    tanggalKunjungan: new Date().toISOString().slice(0, 10),
    jamKunjungan: new Date().toTimeString().slice(0, 5),
    isiKegiatan: '',
  });

  const [photoData, setPhotoData] = useState(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle image upload and 16:9 resizing
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);
    try {
      // Auto-resize and center-crop to exact 16:9
      const result = await resizeImageTo16x9(file, 1280);
      setPhotoData(result);
      if (errors.fotoKunjungan) {
        setErrors((prev) => ({ ...prev, fotoKunjungan: null }));
      }
      toast.success('Foto berhasil diproses ke format 16:9 HD!');
    } catch (err) {
      toast.error(err.message || 'Gagal memproses foto kunjungan.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhotoData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.picName) newErrors.picName = 'Pilih Nama PIC';
    if (!formData.lokasiKunjungan) newErrors.lokasiKunjungan = 'Pilih Wilayah Kunjungan';
    if (!formData.namaLokasi.trim()) newErrors.namaLokasi = 'Nama Lokasi wajib diisi';
    if (!photoData?.dataUrl) newErrors.fotoKunjungan = 'Foto Kunjungan (16:9) wajib diunggah';
    if (!formData.isiKegiatan.trim()) {
      newErrors.isiKegiatan = 'Isi Kegiatan Kunjungan wajib diisi';
    } else if (formData.isiKegiatan.trim().length < 15) {
      newErrors.isiKegiatan = 'Uraian kegiatan minimal 15 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon lengkapi semua field dan upload foto kunjungan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        fotoKunjungan: photoData.dataUrl,
        fotoMeta: {
          ratio: '16:9',
          width: photoData.width,
          height: photoData.height,
          originalName: photoData.originalName,
          sizeKb: photoData.sizeKb,
        },
      };

      const res = await picActivityReportAdapter.createReport(payload);
      if (res.data) {
        toast.success(`Laporan Kegiatan (${formData.picName}) berhasil dikirim ke Operasional!`);
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        toast.error(res.error?.message || 'Gagal mengirim laporan.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat mengirim laporan kegiatan.');
    } finally {
      setIsSubmitting(false);
    }
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
              <h2 className="text-base font-bold text-ink">Form Laporan Kegiatan Lapangan</h2>
              <p className="text-xs text-muted">
                Pencatatan supervisi pos dan kunjungan berkala Koordinator Lapangan (PIC)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* 1. Nama PIC (Dropdown PIC 1 - PIC 8) */}
          <div>
            <label htmlFor="picName" className="font-bold text-ink flex items-center gap-1 mb-1.5">
              <UserCheck className="h-3.5 w-3.5 text-primary-red" />
              <span>1. Nama PIC (Koordinator Lapangan)</span>
              <span className="text-error font-bold">*</span>
            </label>
            <select
              id="picName"
              name="picName"
              value={formData.picName}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-ink text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
            >
              {PIC_LIST.map((pic) => (
                <option key={pic} value={pic}>
                  {pic} — Koordinator Lapangan PT. BARAK
                </option>
              ))}
            </select>
            {errors.picName && <p className="text-error mt-1">{errors.picName}</p>}
          </div>

          {/* Tanggal & Jam Kunjungan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="tanggalKunjungan" className="font-bold text-ink block mb-1">
                Tanggal Kunjungan Lapangan *
              </label>
              <input
                id="tanggalKunjungan"
                type="date"
                name="tanggalKunjungan"
                value={formData.tanggalKunjungan}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>
            <div>
              <label htmlFor="jamKunjungan" className="font-bold text-ink block mb-1">
                Waktu Kunjungan (Jam) *
              </label>
              <input
                id="jamKunjungan"
                type="time"
                name="jamKunjungan"
                value={formData.jamKunjungan}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-lg border border-border bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>
          </div>

          {/* 2. Lokasi Kunjungan & 3. Nama Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="lokasiKunjungan" className="font-bold text-ink flex items-center gap-1 mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary-red" />
                <span>2. Lokasi Kunjungan (Wilayah/Area)</span>
                <span className="text-error font-bold">*</span>
              </label>
              <select
                id="lokasiKunjungan"
                name="lokasiKunjungan"
                value={formData.lokasiKunjungan}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              >
                {VISIT_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              {errors.lokasiKunjungan && <p className="text-error mt-1">{errors.lokasiKunjungan}</p>}
            </div>

            <div>
              <label htmlFor="namaLokasi" className="font-bold text-ink flex items-center gap-1 mb-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary-red" />
                <span>3. Nama Lokasi (Pos / Site / Klien)</span>
                <span className="text-error font-bold">*</span>
              </label>
              <input
                id="namaLokasi"
                type="text"
                name="namaLokasi"
                list="list-lokasi-master"
                value={formData.namaLokasi}
                onChange={handleChange}
                placeholder="Contoh: Central Hub JNT Rawa Bokor..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
              <datalist id="list-lokasi-master">
                {MOCK_LOCATIONS.map((l) => (
                  <option key={l.id} value={l.name} />
                ))}
              </datalist>
              {errors.namaLokasi && <p className="text-error mt-1">{errors.namaLokasi}</p>}
            </div>
          </div>

          {/* 4. Upload Foto Kunjungan (Auto 16:9 Resize) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-ink flex items-center gap-1">
                <Camera className="h-3.5 w-3.5 text-primary-red" />
                <span>4. Upload Foto Kunjungan</span>
                <span className="text-error font-bold">*</span>
              </label>
              <span className="text-[11px] font-semibold text-primary-red bg-primary-red/10 px-2 py-0.5 rounded-full border border-primary-red/20">
                Auto Resize 16:9 HD
              </span>
            </div>

            {!photoData ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                  errors.fotoKunjungan
                    ? 'border-error bg-red-50/20'
                    : 'border-border hover:border-primary-red bg-canvas/30 hover:bg-canvas'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                {isProcessingPhoto ? (
                  <div className="py-3 flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-red" />
                    <span className="font-medium text-ink">Mengompresi dan memotong foto ke rasio 16:9...</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-7 w-7 text-muted mx-auto mb-1.5" />
                    <p className="font-semibold text-ink">
                      Klik untuk ambil / pilih foto kunjungan lapangan
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Foto dari device akan otomatis dipotong & di-resize ke format landscape <strong>16:9</strong>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-border bg-black aspect-video group">
                  <img
                    src={photoData.dataUrl}
                    alt="Foto Kunjungan 16:9"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                    <span>RASIO 16:9 HD ({photoData.width} × {photoData.height})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-700 text-white transition-colors"
                    title="Hapus / ganti foto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted px-1">
                  <span>File Asli: {photoData.originalName} ({photoData.originalWidth}×{photoData.originalHeight})</span>
                  <span className="text-accent-green font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Terkompresi {photoData.sizeKb} KB
                  </span>
                </div>
              </div>
            )}
            {errors.fotoKunjungan && <p className="text-error mt-1">{errors.fotoKunjungan}</p>}
          </div>

          {/* 5. Isi Kegiatan Kunjungan (Laporan Kegiatan) */}
          <div>
            <label htmlFor="isiKegiatan" className="font-bold text-ink flex items-center gap-1 mb-1.5">
              <ClipboardCheck className="h-3.5 w-3.5 text-primary-red" />
              <span>5. Isi Kegiatan Kunjungan (Laporan Kegiatan)</span>
              <span className="text-error font-bold">*</span>
            </label>
            <textarea
              id="isiKegiatan"
              name="isiKegiatan"
              rows={4}
              value={formData.isiKegiatan}
              onChange={handleChange}
              placeholder="Uraikan detail hasil kunjungan: inspeksi kerapian seragam, pengecekan personil shift, logbook pos jaga, pengujian APAR/CCTV, koordinasi klien, dan catatan khusus..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-ink text-xs focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red resize-y"
            />
            {errors.isiKegiatan && <p className="text-error mt-1">{errors.isiKegiatan}</p>}
          </div>

          {/* Footer Action */}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting || isProcessingPhoto}
              className="gap-2 bg-primary-red hover:bg-red-800"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim Laporan...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Kirim Laporan ke Operasional</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
