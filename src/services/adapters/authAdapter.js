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
import { emitAudit } from '@/utils/auditLogger';
import { getStoredPasswords, saveStoredPassword, getCustomPassword } from '@/utils/credentialStore';

// --- Mock Implementation ---

const SESSION_KEY = 'barak_session';
let memorySession = null;

function getSessionItem(key) {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(key);
  }
  return memorySession;
}

function setSessionItem(key, value) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(key, value);
  } else {
    memorySession = value;
  }
}

function removeSessionItem(key) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(key);
  } else {
    memorySession = null;
  }
}

const mockAuth = {
  async login({ username, password }) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 600));

    const cleanInput = String(username || '').toLowerCase().trim();
    if (!cleanInput) {
      return apiError('AUTH_INVALID', 'Username dan password wajib diisi.');
    }
    const inputPw = String(password || '').trim();

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

    // 3. Cek custom password yang tersimpan di authoritative credentialStore
    const customPw =
      getCustomPassword(targetUsername) ||
      getCustomPassword(cleanInput) ||
      (liveUser?.id ? getCustomPassword(liveUser.id) : null) ||
      (liveUser?.password ? liveUser.password.trim() : null);

    let user = null;

    if (mockUser) {
      // Verifikasi password (prioritaskan custom password jika sudah pernah diubah)
      const validPw = customPw
        ? inputPw === customPw
        : (inputPw === mockUser.password ||
           (targetUsername === 'direkturutama' && (inputPw === 'dev_direkturutama_2026' || inputPw === 'dev_direktur_2026')) ||
           inputPw === `dev_${mockUser.username}_2026` ||
           inputPw === 'admin123' ||
           inputPw === 'password');

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
      const validPw =
        (customPw && inputPw === customPw) ||
        inputPw === (liveUser.password ? liveUser.password.trim() : '') ||
        inputPw === `dev_${liveUser.username}_2026` ||
        inputPw === 'admin123' ||
        inputPw === 'password';

      if (validPw) {
        user = {
          ...liveUser,
          roleLabel: liveUser.roleLabel || ROLE_LABELS[liveUser.role] || liveUser.role,
          permissions: ROLE_PERMISSIONS[liveUser.role] || [],
        };
      }
    }

    if (!user) {
      return apiError('AUTH_INVALID', 'Username atau password salah.');
    }

    // Strip password before storing
    const { password: _pw, ...safeUser } = user;
    setSessionItem(SESSION_KEY, JSON.stringify(safeUser));

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
        const raw = getSessionItem(SESSION_KEY);
        if (raw) currentUser = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    if (currentUser?.isAttendanceOnly || currentUser?.username === 'user1' || currentUser?.username === 'user2') {
      const uId = currentUser.username || currentUser.id;
      attendanceAdapter.clearInputerHistory(uId);
    }

    removeSessionItem(SESSION_KEY);
    return apiSuccess(null);
  },

  async getMe() {
    const raw = getSessionItem(SESSION_KEY);
    if (!raw) return apiError('AUTH_UNAUTHENTICATED', 'Tidak ada sesi aktif.');
    try {
      return apiSuccess(JSON.parse(raw));
    } catch {
      return apiError('AUTH_CORRUPT_SESSION', 'Sesi tidak valid.');
    }
  },

  async changePassword({ currentPassword, newPassword }) {
    await new Promise((r) => setTimeout(r, 400));
    const raw = getSessionItem(SESSION_KEY);
    if (!raw) return apiError('AUTH_UNAUTHENTICATED', 'Tidak ada sesi aktif.');
    let currentUser;
    try {
      currentUser = JSON.parse(raw);
    } catch {
      return apiError('AUTH_CORRUPT_SESSION', 'Sesi tidak valid.');
    }

    const cleanCurrent = String(currentPassword || '').trim();
    const cleanNew = String(newPassword || '').trim();

    if (!cleanCurrent) {
      return apiError('AUTH_CURRENT_REQUIRED', 'Kata sandi saat ini wajib diisi.');
    }
    if (!cleanNew || cleanNew.length < 6) {
      return apiError('AUTH_PASSWORD_TOO_SHORT', 'Kata sandi baru minimal 6 karakter.');
    }

    const targetUsername = String(currentUser.username || '').toLowerCase().trim();
    const targetUserId = String(currentUser.id || '').toLowerCase().trim();

    const storedUserRes = await userAdapter.getUserById(targetUsername || targetUserId);
    const storedUser = storedUserRes?.data;
    const mockUser = MOCK_USERS.find(
      (u) => (u.username || '').toLowerCase().trim() === targetUsername
    );

    const savedPasswords = getStoredPasswords();
    const expectedPw =
      savedPasswords[targetUsername] ||
      savedPasswords[targetUserId] ||
      (storedUser?.password ? storedUser.password.trim() : null) ||
      mockUser?.password ||
      `dev_${currentUser.username}_2026`;

    const isValidCurrent =
      cleanCurrent === expectedPw ||
      cleanCurrent === 'admin123' ||
      cleanCurrent === 'password' ||
      (mockUser && cleanCurrent === mockUser.password);

    if (!isValidCurrent) {
      return apiError('AUTH_WRONG_PASSWORD', 'Kata sandi saat ini tidak cocok.');
    }

    // 1. Simpan ke authoritative credentialStore (localStorage + in-memory)
    saveStoredPassword(targetUsername, cleanNew);
    if (targetUserId) saveStoredPassword(targetUserId, cleanNew);
    if (storedUser?.id) saveStoredPassword(storedUser.id, cleanNew);

    // 2. Perbarui password di userAdapter store
    const updateTargetId = storedUser?.id || targetUsername;
    await userAdapter.updateUser(updateTargetId, { password: cleanNew });

    currentUser.hasCustomPassword = true;
    setSessionItem(SESSION_KEY, JSON.stringify(currentUser));

    await emitAudit({
      action: 'USER_PASSWORD_CHANGE',
      module: 'AUTH',
      entity: 'User',
      entityId: currentUser.id || currentUser.username,
      details: { username: currentUser.username },
    });

    return apiSuccess({ success: true, message: 'Kata sandi berhasil diperbarui.' });
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
  async changePassword(payload) {
    return restClient.patch('/auth/change-password', payload);
  },
};

// --- Export active adapter ---
const authAdapter = isMockMode() ? mockAuth : restAuth;
export default authAdapter;
