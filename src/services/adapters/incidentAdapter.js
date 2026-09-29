/**
 * Incident Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Incidents), Section 18 (Cross-department workflow: Incident Escalation).
 */

import apiClient from '@/services/apiClient';
import { MOCK_INCIDENTS } from '@/services/mock/mockOperationsData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
const STORAGE_KEY = 'barak_incidents';

function getStore() {
  return getStoredCollection(STORAGE_KEY, () => [...MOCK_INCIDENTS]);
}

function saveStore(store) {
  saveStoredCollection(STORAGE_KEY, store);
}

export const incidentAdapter = {
  async getIncidents({ search = '', type = '', severity = '', status = '', clientId = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...getStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.incidentNumber.toLowerCase().includes(q) ||
            i.clientName.toLowerCase().includes(q) ||
            i.locationName.toLowerCase().includes(q) ||
            i.reportedBy.toLowerCase().includes(q)
        );
      }

      if (type) filtered = filtered.filter((i) => i.type === type);
      if (severity) filtered = filtered.filter((i) => i.severity === severity);
      if (status) filtered = filtered.filter((i) => i.status === status);
      if (clientId) filtered = filtered.filter((i) => i.clientId === clientId);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/incidents', {
      params: { search, type, severity, status, clientId, page, pageSize },
    });
    return data;
  },

  async getIncidentById(id) {
    if (isMock) {
      const store = getStore();
      const inc = store.find((i) => i.id === id);
      if (!inc) return { data: null, error: { message: 'Insiden tidak ditemukan.' } };
      return { data: { ...inc }, error: null };
    }
    const { data } = await apiClient.get(`/incidents/${id}`);
    return data;
  },

  async createIncident(payload) {
    if (isMock) {
      const store = getStore();
      const maxNum = store.reduce((max, i) => {
        const match = (i.id || i.incidentNumber || '').match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const newNum = (maxNum + 1).toString().padStart(3, '0');
      const newId = `INC-2026-09-${newNum}`;
      const newIncident = {
        ...payload,
        id: newId,
        incidentNumber: `INC/BARAK/2026/09/${newNum}`,
        status: STATUS.OPEN,
        createdAt: new Date().toISOString(),
      };
      const updatedStore = [newIncident, ...store];
      saveStore(updatedStore);

      await emitAudit({
        action: 'INCIDENT_CREATE',
        module: 'Operations',
        entity: 'Incident',
        entityId: newId,
        details: { title: newIncident.title, client: newIncident.clientName, severity: newIncident.severity },
      });

      return { data: newIncident, error: null };
    }

    const { data } = await apiClient.post('/incidents', payload);
    return data;
  },

  async updateIncident(id, payload) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((i) => i.id === id || i.incidentNumber === id);
      if (idx === -1) return { data: null, error: { message: 'Insiden tidak ditemukan.' } };

      const oldInc = store[idx];
      const updated = {
        ...oldInc,
        ...payload,
        id: oldInc.id,
        incidentNumber: oldInc.incidentNumber || oldInc.id,
        updatedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'INCIDENT_EDIT',
        module: 'Operations',
        entity: 'Incident',
        entityId: id,
        details: { changes: Object.keys(payload) },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/incidents/${id}`, payload);
    return data;
  },

  async resolveIncident(id, { resolutionNotes, actorName = 'Tim Operasional' }) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((i) => i.id === id || i.incidentNumber === id);
      if (idx === -1) return { data: null, error: { message: 'Insiden tidak ditemukan.' } };

      const updated = {
        ...store[idx],
        status: STATUS.RESOLVED,
        resolutionNotes,
        resolvedAt: new Date().toISOString(),
        resolvedBy: actorName,
      };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'INCIDENT_RESOLVE',
        module: 'Operations',
        entity: 'Incident',
        entityId: id,
        details: { resolutionNotes, resolvedBy: actorName },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/incidents/${id}/resolve`, { resolutionNotes });
    return data;
  },

  async updateIncidentStatus(id, status, notes = '') {
    if (status === STATUS.RESOLVED || status === 'RESOLVED') {
      return this.resolveIncident(id, { resolutionNotes: notes || 'Insiden diselesaikan' });
    }
    return this.updateIncident(id, { status, resolutionNotes: notes });
  },

  async escalateIncident(id, { targetDept, reason, actorName = 'Operasional' }) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((i) => i.id === id || i.incidentNumber === id);
      if (idx === -1) return { data: null, error: { message: 'Insiden tidak ditemukan.' } };

      const updated = {
        ...store[idx],
        status: STATUS.ESCALATED,
        escalatedTo: targetDept,
        escalatedReason: reason,
        escalatedAt: new Date().toISOString(),
        escalatedBy: actorName,
      };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'INCIDENT_ESCALATE',
        module: 'Operations',
        entity: 'Incident',
        entityId: id,
        details: { targetDept, reason, escalatedBy: actorName },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/incidents/${id}/escalate`, { targetDept, reason });
    return data;
  },

  async deleteIncident(id) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((i) => i.id === id || i.incidentNumber === id);
      if (idx === -1) return { data: null, error: { message: 'Insiden tidak ditemukan.' } };

      const removed = store[idx];
      const updatedStore = store.filter((i) => i.id !== id && i.incidentNumber !== id);
      saveStore(updatedStore);

      await emitAudit({
        action: 'INCIDENT_DELETE',
        module: 'Operations',
        entity: 'Incident',
        entityId: id,
        details: { title: removed.title },
      });

      return { data: { success: true }, error: null };
    }

    const { data } = await apiClient.delete(`/incidents/${id}`);
    return data;
  },
};

export default incidentAdapter;
