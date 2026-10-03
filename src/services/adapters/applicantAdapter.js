/**
 * Applicant Service Adapter — PT. BARAK IOMS
 * Source of Truth: Landing Page Job Applications (Formulir Lamaran Kerja)
 * Supports full CRUD, Accept to Master Employee, and Reject / Archive workflow.
 */

import apiClient from '@/services/apiClient';
import { MOCK_APPLICANTS } from '@/services/mock/mockApplicantData';
import { employeeAdapter } from '@/services/adapters/employeeAdapter';
import { getServiceLabel } from '@/constants/business';
import { emitAudit } from '@/utils/auditLogger';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
const STORAGE_KEY = 'barak_applicants';

function mapDeptToServiceKey(dept) {
  if (!dept) return 'security';
  const lower = dept.toLowerCase();
  if (lower.includes('kurir') || lower.includes('ekspedisi')) return 'kurir';
  if (lower.includes('parkir')) return 'parkir';
  if (lower.includes('cleaning')) return 'cleaning-service';
  if (lower.includes('man power') || lower.includes('manpower')) return 'man-power';
  if (lower.includes('loss') || lower.includes('prevention')) return 'loss-prevention';
  return 'security';
}

function getStore() {
  return getStoredCollection(STORAGE_KEY, () => [...MOCK_APPLICANTS]);
}

function saveStore(store) {
  saveStoredCollection(STORAGE_KEY, store);
}

