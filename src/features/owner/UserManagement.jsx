import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input, Select } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { UserCog, UserPlus, Mail, Lock, User, ShieldCheck, Trash2, Image, Check } from 'lucide-react';

const TEAM_AVATARS = [
  { label: 'Hidayatullah (JustHidy)', path: '/assets/img/team/JustHidy3.png' },
  { label: 'Juli Priyanto (Direktur)', path: '/assets/img/team/person-3.jpeg' },
  { label: 'Robyn Topani (HRD)', path: '/assets/img/team/person-7.jpeg' },
  { label: 'Zaenal Arifin (Finance)', path: '/assets/img/team/person-4.jpeg' },
  { label: 'Hendri Nopamin (Marketing)', path: '/assets/img/team/person-2.jpeg' },
  { label: 'Nazi Rinaldi (Operasional)', path: '/assets/img/team/nazi.jpg' },
  { label: 'Gheril Ramaditya (Support)', path: '/assets/img/team/person-5.jpeg' }
];

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
    role_id: '1',
    avatar_url: '/assets/img/team/JustHidy3.png'
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
      const res = await api.getUsers();
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
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
    setNewRoleId(String(user.role_id || (user.role === 'direktur' ? '1' : '2')));
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
      const roleMap = {
        '1': 'direktur',
        '2': 'hrd',
        '3': 'finance',
        '4': 'marketing',
        '5': 'operasional'
      };
      const res = await api.updateUserRole(selectedUser.id, {
        role_id: parseInt(newRoleId, 10),
        role: roleMap[newRoleId] || 'operasional'
      });
      if (res?.success) {
        addToast(`Role untuk ${selectedUser.name} berhasil diperbarui.`, 'success');
        setIsEditModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Gagal memperbarui role', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNameChange = (val) => {
    let autoAvatar = formData.avatar_url;
    const lower = val.toLowerCase();
    if (lower.includes('hidayat')) {
      autoAvatar = '/assets/img/team/JustHidy3.png';
    } else if (lower.includes('gheril')) {
      autoAvatar = '/assets/img/team/person-5.jpeg';
    } else if (lower.includes('juli')) {
      autoAvatar = '/assets/img/team/person-3.jpeg';
    } else if (lower.includes('robyn')) {
      autoAvatar = '/assets/img/team/person-7.jpeg';
    } else if (lower.includes('zaenal')) {
      autoAvatar = '/assets/img/team/person-4.jpeg';
    } else if (lower.includes('hendri')) {
      autoAvatar = '/assets/img/team/person-2.jpeg';
    } else if (lower.includes('nazi')) {
      autoAvatar = '/assets/img/team/nazi.jpg';
    }
    setFormData({ ...formData, name: val, avatar_url: autoAvatar });
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
        avatar_url: formData.avatar_url || '/assets/img/team/JustHidy3.png',
        avatar: formData.avatar_url || '/assets/img/team/JustHidy3.png'
      };

      const res = await api.createUser(payload);
      if (res.success) {
        addToast(`Pengguna baru ${payload.name} berhasil ditambahkan dengan foto avatar tim!`, 'success');
        setIsCreateModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role_id: '1',
          avatar_url: '/assets/img/team/JustHidy3.png'
        });
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menambahkan pengguna baru.', 'error');
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
      header: 'Foto Profil Tim',
      render: (row) => (
        <span className="text-[11px] text-slate-500 font-mono truncate max-w-[150px] inline-block">
          {row.avatar_url || row.avatar || '-'}
        </span>
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
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                password: '',
                role_id: '1',
                avatar_url: '/assets/img/team/JustHidy3.png'
              });
              setIsCreateModalOpen(true);
            }}
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
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Nama Lengkap Karyawan / Pejabat"
            id="create-name"
            icon={User}
            placeholder="Contoh: Hidayatullah"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <Input
            label="Alamat Email Korporat"
            id="create-email"
            type="email"
            icon={Mail}
            placeholder="contoh: hidayatullah@bimasenaadhirajasaradika.com"
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

          {/* Avatar / Foto Profil Tim Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Foto Profil dari /assets/img/team/*
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {TEAM_AVATARS.map((item) => {
                const isSelected = formData.avatar_url === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    title={item.label}
                    onClick={() => setFormData({ ...formData, avatar_url: item.path })}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group ${
                      isSelected ? 'border-brand-red ring-2 ring-red-200 scale-105 shadow-md' : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.path}
                      alt={item.label}
                      className="w-full h-full object-cover object-top"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-brand-red/30 flex items-center justify-center text-white">
                        <Check className="w-4 h-4 drop-shadow stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-brand-dark">Foto Terpilih:</span>
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] text-brand-red font-medium truncate">
                {formData.avatar_url}
              </span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Otoritas Direktur:</span> Pengguna baru akan langsung tersimpan di database backend dengan foto profil yang dipilih dari folder tim.
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
