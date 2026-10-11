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
let memoryLastAvatar = null;

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
  'user1': ['usr-009'],
  'user2': ['usr-010'],
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

/**
 * Get the most recently uploaded profile picture across the system.
 * Serves as persistent fallback so user photos never revert to initials after logout.
 * @returns {string|null}
 */
export function getLastUpdatedAvatar() {
  if (memoryLastAvatar) return memoryLastAvatar;
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(LAST_AVATAR_KEY) || localStorage.getItem(NS_LAST_AVATAR_KEY);
      if (stored) {
        memoryLastAvatar = stored;
        return stored;
      }
      // Fallback: check stored avatars dictionary
      const avatars = getStoredAvatars();
      const vals = Object.values(avatars);
      if (vals.length > 0 && vals[vals.length - 1]) {
        memoryLastAvatar = vals[vals.length - 1];
        return memoryLastAvatar;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * Store the latest updated profile picture.
 * @param {string|null} avatarDataUrl
 */
export function setLastUpdatedAvatar(avatarDataUrl) {
  memoryLastAvatar = avatarDataUrl || null;
  if (typeof localStorage !== 'undefined') {
    try {
      if (avatarDataUrl) {
        localStorage.setItem(LAST_AVATAR_KEY, avatarDataUrl);
        localStorage.setItem(NS_LAST_AVATAR_KEY, avatarDataUrl);
      } else {
        localStorage.removeItem(LAST_AVATAR_KEY);
        localStorage.removeItem(NS_LAST_AVATAR_KEY);
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Clear the latest updated profile picture fallback.
 */
export function clearLastUpdatedAvatar() {
  setLastUpdatedAvatar(null);
}

/**
 * Persist avatar data URL for a specific user identifier (username or ID) and its aliases.
 * @param {string} identifier - Username or user ID
 * @param {string|null} avatarDataUrl - Base64 image data URL or null to remove
 */
export function saveStoredAvatar(identifier, avatarDataUrl) {
  const norm = String(identifier || '').toLowerCase().trim();
  if (!norm) return;

  const identifiersToUpdate = new Set([norm]);
  if (ALIAS_MAP[norm]) identifiersToUpdate.add(ALIAS_MAP[norm]);
  if (REVERSE_ALIAS_MAP[norm]) {
    REVERSE_ALIAS_MAP[norm].forEach((a) => identifiersToUpdate.add(a));
  }

  // Update in-memory cache
  identifiersToUpdate.forEach((id) => {
    if (avatarDataUrl) {
      memoryAvatars[id] = avatarDataUrl;
    } else {
      delete memoryAvatars[id];
    }
  });

  // Update latest updated avatar tracking
  if (avatarDataUrl) {
    setLastUpdatedAvatar(avatarDataUrl);
  } else {
    clearLastUpdatedAvatar();
  }

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
          detail: { identifier: norm, avatar: avatarDataUrl || null },
        })
      );
    } catch {
      // ignore
    }
  }
}

/**
 * Get custom avatar data URL for a given user identifier, checking aliases and global latest fallback.
 * @param {string} [identifier] - Username or user ID
 * @returns {string|null}
 */
export function getCustomAvatar(identifier) {
  const norm = String(identifier || '').toLowerCase().trim();
  const avatars = getStoredAvatars();

  if (norm) {
    if (avatars[norm]) return avatars[norm];
    if (ALIAS_MAP[norm] && avatars[ALIAS_MAP[norm]]) return avatars[ALIAS_MAP[norm]];
    if (REVERSE_ALIAS_MAP[norm]) {
      for (const rev of REVERSE_ALIAS_MAP[norm]) {
        if (avatars[rev]) return avatars[rev];
      }
    }
  }

  // Fallback to the latest updated profile picture so avatar never reverts unexpectedly
  const last = getLastUpdatedAvatar();
  if (last) return last;

  return null;
}

/**
 * Remove stored custom avatar for a user identifier and clear the latest fallback.
 * @param {string} identifier
 */
export function removeStoredAvatar(identifier) {
  saveStoredAvatar(identifier, null);
  clearLastUpdatedAvatar();
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
