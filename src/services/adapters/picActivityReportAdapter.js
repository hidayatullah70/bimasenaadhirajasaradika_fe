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

// Parse date string into normalized YYYY-MM-DD and components
function parseDateComponents(rawDate) {
  const today = new Date();
  if (!rawDate) {
    const y = String(today.getFullYear());
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return { isoDate: `${y}-${m}-${d}`, year: y, month: m, dateObj: today };
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    const [y, m, d] = rawDate.split('-');
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return { isoDate: rawDate, year: y, month: m, dateObj };
  }

  // Format DD/MM/YYYY or MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(rawDate)) {
    const [p1, p2, y] = rawDate.split('/');
    let m = p1;
    let d = p2;
    if (parseInt(p1, 10) > 12) {
      d = p1;
      m = p2;
    }
    const padM = String(m).padStart(2, '0');
    const padD = String(d).padStart(2, '0');
    const dateObj = new Date(parseInt(y, 10), parseInt(padM, 10) - 1, parseInt(padD, 10));
    return { isoDate: `${y}-${padM}-${padD}`, year: y, month: padM, dateObj };
  }

  const parsed = new Date(rawDate);
  if (!isNaN(parsed.getTime())) {
    const y = String(parsed.getFullYear());
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return { isoDate: `${y}-${m}-${d}`, year: y, month: m, dateObj: parsed };
  }

  const y = String(today.getFullYear());
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return { isoDate: `${y}-${m}-${d}`, year: y, month: m, dateObj: today };
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
            r.isiKegiatan?.toLowerCase().includes(q) ||
            r.title?.toLowerCase().includes(q) ||
            r.description?.toLowerCase().includes(q)
        );
      }

      if (picName && picName !== 'SEMUA') {
        items = items.filter((r) => r.picName === picName);
      }

      if (region && region !== 'SEMUA') {
        items = items.filter((r) => r.lokasiKunjungan === region);
      }

      if (month && month !== 'SEMUA') {
        items = items.filter((r) => String(r.bulan) === String(month).padStart(2, '0'));
      }

      if (year && year !== 'SEMUA') {
        items = items.filter((r) => String(r.tahun) === String(year));
      }

      // Safe sort newest first
      items.sort((a, b) => {
        const timeA = new Date((a.tanggalKunjungan || '1970-01-01') + 'T' + (a.jamKunjungan || '00:00')).getTime();
        const timeB = new Date((b.tanggalKunjungan || '1970-01-01') + 'T' + (b.jamKunjungan || '00:00')).getTime();
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });

      return apiSuccess({
        reports: items,
        data: items,
        total: items.length,
      });
    }

    const res = await apiClient.get('/operations/pic-reports', {
      params: { search, picName, region, month, year },
    });
    if (res && res.data && !res.error) return res;

    const items = getReportsStore();
    return apiSuccess({
      reports: items,
      data: items,
      total: items.length,
    });
  },

  /**
   * Create and submit a new PIC Activity Report
   */
  async createReport(payload) {
    if (isMockMode()) {
      const items = getReportsStore();
      const today = new Date();
      const rawDate = payload.tanggalKunjungan || payload.activityDate;
      const { isoDate, year: visitYear, month: visitMonth, dateObj } = parseDateComponents(rawDate);

      // Unique ID generation: find highest numeric suffix
      const maxNum = items.reduce((max, r) => {
        const match = (r.id || '').match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      const nextNum = Math.max(maxNum + 1, items.length + 1);
      let reportId = `RPT-KORLAP-${visitYear}-${String(nextNum).padStart(3, '0')}`;
      if (items.some((r) => r.id === reportId)) {
        reportId = `RPT-KORLAP-${visitYear}-${String(nextNum + 1).padStart(3, '0')}`;
      }

      const locationName =
        payload.namaLokasi ||
        payload.locationName ||
        payload.clientName ||
        'Site Operasional';

      const activityText =
        payload.isiKegiatan ||
        payload.description ||
        payload.title ||
        'Kunjungan dan supervisi pos keamanan lapangan';

      const newReport = {
        id: reportId,
        picName: payload.picName || 'PIC 1',
        lokasiKunjungan: payload.lokasiKunjungan || 'Jakarta Barat & Daan Mogot',
        namaLokasi: locationName,
        tanggalKunjungan: isoDate,
        jamKunjungan: payload.jamKunjungan || today.toTimeString().slice(0, 5),
        mingguKe: getWeekNumber(dateObj),
        bulan: visitMonth,
        tahun: visitYear,
        fotoKunjungan:
          payload.fotoKunjungan ||
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><rect width="960" height="540" fill="%230F172A"/><text x="480" y="270" fill="%23FFFFFF" text-anchor="middle" font-size="20">Foto Kunjungan 16:9 HD</text></svg>',
        fotoMeta: payload.fotoMeta || { ratio: '16:9' },
        isiKegiatan: activityText,
        title: payload.title || locationName,
        description: payload.description || activityText,
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
   * Update an existing PIC Activity Report
   */
  async updateReport(id, payload) {
    if (isMockMode()) {
      const items = getReportsStore();
      const normId = String(id).toLowerCase().trim();
      const idx = items.findIndex((r) => String(r.id).toLowerCase().trim() === normId);
      if (idx === -1) return apiError('NOT_FOUND', 'Laporan kegiatan tidak ditemukan.');

      const oldRpt = items[idx];
      const updated = {
        ...oldRpt,
        ...payload,
        id: oldRpt.id,
        updatedAt: new Date().toISOString(),
      };
      items[idx] = updated;
      saveReportsStore(items);

      emitAudit({
        action: 'PIC_REPORT_EDIT',
        module: 'operations',
        targetId: oldRpt.id,
        details: `Laporan kegiatan lapangan oleh ${updated.picName} diperbarui.`,
      });

      return apiSuccess(updated);
    }

    const { data } = await apiClient.patch(`/operations/pic-reports/${id}`, payload);
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

  async deleteReport(id) {
    if (isMockMode()) {
      const items = getReportsStore();
      const normId = String(id).toLowerCase().trim();
      const idx = items.findIndex((r) => String(r.id).toLowerCase().trim() === normId);
      if (idx === -1) return apiError('NOT_FOUND', 'Laporan kegiatan tidak ditemukan.');
      const removed = items[idx];
      const updated = items.filter((_, i) => i !== idx);
      saveReportsStore(updated);
      emitAudit({
        action: 'PIC_REPORT_DELETE',
        module: 'operations',
        targetId: removed.id,
        details: `Laporan kegiatan ${removed.id} dihapus.`,
      });
      return apiSuccess({ success: true, id: removed.id });
    }

    const { data } = await apiClient.delete(`/operations/pic-reports/${id}`);
    return data;
  },
};

export default picActivityReportAdapter;
