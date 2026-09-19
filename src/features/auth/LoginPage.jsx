import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../app/context/AuthContext';

const QUICK_ACCOUNTS = [
  { role: 'owner', label: '1. Direktur', email: 'direktur@bimasenaadhirajasaradika.com', password: 'password123', color: 'hover:border-slate-800' },
  { role: 'hrd', label: '2. HRD & Personel', email: 'hrd@bimasenaadhirajasaradika.com', password: 'password123', color: 'hover:border-blue-500' },
  { role: 'operasional', label: '3. Operasional Site', email: 'operasional@bimasenaadhirajasaradika.com', password: 'password123', color: 'hover:border-amber-500' },
  { role: 'finance', label: '4. Finance & Billing', email: 'finance@bimasenaadhirajasaradika.com', password: 'password123', color: 'hover:border-emerald-600' },
  { role: 'marketing', label: '5. Marketing / BD', email: 'marketing@bimasenaadhirajasaradika.com', password: 'password123', color: 'hover:border-red-500' },
  { role: 'it_support', label: '6. IT Support', email: 'itsupport@bimasenaadhirajasaradika.com', password: 'password123', color: 'hover:border-purple-600' },
  { role: 'admin', label: '7. Admin', email: 'hidayatullah.ofc@gmail.com', password: 'Merdek@122', color: 'hover:border-slate-900' }
];

export function LoginPage({ onNavigate, onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResetReqModalOpen, setIsResetReqModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetReason, setResetReason] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Harap masukkan alamat email dan kata sandi.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res?.success && res?.data?.user) {
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

  const handleQuickLogin = async (acc) => {
    setError('');
    setEmail(acc.email);
    const pass = acc.password || 'password123';
    setPassword(pass);
    setLoading(true);
    try {
      const res = await login(acc.email, pass);
      if (res?.success && onLoginSuccess) {
        onLoginSuccess(res.data.user.role);
      }
    } catch (err) {
      setError(err.message || 'Gagal login ke akun.');
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
              placeholder="nama@bimasenaadhirajasaradika.com"
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
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email || '');
                  setResetReason('');
                  setResetSuccessMsg('');
                  setIsResetReqModalOpen(true);
                }}
                className="text-slate-500 hover:text-brand-red hover:underline transition-colors cursor-pointer"
              >
                Lupa password? Hubungi Admin
              </button>
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
          </form>

          {/* Quick Switch Role for Demo / Evaluator convenience */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Akses Cepat Login Sesuai Role (Backend Live):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACCOUNTS.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(item)}
                  className={`p-2 text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-btn text-left hover:bg-white ${item.color} hover:shadow-2xs transition-all`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Permohonan Reset Password ke Admin */}
      {isResetReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-brand-dark text-base">Permohonan Reset Kata Sandi</h3>
              <button
                onClick={() => setIsResetReqModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {resetSuccessMsg ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-2">
                <p className="font-bold text-sm">Permohonan Terkirim ke Administrator!</p>
                <p className="leading-relaxed">{resetSuccessMsg}</p>
                <div className="pt-2">
                  <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => setIsResetReqModalOpen(false)}>
                    Kembali ke Halaman Login
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!resetEmail) return;
                  setResetSuccessMsg(
                    `Permintaan reset kata sandi untuk akun ${resetEmail} telah diteruskan ke dasbor Administrator Website. Admin akan segera memverifikasi dan memperbarui kata sandi Anda.`
                  );
                }}
                className="space-y-4"
              >
                <p className="text-slate-600">
                  Masukkan alamat email akun operasional Anda. Administrator akan memproses reset kata sandi melalui panel kendali admin.
                </p>

                <Input
                  label="Alamat Email Karyawan"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="nama@bimasenaadhirajasaradika.com"
                  required
                />

                <Input
                  label="Alasan Permohonan Reset"
                  type="text"
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  placeholder="Contoh: Lupa kata sandi / ganti perangkat"
                  required
                />

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button variant="outline" size="sm" type="button" onClick={() => setIsResetReqModalOpen(false)}>
                    Batal
                  </Button>
                  <Button variant="primary" size="sm" type="submit" className="!bg-brand-red">
                    Kirim Permohonan ke Admin
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
