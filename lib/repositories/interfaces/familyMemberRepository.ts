import type { 家族メンバー, 家族メンバー続柄 } from '@/types';

export interface 家族メンバーRepository {
  アカウント別取得(アカウントID: string): Promise<家族メンバー[]>;
  ID別取得(ID: string): Promise<家族メンバー | null>;
  作成(
    アカウントID: string,
    名前: string,
    生年月日: Date,
    続柄: 家族メンバー続柄
  ): Promise<家族メンバー>;
  更新(
    ID: string,
    名前: string,
    生年月日: Date,
    続柄: 家族メンバー続柄
  ): Promise<家族メンバー>;
  削除(ID: string): Promise<void>;
}
