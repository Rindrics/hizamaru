import type { 家族メンバー, 家族メンバー続柄 } from '@/types';
import type { 家族メンバーRepository } from '../interfaces/familyMemberRepository';
import { getSupabaseClient } from '@/lib/supabase';

export class 家族メンバーSupabaseRepository implements 家族メンバーRepository {
  private mapToEntity(m: Record<string, unknown>): 家族メンバー {
    return {
      ID: m.id,
      アカウントID: m.account_id,
      名前: m.name,
      生年月日: new Date(m.birth_date),
      続柄: m.relationship,
      作成日: new Date(m.created_at),
    };
  }

  async アカウント別取得(アカウントID: string): Promise<家族メンバー[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('account_id', アカウントID);

    if (error) throw error;

    return (data || []).map(this.mapToEntity);
  }

  async ID別取得(ID: string): Promise<家族メンバー | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('id', ID)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data ? this.mapToEntity(data) : null;
  }

  async 作成(
    アカウントID: string,
    名前: string,
    生年月日: Date,
    続柄: 家族メンバー続柄
  ): Promise<家族メンバー> {
    const supabase = getSupabaseClient();
    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from('family_members')
      .insert({
        id,
        account_id: アカウントID,
        name: 名前,
        birth_date: 生年月日.toISOString().split('T')[0],
        relationship: 続柄,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async 更新(
    ID: string,
    名前: string,
    生年月日: Date,
    続柄: 家族メンバー続柄
  ): Promise<家族メンバー> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('family_members')
      .update({
        name: 名前,
        birth_date: 生年月日.toISOString().split('T')[0],
        relationship: 続柄,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ID)
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async 削除(ID: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', ID);

    if (error) throw error;
  }
}
