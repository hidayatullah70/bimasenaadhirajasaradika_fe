/**
 * RequireAuth — route guard that redirects unauthenticated users to /ops/login.
 * Shows a loading spinner while session is being restored.
 * Source of Truth: USER-FLOW.md Section 3 / PRD Section 33.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 className="h-8 w-8 animate-spin text-primary-red" />
          <span className="text-sm">Memuat sesi...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL so we can redirect after login
    return <Navigate to="/ops/login" state={{ from: location }} replace />;
  }

  return children;
}
