/**
 * Contract & Document Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1 & Section 12.1 (Employee Contracts & Expiry Alerts).
 *
 * Provides comprehensive CRUD for Employee Contracts & Compliance Documents:
 * - Create: Draft/publish new employment contract (PKWT/PKWTT/Probation/etc.) with verification documents.
 * - Read: List with search/filter, detail by ID.
 * - Update: Edit contract terms, renewal dates, and checklist document status.
 * - Delete: Maker-Checker approval workflow (HRD request delete -> Direktur Utama approval).
 */

import apiClient from '@/services/apiClient';
import { MOCK_EMPLOYEES } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';

function defaultContractsFactory() {
  return MOCK_EMPLOYEES.map((emp, idx) => {
    const isExpiring = idx === 38;
    const isProbation = idx === 39;
    const isPermanent = idx < 30;

    return {
      id: `CTR-${(idx + 1).toString().padStart(4, '0')}`,
      contractNumber: `PKWT/BARAK/2024/${(idx + 1).toString().padStart(3, '0')}`,
      employeeId: emp.id,
      employeeName: emp.nama_lengkap_sesuai_KTP,
      employeeNik: emp.NIK,
      department: emp.departemen,
      position: emp.jabatan,
      clientName: emp.clientName,
      contractType: isPermanent ? 'PKWTT' : isProbation ? 'PROBATION' : 'PKWT',
      startDate: emp.tanggal_masuk,
      endDate: isPermanent ? '2030-12-31' : isExpiring ? '2026-10-15' : '2026-12-31',
      status: isExpiring ? 'EXPIRING_SOON' : 'ACTIVE',
      daysRemaining: isExpiring ? 22 : isPermanent ? 1500 : 98,
      documentCompleteness: emp.kelengkapan_dokumen?.percentage || 100,
      documents: [
        { type: 'KTP', status: 'VERIFIED', uploadedAt: '2024-01-05' },
        { type: 'Kartu Keluarga', status: 'VERIFIED', uploadedAt: '2024-01-05' },
        { type: 'SKCK', status: isExpiring ? 'RENEWAL_NEEDED' : 'VERIFIED', uploadedAt: '2024-01-05' },
        { type: 'Ijazah Terakhir', status: 'VERIFIED', uploadedAt: '2024-01-05' },
        { type: 'Sertifikat Keahlian', status: 'VERIFIED', uploadedAt: '2024-01-05' },
      ],
      isDeleted: false,
      pendingDelete: false,
    };
  });
}

function getContractsStore() {
  return getStoredCollection('contracts', defaultContractsFactory);
}

function saveContractsStore(contracts) {
  saveStoredCollection('contracts', contracts);
}

