/**
 * Invoice Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 14 (Finance Module) & Section 22 (Audit Log).
 */

import apiClient from '@/services/apiClient';
import { MOCK_INVOICES } from '@/services/mock/mockFinanceData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';
let invoicesStore = [...MOCK_INVOICES];

export const invoiceAdapter = {
  async getInvoices({ search = '', status = '', clientId = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...invoicesStore];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (inv) =>
            inv.invoiceNumber.toLowerCase().includes(q) ||
            inv.clientName.toLowerCase().includes(q) ||
            inv.serviceDescription.toLowerCase().includes(q) ||
            inv.billingPeriod.toLowerCase().includes(q)
        );
      }

      if (status) filtered = filtered.filter((inv) => inv.status === status);
      if (clientId) filtered = filtered.filter((inv) => inv.clientId === clientId);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/invoices', {
      params: { search, status, clientId, page, pageSize },
    });
    return data;
  },

  async getInvoiceById(id) {
    if (isMock) {
      const inv = invoicesStore.find((i) => i.id === id);
      if (!inv) return { data: null, error: { message: 'Faktur tidak ditemukan.' } };
      return { data: { ...inv }, error: null };
    }
    const { data } = await apiClient.get(`/invoices/${id}`);
    return data;
  },

  async createInvoice(payload) {
    if (isMock) {
      const nextNum = (invoicesStore.length + 1).toString().padStart(3, '0');
      const subtotal = Number(payload.subtotal) || 0;
      const taxRate = 0.11;
      const taxAmount = Math.round(subtotal * taxRate);
      const totalAmount = subtotal + taxAmount;

      const newInvoice = {
        ...payload,
        id: `INV-2026-09-${nextNum}`,
        invoiceNumber: `INV/BRK/2026/09/${nextNum}`,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        status: STATUS.SENT,
        paymentHistory: [],
        createdAt: new Date().toISOString(),
      };

      invoicesStore = [newInvoice, ...invoicesStore];

      await emitAudit({
        action: 'INVOICE_CREATE',
        module: 'Finance',
        entity: 'Invoice',
        entityId: newInvoice.id,
        details: {
          invoiceNumber: newInvoice.invoiceNumber,
          client: newInvoice.clientName,
          total: totalAmount,
        },
      });

      return { data: newInvoice, error: null };
    }

    const { data } = await apiClient.post('/invoices', payload);
    return data;
  },

  async recordPayment(invoiceId, { amount, paymentMethod, referenceNumber, notes, actorName = 'Siti Rahma (Finance)' }) {
    if (isMock) {
      const idx = invoicesStore.findIndex((i) => i.id === invoiceId);
      if (idx === -1) return { data: null, error: { message: 'Faktur tidak ditemukan.' } };

      const inv = invoicesStore[idx];
      const payAmount = Number(amount) || 0;
      const newPaid = inv.paidAmount + payAmount;
      const newRemaining = Math.max(0, inv.totalAmount - newPaid);
      const newStatus = newRemaining === 0 ? STATUS.PAID : STATUS.PARTIALLY_PAID;

      const paymentRecord = {
        id: `PAY-2026-09-${(inv.paymentHistory.length + 1).toString().padStart(3, '0')}`,
        amount: payAmount,
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentMethod,
        referenceNumber,
        notes,
        receivedBy: actorName,
      };

      const updated = {
        ...inv,
        paidAmount: newPaid,
        remainingAmount: newRemaining,
        status: newStatus,
        paymentHistory: [paymentRecord, ...inv.paymentHistory],
      };

      invoicesStore[idx] = updated;

      await emitAudit({
        action: 'INVOICE_PAYMENT_RECORD',
        module: 'Finance',
        entity: 'Invoice',
        entityId: invoiceId,
        details: {
          paymentAmount: payAmount,
          remaining: newRemaining,
          status: newStatus,
          reference: referenceNumber,
        },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.post(`/invoices/${invoiceId}/payments`, {
      amount,
      paymentMethod,
      referenceNumber,
      notes,
    });
    return data;
  },

  async getReceivablesSummary() {
    if (isMock) {
      const totalIssued = invoicesStore.reduce((sum, i) => sum + i.totalAmount, 0);
      const totalPaid = invoicesStore.reduce((sum, i) => sum + i.paidAmount, 0);
      const totalOutstanding = invoicesStore.reduce((sum, i) => sum + i.remainingAmount, 0);
      const overdueList = invoicesStore.filter((i) => i.status === STATUS.OVERDUE || (i.remainingAmount > 0 && new Date(i.dueDate) < new Date()));
      const overdueAmount = overdueList.reduce((sum, i) => sum + i.remainingAmount, 0);

      return {
        data: {
          totalIssued,
          totalPaid,
          totalOutstanding,
          overdueAmount,
          overdueCount: overdueList.length,
          unpaidCount: invoicesStore.filter((i) => i.remainingAmount > 0).length,
        },
        error: null,
      };
    }

    const { data } = await apiClient.get('/receivables');
    return data;
  },
};

export default invoiceAdapter;
