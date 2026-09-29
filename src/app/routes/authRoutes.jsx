/**
 * Authentication Routes — PT. BARAK IOMS
 * Private login route: /ops/login
 * Source of Truth: PRD Section 2.2 / Architecture Refactor Step 2.
 */

import React, { lazy, Suspense } from 'react';
import PageLoader from '@/components/ui/PageLoader';

const LoginPage = lazy(() => import('@/features/auth/LoginPage'));

export const authRoutes = [
  {
    path: '/ops/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
];

export default authRoutes;
