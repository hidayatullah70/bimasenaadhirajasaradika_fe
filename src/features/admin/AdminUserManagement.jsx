import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input, Select } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { useToast } from '../../app/context/ToastContext';
import { api } from '../../services/api/apiClient';
import {
  KeyRound,
  UserPlus,
  RefreshCw,
  Trash2,
  CheckCircle,
  Copy,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';

const TEAM_AVATAR_OPTIONS = [
  { label: 'Hidayatullah (Admin)', path: '/assets/img/team/jusHidy3.png' },
  { label: 'Juli Priyanto (Direktur)', path: '/assets/img/team/person-3.jpeg' },
  { label: 'Robyn Topani (HRD)', path: '/assets/img/team/person-1.jpeg' },
  { label: 'Nazi Rinaldi (Operasional)', path: '/assets/img/team/person-2.jpeg' },
  { label: 'Bagas Pratama (Finance)', path: '/assets/img/team/person-4.jpeg' },
  { label: 'Gheril Ramaditya S. (IT Support)', path: '/assets/img/team/person-5.jpeg' }
];

export function AdminUserManagement() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'resets'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Password reset requests
  const [resetRequests, setResetRequests] = useState([
    {
      id: 1,
      user_id: 4,
      name: 'Bagas Pratama',
      email: 'finance@bimasenaadhirajasaradika.com',
      role: 'finance',
      roleName: 'Finance & Akuntansi',
      requested_at: '19 Sep 2026, 10:15',
      status: 'pending',
      reason: 'Lupa kata sandi setelah pergantian perangkat kerja'
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role_id: '2',
    avatar_url: '/assets/img/team/person-1.jpeg'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res?.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role_id: parseInt(formData.role_id, 10),
        avatar_url: formData.avatar_url
      };
      const res = await api.createUser(payload);
      if (res?.success) {
        addToast(`Pengguna ${formData.name} berhasil didaftarkan!`, 'success');
        setIsAddUserModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      addToast(err.message || 'Gagal menambahkan pengguna', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDirectReset = (user) => {
    setSelectedUser(user);
    const newPass = 'BarakPass#' + Math.floor(1000 + Math.random() * 9000);
    setGeneratedPassword(newPass);
    setIsResetModalOpen(true);
  };

  const handleConfirmResetPassword = async () => {
    setSubmitting(true);
    try {
      // Mock / API reset password
      await new Promise(r => setTimeout(r, 600));
      addToast(`Kata sandi untuk ${selectedUser.name} berhasil di-reset menjadi: ${generatedPassword}`, 'success');
      
      // Update pending request if matched
      setResetRequests(prev =>
        prev.map(r => (r.email === selectedUser.email ? { ...r, status: 'done' } : r))
      );
      
      setIsResetModalOpen(false);
    } catch (err) {
      addToast('Gagal me-reset kata sandi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const userColumns = [
    {
      header: 'Nama Pengguna & Email',
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
            <p className="text-xs text-slate-500 font-mono">{row.email}</p>
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
      header: 'Status Akun',
      render: (row) => <StatusBadge status={row.is_active === false || row.status === 'inactive' ? 'inactive' : 'active'} />
    },
    {
      header: 'Aksi Admin',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="xs"
            className="!text-amber-700 !border-amber-300 hover:!bg-amber-50"
            icon={KeyRound}
            onClick={() => handleOpenDirectReset(row)}
          >
            Reset Password
          </Button>
        </div>
      )
    }
  ];

  const resetRequestColumns = [
    {
      header: 'Pemohon Reset',
      render: (row) => (
        <div>
          <p className="font-bold text-brand-dark">{row.name}</p>
          <p className="text-xs text-slate-500 font-mono">{row.email}</p>
        </div>
      )
    },
    {
      header: 'Divisi / Role',
      render: (row) => <StatusBadge status={row.role} type="role" />
    },
    {
      header: 'Waktu Pengajuan',
      render: (row) => <span className="text-xs text-slate-600 font-mono">{row.requested_at}</span>
    },
    {
      header: 'Alasan Pemohon',
      render: (row) => <p className="text-xs text-slate-600 italic">{row.reason}</p>
    },
    {
      header: 'Status Permintaan',
      render: (row) => (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            row.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {row.status === 'done' ? 'Selesai Direset' : 'Menunggu Tindakan'}
        </span>
      )
    },
    {
      header: 'Tindakan',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        row.status === 'pending' ? (
          <Button
            variant="primary"
            size="xs"
            className="!bg-brand-red"
            icon={KeyRound}
            onClick={() => handleOpenDirectReset(row)}
          >
            Reset & Kirim Password
          </Button>
        ) : (
          <span className="text-xs text-slate-400 italic">Selesai</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Manajemen Pengguna & Otoritas Reset Password"
        subtitle="Pusat kendali akun pengguna, pembuatan user baru, dan penanganan permintaan reset kata sandi."
        breadcrumb={['Dashboard', 'Admin', 'Users']}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => setIsAddUserModalOpen(true)}
          >
            Tambah Pengguna Baru
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-brand-dark text-brand-dark bg-slate-50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Daftar Pengguna Aktif ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('resets')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'resets'
              ? 'border-brand-dark text-brand-dark bg-slate-50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Permintaan Reset Password Masuk
          {resetRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="bg-brand-red text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
              {resetRequests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'users' ? (
        <DataTable
          columns={userColumns}
          data={users}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari pengguna berdasarkan nama, email, atau role..."
        />
      ) : (
        <DataTable
          columns={resetRequestColumns}
          data={resetRequests}
          loading={false}
          searchPlaceholder="Cari riwayat permohonan reset..."
        />
      )}

      {/* Modal Add User */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Tambah Akun Pengguna Baru"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Rian Anggara"
              required
            />
            <Input
              label="Alamat Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="rian@bimasenaadhirajasaradika.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password Default"
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Select
              label="Hak Akses Role"
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              options={[
                { value: '1', label: '1 - Direktur' },
                { value: '2', label: '2 - HRD' },
                { value: '3', label: '3 - Operasional' },
                { value: '4', label: '4 - Finance' },
                { value: '5', label: '5 - Marketing' },
                { value: '6', label: '6 - IT Support' },
                { value: '7', label: '7 - Administrator Website' }
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsAddUserModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={submitting}>
              Simpan & Daftarkan Pengguna
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Direct Reset Password */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset & Generate Kata Sandi Pengguna"
        maxWidth="max-w-md"
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Konfirmasi Reset Kata Sandi</p>
                <p className="mt-0.5">
                  Kata sandi baru akan di-generate untuk akun <strong>{selectedUser.name}</strong> ({selectedUser.email}).
                </p>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Kata Sandi Baru yang Dihasilkan:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedPassword}
                  className="w-full font-mono font-bold text-sm bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-brand-dark"
                />
                <Button
                  variant="outline"
                  size="sm"
                  icon={Copy}
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                    addToast('Kata sandi disalin ke clipboard!', 'info');
                  }}
                >
                  Salin
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="!bg-brand-red"
                onClick={handleConfirmResetPassword}
                loading={submitting}
              >
                Terapkan Kata Sandi Baru
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
