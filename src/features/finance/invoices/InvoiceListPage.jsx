/**
 * Invoice & Receivables List Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 14 (Finance Module: Invoice, Payment, Receivable).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Search,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building2,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import invoiceAdapter from '@/services/adapters/invoiceAdapter';
import clientAdapter from '@/services/adapters/clientAdapter';
import InvoiceFormModal from './InvoiceFormModal';
import PaymentRecordModal from './PaymentRecordModal';
import { STATUS } from '@/constants/status';

export default function InvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [receivables, setReceivables] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  // Modals & Expand
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, clientRes, recRes] = await Promise.all([
        invoiceAdapter.getInvoices({
          search,
          status: selectedStatus,
          clientId: selectedClient,
          pageSize: 50,
        }),
        clientAdapter.getClients({ pageSize: 50 }),
        invoiceAdapter.getReceivablesSummary(),
      ]);

      if (invRes.data) setInvoices(invRes.data);
      if (clientRes.data) setClients(clientRes.data);
      if (recRes.data) setReceivables(recRes.data);
    } catch (err) {
      console.error('Failed to load invoices:', err);
      toast.error('Gagal memuat data faktur tagihan.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, selectedClient]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateInvoice = async (payload) => {
    const res = await invoiceAdapter.createInvoice(payload);
    if (res.error) throw res.error;
    toast.success('Faktur tagihan baru berhasil diterbitkan.');
    loadData();
  };

  const handleRecordPayment = async (invoiceId, payload) => {
    const res = await invoiceAdapter.recordPayment(invoiceId, payload);
    if (res.error) throw res.error;
    toast.success('Penerimaan pembayaran berhasil dibukukan.');
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-red" />
            <span>Manajemen Faktur & Pengawasan Piutang</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Penerbitan tagihan jasa outsourcing, rekonsiliasi transfer pembayaran klien, dan aging schedule piutang.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsFormOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Terbitkan Faktur Baru</span>
        </Button>
      </div>

      {/* Receivables KPI Summary Cards */}
      {receivables && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-info">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Tagihan Diterbitkan</p>
                <h3 className="text-xl sm:text-2xl font-bold text-ink mt-1">
                  Rp {(receivables.totalIssued / 1000000).toFixed(1)} Jt
                </h3>
                <p className="text-xs text-muted mt-1">{invoices.length} faktur tercatat</p>
              </div>
              <div className="p-3 rounded-xl bg-info/10 text-info">
                <FileText className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent-green">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Pembayaran Masuk</p>
                <h3 className="text-xl sm:text-2xl font-bold text-accent-green mt-1">
                  Rp {(receivables.totalPaid / 1000000).toFixed(1)} Jt
                </h3>
                <p className="text-xs text-muted mt-1">Kas & rekening koran</p>
              </div>
              <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Sisa Piutang Berjalan</p>
                <h3 className="text-xl sm:text-2xl font-bold text-ink mt-1">
                  Rp {(receivables.totalOutstanding / 1000000).toFixed(1)} Jt
                </h3>
                <p className="text-xs text-muted mt-1">{receivables.unpaidCount} faktur belum lunas</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 text-warning">
                <DollarSign className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary-red">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Piutang Jatuh Tempo (Overdue)</p>
                <h3 className="text-xl sm:text-2xl font-bold text-primary-red mt-1">
                  Rp {(receivables.overdueAmount / 1000000).toFixed(1)} Jt
                </h3>
                <p className="text-xs text-muted mt-1">{receivables.overdueCount} klien perlu penagihan</p>
              </div>
              <div className="p-3 rounded-xl bg-primary-red/10 text-primary-red">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Cari nomor faktur, klien, periode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Status Pembayaran</option>
                <option value={STATUS.DRAFT}>DRAFT</option>
                <option value={STATUS.SENT}>SENT (Terkirim)</option>
                <option value={STATUS.PARTIALLY_PAID}>PARTIALLY_PAID (Cicilan/Termin)</option>
                <option value={STATUS.PAID}>PAID (Lunas)</option>
                <option value={STATUS.OVERDUE}>OVERDUE (Jatuh Tempo)</option>
              </select>
            </div>

            <div>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Klien</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      {loading ? (
        <LoadingState message="Memuat daftar faktur tagihan..." />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="Tidak Ada Faktur Tagihan"
          description="Tidak ditemukan faktur tagihan dengan filter pencarian yang diterapkan saat ini."
        />
      ) : (
        <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-muted uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4">No. Faktur / Tgl</th>
                  <th className="py-3 px-4">Klien & Rincian</th>
                  <th className="py-3 px-4">Periode</th>
                  <th className="py-3 px-4">Total Tagihan</th>
                  <th className="py-3 px-4">Sudah Terbayar</th>
                  <th className="py-3 px-4">Sisa Piutang</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv) => {
                  const isExpanded = expandedId === inv.id;

                  return (
                    <React.Fragment key={inv.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-ink block">{inv.invoiceNumber}</span>
                          <span className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {inv.issueDate}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-bold text-ink block">{inv.clientName}</span>
                          <span className="text-[11px] text-muted block line-clamp-1">{inv.serviceDescription}</span>
                        </td>
                        <td className="py-3 px-4 text-ink font-medium">
                          {inv.billingPeriod}
                        </td>
                        <td className="py-3 px-4 font-bold text-ink">
                          Rp {inv.totalAmount.toLocaleString('id-ID')}
                          <span className="text-[10px] text-muted block font-normal">(Inc. PPN 11%)</span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-accent-green">
                          Rp {inv.paidAmount.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 font-bold text-primary-red">
                          Rp {inv.remainingAmount.toLocaleString('id-ID')}
                          {inv.dueDate && (
                            <span className="text-[10px] text-muted block font-normal">
                              Jatuh tempo: {inv.dueDate}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge status={inv.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                              className="p-1.5 text-muted hover:text-ink hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1"
                              title="Riwayat Pembayaran"
                            >
                              <span>Riwayat</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>

                            {inv.remainingAmount > 0 && (
                              <button
                                type="button"
                                onClick={() => setPaymentInvoice(inv)}
                                className="p-1.5 text-accent-green hover:bg-accent-green/10 rounded-lg font-medium text-xs flex items-center gap-1"
                                title="Catat Setoran Pembayaran"
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                                <span>Bayar</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Payment History Panel */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={8} className="p-4 border-b border-border">
                            <div className="bg-white p-4 rounded-xl border border-border shadow-2xs space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold text-ink uppercase tracking-wider">
                                  Riwayat Setoran Pembayaran ({inv.paymentHistory?.length || 0})
                                </h5>
                                <span className="text-xs text-muted">
                                  Sisa Tagihan: <strong className="text-primary-red">Rp {inv.remainingAmount.toLocaleString('id-ID')}</strong>
                                </span>
                              </div>

                              {(!inv.paymentHistory || inv.paymentHistory.length === 0) ? (
                                <p className="text-xs text-muted italic bg-surface p-2.5 rounded-lg border border-border">
                                  Belum ada catatan setoran pembayaran untuk faktur ini.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {inv.paymentHistory.map((pay, pIdx) => (
                                    <div
                                      key={pIdx}
                                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-surface rounded-lg border border-border text-xs gap-2"
                                    >
                                      <div>
                                        <span className="font-bold text-accent-green">
                                          Rp {pay.amount.toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-muted mx-1.5">•</span>
                                        <span className="text-ink font-medium">{pay.paymentMethod}</span>
                                        <span className="text-muted mx-1.5">•</span>
                                        <span className="text-muted">Ref: {pay.referenceNumber}</span>
                                      </div>
                                      <div className="text-muted text-[11px]">
                                        <span>Diterima oleh: {pay.receivedBy} ({pay.paymentDate})</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {inv.notes && (
                                <div className="text-xs text-muted pt-1">
                                  <strong>Catatan Faktur:</strong> {inv.notes}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <InvoiceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        clients={clients}
        onSubmit={handleCreateInvoice}
      />

      <PaymentRecordModal
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        invoice={paymentInvoice}
        onSubmit={handleRecordPayment}
      />
    </div>
  );
}
