/**
 * Invoice Service Adapter — PT. BARAK IOMS
 * Source of Truth: PRD Section 14 (Finance Module) & Section 22 (Audit Log).
 */

import apiClient from '@/services/apiClient';
import { MOCK_INVOICES, MOCK_EXPENSES } from '@/services/mock/mockFinanceData';
import { emitAudit } from '@/utils/auditLogger';
import { STATUS } from '@/constants/status';
import { getStoredCollection, saveStoredCollection } from '@/utils/storage';

const isMock = import.meta.env.VITE_API_MODE !== 'rest';

function getInvoicesStore() {
  return getStoredCollection('invoices', () => [...MOCK_INVOICES]);
}

function saveInvoicesStore(invoices) {
  saveStoredCollection('invoices', invoices);
}

function getExpensesStore() {
  return getStoredCollection('finance_expenses', () => [...MOCK_EXPENSES]);
}

function saveExpensesStore(expenses) {
  saveStoredCollection('finance_expenses', expenses);
}


export const invoiceAdapter = {
  async getInvoices({ search = '', status = '', clientId = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...getInvoicesStore()];

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
      const invoices = getInvoicesStore();
      const inv = invoices.find((i) => i.id === id);
      if (!inv) return { data: null, error: { message: 'Faktur tidak ditemukan.' } };
      return { data: { ...inv }, error: null };
    }
    const { data } = await apiClient.get(`/invoices/${id}`);
    return data;
  },

  async createInvoice(payload) {
    if (isMock) {
      const invoices = getInvoicesStore();
      const nextNum = (invoices.length + 1).toString().padStart(3, '0');
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

      saveInvoicesStore([newInvoice, ...invoices]);

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
      const invoices = getInvoicesStore();
      const idx = invoices.findIndex((i) => i.id === invoiceId);
      if (idx === -1) return { data: null, error: { message: 'Faktur tidak ditemukan.' } };

      const inv = invoices[idx];
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

      invoices[idx] = updated;
      saveInvoicesStore(invoices);

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
      const invoices = getInvoicesStore();
      const totalIssued = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
      const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
      const totalOutstanding = invoices.reduce((sum, i) => sum + i.remainingAmount, 0);
      const overdueList = invoices.filter((i) => i.status === STATUS.OVERDUE || (i.remainingAmount > 0 && new Date(i.dueDate) < new Date()));
      const overdueAmount = overdueList.reduce((sum, i) => sum + i.remainingAmount, 0);

      return {
        data: {
          totalIssued,
          totalPaid,
          totalOutstanding,
          overdueAmount,
          overdueCount: overdueList.length,
          unpaidCount: invoices.filter((i) => i.remainingAmount > 0).length,
        },
        error: null,
      };
    }

    const { data } = await apiClient.get('/receivables');
    return data;
  },

  /**
   * Status transitions:
   * DRAFT -> ISSUED -> PARTIALLY_PAID -> PAID, or OVERDUE, VOID
   */
  async updateInvoiceStatus(invoiceId, newStatus, reason = '') {
    if (isMock) {
      const invoices = getInvoicesStore();
      const idx = invoices.findIndex((i) => i.id === invoiceId);
      if (idx === -1) return { data: null, error: { message: 'Faktur tidak ditemukan.' } };

      const oldStatus = invoices[idx].status;
      const updated = {
        ...invoices[idx],
        status: newStatus,
        statusChangedAt: new Date().toISOString(),
        statusChangeReason: reason,
      };

      if (newStatus === STATUS.PAID) {
        updated.remainingAmount = 0;
        updated.paidAmount = updated.totalAmount;
      }

      invoices[idx] = updated;
      saveInvoicesStore(invoices);

      await emitAudit({
        action: 'INVOICE_STATUS_CHANGE',
        module: 'Finance',
        entity: 'Invoice',
        entityId: invoiceId,
        details: { oldStatus, newStatus, reason },
      });

      return { data: updated, error: null };
    }

    const { data } = await apiClient.patch(`/invoices/${invoiceId}/status`, { status: newStatus, reason });
    return data;
  },

  async getExpenses({ search = '', category = '', status = '', page = 1, pageSize = 15 } = {}) {
    if (isMock) {
      let filtered = [...getExpensesStore()];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.expenseNumber.toLowerCase().includes(q) ||
            e.paidTo.toLowerCase().includes(q)
        );
      }

      if (category) filtered = filtered.filter((e) => e.category === category);
      if (status) filtered = filtered.filter((e) => e.status === status);

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      return {
        data: paginated,
        meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
        error: null,
      };
    }

    const { data } = await apiClient.get('/finance/expenses', {
      params: { search, category, status, page, pageSize },
    });
    return data;
  },

  async createExpense(payload) {
    if (isMock) {
      const expenses = getExpensesStore();
      const nextNum = (expenses.length + 1).toString().padStart(3, '0');
      const amount = Number(payload.amount) || 0;

      const newExpense = {
        ...payload,
        id: `EXP-2026-09-${nextNum}`,
        expenseNumber: `EXP/BRK/2026/09/${nextNum}`,
        amount,
        status: payload.status || 'PAID',
        createdAt: new Date().toISOString(),
      };

      saveExpensesStore([newExpense, ...expenses]);

      await emitAudit({
        action: 'EXPENSE_CREATE',
        module: 'Finance',
        entity: 'Expense',
        entityId: newExpense.id,
        details: {
          title: newExpense.title,
          category: newExpense.category,
          amount: newExpense.amount,
        },
      });

      return { data: newExpense, error: null };
    }

    const { data } = await apiClient.post('/finance/expenses', payload);
    return data;
  },

  async getCashFlowSummary() {
    if (isMock) {
      const invoices = getInvoicesStore();
      const expenses = getExpensesStore();

      // Total cash inflow = all paid invoices & payments
      const totalInflow = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);

      // Total cash outflow = expenses + payroll
      const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.status === 'PAID' ? exp.amount : 0), 0);
      const payrollEstimate = 218050000; // Sept 2026 payroll
      const totalOutflow = totalExpenses + payrollEstimate;
      const netCashFlow = totalInflow - totalOutflow;

      return {
        data: {
          totalInflow,
          totalExpenses,
          payrollEstimate,
          totalOutflow,
          netCashFlow,
          pendingExpenses: expenses.filter((e) => e.status === 'PENDING_APPROVAL').length,
          periodLabel: 'September 2026',
        },
        error: null,
      };
    }

    const { data } = await apiClient.get('/finance/cash-flow');
    return data;
  },
};

export default invoiceAdapter;

