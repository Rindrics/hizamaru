import type { ライフプラン } from '@/types';

export interface ライフプラン家族メンバー {
  id: string;
  life_plan_id: string;
  family_member_id: string;
  name: string;
  relationship: string;
  income: number;
}

export interface ライフプランRepository {
  アカウント別取得(アカウントID: string): Promise<ライフプラン[]>;
  ID別取得(ID: string): Promise<ライフプラン | null>;
  作成(
    アカウントID: string,
    名前: string,
    説明: string | null
  ): Promise<ライフプラン>;
  更新(
    ID: string,
    名前: string,
    説明: string | null,
    有効フラグ: boolean
  ): Promise<ライフプラン>;
  複製(ID: string): Promise<ライフプラン>;
  メインプラン設定(アカウントID: string, メインプランID: string): Promise<void>;
  削除(ID: string): Promise<void>;
  ライフプランID別家族メンバー取得(lifePlanId: string): Promise<ライフプラン家族メンバー[]>;
}
