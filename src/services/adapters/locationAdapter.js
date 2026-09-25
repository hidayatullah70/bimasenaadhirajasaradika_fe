/**
 * Location & Project Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 20 / API-SPEC Section 3 & 8.
 */

import apiClient from '@/services/apiClient';
import { MOCK_LOCATIONS, MOCK_PROJECTS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let locationsStore = [...MOCK_LOCATIONS];
let projectsStore = [...MOCK_PROJECTS];

export const locationAdapter = {
  async getLocations({ search = '', clientId = '', projectId = '', city = '', page = 1, pageSize = 20 } = {}) {
    if (isMock) {
      let filtered = [...locationsStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (loc) =>
            loc.name.toLowerCase().includes(q) ||
            loc.code.toLowerCase().includes(q) ||
            loc.city.toLowerCase().includes(q) ||
            loc.contactPerson.toLowerCase().includes(q)
        );
      }

      if (clientId) {
        filtered = filtered.filter((loc) => loc.clientId === clientId);
      }

      if (projectId) {
        filtered = filtered.filter((loc) => loc.projectId === projectId);
      }

      if (city) {
        filtered = filtered.filter((loc) => loc.city === city);
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

    const { data } = await apiClient.get('/locations', {
      params: { search, clientId, projectId, city, page, pageSize },
    });
    return data;
  },

  async getLocationById(id) {
    if (isMock) {
      const loc = locationsStore.find((l) => l.id === id);
      if (!loc) return { data: null, error: { message: 'Lokasi tidak ditemukan.' } };
      return { data: { ...loc }, error: null };
    }

    const { data } = await apiClient.get(`/locations/${id}`);
    return data;
  },

  async getProjects() {
    if (isMock) {
      return { data: [...projectsStore], error: null };
    }
    const { data } = await apiClient.get('/projects');
    return data;
  },

  async createLocation(payload) {
    if (isMock) {
      const newId = `LOC-${(locationsStore.length + 1).toString().padStart(3, '0')}`;
      const newLoc = {
        ...payload,
        id: newId,
        activeManpower: payload.activeManpower || 0,
        createdAt: new Date().toISOString(),
      };
      locationsStore = [newLoc, ...locationsStore];

      await emitAudit({
        action: 'LOCATION_CREATE',
        module: 'Master',
        entity: 'Location',
        entityId: newId,
        details: { name: newLoc.name, client: newLoc.clientId },
      });

      return { data: newLoc, error: null };
    }

    const { data } = await apiClient.post('/locations', payload);
    return data;
  },

  async updateLocation(id, payload) {
    if (isMock) {
      const idx = locationsStore.findIndex((l) => l.id === id);
      if (idx === -1) return { data: null, error: { message: 'Lokasi tidak ditemukan.' } };

      const updated = { ...locationsStore[idx], ...payload, updatedAt: new Date().toISOString() };
      locationsStore[idx] = updated;

      await emitAudit({
        action: 'LOCATION_EDIT',
        module: 'Master',
        entity: 'Location',
        entityId: id,
        details: { changes: Object.keys(payload) },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/locations/${id}`, payload);
    return data;
  },
};

export default locationAdapter;
