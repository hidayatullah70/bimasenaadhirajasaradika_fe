/**
 * Employee Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 11.1 / API-SPEC Section 3.
 * Supports interchange between mock and REST mode via VITE_API_MODE.
 */

import apiClient from '@/services/apiClient';
import { MOCK_EMPLOYEES } from '@/services/mock/mockMasterData';
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
  async getEmployees({ search = '', department = '', serviceType = '', status = '', page = 1, pageSize = 10 } = {}) {
    if (isMock) {
      let filtered = [...getStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.nama_lengkap_sesuai_KTP.toLowerCase().includes(q) ||
            e.id_karyawan.toLowerCase().includes(q) ||
            e.NIK.includes(q) ||
            e.jenis_pekerjaan.toLowerCase().includes(q) ||
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
      const newId = `BRK-EMP-${(store.length + 1).toString().padStart(3, '0')}`;
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
   * Delete / Deactivate employee
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
};

export default employeeAdapter;
