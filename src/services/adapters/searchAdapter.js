/**
 * Global Search Service Adapter — PT. BARAK IOMS
 * Source of Truth: API-SPEC.md Section 12, PRD Section 24.
 * Integrates authoritative master data from Phase 2 (Employees, Clients, Locations).
 */

import { isMockMode, apiSuccess } from '@/services/apiClient';
import { MOCK_EMPLOYEES, MOCK_CLIENTS, MOCK_LOCATIONS, MOCK_ASSIGNMENTS } from '@/services/mock/mockMasterData';
import { MOCK_LEADS, MOCK_OPPORTUNITIES } from '@/services/mock/mockMarketingData';
import { MOCK_IT_TICKETS, MOCK_IT_ASSETS } from '@/services/mock/mockITData';
import { MOCK_ARTICLES, MOCK_CAREER_POSTINGS } from '@/services/mock/mockCMSData';
import { MOCK_PENDING_APPROVALS } from '@/services/mock/mockDirectorData';
import { STATUS } from '@/constants/status';
import restClient from '@/services/apiClient';

const SEARCH_TYPE_LABELS = {
  employee: 'Karyawan',
  client: 'Klien',
  location: 'Lokasi Penempatan',
  assignment: 'Penugasan',
  invoice: 'Invoice',
  cod_case: 'Kasus COD',
  legal_case: 'Kasus Legal',
  it_ticket: 'IT Ticket',
  it_asset: 'Aset IT',
  lead: 'Lead',
  article: 'Artikel Berita',
  career: 'Lowongan Karir',
  approval: 'Persetujuan Direktur',
};

const mockSearch = {
  async search(query) {
    if (!query || query.trim().length < 2) {
      return apiSuccess({ results: [], query, typeLabels: SEARCH_TYPE_LABELS });
    }

    await new Promise((r) => setTimeout(r, 150));
    const q = query.toLowerCase().trim();

    // Dynamically build index from authoritative master data
    const index = [
      ...MOCK_EMPLOYEES.map((e) => ({
        type: 'employee',
        id: e.id,
        label: e.nama_lengkap_sesuai_KTP,
        meta: `${e.jenis_pekerjaan} — ${e.clientName || 'BARAK'} (${e.NIK})`,
        status: e.status_kerja,
        route: `/ops/master/employees?id=${e.id}`,
      })),
      ...MOCK_CLIENTS.map((c) => ({
        type: 'client',
        id: c.id,
        label: c.name,
        meta: `${c.type} — ${c.city} (PIC: ${c.picName})`,
        status: c.status,
        route: `/ops/master/clients?id=${c.id}`,
      })),
      ...MOCK_LOCATIONS.map((l) => ({
        type: 'location',
        id: l.id,
        label: l.name,
        meta: `${l.address}, ${l.city} (Kuota: ${l.manpowerQuota})`,
        status: l.status,
        route: `/ops/master/locations?id=${l.id}`,
      })),
      ...MOCK_ASSIGNMENTS.map((a) => ({
        type: 'assignment',
        id: a.assignmentCode,
        label: `${a.employeeName} → ${a.locationName}`,
        meta: `Shift: ${a.shiftName} (${a.roleInUnit})`,
        status: a.status,
        route: `/ops/master/assignments?code=${a.assignmentCode}`,
      })),
      // Sample operational records
      { type: 'invoice', id: 'INV-2026-000001', label: 'Invoice JNT LOGISTIK — September 2026', meta: 'Rp 45.000.000', status: STATUS.OPEN, route: '/ops/finance' },
      { type: 'cod_case', id: 'COD-2026-000001', label: 'Kasus COD Kurir JNT', meta: 'Outstanding Rp 2.500.000', status: STATUS.OPEN, route: '/ops/finance' },
      { type: 'legal_case', id: 'CASE-2026-000001', label: 'Kasus Legal Wanprestasi Mitra', meta: 'Divisi Legal', status: STATUS.IN_PROGRESS, route: '/ops/legal' },
      ...MOCK_IT_TICKETS.map((t) => ({
        type: 'it_ticket',
        id: t.id,
        label: `${t.subject} (${t.ticketNumber})`,
        meta: `Pelapor: ${t.requester} · ${t.locationName} · SLA: ${t.priority}`,
        status: t.status,
        route: `/ops/it/tickets`,
      })),
      ...MOCK_IT_ASSETS.map((a) => ({
        type: 'it_asset',
        id: a.id,
        label: `${a.assetName} (${a.assetCode})`,
        meta: `SN: ${a.serialNumber} · Lokasi: ${a.locationName} · ${a.condition}`,
        status: a.status === 'ACTIVE' ? STATUS.ACTIVE : STATUS.IN_PROGRESS,
        route: `/ops/it/assets`,
      })),
      ...MOCK_LEADS.map((l) => ({
        type: 'lead',
        id: l.id,
        label: `${l.companyName} (${l.leadNumber})`,
        meta: `PIC: ${l.picName} · ${l.serviceInterest} · ${l.sourceLabel}`,
        status: l.status,
        route: `/ops/marketing/leads`,
      })),
      ...MOCK_OPPORTUNITIES.map((o) => ({
        type: 'lead',
        id: o.id,
        label: `${o.companyName} (${o.opportunityNumber})`,
        meta: `Pipeline: ${o.stageLabel} · Rp ${(o.monthlyValue || 0).toLocaleString('id-ID')}/bln`,
        status: o.stage === 'WON' ? STATUS.WON : o.stage === 'LOST' ? STATUS.REJECTED : STATUS.IN_PROGRESS,
        route: `/ops/marketing/pipeline`,
      })),
      ...MOCK_ARTICLES.map((art) => ({
        type: 'article',
        id: art.id,
        label: art.title,
        meta: `Kategori: ${art.categoryLabel || art.category} · Oleh: ${art.author}`,
        status: art.status === 'PUBLISHED' ? STATUS.ACTIVE : STATUS.DRAFT,
        route: `/ops/website/articles`,
      })),
      ...MOCK_CAREER_POSTINGS.map((job) => ({
        type: 'career',
        id: job.id,
        label: job.title,
        meta: `${job.location} · Kuota: ${job.manpowerQuota} · ${job.salaryRange}`,
        status: job.status === 'PUBLISHED' ? STATUS.ACTIVE : STATUS.CLOSED,
        route: `/ops/website/careers`,
      })),
      ...MOCK_PENDING_APPROVALS.map((app) => ({
        type: 'approval',
        id: app.id,
        label: app.title,
        meta: `${app.department} · Pemohon: ${app.submittedBy} · ${app.urgencyText}`,
        status: app.status,
        route: `/ops/director/approvals`,
      })),
    ];

    const results = index
      .filter(
        (item) =>
          item.id.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q) ||
          item.meta.toLowerCase().includes(q)
      )
      .slice(0, 25);

    return apiSuccess({
      results,
      query,
      typeLabels: SEARCH_TYPE_LABELS,
    });
  },
};

const restSearch = {
  async search(query) {
    return restClient.get(`/search?q=${encodeURIComponent(query)}`);
  },
};

const searchAdapter = isMockMode() ? mockSearch : restSearch;
export default searchAdapter;