function calculateDaysRemaining(endDate) {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function calculateCompleteness(documents = []) {
  if (!documents || documents.length === 0) return 100;
  const verifiedCount = documents.filter((d) => d.status === 'VERIFIED').length;
  return Math.round((verifiedCount / documents.length) * 100);
}

export const contractAdapter = {
  /**
   * Get list of contracts with search & filter
   */
  async getContracts({ search = '', type = '', status = '', page = 1, pageSize = 15, includeDeleted = false } = {}) {
    if (isMock) {
      let filtered = [...getContractsStore()].filter((c) => includeDeleted || !c.isDeleted);

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            (c.employeeName && c.employeeName.toLowerCase().includes(q)) ||
            (c.contractNumber && c.contractNumber.toLowerCase().includes(q)) ||
            (c.employeeNik && c.employeeNik.includes(q)) ||
            (c.employeeId && c.employeeId.toLowerCase().includes(q)) ||
            (c.clientName && c.clientName.toLowerCase().includes(q)) ||
            (c.position && c.position.toLowerCase().includes(q))
        );
      }

      if (type) filtered = filtered.filter((c) => c.contractType === type);

      if (status) {
        if (status === 'PENDING_DELETE') {
          filtered = filtered.filter((c) => c.pendingDelete);
        } else if (status === 'EXPIRING_SOON') {
          filtered = filtered.filter((c) => c.status === 'EXPIRING_SOON' || (c.contractType !== 'PKWTT' && c.daysRemaining > 0 && c.daysRemaining <= 30));
        } else {
          filtered = filtered.filter((c) => c.status === status);
        }
      }

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/contracts', {
      params: { search, type, status, page, pageSize, includeDeleted },
    });
    return data;
  },

  /**
   * Get single contract by ID
   */
  async getContractById(contractId) {
    if (isMock) {
      const contracts = getContractsStore();
      const found = contracts.find((c) => c.id === contractId);
      if (!found) return { data: null, error: { message: 'Kontrak tidak ditemukan.' } };
      return { data: found, error: null };
    }

    const { data } = await apiClient.get(`/contracts/${contractId}`);
    return data;
  },

  /**
   * Create new contract & compliance document set
   */
  async createContract(payload, actorName = 'Siti Rahmawati (HRD)') {
    if (isMock) {
      const contracts = getContractsStore();
      const nextSeq = (contracts.length + 1).toString().padStart(3, '0');
      const year = new Date().getFullYear();

      const newId = `CTR-${Date.now().toString().slice(-4)}`;
      const contractNumber = payload.contractNumber?.trim() || `PKWT/BARAK/${year}/${nextSeq}`;
      const contractType = payload.contractType || 'PKWT';
      const startDate = payload.startDate || new Date().toISOString().slice(0, 10);
      const endDate = contractType === 'PKWTT' ? '2030-12-31' : (payload.endDate || `${year + 1}-12-31`);

      const daysRemaining = contractType === 'PKWTT' ? 1500 : calculateDaysRemaining(endDate);
      const status = daysRemaining <= 30 && contractType !== 'PKWTT' ? 'EXPIRING_SOON' : (payload.status || 'ACTIVE');

      const documents = payload.documents || [
        { type: 'KTP', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
        { type: 'Kartu Keluarga', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
        { type: 'SKCK', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
        { type: 'Ijazah Terakhir', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
        { type: 'Sertifikat Keahlian', status: 'VERIFIED', uploadedAt: new Date().toISOString().slice(0, 10) },
      ];

      const newContract = {
        id: newId,
        contractNumber,
        employeeId: payload.employeeId || `BRK-EMP-${Date.now().toString().slice(-3)}`,
        employeeName: payload.employeeName || 'Karyawan Baru',
        employeeNik: payload.employeeNik || '-',
        department: payload.department || 'Operasional',
        position: payload.position || 'Staff',
        clientName: payload.clientName || 'Head Office',
        contractType,
        startDate,
        endDate,
        status,
        daysRemaining,
        documentCompleteness: calculateCompleteness(documents),
        documents,
        notes: payload.notes || '',
        fileName: payload.fileName || null,
        fileUrl: payload.fileUrl || null,
        createdAt: new Date().toISOString(),
        createdBy: actorName,
        isDeleted: false,
        pendingDelete: false,
      };

      const updatedList = [newContract, ...contracts];
      saveContractsStore(updatedList);

      await emitAudit({
        action: 'CONTRACT_CREATE',
        module: 'HRD',
        entity: 'Contract',
        entityId: newId,
        details: {
          contractNumber,
          employeeName: newContract.employeeName,
          contractType,
          startDate,
          endDate,
          createdBy: actorName,
        },
      });

      return { data: newContract, error: null };
    }

    const { data } = await apiClient.post('/contracts', payload);
    return data;
  },

  /**
   * Update existing contract & document details
   */
  async updateContract(contractId, payload, actorName = 'Siti Rahmawati (HRD)') {
    if (isMock) {
      const contracts = getContractsStore();
      const idx = contracts.findIndex((c) => c.id === contractId);
      if (idx === -1) return { data: null, error: { message: 'Kontrak tidak ditemukan.' } };

      const existing = contracts[idx];
      const contractType = payload.contractType || existing.contractType;
      const endDate = contractType === 'PKWTT' ? '2030-12-31' : (payload.endDate || existing.endDate);
      const daysRemaining = contractType === 'PKWTT' ? 1500 : calculateDaysRemaining(endDate);
      const documents = payload.documents || existing.documents || [];

      const updated = {
        ...existing,
        ...payload,
        contractType,
        endDate,
        daysRemaining,
        documents,
        documentCompleteness: calculateCompleteness(documents),
        status: payload.status || (daysRemaining <= 30 && contractType !== 'PKWTT' ? 'EXPIRING_SOON' : existing.status),
        updatedAt: new Date().toISOString(),
        updatedBy: actorName,
      };

      contracts[idx] = updated;
      saveContractsStore(contracts);

      await emitAudit({
        action: 'CONTRACT_UPDATE',
        module: 'HRD',
        entity: 'Contract',
        entityId: contractId,
        details: {
          contractNumber: updated.contractNumber,
          employeeName: updated.employeeName,
          contractType,
          endDate,
          updatedBy: actorName,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.put(`/contracts/${contractId}`, payload);
    return data;
  },

  /**
   * Quick extend contract end date
   */
  async extendContract(contractId, { newEndDate, notes }, actorName = 'Siti Rahmawati (HRD)') {
    if (isMock) {
      const contracts = getContractsStore();
      const idx = contracts.findIndex((c) => c.id === contractId);
      if (idx === -1) return { data: null, error: { message: 'Kontrak tidak ditemukan.' } };

      const existing = contracts[idx];
      const daysRemaining = calculateDaysRemaining(newEndDate);

      const updated = {
        ...existing,
        endDate: newEndDate,
        status: daysRemaining <= 30 && existing.contractType !== 'PKWTT' ? 'EXPIRING_SOON' : 'ACTIVE',
        daysRemaining,
        notes: notes ? `${existing.notes ? existing.notes + ' | ' : ''}${notes}` : existing.notes,
        extendedAt: new Date().toISOString(),
        extendedBy: actorName,
      };
      contracts[idx] = updated;
      saveContractsStore(contracts);

      await emitAudit({
        action: 'CONTRACT_EXTEND',
        module: 'HRD',
        entity: 'Contract',
        entityId: contractId,
        details: { newEndDate, employee: updated.employeeName, extendedBy: actorName },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/contracts/${contractId}/extend`, { newEndDate, notes });
    return data;
  },

  /**
   * Request Delete Contract & Documents (Maker-Checker -> Direktur Utama Approval)
   */
  async requestDeleteContract(contractId, { reason = '', requestedBy = 'Siti Rahmawati (HRD)' } = {}) {
    if (isMock) {
      const contracts = getContractsStore();
      const idx = contracts.findIndex((c) => c.id === contractId);
      if (idx === -1) return { data: null, error: { message: 'Kontrak tidak ditemukan.' } };

      const ctr = contracts[idx];
      const deleteRequestId = `DEL-CTR-HRD-${Date.now().toString().slice(-6)}`;

      const deleteApprovalItem = {
        id: deleteRequestId,
        entityType: 'HRD_CONTRACT',
        recordId: contractId,
        referenceId: contractId,
        entityId: contractId,
        title: `Permohonan Hapus Kontrak: ${ctr.contractNumber} (${ctr.employeeName})`,
        category: 'HRD_CONTRACT_DELETE',
        type: 'HRD_CONTRACT_DELETE',
        submitter: requestedBy,
        submittedBy: requestedBy,
        department: 'HRD',
        submittedAt: new Date().toISOString(),
        details: {
          contractId,
          contractNumber: ctr.contractNumber,
          employeeId: ctr.employeeId,
          employeeName: ctr.employeeName,
          position: ctr.position,
          clientName: ctr.clientName,
          contractType: ctr.contractType,
          reason,
        },
        status: 'PENDING',
      };

      // Mark contract as pending delete
      contracts[idx] = {
        ...ctr,
        pendingDelete: true,
        deleteRequestId,
        deleteReason: reason,
      };
      saveContractsStore(contracts);

      // Save to approvals collection for Direktur Utama
      const approvals = getStoredCollection('approvals', () => []);
      saveStoredCollection('approvals', [deleteApprovalItem, ...approvals]);

      await emitAudit({
        action: 'HRD_CONTRACT_DELETE_REQUEST',
        module: 'HRD',
        entity: 'Contract',
        entityId: contractId,
        details: {
          contractNumber: ctr.contractNumber,
          employeeName: ctr.employeeName,
          reason,
          requestedBy,
          deleteRequestId,
        },
      });

      return { data: contracts[idx], error: null };
    }

    const { data } = await apiClient.post(`/contracts/${contractId}/request-delete`, { reason, requestedBy });
    return data;
  },

  /**
   * Approve/Execute Delete Contract (Executed by Direktur Utama or Direct Soft Delete)
   */
  async deleteContract(contractId, { deletedBy = 'Juli Priyanto (Direktur Utama)', reason = '' } = {}) {
    if (isMock) {
      const contracts = getContractsStore();
      const idx = contracts.findIndex((c) => c.id === contractId);
      if (idx === -1) return { data: null, error: { message: 'Kontrak tidak ditemukan.' } };

      const ctr = contracts[idx];
      const updated = {
        ...ctr,
        isDeleted: true,
        status: 'DELETED',
        pendingDelete: false,
        deletedAt: new Date().toISOString(),
        deletedBy,
        deleteReason: reason || ctr.deleteReason,
      };

      contracts[idx] = updated;
      saveContractsStore(contracts);

      await emitAudit({
        action: 'HRD_CONTRACT_DELETED',
        module: 'HRD',
        entity: 'Contract',
        entityId: contractId,
        details: {
          contractNumber: ctr.contractNumber,
          employeeName: ctr.employeeName,
          deletedBy,
          reason: reason || ctr.deleteReason,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.delete(`/contracts/${contractId}`, { data: { deletedBy, reason } });
    return data;
  },

  /**
   * Cancel / Reject delete request (Restores contract to active status)
   */
  async cancelDeleteRequest(contractId, { rejectedBy = 'Juli Priyanto (Direktur Utama)', reason = '' } = {}) {
    if (isMock) {
      const contracts = getContractsStore();
      const idx = contracts.findIndex((c) => c.id === contractId);
      if (idx === -1) return { data: null, error: { message: 'Kontrak tidak ditemukan.' } };

      const ctr = contracts[idx];
      const updated = {
        ...ctr,
        pendingDelete: false,
        deleteRequestId: null,
      };

      contracts[idx] = updated;
      saveContractsStore(contracts);

      await emitAudit({
        action: 'HRD_CONTRACT_DELETE_CANCELLED',
        module: 'HRD',
        entity: 'Contract',
        entityId: contractId,
        details: {
          contractNumber: ctr.contractNumber,
          rejectedBy,
          reason,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/contracts/${contractId}/cancel-delete`, { rejectedBy, reason });
    return data;
  },
};

export default contractAdapter;
