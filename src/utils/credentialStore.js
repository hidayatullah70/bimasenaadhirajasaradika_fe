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

const CREDENTIAL_ALIASES = {
  'direktur': ['direkturutama', 'usr-001', 'juli.priyanto'],
  'direkturutama': ['direktur', 'usr-001', 'juli.priyanto'],
  'usr-001': ['direktur', 'direkturutama', 'juli.priyanto'],
  'juli.priyanto': ['direktur', 'direkturutama', 'usr-001'],
  'hrd': ['zaenal.arifin', 'usr-002'],
  'usr-002': ['hrd', 'zaenal.arifin'],
  'legal': ['robyn.topani', 'usr-003'],
  'usr-003': ['legal', 'robyn.topani'],
  'operasional': ['ops', 'nazi.rinaldi.ops', 'usr-004'],
  'usr-004': ['operasional', 'ops', 'nazi.rinaldi.ops'],
  'finance': ['keuangan', 'nazi.rinaldi.fin', 'usr-005'],
  'usr-005': ['finance', 'keuangan', 'nazi.rinaldi.fin'],
  'marketing': ['hendri.nopamin', 'usr-006'],
  'usr-006': ['marketing', 'hendri.nopamin'],
  'itsupport': ['it', 'gheril.ramaditya', 'usr-007'],
  'usr-007': ['itsupport', 'it', 'gheril.ramaditya'],
  'adminweb': ['hidayatullah', 'usr-008'],
  'usr-008': ['adminweb', 'hidayatullah'],
  'pic': ['pic_jnt', 'usr-011'],
  'usr-011': ['pic', 'pic_jnt'],
};

/**
 * Persist password for a specific user identifier (username or ID).
 * @param {string} identifier - Username or user ID
 * @param {string} password - The new password
 */
export function saveStoredPassword(identifier, password) {
  const norm = String(identifier || '').toLowerCase().trim();
  const cleanPw = String(password || '').trim();
  if (!norm || !cleanPw) return;

  const aliases = CREDENTIAL_ALIASES[norm] || [];
  const targets = [norm, ...aliases];

  targets.forEach((t) => {
    memoryCredentials[t] = cleanPw;
  });

  if (typeof localStorage !== 'undefined') {
    try {
      const current = getStoredPasswords();
      targets.forEach((t) => {
        current[t] = cleanPw;
      });
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
  if (passwords[norm]) return passwords[norm];

  const aliases = CREDENTIAL_ALIASES[norm] || [];
  for (const a of aliases) {
    if (passwords[a]) return passwords[a];
  }
  return null;
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
