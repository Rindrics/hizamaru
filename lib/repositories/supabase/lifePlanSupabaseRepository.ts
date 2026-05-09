import type { ライフプラン } from '@/types';
import type { ライフプランRepository } from '../interfaces/lifePlanRepository';
import { getSupabaseClient } from '@/lib/supabase';

export class ライフプランSupabaseRepository implements ライフプランRepository {
  private mapToEntity(p: Record<string, unknown>): ライフプラン {
    return {
      ID: p.id as string,
      アカウントID: p.account_id as string,
      名前: p.name as string,
      説明: (p.description as string) || null,
      有効フラグ: p.is_active as boolean,
      作成日: new Date(p.created_at as string),
      更新日: new Date(p.updated_at as string),
    };
  }

  async アカウント別取得(アカウントID: string): Promise<ライフプラン[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('life_plans')
      .select('*')
      .eq('account_id', アカウントID);

    if (error) throw error;

    return (data || []).map((p) => this.mapToEntity(p));
  }

  async ID別取得(ID: string): Promise<ライフプラン | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('life_plans')
      .select('*')
      .eq('id', ID)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data ? this.mapToEntity(data) : null;
  }

  async 作成(
    アカウントID: string,
    名前: string,
    説明: string | null
  ): Promise<ライフプラン> {
    const supabase = getSupabaseClient();
    const id = crypto.randomUUID();
    const { data, error } = await supabase
      .from('life_plans')
      .insert({
        id,
        account_id: アカウントID,
        name: 名前,
        description: 説明,
        is_active: false,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async 更新(
    ID: string,
    名前: string,
    説明: string | null,
    有効フラグ: boolean
  ): Promise<ライフプラン> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('life_plans')
      .update({
        name: 名前,
        description: 説明,
        is_active: 有効フラグ,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ID)
      .select()
      .single();

    if (error) throw error;

    return this.mapToEntity(data);
  }

  async メインプラン設定(
    アカウントID: string,
    メインプランID: string
  ): Promise<void> {
    const supabase = getSupabaseClient();

    // Disable all plans in this account
    const { error: disableError } = await supabase
      .from('life_plans')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('account_id', アカウントID);

    if (disableError) throw disableError;

    // Enable the specified plan
    const { error: enableError } = await supabase
      .from('life_plans')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', メインプランID);

    if (enableError) throw enableError;
  }

  async 削除(ID: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('life_plans').delete().eq('id', ID);

    if (error) throw error;
  }
}
