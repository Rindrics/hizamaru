import type {
  ライフプラン家族メンバー,
  ライフプランファミリーメンバーRepository,
} from '../interfaces/lifePlanFamilyMemberRepository';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

export class ライフプランファミリーメンバーSupabaseRepository
  implements ライフプランファミリーメンバーRepository
{
  async ライフプランID別取得(
    lifePlanId: string
  ): Promise<ライフプラン家族メンバー[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('life_plan_family_members')
      .select('*')
      .eq('life_plan_id', lifePlanId);

    if (error && error.code !== 'PGRST116') throw error;

    return (data || []) as ライフプラン家族メンバー[];
  }

  async 複数作成(
    supabase: SupabaseClient,
    members: ライフプラン家族メンバー[]
  ): Promise<void> {
    if (members.length === 0) return;

    const { error } = await supabase
      .from('life_plan_family_members')
      .insert(members);

    // テーブルが存在しない場合のエラーはスキップ
    if (error && error.code !== 'PGRST205') {
      throw error;
    }
  }
}
