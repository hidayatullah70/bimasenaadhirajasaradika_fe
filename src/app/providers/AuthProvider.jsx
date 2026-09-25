/**
 * AuthContext — global authentication and RBAC context.
 * Provides: currentUser, role, permissions, login, logout, loading, hasPermission.
 * Note: useAuth is re-exported from this file for convenience; components may also import from @/hooks/useAuth.
 *
 * IMPORTANT: Frontend permission checks are UX-only (sidebar/button visibility).
 * Backend must independently enforce all authorization server-side.
 * Source of Truth: PRD Section 6, 19, 33 / USER-FLOW.md Section 3.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authAdapter from '@/services/adapters/authAdapter';
import { ROLE_DEFAULT_ROUTE } from '@/constants/roles';

/** @type {React.Context} */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await authAdapter.getMe();
      if (!cancelled) {
        if (data) setCurrentUser(data);
        if (err && err.code !== 'AUTH_UNAUTHENTICATED') {
          setError(err.message);
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /**
   * @param {{ username: string, password: string }} credentials
   * @returns {Promise<{ ok: boolean, defaultRoute?: string, error?: string }>}
   */
  const login = useCallback(async (credentials) => {
    setError(null);
    const { data, error: err } = await authAdapter.login(credentials);
    if (err) {
      setError(err.message);
      return { ok: false, error: err.message };
    }
    setCurrentUser(data);
    return { ok: true, defaultRoute: ROLE_DEFAULT_ROUTE[data.role] || '/ops' };
  }, []);

  const logout = useCallback(async () => {
    await authAdapter.logout();
    setCurrentUser(null);
    setError(null);
  }, []);

  /**
   * Check if the current user has a given permission.
   * @param {string} permission - Permission key from PERMISSIONS constant
   * @returns {boolean}
   */
  const hasPermission = useCallback(
    (permission) => {
      if (!currentUser) return false;
      return currentUser.permissions?.includes(permission) ?? false;
    },
    [currentUser]
  );

  /**
   * Check if the current user has a given role.
   * @param {string|string[]} role
   * @returns {boolean}
   */
  const hasRole = useCallback(
    (role) => {
      if (!currentUser) return false;
      if (Array.isArray(role)) return role.includes(currentUser.role);
      return currentUser.role === role;
    },
    [currentUser]
  );

  const value = {
    currentUser,
    role: currentUser?.role ?? null,
    permissions: currentUser?.permissions ?? [],
    loading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** @returns {typeof value} */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
