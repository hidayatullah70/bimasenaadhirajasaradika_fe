/**
 * Authoritative Avatar Store — PT. BARAK IOMS
 * Centralized, synchronized persistence for user profile pictures / avatars in Mock & Dev modes.
 * Ensures user profile picture uploads immediately and permanently take effect across
 * the Profile page, Topbar header, AppShell, and all associated system modules.
 */

const AVATARS_KEY = 'barak_user_avatars';
let memoryAvatars = {};

/**
 * Retrieve all custom avatars from storage.
 * @returns {Record<string, string>} Map of lowercase username/id to base64 image dataUrl
 */
export function getStoredAvatars() {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(AVATARS_KEY);
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
 * Persist avatar data URL for a specific user identifier (username or ID).
 * @param {string} identifier - Username or user ID
 * @param {string|null} avatarDataUrl - Base64 image data URL or null to remove
 */
export function saveStoredAvatar(identifier, avatarDataUrl) {
  const norm = String(identifier || '').toLowerCase().trim();
  if (!norm) return;

  if (avatarDataUrl) {
    memoryAvatars[norm] = avatarDataUrl;
  } else {
    delete memoryAvatars[norm];
  }

  if (typeof localStorage !== 'undefined') {
    try {
      const current = getStoredAvatars();
      if (avatarDataUrl) {
        current[norm] = avatarDataUrl;
      } else {
        delete current[norm];
      }
      localStorage.setItem(AVATARS_KEY, JSON.stringify(current));
    } catch {
      // ignore
    }
  }
}

/**
 * Get custom avatar data URL for a given user identifier.
 * @param {string} identifier - Username or user ID
 * @returns {string|null}
 */
export function getCustomAvatar(identifier) {
  const norm = String(identifier || '').toLowerCase().trim();
  if (!norm) return null;
  const avatars = getStoredAvatars();
  return avatars[norm] || null;
}

/**
 * Remove stored custom avatar for a user identifier.
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
};
