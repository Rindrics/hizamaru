import type { ライフプラン } from '@/types';

export interface ライフプランRepository {
  アカウント別取得(アカウントID: string): Promise<ライフプラン[]>;
}
