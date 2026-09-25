/**
 * Contract & Document Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1 & Section 12.1 (Employee Contracts & Expiry Alerts).
 */

import apiClient from '@/services/apiClient';
import { MOCK_EMPLOYEES } from '@/services/mock/mockMasterData';
import { emitAudit } from '@/utils/auditLogger';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';

// Derive contracts from MOCK_EMPLOYEES
let contractsStore = MOCK_EMPLOYEES.map((emp, idx) => {
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
  };
});

export const contractAdapter = {
  async getContracts({ search = '', type = '', status = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...contractsStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.employeeName.toLowerCase().includes(q) ||
            c.contractNumber.toLowerCase().includes(q) ||
            c.employeeNik.includes(q) ||
            (c.clientName && c.clientName.toLowerCase().includes(q))
        );
      }

      if (type) filtered = filtered.filter((c) => c.contractType === type);
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

    const { data } = await apiClient.get('/contracts', {
      params: { search, type, status, page, pageSize },
    });
    return data;
  },

  async extendContract(contractId, { newEndDate, notes }) {
    if (isMock) {
      const idx = contractsStore.findIndex((c) => c.id === contractId);
      if (idx === -1) return { data: null, error: { message: 'Kontrak tidak ditemukan.' } };

      const updated = {
        ...contractsStore[idx],
        endDate: newEndDate,
        status: 'ACTIVE',
        daysRemaining: 365,
        notes,
        extendedAt: new Date().toISOString(),
      };
      contractsStore[idx] = updated;

      await emitAudit({
        action: 'CONTRACT_EXTEND',
        module: 'HRD',
        entity: 'Contract',
        entityId: contractId,
        details: { newEndDate, employee: updated.employeeName },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/contracts/${contractId}/extend`, { newEndDate, notes });
    return data;
  },
};

export default contractAdapter;
