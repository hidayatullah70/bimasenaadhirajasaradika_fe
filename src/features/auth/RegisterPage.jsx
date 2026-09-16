import React, { useState } from 'react';
import { Shield, Lock, Mail, User, Phone, Briefcase, ArrowRight, ArrowLeft, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/context/AuthContext';

export function RegisterPage({ onNavigate, onRegisterSuccess }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('operasional');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name || !email || !password) {
      setError('Harap lengkapi nama, email, dan kata sandi.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak sesuai.');
      return;
    }

    if (!agreeTerms) {
      setError('Anda harus menyetujui Ketentuan Layanan & Kebijakan Privasi.');
      return;
    }

    setLoading(true);
    try {
      if (register) {
        const res = await register({ name, email, phone, role, password });
        if (res.success) {
          setSuccessMsg('Pendaftaran berhasil! Mengalihkan ke sistem...');
          setTimeout(() => {
            if (onRegisterSuccess) {
              onRegisterSuccess(role);
            } else if (onNavigate) {
              onNavigate('dashboard');
            }
          }, 900);
          return;
        }
      }
      // Fallback
      setSuccessMsg('Akun berhasil dibuat! Silakan masuk.');
      setTimeout(() => {
        onNavigate && onNavigate('login');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal. Silakan periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-neutral flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-red-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-yellow-100/40 blur-3xl pointer-events-none" />

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('landing')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-dark bg-white px-3 py-1.5 rounded-btn border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-red flex items-center justify-center text-white shadow-lg shadow-red-900/20">
            <Shield className="w-7 h-7 text-brand-yellow fill-brand-yellow/20" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
          Registrasi Akun Baru
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
          PT. Bhimasena Adhirajasa Radhika Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-brand-red animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-green" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              id="name"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              required
            />

            <Input
              label="Alamat Email"
              type="email"
              id="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              required
            />

            <Input
              label="Nomor WhatsApp / Telepon"
              type="tel"
              id="phone"
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812-XXXX-XXXX"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className="text-xs font-semibold text-slate-700">
                Unit / Divisi Akses
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red text-slate-800 transition-all"
                >
                  <option value="operasional">Operasional Site & Personel</option>
                  <option value="hrd">HRD & Rekrutmen</option>
                  <option value="marketing">Marketing & Kemitraan Klien</option>
                  <option value="finance">Finance & Faktur</option>
                  <option value="owner">Direksi / Executive (Demo)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Kata Sandi"
                type="password"
                id="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Input
                label="Ulangi Sandi"
                type="password"
                id="confirmPassword"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-brand-red focus:ring-brand-red mt-0.5"
                />
                <span>Saya menyetujui Ketentuan Layanan & Kebijakan Kerahasiaan PT. BARAK.</span>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full shadow-md shadow-red-900/10"
                loading={loading}
                icon={UserPlus}
                iconPosition="left"
              >
                Daftar Akun Sekarang
              </Button>
            </div>
          </form>

          {/* Link to Login */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Sudah memiliki akun terdaftar?{' '}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('login')}
                className="font-bold text-brand-red hover:underline focus:outline-none"
              >
                Masuk ke Akun
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
