import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { UserCog, ShieldCheck } from 'lucide-react';

export function UserManagement() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('hrd');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Gagal memuat daftar pengguna', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await api.updateUserRole(selectedUser.id, newRole);
      if (res.success) {
        addToast(`Role untuk ${selectedUser.name} berhasil diubah ke ${newRole.toUpperCase()}`, 'success');
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Gagal memperbarui role', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Nama Staf / Pejabat',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
            {row.avatar}
          </div>
          <div>
            <p className="font-bold text-brand-dark">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Hak Akses Role',
      render: (row) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={row.role} type="role" />
          <span className="text-[11px] text-slate-400">{row.roleLabel}</span>
        </div>
      )
    },
    {
      header: 'Kontak',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">{row.phone}</span>
      )
    },
    {
      header: 'Aktivitas Terakhir',
      render: (row) => (
        <span className="text-xs text-slate-500">{row.lastLogin}</span>
      )
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          icon={UserCog}
          onClick={() => handleOpenEdit(row)}
        >
          Kelola Akses
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pengguna & Otoritas Role"
        subtitle="Pengaturan hak akses sistem internal untuk 5 peran: Owner, HRD, Operasional, Finance, dan Marketing."
        breadcrumb={['Dashboard', 'Owner', 'User Management']}
      />

      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari berdasarkan nama, email, atau role..."
      />

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Otoritas Akses Pengguna"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-brand-dark">{selectedUser.name}</p>
              <p className="text-slate-500">{selectedUser.email}</p>
            </div>

            <Select
              label="Pilih Otoritas Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={[
                { value: 'owner', label: 'Owner / Direktur Utama' },
                { value: 'hrd', label: 'HRD (Manajemen Tenaga Kerja)' },
                { value: 'operasional', label: 'Operasional (Site & Supervisi)' },
                { value: 'finance', label: 'Finance (Billing & Tagihan)' },
                { value: 'marketing', label: 'Marketing (Leads & Proposal)' }
              ]}
            />

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Peringatan Keamanan:</span> Mengubah role akan langsung menyesuaikan modul menu yang dapat diakses oleh akun bersangkutan.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveRole} loading={saving}>
                Simpan Perubahan Role
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
