import type {
  ライフイベント,
  出産イベント,
  住宅購入イベント,
  入学イベント,
  習い事イベント,
  退職イベント,
} from '@/types';
import type { ライフイベントRepository } from '../interfaces/lifeEventRepository';
import { getSupabaseClient } from '@/lib/supabase';

export class ライフイベントSupabaseRepository implements ライフイベントRepository {
  async ライフプランID別取得(
    ライフプランIDリスト: string[]
  ): Promise<ライフイベント[]> {
    if (ライフプランIDリスト.length === 0) {
      return [];
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('life_events')
      .select('*')
      .in('life_plan_id', ライフプランIDリスト);

    if (error) throw error;

    return (data || []).map((e) => {
      const base = {
        ID: e.id,
        ライフプランID: e.life_plan_id,
        イベント種別: e.event_type as
          | 出産イベント['イベント種別']
          | 住宅購入イベント['イベント種別']
          | 入学イベント['イベント種別']
          | 習い事イベント['イベント種別']
          | 退職イベント['イベント種別'],
        イベント年: e.event_year,
        作成日: new Date(e.created_at),
        更新日: new Date(e.updated_at),
      };

      if (e.event_type === '出産') {
        return {
          ...base,
          イベント種別: '出産' as const,
          家族メンバーID: e.family_member_id,
        } as 出産イベント;
      } else if (e.event_type === '住宅購入') {
        return {
          ...base,
          イベント種別: '住宅購入' as const,
          住宅価格: e.home_price,
          頭金: e.down_payment,
          ローン返済年数: e.loan_years,
          ローン利率: e.loan_rate ? parseFloat(e.loan_rate) : undefined,
        } as 住宅購入イベント;
      } else if (e.event_type === '入学') {
        return {
          ...base,
          イベント種別: '入学' as const,
          学校種別: e.school_type,
          開始年: e.start_year,
          終了年: e.end_year,
          年間入学金: e.annual_admission_fee,
        } as 入学イベント;
      } else if (e.event_type === '習い事') {
        return {
          ...base,
          イベント種別: '習い事' as const,
          開始年: e.start_year,
          終了年: e.end_year,
          月謝: e.monthly_fee,
        } as 習い事イベント;
      } else {
        return {
          ...base,
          イベント種別: '退職' as const,
          退職年: e.event_year,
        } as 退職イベント;
      }
    });
  }
}
