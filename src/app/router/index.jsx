/**
 * Application Router Entry Point — PT. BARAK IOMS
 * Clean, modular router entry delegating to src/app/routes.
 * Source of Truth: PRD Section 7 / Architecture Refactor Step 2.
 */

import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import appRoutes from '@/app/routes';

const router = createBrowserRouter(appRoutes);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
