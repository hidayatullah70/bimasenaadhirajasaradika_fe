/**
 * ProfilePage — PT. BARAK IOMS
 * Menampilkan detail profil pengguna aktif & formulir pergantian kata sandi (Change Password).
 */

import React, { useState, useRef } from 'react';
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
import { resizeImageToSquare } from '@/utils/imageResize';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { currentUser, updateCurrentUser } = useAuth();

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

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
      const squareDataUrl = await resizeImageToSquare(file, 256);

      // Simpan ke authAdapter (sync ke avatarStore, userAdapter, & session)
      const res = await authAdapter.updateAvatar(squareDataUrl);
      if (res?.error) {
        toast.error(res.error.message || 'Gagal menyimpan foto profil.');
      } else {
        // Update reactive state di AuthContext
        if (updateCurrentUser) {
          updateCurrentUser({ avatar: squareDataUrl });
        }
        toast.success('Foto profil berhasil diperbarui & disinkronkan!');
      }
    } catch (err) {
      toast.error(err?.message || 'Gagal memproses gambar foto profil.');
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentUser?.avatar) return;
    setAvatarLoading(true);
    try {
      const res = await authAdapter.updateAvatar(null);
      if (res?.error) {
        toast.error(res.error.message || 'Gagal menghapus foto profil.');
      } else {
        if (updateCurrentUser) {
          updateCurrentUser({ avatar: null });
        }
        toast.success('Foto profil dikembalikan ke inisial nama.');
      }
    } catch (err) {
      toast.error('Gagal menghapus foto profil.');
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
                <div className="relative group mb-3">
                  <div className="h-20 w-20 rounded-full bg-primary-red/10 border-2 border-primary-red/30 flex items-center justify-center shadow-md overflow-hidden relative">
                    {avatarLoading ? (
                      <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    ) : currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary-red">
                        {currentUser.name?.[0] ?? 'U'}
                      </span>
                    )}
                  </div>

                  {/* Tombol Kamera Cepat pada Badge Avatar */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary-red text-white hover:bg-primary-red/90 shadow-lg border-2 border-white transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50"
                    title="Ganti Foto Profil"
                    aria-label="Ganti Foto Profil"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
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

                {/* Tombol Aksi Foto Profil */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-canvas hover:bg-slate/10 text-ink font-medium transition-colors disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5 text-primary-red" />
                    <span>Upload Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-canvas hover:bg-slate/10 text-ink font-medium transition-colors disabled:opacity-50"
                    title="Ambil foto langsung dengan kamera device"
                  >
                    <Camera className="h-3.5 w-3.5 text-primary-red" />
                    <span>Kamera</span>
                  </button>

                  {currentUser.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={avatarLoading}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-danger/20 bg-danger/5 hover:bg-danger/15 text-danger font-medium transition-colors disabled:opacity-50"
                      title="Hapus foto profil dan kembali ke inisial"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
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
