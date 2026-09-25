/**
 * Modal Konversi Lead ke Opportunity Pipeline — PT. BARAK IOMS
 * Source of Truth: PRD Section 15 (Lead Conversion) & Section 18 (Cross-department workflow).
 */

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { marketingAdapter } from '@/services/adapters/marketingAdapter';

const STAGE_OPTIONS = [
  { value: 'PROSPECTING', label: 'Penjajakan Awal & Kebutuhan Klien (25%)', prob: 25 },
  { value: 'SURVEY_LOCATION', label: 'Survei Lokasi & Analisis Titik Rawan (40%)', prob: 40 },
  { value: 'PROPOSAL_SENT', label: 'Proposal & Penawaran Terkirim (60%)', prob: 60 },
  { value: 'NEGOTIATION', label: 'Negosiasi Komersial & Finalisasi Draft (80%)', prob: 80 },
];

export default function LeadConvertModal({ isOpen, onClose, lead, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const defaultMonthlyVal = lead ? Number(lead.estimatedManpower || 6) * 6000000 : 36000000;

  const [formData, setFormData] = useState({
    monthlyValue: defaultMonthlyVal,
    stage: 'PROSPECTING',
    estimatedManpower: lead?.estimatedManpower || 6,
    expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    salesOwner: lead?.assignedSales || 'Reza Pratama',
    notes: '',
  });

  if (!lead) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedStage = STAGE_OPTIONS.find((s) => s.value === formData.stage);
      const res = await marketingAdapter.convertLeadToOpportunity(lead.id, {
        monthlyValue: Number(formData.monthlyValue),
        stage: formData.stage,
        stageLabel: selectedStage ? selectedStage.label : formData.stage,
        probability: selectedStage ? selectedStage.prob : 25,
        estimatedManpower: Number(formData.estimatedManpower),
        expectedCloseDate: formData.expectedCloseDate,
        salesOwner: formData.salesOwner,
        location: lead.locationCity,
        serviceInterest: lead.serviceInterest,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(
        `Sukses! Lead ${lead.leadNumber} berhasil dikonversi ke Peluang Pipeline ${res.data.opportunity.opportunityNumber}`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('Gagal mengonversi lead.');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konversi Lead ke Peluang Pipeline (Opportunity)"
      description="Tingkatkan prospek yang telah terverifikasi/qualified menjadi peluang deal aktif dalam CRM Pipeline PT. BARAK."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ringkasan Lead */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-ink space-y-1">
          <p className="font-semibold text-primary-red">{lead.companyName}</p>
          <p className="text-muted">No. Prospek: {lead.leadNumber} · PIC: {lead.picName} ({lead.phone})</p>
          <p className="text-muted">Peminatan: {lead.serviceInterest} · Lokasi: {lead.locationCity || '-'}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Estimasi Nilai Kontrak Bulanan (Rp) <span className="text-primary-red">*</span>
          </label>
          <input
            type="number"
            name="monthlyValue"
            min="1000000"
            step="500000"
            value={formData.monthlyValue}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
          />
          <p className="text-xs text-muted mt-1">
            Estimasi Nilai Tahunan (ARR): <span className="font-semibold text-ink">{formatRupiah(Number(formData.monthlyValue) * 12)}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Kebutuhan Manpower (Personel)
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
              Target Tanggal Closing (PKS)
            </label>
            <input
              type="date"
              name="expectedCloseDate"
              value={formData.expectedCloseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Tahapan Pipeline Awal
          </label>
          <select
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red bg-white"
          >
            {STAGE_OPTIONS.map((stg) => (
              <option key={stg.value} value={stg.value}>
                {stg.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink mb-1">
            Sales Owner (Penanggung Jawab Deal)
          </label>
          <input
            type="text"
            name="salesOwner"
            value={formData.salesOwner}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            {loading ? 'Mengonversi...' : 'Konversi ke Pipeline'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
