import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import { UserCog, UserPlus, Mail, Lock, User, ShieldCheck, Trash2, Power, AlertTriangle, Check, Users, UserCheck, UserX } from 'lucide-react';

const TEAM_AVATARS = [
  { label: 'Inisial Huruf (Otomatis dari Nama)', path: '' },
  { label: 'Juli Priyanto (Direktur)', path: '/assets/img/team/person-3.jpeg' },
  { label: 'Robyn Topani (HRD)', path: '/assets/img/team/person-7.jpeg' },
  { label: 'Zaenal Arifin (Finance)', path: '/assets/img/team/person-4.jpeg' },
  { label: 'Hendri Nopamin (Marketing)', path: '/assets/img/team/person-2.jpeg' },
  { label: 'Nazi Rinaldi (Operasional)', path: '/assets/img/team/nazi.jpg' },
  { label: 'Gheril Ramaditya S. (IT Support)', path: '/assets/img/team/person-5.jpeg' },
  { label: 'Admin', path: '/assets/img/team/jusHidy3.png' }
];

export function UserManagement() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [newRoleId, setNewRoleId] = useState('1');
  const [newStatus, setNewStatus] = useState(true);
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Set of permanently deleted user IDs to prevent reappearing on screen
  const deletedUserIdsRef = React.useRef(new Set());

  // Form state for creating user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '1',
    avatar_url: ''
  });

  const roleOptions = [
    { value: '1', label: '1 - Direktur' },
    { value: '2', label: '2 - HRD (Manajemen Tenaga Kerja)' },
    { value: '3', label: '3 - Finance (Billing & Tagihan)' },
    { value: '4', label: '4 - Marketing (Leads & Proposal)' },
    { value: '5', label: '5 - Operasional (Site & Supervisi)' },
    { value: '6', label: '6 - IT Support & Infrastruktur' },
    { value: '7', label: '7 - Administrator Website' }
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success && Array.isArray(res.data)) {
        // Filter out any permanently deleted IDs, thab70, and map Hidayatullah and Gheril
        const cleanList = res.data
          .filter(u => !deletedUserIdsRef.current.has(u.id) && u.email !== 'hidayatullah.thab70@gmail.com' && !u.email?.includes('thab70'))
          .map(u => {
            if (u.email === 'hidayatullah.ofc@gmail.com' || (u.name?.toLowerCase().includes('hidayatullah') && u.role === 'admin')) {
              return {
                ...u,
                name: 'Hidayatullah',
                email: 'hidayatullah.ofc@gmail.com',
                avatar: '/assets/img/team/jusHidy3.png',
                avatar_url: '/assets/img/team/jusHidy3.png',
                role: 'admin',
                role_code: 'admin',
                role_id: 7,
                roleLabel: 'Administrator Website',
                role_name: 'Administrator',
                is_active: true
              };
            }
            if (
              u.name?.toLowerCase().includes('gheril') ||
              u.email?.toLowerCase().includes('gheril') ||
              u.email?.toLowerCase().includes('itsupport')
            ) {
              return {
                ...u,
                name: 'Gheril Ramaditya S.',
                email: 'itsupport@bimasenaadhirajasaradika.com',
                role: 'it_support',
                role_code: 'it_support',
                role_id: 6,
                roleLabel: 'IT Support & Infrastruktur',
                role_name: 'IT Support'
              };
            }
            return u;
          });

        if (!cleanList.some(u => u.email === 'hidayatullah.ofc@gmail.com')) {
          cleanList.push({
            id: 7,
            name: 'Hidayatullah',
            email: 'hidayatullah.ofc@gmail.com',
            avatar: '/assets/img/team/jusHidy3.png',
            avatar_url: '/assets/img/team/jusHidy3.png',
            role: 'admin',
            role_code: 'admin',
            role_id: 7,
            roleLabel: 'Administrator Website',
            role_name: 'Administrator',
            is_active: true
          });
        }
        setUsers(cleanList);
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
    const initialRoleId = String(user.role_id || (user.role === 'admin' ? '7' : user.role === 'it_support' ? '6' : user.role === 'direktur' ? '1' : '2'));
    setNewRoleId(initialRoleId);
    setNewStatus(user.is_active !== 0 && user.is_active !== false);
    setEditAvatarUrl(user.avatar_url || '');
    setIsEditModalOpen(true);
  };

  const handleOpenAction = (user) => {
    setSelectedUser(user);
    setIsActionModalOpen(true);
  };

  const handleApproveAndActivate = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await api.deleteUser(selectedUser.id, false, 'activate');
      await api.updateUser(selectedUser.id, { is_active: 1 }).catch(() => {});
      
      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id
            ? { ...u, is_active: 1 }
            : u
        )
      );
      setSelectedUser(prev => prev ? { ...prev, is_active: 1 } : null);
      setNewStatus(true);
      addToast(`Akun ${selectedUser.name} berhasil DI-APPROVE dan diaktifkan kembali!`, 'success');
      setIsEditModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Gagal menyetujui dan mengaktifkan akun', 'error');
    } finally {
      setSaving(false);
    }
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
        '5': 'operasional',
        '6': 'it_support',
        '7': 'admin'
      };
      const targetRoleCode = roleMap[newRoleId] || 'operasional';
      const roleLabelMap = {
        '1': 'Direktur',
        '2': 'HRD & Personel',
        '3': 'Finance & Billing',
        '4': 'Marketing / BD',
        '5': 'Operasional Lapangan',
        '6': 'IT Support & Infrastruktur',
        '7': 'Administrator Website'
      };

      const res = await api.updateUser(selectedUser.id, {
        role_id: parseInt(newRoleId, 10),
        role: targetRoleCode,
        is_active: newStatus ? 1 : 0,
        avatar_url: editAvatarUrl || null,
        avatar: editAvatarUrl || null
      });

      // Update user in state
      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id
            ? {
                ...u,
                role_id: parseInt(newRoleId, 10),
                role: targetRoleCode,
                role_code: targetRoleCode,
                roleLabel: roleLabelMap[newRoleId] || targetRoleCode,
                role_name: roleLabelMap[newRoleId] || targetRoleCode,
                is_active: newStatus ? 1 : 0,
                avatar_url: editAvatarUrl || null,
                avatar: editAvatarUrl || null
              }
            : u
        )
      );

      addToast(`Data pengguna ${selectedUser.name} berhasil diperbarui (Role, Foto Profil & Status).`, 'success');
      setIsEditModalOpen(false);
    } catch (err) {
      addToast(err.message || 'Gagal memperbarui pengguna', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNameChange = (val) => {
    setFormData({ ...formData, name: val });
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
        '5': 'operasional',
        '6': 'it_support'
      };

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role_id: parseInt(formData.role_id, 10),
        role: roleMap[formData.role_id] || 'operasional',
        avatar_url: formData.avatar_url ? formData.avatar_url.trim() : null,
        avatar: formData.avatar_url ? formData.avatar_url.trim() : null
      };

      const res = await api.createUser(payload);
      if (res.success) {
        addToast(`Pengguna baru ${payload.name} berhasil ditambahkan!`, 'success');
        setIsCreateModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role_id: '1',
          avatar_url: ''
        });
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menambahkan pengguna baru.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 1. Toggle Nonaktifkan / Aktifkan Kembali
  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    const targetUser = selectedUser;
    const isCurrentlyActive = targetUser.is_active !== 0 && targetUser.is_active !== false;
    const action = isCurrentlyActive ? 'deactivate' : 'activate';

    setSaving(true);
    try {
      const res = await api.deleteUser(targetUser.id, false, action);
      if (res?.success) {
        // Optimistically update status in state
        setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, is_active: isCurrentlyActive ? 0 : 1 } : u));
        addToast(
          isCurrentlyActive
            ? `Pengguna ${targetUser.name} berhasil dinonaktifkan.`
            : `Pengguna ${targetUser.name} berhasil diaktifkan kembali.`,
          'success'
        );
        setIsActionModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Gagal mengubah status pengguna.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 2. Hard Delete Permanen
  const handlePermanentDelete = async () => {
    if (!selectedUser) return;
    const targetId = selectedUser.id;
    const targetName = selectedUser.name;
    setSaving(true);
    try {
      // Catat di ref agar tidak muncul lagi pada sesi ini
      deletedUserIdsRef.current.add(targetId);
      
      // Hapus langsung dari tampilan layar
      setUsers(prev => prev.filter(u => u.id !== targetId));
      setIsActionModalOpen(false);
      setSelectedUser(null);

      const res = await api.deleteUser(targetId, true, 'permanent');
      if (res?.success) {
        addToast(`Pengguna ${targetName} berhasil DIHAPUS PERMANEN dari sistem.`, 'success');
      } else {
        addToast(`Pengguna ${targetName} berhasil dihapus dari daftar.`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Gagal menghapus pengguna secara permanen.', 'error');
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
        row.avatar_url ? (
          <span className="text-[11px] text-slate-600 font-mono truncate max-w-[150px] inline-block bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {row.avatar_url}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-medium">
            Inisial Huruf
          </span>
        )
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
              onClick={() => handleOpenAction(row)}
              title="Hapus atau Nonaktifkan User"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const isSelectedActive = selectedUser?.is_active !== 0 && selectedUser?.is_active !== false;

  // Filter users based on tab status
  const displayedUsers = users.filter(u => {
    if (statusFilter === 'active') return u.is_active !== 0 && u.is_active !== false;
    if (statusFilter === 'inactive') return u.is_active === 0 || u.is_active === false;
    return true;
  });

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
                avatar_url: ''
              });
              setIsCreateModalOpen(true);
            }}
            className="shadow-md shadow-red-900/10"
          >
            Tambah Pengguna Baru
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            statusFilter === 'all'
              ? 'bg-brand-red text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Semua Pengguna ({users.length})</span>
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            statusFilter === 'active'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Aktif Saja ({users.filter(u => u.is_active !== 0 && u.is_active !== false).length})</span>
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            statusFilter === 'inactive'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Non-Aktif ({users.filter(u => u.is_active === 0 || u.is_active === false).length})</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={displayedUsers}
        loading={loading}
        searchable
        searchPlaceholder="Cari nama atau email pengguna..."
        emptyMessage="Tidak ada data pengguna yang terdaftar."
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Daftarkan Pengguna Internal Baru"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Nama Lengkap Staf / Pejabat"
            placeholder="Contoh: Hidayatullah"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            icon={User}
          />

          <Input
            label="Alamat Email Perusahaan / Google"
            type="email"
            placeholder="hidayatullah.ofc@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            icon={Mail}
          />

          <Input
            label="Kata Sandi / Password"
            type="password"
            placeholder="Minimal 8 karakter"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            icon={Lock}
          />

          <Select
            label="Otoritas Role"
            value={formData.role_id}
            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
            options={roleOptions}
          />

          {/* Avatar Selector from /assets/img/team with Initial Support */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Foto Profil Tim (Folder: <span className="font-mono text-brand-red">/assets/img/team/</span>)
              </label>
              <span className="text-[11px] text-slate-400">Pilih opsi pertama jika belum ada file foto</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TEAM_AVATARS.map((item) => {
                const isSelected = formData.avatar_url === item.path;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar_url: item.path })}
                    className={`relative p-2.5 rounded-xl border text-left transition-all flex flex-col items-center gap-2 overflow-hidden ${
                      isSelected
                        ? 'border-brand-red ring-2 ring-brand-red/30 bg-red-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {item.path ? (
                      <img
                        src={item.path}
                        alt={item.label}
                        className="w-12 h-12 rounded-full object-cover shadow-sm ring-1 ring-slate-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.label)}&background=0284c7&color=fff`;
                        }}
                      />
                    ) : (
                      <Avatar
                        name={formData.name || 'User Baru'}
                        size="xl"
                        className="shadow-sm ring-1 ring-slate-200"
                      />
                    )}
                    <span className="text-[10px] font-semibold text-slate-700 text-center line-clamp-1 leading-tight">
                      {item.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-brand-red text-white p-0.5 rounded-full shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Avatar
                  src={formData.avatar_url}
                  name={formData.name || 'User Baru'}
                  size="md"
                  className="ring-1 ring-slate-300"
                />
                <div>
                  <p className="font-semibold text-slate-700 text-[11px]">
                    {formData.avatar_url ? 'Foto Profil Terpilih:' : 'Mode Inisial Huruf Otomatis:'}
                  </p>
                  <p className="font-mono text-[11px] text-brand-red font-medium truncate max-w-[280px]">
                    {formData.avatar_url || `Avatar inisial (${(formData.name || 'UB').slice(0, 2).toUpperCase()})`}
                  </p>
                </div>
              </div>
              {!formData.avatar_url && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Tanpa Foto (Inisial)
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Otoritas Direktur:</span> Jika foto belum diupload, avatar akan dibuat dari inisial nama secara otomatis. Anda dapat memperbarui foto kapan saja melalui tombol <strong>Kelola</strong>.
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

      {/* Edit Role & Status Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Kelola Otoritas & Status Pengguna"
        maxWidth="max-w-lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            {/* User Profile Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={editAvatarUrl}
                  name={selectedUser.name}
                  size="lg"
                  className="ring-2 ring-slate-200"
                />
                <div>
                  <p className="font-bold text-sm text-brand-dark">{selectedUser.name}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{selectedUser.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                selectedUser.is_active !== 0 && selectedUser.is_active !== false
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {selectedUser.is_active !== 0 && selectedUser.is_active !== false ? '● Aktif' : '● Non-Aktif'}
              </span>
            </div>

            {/* Tombol Approve & Aktifkan Khusus Akun Non-Aktif */}
            {(selectedUser.is_active === 0 || selectedUser.is_active === false) && (
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-emerald-950">Approve & Aktifkan Akun</p>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Akun saat ini berstatus <strong>Non-Aktif</strong>. Klik tombol approve di samping untuk memberikan otorisasi login dan mengaktifkan kembali akun staf ini.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 whitespace-nowrap !px-4 !py-2.5 flex items-center gap-1.5 font-bold"
                  onClick={handleApproveAndActivate}
                  loading={saving}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Approve & Aktifkan</span>
                </Button>
              </div>
            )}

            {/* Update Avatar Profil Section in Edit Modal */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Update Foto Profil Tim (Folder: <span className="font-mono text-brand-red">/assets/img/team/</span>)
                </label>
                <span className="text-[11px] text-slate-400">Pilih foto jika file baru telah diupload</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-44 overflow-y-auto p-1">
                {TEAM_AVATARS.map((item) => {
                  const isSelected = editAvatarUrl === item.path;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setEditAvatarUrl(item.path)}
                      className={`relative p-2 rounded-xl border text-left transition-all flex flex-col items-center gap-1.5 overflow-hidden ${
                        isSelected
                          ? 'border-brand-red ring-2 ring-brand-red/30 bg-red-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {item.path ? (
                        <img
                          src={item.path}
                          alt={item.label}
                          className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-slate-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.label)}&background=0284c7&color=fff`;
                          }}
                        />
                      ) : (
                        <Avatar
                          name={selectedUser.name || 'User'}
                          size="lg"
                          className="shadow-sm ring-1 ring-slate-200"
                        />
                      )}
                      <span className="text-[10px] font-semibold text-slate-700 text-center line-clamp-1">
                        {item.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-brand-red text-white p-0.5 rounded-full shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={editAvatarUrl}
                    name={selectedUser.name}
                    size="sm"
                    className="ring-1 ring-slate-300"
                  />
                  <div>
                    <p className="font-semibold text-slate-700 text-[11px]">
                      {editAvatarUrl ? 'Foto Terpilih:' : 'Mode Inisial Huruf:'}
                    </p>
                    <p className="font-mono text-[10px] text-brand-red font-medium truncate max-w-[240px]">
                      {editAvatarUrl || 'Menggunakan inisial huruf dari nama'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Select Status Akun */}
            <Select
              label="Status Akses Akun (Otoritas Direktur)"
              value={newStatus ? 'true' : 'false'}
              onChange={(e) => setNewStatus(e.target.value === 'true')}
              options={[
                { value: 'true', label: 'Aktif (Diizinkan Login & Akses Modul)' },
                { value: 'false', label: 'Non-Aktif (Akses Sistem Ditangguhkan)' }
              ]}
            />

            {/* Select Role */}
            <Select
              label="Otoritas Hak Akses Role"
              value={newRoleId}
              onChange={(e) => setNewRoleId(e.target.value)}
              options={roleOptions}
            />

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Otoritas Direktur:</span> Perubahan foto profil, status, maupun role akan langsung disinkronkan ke database backend secara realtime.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveRole} loading={saving}>
                Simpan Perubahan
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 2-Option Action Modal: Nonaktifkan OR Hapus Permanen */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title="Opsi Pengelolaan / Penghapusan Akun"
        maxWidth="max-w-lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            {/* User card info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <Avatar
                src={selectedUser.avatar || selectedUser.avatar_url}
                name={selectedUser.name}
                size="md"
                className="ring-1 ring-slate-300"
              />
              <div>
                <p className="font-bold text-brand-dark text-sm">{selectedUser.name}</p>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    isSelectedActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isSelectedActive ? 'Status: Aktif' : 'Status: Non-Aktif'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Silakan tentukan tindakan yang ingin Anda lakukan terhadap akun ini:
            </p>

            {/* Pilihan 1: Nonaktifkan / Aktifkan */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Power className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isSelectedActive ? 'text-amber-600' : 'text-emerald-600'}`} />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {isSelectedActive ? '1. Nonaktifkan Akun (Soft)' : '1. Aktifkan Kembali Akun'}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    {isSelectedActive
                      ? 'Mematikan hak akses login sementara. Data riwayat akun tetap aman.'
                      : 'Mengaktifkan kembali hak akses login pengguna.'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={isSelectedActive ? 'text-amber-800 border-amber-300 hover:bg-amber-100 whitespace-nowrap' : 'text-emerald-800 border-emerald-300 hover:bg-emerald-100 whitespace-nowrap'}
                onClick={handleToggleStatus}
                loading={saving}
              >
                {isSelectedActive ? 'Nonaktifkan' : 'Aktifkan'}
              </Button>
            </div>

            {/* Pilihan 2: Hapus Permanen */}
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-900">
                    2. Hapus Permanen (*Delete*)
                  </h4>
                  <p className="text-[11px] text-red-700 mt-0.5 leading-snug">
                    Menghapus data akun secara permanen dari database MySQL. Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="!bg-red-600 hover:!bg-red-700 text-white whitespace-nowrap"
                onClick={handlePermanentDelete}
                loading={saving}
                icon={Trash2}
              >
                Hapus Permanen
              </Button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsActionModalOpen(false)}
                disabled={saving}
              >
                Tutup / Batal
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
