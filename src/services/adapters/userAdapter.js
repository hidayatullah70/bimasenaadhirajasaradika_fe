/**
 * User Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 6 & 19 / RBAC Management.
 */

import apiClient from '@/services/apiClient';
import { MOCK_SYSTEM_USERS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';
import { ROLES, ROLE_LABELS } from '@/constants/roles';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';
import { saveStoredPassword } from '@/utils/credentialStore';
import { getCustomAvatar, saveStoredAvatar } from '@/utils/avatarStore';

const DEFAULT_DEPARTMENTS = {
  [ROLES.DIREKTUR]: 'Direksi',
  [ROLES.HRD]: 'HRD & Personalia',
  [ROLES.LEGAL]: 'Legal & Kepatuhan',
  [ROLES.OPERASIONAL]: 'Operasional Lapangan',
  [ROLES.FINANCE]: 'Finance & Akuntansi',
  [ROLES.MARKETING]: 'Marketing & Business Development',
  [ROLES.IT_SUPPORT]: 'Teknologi Informasi',
  [ROLES.ADMIN_WEBSITE]: 'Media & Publikasi',
};

function normalizeUser(u) {
  if (!u) return u;
  const role = u.role || u.role_id || ROLES.OPERASIONAL;
  const name = u.name || u.full_name || u.fullName || u.username;
  return {
    ...u,
    id: u.id,
    name: name,
    fullName: name,
    full_name: name,
    role: role,
    role_id: role,
    department: u.department || DEFAULT_DEPARTMENTS[role] || 'Operasional Lapangan',
    subRole: u.subRole || (role === 'INPUTER_1' || role === 'INPUTER_2' ? 'ADMIN_HRD' : ''),
    roleLabel:
      u.roleLabel ||
      ROLE_LABELS[role] ||
      (role === 'INPUTER_1'
        ? 'Admin HRD (Inputer 1)'
        : role === 'INPUTER_2'
        ? 'Admin HRD (Inputer 2)'
        : role === 'PIC_CLIENT'
        ? 'PIC Klien / Korlap'
        : role),
    avatar: u.avatar || getCustomAvatar(u.username) || getCustomAvatar(u.id) || null,
  };
}

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
const STORAGE_KEY = 'barak_users';
const DELETED_KEY = 'barak_deleted_user_ids';

function getDeletedSet() {
  const list = getStoredCollection(DELETED_KEY, () => []);
  return new Set((Array.isArray(list) ? list : []).map((id) => String(id).toLowerCase().trim()));
}

function markAsDeleted(id, username) {
  const list = getStoredCollection(DELETED_KEY, () => []);
  const nextList = Array.from(
    new Set([
      ...(Array.isArray(list) ? list : []),
      String(id || '').toLowerCase().trim(),
      String(username || '').toLowerCase().trim(),
    ].filter(Boolean))
  );
  saveStoredCollection(DELETED_KEY, nextList);
}

function unmarkDeleted(id, username) {
  const list = getStoredCollection(DELETED_KEY, () => []);
  const idKey = String(id || '').toLowerCase().trim();
  const userKey = String(username || '').toLowerCase().trim();
  const nextList = (Array.isArray(list) ? list : []).filter((item) => {
    const k = String(item).toLowerCase().trim();
    return k !== idKey && k !== userKey;
  });
  saveStoredCollection(DELETED_KEY, nextList);
}

function getStore() {
  const store = getStoredCollection(STORAGE_KEY, () => [...MOCK_SYSTEM_USERS]);
  const deletedSet = getDeletedSet();

  // Self-healing & auto-sync: pastikan seluruh user default ada jika belum secara eksplisit dihapus/direname
  let hasMissing = false;
  MOCK_SYSTEM_USERS.forEach((defaultUser) => {
    const idKey = (defaultUser.id || '').toLowerCase().trim();
    const userKey = (defaultUser.username || '').toLowerCase().trim();

    // Jika user ini sudah dihapus atau username lamanya diganti, jangan hidupkan kembali
    if (deletedSet.has(idKey) || deletedSet.has(userKey)) {
      return;
    }

    const existingIndex = store.findIndex(
      (u) =>
        (u.id || '').toLowerCase().trim() === idKey ||
        (u.username || '').toLowerCase().trim() === userKey
    );
    if (existingIndex === -1) {
      store.push({ ...defaultUser });
      hasMissing = true;
    } else {
      // Sinkronkan id jika belum ada
      if (!store[existingIndex].id && defaultUser.id) {
        store[existingIndex].id = defaultUser.id;
        hasMissing = true;
      }
      // Migrasikan username lama (juli.priyanto, dll) ke username resmi jika belum dimodifikasi
      const legacyAliases = {
        'juli.priyanto': 'direkturutama',
        'zaenal.arifin': 'hrd',
        'robyn.topani': 'legal',
        'nazi.rinaldi.ops': 'operasional',
        'nazi.rinaldi.fin': 'finance',
        'hendri.nopamin': 'marketing',
        'gheril.ramaditya': 'itsupport',
      };
      const curUName = (store[existingIndex].username || '').toLowerCase().trim();
      if (legacyAliases[curUName] && legacyAliases[curUName] === defaultUser.username) {
        store[existingIndex].username = defaultUser.username;
        hasMissing = true;
      }
      // Sinkronkan atribut roleLabel & subRole jika belum ada
      if (defaultUser.roleLabel && !store[existingIndex].roleLabel) {
        store[existingIndex].roleLabel = defaultUser.roleLabel;
        hasMissing = true;
      }
      if (defaultUser.subRole && !store[existingIndex].subRole) {
        store[existingIndex].subRole = defaultUser.subRole;
        hasMissing = true;
      }
    }
  });

  if (hasMissing) {
    saveStore(store);
  }

  return store;
}

function saveStore(store) {
  saveStoredCollection(STORAGE_KEY, store);
}

export const userAdapter = {
  async getUsers({ search = '', role = '', status = '', page = 1, pageSize = 20 } = {}) {
    if (isMock) {
      let filtered = [...getStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.username && u.username.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.department && u.department.toLowerCase().includes(q)) ||
            (u.roleLabel && u.roleLabel.toLowerCase().includes(q)) ||
            (u.subRole && u.subRole.toLowerCase().includes(q))
        );
      }

      if (role) {
        filtered = filtered.filter((u) => u.role === role);
      }

      if (status) {
        filtered = filtered.filter((u) => u.status === status);
      }

      // Tampilkan akun baru (yang memiliki createdAt) di urutan paling atas (terbaru dahulu)
      filtered.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (a.createdAt && !b.createdAt) return -1;
        if (!a.createdAt && b.createdAt) return 1;
        return 0;
      });

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/users', {
      params: { search, role, status, page, pageSize },
    });
    if (data && Array.isArray(data.data)) {
      return {
        ...data,
        data: data.data.map(normalizeUser),
      };
    }
    return data;
  },

  async getUserById(id) {
    if (isMock) {
      const store = getStore();
      const matchId = String(id || '').toLowerCase().trim();
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
        'pic_jnt': 'pic',
      };
      const resolvedId = aliasMap[matchId] || matchId;
      const user = store.find(
        (u) =>
          (u.id && u.id.toLowerCase().trim() === matchId) ||
          (u.username && u.username.toLowerCase().trim() === matchId) ||
          (u.username && u.username.toLowerCase().trim() === resolvedId)
      );
      if (!user) return { data: null, error: { message: 'Pengguna tidak ditemukan.' } };
      const customAvatar = getCustomAvatar(user.username) || getCustomAvatar(user.id);
      return { data: { ...user, avatar: customAvatar || user.avatar || null }, error: null };
    }
    const { data } = await apiClient.get(`/users/${id}`);
    if (data && data.data) {
      return {
        ...data,
        data: normalizeUser(data.data),
      };
    }
    return data;
  },

  async createUser(payload) {
    if (isMock) {
      const store = getStore();
      const userKey = (payload.username || '').toLowerCase().trim();

      // Cek apakah username sudah dipakai
      const duplicate = store.find((u) => (u.username || '').toLowerCase().trim() === userKey);
      if (duplicate) {
        return { data: null, error: { message: `Username "${payload.username}" sudah digunakan.` } };
      }

      const maxNum = store.reduce((max, u) => {
        const match = (u.id || '').match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const newId = `USR-${(maxNum + 1).toString().padStart(3, '0')}`;
      const defaultPw = payload.password?.trim() || `dev_${payload.username.trim()}_2026`;
      const newUser = {
        ...payload,
        id: newId,
        username: payload.username.trim(),
        name: payload.name.trim(),
        email: payload.email.trim(),
        password: defaultPw,
        status: payload.status || STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
      };
      const updatedStore = [newUser, ...store];
      saveStore(updatedStore);
      unmarkDeleted(newId, newUser.username);
      saveStoredPassword(newUser.username, newUser.password);
      saveStoredPassword(newId, newUser.password);
      if (newUser.avatar) {
        saveStoredAvatar(newUser.username, newUser.avatar);
        saveStoredAvatar(newId, newUser.avatar);
      }

      await emitAudit({
        action: 'USER_CREATE',
        module: 'IT',
        entity: 'User',
        entityId: newId,
        details: { username: newUser.username, role: newUser.role },
      });

      return { data: newUser, error: null };
    }

    const payloadToSend = {
      ...payload,
      fullName: payload.name || payload.fullName || payload.full_name,
      role: payload.role || payload.role_id,
    };
    const { data } = await apiClient.post('/users', payloadToSend);
    if (data && data.data) {
      return {
        ...data,
        data: normalizeUser(data.data),
      };
    }
    return data;
  },

  async updateUser(id, payload) {
    if (isMock) {
      const store = getStore();
      const matchId = String(id || '').toLowerCase().trim();
      const idx = store.findIndex(
        (u) =>
          (u.id && u.id.toLowerCase().trim() === matchId) ||
          (u.username && u.username.toLowerCase().trim() === matchId)
      );
      if (idx === -1) return { data: null, error: { message: 'Pengguna tidak ditemukan.' } };

      const oldUser = store[idx];
      const newUsernameKey = (payload.username || '').toLowerCase().trim();

      // Cek apakah username baru sudah digunakan oleh akun lain
      if (newUsernameKey && newUsernameKey !== (oldUser.username || '').toLowerCase().trim()) {
        const duplicate = store.find(
          (u, i) => i !== idx && (u.username || '').toLowerCase().trim() === newUsernameKey
        );
        if (duplicate) {
          return {
            data: null,
            error: { message: `Username "${payload.username}" sudah digunakan oleh akun lain.` },
          };
        }
      }

      const finalId = oldUser.id || payload.id || id || `USR-${String(idx + 1).padStart(3, '0')}`;
      const updated = {
        ...oldUser,
        ...payload,
        id: finalId,
        username: payload.username ? payload.username.trim() : oldUser.username,
        name: payload.name ? payload.name.trim() : oldUser.name,
        email: payload.email ? payload.email.trim() : oldUser.email,
        password: payload.password?.trim() ? payload.password.trim() : (oldUser.password || `dev_${oldUser.username}_2026`),
        updatedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveStore(store);

      if (payload.password?.trim()) {
        saveStoredPassword(updated.username, updated.password);
        saveStoredPassword(finalId, updated.password);
      }

      if (payload.avatar !== undefined) {
        saveStoredAvatar(updated.username, payload.avatar);
        saveStoredAvatar(finalId, payload.avatar);
      }

      // Jika username login diubah, tandai username lama agar tidak di-resurrect oleh mock seed
      if (oldUser.username && oldUser.username.toLowerCase().trim() !== newUsernameKey) {
        markAsDeleted(null, oldUser.username);
      }
      unmarkDeleted(finalId, updated.username);

      await emitAudit({
        action: 'USER_EDIT',
        module: 'IT',
        entity: 'User',
        entityId: finalId,
        details: {
          changes: Object.keys(payload),
          oldUsername: oldUser.username,
          newUsername: updated.username,
        },
      });

      return { data: updated, error: null };
    }

    const payloadToSend = {
      ...payload,
      fullName: payload.name || payload.fullName || payload.full_name,
      role: payload.role || payload.role_id,
    };
    const { data } = await apiClient.patch(`/users/${id}`, payloadToSend);
    if (data && data.data) {
      return {
        ...data,
        data: normalizeUser(data.data),
      };
    }
    return data;
  },

  async toggleUserStatus(id) {
    if (isMock) {
      const store = getStore();
      const matchId = String(id || '').toLowerCase().trim();
      const idx = store.findIndex(
        (u) =>
          (u.id && u.id.toLowerCase().trim() === matchId) ||
          (u.username && u.username.toLowerCase().trim() === matchId)
      );
      if (idx === -1) return { data: null, error: { message: 'Pengguna tidak ditemukan.' } };

      const current = store[idx];
      const newStatus = current.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
      const updated = { ...current, status: newStatus, updatedAt: new Date().toISOString() };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'USER_STATUS_CHANGE',
        module: 'IT',
        entity: 'User',
        entityId: current.id,
        details: { oldStatus: current.status, newStatus },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/users/${id}/toggle-status`);
    return data;
  },

  async deleteUser(id) {
    if (isMock) {
      const store = getStore();
      const matchId = String(id || '').toLowerCase().trim();
      const idx = store.findIndex(
        (u) =>
          (u.id && u.id.toLowerCase().trim() === matchId) ||
          (u.username && u.username.toLowerCase().trim() === matchId)
      );
      if (idx === -1) return { data: null, error: { message: 'Pengguna tidak ditemukan.' } };

      const removed = store[idx];
      const updatedStore = store.filter(
        (u) =>
          (u.id && u.id.toLowerCase().trim() !== matchId) &&
          (u.username && u.username.toLowerCase().trim() !== matchId)
      );
      saveStore(updatedStore);

      // Tandai ID / username sebagai terhapus agar self-healing tidak memunculkan kembali
      markAsDeleted(removed.id, removed.username);

      await emitAudit({
        action: 'USER_DELETE',
        module: 'IT',
        entity: 'User',
        entityId: removed.id || id,
        details: { username: removed.username },
      });

      return { data: { success: true, removed }, error: null };
    }

    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  },
};

export default userAdapter;

