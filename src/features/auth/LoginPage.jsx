/**
 * LoginPage — internal login at /ops/login.
 * NOT linked from public navigation (PRD §2.2 / AGENTS.md rule).
 * Uses mock auth adapter in dev mode.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { MOCK_USERS } from '@/services/mock/mockUsers';
import { ROLE_LABELS } from '@/constants/roles';
import { isMockMode } from '@/services/apiClient';

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
    setForm({ username: user.username, password: user.password });
    setLoading(true);
    const result = await login({ username: user.username, password: user.password });
    setLoading(false);
    if (result.ok) navigate(result.defaultRoute || '/ops', { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/assets/img/logo/logoAja.png"
            alt="PT. Bhimasena Adhirajasa Radhika"
            className="h-16 object-contain mb-4"
          />
          <h1 className="text-xl font-bold text-ink">PT. Bhimasena Adhirajasa Radhika</h1>
          <p className="text-sm text-muted mt-1">Sistem Manajemen Operasional Internal</p>
        </div>

        {/* Form card */}
        <div className="bg-surface rounded-xl border border-border shadow-card p-8">
          <h2 className="text-lg font-semibold text-ink mb-6">Masuk ke Sistem</h2>

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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-canvas text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red transition-all"
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
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-canvas text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/30 focus:border-primary-red transition-all pr-10"
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

        {/* Dev quick-login panel — visible only in mock mode */}
        {isMockMode() && (
          <div className="mt-6 bg-primary-yellow/10 border border-primary-yellow/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-3 uppercase tracking-wide">
              ⚡ Dev Mode — Quick Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  disabled={loading}
                  className="flex flex-col items-start px-3 py-2 bg-white border border-border rounded-lg text-left hover:border-primary-red/30 hover:bg-primary-red/5 transition-all text-xs disabled:opacity-50"
                >
                  <span className="font-semibold text-ink">{u.name}</span>
                  <span className="text-muted">{ROLE_LABELS[u.role]}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-amber-700 mt-2 opacity-70">
              Panel ini tidak muncul di mode REST/produksi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
