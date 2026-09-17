import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/context/AuthContext';
import { INITIAL_USERS } from '../../services/mock/mockData';

export function LoginPage({ onNavigate, onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Harap masukkan alamat email dan kata sandi.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        if (onLoginSuccess) {
          onLoginSuccess(res.data.user.role);
        }
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      const user = INITIAL_USERS.find(u => u.role === roleKey);
      if (user) {
        setEmail(user.email);
        setPassword('password');
        const res = await login(user.email, 'password');
        if (res.success && onLoginSuccess) {
          onLoginSuccess(roleKey);
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal login instan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-neutral flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-red-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-yellow-100/40 blur-3xl pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
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
          Portal Internal Operasional
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
          PT. Bhimasena Adhirajasa Radhika
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-brand-red animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Alamat Email Karyawan"
              type="email"
              id="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@bhimasena.co.id"
              required
            />

            <Input
              label="Kata Sandi Akun"
              type="password"
              id="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded text-brand-red focus:ring-brand-red" defaultChecked />
                <span>Ingat sesi saya</span>
              </label>
              <a
                href="https://wa.me/6285124799305?text=Halo%20Admin%20PT.%20BARAK%2C%20saya%20membutuhkan%20bantuan%20reset%20kata%20sandi%20portal%20internal"
                target="_blank"
                rel="noopener noreferrer"
                title="Hubungi Admin via WhatsApp untuk reset kata sandi"
                className="text-slate-500 hover:text-brand-red hover:underline transition-colors cursor-pointer"
              >
                Lupa password? Hubungi Admin
              </a>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full shadow-md shadow-red-900/10"
                loading={loading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Masuk ke Dashboard
              </Button>
            </div>

            <div className="text-center pt-1">
              <p className="text-xs text-slate-600">
                Belum memiliki akun terdaftar?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('register')}
                  className="font-bold text-brand-red hover:underline focus:outline-none"
                >
                  Daftar Sekarang
                </button>
              </p>
            </div>
          </form>

          {/* Quick Switch Role for Demo / Evaluator convenience */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Akses Cepat Demo Sesuai Role (SOT 5 Role):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'owner', label: '1. Direktur', color: 'hover:border-slate-800' },
                { role: 'hrd', label: '2. HRD & Personel', color: 'hover:border-blue-500' },
                { role: 'operasional', label: '3. Operasional Site', color: 'hover:border-amber-500' },
                { role: 'finance', label: '4. Finance & Billing', color: 'hover:border-emerald-600' },
                { role: 'marketing', label: '5. Marketing / BD', color: 'hover:border-red-500' }
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(item.role)}
                  className={`p-2 text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-btn text-left hover:bg-white ${item.color} hover:shadow-2xs transition-all`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
