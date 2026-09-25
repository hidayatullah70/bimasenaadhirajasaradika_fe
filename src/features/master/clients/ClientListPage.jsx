/**
 * Client List Page — PT. BARAK IOMS
 * Authoritative Client Master Listing (18 Real Clients).
 * Source of Truth: PRD Section 9 / IMPLEMENTATION-PLAN Phase 2.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Search, Plus, MapPin, Phone, Mail, Users, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import clientAdapter from '@/services/adapters/clientAdapter';
import { useAuth } from '@/app/providers/AuthProvider';
import { PERMISSIONS } from '@/constants/permissions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import ClientFormModal from './ClientFormModal';
import toast from 'react-hot-toast';

export default function ClientListPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.CLIENT_CREATE);
  const canEdit = hasPermission(PERMISSIONS.CLIENT_EDIT);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await clientAdapter.getClients({ search, type, page, pageSize: 12 });
      if (res.data) {
        setClients(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat data klien.');
    } finally {
      setLoading(false);
    }
  }, [search, type, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingClient(c);
    setIsModalOpen(true);
  };

  const handleSave = async (payload) => {
    try {
      if (editingClient) {
        await clientAdapter.updateClient(editingClient.id, payload);
        toast.success(`Data klien ${payload.name} berhasil diperbarui.`);
      } else {
        await clientAdapter.createClient(payload);
        toast.success(`Klien baru ${payload.name} berhasil ditambahkan.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan klien.');
    }
  };

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
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
            placeholder="Cari nama klien, kota, atau PIC..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-canvas/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Kategori</option>
            <option value="Logistik">Logistik</option>
            <option value="Area">Kawasan Area</option>
            <option value="Drop Point">Drop Point Jaringan</option>
          </select>

          {canCreate && (
            <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Klien</span>
            </Button>
          )}
        </div>
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateLoading message="Memuat daftar 18 klien otoritatif PT. BARAK..." />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border shadow-xs">
          <StateEmpty
            title="Klien tidak ditemukan"
            description="Tidak ada data klien mitra yang cocok dengan filter pencarian Anda."
            actionLabel={canCreate ? 'Tambah Klien Baru' : undefined}
            onAction={canCreate ? handleOpenCreate : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-border p-5 shadow-xs hover:border-primary-red/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] text-muted">{c.id}</span>
                    <h3 className="font-bold text-ink text-sm sm:text-base leading-snug mt-0.5">
                      {c.name}
                    </h3>
                  </div>
                  <Badge variant={c.type === 'Logistik' ? 'danger' : c.type === 'Area' ? 'info' : 'warning'}>
                    {c.type}
                  </Badge>
                </div>

                {/* Info List */}
                <div className="mt-4 space-y-2 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 flex-none text-muted" />
                    <span className="truncate text-ink">{c.address} ({c.city})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 flex-none text-muted" />
                    <span>PIC: <strong className="text-ink font-medium">{c.picName}</strong> ({c.picPhone})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 flex-none text-muted" />
                    <span className="truncate text-ink">{c.picEmail}</span>
                  </div>
                </div>

                {/* Stats Pill */}
                <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-canvas border border-border">
                    <p className="text-[11px] text-muted">Personel Bertugas</p>
                    <p className="font-bold text-ink text-sm mt-0.5">{c.activeHeadcount} Orang</p>
                  </div>
                  <div className="p-2 rounded-lg bg-canvas border border-border">
                    <p className="text-[11px] text-muted">Billing / Bulan</p>
                    <p className="font-bold text-primary-red text-xs mt-0.5 truncate">{formatIDR(c.monthlyBillingValue)}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-[11px] text-success flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                  Kontrak Aktif s/d 2026
                </span>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(c)}
                    className="text-primary-red hover:underline font-medium text-xs"
                  >
                    Ubah Data
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && clients.length > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-border shadow-xs flex items-center justify-between text-xs text-muted">
          <p>
            Total <span className="font-semibold text-ink">{meta.total}</span> klien mitra terdaftar (18 Otoritatif PRD)
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
              Hal {page} dari {meta.totalPages || 1}
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

      {/* Form Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        client={editingClient}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
