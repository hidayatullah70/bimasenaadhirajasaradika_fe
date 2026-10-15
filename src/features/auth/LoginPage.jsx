/**
 * LoginPage — internal login at /ops/login.
 * NOT linked from public navigation (PRD §2.2 / AGENTS.md rule).
 * Uses mock auth adapter in dev mode.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';

const QUICK_USERS = [
  { id: 'usr-001', username: 'direktur', password: 'dev_direktur_2026', name: 'Juli Priyanto', roleLabel: 'Direktur Utama', tag: 'Direksi', badgeColor: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'usr-002', username: 'hrd', password: 'dev_hrd_2026', name: 'Zaenal Arifin', roleLabel: 'HRD', tag: 'HRD', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'usr-003', username: 'legal', password: 'dev_legal_2026', name: 'Robyn Topani, S.H.', roleLabel: 'Legal', tag: 'Legal', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'usr-004', username: 'operasional', password: 'dev_operasional_2026', name: 'Nazi Rinaldi', roleLabel: 'Operasional', tag: 'Ops', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'usr-005', username: 'finance', password: 'dev_finance_2026', name: 'Nazi Rinaldi', roleLabel: 'Finance', tag: 'Finance', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'usr-006', username: 'marketing', password: 'dev_marketing_2026', name: 'Hendri Nopamin', roleLabel: 'Marketing', tag: 'Marketing', badgeColor: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'usr-007', username: 'itsupport', password: 'dev_itsupport_2026', name: 'Gheril Ramaditya S', roleLabel: 'IT Support', tag: 'IT', badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'usr-008', username: 'adminweb', password: 'dev_adminweb_2026', name: 'Hidayatullah', roleLabel: 'Admin Web', tag: 'CMS', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'usr-011', username: 'pic', password: 'dev_pic_2026', name: 'PIC Korlap', roleLabel: 'Kordinator Lapangan', tag: 'PIC', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'usr-009', username: 'user1', password: 'dev_user1_2026', name: 'Admin01 HRD', roleLabel: 'Inputer Absensi 1', tag: 'Inputer', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'usr-010', username: 'user2', password: 'dev_user2_2026', name: 'Admin02 HRD', roleLabel: 'Inputer Absensi 2', tag: 'Inputer', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/ops';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (!result.ok) {
      setError(result.error || 'Login gagal.');
    } else {
      const from = location.state?.from?.pathname || result.defaultRoute || '/ops';
      navigate(from, { replace: true });
    }
  };

  const handleQuickLogin = async (user) => {
    setError('');
    const uName = user.username === 'direkturutama' ? 'direktur' : user.username;
    const uPass = user.password || `dev_${uName}_2026`;
    setForm({ username: uName, password: uPass });
    setLoading(true);
    const result = await login({ username: uName, password: uPass });
    setLoading(false);
    if (result.ok) {
      navigate(result.defaultRoute || '/ops', { replace: true });
    } else {
      setError(result.error || 'Login gagal.');
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/assets/img/logo/logoAja.png"
            alt="PT. BIMASENA ADHIRAJASA RADIKA"
            className="h-16 object-contain mb-3"
          />
          <h1 className="text-xl font-bold text-ink">PT. BIMASENA ADHIRAJASA RADIKA</h1>
          <p className="text-sm text-muted mt-1">Sistem Manajemen Operasional Internal</p>
        </div>

        {/* Form card */}
        <div className="bg-surface rounded-xl border border-border shadow-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-ink mb-5">Masuk ke Sistem</h2>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-danger/5 border border-danger/20 text-danger text-sm"
            >
              <AlertCircle className="h-4 w-4 flex-none mt-0.5" aria-hidden />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="login-username" className="block text-sm font-medium text-ink mb-1.5">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  placeholder="Masukkan username"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red transition-all"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-ink mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Masukkan password"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                    aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                  </button>
                </div>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-red text-white rounded-lg font-semibold text-sm hover:bg-red-800 active:bg-red-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-red focus-visible:ring-offset-2"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <LogIn className="h-4 w-4" aria-hidden />
              )}
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Quick-login panel */}
        <div className="mt-6 bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-600 font-bold text-sm">⚡</span>
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Mode Quick Login — Uji Coba Pengguna
              </h3>
            </div>
            <span className="text-[11px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
              11 Akun Aktif
            </span>
          </div>
          <p className="text-[11px] text-amber-800/80 mb-3 leading-relaxed">
            Klik salah satu akun di bawah untuk langsung masuk dan menguji seluruh fungsi & alur kerja perannya:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
            {QUICK_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                disabled={loading}
                className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-left hover:border-primary-red/50 hover:bg-red-50/30 transition-all text-xs disabled:opacity-50 shadow-xs group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-ink group-hover:text-primary-red transition-colors truncate">
                      {u.name}
                    </span>
                  </div>
                  <p className="text-muted text-[11px] truncate mt-0.5">{u.roleLabel}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">@{u.username}</p>
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${u.badgeColor}`}>
                  {u.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
