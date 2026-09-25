/**
 * Incident Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 13 (Incidents), Section 18 (Cross-department workflow: Incident Escalation).
 */

import apiClient from '@/services/apiClient';
import { MOCK_INCIDENTS } from '@/services/mock/mockOperationsData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let incidentsStore = [...MOCK_INCIDENTS];

export const incidentAdapter = {
  async getIncidents({ search = '', type = '', severity = '', status = '', clientId = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...incidentsStore];

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
      const inc = incidentsStore.find((i) => i.id === id);
      if (!inc) return { data: null, error: { message: 'Insiden tidak ditemukan.' } };
      return { data: { ...inc }, error: null };
    }
    const { data } = await apiClient.get(`/incidents/${id}`);
    return data;
  },

  async createIncident(payload) {
    if (isMock) {
      const newId = `INC-2026-09-${(incidentsStore.length + 1).toString().padStart(3, '0')}`;
      const newIncident = {
        ...payload,
        id: newId,
        incidentNumber: `INC/BARAK/2026/09/${(incidentsStore.length + 1).toString().padStart(3, '0')}`,
        status: STATUS.OPEN,
        createdAt: new Date().toISOString(),
      };
      incidentsStore = [newIncident, ...incidentsStore];

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

  async resolveIncident(id, { resolutionNotes, actorName = 'Tim Operasional' }) {
    if (isMock) {
      const idx = incidentsStore.findIndex((i) => i.id === id);
      if (idx === -1) return { data: null, error: { message: 'Insiden tidak ditemukan.' } };

      const updated = {
        ...incidentsStore[idx],
        status: STATUS.RESOLVED,
        resolutionNotes,
        resolvedAt: new Date().toISOString(),
        resolvedBy: actorName,
      };
      incidentsStore[idx] = updated;

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

  async escalateIncident(id, { targetDept, reason, actorName = 'Operasional' }) {
    if (isMock) {
      const idx = incidentsStore.findIndex((i) => i.id === id);
      if (idx === -1) return { data: null, error: { message: 'Insiden tidak ditemukan.' } };

      const updated = {
        ...incidentsStore[idx],
        status: STATUS.ESCALATED,
        escalatedTo: targetDept,
        escalatedReason: reason,
        escalatedAt: new Date().toISOString(),
        escalatedBy: actorName,
      };
      incidentsStore[idx] = updated;

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
};

export default incidentAdapter;
