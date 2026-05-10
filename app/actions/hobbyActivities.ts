'use server';

import { revalidatePath } from 'next/cache';
import { getDbServerClient } from '@/lib/db';
import { logger } from '@/lib/logger';

async function getAccountId() {
  const supabase = await getDbServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: userData } = await supabase
    .from('users')
    .select('account_id')
    .eq('id', user.id)
    .single();
  if (!userData) throw new Error('User not found');

  return userData.account_id;
}

async function verifyLifePlanOwnership(lifePlanId: string, accountId: string) {
  const supabase = await getDbServerClient();
  const { data } = await supabase
    .from('life_plans')
    .select('id')
    .eq('id', lifePlanId)
    .eq('account_id', accountId)
    .single();
  if (!data) throw new Error('Life plan not found or access denied');
}

export async function 習い事追加(
  lifePlanId: string,
  familyMemberId: string,
  _prevState: unknown,
  formData: FormData
) {
  try {
    const supabase = await getDbServerClient();
    const accountId = await getAccountId();
    await verifyLifePlanOwnership(lifePlanId, accountId);

    const name = formData.get('name') as string;
    const monthlyFee = parseInt(formData.get('monthly_fee') as string);
    const startYear = parseInt(formData.get('start_year') as string);
    const endYear = formData.get('end_year')
      ? parseInt(formData.get('end_year') as string)
      : null;

    const id = crypto.randomUUID();
    const { error } = await supabase.from('hobby_activities').insert({
      id,
      life_plan_id: lifePlanId,
      family_member_id: familyMemberId,
      name,
      monthly_fee: monthlyFee,
      start_year: startYear,
      end_year: endYear,
    });

    if (error) {
      logger.error('Failed to create hobby activity', {
        lifePlanId,
        familyMemberId,
        error: error.message,
      });
      return { 成功: false, エラー: '習い事の追加に失敗しました' };
    }

    revalidatePath(`/life-plans/${lifePlanId}/edit`);

    const { data: newRecord } = await supabase
      .from('hobby_activities')
      .select('*')
      .eq('id', id)
      .single();

    return { 成功: true, データ: newRecord };
  } catch (err) {
    logger.error('Error in 習い事追加', { error: err });
    return { 成功: false, エラー: '習い事の追加に失敗しました' };
  }
}

