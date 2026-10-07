/**
 * Contract Form Modal (Create / Edit) — PT. BARAK IOMS
 * Source of Truth: PRD Section 12.2 (Contract & Agreement).
 */

import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Building2, Calendar, DollarSign, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { STATUS } from '@/constants/status';
import { EMPLOYEE_SERVICE_TYPES } from '@/constants/business';
import toast from 'react-hot-toast';

export default function ContractFormModal({ isOpen, contract, clients = [], onClose, onSave }) {
  const [formData, setFormData] = useState({
    contractNumber: '',
    title: '',
    clientId: '',
    clientName: '',
    serviceType: 'Jasa Pengamanan (Security Guard)',
    manpowerQuota: 4,
    startDate: '',
    endDate: '',
    monthlyValue: 25000000,
    status: STATUS.ACTIVE,
    slaTerms: '',
    picLegalClient: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (contract) {
      setFormData({
        contractNumber: contract.contractNumber || '',
        title: contract.title || '',
        clientId: contract.clientId || (clients[0]?.id || ''),
        clientName: contract.clientName || (clients[0]?.name || ''),
        serviceType: contract.serviceType || 'Jasa Pengamanan (Security Guard)',
        manpowerQuota: contract.manpowerQuota || 4,
        startDate: contract.startDate || '',
        endDate: contract.endDate || '',
        monthlyValue: contract.monthlyValue || 0,
        status: contract.status || STATUS.ACTIVE,
        slaTerms: contract.slaTerms || '',
        picLegalClient: contract.picLegalClient || '',
        notes: contract.notes || '',
      });
    } else {
      const defaultClient = clients[0] || null;
      const now = new Date();
      const currentYear = now.getFullYear();
      const nextYear = currentYear + 1;
      const todayStr = now.toISOString().split('T')[0];
      const nextYearStr = `${nextYear}-${todayStr.slice(5)}`;
      const randomSeq = String(Math.floor(Math.random() * 900) + 100);

      const clientCode = defaultClient?.name
        ? defaultClient.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase()
        : 'CLI';

      setFormData({
        contractNumber: `PKS/BARAK-${clientCode}/${currentYear}/${todayStr.slice(5, 7)}/${randomSeq}`,
        title: defaultClient ? `Perjanjian Kerjasama Pengadaan Jasa Pengamanan ${defaultClient.name}` : '',
        clientId: defaultClient?.id || '',
        clientName: defaultClient?.name || '',
        serviceType: 'Jasa Pengamanan (Security Guard)',
        manpowerQuota: 6,
        startDate: todayStr,
        endDate: nextYearStr,
        monthlyValue: 36000000,
        status: STATUS.ACTIVE,
        slaTerms: 'Kesiapan personel 100%, seragam lengkap PDL/PDH, pergantian personel sakit maksimal 4 jam.',
        picLegalClient: defaultClient?.picName ? `${defaultClient.picName} (Legal Dept)` : '',
        notes: '',
      });
    }
    setErrors({});
  }, [contract, isOpen, clients]);

  if (!isOpen) return null;

  const handleClientChange = (e) => {
    const selectedId = e.target.value;
    const found = clients.find((c) => c.id === selectedId);
    if (!found) return;

    const clientCode = found.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
    const currentYear = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const randomSeq = String(Math.floor(Math.random() * 900) + 100);

    setFormData((prev) => ({
      ...prev,
      clientId: found.id,
      clientName: found.name,
      contractNumber: !contract
        ? `PKS/BARAK-${clientCode}/${currentYear}/${month}/${randomSeq}`
        : prev.contractNumber,
      title: !contract && !prev.title
        ? `Perjanjian Kerjasama Penyediaan Tenaga Kerja ${found.name}`
        : prev.title,
      picLegalClient: !contract && !prev.picLegalClient && found.picName
        ? `${found.picName} (Legal Dept)`
        : prev.picLegalClient,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.contractNumber.trim()) errs.contractNumber = 'Nomor PKS wajib diisi.';
    if (!formData.clientId) errs.clientId = 'Klien mitra wajib dipilih.';
    if (!formData.title.trim()) errs.title = 'Judul kontrak/perjanjian wajib diisi.';
    if (!formData.serviceType.trim()) errs.serviceType = 'Jenis layanan wajib diisi.';
    if (!formData.startDate) errs.startDate = 'Tanggal mulai berlaku wajib diisi.';
    if (!formData.endDate) errs.endDate = 'Tanggal berakhir berlaku wajib diisi.';
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errs.endDate = 'Tanggal berakhir tidak boleh mendahului tanggal mulai.';
    }
    if (Number(formData.monthlyValue) <= 0) {
      errs.monthlyValue = 'Nilai kontrak per bulan harus lebih besar dari Rp 0.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Mohon lengkapi seluruh kolom yang wajib diisi.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-canvas/40">
          <div>
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-red" />
              <span>{contract ? 'Ubah Dokumen Kontrak PKS' : 'Registrasi Kontrak PKS Baru'}</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Pencatatan Perjanjian Kerjasama resmi antara PT. Bimasena Adhirajasa Radika dan Klien Mitra.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {/* Baris 1: Klien & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-muted" />
                <span>Klien Mitra *</span>
              </label>
              <select
                value={formData.clientId}
                onChange={handleClientChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-ink ${
                  errors.clientId ? 'border-error ring-1 ring-error/30' : 'border-border'
                }`}
              >
                <option value="">Pilih Klien Mitra...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="text-error text-[11px] mt-1">{errors.clientId}</p>}
            </div>

            <div>
              <label className="block font-medium text-ink mb-1 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-muted" />
                <span>Status Kontrak PKS *</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
              >
                <option value={STATUS.ACTIVE}>ACTIVE (Aktif Berlaku)</option>
                <option value={STATUS.EXPIRING}>EXPIRING (Mendekati Berakhir &lt; 60 Hari)</option>
                <option value="LEGAL_REVIEW">LEGAL_REVIEW (Penyusunan Draf / Review)</option>
                <option value={STATUS.EXPIRED}>EXPIRED (Kedaluwarsa)</option>
              </select>
            </div>
          </div>

          {/* Baris 2: Nomor Kontrak & Judul */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1">Nomor PKS Resmi *</label>
              <input
                type="text"
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-ink font-mono ${
                  errors.contractNumber ? 'border-error ring-1 ring-error/30' : 'border-border'
                }`}
                placeholder="PKS/BARAK-CLI/2026/10/01"
              />
              {errors.contractNumber && <p className="text-error text-[11px] mt-1">{errors.contractNumber}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-ink mb-1">Judul Perjanjian / Pekerjaan *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-ink ${
                  errors.title ? 'border-error ring-1 ring-error/30' : 'border-border'
                }`}
                placeholder="Contoh: Perjanjian Kerjasama Pengadaan Jasa Pengamanan..."
              />
              {errors.title && <p className="text-error text-[11px] mt-1">{errors.title}</p>}
            </div>
          </div>

          {/* Baris 3: Layanan & Kuota Personel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-ink mb-1">Jenis Layanan *</label>
              <input
                type="text"
                list="service-suggestions"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-ink ${
                  errors.serviceType ? 'border-error ring-1 ring-error/30' : 'border-border'
                }`}
                placeholder="Jasa Pengamanan (Security Guard), Ekspedisi Kurir, dll."
              />
              <datalist id="service-suggestions">
                {EMPLOYEE_SERVICE_TYPES.map((s) => (
                  <option key={s.key} value={s.label} />
                ))}
                <option value="Jasa Pengamanan (Security Guard)" />
                <option value="Ekspedisi Kurir & Pengamanan (4 Pos)" />
                <option value="Cleaning Service & Sanitasi Fasilitas" />
                <option value="Pengelolaan Parkir & Valet Service" />
                <option value="Penyedia Tenaga Kerja Alih Daya (Man Power)" />
              </datalist>
              {errors.serviceType && <p className="text-error text-[11px] mt-1">{errors.serviceType}</p>}
            </div>

            <div>
              <label className="block font-medium text-ink mb-1 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-muted" />
                <span>Kuota Personel / Pos</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.manpowerQuota}
                onChange={(e) => setFormData({ ...formData, manpowerQuota: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink font-mono"
              />
            </div>
          </div>

          {/* Baris 4: Masa Berlaku (Mulai & Selesai) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted" />
                <span>Masa Berlaku Mulai *</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-ink ${
                  errors.startDate ? 'border-error ring-1 ring-error/30' : 'border-border'
                }`}
              />
              {errors.startDate && <p className="text-error text-[11px] mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block font-medium text-ink mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted" />
                <span>Masa Berlaku Berakhir *</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-ink ${
                  errors.endDate ? 'border-error ring-1 ring-error/30' : 'border-border'
                }`}
              />
              {errors.endDate && <p className="text-error text-[11px] mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Baris 5: Nilai Finansial Bulanan & PIC Legal Klien */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-accent-green" />
                <span>Nilai Kontrak Bulanan (Rp) *</span>
              </label>
              <input
                type="number"
                min="0"
                step="500000"
                value={formData.monthlyValue}
                onChange={(e) => setFormData({ ...formData, monthlyValue: parseInt(e.target.value, 10) || 0 })}
                className={`w-full px-3 py-2 border rounded-lg bg-white text-ink font-mono ${
                  errors.monthlyValue ? 'border-error ring-1 ring-error/30' : 'border-border'
                }`}
                placeholder="Contoh: 36000000"
              />
              {errors.monthlyValue && <p className="text-error text-[11px] mt-1">{errors.monthlyValue}</p>}
            </div>

            <div>
              <label className="block font-medium text-ink mb-1">Nama / PIC Legal Klien</label>
              <input
                type="text"
                value={formData.picLegalClient}
                onChange={(e) => setFormData({ ...formData, picLegalClient: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
                placeholder="Contoh: Bapak Hendra Gunawan, S.H."
              />
            </div>
          </div>

          {/* Baris 6: Klausul Standar SLA */}
          <div>
            <label className="block font-medium text-ink mb-1">Klausul Standar SLA &amp; Ketentuan Operasional</label>
            <textarea
              rows={2}
              value={formData.slaTerms}
              onChange={(e) => setFormData({ ...formData, slaTerms: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
              placeholder="Contoh: Kesiapan personel 100%, seragam lengkap PDL/PDH, pergantian personel sakit maksimal 4 jam."
            />
          </div>

          {/* Baris 7: Catatan Tambahan */}
          <div>
            <label className="block font-medium text-ink mb-1">Catatan Internal Perjanjian</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink"
              placeholder="Catatan klausul adendum, termin pembayaran, atau ketentuan khusus lainnya..."
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1.5">
              <Save className="h-4 w-4" />
              <span>Simpan Dokumen PKS</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
