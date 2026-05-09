'use server';

import type {
  ライフプラン,
  家族メンバー,
  ライフイベント,
  出産イベント,
  住宅購入イベント,
  入学イベント,
  習い事イベント,
  退職イベント,
} from '@/types';
import { supabase } from '@/lib/supabase';

export async function fetchDemoData() {
  try {
    const { data: familyMembers, error: familyError } = await supabase
      .from('family_members')
      .select('*')
      .eq('account_id', 'demo-account');

    console.log('familyMembers query:', { familyMembers, familyError });

    if (familyError) throw familyError;

    const { data: lifePlans, error: plansError } = await supabase
      .from('life_plans')
      .select('*')
      .eq('account_id', 'demo-account');

    if (plansError) throw plansError;

    const { data: lifeEvents, error: eventsError } = await supabase
      .from('life_events')
      .select('*')
      .in('life_plan_id', lifePlans?.map((p) => p.id) || []);

    if (eventsError) throw eventsError;

    const typedFamilyMembers: 家族メンバー[] = (familyMembers || []).map(
      (m) => ({
        ID: m.id,
        アカウントID: m.account_id,
        名前: m.name,
        生年月日: new Date(m.birth_date),
        続柄: m.relationship,
        作成日: new Date(m.created_at),
      })
    );

    const typedLifePlans: ライフプラン[] = (lifePlans || []).map((p) => ({
      ID: p.id,
      アカウントID: p.account_id,
      名前: p.name,
      説明: p.description,
      有効フラグ: p.is_active,
      作成日: new Date(p.created_at),
      更新日: new Date(p.updated_at),
    }));

    const typedLifeEvents: ライフイベント[] = (lifeEvents || []).map((e) => {
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

    console.log('fetchDemoData result:', {
      familyMembers: typedFamilyMembers,
      lifePlans: typedLifePlans,
      lifeEvents: typedLifeEvents,
    });

    return {
      familyMembers: typedFamilyMembers,
      lifePlans: typedLifePlans,
      lifeEvents: typedLifeEvents,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Failed to fetch demo data:', errorMessage);
    throw new Error(`Failed to fetch demo data: ${errorMessage}`);
  }
}
