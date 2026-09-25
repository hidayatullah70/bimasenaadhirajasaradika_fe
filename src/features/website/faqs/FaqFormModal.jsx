/**
 * Modal Tambah Pertanyaan Umum (FAQ) — PT. BARAK IOMS
 * Source of Truth: PRD Section 17 (CMS: FAQ Management)
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { cmsAdapter } from '@/services/adapters/cmsAdapter';

const CATEGORIES = [
  { value: 'LEGALITAS', label: 'Perizinan & Legalitas BUJP' },
  { value: 'LAYANAN', label: 'Layanan Outsourcing & Manpower' },
  { value: 'KOMERSIAL', label: 'Kontrak, Tagihan & Pembayaran' },
  { value: 'KESEJAHTERAAN', label: 'Gaji, UMR & BPJS Ketenagakerjaan' },
  { value: 'OPERASIONAL', label: 'Penugasan Posko & Tim Pengganti' },
  { value: 'TEKNOLOGI', label: 'Perangkat Barrier Gate & CCTV' },
  { value: 'LOGISTIK', label: 'Kurir Ekspedisi & Keamanan COD' },
  { value: 'KEMITRAAN', label: 'Alur Kerjasama Mitra Baru' },
];

export default function FaqFormModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'LAYANAN',
    question: '',
    answer: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Pertanyaan dan Jawaban wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const selectedCat = CATEGORIES.find((c) => c.value === formData.category);
      const res = await cmsAdapter.createFaq({
        ...formData,
        categoryLabel: selectedCat ? selectedCat.label : formData.category,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success('Pertanyaan FAQ baru berhasil ditambahkan!');
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('Gagal menyimpan FAQ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Tanya Jawab (FAQ) Baru"
      description="Tambahkan informasi panduan atau jawaban atas pertanyaan yang sering diajukan calon klien mitra."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Kategori FAQ <span className="text-primary-red">*</span>
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
            Pertanyaan (Question) <span className="text-primary-red">*</span>
          </label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            placeholder="Contoh: Apakah PT. BARAK memiliki legalitas resmi BUJP?"
            required
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Jawaban Resmi (Answer) <span className="text-primary-red">*</span>
          </label>
          <textarea
            name="answer"
            rows={4}
            value={formData.answer}
            onChange={handleChange}
            placeholder="Tuliskan jawaban yang jelas, transparan, dan mencantumkan landasan regulasi jika diperlukan..."
            required
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan FAQ'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
