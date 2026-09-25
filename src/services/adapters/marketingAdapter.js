/**
 * Marketing Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 15 (Marketing Module), Section 18 (Cross-department workflow), Section 22 (Audit Log).
 */

import apiClient from '@/services/apiClient';
import {
  MOCK_LEADS,
  MOCK_OPPORTUNITIES,
  MOCK_HANDOVERS,
} from '@/services/mock/mockMarketingData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let leadsStore = [...MOCK_LEADS];
let opportunitiesStore = [...MOCK_OPPORTUNITIES];
let handoversStore = [...MOCK_HANDOVERS];

export const marketingAdapter = {
  // ── LEADS ─────────────────────────────────────────────────────────────
  async getLeads({ search = '', source = '', status = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...leadsStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.leadNumber.toLowerCase().includes(q) ||
            l.companyName.toLowerCase().includes(q) ||
            l.picName.toLowerCase().includes(q) ||
            l.phone.toLowerCase().includes(q) ||
            l.assignedSales.toLowerCase().includes(q) ||
            (l.locationCity && l.locationCity.toLowerCase().includes(q))
        );
      }

      if (source) filtered = filtered.filter((l) => l.source === source);
      if (status) filtered = filtered.filter((l) => l.status === status);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/marketing/leads', {
      params: { search, source, status, page, pageSize },
    });
    return data;
  },

  async getLeadById(id) {
    if (isMock) {
      const l = leadsStore.find((item) => item.id === id);
      return { data: l || null, error: l ? null : 'Lead tidak ditemukan' };
    }
    const { data } = await apiClient.get(`/marketing/leads/${id}`);
    return data;
  },

  async createLead(leadData) {
    if (isMock) {
      const newId = `LEAD-2026-${String(leadsStore.length + 1).padStart(6, '0')}`;
      const newNumber = `LEAD/2026/09/${String(leadsStore.length + 1).padStart(3, '0')}`;
      const newLead = {
        id: newId,
        leadNumber: newNumber,
        companyName: leadData.companyName,
        picName: leadData.picName,
        phone: leadData.phone,
        email: leadData.email || '-',
        source: leadData.source || 'WEBSITE',
        sourceLabel: leadData.sourceLabel || leadData.source,
        serviceInterest: leadData.serviceInterest || 'Jasa Pengamanan (Security)',
        estimatedManpower: Number(leadData.estimatedManpower) || 1,
        locationCity: leadData.locationCity || 'Jabodetabek',
        status: leadData.status || STATUS.NEW,
        notes: leadData.notes || '',
        assignedSales: leadData.assignedSales || 'Reza Pratama (Sales Rep)',
        createdAt: new Date().toISOString(),
      };

      leadsStore = [newLead, ...leadsStore];

      emitAudit({
        action: 'LEAD_CREATE',
        module: 'MARKETING',
        targetId: newId,
        details: { leadNumber: newNumber, company: newLead.companyName, source: newLead.source },
      });

      return { data: newLead, error: null };
    }

    const { data } = await apiClient.post('/marketing/leads', leadData);
    return data;
  },

  async updateLeadStatus(id, newStatus, note = '') {
    if (isMock) {
      const index = leadsStore.findIndex((l) => l.id === id);
      if (index === -1) return { data: null, error: 'Lead tidak ditemukan' };

      const oldStatus = leadsStore[index].status;
      leadsStore[index] = {
        ...leadsStore[index],
        status: newStatus,
        notes: note ? `${leadsStore[index].notes ? leadsStore[index].notes + ' | ' : ''}${note}` : leadsStore[index].notes,
        updatedAt: new Date().toISOString(),
      };

      emitAudit({
        action: 'LEAD_STATUS_UPDATE',
        module: 'MARKETING',
        targetId: id,
        details: { fromStatus: oldStatus, toStatus: newStatus, note },
      });

      return { data: leadsStore[index], error: null };
    }

    const { data } = await apiClient.patch(`/marketing/leads/${id}/status`, { status: newStatus, note });
    return data;
  },

  async convertLeadToOpportunity(leadId, oppData) {
    if (isMock) {
      const leadIndex = leadsStore.findIndex((l) => l.id === leadId);
      if (leadIndex === -1) return { data: null, error: 'Lead tidak ditemukan' };

      const lead = leadsStore[leadIndex];
      leadsStore[leadIndex] = {
        ...lead,
        status: STATUS.CONVERTED,
        updatedAt: new Date().toISOString(),
      };

      const newOppId = `OPP-2026-${String(opportunitiesStore.length + 1).padStart(3, '0')}`;
      const newOppNumber = `OPP/BRK/2026/09/${String(opportunitiesStore.length + 1).padStart(3, '0')}`;
      
      const monthlyVal = Number(oppData.monthlyValue) || (Number(lead.estimatedManpower) * 6000000);
      const newOpp = {
        id: newOppId,
        opportunityNumber: newOppNumber,
        leadId: lead.id,
        companyName: lead.companyName,
        picName: lead.picName,
        phone: lead.phone,
        serviceInterest: oppData.serviceInterest || lead.serviceInterest,
        estimatedManpower: Number(oppData.estimatedManpower) || lead.estimatedManpower,
        location: oppData.location || lead.locationCity,
        monthlyValue: monthlyVal,
        annualValue: monthlyVal * 12,
        stage: oppData.stage || 'PROSPECTING',
        stageLabel: oppData.stageLabel || 'Penjajakan Awal & Kebutuhan Klien',
        probability: Number(oppData.probability) || 25,
        expectedCloseDate: oppData.expectedCloseDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        salesOwner: oppData.salesOwner || lead.assignedSales,
        lastActivity: `Dikonversi dari Prospek ${lead.leadNumber} pada ${new Date().toLocaleDateString('id-ID')}`,
        createdAt: new Date().toISOString(),
      };

      opportunitiesStore = [newOpp, ...opportunitiesStore];

      emitAudit({
        action: 'LEAD_CONVERT',
        module: 'MARKETING',
        targetId: leadId,
        details: {
          leadNumber: lead.leadNumber,
          opportunityId: newOppId,
          opportunityNumber: newOppNumber,
          company: lead.companyName,
          value: monthlyVal,
        },
      });

      return { data: { lead: leadsStore[leadIndex], opportunity: newOpp }, error: null };
    }

    const { data } = await apiClient.post(`/marketing/leads/${leadId}/convert`, oppData);
    return data;
  },

  // ── OPPORTUNITIES ──────────────────────────────────────────────────────
  async getOpportunities({ search = '', stage = '', salesOwner = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...opportunitiesStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.opportunityNumber.toLowerCase().includes(q) ||
            o.companyName.toLowerCase().includes(q) ||
            o.picName.toLowerCase().includes(q) ||
            o.serviceInterest.toLowerCase().includes(q) ||
            o.salesOwner.toLowerCase().includes(q)
        );
      }

      if (stage) filtered = filtered.filter((o) => o.stage === stage);
      if (salesOwner) filtered = filtered.filter((o) => o.salesOwner.toLowerCase().includes(salesOwner.toLowerCase()));

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/marketing/opportunities', {
      params: { search, stage, salesOwner, page, pageSize },
    });
    return data;
  },

  async getOpportunityById(id) {
    if (isMock) {
      const opp = opportunitiesStore.find((item) => item.id === id);
      return { data: opp || null, error: opp ? null : 'Opportunity tidak ditemukan' };
    }
    const { data } = await apiClient.get(`/marketing/opportunities/${id}`);
    return data;
  },

  async updateOpportunityStage(id, stage, stageLabel = '', probability = null) {
    if (isMock) {
      const index = opportunitiesStore.findIndex((o) => o.id === id);
      if (index === -1) return { data: null, error: 'Opportunity tidak ditemukan' };

      const opp = opportunitiesStore[index];
      const oldStage = opp.stage;
      
      const probMap = {
        PROSPECTING: 25,
        SURVEY_LOCATION: 40,
        PROPOSAL_SENT: 60,
        NEGOTIATION: 80,
      };

      opportunitiesStore[index] = {
        ...opp,
        stage,
        stageLabel: stageLabel || opp.stageLabel,
        probability: probability !== null ? probability : (probMap[stage] || opp.probability),
        updatedAt: new Date().toISOString(),
      };

      emitAudit({
        action: 'OPPORTUNITY_STAGE_UPDATE',
        module: 'MARKETING',
        targetId: id,
        details: { fromStage: oldStage, toStage: stage, opportunityNumber: opp.opportunityNumber },
      });

      return { data: opportunitiesStore[index], error: null };
    }

    const { data } = await apiClient.patch(`/marketing/opportunities/${id}/stage`, { stage, stageLabel, probability });
    return data;
  },

  async markOpportunityWon(id, handoverData = {}) {
    if (isMock) {
      const index = opportunitiesStore.findIndex((o) => o.id === id);
      if (index === -1) return { data: null, error: 'Opportunity tidak ditemukan' };

      const opp = opportunitiesStore[index];
      const nowIso = new Date().toISOString();
      const todayStr = nowIso.split('T')[0];

      opportunitiesStore[index] = {
        ...opp,
        stage: 'WON',
        stageLabel: 'Deal Menang (Handover Selesai)',
        probability: 100,
        handoverDate: todayStr,
        handoverNotes: handoverData.notes || 'PKS ditandatangani dan diserahterimakan ke Operasional & Finance.',
        updatedAt: nowIso,
      };

      const newHandover = {
        id: `HND-2026-${String(handoversStore.length + 1).padStart(2, '0')}`,
        opportunityId: opp.id,
        companyName: opp.companyName,
        serviceType: opp.serviceInterest,
        manpowerQuota: Number(handoverData.manpowerQuota) || opp.estimatedManpower,
        monthlyBilling: Number(handoverData.monthlyBilling) || opp.monthlyValue,
        billingTerm: handoverData.billingTerm || 'Net 30 Hari',
        handoverDate: todayStr,
        signedContractNumber: handoverData.signedContractNumber || `PKS/BRK-${opp.companyName.substring(0, 3).toUpperCase()}/2026/09/01`,
        operationsPic: handoverData.operationsPic || 'Hadi Suprianto (Korlap Ops)',
        financePic: handoverData.financePic || 'Siti Rahma (Finance Billing)',
        status: 'COMPLETED',
        notes: handoverData.notes || 'Handover klien baru dari tim sales marketing ke divisi Operasional dan Finance.',
      };

      handoversStore = [newHandover, ...handoversStore];

      emitAudit({
        action: 'OPPORTUNITY_WON',
        module: 'MARKETING',
        targetId: id,
        details: {
          opportunityNumber: opp.opportunityNumber,
          company: opp.companyName,
          value: opp.monthlyValue,
          handoverId: newHandover.id,
          contractNumber: newHandover.signedContractNumber,
        },
      });

      return { data: { opportunity: opportunitiesStore[index], handover: newHandover }, error: null };
    }

    const { data } = await apiClient.post(`/marketing/opportunities/${id}/won`, handoverData);
    return data;
  },

  async markOpportunityLost(id, lostReason) {
    if (isMock) {
      const index = opportunitiesStore.findIndex((o) => o.id === id);
      if (index === -1) return { data: null, error: 'Opportunity tidak ditemukan' };

      const opp = opportunitiesStore[index];
      opportunitiesStore[index] = {
        ...opp,
        stage: 'LOST',
        stageLabel: 'Deal Dibatalkan (Lost)',
        probability: 0,
        lostReason: lostReason || 'Alasan tidak disebutkan.',
        updatedAt: new Date().toISOString(),
      };

      emitAudit({
        action: 'OPPORTUNITY_LOST',
        module: 'MARKETING',
        targetId: id,
        details: {
          opportunityNumber: opp.opportunityNumber,
          company: opp.companyName,
          reason: lostReason,
        },
      });

      return { data: opportunitiesStore[index], error: null };
    }

    const { data } = await apiClient.post(`/marketing/opportunities/${id}/lost`, { lostReason });
    return data;
  },

  // ── HANDOVERS ─────────────────────────────────────────────────────────
  async getHandovers({ search = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...handoversStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (h) =>
            h.id.toLowerCase().includes(q) ||
            h.companyName.toLowerCase().includes(q) ||
            h.signedContractNumber.toLowerCase().includes(q) ||
            h.operationsPic.toLowerCase().includes(q) ||
            h.financePic.toLowerCase().includes(q)
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

    const { data } = await apiClient.get('/marketing/handovers', { params: { search, page, pageSize } });
    return data;
  },

  // ── SUMMARY & KPIS ────────────────────────────────────────────────────
  async getMarketingStats() {
    if (isMock) {
      const totalLeads = leadsStore.length;
      const newLeads = leadsStore.filter((l) => l.status === STATUS.NEW).length;
      const contactedLeads = leadsStore.filter((l) => l.status === STATUS.CONTACTED).length;
      const qualifiedLeads = leadsStore.filter((l) => l.status === STATUS.QUALIFIED).length;
      const convertedLeads = leadsStore.filter((l) => l.status === STATUS.CONVERTED).length;

      const totalOpportunities = opportunitiesStore.length;
      const wonOpportunities = opportunitiesStore.filter((o) => o.stage === 'WON');
      const lostOpportunities = opportunitiesStore.filter((o) => o.stage === 'LOST');
      const activeOpportunities = opportunitiesStore.filter(
        (o) => o.stage !== 'WON' && o.stage !== 'LOST'
      );

      const totalPipelineValue = activeOpportunities.reduce((acc, curr) => acc + (curr.monthlyValue || 0), 0);
      const wonValue = wonOpportunities.reduce((acc, curr) => acc + (curr.monthlyValue || 0), 0);
      const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

      // Group leads by source
      const leadsBySource = leadsStore.reduce((acc, curr) => {
        acc[curr.source] = (acc[curr.source] || 0) + 1;
        return acc;
      }, {});

      // Group active opps by stage
      const oppsByStage = activeOpportunities.reduce((acc, curr) => {
        acc[curr.stage] = (acc[curr.stage] || 0) + 1;
        return acc;
      }, {});

      return {
        data: {
          totalLeads,
          newLeads,
          contactedLeads,
          qualifiedLeads,
          convertedLeads,
          conversionRate,
          totalOpportunities,
          activeOpportunitiesCount: activeOpportunities.length,
          wonOpportunitiesCount: wonOpportunities.length,
          lostOpportunitiesCount: lostOpportunities.length,
          totalPipelineValue,
          wonValue,
          totalHandovers: handoversStore.length,
          leadsBySource,
          oppsByStage,
        },
        error: null,
      };
    }

    const { data } = await apiClient.get('/marketing/stats');
    return data;
  },
};
