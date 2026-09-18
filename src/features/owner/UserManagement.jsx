import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { Input, Select } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { UserCog, UserPlus, Mail, Lock, User, ShieldCheck, Trash2 } from 'lucide-react';

export function UserManagement() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newRoleId, setNewRoleId] = useState('2');
  const [saving, setSaving] = useState(false);

  // Form state for creating user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '2'
  });

  const roleOptions = [
    { value: '1', label: '1 - Direktur' },
    { value: '2', label: '2 - HRD (Manajemen Tenaga Kerja)' },
    { value: '3', label: '3 - Finance (Billing & Tagihan)' },
    { value: '4', label: '4 - Marketing (Leads & Proposal)' },
    { value: '5', label: '5 - Operasional (Site & Supervisi)' }
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({ search });
      if (res?.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      addToast(err.message || 'Gagal memuat daftar pengguna dari server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setNewRoleId(String(user.role_id || (user.role_code === 'direktur' ? 1 : user.role_code === 'hrd' ? 2 : user.role_code === 'finance' ? 3 : user.role_code === 'marketing' ? 4 : 5)));
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const roleMap = { '1': 'direktur', '2': 'hrd', '3': 'finance', '4': 'marketing', '5': 'operasional' };
      const role_code = roleMap[newRoleId] || 'operasional';
      const res = await api.updateUser(selectedUser.id, {
        role_id: parseInt(newRoleId, 10),
        role: role_code,
        is_active: true
      });
      if (res?.success) {
        addToast(`Role untuk ${selectedUser.name} berhasil diperbarui!`, 'success');
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Gagal memperbarui role pengguna', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      addToast('Harap lengkapi semua bidang yang wajib diisi.', 'error');
      return;
    }

    setSaving(true);
    try {
      const roleMap = {
        '1': 'direktur',
        '2': 'hrd',
        '3': 'finance',
        '4': 'marketing',
        '5': 'operasional'
      };

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role_id: parseInt(formData.role_id, 10),
        role: roleMap[formData.role_id] || 'operasional',
        is_active: true
      };

      const res = await api.createUser(payload);
      if (res?.success) {
        addToast(`Pengguna baru ${payload.name} berhasil ditambahkan!`, 'success');
        setIsCreateModalOpen(false);
        setFormData({ name: '', email: '', password: '', role_id: '2' });
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menambahkan pengguna baru ke server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await api.deleteUser(selectedUser.id);
      if (res?.success) {
        addToast(`Pengguna ${selectedUser.name} berhasil dinonaktifkan.`, 'success');
        setIsDeleteModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menghapus pengguna.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      header: 'Nama Staf / Pejabat',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.avatar || row.avatar_url}
            name={row.name}
            size="md"
            className="ring-1 ring-slate-200"
          />
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
          <StatusBadge status={row.role || row.role_code || row.role_name} type="role" />
          <span className="text-[11px] text-slate-400">{row.roleLabel || row.role_name}</span>
        </div>
      )
    },
    {
      header: 'Kontak',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono">{row.phone || '-'}</span>
      )
    },
    {
      header: 'Status Akun',
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
          row.is_active !== 0 && row.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.is_active !== 0 && row.is_active !== false ? 'Aktif' : 'Non-Aktif'}
        </span>
      )
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            icon={UserCog}
            onClick={() => handleOpenEdit(row)}
          >
            Kelola
          </Button>
          {row.id !== 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 !p-2"
              onClick={() => handleOpenDelete(row)}
              title="Hapus / Nonaktifkan User"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pengguna & Otoritas Role"
        subtitle="Pengaturan hak akses sistem internal untuk 5 peran: Direktur, HRD, Operasional, Finance, dan Marketing."
        breadcrumb={['Dashboard', 'Direktur', 'User Management']}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={UserPlus}
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-md shadow-red-900/10"
          >
            Tambah Pengguna Baru
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari berdasarkan nama, email, atau role..."
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tambah Pengguna Baru"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Nama Lengkap Karyawan / Pejabat"
            id="create-name"
            icon={User}
            placeholder="Contoh: Rian Pratama, S.E."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Alamat Email Korporat"
            id="create-email"
            type="email"
            icon={Mail}
            placeholder="contoh: rian@bimasenaadhirajasaradika.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Kata Sandi Sementara"
            id="create-password"
            type="password"
            icon={Lock}
            placeholder="Minimal 6 karakter"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Select
            label="Pilih Otoritas Hak Akses (Role)"
            id="create-role"
            value={String(formData.role_id)}
            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
            options={roleOptions}
            required
          />

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Otoritas Direktur:</span> Pengguna baru akan langsung tersimpan di database REST API backend.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={saving}
              icon={UserPlus}
            >
              Simpan & Daftarkan Pengguna
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Otoritas Akses Pengguna"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center gap-3">
              <Avatar
                src={selectedUser.avatar || selectedUser.avatar_url}
                name={selectedUser.name}
                size="lg"
                className="ring-1 ring-slate-300"
              />
              <div>
                <p className="font-bold text-brand-dark">{selectedUser.name}</p>
                <p className="text-slate-500">{selectedUser.email}</p>
              </div>
            </div>

            <Select
              label="Pilih Otoritas Role"
              value={newRoleId}
              onChange={(e) => setNewRoleId(e.target.value)}
              options={roleOptions}
            />

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Peringatan:</span> Mengubah role akan langsung menyesuaikan hak akses modul akun yang bersangkutan di backend.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveRole} loading={saving}>
                Simpan Perubahan
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Nonaktifkan Pengguna"
        message={`Apakah Anda yakin ingin menonaktifkan akun ${selectedUser?.name}?`}
        confirmText="Ya, Nonaktifkan"
        cancelText="Batal"
        variant="danger"
        loading={saving}
      />
    </div>
  );
}
