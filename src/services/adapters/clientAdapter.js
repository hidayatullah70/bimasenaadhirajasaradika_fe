/**
 * Client Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 9 / API-SPEC Section 3.
 */

import apiClient from '@/services/apiClient';
import { MOCK_CLIENTS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let clientsStore = [...MOCK_CLIENTS];

export const clientAdapter = {
  async getClients({ search = '', type = '', status = '', page = 1, pageSize = 20 } = {}) {
    if (isMock) {
      let filtered = [...clientsStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            c.picName.toLowerCase().includes(q)
        );
      }

      if (type) {
        filtered = filtered.filter((c) => c.type === type);
      }

      if (status) {
        filtered = filtered.filter((c) => c.status === status);
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

    const { data } = await apiClient.get('/clients', {
      params: { search, type, status, page, pageSize },
    });
    return data;
  },

  async getClientById(id) {
    if (isMock) {
      const client = clientsStore.find((c) => c.id === id);
      if (!client) return { data: null, error: { message: 'Klien tidak ditemukan.' } };
      return { data: { ...client }, error: null };
    }

    const { data } = await apiClient.get(`/clients/${id}`);
    return data;
  },

  async createClient(payload) {
    if (isMock) {
      const newId = `CLI-${(clientsStore.length + 1).toString().padStart(6, '0')}`;
      const newClient = {
        ...payload,
        id: newId,
        code: newId,
        activeHeadcount: payload.activeHeadcount || 0,
        monthlyBillingValue: payload.monthlyBillingValue || 0,
        createdAt: new Date().toISOString(),
      };
      clientsStore = [newClient, ...clientsStore];

      await emitAudit({
        action: 'CLIENT_CREATE',
        module: 'Master',
        entity: 'Client',
        entityId: newId,
        details: { name: newClient.name, type: newClient.type },
      });

      return { data: newClient, error: null };
    }

    const { data } = await apiClient.post('/clients', payload);
    return data;
  },

  async updateClient(id, payload) {
    if (isMock) {
      const idx = clientsStore.findIndex((c) => c.id === id);
      if (idx === -1) return { data: null, error: { message: 'Klien tidak ditemukan.' } };

      const updated = { ...clientsStore[idx], ...payload, updatedAt: new Date().toISOString() };
      clientsStore[idx] = updated;

      await emitAudit({
        action: 'CLIENT_EDIT',
        module: 'Master',
        entity: 'Client',
        entityId: id,
        details: { changes: Object.keys(payload) },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/clients/${id}`, payload);
    return data;
  },
};

export default clientAdapter;
