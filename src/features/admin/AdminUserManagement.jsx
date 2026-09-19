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
  Check,
  Upload
} from 'lucide-react';

// Scan all image files in /public/assets/img/team/ dynamically
const teamImageGlob = import.meta.glob('/public/assets/img/team/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG}', { eager: true });

const KNOWN_LABELS = {
  '/assets/img/team/intan.png': 'Intan Nuraini (Marketing)',
  '/assets/img/team/person-3.jpeg': 'Juli Priyanto (Direktur)',
  '/assets/img/team/person-7.jpeg': 'Robyn Topani (HRD)',
  '/assets/img/team/person-4.jpeg': 'Zaenal Arifin (Finance)',
  '/assets/img/team/person-2.jpeg': 'Hendri Nopamin (Marketing)',
  '/assets/img/team/nazi.jpg': 'Nazi Rinaldi (Operasional)',
  '/assets/img/team/person-5.jpeg': 'Gheril Ramaditya S. (IT Support)',
  '/assets/img/team/jusHidy3.png': 'Admin',
  '/assets/img/team/JustHidy3.png': 'Admin (Hidayatullah)'
};

function formatFileNameToLabel(filename) {
  const base = filename.replace(/\.[^/.]+$/, '');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function getAvailableTeamAvatars(customAvatars = []) {
  const list = [
    { label: 'Inisial Huruf (Otomatis dari Nama)', path: '' }
  ];

  const seenPaths = new Set(['']);

  // 1. Custom uploaded avatars
  customAvatars.forEach(item => {
    if (!seenPaths.has(item.path)) {
      seenPaths.add(item.path);
      list.push(item);
    }
  });

  // 2. Dynamic glob
  Object.keys(teamImageGlob).forEach(fullPath => {
    const publicUrl = fullPath.replace(/^\/public/, '');
    if (!seenPaths.has(publicUrl)) {
      seenPaths.add(publicUrl);
      const filename = publicUrl.split('/').pop();
      const label = KNOWN_LABELS[publicUrl] || `${formatFileNameToLabel(filename)} (Foto Tim)`;
      list.push({ label, path: publicUrl });
    }
  });

  // 3. Fallback defaults
  const fallbackList = [
    { label: 'Intan Nuraini (Marketing)', path: '/assets/img/team/intan.png' },
    { label: 'Juli Priyanto (Direktur)', path: '/assets/img/team/person-3.jpeg' },
    { label: 'Robyn Topani (HRD)', path: '/assets/img/team/person-7.jpeg' },
    { label: 'Zaenal Arifin (Finance)', path: '/assets/img/team/person-4.jpeg' },
    { label: 'Hendri Nopamin (Marketing)', path: '/assets/img/team/person-2.jpeg' },
    { label: 'Nazi Rinaldi (Operasional)', path: '/assets/img/team/nazi.jpg' },
    { label: 'Gheril Ramaditya S. (IT Support)', path: '/assets/img/team/person-5.jpeg' },
    { label: 'Admin', path: '/assets/img/team/jusHidy3.png' }
  ];

  fallbackList.forEach(item => {
    if (!seenPaths.has(item.path)) {
      seenPaths.add(item.path);
      list.push(item);
    }
  });

  return list;
}

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

  const [customAvatars, setCustomAvatars] = useState([]);
  const teamAvatars = React.useMemo(() => getAvailableTeamAvatars(customAvatars), [customAvatars]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role_id: '2',
    avatar_url: ''
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('File harus berupa gambar (PNG, JPG, JPEG, WEBP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const fileName = file.name;
      const pathGuess = `/assets/img/team/${fileName}`;
      
      const newOption = {
        label: `${formatFileNameToLabel(fileName)} (Upload: ${fileName})`,
        path: pathGuess,
        dataUrl: dataUrl
      };

      setCustomAvatars(prev => {
        const filtered = prev.filter(p => p.path !== pathGuess);
        return [newOption, ...filtered];
      });

      setFormData(prev => ({ ...prev, avatar_url: pathGuess }));
      addToast(`Foto ${fileName} berhasil dimuat dan siap digunakan!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleNameChange = (val) => {
    const lower = val.toLowerCase();
    let autoAvatar = formData.avatar_url;
    if (!formData.avatar_url || formData.avatar_url === '' || formData.avatar_url.includes('intan') || formData.avatar_url.includes('person') || formData.avatar_url.includes('nazi')) {
      if (lower.includes('intan')) {
        autoAvatar = '/assets/img/team/intan.png';
      } else if (lower.includes('gheril')) {
        autoAvatar = '/assets/img/team/person-5.jpeg';
      } else if (lower.includes('juli')) {
        autoAvatar = '/assets/img/team/person-3.jpeg';
      } else if (lower.includes('robyn')) {
        autoAvatar = '/assets/img/team/person-7.jpeg';
      } else if (lower.includes('zaenal') || lower.includes('bagas')) {
        autoAvatar = '/assets/img/team/person-4.jpeg';
      } else if (lower.includes('hendri')) {
        autoAvatar = '/assets/img/team/person-2.jpeg';
      } else if (lower.includes('nazi')) {
        autoAvatar = '/assets/img/team/nazi.jpg';
      }
    }
    setFormData(prev => ({ ...prev, name: val, avatar_url: autoAvatar }));
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res?.success && Array.isArray(res.data)) {
        let deletedIds = new Set();
        let deletedEmails = new Set();
        try {
          const rawIds = localStorage.getItem('barak_deleted_user_ids');
          if (rawIds) deletedIds = new Set(JSON.parse(rawIds));
          const rawEmails = localStorage.getItem('barak_deleted_user_emails');
          if (rawEmails) deletedEmails = new Set(JSON.parse(rawEmails));
        } catch (e) {}
        const cleanList = res.data.filter(u => 
          !deletedIds.has(String(u.id)) &&
          !deletedEmails.has(u.email?.trim().toLowerCase()) &&
          u.email !== 'hidayatullah.thab70@gmail.com' && 
          !u.email?.includes('thab70') &&
          u.email !== 'aisyah@bimasenaadhirajasaradika.com' &&
          !(u.name === 'Aisyah' && (u.is_active === 0 || u.is_active === false))
        );
        setUsers(cleanList);
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
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Intan Nuraini"
              required
            />
            <Input
              label="Alamat Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="intan@bimasenaadhirajasaradika.com"
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

          {/* Avatar Selector from teamAvatars with File Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Pilih Foto Profil Tim (Folder: <span className="font-mono text-brand-red">/assets/img/team/</span>)
              </label>
              <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold text-brand-red hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-2.5 py-1 rounded-lg border border-red-200 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Foto Baru</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
              {teamAvatars.map((item) => {
                const isSelected = formData.avatar_url === item.path;
                return (
                  <button
                    key={item.label + item.path}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar_url: item.path })}
                    className={`relative p-2 rounded-xl border text-left transition-all flex flex-col items-center gap-1.5 overflow-hidden ${
                      isSelected
                        ? 'border-brand-red ring-2 ring-brand-red/30 bg-red-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {item.path ? (
                      <img
                        src={item.dataUrl || item.path}
                        alt={item.label}
                        className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-slate-200"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.label)}&background=0284c7&color=fff`;
                        }}
                      />
                    ) : (
                      <Avatar
                        name={formData.name || 'User Baru'}
                        size="md"
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
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center gap-2">
              <span className="font-semibold text-slate-700">Foto Terpilih:</span>
              <span className="font-mono text-brand-red text-[11px] truncate">
                {formData.avatar_url || 'Inisial Huruf Otomatis (Tanpa Foto)'}
              </span>
            </div>
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
