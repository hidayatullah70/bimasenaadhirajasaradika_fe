/**
 * Location & Project Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 20 / API-SPEC Section 3 & 8.
 */

import apiClient from '@/services/apiClient';
import { MOCK_LOCATIONS, MOCK_PROJECTS } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
const LOCATIONS_STORAGE_KEY = 'barak_locations';
const PROJECTS_STORAGE_KEY = 'barak_projects';

function getLocationsStore() {
  return getStoredCollection(LOCATIONS_STORAGE_KEY, () => [...MOCK_LOCATIONS]);
}

function saveLocationsStore(store) {
  saveStoredCollection(LOCATIONS_STORAGE_KEY, store);
}

function getProjectsStore() {
  return getStoredCollection(PROJECTS_STORAGE_KEY, () => [...MOCK_PROJECTS]);
}

export const locationAdapter = {
  async getLocations({ search = '', clientId = '', projectId = '', city = '', page = 1, pageSize = 20 } = {}) {
    if (isMock) {
      let filtered = [...getLocationsStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (loc) =>
            (loc.name && loc.name.toLowerCase().includes(q)) ||
            (loc.code && loc.code.toLowerCase().includes(q)) ||
            (loc.city && loc.city.toLowerCase().includes(q)) ||
            (loc.contactPerson && loc.contactPerson.toLowerCase().includes(q))
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
      const store = getLocationsStore();
      const loc = store.find((l) => l.id === id);
      if (!loc) return { data: null, error: { message: 'Lokasi tidak ditemukan.' } };
      return { data: { ...loc }, error: null };
    }

    const { data } = await apiClient.get(`/locations/${id}`);
    return data;
  },

  async getProjects() {
    if (isMock) {
      return { data: [...getProjectsStore()], error: null };
    }
    const { data } = await apiClient.get('/projects');
    return data;
  },

  async createLocation(payload) {
    if (isMock) {
      const store = getLocationsStore();
      const maxNum = store.reduce((max, l) => {
        const match = (l.id || l.code || '').match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const newId = `LOC-${(maxNum + 1).toString().padStart(3, '0')}`;
      const newLoc = {
        ...payload,
        id: newId,
        code: payload.code || newId,
        activeManpower: payload.activeManpower || 0,
        createdAt: new Date().toISOString(),
      };
      const updatedStore = [newLoc, ...store];
      saveLocationsStore(updatedStore);

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
      const store = getLocationsStore();
      const idx = store.findIndex((l) => l.id === id || l.code === id);
      if (idx === -1) return { data: null, error: { message: 'Lokasi tidak ditemukan.' } };

      const oldLoc = store[idx];
      const updated = {
        ...oldLoc,
        ...payload,
        id: oldLoc.id,
        code: oldLoc.code || oldLoc.id,
        updatedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveLocationsStore(store);

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

  async deleteLocation(id) {
    if (isMock) {
      const store = getLocationsStore();
      const idx = store.findIndex((l) => l.id === id || l.code === id);
      if (idx === -1) return { data: null, error: { message: 'Lokasi tidak ditemukan.' } };

      const removed = store[idx];
      const updatedStore = store.filter((l) => l.id !== id && l.code !== id);
      saveLocationsStore(updatedStore);

      await emitAudit({
        action: 'LOCATION_DELETE',
        module: 'Master',
        entity: 'Location',
        entityId: id,
        details: { name: removed.name },
      });

      return { data: { success: true }, error: null };
    }

    const { data } = await apiClient.delete(`/locations/${id}`);
    return data;
  },
};

export default locationAdapter;
