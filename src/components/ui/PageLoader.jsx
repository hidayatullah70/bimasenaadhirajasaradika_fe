/**
 * PageLoader — Shared loading spinner fallback for lazy-loaded routes.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <Loader2 className="h-8 w-8 animate-spin text-primary-red" />
    </div>
  );
}
