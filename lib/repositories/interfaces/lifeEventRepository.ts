import type { ライフイベント } from '@/types';

export interface ライフイベントRepository {
  ライフプランID別取得(
    ライフプランIDリスト: string[]
  ): Promise<ライフイベント[]>;
}
