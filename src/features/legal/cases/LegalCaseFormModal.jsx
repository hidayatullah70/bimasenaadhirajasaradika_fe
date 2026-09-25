/**
 * Legal Case Form Modal — PT. BARAK IOMS
 * Register new legal case / dispute.
 * Source of Truth: PRD Section 12.4 (Legal Case) & Section 22.
 */

import React, { useState } from 'react';
import { Scale, X, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LegalCaseFormModal({ isOpen, onClose, clients, onSubmit }) {
  const [formData, setFormData] = useState({
    caseType: 'COD_DISPUTE',
    caseTypeLabel: 'Sengketa Setoran COD & Pelanggaran Perjanjian',
    sourceDepartment: 'FINANCE',
    subject: '',
    targetEntity: '',
    clientId: '',
    incidentDate: new Date().toISOString().slice(0, 10),
    financialImpact: '',
    priority: 'HIGH',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    assignedLegal: 'Farhan Maulana (Legal Officer)',
    chronology: '',
    evidenceText: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'caseType') {
      const labels = {
        COD_DISPUTE: 'Sengketa Setoran COD & Pelanggaran Perjanjian',
        CRIMINAL_ATTEMPT: 'Percobaan Tindak Pidana Pencurian / Perusakan Aset',
        EMPLOYMENT_MISCONDUCT: 'Pelanggaran Disiplin Berat & Penerbitan SP',
        CIVIL_DISPUTE: 'Klaim Ganti Rugi Perdata / Kerusakan Fasilitas',
        COMPLIANCE_FRAUD: 'Dugaan Pemalsuan Dokumen Sertifikat Kualifikasi',
        ASSET_DISPUTE: 'Sengketa Kehilangan Inventaris Pos Penjagaan',
      };
      setFormData((prev) => ({ ...prev, caseType: value, caseTypeLabel: labels[value] || value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.targetEntity.trim() || !formData.chronology.trim()) {
      setError('Subjek perkara, Pihak terlapor, dan Kronologi kejadian wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const client = clients.find((c) => c.id === formData.clientId);
      const evidenceList = formData.evidenceText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      await onSubmit({
        ...formData,
        clientName: client ? client.name : 'Umum / Internal',
        financialImpact: Number(formData.financialImpact) || 0,
        evidence: evidenceList.length > 0 ? evidenceList : ['Dokumen laporan awal'],
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Gagal mendaftarkan kasus legal baru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-border overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border flex items-center justify-between bg-primary-red/5 flex-none">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary-red/10 text-primary-red">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Buka Berkas Perkara Hukum Baru</h3>
              <p className="text-xs text-muted">Pencatatan sengketa, pelimpahan COD, atau pelanggaran hukum operasional</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs bg-primary-red/10 text-primary-red rounded-lg border border-primary-red/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Subjek / Perihal Kasus <span className="text-primary-red">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Contoh: Pelimpahan Kasus Selisih Akumulasi Uang COD Kurir..."
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Kategori Kasus <span className="text-primary-red">*</span>
              </label>
              <select
                name="caseType"
                value={formData.caseType}
                onChange={handleChange}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="COD_DISPUTE">Sengketa Setoran COD Kurir</option>
                <option value="CRIMINAL_ATTEMPT">Percobaan Pidana / Perusakan Aset</option>
                <option value="EMPLOYMENT_MISCONDUCT">Pelanggaran Disiplin Berat (SP)</option>
                <option value="CIVIL_DISPUTE">Klaim Ganti Rugi Perdata</option>
                <option value="COMPLIANCE_FRAUD">Dugaan Pemalsuan Dokumen</option>
                <option value="ASSET_DISPUTE">Sengketa Inventaris Pos Jaga</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Asal Departemen Pelimpahan <span className="text-primary-red">*</span>
              </label>
              <select
                name="sourceDepartment"
                value={formData.sourceDepartment}
                onChange={handleChange}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="FINANCE">Divisi Finance (Kasus COD / Piutang)</option>
                <option value="OPERATIONS">Divisi Operasional (Insiden Lapangan)</option>
                <option value="HRD">Divisi HRD (Pelanggaran Karyawan)</option>
                <option value="DIRECTOR">Direktur Utama</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Pihak Terlapor / Terkait <span className="text-primary-red">*</span>
              </label>
              <input
                type="text"
                name="targetEntity"
                value={formData.targetEntity}
                onChange={handleChange}
                placeholder="Nama kurir / oknum / vendor terlapor"
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Klien Terkait
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Pilih Klien (Opsional)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Estimasi Dampak Finansial (Rp)
              </label>
              <input
                type="number"
                name="financialImpact"
                value={formData.financialImpact}
                onChange={handleChange}
                placeholder="Contoh: 2950000"
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Tingkat Prioritas <span className="text-primary-red">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH (Penting)</option>
                <option value="URGENT">URGENT (Mendesak)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Tenggat Waktu Selesai (Deadline)
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Kronologi & Latar Belakang Perkara <span className="text-primary-red">*</span>
            </label>
            <textarea
              rows={3}
              name="chronology"
              value={formData.chronology}
              onChange={handleChange}
              placeholder="Uraikan fakta kejadian secara objektif tanpa praduga pidana sebelum ada bukti sah..."
              className="w-full text-xs border border-border rounded-lg p-2.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Daftar Alat Bukti Awal (Satu baris per bukti)
            </label>
            <textarea
              rows={2}
              name="evidenceText"
              value={formData.evidenceText}
              onChange={handleChange}
              placeholder="Contoh:&#10;Manifest Pengantaran Paket JNT&#10;Surat PKWT Kurir&#10;BAP Lapangan"
              className="w-full text-xs border border-border rounded-lg p-2.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Daftarkan Kasus Hukum</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
