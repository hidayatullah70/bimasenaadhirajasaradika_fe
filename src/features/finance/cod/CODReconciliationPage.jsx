/**
 * COD Reconciliation Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 12.5 & Section 14 (COD Module).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeftRight,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  PhoneCall,
  DollarSign,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Truck,
  Building2,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import codAdapter from '@/services/adapters/codAdapter';
import clientAdapter from '@/services/adapters/clientAdapter';
import CODCollectionModal from './CODCollectionModal';
import CODEscalateModal from './CODEscalateModal';

export default function CODReconciliationPage() {
  const [activeTab, setActiveTab] = useState('CASES'); // 'CASES' | 'TRANSACTIONS'
  const [transactions, setTransactions] = useState([]);
  const [codCases, setCODCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  // Modals & Expand
  const [collectionCase, setCollectionCase] = useState(null);
  const [escalateCase, setEscalateCase] = useState(null);
  const [expandedCaseId, setExpandedCaseId] = useState(null);

  // Quick Settlement state
  const [settlingCaseId, setSettlingCaseId] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementReceipt, setSettlementReceipt] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [trxRes, casesRes, clientRes] = await Promise.all([
        codAdapter.getCODTransactions({ search, clientId: selectedClient, pageSize: 50 }),
        codAdapter.getCODCases({ search, pageSize: 50 }),
        clientAdapter.getClients({ pageSize: 50 }),
      ]);

      if (trxRes.data) setTransactions(trxRes.data);
      if (casesRes.data) setCODCases(casesRes.data);
      if (clientRes.data) setClients(clientRes.data);
    } catch (err) {
      console.error('Failed to load COD data:', err);
      toast.error('Gagal memuat data rekonsiliasi COD.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedClient]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRecordCollection = async (caseId, payload) => {
    const res = await codAdapter.recordCollectionAttempt(caseId, payload);
    if (res.error) throw res.error;
    toast.success('Catatan upaya penagihan kurir berhasil disimpan.');
    loadData();
  };

  const handleEscalateLegal = async (caseId, payload) => {
    const res = await codAdapter.escalateToLegal(caseId, payload);
    if (res.error) throw res.error;
    toast.success('Kasus selisih COD berhasil dilimpahkan ke Divisi Legal.');
    loadData();
  };

  const handleSettlement = async (caseId) => {
    if (!settlementAmount || Number(settlementAmount) <= 0) {
      toast.error('Nominal pelunasan tidak valid.');
      return;
    }
    if (!settlementReceipt.trim()) {
      toast.error('Nomor tanda terima / kuitansi wajib diisi.');
      return;
    }

    const res = await codAdapter.recordCODSettlement(caseId, {
      settlementAmount,
      settlementReceipt,
    });
    if (res.error) {
      toast.error(res.error.message || 'Gagal menyimpan pelunasan.');
      return;
    }

    toast.success('Pelunasan kekurangan COD berhasil dibukukan.');
    setSettlingCaseId(null);
    setSettlementAmount('');
    setSettlementReceipt('');
    loadData();
  };

  // KPIs
  const totalCodValue = transactions.reduce((sum, t) => sum + t.codAmount, 0);
  const totalDeposited = transactions.reduce((sum, t) => sum + t.depositedAmount, 0);
  const totalDiscrepancy = codCases.reduce((sum, c) => sum + c.outstandingAmount, 0);
  const totalEscalated = codCases.filter((c) => c.legalStatus === 'ESCALATED_TO_LEGAL').length;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary-red" />
            <span>Rekonsiliasi Kas COD Ekspedisi (JNT & Surya Dunia)</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Pencocokan manifest barang kiriman COD, penanganan selisih setoran kurir, dan eskalasi legalitas.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('CASES')}
            className={`px-3.5 py-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'CASES'
                ? 'bg-primary-red text-white'
                : 'bg-white text-muted hover:text-ink'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Kasus Selisih ({codCases.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-3.5 py-2 font-semibold border-l border-border transition-colors flex items-center gap-1.5 ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-primary-red text-white'
                : 'bg-white text-muted hover:text-ink'
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            <span>Manifest Transaksi ({transactions.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Nilai Paket COD</p>
              <h3 className="text-xl sm:text-2xl font-bold text-ink mt-1">
                Rp {(totalCodValue / 1000000).toFixed(1)} Jt
              </h3>
              <p className="text-xs text-muted mt-1">{transactions.length} paket diantar</p>
            </div>
            <div className="p-3 rounded-xl bg-info/10 text-info">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent-green">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Uang COD Disetor Kasir</p>
              <h3 className="text-xl sm:text-2xl font-bold text-accent-green mt-1">
                Rp {(totalDeposited / 1000000).toFixed(1)} Jt
              </h3>
              <p className="text-xs text-muted mt-1">Setoran klop dan selesai</p>
            </div>
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Selisih Belum Kembali</p>
              <h3 className="text-xl sm:text-2xl font-bold text-warning mt-1">
                Rp {(totalDiscrepancy / 1000000).toFixed(2)} Jt
              </h3>
              <p className="text-xs text-muted mt-1">Dalam proses penagihan</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary-red">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Eskalasi ke Legal</p>
              <h3 className="text-xl sm:text-2xl font-bold text-primary-red mt-1">
                {totalEscalated} Kasus
              </h3>
              <p className="text-xs text-muted mt-1">Kurir mangkir / somasi penjamin</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-red/10 text-primary-red">
              <Scale className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Cari kurir, no resi, nomor kasus..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>

            <div>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Klien Ekspedisi</option>
                {clients
                  .filter((c) => c.type === 'Logistik' || c.name.includes('LOGISTIK') || c.name.includes('EXPRESS'))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditional View: CASES vs TRANSACTIONS */}
      {loading ? (
        <LoadingState message="Memuat data rekonsiliasi COD..." />
      ) : activeTab === 'CASES' ? (
        /* ── CASES TABLE ────────────────────────────────────────── */
        codCases.length === 0 ? (
          <EmptyState
            title="Tidak Ada Kasus Selisih COD"
            description="Semua setoran kurir klop atau belum ada kasus yang dilaporkan."
          />
        ) : (
          <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-slate-50 text-muted uppercase font-semibold tracking-wider">
                    <th className="py-3 px-4">No. Kasus / Tgl</th>
                    <th className="py-3 px-4">Kurir Lapangan</th>
                    <th className="py-3 px-4">Klien Ekspedisi</th>
                    <th className="py-3 px-4">Nilai Selisih</th>
                    <th className="py-3 px-4">Batas Jatuh Tempo</th>
                    <th className="py-3 px-4">Status Penagihan</th>
                    <th className="py-3 px-4">Status Hukum (Legal)</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {codCases.map((c) => {
                    const isExpanded = expandedCaseId === c.id;
                    const isSettling = settlingCaseId === c.id;

                    return (
                      <React.Fragment key={c.id}>
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-ink block">{c.caseNumber}</span>
                            <span className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {c.detectionDate}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-ink">
                            {c.courierName}
                            <span className="text-[11px] text-muted block font-normal">
                              Ref: {c.shipmentReference}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-ink font-medium">
                            {c.clientName}
                          </td>
                          <td className="py-3 px-4 font-bold text-primary-red">
                            Rp {c.outstandingAmount.toLocaleString('id-ID')}
                            <span className="text-[10px] text-muted block font-normal">
                              Dari total Rp {c.codAmount.toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-ink">
                            {c.dueDate}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                c.collectionStatus === 'SETTLED'
                                  ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                                  : c.collectionStatus === 'FAILED'
                                  ? 'bg-primary-red/10 text-primary-red border border-primary-red/20'
                                  : 'bg-warning/10 text-warning border border-warning/20'
                              }`}
                            >
                              {c.collectionStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                c.legalStatus === 'ESCALATED_TO_LEGAL'
                                  ? 'bg-primary-red text-white'
                                  : 'bg-slate-100 text-muted'
                              }`}
                            >
                              {c.legalStatus === 'ESCALATED_TO_LEGAL' ? 'ESCALATED LEGAL' : 'INTERNAL OPS'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setExpandedCaseId(isExpanded ? null : c.id)}
                                className="p-1.5 text-muted hover:text-ink hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1"
                                title="Lihat Upaya Penagihan"
                              >
                                <span>Log</span>
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>

                              {c.outstandingAmount > 0 && c.legalStatus !== 'ESCALATED_TO_LEGAL' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setCollectionCase(c)}
                                    className="p-1.5 text-accent-green hover:bg-accent-green/10 rounded-lg font-medium text-xs flex items-center gap-1"
                                    title="Catat Penagihan Kurir"
                                  >
                                    <PhoneCall className="h-3.5 w-3.5" />
                                    <span>Tagih</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSettlingCaseId(isSettling ? null : c.id);
                                      setSettlementAmount(c.outstandingAmount);
                                    }}
                                    className="p-1.5 text-info hover:bg-info/10 rounded-lg font-medium text-xs flex items-center gap-1"
                                    title="Pelunasan Setoran"
                                  >
                                    <DollarSign className="h-3.5 w-3.5" />
                                    <span>Lunas</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setEscalateCase(c)}
                                    className="p-1.5 text-primary-red hover:bg-primary-red/10 rounded-lg font-medium text-xs flex items-center gap-1"
                                    title="Eskalasi ke Legal"
                                  >
                                    <Scale className="h-3.5 w-3.5" />
                                    <span>Legal</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Log Details */}
                        {isExpanded && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={8} className="p-4 border-b border-border">
                              <div className="bg-white p-4 rounded-xl border border-border shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-xs font-bold text-ink uppercase tracking-wider">
                                    Riwayat Upaya Penagihan & Catatan Lapangan
                                  </h5>
                                  <span className="text-xs text-muted">
                                    PIC Kolektor: <strong className="text-ink">{c.assignedCollector}</strong>
                                  </span>
                                </div>

                                {c.escalatedReason && (
                                  <div className="p-2.5 bg-primary-red/5 rounded-lg border border-primary-red/20 text-xs">
                                    <span className="font-bold text-primary-red">Status Eskalasi Legal:</span>{' '}
                                    <span className="text-ink">{c.escalatedReason}</span>
                                    <span className="text-muted block text-[11px] mt-0.5">
                                      Ditangani oleh: {c.assignedLegal || 'Divisi Legal'}
                                    </span>
                                  </div>
                                )}

                                {(!c.contactAttempts || c.contactAttempts.length === 0) ? (
                                  <p className="text-xs text-muted italic bg-surface p-2.5 rounded-lg border border-border">
                                    Belum ada catatan log penagihan untuk kasus ini.
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {c.contactAttempts.map((att, aIdx) => (
                                      <div
                                        key={aIdx}
                                        className="p-2.5 bg-surface rounded-lg border border-border text-xs space-y-1"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-ink">{att.contactMethod}</span>
                                          <span className="text-muted text-[11px]">{att.attemptDate}</span>
                                        </div>
                                        <p className="text-muted">
                                          Hasil: <span className="text-ink font-medium">{att.result}</span>
                                        </p>
                                        {att.promisedAmount > 0 && (
                                          <p className="text-accent-green font-semibold">
                                            Nominal Dijanjikan: Rp {att.promisedAmount.toLocaleString('id-ID')}
                                          </p>
                                        )}
                                        <p className="text-primary-red text-[11px]">
                                          Tindak Lanjut: {att.nextAction}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Inline Settlement Box */}
                        {isSettling && (
                          <tr className="bg-accent-green/5">
                            <td colSpan={8} className="p-4 border-b border-accent-green/20">
                              <div className="bg-white p-4 rounded-xl border border-accent-green/30 shadow-2xs space-y-3 max-w-xl ml-auto">
                                <h5 className="text-xs font-bold text-ink flex items-center gap-1.5">
                                  <DollarSign className="h-4 w-4 text-accent-green" />
                                  <span>Konfirmasi Pelunasan Setoran Kurir {c.courierName}</span>
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <label className="block text-muted mb-1">Nominal Disetor (Rp)</label>
                                    <input
                                      type="number"
                                      value={settlementAmount}
                                      onChange={(e) => setSettlementAmount(e.target.value)}
                                      className="w-full border border-border rounded-lg p-2 bg-surface text-ink font-semibold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-muted mb-1">No. Kuitansi Kasir</label>
                                    <input
                                      type="text"
                                      value={settlementReceipt}
                                      onChange={(e) => setSettlementReceipt(e.target.value)}
                                      placeholder="KWT-COD-2026-..."
                                      className="w-full border border-border rounded-lg p-2 bg-surface text-ink"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => setSettlingCaseId(null)}
                                  >
                                    Batal
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="primary"
                                    onClick={() => handleSettlement(c.id)}
                                    className="bg-accent-green hover:bg-accent-green/90"
                                  >
                                    Simpan Pelunasan
                                  </Button>
                                </div>
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
        )
      ) : (
        /* ── TRANSACTIONS TABLE ─────────────────────────────────── */
        <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-muted uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4">No. Resi Pengiriman</th>
                  <th className="py-3 px-4">Kurir Pengantar</th>
                  <th className="py-3 px-4">Klien Ekspedisi</th>
                  <th className="py-3 px-4">Alamat Tujuan</th>
                  <th className="py-3 px-4">Nilai COD</th>
                  <th className="py-3 px-4">Disetor Kasir</th>
                  <th className="py-3 px-4">Selisih</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-ink">
                      {trx.trackingNumber}
                      <span className="text-[11px] text-muted block font-normal">{trx.transactionDate}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-ink">
                      {trx.courierName}
                    </td>
                    <td className="py-3 px-4 text-ink font-medium">
                      {trx.clientName}
                    </td>
                    <td className="py-3 px-4 text-muted max-w-xs truncate">
                      {trx.destination}
                    </td>
                    <td className="py-3 px-4 font-bold text-ink">
                      Rp {trx.codAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-accent-green">
                      Rp {trx.depositedAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {trx.difference < 0 ? (
                        <span className="text-primary-red">Rp {trx.difference.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-accent-green">Klop (Rp 0)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          trx.status === 'MATCHED'
                            ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                            : 'bg-primary-red/10 text-primary-red border border-primary-red/20'
                        }`}
                      >
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <CODCollectionModal
        isOpen={!!collectionCase}
        onClose={() => setCollectionCase(null)}
        codCase={collectionCase}
        onSubmit={handleRecordCollection}
      />

      <CODEscalateModal
        isOpen={!!escalateCase}
        onClose={() => setEscalateCase(null)}
        codCase={escalateCase}
        onEscalate={handleEscalateLegal}
      />
    </div>
  );
}
