/**
 * Authoritative Avatar Store — PT. BARAK IOMS
 * Centralized, synchronized persistence for user profile pictures / avatars in Mock & Dev modes.
 * Ensures user profile picture uploads immediately and permanently take effect across
 * the Profile page, Topbar header, AppShell, and all associated system modules,
 * and persists reliably across logout, page reload, and session switches.
 */

const AVATARS_KEY = 'barak_user_avatars';
const LAST_AVATAR_KEY = 'barak_last_updated_avatar';
const NS_AVATARS_KEY = 'outsourcing_dev_user_avatars';
const NS_LAST_AVATAR_KEY = 'outsourcing_dev_last_avatar';

let memoryAvatars = {};

const ALIAS_MAP = {
  'direktur': 'direkturutama',
  'juli.priyanto': 'direkturutama',
  'zaenal.arifin': 'hrd',
  'robyn.topani': 'legal',
  'nazi.rinaldi.ops': 'operasional',
  'ops': 'operasional',
  'nazi.rinaldi.fin': 'finance',
  'keuangan': 'finance',
  'hendri.nopamin': 'marketing',
  'gheril.ramaditya': 'itsupport',
  'it': 'itsupport',
  'hidayatullah': 'adminweb',
  'pic_jnt': 'pic',
};

const REVERSE_ALIAS_MAP = {
  'direkturutama': ['juli.priyanto', 'direktur', 'usr-001'],
  'hrd': ['zaenal.arifin', 'usr-002'],
  'legal': ['robyn.topani', 'usr-003'],
  'operasional': ['nazi.rinaldi.ops', 'ops', 'usr-004'],
  'finance': ['nazi.rinaldi.fin', 'keuangan', 'usr-005'],
  'marketing': ['hendri.nopamin', 'usr-006'],
  'itsupport': ['gheril.ramaditya', 'it', 'usr-007'],
  'adminweb': ['hidayatullah', 'usr-008'],
  'user1': ['admin01', 'usr-009'],
  'user2': ['admin02', 'usr-010'],
  'pic': ['pic_jnt', 'usr-011'],
};

/**
 * Retrieve all custom avatars from storage.
 * @returns {Record<string, string>} Map of lowercase username/id to base64 image dataUrl
 */
export function getStoredAvatars() {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(AVATARS_KEY) || localStorage.getItem(NS_AVATARS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { ...memoryAvatars, ...parsed };
        }
      }
    } catch {
      // ignore
    }
  }
  return { ...memoryAvatars };
}

// Purge any legacy global avatar fallback to prevent cross-contamination between different accounts
if (typeof localStorage !== 'undefined') {
  try {
    localStorage.removeItem(LAST_AVATAR_KEY);
    localStorage.removeItem(NS_LAST_AVATAR_KEY);
  } catch {
    // ignore
  }
}

/**
 * Deprecated global fallback — returns null to guarantee strictly isolated per-user avatars.
 * @returns {null}
 */
export function getLastUpdatedAvatar() {
  return null;
}

export function setLastUpdatedAvatar() {
  // No-op to prevent cross-user avatar contamination
}

export function clearLastUpdatedAvatar() {
  // No-op
}

/**
 * Persist avatar data URL for a specific user identifier (username or ID) and its aliases.
 * @param {string} identifier - Username or user ID
 * @param {string|null} avatarDataUrl - Base64 image data URL or null to remove
 */
export function saveStoredAvatar(identifier, avatarDataUrl) {
  const norm = String(identifier || '').toLowerCase().trim();
  if (!norm) return;

  const canonical = ALIAS_MAP[norm] || norm;
  const identifiersToUpdate = new Set([norm, canonical]);
  if (REVERSE_ALIAS_MAP[canonical]) {
    REVERSE_ALIAS_MAP[canonical].forEach((a) => identifiersToUpdate.add(a));
  }

  // Update in-memory cache
  identifiersToUpdate.forEach((id) => {
    if (avatarDataUrl) {
      memoryAvatars[id] = avatarDataUrl;
    } else {
      delete memoryAvatars[id];
    }
  });

  // Persist to localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const current = getStoredAvatars();
      identifiersToUpdate.forEach((id) => {
        if (avatarDataUrl) {
          current[id] = avatarDataUrl;
        } else {
          delete current[id];
        }
      });
      const serialized = JSON.stringify(current);
      localStorage.setItem(AVATARS_KEY, serialized);
      localStorage.setItem(NS_AVATARS_KEY, serialized);
    } catch {
      // ignore
    }
  }

  // Dispatch custom event for real-time synchronization across UI components
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('barak:avatar-updated', {
          detail: { identifier: norm, canonical, avatar: avatarDataUrl || null },
        })
      );
    } catch {
      // ignore
    }
  }
}

/**
 * Get custom avatar data URL for a given user identifier, checking aliases strictly without fallback to other users.
 * @param {string} [identifier] - Username or user ID
 * @returns {string|null}
 */
export function getCustomAvatar(identifier) {
  const norm = String(identifier || '').toLowerCase().trim();
  if (!norm) return null;

  const avatars = getStoredAvatars();
  if (avatars[norm]) return avatars[norm];

  const canonical = ALIAS_MAP[norm] || norm;
  if (avatars[canonical]) return avatars[canonical];

  if (REVERSE_ALIAS_MAP[canonical]) {
    for (const alias of REVERSE_ALIAS_MAP[canonical]) {
      if (avatars[alias]) return avatars[alias];
    }
  }

  return null;
}

/**
 * Remove stored custom avatar for a user identifier and its aliases.
 * @param {string} identifier
 */
export function removeStoredAvatar(identifier) {
  saveStoredAvatar(identifier, null);
}

export default {
  getStoredAvatars,
  saveStoredAvatar,
  getCustomAvatar,
  removeStoredAvatar,
  getLastUpdatedAvatar,
  setLastUpdatedAvatar,
  clearLastUpdatedAvatar,
};
