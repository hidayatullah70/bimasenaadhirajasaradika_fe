/**
 * Modal Pelaporan Tiket Gangguan IT Baru — PT. BARAK IOMS
 * Source of Truth: PRD Section 16 (IT Support Module: Tickets & SLA)
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { itAdapter } from '@/services/adapters/itAdapter';

const DEPARTMENTS = [
  { value: 'OPERATIONS', label: 'Operasional Lapangan & Posko' },
  { value: 'HRD', label: 'Human Resources (HRD)' },
  { value: 'FINANCE', label: 'Keuangan & Penagihan (Finance)' },
  { value: 'LEGAL', label: 'Hukum & Kepatuhan (Legal)' },
  { value: 'MARKETING', label: 'Pemasaran & Penjualan (Marketing)' },
  { value: 'DIRECTOR', label: 'Direksi / Manajemen Puncak' },
  { value: 'INTERNAL_IT', label: 'Internal IT Support' },
];

const CATEGORIES = [
  { value: 'HARDWARE_POS', label: 'Perangkat Keras Posko / Barrier Gate / Mesin Kasir' },
  { value: 'NETWORK_CCTV', label: 'Jaringan Internet, Router & Kamera CCTV' },
  { value: 'APPLICATION_IOMS', label: 'Aplikasi Web IOMS & Fitur Sistem' },
  { value: 'USER_ACCESS', label: 'Akun Pengguna, Password & Kredensial' },
  { value: 'SYSTEM_BACKUP', label: 'Basis Data, Server & Cadangan Data' },
];

const PRIORITIES = [
  { value: 'CRITICAL', label: 'Kritis (SLA: 4 Jam - Posko Lumpuh)', desc: 'Operasional terhenti total' },
  { value: 'HIGH', label: 'Tinggi (SLA: 8 Jam - Kendala Mayor)', desc: 'Perangkat utama pos terganggu' },
  { value: 'MEDIUM', label: 'Sedang (SLA: 24 Jam - Standar)', desc: 'Kendala parsial, ada alternatif' },
  { value: 'LOW', label: 'Rendah (SLA: 48 Jam - Permintaan Umum)', desc: 'Pembaruan atau perawatan minor' },
];

const LOCATIONS = [
  'Bona City Business Park Blok A-C',
  'Central Hub JNT Rawa Bokor',
  'Salembaran 99 Warehouse Complex',
  'Pusat Niaga Glodok Jaya Baru',
  'Pergudangan Marunda Center',
  'Pusat Logistik Berikat Cikarang Dry Port',
  'Drop Point Pakojan Jakarta Barat',
  'Kantor Pusat PT. BARAK (Tangerang)',
];

export default function TicketFormModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requester: '',
    department: 'OPERATIONS',
    category: 'HARDWARE_POS',
    priority: 'HIGH',
    locationName: LOCATIONS[0],
    subject: '',
    description: '',
    assignedTo: 'Bagus Prakoso (IT Field Support)',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.requester.trim() || !formData.subject.trim() || !formData.description.trim()) {
      toast.error('Nama Pelapor, Judul Kendala, dan Rincian wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const selectedDept = DEPARTMENTS.find((d) => d.value === formData.department);
      const selectedCat = CATEGORIES.find((c) => c.value === formData.category);

      const res = await itAdapter.createTicket({
        ...formData,
        departmentLabel: selectedDept ? selectedDept.label : formData.department,
        categoryLabel: selectedCat ? selectedCat.label : formData.category,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`Tiket ${res.data.ticketNumber} berhasil didaftarkan ke sistem Helpdesk!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('Gagal membuat tiket kendala IT.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Tiket Bantuan & Kendala IT"
      description="Daftarkan laporan gangguan teknis perangkat keras posko, jaringan CCTV, atau permohonan akses sistem."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nama Lengkap Pelapor <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="requester"
              value={formData.requester}
              onChange={handleChange}
              placeholder="Contoh: Hadi Suprianto (Korlap Ops)"
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Departemen Pelapor <span className="text-primary-red">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Kategori Gangguan / Kendala <span className="text-primary-red">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Tingkat Prioritas & SLA Target <span className="text-primary-red">*</span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white font-medium"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink mb-1">
              Lokasi Posko / Unit Terkait <span className="text-primary-red">*</span>
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

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink mb-1">
              Judul Kendala (Subject) <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Contoh: Sensor Barrier Gate Pintu Keluar Tidak Merespon Tiket"
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink mb-1">
              Deskripsi Detail Kronologi Kendala <span className="text-primary-red">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan secara rinci tanda-tanda kerusakan, waktu mulai terjadi, dan dampak operasional di posko..."
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink mb-1">
              Teknisi Penanggung Jawab (Assignee)
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
            >
              <option value="Bagus Prakoso (IT Field Support)">Bagus Prakoso (IT Field Support — Hardware & Posko)</option>
              <option value="Fajar Nugroho (IT System Administrator)">Fajar Nugroho (IT System Administrator — Server & App)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            {loading ? 'Mendaftarkan...' : 'Kirim Tiket Bantuan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
