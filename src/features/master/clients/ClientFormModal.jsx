/**
 * Client Form Modal (Create / Edit) — PT. BARAK IOMS
 * Source of Truth: PRD Section 9 & API-SPEC Section 3.
 */

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function ClientFormModal({ isOpen, client, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Logistik',
    industry: 'Logistics & Supply Chain',
    picName: '',
    picPhone: '',
    picEmail: '',
    address: '',
    city: 'Tangerang',
    province: 'Banten',
    activeHeadcount: 10,
    monthlyBillingValue: 20000000,
    contractStart: '2024-01-01',
    contractEnd: '2026-12-31',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        type: client.type || 'Logistik',
        industry: client.industry || '',
        picName: client.picName || '',
        picPhone: client.picPhone || '',
        picEmail: client.picEmail || '',
        address: client.address || '',
        city: client.city || 'Tangerang',
        province: client.province || 'Banten',
        activeHeadcount: client.activeHeadcount || 10,
        monthlyBillingValue: client.monthlyBillingValue || 0,
        contractStart: client.contractStart || '2024-01-01',
        contractEnd: client.contractEnd || '2026-12-31',
      });
    } else {
      setFormData({
        name: '',
        type: 'Logistik',
        industry: 'Logistics & Supply Chain',
        picName: '',
        picPhone: '',
        picEmail: '',
        address: '',
        city: 'Tangerang',
        province: 'Banten',
        activeHeadcount: 10,
        monthlyBillingValue: 25000000,
        contractStart: '2024-01-01',
        contractEnd: '2026-12-31',
      });
    }
    setErrors({});
  }, [client, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama instansi/klien wajib diisi.';
    if (!formData.picName.trim()) errs.picName = 'Nama PIC wajib diisi.';
    if (!formData.picPhone.trim()) errs.picPhone = 'Nomor telepon PIC wajib diisi.';
    if (!formData.address.trim()) errs.address = 'Alamat kantor klien wajib diisi.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Mohon lengkapi kolom yang wajib diisi.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {client ? 'Ubah Data Klien Mitra' : 'Pendaftaran Klien Baru'}
            </h2>
            <p className="text-xs text-muted">
              Pencatatan Master Klien resmi untuk operasional penempatan dan penagihan invoice.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink mb-1">Nama Perusahaan / Instansi *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              placeholder="Contoh: PT. Sumber Bahagia Logistik"
            />
            {errors.name && <p className="text-error text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Kategori Klien</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Logistik">Logistik & Ekspedisi</option>
                <option value="Area">Kawasan Industri / Komersial</option>
                <option value="Drop Point">Drop Point Jaringan</option>
                <option value="Perbankan">Perbankan & Finansial</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Kota Operasional</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Nama PIC *</label>
              <input
                type="text"
                value={formData.picName}
                onChange={(e) => setFormData({ ...formData, picName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Pak Hendra"
              />
              {errors.picName && <p className="text-error text-[11px] mt-1">{errors.picName}</p>}
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Telepon PIC *</label>
              <input
                type="tel"
                value={formData.picPhone}
                onChange={(e) => setFormData({ ...formData, picPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="0812xxxxxxxx"
              />
              {errors.picPhone && <p className="text-error text-[11px] mt-1">{errors.picPhone}</p>}
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Email PIC</label>
              <input
                type="email"
                value={formData.picEmail}
                onChange={(e) => setFormData({ ...formData, picEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="pic@perusahaan.com"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">Alamat Kantor / Lokasi *</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Alamat lengkap fasilitas atau kantor klien..."
            />
            {errors.address && <p className="text-error text-[11px] mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Jumlah Personel Dibutuhkan</label>
              <input
                type="number"
                value={formData.activeHeadcount}
                onChange={(e) => setFormData({ ...formData, activeHeadcount: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Estimasi Nilai Kontrak / Bln (Rp)</label>
              <input
                type="number"
                value={formData.monthlyBillingValue}
                onChange={(e) => setFormData({ ...formData, monthlyBillingValue: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1.5">
              <Save className="h-4 w-4" />
              Simpan Data Klien
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
