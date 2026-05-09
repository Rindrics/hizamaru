import type { ライフプラン } from '@/types';
import type { ライフプランRepository } from '../interfaces/lifePlanRepository';

const seedData: { [key: string]: ライフプラン[] } = {
  'demo-account': [
    {
      ID: '1',
      アカウントID: 'demo-account',
      名前: 'Basic Scenario',
      説明: 'Basic life plan scenario',
      有効フラグ: true,
      作成日: new Date('2024-01-01'),
      更新日: new Date('2024-01-01'),
    },
    {
      ID: '2',
      アカウントID: 'demo-account',
      名前: 'Comparison Scenario',
      説明: 'Comparison life plan scenario',
      有効フラグ: false,
      作成日: new Date('2024-01-01'),
      更新日: new Date('2024-01-01'),
    },
  ],
};

export class ライフプランInMemoryRepository implements ライフプランRepository {
  async アカウント別取得(アカウントID: string): Promise<ライフプラン[]> {
    return seedData[アカウントID] || [];
  }
}
