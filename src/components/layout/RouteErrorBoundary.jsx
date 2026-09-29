/**
 * Route Error Boundary Component — PT. BARAK IOMS
 * Graceful error handling for route-level exceptions.
 * Source of Truth: UI-GUIDELINE & USER-FLOW Global Error Standards.
 */

import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const errorMessage = error?.message || error?.statusText || 'Gagal memproses modul antarmuka.';

  return (
    <div className="min-h-[420px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-border shadow-xs my-6 mx-auto max-w-2xl">
      <div className="w-16 h-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mb-4 shadow-inner">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-ink mb-2">Terjadi Kendala pada Halaman</h2>
      <p className="text-sm text-muted max-w-md mb-6 leading-relaxed">
        {errorMessage}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Muat Ulang
        </Button>
        <Button variant="primary" onClick={() => navigate('/ops')}>
          <Home className="w-4 h-4 mr-2" />
          Kembali ke Operasional
        </Button>
      </div>
    </div>
  );
}
