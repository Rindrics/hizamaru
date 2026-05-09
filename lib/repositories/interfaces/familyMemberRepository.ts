import type { 家族メンバー } from '@/types';

export interface 家族メンバーRepository {
  アカウント別取得(アカウントID: string): Promise<家族メンバー[]>;
}
