'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from 'next/cache';
import { getDbServerClient } from '@/lib/db';
import { logger } from '@/lib/logger';

async function getAccountId(): Promise<string> {
  const supabase = await getDbServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('account_id')
    .eq('id', user.id.toString())
    .single();

  if (!userData) {
    throw new Error('User account not found');
  }

  return userData.account_id;
}

async function verifyLifePlanOwnership(
  lifePlanId: string,
  accountId: string
): Promise<boolean> {
  const supabase = await getDbServerClient();
  const { data } = await supabase
    .from('life_plans')
    .select('account_id')
    .eq('id', lifePlanId)
    .single();

  return data?.account_id === accountId;
}

export async function 習い事追加(
  lifePlanId: string,
  familyMemberId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ 成功?: boolean; エラー?: string; データ?: unknown }> {
  try {
    const accountId = await getAccountId();
    const isOwner = await verifyLifePlanOwnership(lifePlanId, accountId);

    if (!isOwner) {
      return { 成功: false, エラー: 'アクセス権限がありません' };
    }

    const supabase = await getDbServerClient();
    const name = (formData.get('name') as string) || null;

    const hobbyActivityId = crypto.randomUUID();
    const { error: recordError } = await supabase
      .from('hobby_activities')
      .insert({
        id: hobbyActivityId,
        life_plan_id: lifePlanId,
        family_member_id: familyMemberId,
        name,
      });

    if (recordError) throw recordError;

    revalidatePath(`/life-plans/${lifePlanId}/edit`);
    return {
      成功: true,
      データ: {
        id: hobbyActivityId,
        life_plan_id: lifePlanId,
        family_member_id: familyMemberId,
        name,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to add hobby activity', {
      lifePlanId,
      familyMemberId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return {
      成功: false,
      エラー: '習い事の追加に失敗しました',
    };
  }
}

export async function 習い事削除(hobbyActivityId: string): Promise<void> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    const { data: activity } = await supabase
      .from('hobby_activities')
      .select('life_plan_id')
      .eq('id', hobbyActivityId)
      .single();

    if (!activity) {
      throw new Error('習い事が見つかりません');
    }

    const isOwner = await verifyLifePlanOwnership(
      activity.life_plan_id,
      accountId
    );
    if (!isOwner) {
      throw new Error('アクセス権限がありません');
    }

    const { error } = await supabase
      .from('hobby_activities')
      .delete()
      .eq('id', hobbyActivityId);

    if (error) throw error;

    revalidatePath(`/life-plans/${activity.life_plan_id}/edit`);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to delete hobby activity', {
      hobbyActivityId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw new Error('習い事の削除に失敗しました');
  }
}

export async function 習い事月謝追加(
  hobbyActivityId: string,
  lifePlanId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ 成功?: boolean; エラー?: string; データ?: unknown }> {
  try {
    const accountId = await getAccountId();
    const isOwner = await verifyLifePlanOwnership(lifePlanId, accountId);

    if (!isOwner) {
      return { 成功: false, エラー: 'アクセス権限がありません' };
    }

    const supabase = await getDbServerClient();
    const startYear = parseInt(formData.get('start_year') as string);
    const endYear = formData.get('end_year')
      ? parseInt(formData.get('end_year') as string)
      : null;
    const monthlyFee = parseInt(formData.get('monthly_fee') as string);

    const hobbyActivityTermId = crypto.randomUUID();
    const { error } = await supabase.from('hobby_activity_terms').insert({
      id: hobbyActivityTermId,
      hobby_activity_id: hobbyActivityId,
      start_year: startYear,
      end_year: endYear,
      monthly_fee: monthlyFee,
    });

    if (error) throw error;

    revalidatePath(`/life-plans/${lifePlanId}/edit`);
    return {
      成功: true,
      データ: {
        id: hobbyActivityTermId,
        hobby_activity_id: hobbyActivityId,
        start_year: startYear,
        end_year: endYear,
        monthly_fee: monthlyFee,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to add hobby activity term', {
      hobbyActivityId,
      lifePlanId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return {
      成功: false,
      エラー: '月謝期間の追加に失敗しました',
    };
  }
}

export async function 習い事月謝更新(
  hobbyActivityTermId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ 成功?: boolean; エラー?: string; データ?: unknown }> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    const { data: term } = await supabase
      .from('hobby_activity_terms')
      .select(
        `
        hobby_activity_id,
        hobby_activities!inner(life_plan_id)
      `
      )
      .eq('id', hobbyActivityTermId)
      .single();

    if (!term) {
      return { 成功: false, エラー: '月謝期間が見つかりません' };
    }

    const lifePlanId = (term.hobby_activities as any).life_plan_id;
    const isOwner = await verifyLifePlanOwnership(lifePlanId, accountId);
    if (!isOwner) {
      return { 成功: false, エラー: 'アクセス権限がありません' };
    }

    const startYear = parseInt(formData.get('start_year') as string);
    const endYear = formData.get('end_year')
      ? parseInt(formData.get('end_year') as string)
      : null;
    const monthlyFee = parseInt(formData.get('monthly_fee') as string);

    const { error } = await supabase
      .from('hobby_activity_terms')
      .update({
        start_year: startYear,
        end_year: endYear,
        monthly_fee: monthlyFee,
      })
      .eq('id', hobbyActivityTermId);

    if (error) throw error;

    revalidatePath(`/life-plans/${lifePlanId}/edit`);
    return {
      成功: true,
      データ: {
        id: hobbyActivityTermId,
        hobby_activity_id: (term as any).hobby_activity_id,
        start_year: startYear,
        end_year: endYear,
        monthly_fee: monthlyFee,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to update hobby activity term', {
      hobbyActivityTermId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return {
      成功: false,
      エラー: '月謝期間の更新に失敗しました',
    };
  }
}

export async function 習い事月謝削除(hobbyActivityTermId: string): Promise<void> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    const { data: term } = await supabase
      .from('hobby_activity_terms')
      .select(
        `
        hobby_activity_id,
        hobby_activities!inner(life_plan_id)
      `
      )
      .eq('id', hobbyActivityTermId)
      .single();

    if (!term) {
      throw new Error('月謝期間が見つかりません');
    }

    const lifePlanId = (term.hobby_activities as any).life_plan_id;
    const isOwner = await verifyLifePlanOwnership(lifePlanId, accountId);
    if (!isOwner) {
      throw new Error('アクセス権限がありません');
    }

    const { error } = await supabase
      .from('hobby_activity_terms')
      .delete()
      .eq('id', hobbyActivityTermId);

    if (error) throw error;

    revalidatePath(`/life-plans/${lifePlanId}/edit`);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to delete hobby activity term', {
      hobbyActivityTermId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw new Error('月謝期間の削除に失敗しました');
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
    const { error } = await supabase
      .from('hobby_activity_annual_costs')
      .insert({
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
