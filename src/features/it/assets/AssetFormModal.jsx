/**
 * Modal Registrasi Aset IT Posko Baru — PT. BARAK IOMS
 * Source of Truth: PRD Section 16 (IT Support Module: Assets Management)
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { itAdapter } from '@/services/adapters/itAdapter';

const ASSET_TYPES = [
  { value: 'BARRIER_GATE', label: 'Sistem Barrier Gate & Palang Parkir' },
  { value: 'CCTV_SYSTEM', label: 'Sistem CCTV & Kamera Surveilans' },
  { value: 'BIOMETRIC_FINGERPRINT', label: 'Mesin Absensi Biometrik Fingerprint' },
  { value: 'POS_COMPUTER', label: 'Komputer Posko / Kasir Parkir' },
  { value: 'NETWORK_ROUTER', label: 'Router Jaringan, Switch & Access Point' },
  { value: 'BACKUP_SERVER', label: 'Server Basis Data & Cadangan' },
  { value: 'HARDWARE_POS', label: 'Perangkat Posko Lainnya (HT, UPS)' },
];

const LOCATIONS = [
  'Bona City Business Park Blok A-C',
  'Central Hub JNT Rawa Bokor',
  'Salembaran 99 Warehouse Complex',
  'Pusat Niaga Glodok Jaya Baru',
  'Pergudangan Marunda Center',
  'Pusat Logistik Berikat Cikarang Dry Port',
  'Drop Point Pakojan Jakarta Barat',
  'Data Center Server Room',
  'Kantor Pusat PT. BARAK (Tangerang)',
];

export default function AssetFormModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    assetName: '',
    assetType: 'BARRIER_GATE',
    serialNumber: '',
    locationName: LOCATIONS[0],
    department: 'OPERATIONS',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: new Date(Date.now() + 730 * 86400000).toISOString().split('T')[0],
    condition: 'Baik / Baru Diinstalasi',
    pic: 'Bagus Prakoso (IT Support)',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.assetName.trim() || !formData.serialNumber.trim()) {
      toast.error('Nama Perangkat dan Nomor Seri (Serial Number) wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const selectedType = ASSET_TYPES.find((t) => t.value === formData.assetType);
      const res = await itAdapter.createAsset({
        ...formData,
        assetTypeLabel: selectedType ? selectedType.label : formData.assetType,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`Aset ${res.data.assetCode} (${res.data.assetName}) berhasil didaftarkan!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('Gagal meregistrasi aset IT.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrasi Aset & Perangkat IT Posko Baru"
      description="Daftarkan perangkat keras operasional (Barrier Gate, CCTV, Mesin Absensi, Komputer) ke sistem inventarisasi PT. BARAK."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nama Perangkat / Brand Model <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
              placeholder="Contoh: Automatic Barrier Gate MX-50"
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Jenis / Kategori Perangkat <span className="text-primary-red">*</span>
            </label>
            <select
              name="assetType"
              value={formData.assetType}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
            >
              {ASSET_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nomor Seri Pabrik (Serial Number) <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              placeholder="Contoh: MX50-SN-882910-ID"
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Lokasi Posko Penempatan <span className="text-primary-red">*</span>
            </label>
            <select
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Tanggal Pembelian
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Masa Garansi Berakhir
            </label>
            <input
              type="date"
              name="warrantyExpiry"
              value={formData.warrantyExpiry}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Kondisi Fisik / Teknis
            </label>
            <input
              type="text"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              placeholder="Contoh: Baik / Beroperasi Optimal"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              PIC Pengawas Lapangan
            </label>
            <input
              type="text"
              name="pic"
              value={formData.pic}
              onChange={handleChange}
              placeholder="Contoh: Hadi Suprianto (Korlap)"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink mb-1">
              Catatan Teknis / Konfigurasi Khusus
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Spesifikasi tambahan, IP address perangkat, atau riwayat uji fungsi..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            {loading ? 'Mendaftarkan...' : 'Registrasi Aset'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
