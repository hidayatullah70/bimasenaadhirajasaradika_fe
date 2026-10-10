/**
 * User Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 6 & 19 / RBAC Management.
 */

import apiClient from '@/services/apiClient';
import { MOCK_SYSTEM_USERS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

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

function getStore() {
  const store = getStoredCollection(STORAGE_KEY, () => [...MOCK_SYSTEM_USERS]);
  const deletedSet = getDeletedSet();

  // Self-healing & auto-sync: pastikan seluruh user default ada jika belum secara eksplisit dihapus
  let hasMissing = false;
  MOCK_SYSTEM_USERS.forEach((defaultUser) => {
    const idKey = (defaultUser.id || '').toLowerCase().trim();
    const userKey = (defaultUser.username || '').toLowerCase().trim();

    // Jika user ini sudah dihapus oleh pengguna, jangan hidupkan kembali
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
    return data;
  },

  async getUserById(id) {
    if (isMock) {
      const store = getStore();
      const matchId = String(id || '').toLowerCase().trim();
      const user = store.find(
        (u) =>
          (u.id && u.id.toLowerCase().trim() === matchId) ||
          (u.username && u.username.toLowerCase().trim() === matchId)
      );
      if (!user) return { data: null, error: { message: 'Pengguna tidak ditemukan.' } };
      return { data: { ...user }, error: null };
    }
    const { data } = await apiClient.get(`/users/${id}`);
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
      const newUser = {
        ...payload,
        id: newId,
        username: payload.username.trim(),
        name: payload.name.trim(),
        email: payload.email.trim(),
        status: payload.status || STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
      };
      const updatedStore = [...store, newUser];
      saveStore(updatedStore);

      await emitAudit({
        action: 'USER_CREATE',
        module: 'IT',
        entity: 'User',
        entityId: newId,
        details: { username: newUser.username, role: newUser.role },
      });

      return { data: newUser, error: null };
    }

    const { data } = await apiClient.post('/users', payload);
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
      const updated = {
        ...oldUser,
        ...payload,
        id: oldUser.id,
        updatedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'USER_EDIT',
        module: 'IT',
        entity: 'User',
        entityId: oldUser.id,
        details: { changes: Object.keys(payload) },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/users/${id}`, payload);
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

