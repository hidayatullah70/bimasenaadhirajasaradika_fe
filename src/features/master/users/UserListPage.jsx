/**
 * User List Page — PT. BARAK IOMS
 * Authoritative System Users & Role Administration.
 * Source of Truth: PRD Section 6 & 19 / IMPLEMENTATION-PLAN Phase 2.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Search, Plus, User, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import userAdapter from '@/services/adapters/userAdapter';
import { useAuth } from '@/app/providers/AuthProvider';
import { PERMISSIONS } from '@/constants/permissions';
import { ROLES, ROLE_LABELS } from '@/constants/roles';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StateLoading, StateEmpty } from '@/components/ui/StateViews';
import UserFormModal from './UserFormModal';
import PermissionMatrixModal from './PermissionMatrixModal';
import toast from 'react-hot-toast';

export default function UserListPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.USER_MANAGE);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAdapter.getUsers({ search, role, page, pageSize: 10 });
      if (res.data) {
        setUsers(res.data);
        setMeta(res.meta);
      }
    } catch {
      toast.error('Gagal memuat akun pengguna.');
    } finally {
      setLoading(false);
    }
  }, [search, role, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      await userAdapter.toggleUserStatus(user.id);
      toast.success(`Status akun ${user.username} berhasil diubah.`);
      loadData();
    } catch {
      toast.error('Gagal mengubah status akun.');
    }
  };

  const handleSave = async (payload) => {
    try {
      if (editingUser) {
        await userAdapter.updateUser(editingUser.id, payload);
        toast.success(`Akun ${payload.username} berhasil diperbarui.`);
      } else {
        await userAdapter.createUser(payload);
        toast.success(`Akun baru ${payload.username} berhasil didaftarkan.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Gagal menyimpan akun pengguna.');
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
            placeholder="Cari nama, username, atau email..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-lg bg-canvas/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs border border-border rounded-lg bg-white text-ink"
          >
            <option value="">Semua Role</option>
            {Object.keys(ROLES).map((key) => (
              <option key={key} value={ROLES[key]}>
                {ROLE_LABELS[ROLES[key]] || ROLES[key]}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMatrixOpen(true)}
            className="gap-1.5 border-border bg-white hover:bg-canvas text-ink"
            title="Lihat tabel Matriks Otorisasi & Hak Akses (Permission Matrix)"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary-red" />
            <span>Matriks Hak Akses</span>
          </Button>

          {canManage && (
            <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Akun</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
        {loading ? (
          <StateLoading message="Memuat akun pengguna sistem IOMS..." />
        ) : users.length === 0 ? (
          <StateEmpty
            title="Pengguna tidak ditemukan"
            description="Tidak ada akun pengguna yang sesuai dengan filter pencarian."
            actionLabel={canManage ? 'Tambah Akun Pertama' : undefined}
            onAction={canManage ? handleOpenCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas/50 border-b border-border text-muted uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Nama & Username</th>
                  <th className="px-4 py-3.5">Email Resmi</th>
                  <th className="px-4 py-3.5">Role / Peran</th>
                  <th className="px-4 py-3.5">Departemen</th>
                  <th className="px-4 py-3.5">Status Akun</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-primary-red/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-primary-red/10 text-primary-red font-bold flex items-center justify-center flex-none">
                          {u.name ? u.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{u.name}</p>
                          <p className="text-[11px] font-mono text-muted">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-ink font-medium">{u.department}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'default'}>
                        {u.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canManage && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="px-2 py-1 text-xs rounded border border-border bg-white text-muted hover:text-ink font-medium"
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2 py-1 text-xs rounded border font-medium ${
                              u.status === 'ACTIVE'
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-success text-success hover:bg-success/10'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="p-3.5 border-t border-border bg-canvas/30 flex items-center justify-between text-xs text-muted">
            <p>
              Menampilkan <span className="font-medium text-ink">{(page - 1) * 10 + 1}</span> -{' '}
              <span className="font-medium text-ink">{Math.min(page * 10, meta.total)}</span> dari{' '}
              <span className="font-medium text-ink">{meta.total}</span> akun sistem
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

      <UserFormModal
        isOpen={isModalOpen}
        user={editingUser}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <PermissionMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
      />
    </div>
  );
}
