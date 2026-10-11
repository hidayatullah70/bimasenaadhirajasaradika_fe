/**
 * ProfilePage — PT. BARAK IOMS
 * Menampilkan detail profil pengguna aktif & formulir pergantian kata sandi (Change Password).
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_LABELS } from '@/constants/roles';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  User,
  Mail,
  Building2,
  Shield,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  Loader2,
} from 'lucide-react';
import authAdapter from '@/services/adapters/authAdapter';
import imageResize from '@/utils/imageResize';
import { getCustomAvatar, getLastUpdatedAvatar } from '@/utils/avatarStore';
import toast from 'react-hot-toast';

/**
 * Resize and center-crop an uploaded image file to 1:1 aspect ratio (square avatar).
 * Includes robust inline canvas fallback to guarantee compatibility across all environments.
 */
function cropImageToSquare(file, targetSize = 256) {
  if (imageResize && typeof imageResize.resizeImageToSquare === 'function') {
    return imageResize.resizeImageToSquare(file, targetSize);
  }

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih harus berupa file gambar.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar dari device.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat format gambar.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Browser tidak mendukung Canvas grafis.'));
          return;
        }

        const cropSize = Math.min(img.width, img.height);
        let cropX = 0;
        let cropY = 0;

        if (img.width > img.height) {
          cropX = Math.round((img.width - cropSize) / 2);
        } else if (img.height > img.width) {
          cropY = Math.round((img.height - cropSize) * 0.25);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, targetSize, targetSize);

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { currentUser, updateCurrentUser } = useAuth();

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(() => {
    return (
      currentUser?.avatar ||
      (currentUser?.username ? getCustomAvatar(currentUser.username) : null) ||
      (currentUser?.id ? getCustomAvatar(currentUser.id) : null) ||
      getLastUpdatedAvatar() ||
      null
    );
  });

  const activeAvatar =
    avatarPreview ||
    currentUser?.avatar ||
    (currentUser?.username ? getCustomAvatar(currentUser.username) : null) ||
    (currentUser?.id ? getCustomAvatar(currentUser.id) : null) ||
    getLastUpdatedAvatar() ||
    null;

  // Sync avatarPreview whenever currentUser updates
  useEffect(() => {
    const avatar =
      currentUser?.avatar ||
      (currentUser?.username ? getCustomAvatar(currentUser.username) : null) ||
      (currentUser?.id ? getCustomAvatar(currentUser.id) : null) ||
      getLastUpdatedAvatar() ||
      null;
    if (avatar) {
      setAvatarPreview(avatar);
    }
  }, [currentUser]);

  // Listen to cross-component avatar update event for real-time sync
  useEffect(() => {
    const handleAvatarUpdate = (e) => {
      const { identifier, avatar } = e.detail || {};
      const currentUsername = currentUser?.username?.toLowerCase().trim();
      const currentId = currentUser?.id?.toLowerCase().trim();
      if (!identifier || identifier === currentUsername || identifier === currentId) {
        setAvatarPreview(avatar || null);
      }
    };
    window.addEventListener('barak:avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('barak:avatar-updated', handleAvatarUpdate);
  }, [currentUser]);

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);

  // Close avatar popup menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setAvatarMenuOpen(false);
      }
    };
    if (avatarMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [avatarMenuOpen]);

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser) return null;

  const handleProcessImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File yang dipilih harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Ukuran file foto terlalu besar (maksimal 15MB).');
      return;
    }

    setAvatarLoading(true);
    try {
      // Otomatis resize & center-crop ke rasio 1:1 persegi (256x256)
      const squareDataUrl = await cropImageToSquare(file, 256);

      // Langsung perbarui tampilan lokal secara instan (0ms delay)
      setAvatarPreview(squareDataUrl);

      // Simpan ke authAdapter (sync ke avatarStore, userAdapter, & session)
      const res = await authAdapter.updateAvatar(squareDataUrl);
      if (res?.error) {
        setAvatarPreview(currentUser?.avatar || null);
        toast.error(res.error.message || 'Gagal menyimpan foto profil.');
      } else {
        // Update reactive state di AuthContext
        if (updateCurrentUser) {
          updateCurrentUser({ avatar: squareDataUrl });
        }
        toast.success('Foto profil berhasil diperbarui & disinkronkan!');
      }
    } catch (err) {
      setAvatarPreview(currentUser?.avatar || null);
      toast.error(err?.message || 'Gagal memproses gambar foto profil.');
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!activeAvatar) return;
    setAvatarLoading(true);
    const prevAvatar = activeAvatar;
    setAvatarPreview(null);
    try {
      const res = await authAdapter.updateAvatar(null);
      if (res?.error) {
        setAvatarPreview(prevAvatar);
        toast.error(res.error.message || 'Gagal menghapus foto profil.');
      } else {
        if (updateCurrentUser) {
          updateCurrentUser({ avatar: null });
        }
        toast.success('Foto profil dikembalikan ke inisial nama.');
      }
    } catch (err) {
      setAvatarPreview(prevAvatar);
      toast.error(err?.message || 'Gagal menghapus foto profil.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!currentPassword.trim()) {
      setError('Kata sandi saat ini wajib diisi.');
      return;
    }
    if (!newPassword.trim()) {
      setError('Kata sandi baru wajib diisi.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setLoading(true);
    const res = await authAdapter.changePassword({
      currentPassword: currentPassword.trim(),
      newPassword: newPassword.trim(),
    });
    setLoading(false);

    if (res?.error) {
      setError(res.error.message || 'Gagal mengubah kata sandi.');
      toast.error(res.error.message || 'Gagal mengubah kata sandi.');
    } else {
      setSuccessMsg('Kata sandi akun Anda berhasil diperbarui!');
      toast.success('Kata sandi akun Anda berhasil diperbarui!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Pengguna"
        description="Kelola informasi identitas akun, foto profil, hak akses jabatan, dan keamanan kata sandi Anda."
      />

      <div
        className={`transition-all duration-300 ${
          showPasswordForm
            ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
            : 'max-w-xl mx-auto'
        }`}
      >
        {/* Kolom 1: Informasi Akun */}
        <div className={showPasswordForm ? 'lg:col-span-5 space-y-6' : 'w-full space-y-6'}>
          <Card className="border border-border shadow-sm">
            <CardHeader className="border-b border-border bg-canvas/30 py-4 px-6">
              <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                <User className="h-4 w-4 text-primary-red" />
                Informasi Akun
              </h2>
            </CardHeader>
            <CardContent className="pt-6 px-6 pb-6">
              {/* Avatar & Header */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-3" ref={avatarMenuRef}>
                  <div
                    className="h-20 w-20 rounded-full bg-primary-red/10 border-2 border-primary-red/30 flex items-center justify-center shadow-md overflow-hidden relative cursor-pointer"
                    onClick={() => setAvatarMenuOpen((v) => !v)}
                    title="Klik untuk kelola foto profil"
                  >
                    {avatarLoading ? (
                      <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    ) : activeAvatar ? (
                      <img
                        src={activeAvatar}
                        alt={currentUser.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary-red">
                        {currentUser.name?.[0] ?? 'U'}
                      </span>
                    )}
                  </div>

                  {/* Tombol Kamera pada Badge Avatar */}
                  <button
                    type="button"
                    onClick={() => setAvatarMenuOpen((v) => !v)}
                    disabled={avatarLoading}
                    className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary-red text-white hover:bg-primary-red/90 shadow-lg border-2 border-white transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50"
                    title="Kelola Foto Profil"
                    aria-label="Kelola Foto Profil"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>

                  {/* Dropdown Menu Tindakan Foto Profil */}
                  {avatarMenuOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-surface rounded-xl border border-border shadow-dropdown py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarMenuOpen(false);
                          fileInputRef.current?.click();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-ink hover:bg-canvas text-left transition-colors font-medium"
                      >
                        <Upload className="h-3.5 w-3.5 text-primary-red" />
                        <span>{activeAvatar ? 'Ganti Foto (Galeri)' : 'Upload Foto (Galeri)'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarMenuOpen(false);
                          cameraInputRef.current?.click();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-ink hover:bg-canvas text-left transition-colors font-medium"
                      >
                        <Camera className="h-3.5 w-3.5 text-primary-red" />
                        <span>Ambil dari Kamera</span>
                      </button>
                      {activeAvatar && (
                        <>
                          <div className="h-px bg-border my-1" />
                          <button
                            type="button"
                            onClick={() => {
                              setAvatarMenuOpen(false);
                              handleRemoveAvatar();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-danger hover:bg-danger/10 text-left transition-colors font-medium"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-danger" />
                            <span>Hapus Foto Profil</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-ink text-center">{currentUser.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-red/10 text-primary-red mt-1">
                  {ROLE_LABELS[currentUser.role] || currentUser.role}
                </span>

                {/* Hidden File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessImage(file);
                  }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProcessImage(file);
                  }}
                />
              </div>

              {/* Detail fields */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-canvas border border-border">
                  <User className="h-4 w-4 text-muted flex-none" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs text-muted">Username</p>
                    <p className="text-sm font-semibold text-ink truncate">{currentUser.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-canvas border border-border">
                  <Mail className="h-4 w-4 text-muted flex-none" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs text-muted">Email Resmi</p>
                    <p className="text-sm font-semibold text-ink truncate">{currentUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-canvas border border-border">
                  <Building2 className="h-4 w-4 text-muted flex-none" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs text-muted">Departemen</p>
                    <p className="text-sm font-semibold text-ink truncate">
                      {currentUser.department || 'Operasional PT. BARAK'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-canvas border border-border">
                  <Shield className="h-4 w-4 text-muted flex-none" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs text-muted">Peran Otorisasi</p>
                    <p className="text-sm font-semibold text-ink truncate">
                      {ROLE_LABELS[currentUser.role] || currentUser.role}
                    </p>
                  </div>
                </div>

                {/* Tombol Ubah Kata Sandi / Password di bawah field Peran Otorisasi */}
                <div className="pt-2">
                  <Button
                    type="button"
                    variant={showPasswordForm ? 'outline' : 'primary'}
                    onClick={() => {
                      setShowPasswordForm((prev) => !prev);
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 font-medium shadow-sm transition-all"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>
                      {showPasswordForm
                        ? 'Tutup Formulir Kata Sandi'
                        : 'Ubah Kata Sandi / Password'}
                    </span>
                  </Button>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-lg bg-info/10 border border-info/20 text-info">
                <p className="text-xs font-medium leading-relaxed">
                  Akun ini memiliki <strong>{currentUser.permissions?.length ?? 0} izin aktif</strong> sesuai kewenangan jabatan. Hubungi IT Support / Direktur jika membutuhkan eskalasi hak akses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Keamanan & Ubah Kata Sandi (Tampil saat showPasswordForm = true) */}
        {showPasswordForm && (
          <div className="lg:col-span-7 transition-all duration-300">
            <Card className="border border-border shadow-sm">
              <CardHeader className="border-b border-border bg-canvas/30 py-4 px-6 flex flex-row items-center justify-between">
                <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary-red" />
                  Keamanan & Ubah Kata Sandi
                </h2>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="text-xs text-muted hover:text-ink font-medium px-2.5 py-1 rounded border border-border hover:bg-canvas transition-colors"
                >
                  Tutup
                </button>
              </CardHeader>
              <CardContent className="pt-6 px-6 pb-6">
                <p className="text-sm text-muted mb-6 leading-relaxed">
                  Untuk menjaga keamanan akun operasional Anda, disarankan untuk memperbarui kata sandi secara berkala dengan minimal 6 karakter kombinasi huruf dan angka.
                </p>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 mb-5 p-3.5 rounded-lg bg-danger/10 border border-danger/25 text-danger text-sm"
                  >
                    <AlertCircle className="h-4 w-4 flex-none mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div
                    role="status"
                    className="flex items-start gap-2.5 mb-5 p-3.5 rounded-lg bg-success/10 border border-success/25 text-success text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 flex-none mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Kata Sandi Saat Ini */}
                  <div>
                    <label
                      htmlFor="current-password-input"
                      className="block text-sm font-medium text-ink mb-1.5"
                    >
                      Kata Sandi Saat Ini <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="current-password-input"
                        type={showCurrent ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Masukkan kata sandi saat ini"
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red pr-10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                        aria-label={showCurrent ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Kata Sandi Baru */}
                  <div>
                    <label
                      htmlFor="new-password-input"
                      className="block text-sm font-medium text-ink mb-1.5"
                    >
                      Kata Sandi Baru <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="new-password-input"
                        type={showNew ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red pr-10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                        aria-label={showNew ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Kata Sandi Baru */}
                  <div>
                    <label
                      htmlFor="confirm-password-input"
                      className="block text-sm font-medium text-ink mb-1.5"
                    >
                      Konfirmasi Kata Sandi Baru <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password-input"
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red pr-10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                        aria-label={showConfirm ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <span>Perbarui Kata Sandi</span>
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setError('');
                        setSuccessMsg('');
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
