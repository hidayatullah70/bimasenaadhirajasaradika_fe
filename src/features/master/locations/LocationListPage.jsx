/**
 * Location List Page — PT. BARAK IOMS
 * Authoritative Placement & Facility Master.
 * Source of Truth: PRD Section 20 / IMPLEMENTATION-PLAN Phase 2.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, Plus, Building2, Users, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import locationAdapter from '@/services/adapters/locationAdapter';
import { MOCK_CLIENTS } from '@/services/mock/mockMasterData';
import { useAuth } from '@/app/providers/AuthProvider';
import { PERMISSIONS } from '@/constants/permissions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import LocationFormModal from './LocationFormModal';
import toast from 'react-hot-toast';

export default function LocationListPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.LOCATION_CREATE);
  const canEdit = hasPermission(PERMISSIONS.LOCATION_EDIT);

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [clientId, setClientId] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await locationAdapter.getLocations({ search, clientId, page, pageSize: 10 });
      if (res.data) {
        setLocations(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat data lokasi.');
    } finally {
      setLoading(false);
    }
  }, [search, clientId, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLocation(loc);
    setIsModalOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      if (editingLocation) {
        await locationAdapter.updateLocation(editingLocation.id, payload);
        toast.success(`Data lokasi ${payload.name} berhasil diperbarui.`);
      } else {
        await locationAdapter.createLocation(payload);
        toast.success(`Lokasi baru ${payload.name} berhasil ditambahkan.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan lokasi.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari lokasi, kota, atau PIC pos..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-canvas/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Klien</option>
            {MOCK_CLIENTS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {canCreate && (
            <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Lokasi</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <StateLoading message="Memuat lokasi pos penempatan personel..." />
        ) : locations.length === 0 ? (
          <StateEmpty
            title="Lokasi tidak ditemukan"
            description="Tidak ada pos fasilitas yang sesuai dengan pencarian."
            actionLabel={canCreate ? 'Tambah Lokasi Baru' : undefined}
            onAction={canCreate ? handleOpenCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas/50 border-b border-border text-muted uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Nama Pos / Fasilitas</th>
                  <th className="px-4 py-3.5">Klien Terkait</th>
                  <th className="px-4 py-3.5">Kota & Alamat</th>
                  <th className="px-4 py-3.5">PIC / Danru</th>
                  <th className="px-4 py-3.5">Manpower (Aktif / Kuota)</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {locations.map((loc) => {
                  const client = MOCK_CLIENTS.find((c) => c.id === loc.clientId);
                  const isFull = loc.activeManpower >= loc.manpowerQuota;
                  return (
                    <tr key={loc.id} className="hover:bg-primary-red/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <MapPin className="h-4 w-4 text-primary-red flex-none" />
                          <div>
                            <p className="font-semibold text-ink">{loc.name}</p>
                            <p className="text-[11px] font-mono text-muted">{loc.id} ({loc.code})</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-ink">{client ? client.name : loc.clientId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ink truncate max-w-[200px]">{loc.address}</p>
                        <p className="text-[11px] text-muted">{loc.city}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{loc.contactPerson}</p>
                        <p className="text-[11px] text-muted font-mono">{loc.contactPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={isFull ? 'success' : 'warning'}>
                            {loc.activeManpower} / {loc.manpowerQuota} Personel
                          </Badge>
                          {loc.coordinates && (
                            <span className="text-[10px] font-mono text-muted flex items-center gap-0.5" title="Koordinat GPS">
                              <Compass className="h-3 w-3" />
                              {loc.coordinates.lat?.toFixed(2)}, {loc.coordinates.lng?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(loc)}
                            className="px-2.5 py-1 text-xs rounded border border-border bg-white text-muted hover:text-primary-red font-medium transition-colors"
                          >
                            Ubah
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && locations.length > 0 && (
          <div className="p-3.5 border-t border-border bg-canvas/30 flex items-center justify-between text-xs text-muted">
            <p>
              Menampilkan <span className="font-medium text-ink">{(page - 1) * 10 + 1}</span> -{' '}
              <span className="font-medium text-ink">{Math.min(page * 10, meta.total)}</span> dari{' '}
              <span className="font-medium text-ink">{meta.total}</span> lokasi fasilitas
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 font-medium text-ink">
                Halaman {page} dari {meta.totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <LocationFormModal
        isOpen={isModalOpen}
        location={editingLocation}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
