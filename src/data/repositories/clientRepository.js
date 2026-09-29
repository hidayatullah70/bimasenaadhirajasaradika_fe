/**
 * Client Repository — PT. BARAK IOMS
 * Source of Truth: PRD Section 9 / Section 15 / Architecture Refactor Step 2.
 */

import { BaseRepository } from './baseRepository';
import { MOCK_CLIENTS } from '@/services/mock/mockMasterData';

export class ClientRepository extends BaseRepository {
  constructor() {
    super('clients', 'CLI', () => [...MOCK_CLIENTS], 'id');
  }

  generateNextId(currentItems = null) {
    const items = currentItems || this.getStore();
    let maxNum = 0;
    items.forEach((c) => {
      const match = (c.id || '').match(/CLI-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `CLI-${(maxNum + 1).toString().padStart(6, '0')}`;
  }
}

export const clientRepository = new ClientRepository();
export default clientRepository;
