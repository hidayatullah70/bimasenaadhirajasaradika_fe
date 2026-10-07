/**
 * Base Repository Abstraction — PT. BARAK IOMS
 * Encapsulates persistence, query, pagination, soft-delete, and ID generation.
 * Source of Truth: PRD Section 20 / Architecture Refactor Step 2.
 */

import { storage } from '@/data/storage/storageEngine';
import { STATUS } from '@/constants/status';

export class BaseRepository {
  /**
   * @param {string} storageKey - Namespaced key or base key (e.g. 'employees')
   * @param {string} idPrefix - E.g. 'BRK-EMP', 'CLI', 'LOC', 'BRK-ASN'
   * @param {Function|Array} defaultDataFactory - Factory function or initial array
   * @param {string} [idField='id'] - Primary key field name
   */
  constructor(storageKey, idPrefix, defaultDataFactory, idField = 'id') {
    this.storageKey = storageKey;
    this.idPrefix = idPrefix;
    this.defaultDataFactory = defaultDataFactory;
    this.idField = idField;
  }

  /**
   * Retrieve active collection from storage.
   * @returns {Array}
   */
  getStore() {
    return storage.getCollection(this.storageKey, this.defaultDataFactory);
  }

  /**
   * Persist collection to storage.
   * @param {Array} data
   */
  saveStore(data) {
    storage.set(this.storageKey, data);
  }

  /**
   * Generate next sequential business ID (e.g. BRK-EMP-041).
   * @param {Array} [currentItems]
   * @param {number} [padLength=3]
   * @returns {string}
   */
  generateNextId(currentItems = null, padLength = 3) {
    const items = currentItems || this.getStore();
    let maxNum = 0;
    const regex = new RegExp(`(?:${this.idPrefix}|[A-Z0-9]+)-?(\\d+)`, 'i');

    items.forEach((item) => {
      const val = item[this.idField] || '';
      const match = String(val).match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNum = (maxNum + 1).toString().padStart(padLength, '0');
    return `${this.idPrefix}-${nextNum}`;
  }

  /**
   * Query records with search, filters, pagination, and sorting.
   * @param {object} [options]
   * @returns {Promise<{ data: Array, meta: object, error: null }>}
   */
  async list({
    search = '',
    filters = {},
    page = 1,
    pageSize = 50,
    sortBy = null,
    sortDir = 'desc',
    includeDeleted = false,
  } = {}) {
    let items = [...this.getStore()];

    // 1. Filter out soft-deleted records unless explicitly included
    if (!includeDeleted) {
      items = items.filter((item) => !item.isDeleted);
    }

    // 2. Apply search across common string fields
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((item) => {
        return Object.values(item).some((val) => {
          if (typeof val === 'string') return val.toLowerCase().includes(q);
          if (typeof val === 'number') return String(val).includes(q);
          return false;
        });
      });
    }

    // 3. Apply exact/predicate filters
    Object.entries(filters).forEach(([key, filterVal]) => {
      if (filterVal !== undefined && filterVal !== null && filterVal !== '') {
        items = items.filter((item) => {
          if (typeof filterVal === 'function') return filterVal(item[key]);
          return String(item[key]) === String(filterVal);
        });
      }
    });

    // 4. Sort if specified
    if (sortBy) {
      items.sort((a, b) => {
        const valA = a[sortBy] ?? '';
        const valB = b[sortBy] ?? '';
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 5. Paginate
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paginated = items.slice(start, start + pageSize);

    return {
      data: paginated,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
      error: null,
    };
  }

  /**
   * Get single item by ID.
   * @param {string} id
   * @returns {Promise<{ data: object|null, error: object|null }>}
   */
  async getById(id) {
    const items = this.getStore();
    const item = items.find((i) => i[this.idField] === id);
    if (!item) {
      return { data: null, error: { message: `Data dengan ID ${id} tidak ditemukan.` } };
    }
    return { data: { ...item }, error: null };
  }

  /**
   * Create a new record.
   * @param {object} payload
   * @returns {Promise<{ data: object, error: null }>}
   */
  async create(payload) {
    const store = this.getStore();
    const newId = payload[this.idField] || this.generateNextId(store);

    const record = {
      ...payload,
      [this.idField]: newId,
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    };

    // Prepend to front of collection
    const nextStore = [record, ...store];
    this.saveStore(nextStore);

    return { data: record, error: null };
  }

  /**
   * Update an existing record in place.
   * @param {string} id
   * @param {object} payload
   * @returns {Promise<{ data: object|null, error: object|null }>}
   */
  async update(id, payload) {
    const store = this.getStore();
    const idx = store.findIndex((i) => i[this.idField] === id);
    if (idx === -1) {
      return { data: null, error: { message: `Data dengan ID ${id} tidak ditemukan.` } };
    }

    const updated = {
      ...store[idx],
      ...payload,
      [this.idField]: id, // Primary key is immutable
      updatedAt: new Date().toISOString(),
    };

    const nextStore = [...store];
    nextStore[idx] = updated;
    this.saveStore(nextStore);

    return { data: updated, error: null };
  }

  /**
   * Soft-delete a record.
   * @param {string} id
   * @param {{ deletedBy?: string, reason?: string }} [opts]
   * @returns {Promise<{ data: object|null, error: object|null }>}
   */
  async softDelete(id, { deletedBy = 'System User', reason = 'Penonaktifan data' } = {}) {
    return this.update(id, {
      isDeleted: true,
      status: STATUS.INACTIVE,
      deletedAt: new Date().toISOString(),
      deletedBy,
      deleteReason: reason,
    });
  }

  /**
   * Submit a delete request for Direktur approval rather than deleting directly.
   * @param {string} id
   * @param {{ reason: string, requestedBy: string, entityLabel?: string }} options
   * @returns {Promise<{ data: object, error: null }>}
   */
  async requestDelete(id, { reason, requestedBy, entityLabel = '' }) {
    const { data: item } = await this.getById(id);
    const label = entityLabel || item?.name || item?.nama_lengkap_sesuai_KTP || id;

    const deleteRequest = {
      id: `DEL-REQ-${Date.now().toString().slice(-6)}`,
      entityType: this.idPrefix,
      storageKey: this.storageKey,
      recordId: id,
      recordIdentifier: `${label} (${id})`,
      reason: reason || 'Permohonan penghapusan data operasional.',
      requestedBy: requestedBy || 'Staff Operasional',
      requestedAt: new Date().toISOString(),
      status: STATUS.PENDING_APPROVAL || 'PENDING',
    };

    // Store into delete requests repository
    const requests = storage.getCollection('delete_requests', () => []);
    storage.set('delete_requests', [deleteRequest, ...requests]);

    return {
      data: {
        success: true,
        pendingApproval: true,
        requestId: deleteRequest.id,
        message: 'Permohonan penghapusan telah diajukan ke Direktur Utama untuk disetujui.',
      },
      error: null,
    };
  }

  /**
   * Permanent hard deletion (restricted for test cleanup or administrative purge).
   * @param {string} id
   * @returns {Promise<{ data: object, error: null }>}
   */
  async hardDelete(id) {
    const store = this.getStore();
    const nextStore = store.filter((item) => item[this.idField] !== id);
    this.saveStore(nextStore);
    return { data: { success: true, hardDeleted: true }, error: null };
  }
}

export default BaseRepository;
