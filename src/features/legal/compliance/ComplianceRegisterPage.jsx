/**
 * Compliance Register Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 12.3 (Compliance & License Monitoring),
 * Section 19 (RBAC), and Governance Rule: All deletions require Direktur Utama approval.
 *
 * Full CRUD + Maker-Checker approval workflow:
 * - Create: Tambah Dokumen Perizinan (SIO BUJP / ISO / Sertifikasi)
 * - Read: Detail, Search, Category Filter, Status Filter
 * - Update: Edit Dokumen Perizinan
 * - Delete: Pengajuan Hapus ke Direktur Utama (Maker-Checker)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Building,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/StateViews';
import legalAdapter from '@/services/adapters/legalAdapter';
import ComplianceFormModal from './ComplianceFormModal';
import ComplianceDetailModal from './ComplianceDetailModal';
import ComplianceDeleteModal from './ComplianceDeleteModal';

export default function ComplianceRegisterPage() {
  const [complianceItems, setComplianceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const loadCompliance = async () => {
    setLoading(true);
    try {
      const res = await legalAdapter.getComplianceRegister();
      if (res.data) setComplianceItems(res.data);
    } catch (err) {
      console.error('Failed to load compliance data:', err);
      toast.error('Gagal memuat data kepatuhan & perizinan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompliance();
  }, []);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return complianceItems.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.licenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.remarks && item.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'ALL' || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [complianceItems, searchTerm, categoryFilter, statusFilter]);

  const compliantCount = complianceItems.filter((i) => i.status === 'COMPLIANT').length;
  const attentionCount = complianceItems.filter((i) => i.status === 'ATTENTION_NEEDED').length;
  const expiredCount = complianceItems.filter((i) => i.status === 'EXPIRED').length;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (item) => {
    setDetailItem(item);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (item) => {
    setDeletingItem(item);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary-red" />
            <span>Register Kepatuhan & Perizinan Operasional (SIO BUJP)</span>
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Pengawasan keabsahan legalitas perizinan operasional Mabes Polri, Polda Metro Jaya, sertifikasi ISO, dan audit ketenagakerjaan.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-none">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Dokumen Izin</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-accent-green">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Izin & Lisensi Patuh (Compliant)</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{compliantCount} Dokumen Sah</h3>
              <p className="text-xs text-accent-green font-medium mt-1">SIO Polri & Rekomendasi Polda berlaku</p>
            </div>
            <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Perlu Perpanjangan / Surveillance</p>
              <h3 className="text-2xl font-bold text-warning mt-1">{attentionCount} Perizinan</h3>
              <p className="text-xs text-muted mt-1">Audit surveillance ISO & perpanjangan izin</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Register Izin Aktif</p>
              <h3 className="text-2xl font-bold text-ink mt-1">{complianceItems.length} Dokumen</h3>
              <p className="text-xs text-muted mt-1">
                {expiredCount > 0 ? `${expiredCount} dokumen kadaluwarsa` : '100% Memenuhi standar legalitas'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-info/10 text-info">
              <Award className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama izin, nomor, instansi..."
            className="w-full pl-9 pr-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red text-ink text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-muted">
            <Filter className="h-3.5 w-3.5" />
            <span>Kategori:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-border rounded-xl text-ink text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-red/30"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="PERIZINAN_UTAMA">Perizinan Utama (Mabes Polri)</option>
            <option value="PERIZINAN_WILAYAH">Perizinan Wilayah (Polda)</option>
            <option value="K3_DAN_KESELAMATAN">K3 & Keselamatan (Kemnaker)</option>
            <option value="MANAJEMEN_MUTU">Manajemen Mutu (ISO)</option>
            <option value="PERIZINAN_LOGISTIK">Transportasi & Logistik (OSS)</option>
            <option value="KETENAGAKERJAAN">Ketenagakerjaan (BPJS)</option>
            <option value="PERIZINAN_LAINNYA">Perizinan Lainnya</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-border rounded-xl text-ink text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-red/30"
          >
            <option value="ALL">Semua Status</option>
            <option value="COMPLIANT">Patuh & Sah (Compliant)</option>
            <option value="ATTENTION_NEEDED">Perlu Perhatian</option>
            <option value="EXPIRED">Kadaluwarsa</option>
          </select>
        </div>
      </div>

      {/* Compliance Register List */}
      {loading ? (
        <LoadingState message="Memuat dokumen perizinan operasional..." />
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-border space-y-2">
          <ShieldCheck className="h-10 w-10 text-muted mx-auto stroke-1" />
          <h4 className="font-bold text-ink text-sm">Tidak Ada Dokumen Perizinan Ditemukan</h4>
          <p className="text-xs text-muted max-w-md mx-auto">
            {searchTerm || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'Tidak ada perizinan yang sesuai dengan filter pencarian Anda.'
              : 'Belum ada dokumen perizinan terdaftar. Klik "Tambah Dokumen Izin" untuk memulai.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isPendingDelete = Boolean(item.pendingDelete);

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface border border-border text-muted">
                            {item.category}
                          </span>
                          {isPendingDelete && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-warning/15 text-warning-dark border border-warning/30 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Menunggu Direktur
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-ink mt-2 line-clamp-2 leading-tight">
                          {item.licenseName}
                        </h4>
                        <p className="text-xs text-primary-red font-medium mt-1 truncate">
                          {item.issuingAuthority}
                        </p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold flex-none ${
                          item.status === 'COMPLIANT'
                            ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                            : item.status === 'ATTENTION_NEEDED'
                            ? 'bg-warning/10 text-warning border border-warning/20'
                            : 'bg-danger/10 text-danger border border-danger/20'
                        }`}
                      >
                        {item.status === 'COMPLIANT'
                          ? 'PATUH'
                          : item.status === 'ATTENTION_NEEDED'
                          ? 'SURVEILLANCE'
                          : 'KADALUWARSA'}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="text-xs space-y-1">
                      <span className="text-muted block text-[11px]">Nomor Surat / Sertifikat:</span>
                      <span className="font-semibold text-ink font-mono bg-surface p-1.5 rounded border border-border block truncate text-xs">
                        {item.licenseNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-2.5">
                      <div>
                        <span className="text-muted block text-[11px]">Berlaku Sejak:</span>
                        <span className="font-medium text-ink">{item.validFrom || '-'}</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[11px]">Masa Berlaku:</span>
                        <span className="font-bold text-ink truncate block">{item.validUntil || 'Berlaku Efektif'}</span>
                      </div>
                    </div>

                    <div className="text-xs border-t border-border pt-2.5 space-y-1">
                      <div className="flex items-center justify-between text-muted text-[11px]">
                        <span>Audit Terakhir:</span>
                        <span className="font-medium text-ink">{item.lastAuditDate || '-'}</span>
                      </div>
                      {item.remarks && (
                        <p className="text-[11px] text-muted line-clamp-2 bg-surface p-2 rounded-lg border border-border">
                          {item.remarks}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3 sm:px-5 border-t border-border bg-canvas/50 flex items-center justify-between text-xs rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(item)}
                    className="inline-flex items-center gap-1.5 text-muted hover:text-ink font-medium transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Detail</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-white border border-transparent hover:border-border transition-colors"
                      title="Edit Dokumen Izin"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={isPendingDelete}
                      onClick={() => handleOpenDelete(item)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isPendingDelete
                          ? 'opacity-40 cursor-not-allowed text-muted'
                          : 'text-muted hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20'
                      }`}
                      title={
                        isPendingDelete
                          ? 'Menunggu Persetujuan Direktur Utama'
                          : 'Ajukan Hapus Dokumen Izin ke Direktur Utama'
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ComplianceFormModal
        isOpen={isFormOpen}
        initialData={editingItem}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSuccess={loadCompliance}
      />

      <ComplianceDetailModal
        isOpen={isDetailOpen}
        item={detailItem}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailItem(null);
        }}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <ComplianceDeleteModal
        isOpen={isDeleteOpen}
        item={deletingItem}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingItem(null);
        }}
        onSuccess={loadCompliance}
      />
    </div>
  );
}
