/**
 * Shift Repository — PT. BARAK IOMS
 * Source of Truth: PRD Section 11 / Section 13 / Architecture Refactor Step 2.
 */

import { BaseRepository } from './baseRepository';
import { MOCK_SHIFTS } from '@/services/mock/mockMasterData';

export class ShiftRepository extends BaseRepository {
  constructor() {
    super('shifts', 'SH', () => [...MOCK_SHIFTS], 'id');
  }

  generateNextId(currentItems = null) {
    const items = currentItems || this.getStore();
    return `SH-${(items.length + 1).toString().padStart(2, '0')}`;
  }
}

export const shiftRepository = new ShiftRepository();
export default shiftRepository;
