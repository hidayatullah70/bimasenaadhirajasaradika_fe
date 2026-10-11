/**
 * ProfilePage — PT. BARAK IOMS
 * Menampilkan detail profil pengguna aktif & formulir pergantian kata sandi (Change Password).
 */

import React, { useState } from 'react';
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
} from 'lucide-react';
import authAdapter from '@/services/adapters/authAdapter';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { currentUser } = useAuth();

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
        description="Kelola informasi identitas akun, hak akses jabatan, dan keamanan kata sandi Anda."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom 1: Informasi Akun (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
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
                <div className="h-20 w-20 rounded-full bg-primary-red/10 border-2 border-primary-red/20 flex items-center justify-center mb-3 shadow-inner">
                  <span className="text-3xl font-bold text-primary-red">
                    {currentUser.name?.[0] ?? 'U'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-ink text-center">{currentUser.name}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-red/10 text-primary-red mt-1">
                  {ROLE_LABELS[currentUser.role] || currentUser.role}
                </span>
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
              </div>

              <div className="mt-5 p-3 rounded-lg bg-info/10 border border-info/20 text-info">
                <p className="text-xs font-medium leading-relaxed">
                  Akun ini memiliki <strong>{currentUser.permissions?.length ?? 0} izin aktif</strong> sesuai kewenangan jabatan. Hubungi IT Support / Direktur jika membutuhkan eskalasi hak akses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Keamanan & Ubah Kata Sandi (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="border border-border shadow-sm">
            <CardHeader className="border-b border-border bg-canvas/30 py-4 px-6">
              <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary-red" />
                Keamanan & Ubah Kata Sandi
              </h2>
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

                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menyimpan Perubahan...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Perbarui Kata Sandi</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
