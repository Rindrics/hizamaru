import type { 家族メンバー } from '@/types';
import type { 家族メンバーRepository } from '../interfaces/familyMemberRepository';
import { getSupabaseClient } from '@/lib/supabase';

export class 家族メンバーSupabaseRepository implements 家族メンバーRepository {
  async アカウント別取得(アカウントID: string): Promise<家族メンバー[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('account_id', アカウントID);

    if (error) throw error;

    return (data || []).map((m) => ({
      ID: m.id,
      アカウントID: m.account_id,
      名前: m.name,
      生年月日: new Date(m.birth_date),
      続柄: m.relationship,
      作成日: new Date(m.created_at),
    }));
  }
}
