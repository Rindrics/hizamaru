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

    const supabase = await getDbServerClient();
    const name = (formData.get('name') as string) || null;

    const incomeRecordId = crypto.randomUUID();
    const { error: recordError } = await supabase
      .from('income_records')
      .insert({
        id: incomeRecordId,
        life_plan_id: lifePlanId,
        family_member_id: familyMemberId,
        name,
      });

    if (recordError) throw recordError;

    revalidatePath(`/life-plans/${lifePlanId}/edit`);
    return {
      成功: true,
      データ: {
        id: incomeRecordId,
        life_plan_id: lifePlanId,
        family_member_id: familyMemberId,
        name,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to add income record', {
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
  incomeRecordId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ 成功?: boolean; エラー?: string; データ?: unknown }> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    const { data: record } = await supabase
      .from('income_records')
      .select('life_plan_id')
      .eq('id', incomeRecordId)
      .single();

    if (!record) {
      return { 成功: false, エラー: '収入が見つかりません' };
    }

    const isOwner = await verifyLifePlanOwnership(
      record.life_plan_id,
      accountId
    );
    if (!isOwner) {
      return { 成功: false, エラー: 'アクセス権限がありません' };
    }

    const name = (formData.get('name') as string) || null;

    const { error } = await supabase
      .from('income_records')
      .update({ name })
      .eq('id', incomeRecordId);

    if (error) throw error;

    revalidatePath(`/life-plans/${record.life_plan_id}/edit`);
    return {
      成功: true,
      データ: {
        id: incomeRecordId,
        life_plan_id: record.life_plan_id,
        name,
      },
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to update income record', {
      incomeRecordId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return {
      成功: false,
      エラー: '収入の更新に失敗しました',
    };
  }
}

export async function 収入削除(incomeRecordId: string): Promise<void> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    const { data: record } = await supabase
      .from('income_records')
      .select('life_plan_id')
      .eq('id', incomeRecordId)
      .single();

    if (!record) {
      throw new Error('収入が見つかりません');
    }

    const isOwner = await verifyLifePlanOwnership(
      record.life_plan_id,
      accountId
    );
    if (!isOwner) {
      throw new Error('アクセス権限がありません');
    }

    const { error } = await supabase
      .from('income_records')
      .delete()
      .eq('id', incomeRecordId);

    if (error) throw error;

    revalidatePath(`/life-plans/${record.life_plan_id}/edit`);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to delete income record', {
      incomeRecordId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw new Error('収入の削除に失敗しました');
  }
}

export async function 収入期間追加(
  incomeRecordId: string,
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
    const monthlySalary = parseInt(formData.get('monthly_salary') as string);
    const bonusMonths = parseFloat(formData.get('bonus_months') as string);
    const bonusPaymentMonths = (
      formData.getAll('bonus_payment_month') as string[]
    ).join(',');
    const expectedRaiseRate = parseFloat(
      formData.get('expected_raise_rate') as string
    );

    const incomeTermId = crypto.randomUUID();
    const { error } = await supabase.from('income_terms').insert({
      id: incomeTermId,
      income_record_id: incomeRecordId,
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
        id: incomeTermId,
        income_record_id: incomeRecordId,
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
    logger.error('Failed to add income term', {
      incomeRecordId,
      lifePlanId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return {
      成功: false,
      エラー: '期間の追加に失敗しました',
    };
  }
}

export async function 収入期間更新(
  incomeTermId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ 成功?: boolean; エラー?: string; データ?: unknown }> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    const { data: term } = await supabase
      .from('income_terms')
      .select(
        `
        income_record_id,
        income_records!inner(life_plan_id)
      `
      )
      .eq('id', incomeTermId)
      .single();

    if (!term) {
      return { 成功: false, エラー: '期間が見つかりません' };
    }

    const lifePlanId = (term.income_records as any).life_plan_id;
    const isOwner = await verifyLifePlanOwnership(lifePlanId, accountId);
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
      .from('income_terms')
      .update({
        start_year: startYear,
        end_year: endYear,
        monthly_salary: monthlySalary,
        bonus_months: bonusMonths,
        bonus_payment_months: bonusPaymentMonths,
        expected_raise_rate: expectedRaiseRate,
      })
      .eq('id', incomeTermId);

    if (error) throw error;

    revalidatePath(`/life-plans/${lifePlanId}/edit`);
    return {
      成功: true,
      データ: {
        id: incomeTermId,
        income_record_id: (term as any).income_record_id,
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
    logger.error('Failed to update income term', {
      incomeTermId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return {
      成功: false,
      エラー: '期間の更新に失敗しました',
    };
  }
}

export async function 収入期間削除(incomeTermId: string): Promise<void> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    const { data: term } = await supabase
      .from('income_terms')
      .select(
        `
        income_record_id,
        income_records!inner(life_plan_id)
      `
      )
      .eq('id', incomeTermId)
      .single();

    if (!term) {
      throw new Error('期間が見つかりません');
    }

    const lifePlanId = (term.income_records as any).life_plan_id;
    const isOwner = await verifyLifePlanOwnership(lifePlanId, accountId);
    if (!isOwner) {
      throw new Error('アクセス権限がありません');
    }

    const { error } = await supabase
      .from('income_terms')
      .delete()
      .eq('id', incomeTermId);

    if (error) throw error;

    revalidatePath(`/life-plans/${lifePlanId}/edit`);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to delete income term', {
      incomeTermId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw new Error('期間の削除に失敗しました');
  }
}
