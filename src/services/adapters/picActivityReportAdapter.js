/**
 * PIC Activity Report Service Adapter — PT. BARAK IOMS
 * Manages Field Coordinator (Koordinator Lapangan) visit reports, photo storage,
 * and weekly/monthly aggregation summaries.
 */

import apiClient, { isMockMode, apiSuccess, apiError } from '@/services/apiClient';
import { INITIAL_PIC_ACTIVITY_REPORTS } from '@/services/mock/mockPicActivityData';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';
import { emitAudit } from '@/utils/auditLogger';

const STORAGE_KEY = 'pic_activity_reports';

function getReportsStore() {
  return getStoredCollection(STORAGE_KEY, () => [...INITIAL_PIC_ACTIVITY_REPORTS]);
}

function saveReportsStore(items) {
  saveStoredCollection(STORAGE_KEY, items);
}

// Calculate ISO week number helper
function getWeekNumber(dateObj) {
  const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export const picActivityReportAdapter = {
  /**
   * Get activity reports with filtering and search
   */
  async getReports({ search = '', picName = '', region = '', month = '', year = '' } = {}) {
    if (isMockMode()) {
      let items = getReportsStore();

      if (search) {
        const q = search.toLowerCase();
        items = items.filter(
          (r) =>
            r.picName?.toLowerCase().includes(q) ||
            r.namaLokasi?.toLowerCase().includes(q) ||
            r.lokasiKunjungan?.toLowerCase().includes(q) ||
            r.isiKegiatan?.toLowerCase().includes(q)
        );
      }

      if (picName && picName !== 'SEMUA') {
        items = items.filter((r) => r.picName === picName);
      }

      if (region && region !== 'SEMUA') {
        items = items.filter((r) => r.lokasiKunjungan === region);
      }

      if (month) {
        items = items.filter((r) => String(r.bulan) === String(month).padStart(2, '0'));
      }

      if (year) {
        items = items.filter((r) => String(r.tahun) === String(year));
      }

      // Sort newest first
      items.sort((a, b) => new Date(b.tanggalKunjungan + 'T' + (b.jamKunjungan || '00:00')) - new Date(a.tanggalKunjungan + 'T' + (a.jamKunjungan || '00:00')));

      return apiSuccess({
        reports: items,
        total: items.length,
      });
    }

    const { data } = await apiClient.get('/operations/pic-reports', {
      params: { search, picName, region, month, year },
    });
    return data;
  },

  /**
   * Create and submit a new PIC Activity Report
   */
  async createReport(payload) {
    if (isMockMode()) {
      const items = getReportsStore();
      const nextNum = items.length + 1;
      const today = new Date();
      const visitDate = payload.tanggalKunjungan ? new Date(payload.tanggalKunjungan) : today;

      const newReport = {
        id: `RPT-KORLAP-${visitDate.getFullYear()}-${String(nextNum).padStart(3, '0')}`,
        picName: payload.picName,
        lokasiKunjungan: payload.lokasiKunjungan,
        namaLokasi: payload.namaLokasi,
        tanggalKunjungan: payload.tanggalKunjungan || visitDate.toISOString().slice(0, 10),
        jamKunjungan: payload.jamKunjungan || today.toTimeString().slice(0, 5),
        mingguKe: getWeekNumber(visitDate),
        bulan: String(visitDate.getMonth() + 1).padStart(2, '0'),
        tahun: String(visitDate.getFullYear()),
        fotoKunjungan: payload.fotoKunjungan,
        fotoMeta: payload.fotoMeta || { ratio: '16:9' },
        isiKegiatan: payload.isiKegiatan,
        status: 'TERKIRIM',
        verifiedAt: null,
        verifiedBy: null,
        createdAt: new Date().toISOString(),
      };

      const updated = [newReport, ...items];
      saveReportsStore(updated);

      emitAudit({
        action: 'PIC_REPORT_SUBMIT',
        module: 'operations',
        targetId: newReport.id,
        details: `Laporan kegiatan lapangan oleh ${newReport.picName} di ${newReport.namaLokasi} berhasil dikirim ke Operasional.`,
      });

      return apiSuccess(newReport);
    }

    const { data } = await apiClient.post('/operations/pic-reports', payload);
    return data;
  },

  /**
   * Verify report (by Head of Operations or Director)
   */
  async verifyReport(id, verifiedBy = 'Nazi Rinaldi (Head Operasional)') {
    if (isMockMode()) {
      const items = getReportsStore();
      const idx = items.findIndex((r) => r.id === id);
      if (idx === -1) return apiError('NOT_FOUND', 'Laporan kegiatan tidak ditemukan.');

      items[idx] = {
        ...items[idx],
        status: 'DIVERIFIKASI',
        verifiedAt: new Date().toISOString(),
        verifiedBy,
      };

      saveReportsStore(items);

      emitAudit({
        action: 'PIC_REPORT_VERIFY',
        module: 'operations',
        targetId: id,
        details: `Laporan kegiatan ${id} diverifikasi oleh ${verifiedBy}.`,
      });

      return apiSuccess(items[idx]);
    }

    const { data } = await apiClient.patch(`/operations/pic-reports/${id}/verify`);
    return data;
  },

  /**
   * Get weekly & monthly summary metrics
   */
  async getSummaries() {
    if (isMockMode()) {
      const items = getReportsStore();

      // PIC breakdown
      const picCounts = {};
      items.forEach((r) => {
        picCounts[r.picName] = (picCounts[r.picName] || 0) + 1;
      });

      // Regions breakdown
      const regionCounts = {};
      items.forEach((r) => {
        regionCounts[r.lokasiKunjungan] = (regionCounts[r.lokasiKunjungan] || 0) + 1;
      });

      return apiSuccess({
        totalReports: items.length,
        verifiedCount: items.filter((r) => r.status === 'DIVERIFIKASI').length,
        pendingCount: items.filter((r) => r.status === 'TERKIRIM').length,
        picCounts,
        regionCounts,
      });
    }

    const { data } = await apiClient.get('/operations/pic-reports/summaries');
    return data;
  },
};

export default picActivityReportAdapter;
