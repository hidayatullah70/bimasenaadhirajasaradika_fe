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

    return apiSuccess(safeUser);
  },

  async logout() {
    await new Promise((r) => setTimeout(r, 200));
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
    return restClient.post('/auth/login', credentials);
  },
  async logout() {
    const result = await restClient.post('/auth/logout', {});
    sessionStorage.removeItem('barak_token');
    return result;
  },
  async getMe() {
    return restClient.get('/auth/me');
  },
};

// --- Export active adapter ---
const authAdapter = isMockMode() ? mockAuth : restAuth;
export default authAdapter;
