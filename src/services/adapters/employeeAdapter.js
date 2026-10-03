/**
 * Employee Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1 / API-SPEC Section 3.
 * Supports interchange between mock and REST mode via VITE_API_MODE.
 */

import apiClient from '@/services/apiClient';
import { MOCK_EMPLOYEES } from '@/services/mock/mockMasterData';
import { STATUS } from '@/constants/status';
import { emitAudit } from '@/utils/auditLogger';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
const STORAGE_KEY = 'barak_employees';

function getStore() {
  return getStoredCollection(STORAGE_KEY, () =>
    MOCK_EMPLOYEES.map((e) => ({
      ...e,
      NIK: (e.NIK || '').replace(/\D/g, '').slice(0, 16),
    }))
  );
}

function saveStore(store) {
  saveStoredCollection(STORAGE_KEY, store);
}

export const employeeAdapter = {
  /**
   * Get paginated employees with filtering and search
   */
  async getEmployees({
    search = '',
    department = '',
    serviceType = '',
    status = '',
    page = 1,
    pageSize = 10,
    includeDeleted = false,
  } = {}) {
    if (isMock) {
      let filtered = getStore().filter((e) => includeDeleted || !e.isDeleted);

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.nama_lengkap_sesuai_KTP.toLowerCase().includes(q) ||
            e.id_karyawan.toLowerCase().includes(q) ||
            (e.NIK && e.NIK.includes(q)) ||
            (e.jenis_pekerjaan && e.jenis_pekerjaan.toLowerCase().includes(q)) ||
            (e.jenis_layanan && e.jenis_layanan.toLowerCase().includes(q)) ||
            (e.clientName && e.clientName.toLowerCase().includes(q))
        );
      }

      if (department) {
        filtered = filtered.filter((e) => e.departemen === department);
      }

      if (serviceType) {
        filtered = filtered.filter((e) => e.jenis_layanan === serviceType);
      }

      if (status) {
        filtered = filtered.filter((e) => e.status_kerja === status);
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

    const { data } = await apiClient.get('/employees', {
      params: { search, department, serviceType, status, page, pageSize },
    });
    return data;
  },

  /**
   * Get single employee by ID
   */
  async getEmployeeById(id) {
    if (isMock) {
      const store = getStore();
      const emp = store.find((e) => e.id === id || e.id_karyawan === id);
      if (!emp) return { data: null, error: { message: 'Karyawan tidak ditemukan.' } };
      return { data: { ...emp }, error: null };
    }

    const { data } = await apiClient.get(`/employees/${id}`);
    return data;
  },

  /**
   * Create employee
   */
  async createEmployee(payload) {
    if (isMock) {
      const store = getStore();
      const maxNum = store.reduce((max, e) => {
        const match = (e.id || e.id_karyawan || '').match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const newId = `BRK-EMP-${(maxNum + 1).toString().padStart(3, '0')}`;
      const newEmp = {
        ...payload,
        id: newId,
        id_karyawan: newId,
        NIK: payload.NIK ? payload.NIK.replace(/\D/g, '').slice(0, 16) : '',
        tanggal_masuk: payload.tanggal_masuk || new Date().toISOString().split('T')[0],
        status_pajak: payload.status_pajak || 'TK0',
        NPWP: payload.NPWP || '',
        status_kerja: payload.status_kerja || 'TETAP',
        kelengkapan_dokumen: payload.kelengkapan_dokumen || { percentage: 100 },
        foto_3x4: payload.foto_3x4 || '',
        createdAt: new Date().toISOString(),
      };
      const updatedStore = [newEmp, ...store];
      saveStore(updatedStore);

      await emitAudit({
        action: 'EMPLOYEE_CREATE',
        module: 'HRD',
        entity: 'Employee',
        entityId: newId,
        details: { name: newEmp.nama_lengkap_sesuai_KTP, job: newEmp.jenis_pekerjaan },
      });

      return { data: newEmp, error: null };
    }

    const { data } = await apiClient.post('/employees', payload);
    return data;
  },

  /**
   * Update employee
   */
  async updateEmployee(id, payload) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((e) => e.id === id || e.id_karyawan === id);
      if (idx === -1) return { data: null, error: { message: 'Karyawan tidak ditemukan.' } };

      const oldEmp = store[idx];
      const updated = {
        ...oldEmp,
        ...payload,
        id: oldEmp.id,
        id_karyawan: oldEmp.id_karyawan || oldEmp.id,
        NIK: payload.NIK ? payload.NIK.replace(/\D/g, '').slice(0, 16) : oldEmp.NIK,
        updatedAt: new Date().toISOString(),
      };
      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'EMPLOYEE_EDIT',
        module: 'HRD',
        entity: 'Employee',
        entityId: id,
        details: { changes: Object.keys(payload) },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/employees/${id}`, payload);
    return data;
  },

  /**
   * Delete / Deactivate employee (Supports hard delete for test or deactivation)
   */
  async deleteEmployee(id) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((e) => e.id === id || e.id_karyawan === id);
      if (idx === -1) return { data: null, error: { message: 'Karyawan tidak ditemukan.' } };

      const removed = store[idx];
      const updatedStore = store.filter((e) => e.id !== id && e.id_karyawan !== id);
      saveStore(updatedStore);

      await emitAudit({
        action: 'EMPLOYEE_DELETE',
        module: 'HRD',
        entity: 'Employee',
        entityId: id,
        details: { name: removed.nama_lengkap_sesuai_KTP },
      });

      return { data: { success: true }, error: null };
    }

    const { data } = await apiClient.delete(`/employees/${id}`);
    return data;
  },

  /**
   * Soft-delete employee — sets isDeleted: true & status: INACTIVE (Director supreme action)
   */
  async softDeleteEmployee(id, { deletedBy = 'Direktur', reason = 'Penonaktifan' } = {}) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((e) => e.id === id || e.id_karyawan === id);
      if (idx === -1) return { data: null, error: { message: 'Karyawan tidak ditemukan.' } };

      const emp = store[idx];
      const updated = {
        ...emp,
        isDeleted: true,
        status: STATUS.INACTIVE,
        status_kerja: 'NON_AKTIF',
        deletedAt: new Date().toISOString(),
        deletedBy,
        deleteReason: reason,
        pendingDelete: false,
        updatedAt: new Date().toISOString(),
      };

      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'EMPLOYEE_SOFT_DELETE',
        module: 'HRD',
        entity: 'Employee',
        entityId: id,
        details: { name: emp.nama_lengkap_sesuai_KTP, deletedBy, reason },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/employees/${id}/soft-delete`, { deletedBy, reason });
    return data;
  },

  /**
   * Request employee deletion — non-destructive workflow for HRD/Staff submitted to Direktur
   */
  async requestDeleteEmployee(id, opts = {}) {
    const reason = typeof opts === 'string' ? opts : (opts?.reason || '');
    const requestedBy = (typeof opts === 'object' && opts?.requestedBy) || 'HRD';
    const entityLabel = (typeof opts === 'object' && opts?.entityLabel) || '';

    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((e) => e.id === id || e.id_karyawan === id);
      if (idx === -1) return { data: null, error: { message: 'Karyawan tidak ditemukan.' } };

      const emp = store[idx];
      const deleteRequest = {
        id: `DEL-EMP-${Date.now().toString().slice(-6)}`,
        entityType: 'EMPLOYEE',
        recordId: id,
        referenceId: id,
        entityId: id,
        title: `Permohonan Hapus Karyawan: ${entityLabel || emp.nama_lengkap_sesuai_KTP}`,
        category: 'EMPLOYEE_DELETE',
        type: 'EMPLOYEE_DELETE',
        submitter: requestedBy,
        submittedBy: requestedBy,
        department: 'HRD',
        submittedAt: new Date().toISOString(),
        details: {
          employeeId: id,
          employeeName: emp.nama_lengkap_sesuai_KTP,
          nik: emp.NIK,
          department: emp.departemen,
          position: emp.jabatan,
          reason,
        },
        status: 'PENDING',
      };

      // Mark employee as pending delete
      store[idx] = {
        ...emp,
        pendingDelete: true,
        deleteRequestId: deleteRequest.id,
      };
      saveStore(store);

      // Save into approvals collection for Director
      const approvals = getStoredCollection('approvals', () => []);
      saveStoredCollection('approvals', [deleteRequest, ...approvals]);

      await emitAudit({
        action: 'EMPLOYEE_DELETE_REQUEST',
        module: 'HRD',
        entity: 'Employee',
        entityId: id,
        details: { name: emp.nama_lengkap_sesuai_KTP, requestedBy, reason },
      });

      return {
        data: {
          success: true,
          pendingApproval: true,
          requestId: deleteRequest.id,
          message: 'Permohonan penghapusan telah diajukan ke Direktur.',
        },
        error: null,
      };
    }

    const { data } = await apiClient.post(`/employees/${id}/request-delete`, { reason, requestedBy });
    return data;
  },

  /**
   * Alias for requestDeleteEmployee
   */
  async requestDelete(id, opts = {}) {
    return this.requestDeleteEmployee(id, opts);
  },
};

export default employeeAdapter;
