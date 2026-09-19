import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { Plus, Eye, Target, TrendingUp, Trash2, Edit2 } from 'lucide-react';

export function LeadPipeline() {
  const { addToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    email: '',
    estimated_value: '75000000',
    status: 'new',
    source: 'Website Landing Page',
    notes: 'Kebutuhan alih daya personil baru'
  });

  const getDeletedLeadIds = () => {
    try {
      const raw = localStorage.getItem('barak_deleted_ids_leads');
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch (e) {
      return new Set();
    }
  };

  const saveDeletedLeadId = (id) => {
    try {
      const set = getDeletedLeadIds();
      set.add(String(id));
      localStorage.setItem('barak_deleted_ids_leads', JSON.stringify([...set]));
    } catch (e) {}
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const deletedIds = getDeletedLeadIds();
      const res = await api.getLeads({ search, status: stageFilter });
      if (res?.success && Array.isArray(res.data)) {
        setLeads(res.data.filter(l => !deletedIds.has(String(l.id))));
      } else {
        setLeads([]);
      }
    } catch (err) {
      addToast(err.message || 'Gagal memuat pipeline leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.getServices();
      if (res?.success && Array.isArray(res.data)) {
        setServices(res.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [search, stageFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.contact_name) {
      addToast('Harap lengkapi nama instansi dan nama kontak PIC.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        estimated_value: Number(formData.estimated_value) || 0
      };
      const res = await api.createLead(payload);
      if (res?.success) {
        addToast(`Prospek untuk ${formData.company_name} berhasil dicatat di backend!`, 'success');
        setIsCreateModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menambahkan prospek ke server', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStage = async (leadId, newStage) => {
    try {
      const res = await api.updateLead(leadId, { status: newStage });
      if (res?.success) {
        addToast(`Tahapan prospek berhasil diperbarui ke: ${newStage.toUpperCase()}`, 'success');
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead({ ...selectedLead, status: newStage });
        }
        fetchLeads();
      }
    } catch (err) {
      addToast(err.message || 'Gagal mengubah tahapan di server', 'error');
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;
    setSubmitting(true);
    try {
      saveDeletedLeadId(selectedLead.id);
      setLeads(prev => prev.filter(l => String(l.id) !== String(selectedLead.id)));

      const res = await api.deleteLead(selectedLead.id);
      if (res?.success) {
        addToast(`Prospek #${selectedLead.id} berhasil dihapus permanen dari sistem.`, 'success');
        setIsDeleteModalOpen(false);
        setSelectedLead(null);
        fetchLeads();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menghapus lead', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const columns = [
    {
      header: 'Perusahaan Calon Klien & Sumber',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.company_name || row.company || 'Calon Klien'}</p>
          <p className="text-[11px] text-slate-400">Sumber: {row.source || 'Website Form'}</p>
        </div>
      )
    },
    {
      header: 'Penanggung Jawab (PIC)',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.contact_name || row.picName}</p>
          <p className="text-xs text-slate-500 font-mono">{row.phone || row.picPhone || '-'}</p>
        </div>
      )
    },
    {
      header: 'Email Korporasi',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">{row.email || '-'}</span>
      )
    },
    {
      header: 'Nilai Estimasi Kontrak',
      render: (row) => (
        <p className="font-bold text-brand-dark">{formatRupiah(row.estimated_value || row.estimatedValue)}</p>
      )
    },
    {
      header: 'Tahapan Pipeline',
      render: (row) => <StatusBadge status={row.status || row.stage} type="lead" />
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => {
              setSelectedLead(row);
              setIsDetailModalOpen(true);
            }}
          >
            Detail
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!p-1.5 text-slate-400 hover:text-brand-red"
            title="Hapus Prospek"
            onClick={() => {
              setSelectedLead(row);
              setIsDeleteModalOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Pemasaran & Manajemen Leads"
        subtitle="Pelacakan prospek alih daya dari formulir publik, pemeringkatan probabilitas, dan status negosiasi kontrak."
        breadcrumb={['Dashboard', 'Marketing', 'Pipeline Leads']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setFormData({
                company_name: '',
                contact_name: '',
                phone: '',
                email: '',
                estimated_value: '75000000',
                status: 'new',
                source: 'Direct Contact',
                notes: 'Kebutuhan alih daya personil'
              });
              setIsCreateModalOpen(true);
            }}
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
              { value: 'new', label: 'Prospek Baru (New Lead)' },
              { value: 'contacted', label: 'Telah Dihubungi (Contacted)' },
              { value: 'proposal_sent', label: 'Proposal Terkirim' },
              { value: 'negotiation', label: 'Negosiasi Kontrak' },
              { value: 'won', label: 'Disepakati / Menang (Won)' },
              { value: 'lost', label: 'Batal / Kalah (Lost)' }
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
        searchPlaceholder="Cari nama perusahaan, PIC, atau email..."
      />

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Daftarkan Prospek Kemitraan Baru"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Perusahaan / Korporasi"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Contoh: PT Graha Sentosa Abadi"
              required
            />
            <Input
              label="Nama Contact Person (PIC)"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              placeholder="Contoh: Ibu Diana / Bpk Hendra"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nomor Telepon / WhatsApp"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="081234567890"
              required
            />
            <Input
              label="Alamat Email PIC"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="pic@perusahaan.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Estimasi Nilai Kontrak (Rp)"
              type="number"
              value={formData.estimated_value}
              onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
              required
            />
            <Select
              label="Sumber Prospek (Source)"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              options={[
                { value: 'Website Landing Page', label: 'Website Landing Page' },
                { value: 'Direct Contact', label: 'Direct Contact / Sales' },
                { value: 'Tender / Pengadaan Resmi', label: 'Tender / Pengadaan' },
                { value: 'Referral Klien', label: 'Referral Klien' }
              ]}
            />
          </div>

          <Textarea
            label="Catatan Kebutuhan / Spesifikasi"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Tuliskan detail kebutuhan tenaga kerja..."
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

      {/* Detail & Stage Update Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Prospek & Progres Pipeline"
        maxWidth="max-w-lg"
      >
        {selectedLead && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-brand-dark text-sm">{selectedLead.company_name || selectedLead.company}</span>
                <StatusBadge status={selectedLead.status || selectedLead.stage} type="lead" />
              </div>
              <p className="text-slate-600 font-semibold">{selectedLead.contact_name || selectedLead.picName} ({selectedLead.phone || selectedLead.picPhone})</p>
              <p className="text-slate-400 mt-1">Sumber: {selectedLead.source || 'Website'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Estimasi Nilai Kontrak:</span>
                <span className="font-bold text-brand-dark text-sm">{formatRupiah(selectedLead.estimated_value || selectedLead.estimatedValue)}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Email PIC:</span>
                <span className="font-semibold text-slate-700">{selectedLead.email || '-'}</span>
              </div>
            </div>

            {selectedLead.notes && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block mb-1">Catatan Kebutuhan:</span>
                <p className="text-slate-700 italic">{selectedLead.notes}</p>
              </div>
            )}

            {/* Quick Stage Update */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pindahkan Tahapan Pipeline:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'new', label: 'New Lead' },
                  { key: 'contacted', label: 'Contacted' },
                  { key: 'proposal_sent', label: 'Proposal Sent' },
                  { key: 'negotiation', label: 'Negotiation' },
                  { key: 'won', label: 'Won (Menang)' },
                  { key: 'lost', label: 'Lost' }
                ].map(st => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => handleUpdateStage(selectedLead.id, st.key)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                      (selectedLead.status || selectedLead.stage) === st.key
                        ? 'bg-brand-red text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Convert to Client Button when Won */}
            {(selectedLead.status === 'won' || selectedLead.stage === 'won' || selectedLead.status === 'menang') && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-emerald-900 text-xs">Kesepakatan Tercapai (Won)!</p>
                  <p className="text-[11px] text-emerald-700">Daftarkan langsung prospek ini menjadi Klien Mitra resmi perusahaan.</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="!bg-emerald-600 hover:!bg-emerald-700 whitespace-nowrap"
                  onClick={async () => {
                    try {
                      setSubmitting(true);
                      const res = await api.createClient({
                        name: selectedLead.company_name || selectedLead.company,
                        phone: selectedLead.phone || selectedLead.picPhone || '-',
                        email: selectedLead.email || 'procurement@client.com',
                        address: selectedLead.notes || 'Kantor Pusat Klien',
                        status: 'active'
                      });
                      if (res?.success) {
                        addToast(`Klien ${selectedLead.company_name || selectedLead.company} berhasil didaftarkan ke Database Mitra!`, 'success');
                        setIsDetailModalOpen(false);
                      }
                    } catch (err) {
                      addToast(err.message || 'Gagal mengonversi prospek ke klien', 'error');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  loading={submitting}
                >
                  Konversi Jadi Klien Mitra
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteLead}
        title="Hapus Prospek"
        message={`Apakah Anda yakin ingin menghapus prospek untuk ${selectedLead?.company_name || selectedLead?.company}?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
