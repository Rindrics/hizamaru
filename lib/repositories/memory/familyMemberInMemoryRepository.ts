import type { 家族メンバー, 家族メンバー続柄 } from '@/types';
import type { 家族メンバーRepository } from '../interfaces/familyMemberRepository';

const seedData: { [key: string]: 家族メンバー[] } = {};

export class 家族メンバーInMemoryRepository implements 家族メンバーRepository {
  async アカウント別取得(アカウントID: string): Promise<家族メンバー[]> {
    return seedData[アカウントID] || [];
  }

  async ID別取得(ID: string): Promise<家族メンバー | null> {
    for (const members of Object.values(seedData)) {
      const found = members.find((m) => m.ID === ID);
      if (found) return found;
    }
    return null;
  }

  async 作成(
    アカウントID: string,
    名前: string,
    生年月日: Date,
    続柄: 家族メンバー続柄
  ): Promise<家族メンバー> {
    const id = crypto.randomUUID();
    const newMember: 家族メンバー = {
      ID: id,
      アカウントID,
      名前,
      生年月日,
      続柄,
      作成日: new Date(),
    };
    if (!seedData[アカウントID]) {
      seedData[アカウントID] = [];
    }
    seedData[アカウントID].push(newMember);
    return newMember;
  }

  async 更新(
    ID: string,
    名前: string,
    生年月日: Date,
    続柄: 家族メンバー続柄
  ): Promise<家族メンバー> {
    for (const members of Object.values(seedData)) {
      const index = members.findIndex((m) => m.ID === ID);
      if (index !== -1) {
        members[index] = {
          ...members[index],
          名前,
          生年月日,
          続柄,
        };
        return members[index];
      }
    }
    throw new Error(`家族メンバーが見つかりません: ${ID}`);
  }

  async 削除(ID: string): Promise<void> {
    for (const accountId of Object.keys(seedData)) {
      const originalLength = seedData[accountId].length;
      seedData[accountId] = seedData[accountId].filter((m) => m.ID !== ID);
      if (seedData[accountId].length < originalLength) {
        return;
      }
    }
    throw new Error(`家族メンバーが見つかりません: ${ID}`);
  }
}
