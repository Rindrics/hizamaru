import type {
  ライフプラン家族メンバー,
  ライフプランファミリーメンバーRepository,
} from '../interfaces/lifePlanFamilyMemberRepository';
import type { SupabaseClient } from '@supabase/supabase-js';

const lifePlanFamilyMembersData: ライフプラン家族メンバー[] = [];

export class ライフプランファミリーメンバーInMemoryRepository implements ライフプランファミリーメンバーRepository {
  async ライフプランID別取得(
    lifePlanId: string
  ): Promise<ライフプラン家族メンバー[]> {
    return lifePlanFamilyMembersData.filter(
      (fm) => fm.life_plan_id === lifePlanId
    );
  }

  async 複数作成(
    _supabase: SupabaseClient,
    members: ライフプラン家族メンバー[]
  ): Promise<void> {
    if (members.length === 0) return;
    lifePlanFamilyMembersData.push(...members);
  }
}
