/**
 * Authoritative Storage Service for PT. BARAK IOMS
 * Backward-compatible bridge to central storageEngine.
 * Source of Truth: PRD Section 20 / Architecture Refactor Step 2.
 */

import { storage, getEntityKey as baseGetEntityKey } from '@/data/storage/storageEngine';

export const getEntityKey = baseGetEntityKey;

export function getStoredCollection(key, defaultDataFactory) {
  return storage.getCollection(key, defaultDataFactory);
}

export function saveStoredCollection(key, data) {
  storage.set(key, data);
}

export { storage };
export default storage;

