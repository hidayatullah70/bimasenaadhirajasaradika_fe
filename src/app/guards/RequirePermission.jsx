/**
 * RequirePermission — renders a 403 fallback if the user lacks a required permission.
 * Frontend UX only — backend must independently enforce permissions server-side.
 * Source of Truth: PRD Section 19 / AGENTS.md rule 4.
 *
 * Usage:
 *   <RequirePermission permission={PERMISSIONS.ATTENDANCE_FINALIZE}>
 *     <FinalizeButton />
 *   </RequirePermission>
 */

import React from 'react';
import { ShieldOff } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';

export default function RequirePermission({ permission, fallback, children }) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    if (fallback !== undefined) return fallback;
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-canvas p-8 text-center">
        <ShieldOff className="h-10 w-10 text-muted" />
        <div>
          <p className="font-semibold text-ink">Akses Dibatasi</p>
          <p className="mt-1 text-sm text-muted">
            Anda tidak memiliki izin untuk melihat konten ini.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
