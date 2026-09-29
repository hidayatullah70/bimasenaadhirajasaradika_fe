/**
 * Centralized Storage Engine — PT. BARAK IOMS
 * Provides namespaced, self-healing, reactive local storage abstraction.
 * Key prefix standard: 'outsourcing_dev_'
 */

export const STORAGE_NAMESPACE = 'outsourcing_dev_';
const LEGACY_PREFIX = 'barak_';

/**
 * Extract unique entity key for deduplication and self-healing.
 */
export function getEntityKey(item) {
  if (!item || typeof item !== 'object') return null;
  return (
    item.id ||
    item.id_karyawan ||
    item.code ||
    item.username ||
    item.ticketNumber ||
    item.incidentNumber ||
    item.requestNumber ||
    item.reportCode ||
    item.pksNumber ||
    item.invoiceNumber ||
    item.leadNumber ||
    null
  );
}

/**
 * Prefix a key with the standard namespace.
 * @param {string} key
 * @returns {string}
 */
export function qualifyKey(key) {
  if (!key) return STORAGE_NAMESPACE;
  if (key.startsWith(STORAGE_NAMESPACE)) return key;
  // If legacy key like 'barak_employees', strip legacy prefix before adding namespace
  if (key.startsWith(LEGACY_PREFIX)) {
    return `${STORAGE_NAMESPACE}${key.slice(LEGACY_PREFIX.length)}`;
  }
  return `${STORAGE_NAMESPACE}${key}`;
}

export const storage = {
  /**
   * Get an item from storage by key.
   * Auto-migrates from legacy 'barak_*' key if namespace key is missing.
   * @param {string} key
   * @param {any} [defaultValue=null]
   * @returns {any}
   */
  get(key, defaultValue = null) {
    if (typeof window === 'undefined') return defaultValue;
    const fullKey = qualifyKey(key);
    try {
      let raw = window.localStorage.getItem(fullKey);

      // Legacy fallback and auto-migration
      if (raw === null) {
        const legacyKey = key.startsWith(LEGACY_PREFIX)
          ? key
          : `${LEGACY_PREFIX}${key.replace(STORAGE_NAMESPACE, '')}`;
        const legacyRaw = window.localStorage.getItem(legacyKey);
        if (legacyRaw !== null) {
          raw = legacyRaw;
          // Persist to modern namespace key
          window.localStorage.setItem(fullKey, legacyRaw);
        }
      }

      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[StorageEngine] Error reading ${fullKey}:`, err);
      return defaultValue;
    }
  },

  /**
   * Save an item to storage.
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    if (typeof window === 'undefined') return;
    const fullKey = qualifyKey(key);
    try {
      const jsonStr = JSON.stringify(value);
      window.localStorage.setItem(fullKey, jsonStr);
      // If a legacy key like 'barak_*' was referenced, keep it synced for backward compatibility
      if (key.startsWith(LEGACY_PREFIX)) {
        window.localStorage.setItem(key, jsonStr);
      }
      // Dispatch storage event for multi-tab and reactive updates
      window.dispatchEvent(
        new CustomEvent('outsourcing_storage_updated', {
          detail: { key: fullKey, baseKey: key },
        })
      );
      // Legacy event dispatch for backward compatibility
      window.dispatchEvent(
        new CustomEvent('barak_storage_updated', {
          detail: { key: fullKey },
        })
      );
    } catch (err) {
      console.error(`[StorageEngine] Error saving ${fullKey}:`, err);
    }
  },

  /**
   * Remove an item from storage.
   * @param {string} key
   */
  remove(key) {
    if (typeof window === 'undefined') return;
    const fullKey = qualifyKey(key);
    try {
      window.localStorage.removeItem(fullKey);
      const legacyKey = `${LEGACY_PREFIX}${key.replace(STORAGE_NAMESPACE, '')}`;
      window.localStorage.removeItem(legacyKey);
    } catch (err) {
      console.error(`[StorageEngine] Error removing ${fullKey}:`, err);
    }
  },

  /**
   * Check if a key exists in storage.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    if (typeof window === 'undefined') return false;
    const fullKey = qualifyKey(key);
    return window.localStorage.getItem(fullKey) !== null;
  },

  /**
   * Get all storage keys belonging to the namespace.
   * @returns {string[]}
   */
  keys() {
    if (typeof window === 'undefined') return [];
    const results = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_NAMESPACE)) {
        results.push(k);
      }
    }
    return results;
  },

  /**
   * Clear namespace keys from storage.
   * @param {boolean} [onlyNamespace=true]
   */
  clear(onlyNamespace = true) {
    if (typeof window === 'undefined') return;
    if (!onlyNamespace) {
      window.localStorage.clear();
      return;
    }
    const namespaceKeys = this.keys();
    for (const k of namespaceKeys) {
      window.localStorage.removeItem(k);
    }
  },

  /**
   * Get a collection with automatic deduplication, self-healing, and factory initialization.
   * @param {string} key
   * @param {Function|Array} defaultDataFactory
   * @returns {Array|object}
   */
  getCollection(key, defaultDataFactory) {
    const fullKey = qualifyKey(key);
    const existing = this.get(fullKey, null);

    if (existing !== null) {
      if (Array.isArray(existing)) {
        const seen = new Set();
        let hasDuplicates = false;
        const sanitized = [];

        for (const item of existing) {
          const entityId = getEntityKey(item);
          if (entityId) {
            if (!seen.has(entityId)) {
              seen.add(entityId);
              sanitized.push(item);
            } else {
              hasDuplicates = true;
            }
          } else {
            sanitized.push(item);
          }
        }

        if (hasDuplicates) {
          this.set(key, sanitized);
        }
        return sanitized;
      }
      return existing;
    }

    // Initialize with default factory
    const defaultData =
      typeof defaultDataFactory === 'function'
        ? defaultDataFactory()
        : defaultDataFactory || [];

    this.set(fullKey, defaultData);
    return defaultData;
  },
};

export default storage;
