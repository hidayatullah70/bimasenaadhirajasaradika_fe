import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { INITIAL_SERVICES } from '../../services/mock/mockData';
import { Plus, Eye, ArrowRightCircle, Target, TrendingUp } from 'lucide-react';

export function LeadPipeline() {
  const { addToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company: '',
    picName: '',
    picPhone: '',
    email: '',
    serviceInterested: 'Pengamanan / Security',
    requestedHeadcount: '25',
    estimatedValue: '90000000',
    notes: 'Kebutuhan alih daya baru'
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.getLeads({ search, stage: stageFilter });
      if (res.success) {
        setLeads(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Gagal memuat pipeline leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, stageFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.picName) {
      addToast('Harap lengkapi nama instansi dan nama PIC.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createLead(formData);
      if (res.success) {
        addToast(`Prospek untuk ${formData.company} berhasil didaftarkan.`, 'success');
        setIsCreateModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menambahkan prospek', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStage = async (leadId, newStage) => {
    try {
      const res = await api.updateLeadStage(leadId, newStage);
      if (res.success) {
        addToast(`Tahapan prospek berhasil dipindahkan ke: ${newStage.toUpperCase()}`, 'success');
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(res.data);
        }
        fetchLeads();
      }
    } catch (err) {
      addToast(err.message || 'Gagal mengubah tahapan', 'error');
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const columns = [
    {
      header: 'Perusahaan Calon Klien & Sumber',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.company}</p>
          <p className="text-[11px] text-slate-400">Sumber: {row.source || 'Website Form'}</p>
        </div>
      )
    },
    {
      header: 'Penanggung Jawab (PIC)',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.picName}</p>
          <p className="text-xs text-slate-500 font-mono">{row.picPhone}</p>
        </div>
      )
    },
    {
      header: 'Kebutuhan Layanan',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
          {row.serviceInterested}
        </span>
      )
    },
    {
      header: 'Personel / Nilai Estimasi',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{formatRupiah(row.estimatedValue)}</p>
          <p className="text-[11px] text-slate-500">{row.requestedHeadcount} Personel</p>
        </div>
      )
    },
    {
      header: 'Tahapan Pipeline',
      render: (row) => <StatusBadge status={row.stage} type="lead" />
    },
    {
      header: 'Peluang SPK',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-brand-green bg-green-50 px-2 py-0.5 rounded">
          {row.probability}
        </span>
      )
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Eye}
          onClick={() => {
            setSelectedLead(row);
            setIsDetailModalOpen(true);
          }}
        >
          Detail & Progres
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Prospek & Pipeline Klien (CRM)"
        subtitle="Pelacakan siklus penawaran: Masuk Baru -> Diskusi -> Penawaran Proposal -> Negosiasi -> Terbit SPK Menang."
        breadcrumb={['Dashboard', 'Marketing', 'Leads']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tambah Prospek Baru
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-56">
          <Select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Tahapan Pipeline' },
              { value: 'baru', label: '1. Masuk Baru' },
              { value: 'diskusi', label: '2. Diskusi Kebutuhan' },
              { value: 'penawaran', label: '3. Penawaran Proposal' },
              { value: 'negosiasi', label: '4. Negosiasi Kontrak' },
              { value: 'menang', label: '5. Menang / SPK Terbit' }
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={leads}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama perusahaan, PIC, atau layanan..."
      />

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Pendaftaran Prospek Calon Klien Baru"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Perusahaan / Instansi"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Contoh: PT Surya Logistik"
              required
            />
            <Input
              label="Nama Kontak PIC"
              value={formData.picName}
              onChange={(e) => setFormData({ ...formData, picName: e.target.value })}
              placeholder="Budi Santoso"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telepon / WhatsApp"
              value={formData.picPhone}
              onChange={(e) => setFormData({ ...formData, picPhone: e.target.value })}
              placeholder="+62 812-xxxx-xxxx"
              required
            />
            <Input
              label="Email Resmi Perusahaan"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="kontak@perusahaan.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pilar Layanan Diminati"
              value={formData.serviceInterested}
              onChange={(e) => setFormData({ ...formData, serviceInterested: e.target.value })}
              options={INITIAL_SERVICES.map(s => ({ value: s.title, label: s.title }))}
            />
            <Input
              label="Estimasi Kebutuhan Manpower"
              type="number"
              value={formData.requestedHeadcount}
              onChange={(e) => setFormData({ ...formData, requestedHeadcount: e.target.value })}
              required
            />
          </div>

          <Input
            label="Estimasi Nilai Kontrak (Rp)"
            type="number"
            value={formData.estimatedValue}
            onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
            required
          />

          <Textarea
            label="Catatan Kebutuhan & Target Tanggal Penempatan"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Simpan Prospek
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail & Stage Advance Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Progres Pipeline & Rincian Prospek"
        maxWidth="max-w-lg"
      >
        {selectedLead && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-brand-dark text-sm">{selectedLead.company}</h4>
                <StatusBadge status={selectedLead.stage} type="lead" />
              </div>
              <p className="text-slate-500">PIC: {selectedLead.picName} ({selectedLead.picPhone})</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Layanan Diminati:</span>
                <span className="font-semibold text-brand-dark">{selectedLead.serviceInterested}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Estimasi Personel:</span>
                <span className="font-semibold text-brand-dark">{selectedLead.requestedHeadcount} Orang</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Estimasi Nilai:</span>
                <span className="font-bold text-brand-red">{formatRupiah(selectedLead.estimatedValue)}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Probabilitas SPK:</span>
                <span className="font-bold text-brand-green font-mono">{selectedLead.probability}</span>
              </div>
            </div>

            {selectedLead.notes && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-700 block mb-1">Catatan Klien:</span>
                <p className="text-slate-600 leading-relaxed">{selectedLead.notes}</p>
              </div>
            )}

            {/* Advance Stage Selector */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="font-bold text-brand-dark block">Pindahkan Tahapan Pipeline:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { id: 'baru', label: '1. Masuk Baru' },
                  { id: 'diskusi', label: '2. Diskusi' },
                  { id: 'penawaran', label: '3. Proposal' },
                  { id: 'negosiasi', label: '4. Negosiasi' },
                  { id: 'menang', label: '5. Menang / SPK' }
                ].map((stg) => (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => handleUpdateStage(selectedLead.id, stg.id)}
                    className={`px-2.5 py-1.5 rounded-lg border text-center font-semibold text-[11px] transition-colors ${
                      selectedLead.stage === stg.id
                        ? 'bg-brand-red text-white border-brand-red shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {stg.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
