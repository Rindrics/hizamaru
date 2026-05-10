import type { ライフプラン家族メンバー } from './lifePlanRepository';
import type { SupabaseClient } from '@supabase/supabase-js';

export type { ライフプラン家族メンバー };

export interface ライフプランファミリーメンバーRepository {
  ライフプランID別取得(lifePlanId: string): Promise<ライフプラン家族メンバー[]>;
  複数作成(
    supabase: SupabaseClient,
    members: ライフプラン家族メンバー[]
  ): Promise<void>;
}
