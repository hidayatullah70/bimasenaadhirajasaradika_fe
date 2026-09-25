/**
 * Legal Case List Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 12 (Legal Module), Section 12.5 (COD Case), and Section 22.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Scale,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldAlert,
  Send,
  Building2,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import legalAdapter from '@/services/adapters/legalAdapter';
import clientAdapter from '@/services/adapters/clientAdapter';
import LegalCaseFormModal from './LegalCaseFormModal';
import LegalActionModal from './LegalActionModal';
import { STATUS } from '@/constants/status';

export default function LegalCaseListPage() {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals & Expand
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [actionCase, setActionCase] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Close Case Inline State
  const [closingCaseId, setClosingCaseId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [casesRes, clientRes] = await Promise.all([
        legalAdapter.getLegalCases({
          search,
          caseType: selectedCaseType,
          priority: selectedPriority,
          status: selectedStatus,
          pageSize: 50,
        }),
        clientAdapter.getClients({ pageSize: 50 }),
      ]);

      if (casesRes.data) setCases(casesRes.data);
      if (clientRes.data) setClients(clientRes.data);
    } catch (err) {
      console.error('Failed to load legal cases:', err);
      toast.error('Gagal memuat data kasus legal.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCaseType, selectedPriority, selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateCase = async (payload) => {
    const res = await legalAdapter.createLegalCase(payload);
    if (res.error) throw res.error;
    toast.success('Berkas perkara hukum baru berhasil didaftarkan.');
    loadData();
  };

  const handleAddAction = async (caseId, payload) => {
    const res = await legalAdapter.addLegalAction(caseId, payload);
    if (res.error) throw res.error;
    toast.success('Tindakan hukum resmi berhasil dicatat.');
    loadData();
  };

  const handleCloseCase = async (caseId) => {
    if (!resolutionNotes.trim()) {
      toast.error('Resume putusan / penyelesaian perkara wajib diisi.');
      return;
    }
    const res = await legalAdapter.closeLegalCase(caseId, { resolutionNotes });
    if (res.error) {
      toast.error(res.error.message || 'Gagal menutup kasus.');
      return;
    }
    toast.success('Kasus hukum dinyatakan selesai dan ditutup (Closed).');
    setClosingCaseId(null);
    setResolutionNotes('');
    loadData();
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-primary-red text-white rounded">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded">MEDIUM</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary-red" />
            <span>Manajemen Kasus Hukum & Somasi Penagihan</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Penanganan sengketa kontrak, pelimpahan kasus kurir COD, somasi penjamin, koordinasi kepolisian, dan mediasi.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsFormOpen(true)}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Buka Kasus Baru</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Cari nomor kasus, subjek, pihak..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>

            <div>
              <select
                value={selectedCaseType}
                onChange={(e) => setSelectedCaseType(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Kategori Perkara</option>
                <option value="COD_DISPUTE">Sengketa Setoran COD Kurir</option>
                <option value="CRIMINAL_ATTEMPT">Percobaan Pidana / Perusakan Aset</option>
                <option value="EMPLOYMENT_MISCONDUCT">Pelanggaran Disiplin Berat (SP)</option>
                <option value="CIVIL_DISPUTE">Klaim Ganti Rugi Perdata</option>
                <option value="COMPLIANCE_FRAUD">Dugaan Pemalsuan Dokumen</option>
                <option value="ASSET_DISPUTE">Sengketa Inventaris Pos Jaga</option>
              </select>
            </div>

            <div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Tingkat Prioritas</option>
                <option value="HIGH">HIGH (Prioritas Tinggi)</option>
                <option value="MEDIUM">MEDIUM (Sedang)</option>
                <option value="LOW">LOW (Rendah)</option>
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary-red/20"
              >
                <option value="">Semua Status Kasus</option>
                <option value={STATUS.OPEN}>OPEN (Baru Masuk)</option>
                <option value={STATUS.LEGAL_REVIEW}>LEGAL_REVIEW (Pemeriksaan)</option>
                <option value={STATUS.IN_PROGRESS}>IN_PROGRESS (Dalam Proses)</option>
                <option value={STATUS.ACTION_TAKEN}>ACTION_TAKEN (Somasi Terbit)</option>
                <option value={STATUS.RESOLVED}>RESOLVED (Selesai)</option>
                <option value={STATUS.CLOSED}>CLOSED (Ditutup)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      {loading ? (
        <LoadingState message="Memuat berkas perkara hukum..." />
      ) : cases.length === 0 ? (
        <EmptyState
          title="Tidak Ada Berkas Kasus Hukum"
          description="Tidak ditemukan perkara hukum aktif dengan filter pencarian yang diterapkan saat ini."
        />
      ) : (
        <div className="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50 text-muted uppercase font-semibold tracking-wider">
                  <th className="py-3 px-4">No. Kasus / Tgl</th>
                  <th className="py-3 px-4">Subjek & Kategori</th>
                  <th className="py-3 px-4">Pihak Terlapor & Klien</th>
                  <th className="py-3 px-4">Dampak Nilai (Rp)</th>
                  <th className="py-3 px-4">Asal Bagian</th>
                  <th className="py-3 px-4">Prioritas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cases.map((c) => {
                  const isExpanded = expandedId === c.id;
                  const isClosing = closingCaseId === c.id;

                  return (
                    <React.Fragment key={c.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-ink block">{c.caseNumber}</span>
                          <span className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {c.reportDate}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-bold text-ink block line-clamp-1">{c.subject}</span>
                          <span className="text-[11px] text-muted block line-clamp-1">{c.caseTypeLabel || c.caseType}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-primary-red block">{c.targetEntity}</span>
                          <span className="text-[11px] text-muted block">{c.clientName}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-ink">
                          {c.financialImpact > 0 ? (
                            `Rp ${c.financialImpact.toLocaleString('id-ID')}`
                          ) : (
                            <span className="text-muted font-normal">Non-Materil</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-semibold text-muted">
                            {c.sourceDepartment}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getPriorityBadge(c.priority)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge status={c.status} size="sm" />
                          {c.deadline && (
                            <span className="text-[10px] text-muted block mt-0.5">
                              Tempo: {c.deadline}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : c.id)}
                              className="p-1.5 text-muted hover:text-ink hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1"
                              title="Detail Berkas & Alat Bukti"
                            >
                              <span>Berkas</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>

                            {c.status !== STATUS.CLOSED && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setActionCase(c)}
                                  className="p-1.5 text-primary-red hover:bg-primary-red/10 rounded-lg font-medium text-xs flex items-center gap-1"
                                  title="Catat Somasi / Tindakan Hukum"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  <span>Somasi</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setClosingCaseId(isClosing ? null : c.id)}
                                  className="p-1.5 text-accent-green hover:bg-accent-green/10 rounded-lg font-medium text-xs flex items-center gap-1"
                                  title="Tutup / Selesaikan Perkara"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Tutup</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Case Dossier Panel */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={8} className="p-4 border-b border-border">
                            <div className="bg-white p-4 rounded-xl border border-border shadow-2xs space-y-4">
                              <div>
                                <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-1">
                                  Kronologi Kejadian & Uraian Fakta
                                </h5>
                                <p className="text-xs text-ink whitespace-pre-line bg-surface p-3 rounded-lg border border-border">
                                  {c.chronology}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                                    Daftar Alat Bukti Terlampir
                                  </h5>
                                  <ul className="list-disc list-inside space-y-1 bg-surface p-2.5 rounded-lg border border-border text-muted">
                                    {(c.evidence || []).map((ev, evIdx) => (
                                      <li key={evIdx} className="text-ink">{ev}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                                    Saksi-Saksi Terkait
                                  </h5>
                                  <ul className="list-disc list-inside space-y-1 bg-surface p-2.5 rounded-lg border border-border text-muted">
                                    {(c.witnesses || []).map((wit, wIdx) => (
                                      <li key={wIdx} className="text-ink">{wit}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Action History */}
                              <div>
                                <h5 className="text-xs font-bold text-ink uppercase tracking-wider mb-1.5">
                                  Riwayat Tindakan Hukum & Surat Resmi ({c.actions?.length || 0})
                                </h5>
                                {(!c.actions || c.actions.length === 0) ? (
                                  <p className="text-xs text-muted italic bg-surface p-2 rounded-lg border border-border">
                                    Belum ada catatan tindakan hukum lanjutan untuk berkas perkara ini.
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {c.actions.map((act) => (
                                      <div
                                        key={act.id}
                                        className="p-2.5 bg-surface rounded-lg border border-border text-xs space-y-1"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-primary-red">{act.title}</span>
                                          <span className="text-muted text-[11px]">{act.actionDate}</span>
                                        </div>
                                        <p className="text-ink">{act.description}</p>
                                        <span className="text-[10px] text-muted block">
                                          Oleh: {act.recordedBy}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {c.resolutionNotes && (
                                <div className="p-3 bg-accent-green/10 rounded-lg border border-accent-green/20 text-xs">
                                  <span className="font-bold text-accent-green">Resume Putusan / Perdamaian:</span>{' '}
                                  <span className="text-ink">{c.resolutionNotes}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Inline Close Case Box */}
                      {isClosing && (
                        <tr className="bg-accent-green/5">
                          <td colSpan={8} className="p-4 border-b border-accent-green/20">
                            <div className="bg-white p-4 rounded-xl border border-accent-green/30 shadow-2xs space-y-3 max-w-xl ml-auto">
                              <h5 className="text-xs font-bold text-ink flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-accent-green" />
                                <span>Penyelesaian & Penutupan Perkara #{c.caseNumber}</span>
                              </h5>
                              <textarea
                                rows={2}
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="Tuliskan resume kesepakatan damai, pembayaran kerugian selesai, atau putusan administratif..."
                                className="w-full text-xs border border-border rounded-lg p-2.5 bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent-green/20"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => setClosingCaseId(null)}
                                >
                                  Batal
                                </Button>
                                <Button
                                  size="xs"
                                  variant="primary"
                                  onClick={() => handleCloseCase(c.id)}
                                  className="bg-accent-green hover:bg-accent-green/90"
                                >
                                  Tutup Kasus (Closed)
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
      )}

      {/* Modals */}
      <LegalCaseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        clients={clients}
        onSubmit={handleCreateCase}
      />

      <LegalActionModal
        isOpen={!!actionCase}
        onClose={() => setActionCase(null)}
        legalCase={actionCase}
        onSubmit={handleAddAction}
      />
    </div>
  );
}
