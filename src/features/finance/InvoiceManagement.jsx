import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { INITIAL_CLIENTS } from '../../services/mock/mockData';
import { Plus, Eye, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';

export function InvoiceManagement() {
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    clientId: 'cli-1',
    clientName: 'PT Menara Graha Mandiri',
    serviceType: 'Pengamanan & Parkir',
    period: 'September 2026',
    subtotal: '200000000',
    headcountBilled: '50',
    notes: 'Tagihan bulanan penempatan tenaga kerja'
  });

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.getInvoices({ search, status: statusFilter });
      if (res.success) {
        setInvoices(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Gagal memuat daftar invoice', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createInvoice(formData);
      if (res.success) {
        addToast(`Invoice ${res.data.invoiceNumber} berhasil diterbitkan.`, 'success');
        setIsCreateModalOpen(false);
        fetchInvoices();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menerbitkan invoice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      const res = await api.updateInvoiceStatus(invoiceId, newStatus);
      if (res.success) {
        addToast(`Status invoice diperbarui menjadi ${newStatus.toUpperCase()}`, 'success');
        if (selectedInvoice && selectedInvoice.id === invoiceId) {
          setSelectedInvoice(res.data);
        }
        fetchInvoices();
      }
    } catch (err) {
      addToast(err.message || 'Gagal mengubah status', 'error');
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const columns = [
    {
      header: 'No. Faktur / Invoice',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark font-mono text-xs">{row.invoiceNumber}</p>
          <p className="text-xs text-slate-500">{row.period}</p>
        </div>
      )
    },
    {
      header: 'Klien & Layanan',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.clientName}</p>
          <p className="text-xs text-slate-500">{row.serviceType}</p>
        </div>
      )
    },
    {
      header: 'Beban Manpower',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">{row.headcountBilled} Personel</span>
      )
    },
    {
      header: 'Tgl Jatuh Tempo',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">{row.dueDate}</span>
      )
    },
    {
      header: 'Total Tagihan',
      render: (row) => (
        <span className="font-bold text-brand-dark text-sm">{formatRupiah(row.total)}</span>
      )
    },
    {
      header: 'Status Pembayaran',
      render: (row) => <StatusBadge status={row.status} type="invoice" />
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="!p-1.5 text-slate-500 hover:text-brand-dark"
            title="Lihat Rincian Tagihan"
            onClick={() => {
              setSelectedInvoice(row);
              setIsDetailModalOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>

          {row.status !== 'paid' && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-300"
              onClick={() => handleUpdateStatus(row.id, 'paid')}
            >
              Set Lunas
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Tagihan & Piutang Klien (Invoices)"
        subtitle="Penerbitan faktur tagihan jasa alih daya, rekonsiliasi pembayaran kas, dan pengawasan batas jatuh tempo."
        breadcrumb={['Dashboard', 'Finance', 'Invoices']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Terbitkan Invoice Baru
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-56">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Status Pembayaran' },
              { value: 'pending', label: 'Menunggu Pembayaran (Pending)' },
              { value: 'paid', label: 'Telah Lunas (Paid)' },
              { value: 'overdue', label: 'Jatuh Tempo (Overdue)' }
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nomor invoice, klien, atau layanan..."
      />

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Penerbitan Faktur Invoice Baru"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pilih Klien Tertagih"
              value={formData.clientId}
              onChange={(e) => {
                const sel = INITIAL_CLIENTS.find(c => c.id === e.target.value);
                setFormData({
                  ...formData,
                  clientId: e.target.value,
                  clientName: sel ? sel.name : formData.clientName,
                  serviceType: sel ? sel.serviceType : formData.serviceType
                });
              }}
              options={INITIAL_CLIENTS.map(c => ({ value: c.id, label: c.name }))}
            />
            <Input
              label="Periode Tagihan"
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              placeholder="Contoh: September 2026"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Jumlah Personel yang Ditagihkan"
              type="number"
              value={formData.headcountBilled}
              onChange={(e) => setFormData({ ...formData, headcountBilled: e.target.value })}
              required
            />
            <Input
              label="Subtotal Tagihan Jasa (Rp)"
              type="number"
              value={formData.subtotal}
              onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
              required
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>{formatRupiah(Number(formData.subtotal) || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>PPN (11%):</span>
              <span>{formatRupiah(Math.round((Number(formData.subtotal) || 0) * 0.11))}</span>
            </div>
            <div className="flex justify-between font-bold text-brand-dark pt-1 border-t border-slate-200">
              <span>Estimasi Total Faktur:</span>
              <span>{formatRupiah(Math.round((Number(formData.subtotal) || 0) * 1.11))}</span>
            </div>
          </div>

          <Textarea
            label="Catatan Invoice / Klausul Khusus"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Terbitkan Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Rincian Faktur Tagihan"
        maxWidth="max-w-lg"
      >
        {selectedInvoice && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-brand-dark text-sm">{selectedInvoice.invoiceNumber}</span>
                <StatusBadge status={selectedInvoice.status} type="invoice" />
              </div>
              <p className="font-bold text-slate-800 text-sm">{selectedInvoice.clientName}</p>
              <p className="text-slate-500">Layanan: {selectedInvoice.serviceType}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Tanggal Terbit:</span>
                <span className="font-semibold text-slate-700 font-mono">{selectedInvoice.issueDate}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Jatuh Tempo:</span>
                <span className="font-semibold text-slate-700 font-mono">{selectedInvoice.dueDate}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Jumlah Manpower:</span>
                <span className="font-semibold text-slate-700">{selectedInvoice.headcountBilled} Orang</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block mb-0.5">Periode:</span>
                <span className="font-semibold text-slate-700">{selectedInvoice.period}</span>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Dasar Pengenaan Pajak (DPP):</span>
                <span className="font-mono">{formatRupiah(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PPN 11%:</span>
                <span className="font-mono">{formatRupiah(selectedInvoice.ppn)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-brand-dark text-sm pt-2 border-t border-slate-200">
                <span>Total Tagihan:</span>
                <span className="font-mono text-brand-red">{formatRupiah(selectedInvoice.total)}</span>
              </div>
            </div>

            {selectedInvoice.notes && (
              <p className="text-slate-500 italic p-2 bg-slate-50 rounded">
                Catatan: {selectedInvoice.notes}
              </p>
            )}

            {/* Change status actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Ubah Status:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedInvoice.id, 'paid')}
                  className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px] hover:bg-emerald-200"
                >
                  Lunas
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedInvoice.id, 'pending')}
                  className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-semibold text-[11px] hover:bg-amber-200"
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedInvoice.id, 'overdue')}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded font-semibold text-[11px] hover:bg-red-200"
                >
                  Overdue
                </button>
              </div>

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
