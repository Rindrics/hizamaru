'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

async function getAccountId(): Promise<string> {
  const supabase = await getSupabaseServerClient();
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
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from('life_plans')
    .select('account_id')
    .eq('id', lifePlanId)
    .single();

  return data?.account_id === accountId;
}

export async function 収入追加(
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

    const supabase = await getSupabaseServerClient();
    const startYear = parseInt(formData.get('start_year') as string);
    const endYear = formData.get('end_year')
      ? parseInt(formData.get('end_year') as string)
      : null;
    const monthlySalary = parseInt(formData.get('monthly_salary') as string);
    const bonusMonths = parseFloat(formData.get('bonus_months') as string);
    const bonusPaymentMonths = (
      formData.getAll('bonus_payment_month') as string[]
    ).join(',');
    const expectedRaiseRate = parseFloat(
      formData.get('expected_raise_rate') as string
    );

    const incomeId = crypto.randomUUID();
    const { error } = await supabase.from('income').insert({
      id: incomeId,
      life_plan_id: lifePlanId,
      family_member_id: familyMemberId,
      start_year: startYear,
      end_year: endYear,
      monthly_salary: monthlySalary,
      bonus_months: bonusMonths,
      bonus_payment_months: bonusPaymentMonths,
      expected_raise_rate: expectedRaiseRate,
    });

    if (error) throw error;

    revalidatePath(`/life-plans/${lifePlanId}/edit`);
    return {
      成功: true,
      データ: {
        id: incomeId,
        life_plan_id: lifePlanId,
        family_member_id: familyMemberId,
        start_year: startYear,
        end_year: endYear,
        monthly_salary: monthlySalary,
        bonus_months: bonusMonths,
        bonus_payment_months: bonusPaymentMonths,
        expected_raise_rate: expectedRaiseRate,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to add income', {
      lifePlanId,
      familyMemberId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return {
      成功: false,
      エラー: '収入の追加に失敗しました',
    };
  }
}

export async function 収入更新(
  incomeId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ 成功?: boolean; エラー?: string; データ?: unknown }> {
  try {
    const accountId = await getAccountId();
    const supabase = await getSupabaseServerClient();

    // Verify ownership through life plan
    const { data: income } = await supabase
      .from('income')
      .select('life_plan_id, family_member_id')
      .eq('id', incomeId)
      .single();

    if (!income) {
      return { 成功: false, エラー: '収入レコードが見つかりません' };
    }

    const isOwner = await verifyLifePlanOwnership(
      income.life_plan_id,
      accountId
    );
    if (!isOwner) {
      return { 成功: false, エラー: 'アクセス権限がありません' };
    }

    const startYear = parseInt(formData.get('start_year') as string);
    const endYear = formData.get('end_year')
      ? parseInt(formData.get('end_year') as string)
      : null;
    const monthlySalary = parseInt(formData.get('monthly_salary') as string);
    const bonusMonths = parseFloat(formData.get('bonus_months') as string);
    const bonusPaymentMonths = (
      formData.getAll('bonus_payment_month') as string[]
    ).join(',');
    const expectedRaiseRate = parseFloat(
      formData.get('expected_raise_rate') as string
    );

    const { error } = await supabase
      .from('income')
      .update({
        start_year: startYear,
        end_year: endYear,
        monthly_salary: monthlySalary,
        bonus_months: bonusMonths,
        bonus_payment_months: bonusPaymentMonths,
        expected_raise_rate: expectedRaiseRate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', incomeId);

    if (error) throw error;

    revalidatePath(`/life-plans/${income.life_plan_id}/edit`);
    return {
      成功: true,
      データ: {
        id: incomeId,
        life_plan_id: income.life_plan_id,
        family_member_id: income.family_member_id,
        start_year: startYear,
        end_year: endYear,
        monthly_salary: monthlySalary,
        bonus_months: bonusMonths,
        bonus_payment_months: bonusPaymentMonths,
        expected_raise_rate: expectedRaiseRate,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to update income', {
      incomeId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return {
      成功: false,
      エラー: '収入の更新に失敗しました',
    };
  }
}

export async function 収入削除(incomeId: string): Promise<void> {
  try {
    const accountId = await getAccountId();
    const supabase = await getSupabaseServerClient();

    // Verify ownership through life plan
    const { data: income } = await supabase
      .from('income')
      .select('life_plan_id')
      .eq('id', incomeId)
      .single();

    if (!income) {
      throw new Error('収入レコードが見つかりません');
    }

    const isOwner = await verifyLifePlanOwnership(
      income.life_plan_id,
      accountId
    );
    if (!isOwner) {
      throw new Error('アクセス権限がありません');
    }

    const { error } = await supabase.from('income').delete().eq('id', incomeId);

    if (error) throw error;

    revalidatePath(`/life-plans/${income.life_plan_id}/edit`);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to delete income', {
      incomeId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw new Error('収入の削除に失敗しました');
  }
}
