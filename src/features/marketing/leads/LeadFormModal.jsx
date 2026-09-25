/**
 * Modal Tambah Lead Baru — PT. BARAK IOMS
 * Source of Truth: PRD Section 15 (Marketing Module: Leads Management)
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { marketingAdapter } from '@/services/adapters/marketingAdapter';
import { STATUS } from '@/constants/status';

const SOURCE_OPTIONS = [
  { value: 'WEBSITE', label: 'Inquiry Website BARAK' },
  { value: 'REFERRAL', label: 'Rekomendasi / Relasi Klien' },
  { value: 'OUTBOUND', label: 'Kanvasing & Outbound Tim Sales' },
  { value: 'EVENT', label: 'Pameran / Business Expo' },
  { value: 'TENDER_RFP', label: 'Tender Terbuka / RFP Resmi' },
];

const SERVICE_OPTIONS = [
  'Jasa Pengamanan (Security)',
  'Pengelolaan Parkir & Valet',
  'Jasa Tenaga Kerja (Labor Supply)',
  'Jasa Kebersihan (Cleaning Service)',
  'Ekspedisi Kurir & Pengamanan',
  'Loss Prevention & Security',
  'Manpower Pabrik / Operator',
  'Security & VIP Protocol',
];

const SALES_REPS = [
  'Reza Pratama (Sales Rep)',
  'Maya Anggraini (Account Executive)',
  'Dimas Setiawan (Business Development)',
];

export default function LeadFormModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    picName: '',
    phone: '',
    email: '',
    source: 'WEBSITE',
    serviceInterest: 'Jasa Pengamanan (Security)',
    estimatedManpower: 6,
    locationCity: 'Jakarta',
    assignedSales: 'Reza Pratama (Sales Rep)',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.picName || !formData.phone) {
      toast.error('Perusahaan, Nama PIC, dan No. Telepon wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const selectedSource = SOURCE_OPTIONS.find((s) => s.value === formData.source);
      const res = await marketingAdapter.createLead({
        ...formData,
        sourceLabel: selectedSource ? selectedSource.label : formData.source,
        status: STATUS.NEW,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`Lead ${res.data.leadNumber} berhasil ditambahkan!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan data lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Lead / Prospek Baru"
      description="Daftarkan entitas calon klien potensial ke dalam basis data sales & marketing PT. BARAK."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nama Perusahaan / Kawasan <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Contoh: PT. Cikarang Logistic Park"
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nama PIC Klien <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="picName"
              value={formData.picName}
              onChange={handleChange}
              placeholder="Contoh: Bapak Rudi Hermawan"
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              No. Telepon / WhatsApp <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Contoh: 0812-8821-9920"
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Email Resmi PIC
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Contoh: rudi.hermawan@perusahaan.co.id"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Sumber Prospek (Lead Source) <span className="text-primary-red">*</span>
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Layanan yang Diminati <span className="text-primary-red">*</span>
            </label>
            <select
              name="serviceInterest"
              value={formData.serviceInterest}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
            >
              {SERVICE_OPTIONS.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Estimasi Manpower (Personel)
            </label>
            <input
              type="number"
              name="estimatedManpower"
              min="1"
              value={formData.estimatedManpower}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Lokasi / Kota Target
            </label>
            <input
              type="text"
              name="locationCity"
              value={formData.locationCity}
              onChange={handleChange}
              placeholder="Contoh: Cikarang, Bekasi / Tangerang"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink mb-1">
              Sales Representative PIC
            </label>
            <select
              name="assignedSales"
              value={formData.assignedSales}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
            >
              {SALES_REPS.map((rep) => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink mb-1">
              Catatan / Latar Belakang Kebutuhan
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Catatan tambahan mengenai luas area, kendala di pengelola lama, atau waktu pertemuan..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
