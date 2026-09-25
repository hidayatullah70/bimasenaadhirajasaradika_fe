/**
 * IT Assets Inventory Page — PT. BARAK IOMS
 * Source of Truth: PRD Section 16 (IT Support Module: Assets Management), Section 14, Section 22.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Server,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Tag,
  User,
  Calendar,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import toast from 'react-hot-toast';
import { itAdapter } from '@/services/adapters/itAdapter';
import { useAuth } from '@/hooks/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import AssetFormModal from './AssetFormModal';

const ASSET_TYPES = [
  { value: '', label: 'Semua Jenis Perangkat' },
  { value: 'BARRIER_GATE', label: 'Barrier Gate & Palang' },
  { value: 'CCTV_SYSTEM', label: 'CCTV & Kamera Surveilans' },
  { value: 'BIOMETRIC_FINGERPRINT', label: 'Mesin Biometrik Absensi' },
  { value: 'POS_COMPUTER', label: 'Komputer Posko & Kasir' },
  { value: 'NETWORK_ROUTER', label: 'Router & Jaringan' },
  { value: 'BACKUP_SERVER', label: 'Server & Cadangan' },
  { value: 'HARDWARE_POS', label: 'Perangkat Pos Lainnya' },
];

const STATUSES = [
  { value: '', label: 'Semua Status' },
  { value: 'ACTIVE', label: 'Aktif / Operasional' },
  { value: 'MAINTENANCE', label: 'Dalam Pemeliharaan' },
  { value: 'BROKEN', label: 'Rusak / Perlu Penggantian' },
  { value: 'RETIRED', label: 'Dinonaktifkan' },
];

export default function AssetListPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.IT_ASSET_MANAGE);

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assetType, setAssetType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await itAdapter.getAssets({
        search,
        assetType,
        status,
        page,
        pageSize: 12,
      });
      if (res.data) {
        setAssets(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat inventaris aset IT.');
    } finally {
      setLoading(false);
    }
  }, [search, assetType, status, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (assetId, newStatus) => {
    try {
      const res = await itAdapter.updateAssetStatus(assetId, newStatus);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Status aset diperbarui menjadi: ${newStatus}`);
      loadData();
    } catch {
      toast.error('Gagal memperbarui status aset.');
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Aktif Operasional</span>
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Dalam Pemeliharaan</span>
          </span>
        );
      case 'BROKEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Rusak / Kendala</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <span>{st}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Controls & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Cari aset, serial number, posko, PIC..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:border-primary-red"
            />
          </div>

          {/* Type Filter */}
          <select
            value={assetType}
            onChange={(e) => {
              setAssetType(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-primary-red"
          >
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs sm:text-sm border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:border-primary-red"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Create Button */}
        {canManage && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 self-start md:self-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Registrasi Aset Baru</span>
          </Button>
        )}
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat direktori inventaris aset IT & perangkat posko..." />
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Tidak ada aset yang ditemukan"
            description="Belum ada perangkat IT posko yang cocok dengan kriteria filter pencarian Anda."
            actionLabel={canManage ? 'Registrasi Aset Baru' : undefined}
            onAction={canManage ? () => setIsCreateOpen(true) : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-xl border border-border p-5 shadow-xs hover:border-info/40 hover:shadow-md transition-all flex flex-col justify-between gap-3"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {asset.assetCode}
                    </span>
                    <h4 className="text-sm font-bold text-ink mt-1.5 leading-snug line-clamp-2">
                      {asset.assetName}
                    </h4>
                  </div>
                  {getStatusBadge(asset.status)}
                </div>

                {/* Details */}
                <div className="space-y-2 py-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-muted">
                    <Tag className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>Tipe: <span className="font-semibold text-ink">{asset.assetTypeLabel}</span></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted">
                    <Server className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>SN: <span className="font-mono text-ink font-semibold">{asset.serialNumber}</span></span>
                  </div>

                  <div className="flex items-start gap-1.5 text-muted">
                    <MapPin className="w-3.5 h-3.5 text-primary-red shrink-0 mt-0.5" />
                    <span className="text-ink">{asset.locationName}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted">
                    <User className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>PIC Lapangan: <span className="text-ink">{asset.pic}</span></span>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted">
                    <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>Garansi s/d: <span className="font-medium text-ink">{asset.warrantyExpiry}</span></span>
                  </div>
                </div>

                {/* Condition & Notes */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 text-[11px] space-y-1">
                  <p className="text-slate-700">
                    <strong>Kondisi:</strong> {asset.condition}
                  </p>
                  {asset.notes && (
                    <p className="text-muted italic line-clamp-2">"{asset.notes}"</p>
                  )}
                </div>
              </div>

              {/* Status Update Quick Action */}
              {canManage && (
                <div className="pt-2 border-t border-border flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted text-[11px]">Ubah Status:</span>
                  <select
                    value={asset.status}
                    onChange={(e) => handleStatusChange(asset.id, e.target.value)}
                    className="text-[11px] border border-border rounded px-2 py-1 bg-white text-ink focus:outline-none focus:border-primary-red"
                  >
                    <option value="ACTIVE">Aktif Operasional</option>
                    <option value="MAINTENANCE">Dalam Pemeliharaan</option>
                    <option value="BROKEN">Rusak / Kendala</option>
                    <option value="RETIRED">Dinonaktifkan</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && assets.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-border text-xs text-muted">
          <div>
            Total: <span className="font-semibold text-ink">{meta.total}</span> unit perangkat (Halaman {meta.page} dari {meta.totalPages || 1})
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isCreateOpen && (
        <AssetFormModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
