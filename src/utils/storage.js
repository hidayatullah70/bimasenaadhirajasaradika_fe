/**
 * Authoritative Storage Service for PT. BARAK IOMS
 * Manages localStorage CRUD persistence with 'barak_' key prefix.
 * Ensures data survives page reloads and browser restarts without reverting to initial dummy data.
 */

export function getStoredCollection(key, defaultDataFactory) {
  if (typeof window === 'undefined') {
    return typeof defaultDataFactory === 'function' ? defaultDataFactory() : defaultDataFactory;
  }

  const defaultData = typeof defaultDataFactory === 'function' ? defaultDataFactory() : defaultDataFactory;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Recovery check: if collection was previously truncated by the pagination slice bug
        if (Array.isArray(defaultData) && defaultData.length > parsed.length) {
          const defaultIds = new Set(
            defaultData.map((d) => d.id || d.id_karyawan || d.code || d.username || d.ticketNumber)
          );
          const userCreated = parsed.filter(
            (p) => !defaultIds.has(p.id || p.id_karyawan || p.code || p.username || p.ticketNumber)
          );
          const merged = [...userCreated, ...defaultData];
          window.localStorage.setItem(key, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[Storage] Failed to read ${key}:`, err);
  }

  // First-time seed into localStorage
  try {
    window.localStorage.setItem(key, JSON.stringify(defaultData));
  } catch (err) {
    console.warn(`[Storage] Failed to initialize ${key}:`, err);
  }
  return defaultData;
}

export function saveStoredCollection(key, data) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[Storage] Failed to save ${key}:`, err);
  }
}