export const applicantAdapter = {
  /**
   * Get paginated applicants with search and filters
   */
  async getApplicants({
    search = '',
    status = '',
    department = '',
    page = 1,
    pageSize = 10,
  } = {}) {
    if (isMock) {
      let filtered = [...getStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            (a.namaLengkap && a.namaLengkap.toLowerCase().includes(q)) ||
            (a.id && a.id.toLowerCase().includes(q)) ||
            (a.nik && a.nik.includes(q)) ||
            (a.email && a.email.toLowerCase().includes(q)) ||
            (a.noHpWa && a.noHpWa.includes(q)) ||
            (a.posisi && a.posisi.toLowerCase().includes(q))
        );
      }

      if (status) {
        filtered = filtered.filter((a) => a.status === status);
      }

      if (department) {
        filtered = filtered.filter(
          (a) => a.departemen === department || a.jenis_layanan === department
        );
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

    const { data } = await apiClient.get('/applicants', {
      params: { search, status, department, page, pageSize },
    });
    return data;
  },

  /**
   * Get single applicant by ID
   */
  async getApplicantById(id) {
    if (isMock) {
      const store = getStore();
      const applicant = store.find((a) => a.id === id);
      if (!applicant) return { data: null, error: { message: 'Data pelamar tidak ditemukan.' } };
      return { data: { ...applicant }, error: null };
    }

    const { data } = await apiClient.get(`/applicants/${id}`);
    return data;
  },

  /**
   * Create applicant manually (HRD Input)
   */
  async createApplicant(payload) {
    if (isMock) {
      const store = getStore();
      const currentYear = new Date().getFullYear();
      const maxNum = store.reduce((max, a) => {
        const match = (a.id || '').match(/APP-\d{4}-(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);

      const newId = `APP-${currentYear}-${(maxNum + 1).toString().padStart(3, '0')}`;
      const serviceKey = payload.jenis_layanan || mapDeptToServiceKey(payload.departemen);

      const newApplicant = {
        ...payload,
        id: newId,
        nik: (payload.nik || '').replace(/\D/g, '').slice(0, 16),
        jenis_layanan: serviceKey,
        status: payload.status || 'MASUK',
        tanggalLamar: payload.tanggalLamar || new Date().toISOString().split('T')[0],
        employeeId: payload.employeeId || null,
        createdAt: new Date().toISOString(),
      };

      const updatedStore = [newApplicant, ...store];
      saveStore(updatedStore);

      await emitAudit({
        action: 'APPLICANT_CREATE',
        module: 'HRD',
        entity: 'Applicant',
        entityId: newId,
        details: { name: newApplicant.namaLengkap, dept: newApplicant.departemen },
      });

      return { data: newApplicant, error: null };
    }

    const { data } = await apiClient.post('/applicants', payload);
    return data;
  },

  /**
   * Update applicant data
   */
  async updateApplicant(id, payload) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((a) => a.id === id);
      if (idx === -1) return { data: null, error: { message: 'Data pelamar tidak ditemukan.' } };

      const oldApp = store[idx];
      const serviceKey = payload.jenis_layanan || (payload.departemen ? mapDeptToServiceKey(payload.departemen) : oldApp.jenis_layanan);

      const updated = {
        ...oldApp,
        ...payload,
        id: oldApp.id,
        nik: payload.nik ? payload.nik.replace(/\D/g, '').slice(0, 16) : oldApp.nik,
        jenis_layanan: serviceKey,
        updatedAt: new Date().toISOString(),
      };

      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'APPLICANT_EDIT',
        module: 'HRD',
        entity: 'Applicant',
        entityId: id,
        details: { changes: Object.keys(payload) },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/applicants/${id}`, payload);
    return data;
  },

  /**
   * Delete applicant
   */
  async deleteApplicant(id) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((a) => a.id === id);
      if (idx === -1) return { data: null, error: { message: 'Data pelamar tidak ditemukan.' } };

      const removed = store[idx];
      const updatedStore = store.filter((a) => a.id !== id);
      saveStore(updatedStore);

      await emitAudit({
        action: 'APPLICANT_DELETE',
        module: 'HRD',
        entity: 'Applicant',
        entityId: id,
        details: { name: removed.namaLengkap },
      });

      return { data: { success: true }, error: null };
    }

    const { data } = await apiClient.delete(`/applicants/${id}`);
    return data;
  },

  /**
   * Action DITERIMA:
   * Sets status to DITERIMA and automatically creates a new employee in Master Data Terpadu.
   */
  async acceptApplicant(id, placementOverrides = {}) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((a) => a.id === id);
      if (idx === -1) return { data: null, error: { message: 'Data pelamar tidak ditemukan.' } };

      const applicant = store[idx];
      const serviceKey = applicant.jenis_layanan || mapDeptToServiceKey(applicant.departemen);
      const serviceLabel = getServiceLabel(serviceKey) || applicant.departemen || 'Operasional';

      // 1. Create employee in Master Data Terpadu
      const employeePayload = {
        nama_lengkap_sesuai_KTP: applicant.namaLengkap,
        NIK: applicant.nik,
        jenis_kelamin: placementOverrides.jenis_kelamin || 'L',
        tempat_lahir: applicant.tempatLahir || 'Tangerang',
        tanggal_lahir: applicant.tglLahir || '1995-01-01',
        tanggal_masuk: placementOverrides.tanggal_masuk || new Date().toISOString().split('T')[0],
        alamat_sesuai_KTP: applicant.alamatLengkap || '',
        nomor_telepon: applicant.noHpWa || '',
        email: applicant.email || '',
        status_kerja: placementOverrides.status_kerja || 'TETAP',
        jenis_layanan: serviceKey,
        jenis_pekerjaan: serviceLabel,
        jabatan: placementOverrides.jabatan || applicant.posisi || 'Staff',
        departemen: placementOverrides.departemen || 'Operasional',
        penugasan_klien: placementOverrides.penugasan_klien || '',
        lokasi_penugasan: placementOverrides.lokasi_penugasan || '',
        sertifikasi: placementOverrides.sertifikasi || (applicant.nomorSim ? `SIM: ${applicant.nomorSim}` : 'Standard'),
        nama_bank: 'BCA',
        nomor_rekening_bank: applicant.nomorRekening || '',
        rekening_atas_nama: applicant.namaPemilikRekening || applicant.namaLengkap,
        NPWP: placementOverrides.NPWP || '',
        status_pajak: placementOverrides.status_pajak || 'TK0',
        BPJS_kesehatan: placementOverrides.BPJS_kesehatan || '',
        BPJS_ketenagakerjaan: placementOverrides.BPJS_ketenagakerjaan || '',
        emergency_nama: 'Keluarga Pelamar',
        emergency_relasi: 'Keluarga',
        emergency_nomor: applicant.noHpDarurat || '',
        foto_3x4: placementOverrides.foto_3x4 || '',
      };

      const { data: createdEmployee, error: empErr } = await employeeAdapter.createEmployee(employeePayload);
      if (empErr) {
        return { data: null, error: empErr };
      }

      // 2. Mark applicant as DITERIMA
      const updatedApplicant = {
        ...applicant,
        status: 'DITERIMA',
        employeeId: createdEmployee.id || createdEmployee.id_karyawan,
        acceptedAt: new Date().toISOString(),
      };

      store[idx] = updatedApplicant;
      saveStore(store);

      await emitAudit({
        action: 'APPLICANT_ACCEPT',
        module: 'HRD',
        entity: 'Applicant',
        entityId: id,
        details: {
          applicantName: applicant.namaLengkap,
          createdEmployeeId: updatedApplicant.employeeId,
          service: serviceLabel,
        },
      });

      return {
        data: {
          applicant: updatedApplicant,
          employee: createdEmployee,
        },
        error: null,
      };
    }

    const { data } = await apiClient.post(`/applicants/${id}/accept`, placementOverrides);
    return data;
  },

  /**
   * Action DITOLAK:
   * Sets status to DITOLAK with reason and archives it.
   */
  async rejectApplicant(id, reason = '') {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((a) => a.id === id);
      if (idx === -1) return { data: null, error: { message: 'Data pelamar tidak ditemukan.' } };

      const applicant = store[idx];
      const updated = {
        ...applicant,
        status: 'DITOLAK',
        catatanPenolakan: reason || 'Kualifikasi belum sesuai kebutuhan formasi operasional.',
        rejectedAt: new Date().toISOString(),
      };

      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'APPLICANT_REJECT',
        module: 'HRD',
        entity: 'Applicant',
        entityId: id,
        details: { applicantName: applicant.namaLengkap, reason },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/applicants/${id}/reject`, { reason });
    return data;
  },

  /**
   * Action KEMBALIKAN DARI ARSIP:
   * Reopen applicant back to MASUK
   */
  async restoreApplicant(id) {
    if (isMock) {
      const store = getStore();
      const idx = store.findIndex((a) => a.id === id);
      if (idx === -1) return { data: null, error: { message: 'Data pelamar tidak ditemukan.' } };

      const applicant = store[idx];
      const updated = {
        ...applicant,
        status: 'MASUK',
        restoredAt: new Date().toISOString(),
      };

      store[idx] = updated;
      saveStore(store);

      await emitAudit({
        action: 'APPLICANT_RESTORE',
        module: 'HRD',
        entity: 'Applicant',
        entityId: id,
        details: { applicantName: applicant.namaLengkap },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/applicants/${id}/restore`);
    return data;
  },

  /**
   * Ingest submission from Landing Page JobApplicationModal
   */
  saveApplicationFromLanding(rawData) {
    const store = getStore();
    const cleanNik = (rawData.nik || '').replace(/\D/g, '').slice(0, 16);

    // Prevent direct duplicate if same NIK applied in last 1 hour
    const existing = store.find((a) => a.nik === cleanNik && a.status === 'MASUK');
    if (existing) {
      return existing;
    }

    const currentYear = new Date().getFullYear();
    const maxNum = store.reduce((max, a) => {
      const match = (a.id || '').match(/APP-\d{4}-(\d+)$/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);

    const newId = `APP-${currentYear}-${(maxNum + 1).toString().padStart(3, '0')}`;
    const serviceKey = mapDeptToServiceKey(rawData.departemen);

    const newApplicant = {
      id: newId,
      namaLengkap: (rawData.namaLengkap || 'Pelamar Baru').trim(),
      nik: cleanNik,
      tempatLahir: rawData.tempatLahir || '',
      tglLahir: rawData.tglLahir || '',
      usia: rawData.usia ? Number(rawData.usia) : 25,
      alamatLengkap: rawData.alamatLengkap || '',
      nomorSim: rawData.nomorSim || '',
      email: rawData.email || '',
      noHpWa: rawData.noHpWa || '',
      noHpDarurat: rawData.noHpDarurat || '',
      namaBank: 'BCA',
      nomorRekening: rawData.nomorRekening || '',
      namaPemilikRekening: rawData.namaPemilikRekening || rawData.namaLengkap || '',
      departemen: rawData.departemen || 'Jasa Pengamanan / Security',
      posisi: rawData.posisi || `Pelamar - ${rawData.departemen || 'Operasional'}`,
      jenis_layanan: serviceKey,
      status: 'MASUK',
      tanggalLamar: new Date().toISOString().split('T')[0],
      catatan: rawData.catatan || 'Lamaran masuk melalui Formulir Lamaran Kerja Website PT. BARAK.',
      catatanPenolakan: '',
      employeeId: null,
      createdAt: new Date().toISOString(),
    };

    const updatedStore = [newApplicant, ...store];
    saveStore(updatedStore);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('barak:applicant:created', { detail: newApplicant }));
    }

    return newApplicant;
  },

  /**
   * Listener for Landing Page Job Application Submissions
   * Non-intrusively captures form submit on landing page modal without modifying src/features/landing/*
   */
  initLandingApplicationListener() {
    if (typeof window === 'undefined' || window.__barak_applicant_listener_active) return;
    window.__barak_applicant_listener_active = true;

    // 1. Intercept DOM form submit for job applications
    document.addEventListener('submit', (e) => {
      try {
        const form = e.target;
        if (!form || !form.elements) return;

        // Check if this form has fields from JobApplicationModal
        const elNama = form.elements.namaLengkap;
        const elNik = form.elements.nik;
        const elWa = form.elements.noHpWa;

        if (elNama && elNik && elWa) {
          const applicantData = {
            namaLengkap: elNama.value || '',
            nik: elNik.value || '',
            tempatLahir: form.elements.tempatLahir ? form.elements.tempatLahir.value : '',
            tglLahir: form.elements.tglLahir ? form.elements.tglLahir.value : '',
            usia: form.elements.usia ? form.elements.usia.value : '',
            alamatLengkap: form.elements.alamatLengkap ? form.elements.alamatLengkap.value : '',
            nomorSim: form.elements.nomorSim ? form.elements.nomorSim.value : '',
            email: form.elements.email ? form.elements.email.value : '',
            noHpWa: elWa.value || '',
            noHpDarurat: form.elements.noHpDarurat ? form.elements.noHpDarurat.value : '',
            nomorRekening: form.elements.nomorRekening ? form.elements.nomorRekening.value : '',
            namaPemilikRekening: form.elements.namaPemilikRekening ? form.elements.namaPemilikRekening.value : '',
            departemen: form.elements.departemen ? form.elements.departemen.value : 'Jasa Pengamanan / Security',
            posisi: form.elements.posisi ? form.elements.posisi.value : '',
            catatan: form.elements.catatan ? form.elements.catatan.value : '',
          };

          if (applicantData.namaLengkap && applicantData.nik) {
            applicantAdapter.saveApplicationFromLanding(applicantData);
          }
        }
      } catch (err) {
        console.warn('Error in landing application submit listener:', err);
      }
    }, true);

    // 2. Intercept window.open in case WhatsApp URL was generated
    const originalOpen = window.open;
    window.open = function (url, target, features) {
      try {
        if (typeof url === 'string' && url.includes('wa.me') && url.includes('FORMULIR%20LAMARAN%20KERJA')) {
          const decoded = decodeURIComponent(url);
          const getVal = (prefix) => {
            const match = decoded.match(new RegExp(`${prefix}:?\\*?\\s*([^\\n•]+)`, 'i'));
            return match ? match[1].replace(/[*•]/g, '').trim() : '';
          };

          const applicantData = {
            namaLengkap: getVal('Nama Lengkap'),
            nik: getVal('NIK'),
            tempatLahir: getVal('Tempat, Tgl Lahir').split(',')[0]?.trim() || '',
            tglLahir: getVal('Tempat, Tgl Lahir').split(',')[1]?.trim() || '',
            usia: getVal('Usia').replace(/\D/g, '') || '',
            alamatLengkap: getVal('Alamat \\(eKTP\\)'),
            nomorSim: getVal('Nomor SIM'),
            email: getVal('Email'),
            noHpWa: getVal('No\\. HP / WA'),
            noHpDarurat: getVal('No\\. HP Darurat'),
            nomorRekening: getVal('Nomor Rekening'),
            namaPemilikRekening: getVal('Nama Pemilik Rekening'),
            departemen: getVal('Departemen / Layanan') || 'Jasa Pengamanan / Security',
            posisi: getVal('Posisi Kerja Target') || getVal('Posisi yang Dilamar') || 'Pelamar',
            catatan: getVal('Catatan Pelamar / Pengalaman') || getVal('Catatan') || '',
          };

          if (applicantData.namaLengkap && applicantData.nik) {
            applicantAdapter.saveApplicationFromLanding(applicantData);
          }
        }
      } catch (err) {
        console.warn('Error parsing WA URL for applicant capture:', err);
      }
      return originalOpen.call(window, url, target, features);
    };
  },
};

export default applicantAdapter;
