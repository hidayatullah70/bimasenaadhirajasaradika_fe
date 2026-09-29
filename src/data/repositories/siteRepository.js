/**
 * Site / Location Repository — PT. BARAK IOMS
 * Source of Truth: PRD Section 11 / Section 13 / Architecture Refactor Step 2.
 */

import { BaseRepository } from './baseRepository';
import { MOCK_LOCATIONS } from '@/services/mock/mockMasterData';

export class SiteRepository extends BaseRepository {
  constructor() {
    super('sites', 'LOC', () => [...MOCK_LOCATIONS], 'id');
  }

  generateNextId(currentItems = null) {
    const items = currentItems || this.getStore();
    let maxNum = 0;
    items.forEach((l) => {
      const match = (l.id || '').match(/LOC-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `LOC-${(maxNum + 1).toString().padStart(3, '0')}`;
  }

  /**
   * Get all sites associated with a client.
   * @param {string} clientId
   */
  async getByClientId(clientId) {
    return this.list({ filters: { clientId } });
  }
}

export const siteRepository = new SiteRepository();
export default siteRepository;
