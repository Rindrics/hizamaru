import type { ライフプラン } from '@/types';
import type { ライフプランRepository, ライフプラン家族メンバー } from '../interfaces/lifePlanRepository';
import { 家族メンバーRepo } from '../index';

const seedData: { [key: string]: ライフプラン[] } = {};
const lifePlanFamilyMembersData: ライフプラン家族メンバー[] = [];

export class ライフプランInMemoryRepository implements ライフプランRepository {
  async アカウント別取得(アカウントID: string): Promise<ライフプラン[]> {
    return seedData[アカウントID] || [];
  }

  async ID別取得(ID: string): Promise<ライフプラン | null> {
    for (const plans of Object.values(seedData)) {
      const plan = plans.find((p) => p.ID === ID);
      if (plan) return plan;
    }
    return null;
  }

  async 作成(
    アカウントID: string,
    名前: string,
    説明: string | null
  ): Promise<ライフプラン> {
    if (!seedData[アカウントID]) {
      seedData[アカウントID] = [];
    }

    const newPlan: ライフプラン = {
      ID: crypto.randomUUID(),
      アカウントID,
      名前,
      説明,
      有効フラグ: false,
      作成日: new Date(),
      更新日: new Date(),
    };

    seedData[アカウントID].push(newPlan);
    return newPlan;
  }

  async 更新(
    ID: string,
    名前: string,
    説明: string | null,
    有効フラグ: boolean
  ): Promise<ライフプラン> {
    for (const plans of Object.values(seedData)) {
      const index = plans.findIndex((p) => p.ID === ID);
      if (index !== -1) {
        const updated: ライフプラン = {
          ...plans[index],
          名前,
          説明,
          有効フラグ,
          更新日: new Date(),
        };
        plans[index] = updated;
        return updated;
      }
    }
    throw new Error(`Life plan not found: ${ID}`);
  }

  async メインプラン設定(
    アカウントID: string,
    メインプランID: string
  ): Promise<void> {
    if (!seedData[アカウントID]) return;

    // Disable all plans in this account
    seedData[アカウントID] = seedData[アカウントID].map((p) => ({
      ...p,
      有効フラグ: false,
    }));

    // Enable the specified plan
    const index = seedData[アカウントID].findIndex(
      (p) => p.ID === メインプランID
    );
    if (index !== -1) {
      seedData[アカウントID][index] = {
        ...seedData[アカウントID][index],
        有効フラグ: true,
      };
    }
  }

  async 削除(ID: string): Promise<void> {
    for (const accountId of Object.keys(seedData)) {
      seedData[accountId] = seedData[accountId].filter((p) => p.ID !== ID);
    }
    // Clean up associated family members
    const index = lifePlanFamilyMembersData.findIndex((fm) => fm.life_plan_id === ID);
    if (index !== -1) {
      lifePlanFamilyMembersData.splice(index, 1);
    }
  }

  async ライフプランID別家族メンバー取得(lifePlanId: string): Promise<ライフプラン家族メンバー[]> {
    return lifePlanFamilyMembersData.filter((fm) => fm.life_plan_id === lifePlanId);
  }

  async 複製(ID: string): Promise<ライフプラン> {
    let original: ライフプラン | null = null;
    for (const plans of Object.values(seedData)) {
      const plan = plans.find((p) => p.ID === ID);
      if (plan) {
        original = plan;
        break;
      }
    }

    if (!original) {
      throw new Error(`Life plan not found: ${ID}`);
    }

    const newPlan: ライフプラン = {
      ID: crypto.randomUUID(),
      アカウントID: original.アカウントID,
      名前: `${original.名前} (コピー)`,
      説明: original.説明,
      有効フラグ: false,
      作成日: new Date(),
      更新日: new Date(),
    };

    if (!seedData[original.アカウントID]) {
      seedData[original.アカウントID] = [];
    }

    seedData[original.アカウントID].push(newPlan);
    return newPlan;
  }
}
