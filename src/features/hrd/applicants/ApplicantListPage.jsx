/**
 * Data Pelamar Masuk — PT. BARAK IOMS (Divisi HRD)
 * Source of Truth: Landing Page Job Applications & HRD Applicant Lifecycle
 * Features:
 * - Direct intake from Landing Page (Formulir Lamaran Kerja)
 * - DETAIL viewing with complete eKTP & BCA account breakdown
 * - DITERIMA action: Automatically transfers profile into Master Data Terpadu (Karyawan)
 * - DITOLAK action: Archives into "Data Arsip Pelamar Ditolak" for retrieval anytime
 * - Full CRUD capabilities
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Archive,
  Edit2,
  Trash2,
  Clock,
  RotateCcw,
  Building,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import applicantAdapter from '@/services/adapters/applicantAdapter';
import clientAdapter from '@/services/adapters/clientAdapter';
import locationAdapter from '@/services/adapters/locationAdapter';
import ApplicantDetailModal from './ApplicantDetailModal';
import ApplicantAcceptModal from './ApplicantAcceptModal';
import ApplicantRejectModal from './ApplicantRejectModal';
import ApplicantFormModal from './ApplicantFormModal';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { key: 'ALL', label: 'Semua Pelamar' },
  { key: 'MASUK', label: 'Menunggu Review' },
  { key: 'DITERIMA', label: 'Diterima (Karyawan)' },
  { key: 'DITOLAK', label: 'Data Arsip Ditolak' },
];

export default function ApplicantListPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [applicants, setApplicants] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  // Dynamic clients & locations for accept modal
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);

  // Modals state
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);

  const loadFormOptions = useCallback(async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        clientAdapter.getClients({ pageSize: 100 }),
        locationAdapter.getLocations({ pageSize: 100 }),
      ]);
      if (cRes.data) setClients(cRes.data);
      if (lRes.data) setLocations(lRes.data);
    } catch (err) {
      console.warn('Failed to load form options:', err);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === 'ALL' ? '' : activeTab;
      const res = await applicantAdapter.getApplicants({
        search,
        status: statusParam,
        department: selectedDept,
        page,
        pageSize,
      });
      if (res.data) {
        setApplicants(res.data);
        setMeta(res.meta || { total: res.data.length, page: 1, totalPages: 1 });
      }
    } catch {
      toast.error('Gagal memuat data pelamar masuk.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, selectedDept, page]);

  useEffect(() => {
    loadData();
    loadFormOptions();
  }, [loadData, loadFormOptions]);

  // Listen for live landing page applications
  useEffect(() => {
    const handleNewApplicant = () => {
      loadData();
    };
    window.addEventListener('barak:applicant:created', handleNewApplicant);
    return () => {
      window.removeEventListener('barak:applicant:created', handleNewApplicant);
    };
  }, [loadData]);

  // Summary counts
  const [allApplicantsForStats, setAllApplicantsForStats] = useState([]);
  useEffect(() => {
    async function loadAllStats() {
      try {
        const res = await applicantAdapter.getApplicants({ pageSize: 500 });
        if (res.data) setAllApplicantsForStats(res.data);
      } catch {
        // ignore
      }
    }
    loadAllStats();
  }, [applicants]);

  const stats = useMemo(() => {
    const total = allApplicantsForStats.length;
    const masuk = allApplicantsForStats.filter((a) => a.status === 'MASUK').length;
    const diterima = allApplicantsForStats.filter((a) => a.status === 'DITERIMA').length;
    const ditolak = allApplicantsForStats.filter((a) => a.status === 'DITOLAK').length;
    return { total, masuk, diterima, ditolak };
  }, [allApplicantsForStats]);

  // Handlers
  const handleOpenDetail = (app) => {
    setSelectedApplicant(app);
    setIsDetailOpen(true);
  };

  const handleOpenAccept = (app) => {
    setSelectedApplicant(app);
    setIsAcceptOpen(true);
  };

  const handleOpenReject = (app) => {
    setSelectedApplicant(app);
    setIsRejectOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingApplicant(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (app) => {
    setEditingApplicant(app);
    setIsFormOpen(true);
  };

  const handleConfirmAccept = async (id, placementOverrides) => {
    try {
      const res = await applicantAdapter.acceptApplicant(id, placementOverrides);
      if (res.error) {
        toast.error(res.error.message || 'Gagal menerima pelamar.');
        return;
      }
      toast.success(
        `Pelamar ${res.data.applicant.namaLengkap} berhasil DITERIMA dan resmi ditambahkan ke Master Data Terpadu!`
      );
      loadData();
      setIsDetailOpen(false);
    } catch {
      toast.error('Terjadi kesalahan saat memproses data pelamar.');
    }
  };

  const handleConfirmReject = async (id, reason) => {
    try {
      const res = await applicantAdapter.rejectApplicant(id, reason);
      if (res.error) {
        toast.error(res.error.message || 'Gagal mengarsipkan pelamar.');
        return;
      }
      toast.success('Data pelamar berhasil dipindahkan ke Data Arsip Pelamar Ditolak.');
      loadData();
      setIsDetailOpen(false);
    } catch {
      toast.error('Terjadi kesalahan saat mengarsipkan data pelamar.');
    }
  };

  const handleRestore = async (app) => {
    try {
      await applicantAdapter.restoreApplicant(app.id);
      toast.success(`Data pelamar ${app.namaLengkap} dikembalikan ke status Menunggu Review.`);
      loadData();
      setIsDetailOpen(false);
    } catch {
      toast.error('Gagal memulihkan status pelamar.');
    }
  };

  const handleDelete = async (app) => {
    if (!window.confirm(`Hapus permanen rekaman pelamar ${app.namaLengkap}?`)) return;
    try {
      await applicantAdapter.deleteApplicant(app.id);
      toast.success('Data pelamar berhasil dihapus.');
      loadData();
      setIsDetailOpen(false);
    } catch {
      toast.error('Gagal menghapus data pelamar.');
    }
  };

  const handleSaveForm = async (formData) => {
    try {
      if (editingApplicant) {
        await applicantAdapter.updateApplicant(editingApplicant.id, formData);
        toast.success(`Data pelamar ${formData.namaLengkap} berhasil diperbarui.`);
      } else {
        await applicantAdapter.createApplicant(formData);
        toast.success(`Pelamar ${formData.namaLengkap} berhasil ditambahkan.`);
      }
      setIsFormOpen(false);
      loadData();
    } catch {
      toast.error('Gagal menyimpan formulir pelamar.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
            <Users className="h-6 w-6 text-primary-red" />
            Data Pelamar Masuk
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Data pelamar online dari Formulir Lamaran Kerja website PT. BARAK. Kelola verifikasi, terima ke Master Karyawan, atau arsipkan.
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="sm" className="gap-2 bg-primary-red hover:bg-primary-red/90 text-white font-semibold">
          <Plus className="h-4 w-4" />
          <span>+ Tambah Pelamar Manual</span>
        </Button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted font-medium">Total Pelamar Terdata</p>
              <p className="text-xl sm:text-2xl font-bold text-ink mt-0.5">{stats.total}</p>
              <p className="text-[11px] text-muted mt-0.5">Seluruh berkas masuk</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted font-medium">Menunggu Review</p>
              <p className="text-xl sm:text-2xl font-bold text-warning mt-0.5">{stats.masuk}</p>
              <p className="text-[11px] text-muted mt-0.5">Perlu tindak lanjut</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted font-medium">Diterima (Karyawan)</p>
              <p className="text-xl sm:text-2xl font-bold text-accent-green mt-0.5">{stats.diterima}</p>
              <p className="text-[11px] text-muted mt-0.5">Di Master Data Terpadu</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted font-medium">Data Arsip Ditolak</p>
              <p className="text-xl sm:text-2xl font-bold text-error mt-0.5">{stats.ditolak}</p>
              <p className="text-[11px] text-muted mt-0.5">Tersimpan aman di arsip</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-error/10 flex items-center justify-center text-error">
              <Archive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        {/* Tabs Bar */}
        <div className="flex border-b border-border space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none pb-2">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count =
              tab.key === 'ALL'
                ? stats.total
                : tab.key === 'MASUK'
                ? stats.masuk
                : tab.key === 'DITERIMA'
                ? stats.diterima
                : stats.ditolak;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-red/10 text-primary-red'
                    : 'text-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-primary-red text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Department Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama pelamar, NIK, No HP, atau posisi..."
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-canvas/30 text-ink placeholder:text-muted focus:bg-white focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted" />
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-border rounded-lg bg-white text-ink font-medium"
            >
              <option value="">Semua Layanan / Departemen</option>
              <option value="Head Office (HO)">Head Office (HO)</option>
              <option value="Jasa Pengamanan / Security">Jasa Pengamanan / Security</option>
              <option value="Ekspedisi Kurir">Ekspedisi Kurir</option>
              <option value="Parkir">Parkir</option>
              <option value="Cleaning Service">Cleaning Service</option>
              <option value="Man Power">Man Power</option>
              <option value="Loss Prevention">Loss Prevention</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12">
            <StateLoading message="Memuat data pelamar kerja..." />
          </div>
        ) : applicants.length === 0 ? (
          <div className="p-12">
            <StateEmpty
              title={
                activeTab === 'DITOLAK'
                  ? 'Tidak Ada Pelamar di Arsip Ditolak'
                  : activeTab === 'DITERIMA'
                  ? 'Belum Ada Pelamar yang Diterima'
                  : 'Belum Ada Data Pelamar'
              }
              message={
                activeTab === 'DITOLAK'
                  ? 'Seluruh pelamar yang ditolak akan diarsipkan di sini dan bisa dipulihkan kembali sewaktu-waktu.'
                  : 'Data pelamar yang mengisi Formulir Lamaran Kerja di landing page akan otomatis muncul di sini.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas/80 text-muted uppercase tracking-wider font-semibold border-b border-border">
                <tr>
                  <th className="px-4 py-3.5">Pelamar</th>
                  <th className="px-4 py-3.5">NIK & Kontak</th>
                  <th className="px-4 py-3.5">Formasi & Layanan</th>
                  <th className="px-4 py-3.5">Rekening BCA</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Tgl Lamar</th>
                  <th className="px-4 py-3.5 text-right">Aksi HRD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applicants.map((app) => {
                  const isMasuk = app.status === 'MASUK';
                  const isDiterima = app.status === 'DITERIMA';
                  const isDitolak = app.status === 'DITOLAK';

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-canvas/50 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(app)}
                    >
                      {/* Pelamar Profile */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary-red/10 text-primary-red font-bold flex items-center justify-center flex-none">
                            {app.namaLengkap ? app.namaLengkap.charAt(0) : 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-ink">{app.namaLengkap}</p>
                            <p className="text-[11px] text-muted font-mono">{app.id} • {app.usia || 25} th</p>
                          </div>
                        </div>
                      </td>

                      {/* NIK & Kontak */}
                      <td className="px-4 py-3">
                        <p className="font-mono text-ink font-semibold">{app.nik}</p>
                        <p className="text-[11px] text-muted">{app.noHpWa || '-'}</p>
                      </td>

                      {/* Layanan & Posisi */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{app.departemen}</p>
                        <p className="text-[11px] text-muted">{app.posisi}</p>
                      </td>

                      {/* Rekening BCA */}
                      <td className="px-4 py-3">
                        <p className="font-mono text-ink font-semibold">{app.nomorRekening || '-'}</p>
                        <p className="text-[11px] text-muted truncate max-w-[140px]">
                          a.n {app.namaPemilikRekening || app.namaLengkap}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {isDiterima && (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Diterima
                          </Badge>
                        )}
                        {isDitolak && (
                          <Badge variant="danger" className="gap-1">
                            <Archive className="h-3 w-3" /> Arsip Ditolak
                          </Badge>
                        )}
                        {isMasuk && (
                          <Badge variant="warning" className="gap-1">
                            <Clock className="h-3 w-3" /> Review
                          </Badge>
                        )}
                      </td>

                      {/* Tanggal Lamar */}
                      <td className="px-4 py-3 text-muted">
                        {app.tanggalLamar || '-'}
                      </td>

                      {/* Aksi Button */}
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* DETAIL */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(app)}
                            className="px-2.5 py-1 text-xs rounded border border-border bg-white text-muted hover:text-ink hover:border-slate/40 transition-colors font-medium"
                            title="Lihat Detail Lengkap"
                          >
                            Detail
                          </button>

                          {/* DITERIMA */}
                          {isMasuk && (
                            <button
                              type="button"
                              onClick={() => handleOpenAccept(app)}
                              className="px-2.5 py-1 text-xs rounded border border-accent-green/40 bg-accent-green/10 text-accent-green hover:bg-accent-green hover:text-white transition-colors font-semibold flex items-center gap-1"
                              title="Terima & Masukkan ke Master Data Terpadu"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Diterima</span>
                            </button>
                          )}

                          {/* DITOLAK */}
                          {isMasuk && (
                            <button
                              type="button"
                              onClick={() => handleOpenReject(app)}
                              className="px-2.5 py-1 text-xs rounded border border-error/30 bg-white text-error hover:bg-error/10 hover:border-error transition-colors font-semibold flex items-center gap-1"
                              title="Tolak & Pindahkan ke Arsip"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Ditolak</span>
                            </button>
                          )}

                          {/* RESTORE JIKA DITOLAK */}
                          {isDitolak && (
                            <button
                              type="button"
                              onClick={() => handleRestore(app)}
                              className="px-2 py-1 text-xs rounded border border-border bg-white text-ink hover:bg-canvas transition-colors font-medium flex items-center gap-1"
                              title="Pulihkan dari Arsip Ditolak ke Review"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-primary-red" />
                              <span>Pulihkan</span>
                            </button>
                          )}

                          {/* EDIT & DELETE */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(app)}
                            className="p-1 text-muted hover:text-ink hover:bg-canvas rounded transition-colors"
                            title="Edit Data Pelamar"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(app)}
                            className="p-1 text-muted hover:text-error hover:bg-error/10 rounded transition-colors"
                            title="Hapus Data Pelamar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted bg-canvas/30">
            <span>
              Menampilkan {applicants.length} dari {meta.total} pelamar
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="font-semibold text-ink px-2">
                {page} / {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ApplicantDetailModal
        applicant={selectedApplicant}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAccept={handleOpenAccept}
        onReject={handleOpenReject}
        onRestore={handleRestore}
      />

      <ApplicantAcceptModal
        applicant={selectedApplicant}
        isOpen={isAcceptOpen}
        onClose={() => setIsAcceptOpen(false)}
        onConfirm={handleConfirmAccept}
        clients={clients}
        locations={locations}
      />

      <ApplicantRejectModal
        applicant={selectedApplicant}
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleConfirmReject}
      />

      <ApplicantFormModal
        applicant={editingApplicant}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveForm}
      />
    </div>
  );
}
