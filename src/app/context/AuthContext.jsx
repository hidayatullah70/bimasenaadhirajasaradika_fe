import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../services/api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const token = localStorage.getItem('barak_auth_token');
        if (token) {
          const res = await api.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {}
    localStorage.removeItem('barak_auth_token');
    localStorage.removeItem('barak_user_role');
    setUser(null);
  };

  // Switch role helper for testing all 5 roles seamlessly
  const switchRole = async (targetRole) => {
    const roleCode = (targetRole === 'owner' || targetRole === 'direktur') ? 'direktur' : targetRole;
    localStorage.setItem('barak_user_role', roleCode);
    localStorage.setItem('barak_auth_token', `mock-jwt-token-${roleCode}`);
    try {
      const res = await api.getCurrentUser();
      if (res && res.success && res.data) {
        setUser(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn('Switch role fetch error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role, isAuthenticated: !!user, loading, login, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
