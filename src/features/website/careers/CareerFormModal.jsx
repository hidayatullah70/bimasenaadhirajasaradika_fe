/**
 * Modal Tambah & Edit Lowongan Karir — PT. BARAK IOMS
 * Source of Truth: PRD Section 17 (CMS: Careers & Job Postings)
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';

const DEPARTMENTS = [
  { value: 'OPERATIONS', label: 'Operasional Lapangan (Security, Kurir, Cleaner)' },
  { value: 'INTERNAL_IT', label: 'Teknologi Informasi & Support' },
  { value: 'HRD', label: 'Human Resources & Rekrutmen' },
  { value: 'FINANCE', label: 'Keuangan & Akuntansi' },
];

export default function CareerFormModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: 'OPERATIONS',
    employmentType: 'KONTRAK (PKWT)',
    location: 'Jabodetabek Area',
    manpowerQuota: 5,
    salaryRange: 'Standar UMR / UMK Wilayah + BPJS',
    deadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    description: '',
    requirementsText: 'WNI, usia 20-35 tahun\nMemiliki Ijazah & KTA Gada Pratama resmi Polri\nBebas narkoba dan berkelakuan baik\nBersedia sistem shift 3 regu',
    status: 'PUBLISHED',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Judul Posisi dan Deskripsi Pekerjaan wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const selectedDept = DEPARTMENTS.find((d) => d.value === formData.department);
      const reqList = formData.requirementsText
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const res = await cmsAdapter.createCareer({
        ...formData,
        departmentLabel: selectedDept ? selectedDept.label : formData.department,
        requirements: reqList,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(`Lowongan ${res.data.title} berhasil diterbitkan ke portal karir!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('Gagal menerbitkan lowongan kerja.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buka Lowongan Kerja Baru"
      description="Daftarkan lowongan rekrutmen personel satpam, kurir, atau staf operasional ke portal publik www.barak.co.id/career."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink mb-1">
              Nama Posisi / Pekerjaan <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Anggota Satpam Kualifikasi Gada Pratama"
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Departemen Penempatan <span className="text-primary-red">*</span>
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
              Jenis Ikatan Kerja
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
            >
              <option value="KONTRAK (PKWT)">KONTRAK (PKWT)</option>
              <option value="TETAP (PKWTT)">TETAP (PKWTT)</option>
              <option value="MAGANG / OJT">MAGANG / OJT</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Lokasi Penempatan Kerja
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Contoh: Cikarang, Bekasi & Tangerang"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Kuota Kebutuhan Personel (Orang)
            </label>
            <input
              type="number"
              name="manpowerQuota"
              min="1"
              value={formData.manpowerQuota}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Estimasi Rentang Gaji / Benefit
            </label>
            <input
              type="text"
              name="salaryRange"
              value={formData.salaryRange}
              onChange={handleChange}
              placeholder="Contoh: Rp 5.200.000 - Rp 5.600.000 / bln"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Batas Waktu Lamaran (Deadline)
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink mb-1">
              Deskripsi Pekerjaan & Tanggung Jawab <span className="text-primary-red">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan peran utama dan tugas harian yang akan dijalankan pelamar di posko..."
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-ink mb-1">
              Persyaratan & Kualifikasi (Pisahkan dengan baris baru)
            </label>
            <textarea
              name="requirementsText"
              rows={4}
              value={formData.requirementsText}
              onChange={handleChange}
              placeholder="Masukkan 1 persyaratan per baris..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red font-mono text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Terbitkan Lowongan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
