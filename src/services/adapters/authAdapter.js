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
import { MOCK_USERS } from '@/services/mock/mockUsers';
import restClient from '@/services/apiClient';
import { attendanceAdapter } from '@/services/adapters/attendanceAdapter';

// --- Mock Implementation ---

const SESSION_KEY = 'barak_session';

const mockAuth = {
  async login({ username, password }) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 600));

    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return apiError('AUTH_INVALID', 'Username atau password salah.');
    }

    // Strip password before storing
    const { password: _pw, ...safeUser } = user;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));

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

    sessionStorage.removeItem(SESSION_KEY);
    return apiSuccess(null);
  },

  async getMe() {
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
