import type { 家族メンバー } from '@/types';
import type { 家族メンバーRepository } from '../interfaces/familyMemberRepository';

const seedData: { [key: string]: 家族メンバー[] } = {
  'demo-account': [
    {
      ID: '1',
      アカウントID: 'demo-account',
      名前: 'Izanagi',
      生年月日: new Date('1985-04-15'),
      続柄: '夫',
      作成日: new Date('2024-01-01'),
    },
    {
      ID: '2',
      アカウントID: 'demo-account',
      名前: 'Izanami',
      生年月日: new Date('1988-06-20'),
      続柄: '妻',
      作成日: new Date('2024-01-01'),
    },
    {
      ID: '3',
      アカウントID: 'demo-account',
      名前: 'Amaterasu',
      生年月日: new Date('2015-09-10'),
      続柄: '長女',
      作成日: new Date('2024-01-01'),
    },
  ],
};

export class 家族メンバーInMemoryRepository implements 家族メンバーRepository {
  async アカウント別取得(アカウントID: string): Promise<家族メンバー[]> {
    return seedData[アカウントID] || [];
  }
}
