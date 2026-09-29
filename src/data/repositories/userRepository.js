/**
 * User Repository — PT. BARAK IOMS
 * Source of Truth: PRD Section 6 / Section 19 / Architecture Refactor Step 2.
 */

import { BaseRepository } from './baseRepository';
import { MOCK_SYSTEM_USERS } from '@/services/mock/mockMasterData';

export class UserRepository extends BaseRepository {
  constructor() {
    super('users', 'USR', () => [...MOCK_SYSTEM_USERS], 'id');
  }

  generateNextId(currentItems = null) {
    const items = currentItems || this.getStore();
    let maxNum = 0;
    items.forEach((u) => {
      const match = (u.id || '').match(/USR-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    return `USR-${(maxNum + 1).toString().padStart(3, '0')}`;
  }
}

export const userRepository = new UserRepository();
export default userRepository;
