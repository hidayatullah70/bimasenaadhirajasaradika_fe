import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../services/api/apiClient';

const AuthContext = createContext(null);

const ROLE_CREDENTIALS = {
  admin: { email: 'hidayatullah.ofc@gmail.com', password: 'Merdek@122' },
  direktur: { email: 'direktur@bimasenaadhirajasaradika.com', password: 'password123' },
  owner: { email: 'direktur@bimasenaadhirajasaradika.com', password: 'password123' },
  hrd: { email: 'hrd@bimasenaadhirajasaradika.com', password: 'password123' },
  finance: { email: 'finance@bimasenaadhirajasaradika.com', password: 'password123' },
  marketing: { email: 'marketing@bimasenaadhirajasaradika.com', password: 'password123' },
  operasional: { email: 'operasional@bimasenaadhirajasaradika.com', password: 'password123' },
  it_support: { email: 'itsupport@bimasenaadhirajasaradika.com', password: 'password123' }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const token = localStorage.getItem('barak_auth_token');
        if (token) {
          const res = await api.getCurrentUser();
          if (res?.success && res?.data) {
            setUser(res.data);
          } else {
            // Token might be expired or invalid
            localStorage.removeItem('barak_auth_token');
            localStorage.removeItem('barak_user_role');
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err.message);
        localStorage.removeItem('barak_auth_token');
        localStorage.removeItem('barak_user_role');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res?.success && res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.createUser(userData);
    if (res?.success && res?.data) {
      setUser(res.data);
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout error:', err.message);
    } finally {
      localStorage.removeItem('barak_auth_token');
      localStorage.removeItem('barak_user_role');
      setUser(null);
    }
  };

  // Switch role helper for testing all 5 roles using real backend auth login
  const switchRole = async (targetRole) => {
    const roleKey = (targetRole === 'owner' || targetRole === 'direktur') ? 'direktur' : targetRole;
    const creds = ROLE_CREDENTIALS[roleKey] || ROLE_CREDENTIALS.direktur;
    
    try {
      const res = await api.login(creds);
      if (res?.success && res?.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      console.warn('Switch role login error:', err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || user?.role_code, isAuthenticated: !!user, loading, login, register, logout, switchRole }}>
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
