/**
 * RequireRole Guard — PT. BARAK IOMS
 * Enforces role-level authorization on router routes.
 * Prevents unauthorized URL manipulation (e.g., Marketing user opening /ops/director).
 * Source of Truth: PRD Section 6, 19 / Architecture Refactor Step 2.
 */

import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_DEFAULT_ROUTE, ROLE_LABELS } from '@/constants/roles';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function RequireRole({ allowedRoles = [], children }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 className="h-8 w-8 animate-spin text-primary-red" />
          <span className="text-sm">Memeriksa hak akses peran...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/ops/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const defaultHome = ROLE_DEFAULT_ROUTE[role] || '/ops';
    const currentRoleLabel = ROLE_LABELS[role] || role || 'User';

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger border border-danger/20 mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-ink">Akses Modul Dibatasi (403)</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Akun Anda login sebagai peran <span className="font-semibold text-ink">{currentRoleLabel}</span>.
            Anda tidak memiliki otorisasi untuk mengakses modul ini.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => navigate(defaultHome, { replace: true })}
              className="w-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Dashboard Utama Anda</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