export async function 習い事更新(
  hobbyActivityId: string,
  _prevState: unknown,
  formData: FormData
) {
  try {
    const supabase = await getDbServerClient();
    const accountId = await getAccountId();

    const { data: activity } = await supabase
      .from('hobby_activities')
      .select('life_plan_id')
      .eq('id', hobbyActivityId)
      .single();
    if (!activity) throw new Error('Hobby activity not found');

    await verifyLifePlanOwnership(activity.life_plan_id, accountId);

    const name = formData.get('name') as string;
    const monthlyFee = parseInt(formData.get('monthly_fee') as string);
    const startYear = parseInt(formData.get('start_year') as string);
    const endYear = formData.get('end_year')
      ? parseInt(formData.get('end_year') as string)
      : null;

    const { error } = await supabase
      .from('hobby_activities')
      .update({
        name,
        monthly_fee: monthlyFee,
        start_year: startYear,
        end_year: endYear,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hobbyActivityId);

    if (error) {
      logger.error('Failed to update hobby activity', {
        hobbyActivityId,
        error: error.message,
      });
      return { 成功: false, エラー: '習い事の更新に失敗しました' };
    }

    revalidatePath(`/life-plans/${activity.life_plan_id}/edit`);

    const { data: updatedRecord } = await supabase
      .from('hobby_activities')
      .select('*')
      .eq('id', hobbyActivityId)
      .single();

    return { 成功: true, データ: updatedRecord };
  } catch (err) {
    logger.error('Error in 習い事更新', { error: err });
    return { 成功: false, エラー: '習い事の更新に失敗しました' };
  }
}

export async function 習い事削除(hobbyActivityId: string) {
  try {
    const supabase = await getDbServerClient();
    const accountId = await getAccountId();

    const { data: activity } = await supabase
      .from('hobby_activities')
      .select('life_plan_id')
      .eq('id', hobbyActivityId)
      .single();
    if (!activity) throw new Error('Hobby activity not found');

    await verifyLifePlanOwnership(activity.life_plan_id, accountId);

    const { error } = await supabase
      .from('hobby_activities')
      .delete()
      .eq('id', hobbyActivityId);

    if (error) throw error;

    revalidatePath(`/life-plans/${activity.life_plan_id}/edit`);
  } catch (err) {
    logger.error('Error in 習い事削除', { error: err });
    throw err;
  }
}

export async function 年次費用追加(
  hobbyActivityId: string,
  lifePlanId: string,
  _prevState: unknown,
  formData: FormData
) {
  try {
    const supabase = await getDbServerClient();
    const accountId = await getAccountId();
    await verifyLifePlanOwnership(lifePlanId, accountId);

    const name = formData.get('name') as string;
    const amount = parseInt(formData.get('amount') as string);
    const startYear = parseInt(formData.get('start_year') as string);
    const endYear = formData.get('end_year')
      ? parseInt(formData.get('end_year') as string)
      : null;
    const timesPerYear = formData.get('times_per_year')
      ? parseInt(formData.get('times_per_year') as string)
      : null;

    const id = crypto.randomUUID();
    const { error } = await supabase.from('hobby_activity_annual_costs').insert({
      id,
      hobby_activity_id: hobbyActivityId,
      name,
      amount,
      start_year: startYear,
      end_year: endYear,
      times_per_year: timesPerYear,
    });

    if (error) {
      logger.error('Failed to create annual cost', {
        hobbyActivityId,
        error: error.message,
      });
      return { 成功: false, エラー: '年次費用の追加に失敗しました' };
    }

    revalidatePath(`/life-plans/${lifePlanId}/edit`);

    const { data: newRecord } = await supabase
      .from('hobby_activity_annual_costs')
      .select('*')
      .eq('id', id)
      .single();

    return { 成功: true, データ: newRecord };
  } catch (err) {
    logger.error('Error in 年次費用追加', { error: err });
    return { 成功: false, エラー: '年次費用の追加に失敗しました' };
  }
}

export async function 年次費用更新(
  annualCostId: string,
  lifePlanId: string,
  _prevState: unknown,
  formData: FormData
) {
  try {
    const supabase = await getDbServerClient();
    const accountId = await getAccountId();
    await verifyLifePlanOwnership(lifePlanId, accountId);

    const name = formData.get('name') as string;
    const amount = parseInt(formData.get('amount') as string);
    const startYear = parseInt(formData.get('start_year') as string);
    const endYear = formData.get('end_year')
      ? parseInt(formData.get('end_year') as string)
      : null;
    const timesPerYear = formData.get('times_per_year')
      ? parseInt(formData.get('times_per_year') as string)
      : null;

    const { error } = await supabase
      .from('hobby_activity_annual_costs')
      .update({
        name,
        amount,
        start_year: startYear,
        end_year: endYear,
        times_per_year: timesPerYear,
      })
      .eq('id', annualCostId);

    if (error) {
      logger.error('Failed to update annual cost', {
        annualCostId,
        error: error.message,
      });
      return { 成功: false, エラー: '年次費用の更新に失敗しました' };
    }

    revalidatePath(`/life-plans/${lifePlanId}/edit`);

    const { data: updatedRecord } = await supabase
      .from('hobby_activity_annual_costs')
      .select('*')
      .eq('id', annualCostId)
      .single();

    return { 成功: true, データ: updatedRecord };
  } catch (err) {
    logger.error('Error in 年次費用更新', { error: err });
    return { 成功: false, エラー: '年次費用の更新に失敗しました' };
  }
}

export async function 年次費用削除(annualCostId: string, lifePlanId: string) {
  try {
    const supabase = await getDbServerClient();
    const accountId = await getAccountId();
    await verifyLifePlanOwnership(lifePlanId, accountId);

    const { error } = await supabase
      .from('hobby_activity_annual_costs')
      .delete()
      .eq('id', annualCostId);

    if (error) throw error;

    revalidatePath(`/life-plans/${lifePlanId}/edit`);
  } catch (err) {
    logger.error('Error in 年次費用削除', { error: err });
    throw err;
  }
}
