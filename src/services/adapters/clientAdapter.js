/**
 * Client Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 9 / API-SPEC Section 3.
 */

import apiClient from '@/services/apiClient';
import { MOCK_CLIENTS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
const STORAGE_KEY = 'barak_clients';

function getStore() {
  return getStoredCollection(STORAGE_KEY, () => [...MOCK_CLIENTS]);
}

function saveStore(store) {
  saveStoredCollection(STORAGE_KEY, store);
}

export const clientAdapter = {
  async getClients({ search = '', type = '', status = '', page = 1, pageSize = 20 } = {}) {
    if (isMock) {
      let filtered = [...getStore()];

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
      const store = getStore();
      const client = store.find((c) => c.id === id);
      if (!client) return { data: null, error: { message: 'Klien tidak ditemukan.' } };
      return { data: { ...client }, error: null };
    }

    const { data } = await apiClient.get(`/clients/${id}`);
    return data;
  },

  async createClient(payload) {
    if (isMock) {
      const store = getStore();
      const newId = `CLI-${(store.length + 1).toString().padStart(6, '0')}`;
      const newClient = {
        ...payload,
        id: newId,
        code: newId,
        activeHeadcount: payload.activeHeadcount || 0,
        monthlyBillingValue: payload.monthlyBillingValue || 0,
        createdAt: new Date().toISOString(),
      };
      const updatedStore = [newClient, ...store];
      saveStore(updatedStore);

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
      const store = getStore();
      const idx = store.findIndex((c) => c.id === id);
      if (idx === -1) return { data: null, error: { message: 'Klien tidak ditemukan.' } };

      const updated = { ...store[idx], ...payload, updatedAt: new Date().toISOString() };
      store[idx] = updated;
      saveStore(store);

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
