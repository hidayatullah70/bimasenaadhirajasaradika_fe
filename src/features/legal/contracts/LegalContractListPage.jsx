/**
 * Legal Contract & PKS List Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 12.2 (Contract & Agreement),
 * Section 18 (Cross-department workflow: Director approval),
 * and docs/DEPARTMENT-INPUT-REPORTING-MATRIX.md.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Calendar,
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, EmptyState } from '@/components/ui/StateViews';
import legalAdapter from '@/services/adapters/legalAdapter';
import clientAdapter from '@/services/adapters/clientAdapter';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLES } from '@/constants/roles';
import { STATUS } from '@/constants/status';
import ContractFormModal from './ContractFormModal';

export default function LegalContractListPage() {
  const { hasRole, user } = useAuth();
  const canManage = hasRole([ROLES.DIREKTUR, ROLES.LEGAL]);
  const isDirector = hasRole([ROLES.DIREKTUR]);

  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  // Form Modal (Create / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  // Deletion Modal
  const [deletingContract, setDeletingContract] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ctrRes, clientRes] = await Promise.all([
        legalAdapter.getContracts({ search, status: selectedStatus, clientId: selectedClient }),
        clientAdapter.getClients({ pageSize: 50 }),
      ]);

      if (ctrRes.data) setContracts(ctrRes.data);
      if (clientRes.data) setClients(clientRes.data);
    } catch (err) {
      console.error('Failed to load legal contracts:', err);
      toast.error('Gagal memuat data perjanjian kerjasama.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, selectedClient]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = contracts.filter((c) => c.status === STATUS.ACTIVE).length;
  const expiringCount = contracts.filter((c) => c.status === STATUS.EXPIRING).length;
  const totalValue = contracts.reduce((sum, c) => sum + (c.monthlyValue || 0), 0);

  const handleOpenCreate = () => {
    setEditingContract(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (ctr) => {
    setEditingContract(ctr);
    setIsFormModalOpen(true);
  };

  const handleSaveContract = async (payload) => {
    try {
      if (editingContract) {
        await legalAdapter.updateContract(editingContract.id, payload);
        toast.success(`Dokumen PKS ${payload.contractNumber} berhasil diperbarui.`);
      } else {
        await legalAdapter.createContract(payload);
        toast.success(`Dokumen PKS ${payload.contractNumber} berhasil diregistrasi.`);
      }
      setIsFormModalOpen(false);
      loadData();
    } catch {
      toast.error('Gagal menyimpan dokumen PKS.');
    }
  };

  const handleOpenDelete = (ctr) => {
    if (ctr.pendingDelete) {
      toast('Dokumen PKS ini sedang dalam proses permohonan persetujuan penghapusan oleh Direktur Utama.', {
        icon: '⏳',
      });
      return;
    }
    setDeletingContract(ctr);
    setDeleteReason('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingContract) return;

    if (!isDirector && !deleteReason.trim()) {
      toast.error('Mohon isi alasan permohonan penghapusan.');
      return;
    }

    setIsDeleting(true);
    try {
      if (isDirector) {
        await legalAdapter.deleteContract(deletingContract.id, {
          deletedBy: user?.name || 'Juli Priyanto (Direktur Utama)',
          reason: deleteReason.trim() || 'Dihapus langsung oleh Direktur Utama',
        });
        toast.success(`Dokumen PKS ${deletingContract.contractNumber} berhasil dihapus.`);
      } else {
        await legalAdapter.requestDeleteContract(deletingContract.id, {
          reason: deleteReason.trim(),
          requestedBy: user?.name || 'Staff Legal',
          contractNumber: deletingContract.contractNumber,
          clientName: deletingContract.clientName,
        });
        toast.success(
          `Permohonan penghapusan PKS ${deletingContract.contractNumber} berhasil diajukan ke Direktur Utama.`
        );
      }
      setDeletingContract(null);
      setDeleteReason('');
      loadData();
    } catch {
      toast.error('Gagal memproses penghapusan kontrak.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-red" />
            <span>Dokumen Kontrak &amp; Perjanjian Kerjasama (PKS)</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Monitoring masa aktif perjanjian outsourcing, klausul SLA pelayanan, dan peringatan perpanjangan kontrak klien.
          </p>
        </div>

        {canManage && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            <span>Registrasi Kontrak PKS</span>
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-accent-green">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Kontrak PKS Aktif</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{activeCount} Perjanjian</h3>
              <p className="text-xs text-accent-green font-medium mt-1">Dalam masa berlaku efektif</p>
            </div>
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Perlu Perpanjangan Segera</p>
              <h3 className="text-2xl font-bold text-warning mt-1">{expiringCount} Kontrak</h3>
              <p className="text-xs text-muted mt-1">Berakhir dalam 60 hari ke depan</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Nilai Kontrak Bulanan Terikat</p>
              <h3 className="text-2xl font-bold text-ink mt-1">
                Rp {(totalValue / 1000000).toFixed(1)} Jt / Bln
              </h3>
              <p className="text-xs text-muted mt-1">Total komitmen pendapatan jasa</p>
            </div>
            <div className="p-3 rounded-xl bg-info/10 text-info">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Cari nomor PKS, nama klien, layanan..."
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
                <option value="">Semua Status Kontrak</option>
                <option value={STATUS.ACTIVE}>ACTIVE (Aktif)</option>
                <option value={STATUS.EXPIRING}>EXPIRING (Mendekati Berakhir)</option>
                <option value="LEGAL_REVIEW">LEGAL_REVIEW (Review Draf)</option>
                <option value={STATUS.EXPIRED}>EXPIRED (Kedaluwarsa)</option>
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

      {/* Contracts Table */}
      {loading ? (
        <LoadingState message="Memuat dokumen perjanjian kerjasama..." />
      ) : contracts.length === 0 ? (
        <EmptyState
          title="Tidak Ada Kontrak Ditemukan"
          description="Tidak ditemukan dokumen perjanjian kerjasama dengan filter yang dipilih."
          actionLabel={canManage ? 'Registrasi Kontrak PKS Baru' : undefined}
          onAction={canManage ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {contracts.map((ctr) => (
            <Card key={ctr.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-red/10 text-primary-red font-mono">
                        {ctr.contractNumber}
                      </span>
                      <h4 className="text-sm font-bold text-ink mt-2 line-clamp-1">{ctr.title}</h4>
                      <p className="text-xs text-primary-red font-medium flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 flex-none" />
                        <span>{ctr.clientName}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge status={ctr.status} size="sm" />
                      {ctr.pendingDelete && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                          <Clock className="h-3 w-3" />
                          <span>Menunggu Approval Hapus</span>
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted block">Layanan &amp; Kuota:</span>
                      <span className="font-semibold text-ink flex items-center gap-1 mt-0.5">
                        <Users className="h-3.5 w-3.5 text-muted" />
                        {ctr.serviceType} ({ctr.manpowerQuota || 1} Pos)
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block">Nilai Kontrak Bulanan:</span>
                      <span className="font-bold text-accent-green block mt-0.5 font-mono">
                        Rp {ctr.monthlyValue?.toLocaleString('id-ID')} / bln
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-muted flex items-center gap-1.5 border-t border-border pt-2.5">
                    <Calendar className="h-3.5 w-3.5 flex-none text-muted" />
                    <span>
                      Masa Berlaku: <strong className="text-ink">{ctr.startDate}</strong> s/d{' '}
                      <strong className={ctr.status === STATUS.EXPIRING ? 'text-primary-red font-bold' : 'text-ink'}>
                        {ctr.endDate}
                      </strong>
                    </span>
                  </div>

                  {ctr.slaTerms && (
                    <div className="text-xs bg-surface p-2.5 rounded-lg border border-border">
                      <span className="font-semibold text-muted block mb-0.5">Klausul Standar SLA:</span>
                      <span className="text-ink line-clamp-2">{ctr.slaTerms}</span>
                    </div>
                  )}

                  <div className="text-xs text-muted pt-1 flex items-center justify-between">
                    <span>PIC Legal Klien: <strong className="text-ink">{ctr.picLegalClient || '-'}</strong></span>
                    {ctr.status === STATUS.EXPIRING && (
                      <span className="text-[11px] text-warning font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Siapkan Adendum
                      </span>
                    )}
                  </div>
                </CardContent>
              </div>

              {/* Card Action Buttons (Edit / Delete) */}
              {canManage && (
                <div className="p-3 sm:px-5 sm:py-3 bg-canvas/30 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => handleOpenEdit(ctr)}
                    className="gap-1 text-ink"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Ubah Data</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => handleOpenDelete(ctr)}
                    disabled={ctr.pendingDelete}
                    className="gap-1 text-primary-red hover:bg-red-50 hover:border-red-200 border-border"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Contract Form Modal (Create / Edit) */}
      <ContractFormModal
        isOpen={isFormModalOpen}
        contract={editingContract}
        clients={clients}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveContract}
      />

      {/* Deletion / Deletion Approval Modal */}
      {deletingContract && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingContract(null)}
          title={isDirector ? 'Konfirmasi Hapus Kontrak PKS' : 'Pengajuan Hapus Dokumen Kontrak PKS'}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-mono text-2xs font-bold text-primary-red">
                {deletingContract.contractNumber}
              </span>
              <h4 className="font-bold text-ink text-sm mt-0.5">{deletingContract.title}</h4>
              <p className="text-muted mt-1">
                Klien: <strong className="text-ink">{deletingContract.clientName}</strong> · Layanan: {deletingContract.serviceType}
              </p>
              <p className="text-muted">
                Nilai Bulanan: <strong className="text-emerald-700 font-mono">Rp {deletingContract.monthlyValue?.toLocaleString('id-ID')}</strong>
              </p>
            </div>

            {isDirector ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-red-700" />
                  Otorisasi Direktur Utama
                </p>
                <p className="text-[11px] mt-1 text-red-800">
                  Anda login sebagai Direktur Utama. Konfirmasi ini akan menghapus dokumen kontrak PKS secara permanen dari sistem.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <p className="font-semibold flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-700" />
                  Pemisahan Wewenang (Segregation of Duties)
                </p>
                <p className="text-[11px] mt-1 text-amber-800">
                  Sesuai kebijakan PT. BARAK, penghapusan dokumen PKS tidak dapat dilakukan langsung oleh staf dan wajib melalui persetujuan (approval) resmi dari Direktur Utama.
                </p>
              </div>
            )}

            <div>
              <label className="block font-medium text-ink mb-1">
                {isDirector ? 'Catatan / Alasan Penghapusan (Opsional)' : 'Alasan Permohonan Penghapusan * (Wajib Diisi)'}
              </label>
              <textarea
                rows={3}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={
                  isDirector
                    ? 'Tuliskan catatan penghapusan...'
                    : 'Jelaskan alasan mengapa dokumen kontrak PKS ini perlu dihapus...'
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-white text-ink focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setDeletingContract(null)} disabled={isDeleting}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="gap-1.5 bg-primary-red hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  'Memproses...'
                ) : isDirector ? (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Hapus Kontrak PKS</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    <span>Ajukan ke Direktur Utama</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

