/**
 * Authoritative Credential Store — PT. BARAK IOMS
 * Centralized, synchronized persistence for user passwords in Mock & Dev modes.
 * Ensures password changes in Profile Page & Admin User Management
 * immediately and permanently take effect across all login channels.
 */

const CREDENTIALS_KEY = 'barak_custom_passwords';
let memoryCredentials = {};

/**
 * Retrieve all custom credentials from storage.
 * @returns {Record<string, string>} Map of lowercase username/id to plain/hashed password
 */
export function getStoredPasswords() {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(CREDENTIALS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { ...memoryCredentials, ...parsed };
        }
      }
    } catch {
      // ignore JSON parse or access error
    }
  }
  return { ...memoryCredentials };
}

/**
 * Persist password for a specific user identifier (username or ID).
 * @param {string} identifier - Username or user ID
 * @param {string} password - The new password
 */
export function saveStoredPassword(identifier, password) {
  const norm = String(identifier || '').toLowerCase().trim();
  const cleanPw = String(password || '').trim();
  if (!norm || !cleanPw) return;

  memoryCredentials[norm] = cleanPw;

  if (typeof localStorage !== 'undefined') {
    try {
      const current = getStoredPasswords();
      current[norm] = cleanPw;
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }
  }
}

/**
 * Get custom password for a given user identifier.
 * @param {string} identifier - Username or user ID
 * @returns {string|null}
 */
export function getCustomPassword(identifier) {
  const norm = String(identifier || '').toLowerCase().trim();
  if (!norm) return null;
  const passwords = getStoredPasswords();
  return passwords[norm] || null;
}

/**
 * Remove stored custom password (reset to default mock).
 * @param {string} identifier
 */
export function removeStoredPassword(identifier) {
  const norm = String(identifier || '').toLowerCase().trim();
  if (!norm) return;
  delete memoryCredentials[norm];
  if (typeof localStorage !== 'undefined') {
    try {
      const current = getStoredPasswords();
      delete current[norm];
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }
  }
}

export default {
  getStoredPasswords,
  saveStoredPassword,
  getCustomPassword,
  removeStoredPassword,
};
