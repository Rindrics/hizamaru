import type { ライフプラン } from '@/types';
import type { ライフプランRepository } from '../interfaces/lifePlanRepository';
import { getSupabaseClient } from '@/lib/supabase';

export class ライフプランSupabaseRepository implements ライフプランRepository {
  async アカウント別取得(アカウントID: string): Promise<ライフプラン[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('life_plans')
      .select('*')
      .eq('account_id', アカウントID);

    if (error) throw error;

    return (data || []).map((p) => ({
      ID: p.id,
      アカウントID: p.account_id,
      名前: p.name,
      説明: p.description,
      有効フラグ: p.is_active,
      作成日: new Date(p.created_at),
      更新日: new Date(p.updated_at),
    }));
  }
}
