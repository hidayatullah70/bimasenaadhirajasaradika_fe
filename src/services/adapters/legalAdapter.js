/**
 * Legal Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 12 (Legal Module), Section 12.5 (COD Case), Section 22 (Audit Log).
 */

import apiClient from '@/services/apiClient';
import {
  MOCK_LEGAL_CASES,
  MOCK_LEGAL_CONTRACTS,
  MOCK_COMPLIANCE_ITEMS,
} from '@/services/mock/mockLegalData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';

import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';

function getCasesStore() {
  return getStoredCollection('legal_cases', () => [...MOCK_LEGAL_CASES]);
}

function saveCasesStore(cases) {
  saveStoredCollection('legal_cases', cases);
}

function getContractsStore() {
  return getStoredCollection('legal_contracts', () => [...MOCK_LEGAL_CONTRACTS]);
}

function getComplianceStore() {
  return getStoredCollection('legal_compliance', () => [...MOCK_COMPLIANCE_ITEMS]);
}

export const legalAdapter = {
  async getLegalCases({ search = '', caseType = '', priority = '', status = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...getCasesStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.caseNumber.toLowerCase().includes(q) ||
            c.subject.toLowerCase().includes(q) ||
            c.targetEntity.toLowerCase().includes(q) ||
            c.clientName.toLowerCase().includes(q) ||
            c.assignedLegal.toLowerCase().includes(q)
        );
      }

      if (caseType) filtered = filtered.filter((c) => c.caseType === caseType);
      if (priority) filtered = filtered.filter((c) => c.priority === priority);
      if (status) filtered = filtered.filter((c) => c.status === status);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/legal/cases', {
      params: { search, caseType, priority, status, page, pageSize },
    });
    return data;
  },

  async getLegalCaseById(id) {
    if (isMock) {
      const casesStore = getCasesStore();
      const c = casesStore.find((item) => item.id === id);
      if (!c) return { data: null, error: { message: 'Kasus legal tidak ditemukan.' } };
      return { data: { ...c }, error: null };
    }
    const { data } = await apiClient.get(`/legal/cases/${id}`);
    return data;
  },

  async createLegalCase(payload) {
    if (isMock) {
      const casesStore = getCasesStore();
      const nextNum = (casesStore.length + 1).toString().padStart(3, '0');
      const newCase = {
        ...payload,
        id: `CASE-2026-${nextNum.padStart(6, '0')}`,
        caseNumber: `CASE/BRK/2026/09/${nextNum}`,
        status: STATUS.OPEN,
        actions: [],
        createdAt: new Date().toISOString(),
      };
      saveCasesStore([newCase, ...casesStore]);

      await emitAudit({
        action: 'LEGAL_CASE_CREATE',
        module: 'Legal',
        entity: 'LegalCase',
        entityId: newCase.id,
        details: {
          caseNumber: newCase.caseNumber,
          subject: newCase.subject,
          priority: newCase.priority,
          client: newCase.clientName,
        },
      });

      return { data: newCase, error: null };
    }

    const { data } = await apiClient.post('/legal/cases', payload);
    return data;
  },

  async addLegalAction(caseId, { actionType, title, description, recordedBy = 'Farhan Maulana (Legal)' }) {
    if (isMock) {
      const casesStore = getCasesStore();
      const idx = casesStore.findIndex((c) => c.id === caseId);
      if (idx === -1) return { data: null, error: { message: 'Kasus tidak ditemukan.' } };

      const newAction = {
        id: `ACT-${(casesStore[idx].actions.length + 1).toString().padStart(3, '0')}`,
        actionDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
        actionType,
        title,
        description,
        recordedBy,
      };

      const updated = {
        ...casesStore[idx],
        status: STATUS.ACTION_TAKEN,
        actions: [newAction, ...casesStore[idx].actions],
      };
      casesStore[idx] = updated;
      saveCasesStore(casesStore);

      await emitAudit({
        action: 'LEGAL_ACTION_RECORD',
        module: 'Legal',
        entity: 'LegalCase',
        entityId: caseId,
        details: {
          actionType,
          title,
          recordedBy,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/legal/cases/${caseId}/actions`, {
      actionType,
      title,
      description,
    });
    return data;
  },

  async closeLegalCase(caseId, { resolutionNotes, actorName = 'Farhan Maulana (Legal)' }) {
    if (isMock) {
      const casesStore = getCasesStore();
      const idx = casesStore.findIndex((c) => c.id === caseId);
      if (idx === -1) return { data: null, error: { message: 'Kasus tidak ditemukan.' } };

      const updated = {
        ...casesStore[idx],
        status: STATUS.CLOSED,
        resolutionNotes,
        closedAt: new Date().toISOString(),
        closedBy: actorName,
      };
      casesStore[idx] = updated;
      saveCasesStore(casesStore);

      await emitAudit({
        action: 'LEGAL_CASE_CLOSE',
        module: 'Legal',
        entity: 'LegalCase',
        entityId: caseId,
        details: {
          resolutionNotes,
          closedBy: actorName,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/legal/cases/${caseId}/close`, { resolutionNotes });
    return data;
  },

  async getContracts({ search = '', status = '', clientId = '' } = {}) {
    if (isMock) {
      let filtered = [...getContractsStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.contractNumber.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q) ||
            c.clientName.toLowerCase().includes(q)
        );
      }

      if (status) filtered = filtered.filter((c) => c.status === status);
      if (clientId) filtered = filtered.filter((c) => c.clientId === clientId);

      return { data: filtered, error: null };
    }

    const { data } = await apiClient.get('/legal/contracts', { params: { search, status, clientId } });
    return data;
  },

  async createContract(payload) {
    if (isMock) {
      const contractsStore = getContractsStore();
      const nextNum = (contractsStore.length + 1).toString().padStart(3, '0');
      const newContract = {
        ...payload,
        id: `CTR-2026-${nextNum}`,
        contractNumber: `CTR/BRK/2026/09/${nextNum}`,
        status: payload.status || 'LEGAL_REVIEW',
        createdAt: new Date().toISOString(),
      };
      saveStoredCollection('legal_contracts', [newContract, ...contractsStore]);

      await emitAudit({
        action: 'CONTRACT_CREATE',
        module: 'Legal',
        entity: 'Contract',
        entityId: newContract.id,
        details: {
          contractNumber: newContract.contractNumber,
          client: newContract.clientName,
          status: newContract.status,
        },
      });

      return { data: newContract, error: null };
    }

    const { data } = await apiClient.post('/legal/contracts', payload);
    return data;
  },

  async updateContractStatus(contractId, newStatus, { notes = '', actorName = 'Farhan Maulana (Legal)' } = {}) {
    if (isMock) {
      const contractsStore = getContractsStore();
      const idx = contractsStore.findIndex((c) => c.id === contractId);
      if (idx === -1) return { data: null, error: { message: 'Kontrak tidak ditemukan.' } };

      const oldStatus = contractsStore[idx].status;
      const updated = {
        ...contractsStore[idx],
        status: newStatus,
        lastStatusUpdate: new Date().toISOString(),
        statusUpdateNotes: notes,
        updatedBy: actorName,
      };

      contractsStore[idx] = updated;
      saveStoredCollection('legal_contracts', contractsStore);

      await emitAudit({
        action: 'CONTRACT_STATUS_CHANGE',
        module: 'Legal',
        entity: 'Contract',
        entityId: contractId,
        details: {
          oldStatus,
          newStatus,
          notes,
          actor: actorName,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/legal/contracts/${contractId}/status`, { status: newStatus, notes });
    return data;
  },

  async getComplianceRegister() {
    if (isMock) {
      return { data: [...getComplianceStore()], error: null };
    }
    const { data } = await apiClient.get('/legal/compliance');
    return data;
  },
};

export default legalAdapter;

