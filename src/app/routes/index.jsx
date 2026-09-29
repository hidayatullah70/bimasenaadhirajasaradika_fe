/**
 * Modular Application Routes Assembly — PT. BARAK IOMS
 * Combines Public, Authentication, and Role-Guarded Internal routes.
 * Source of Truth: PRD Section 7 / Architecture Refactor Step 2.
 */

import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import RequireAuth from '@/app/guards/RequireAuth';
import PageLoader from '@/components/ui/PageLoader';
import RouteErrorBoundary from '@/components/layout/RouteErrorBoundary';
import publicRoutes from './publicRoutes';
import authRoutes from './authRoutes';
import roleRoutes from './roleRoutes';

const AppShell = lazy(() => import('@/components/layout/AppShell'));

export const appRoutes = [
  // 1. Private Authentication
  ...authRoutes,

  // 2. Internal Protected Operations Area
  {
    path: '/ops',
    errorElement: <RouteErrorBoundary />,
    element: (
      <RequireAuth>
        <Suspense fallback={<PageLoader />}>
          <AppShell />
        </Suspense>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/ops/director" replace /> },
      ...roleRoutes,
    ],
  },

  // 3. Approved Public Marketing Pages (FROZEN / Includes 404 handler)
  ...publicRoutes,
];

export default appRoutes;
