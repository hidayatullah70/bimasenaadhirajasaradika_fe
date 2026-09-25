/**
 * Location Form Modal (Create / Edit) — PT. BARAK IOMS
 * Source of Truth: PRD Section 20 & API-SPEC Section 3.
 */

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MOCK_CLIENTS, MOCK_PROJECTS } from '@/services/mock/mockMasterData';
import toast from 'react-hot-toast';

export default function LocationFormModal({ isOpen, location, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    clientId: MOCK_CLIENTS[0]?.id || '',
    projectId: MOCK_PROJECTS[0]?.id || '',
    address: '',
    city: 'Tangerang',
    postalCode: '15125',
    contactPerson: '',
    contactPhone: '',
    manpowerQuota: 10,
    lat: -6.1287,
    lng: 106.6912,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        code: location.code || '',
        clientId: location.clientId || MOCK_CLIENTS[0]?.id || '',
        projectId: location.projectId || MOCK_PROJECTS[0]?.id || '',
        address: location.address || '',
        city: location.city || 'Tangerang',
        postalCode: location.postalCode || '',
        contactPerson: location.contactPerson || '',
        contactPhone: location.contactPhone || '',
        manpowerQuota: location.manpowerQuota || 10,
        lat: location.coordinates?.lat || -6.1287,
        lng: location.coordinates?.lng || 106.6912,
      });
    } else {
      setFormData({
        name: '',
        code: `LOC-${Date.now().toString().slice(-4)}`,
        clientId: MOCK_CLIENTS[0]?.id || '',
        projectId: MOCK_PROJECTS[0]?.id || '',
        address: '',
        city: 'Tangerang',
        postalCode: '15125',
        contactPerson: '',
        contactPhone: '',
        manpowerQuota: 10,
        lat: -6.1287,
        lng: 106.6912,
      });
    }
    setErrors({});
  }, [location, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama lokasi wajib diisi.';
    if (!formData.address.trim()) errs.address = 'Alamat lokasi penempatan wajib diisi.';
    if (!formData.contactPerson.trim()) errs.contactPerson = 'PIC lokasi wajib diisi.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Mohon lengkapi kolom yang wajib diisi.');
      return;
    }
    const payload = {
      ...formData,
      coordinates: { lat: parseFloat(formData.lat) || 0, lng: parseFloat(formData.lng) || 0 },
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {location ? 'Ubah Data Lokasi Penempatan' : 'Tambah Lokasi Baru'}
            </h2>
            <p className="text-xs text-muted">
              Pencatatan pos penempatan personel kerja dan kuota manpower per fasilitas klien.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink mb-1">Nama Lokasi / Pos Penempatan *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              placeholder="Contoh: Central Hub JNT Rawa Bokor"
            />
            {errors.name && <p className="text-error text-[11px] mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Klien Terkait</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {MOCK_CLIENTS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Kota</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1">Alamat Fasilitas *</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Alamat rinci pos penempatan..."
            />
            {errors.address && <p className="text-error text-[11px] mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">PIC Lokasi / Danru Pos *</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Pak Roni (Head Security)"
              />
              {errors.contactPerson && <p className="text-error text-[11px] mt-1">{errors.contactPerson}</p>}
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Telepon PIC</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="0812xxxxxxxx"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Kuota Manpower (Personel)</label>
              <input
                type="number"
                value={formData.manpowerQuota}
                onChange={(e) => setFormData({ ...formData, manpowerQuota: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
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
              Simpan Lokasi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
