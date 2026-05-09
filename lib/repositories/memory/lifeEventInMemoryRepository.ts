import type {
  ライフイベント,
  出産イベント,
  住宅購入イベント,
} from '@/types';
import type { ライフイベントRepository } from '../interfaces/lifeEventRepository';

const seedData: ライフイベント[] = [
  {
    ID: '1',
    ライフプランID: '1',
    イベント種別: '出産',
    イベント年: 2015,
    家族メンバーID: '3',
    作成日: new Date('2024-01-01'),
    更新日: new Date('2024-01-01'),
  } as 出産イベント,
  {
    ID: '2',
    ライフプランID: '1',
    イベント種別: '住宅購入',
    イベント年: 2020,
    住宅価格: 50000000,
    頭金: 10000000,
    ローン返済年数: 35,
    ローン利率: 0.01,
    作成日: new Date('2024-01-01'),
    更新日: new Date('2024-01-01'),
  } as 住宅購入イベント,
];

export class ライフイベントInMemoryRepository implements ライフイベントRepository {
  async ライフプランID別取得(
    ライフプランIDリスト: string[]
  ): Promise<ライフイベント[]> {
    return seedData.filter((e) => ライフプランIDリスト.includes(e.ライフプランID));
  }
}
