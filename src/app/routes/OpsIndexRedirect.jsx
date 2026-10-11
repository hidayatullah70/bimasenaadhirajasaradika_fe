/**
 * OpsIndexRedirect — PT. BARAK IOMS
 * Dynamically redirects users landing on /ops to their assigned department dashboard.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { ROLE_DEFAULT_ROUTE } from '@/constants/roles';

export default function OpsIndexRedirect() {
  const { role } = useAuth();
  const target = (role && ROLE_DEFAULT_ROUTE[role]) ? ROLE_DEFAULT_ROUTE[role] : '/ops/director';
  return <Navigate to={target} replace />;
}
