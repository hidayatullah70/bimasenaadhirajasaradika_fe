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
    if (raw !== null && raw !== 'undefined' && raw !== 'null' && raw !== '') {
      const parsed = JSON.parse(raw);
      if (parsed !== undefined && parsed !== null) {
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
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error(`[Storage] Failed to save ${key}:`, err);
  }
}
