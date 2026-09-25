/**
 * User Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 6 & 19 / RBAC Management.
 */

import apiClient from '@/services/apiClient';
import { MOCK_SYSTEM_USERS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let usersStore = [...MOCK_SYSTEM_USERS];

export const userAdapter = {
  async getUsers({ search = '', role = '', status = '', page = 1, pageSize = 20 } = {}) {
    if (isMock) {
      let filtered = [...usersStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.department.toLowerCase().includes(q)
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
      const user = usersStore.find((u) => u.id === id);
      if (!user) return { data: null, error: { message: 'Pengguna tidak ditemukan.' } };
      return { data: { ...user }, error: null };
    }
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  async createUser(payload) {
    if (isMock) {
      const newId = `USR-${(usersStore.length + 1).toString().padStart(3, '0')}`;
      const newUser = {
        ...payload,
        id: newId,
        status: payload.status || STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
      };
      usersStore = [...usersStore, newUser];

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
      const idx = usersStore.findIndex((u) => u.id === id);
      if (idx === -1) return { data: null, error: { message: 'Pengguna tidak ditemukan.' } };

      const updated = { ...usersStore[idx], ...payload, updatedAt: new Date().toISOString() };
      usersStore[idx] = updated;

      await emitAudit({
        action: 'USER_EDIT',
        module: 'IT',
        entity: 'User',
        entityId: id,
        details: { changes: Object.keys(payload) },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/users/${id}`, payload);
    return data;
  },

  async toggleUserStatus(id) {
    if (isMock) {
      const idx = usersStore.findIndex((u) => u.id === id);
      if (idx === -1) return { data: null, error: { message: 'Pengguna tidak ditemukan.' } };

      const current = usersStore[idx];
      const newStatus = current.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
      const updated = { ...current, status: newStatus, updatedAt: new Date().toISOString() };
      usersStore[idx] = updated;

      await emitAudit({
        action: 'USER_STATUS_CHANGE',
        module: 'IT',
        entity: 'User',
        entityId: id,
        details: { oldStatus: current.status, newStatus },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/users/${id}/toggle-status`);
    return data;
  },
};

export default userAdapter;
