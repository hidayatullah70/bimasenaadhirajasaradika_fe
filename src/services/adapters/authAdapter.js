/**
 * Auth Service Adapter.
 * Interface shared by mock and REST implementations.
 * Feature components must never call fetch/API directly.
 * Source of Truth: API-SPEC.md Section 2.
 *
 * Interface contract:
 *   login(credentials: { username, password }) → { data: User, error }
 *   logout() → { data: null, error }
 *   getMe() → { data: User, error }
 */

import { isMockMode, apiSuccess, apiError } from '@/services/apiClient';
import { MOCK_USERS, ROLE_PERMISSIONS } from '@/services/mock/mockUsers';
import { ROLE_LABELS } from '@/constants/roles';
import userAdapter from '@/services/adapters/userAdapter';
import restClient from '@/services/apiClient';
import { attendanceAdapter } from '@/services/adapters/attendanceAdapter';

// --- Mock Implementation ---

const SESSION_KEY = 'barak_session';

const mockAuth = {
  async login({ username, password }) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 600));

    const cleanInput = String(username || '').toLowerCase().trim();
    if (!cleanInput) {
      return apiError('AUTH_INVALID', 'Username dan password wajib diisi.');
    }

    const aliasMap = {
      'direktur': 'direkturutama',
      'juli.priyanto': 'direkturutama',
      'zaenal.arifin': 'hrd',
      'robyn.topani': 'legal',
      'nazi.rinaldi.ops': 'operasional',
      'ops': 'operasional',
      'nazi.rinaldi.fin': 'finance',
      'keuangan': 'finance',
      'hendri.nopamin': 'marketing',
      'gheril.ramaditya': 'itsupport',
      'it': 'itsupport',
      'hidayatullah': 'adminweb',
    };

    const targetUsername = aliasMap[cleanInput] || cleanInput;

    // 1. Cari di MOCK_USERS
    const mockUser = MOCK_USERS.find((u) => {
      const uName = (u.username || '').toLowerCase().trim();
      return uName === targetUsername || uName === cleanInput;
    });

    // 2. Cek apakah ada data terkini di live user store
    const liveUserRes = await userAdapter.getUserById(targetUsername);
    const liveUser = liveUserRes?.data;

    // Jika akun ditemukan di live store dan berstatus NON-AKTIF/SUSPENDED, tolak login
    if (liveUser && liveUser.status !== 'ACTIVE') {
      return apiError('AUTH_INACTIVE', 'Akun pengguna ini sedang dinonaktifkan.');
    }

    let user = null;

    if (mockUser) {
      // Verifikasi password mock
      const validPw =
        password === mockUser.password ||
        (targetUsername === 'direkturutama' && (password === 'dev_direkturutama_2026' || password === 'dev_direktur_2026')) ||
        password === `dev_${mockUser.username}_2026` ||
        password === 'admin123' ||
        password === 'password';

      if (validPw) {
        user = {
          ...mockUser,
          ...(liveUser || {}),
          role: liveUser?.role || mockUser.role,
          roleLabel: liveUser?.roleLabel || mockUser.roleLabel || ROLE_LABELS[mockUser.role],
          permissions: mockUser.permissions || ROLE_PERMISSIONS[mockUser.role] || [],
        };
      }
    } else if (liveUser && liveUser.status === 'ACTIVE') {
      // Akun dinamis yang dibuat dari menu Pengguna & Akses
      user = {
        ...liveUser,
        roleLabel: liveUser.roleLabel || ROLE_LABELS[liveUser.role] || liveUser.role,
        permissions: ROLE_PERMISSIONS[liveUser.role] || [],
      };
    }

    if (!user) {
      return apiError('AUTH_INVALID', 'Username atau password salah.');
    }

    // Strip password before storing
    const { password: _pw, ...safeUser } = user;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    }

    // Clear history on login for user1 / user2 to guarantee clean state
    if (safeUser.isAttendanceOnly || safeUser.username === 'user1' || safeUser.username === 'user2') {
      const uId = safeUser.username || safeUser.id;
      attendanceAdapter.clearInputerHistory(uId);
    }

    return apiSuccess(safeUser);
  },

  async logout(userContext) {
    await new Promise((r) => setTimeout(r, 200));

    let currentUser = userContext;
    if (!currentUser && typeof sessionStorage !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) currentUser = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    if (currentUser?.isAttendanceOnly || currentUser?.username === 'user1' || currentUser?.username === 'user2') {
      const uId = currentUser.username || currentUser.id;
      attendanceAdapter.clearInputerHistory(uId);
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY);
    }
    return apiSuccess(null);
  },

  async getMe() {
    if (typeof sessionStorage === 'undefined') {
      return apiError('AUTH_UNAUTHENTICATED', 'Tidak ada sesi aktif.');
    }
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return apiError('AUTH_UNAUTHENTICATED', 'Tidak ada sesi aktif.');
    try {
      return apiSuccess(JSON.parse(raw));
    } catch {
      return apiError('AUTH_CORRUPT_SESSION', 'Sesi tidak valid.');
    }
  },
};

// --- REST Implementation ---

const restAuth = {
  async login(credentials) {
    const res = await restClient.post('/auth/login', credentials);
    if (res.data && (res.data.isAttendanceOnly || res.data.username === 'user1' || res.data.username === 'user2')) {
      const uId = res.data.username || res.data.id;
      attendanceAdapter.clearInputerHistory(uId);
    }
    return res;
  },
  async logout(userContext) {
    let currentUser = userContext;
    if (!currentUser) {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) currentUser = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    if (currentUser?.isAttendanceOnly || currentUser?.username === 'user1' || currentUser?.username === 'user2') {
      const uId = currentUser.username || currentUser.id;
      attendanceAdapter.clearInputerHistory(uId);
    }

    const result = await restClient.post('/auth/logout', {});
    sessionStorage.removeItem('barak_token');
    sessionStorage.removeItem(SESSION_KEY);
    return result;
  },
  async getMe() {
    return restClient.get('/auth/me');
  },
};

// --- Export active adapter ---
const authAdapter = isMockMode() ? mockAuth : restAuth;
export default authAdapter;
