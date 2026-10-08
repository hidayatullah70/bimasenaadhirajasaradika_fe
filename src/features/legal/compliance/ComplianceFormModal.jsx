/**
 * Compliance Form Modal — PT. BARAK IOMS
 * Source of Truth: PRD Section 12.3 (Compliance & SIO BUJP Register).
 *
 * Supports:
 * - Create new compliance / SIO license document
 * - Update existing license document
 */

import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Building, Calendar, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import legalAdapter from '@/services/adapters/legalAdapter';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS = [
  { value: 'PERIZINAN_UTAMA', label: 'Perizinan Utama (Mabes Polri BUJP)' },
  { value: 'PERIZINAN_WILAYAH', label: 'Perizinan Wilayah (Polda)' },
  { value: 'K3_DAN_KESELAMATAN', label: 'K3 & Keselamatan Kerja (Kemnaker)' },
  { value: 'MANAJEMEN_MUTU', label: 'Manajemen Mutu (ISO / TUV)' },
  { value: 'PERIZINAN_LOGISTIK', label: 'Transportasi & Logistik (NIB OSS)' },
  { value: 'KETENAGAKERJAAN', label: 'Ketenagakerjaan (BPJS / Disnaker)' },
  { value: 'PERIZINAN_LAINNYA', label: 'Perizinan / Legalitas Lainnya' },
];

const STATUS_OPTIONS = [
  { value: 'COMPLIANT', label: 'Patuh & Berlaku Sah (Compliant)' },
  { value: 'ATTENTION_NEEDED', label: 'Perlu Perhatian / Pembaruan (Attention Needed)' },
  { value: 'EXPIRED', label: 'Kadaluwarsa (Expired)' },
];

const AUDIT_FREQUENCY_OPTIONS = [
  'Tahunan',
  '3 Tahun Sekali',
  'Tahunan (Surveillance)',
  'Pelaporan LKPM Semesteran',
  'Bulanan',
  'Insidental',
];

export default function ComplianceFormModal({ isOpen, initialData, onClose, onSuccess }) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    licenseName: '',
    issuingAuthority: '',
    licenseNumber: '',
    category: 'PERIZINAN_UTAMA',
    validFrom: '',
    validUntil: '',
    status: 'COMPLIANT',
    auditFrequency: 'Tahunan',
    lastAuditDate: '',
    remarks: '',
    attachmentName: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        licenseName: initialData.licenseName || '',
        issuingAuthority: initialData.issuingAuthority || '',
        licenseNumber: initialData.licenseNumber || '',
        category: initialData.category || 'PERIZINAN_UTAMA',
        validFrom: initialData.validFrom || '',
        validUntil: initialData.validUntil || '',
        status: initialData.status || 'COMPLIANT',
        auditFrequency: initialData.auditFrequency || 'Tahunan',
        lastAuditDate: initialData.lastAuditDate || '',
        remarks: initialData.remarks || '',
        attachmentName: initialData.attachmentName || '',
      });
    } else {
      setFormData({
        licenseName: '',
        issuingAuthority: '',
        licenseNumber: '',
        category: 'PERIZINAN_UTAMA',
        validFrom: new Date().toISOString().slice(0, 10),
        validUntil: '',
        status: 'COMPLIANT',
        auditFrequency: 'Tahunan',
        lastAuditDate: '',
        remarks: '',
        attachmentName: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.licenseName.trim() || !formData.licenseNumber.trim() || !formData.issuingAuthority.trim()) {
      toast.error('Mohon lengkapi Nama Dokumen, Nomor Izin, dan Instansi Penerbit.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await legalAdapter.updateComplianceItem(initialData.id, formData);
        toast.success(`Dokumen perizinan "${formData.licenseName}" berhasil diperbarui.`);
      } else {
        await legalAdapter.createComplianceItem(formData);
        toast.success(`Dokumen perizinan "${formData.licenseName}" berhasil ditambahkan.`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan dokumen perizinan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-scale-up border border-border">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-red/10 text-primary-red flex items-center justify-center flex-none">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink">
                {isEdit ? 'Perbarui Dokumen Perizinan / SIO' : 'Tambah Dokumen Perizinan / SIO Baru'}
              </h2>
              <p className="text-xs text-muted">
                {isEdit
                  ? `ID: ${initialData.id} — Register Kepatuhan Hukum & Operasional`
                  : 'Registrasi legalitas operasional BUJP & sertifikasi standar'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
          {/* License Name */}
          <div className="space-y-1">
            <label className="font-semibold text-ink">
              Nama Dokumen Perizinan / Sertifikasi <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="licenseName"
              required
              value={formData.licenseName}
              onChange={handleChange}
              placeholder="Contoh: Surat Izin Operasional Badan Usaha Jasa Pengamanan (SIO BUJP)"
              className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* License Number */}
            <div className="space-y-1">
              <label className="font-semibold text-ink">
                Nomor Surat / Sertifikat / Izin <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="licenseNumber"
                required
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="Contoh: SIO/BUJP/POLRI/2026/0912"
                className="w-full px-3 py-2 font-mono border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs"
              />
            </div>

            {/* Issuing Authority */}
            <div className="space-y-1">
              <label className="font-semibold text-ink">
                Instansi Penerbit / Lembaga <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="issuingAuthority"
                required
                value={formData.issuingAuthority}
                onChange={handleChange}
                placeholder="Contoh: Mabes Polri (Baharkam)"
                className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div className="space-y-1">
              <label className="font-semibold text-ink">Kategori Dokumen</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs bg-white"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="font-semibold text-ink">Status Kepatuhan</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs bg-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Valid From */}
            <div className="space-y-1">
              <label className="font-semibold text-ink">Tanggal Terbit / Berlaku</label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs bg-white"
              />
            </div>

            {/* Valid Until */}
            <div className="space-y-1">
              <label className="font-semibold text-ink">
                Masa Berlaku / Jatuh Tempo
              </label>
              <input
                type="text"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                placeholder="YYYY-MM-DD atau 'Seumur Hidup / Berlaku Efektif'"
                className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Audit Frequency */}
            <div className="space-y-1">
              <label className="font-semibold text-ink">Frekuensi Audit / Pelaporan</label>
              <select
                name="auditFrequency"
                value={formData.auditFrequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs bg-white"
              >
                {AUDIT_FREQUENCY_OPTIONS.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>

            {/* Last Audit Date */}
            <div className="space-y-1">
              <label className="font-semibold text-ink">Tanggal Audit Terakhir</label>
              <input
                type="date"
                name="lastAuditDate"
                value={formData.lastAuditDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs bg-white"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <label className="font-semibold text-ink">Catatan Kepatuhan & Ruang Lingkup</label>
            <textarea
              name="remarks"
              rows={3}
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Rincian ruang lingkup wilayah izin, catatan temuan surveillance, atau instruksi perpanjangan..."
              className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
              className="text-xs gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{isEdit ? 'Simpan Perubahan' : 'Tambahkan Dokumen Izin'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
