'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDbServerClient } from '@/lib/db';
import { ライフプランRepo } from '@/lib/repositories';
import {
  createLifePlan,
  duplicateLifePlan,
} from '@/app/services/lifePlanService';
import { logger } from '@/lib/logger';

async function getAccountId(): Promise<string> {
  const supabase = await getDbServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('account_id')
    .eq('id', user.id.toString())
    .single();

  if (error || !userData) {
    throw new Error('Failed to get account');
  }

  return userData.account_id;
}

export async function ライフプラン追加(
  _prevState: unknown,
  formData: FormData
) {
  try {
    const accountId = await getAccountId();
    const 名前 = formData.get('名前') as string;
    const 説明 = (formData.get('説明') as string) || null;

    logger.debug('LifePlan: add request', {
      accountId,
      名前,
      説明,
    });

    if (!名前) {
      return { 成功: false, エラー: 'ライフプラン名は必須です' };
    }

    // ビジネスロジックをサービス層で処理
    // （ライフプラン作成 + family members コピー）
    const plan = await createLifePlan(accountId, 名前, 説明);

    logger.info('Life plan created', {
      planId: plan.ID,
      accountId,
    });

    redirect('/life-plans');
  } catch (err) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to create life plan', {
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return { 成功: false, エラー: 'ライフプラン作成に失敗しました' };
  }
}

export async function ライフプラン更新(
  id: string,
  _prevState: unknown,
  formData: FormData
) {
  try {
    const 名前 = formData.get('名前') as string;
    const 説明 = (formData.get('説明') as string) || null;
    const 有効フラグ = formData.get('有効フラグ') === 'on';

    logger.debug('LifePlan: update request', {
      planId: id,
      名前,
      説明,
      有効フラグ,
    });

    if (!名前) {
      return { 成功: false, エラー: 'ライフプラン名は必須です' };
    }

    await ライフプランRepo.更新(id, 名前, 説明, 有効フラグ);

    // If enabling this plan, set it as main (disable other plans)
    if (有効フラグ) {
      const accountId = await getAccountId();
      await ライフプランRepo.メインプラン設定(accountId, id);
    }

    logger.info('Life plan updated', { planId: id });

    redirect('/life-plans');
  } catch (err) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to update life plan', {
      planId: id,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return { 成功: false, エラー: 'ライフプラン更新に失敗しました' };
  }
}

export async function ライフプラン削除(id: string) {
  try {
    logger.debug('LifePlan: delete request', { planId: id });

    await ライフプランRepo.削除(id);

    logger.info('Life plan deleted', { planId: id });

    const accountId = await getAccountId();
    const updatedPlans = await ライフプランRepo.アカウント別取得(accountId);
    revalidatePath('/life-plans');

    return updatedPlans;
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to delete life plan', { error: message });
    throw err;
  }
}

export async function ライフプランをメインにする(planId: string) {
  try {
    const accountId = await getAccountId();

    logger.debug('LifePlan: set as main request', { planId, accountId });

    await ライフプランRepo.メインプラン設定(accountId, planId);

    logger.info('Life plan set as main', { planId, accountId });

    const updatedPlans = await ライフプランRepo.アカウント別取得(accountId);
    revalidatePath('/life-plans');

    return updatedPlans;
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to set life plan as main', { error: message });
    throw err;
  }
}

export async function ライフプラン複製(id: string) {
  try {
    logger.debug('LifePlan: duplicate request', { planId: id });

    // ビジネスロジックをサービス層で処理
    // （ライフプラン複製 + family members コピー）
    const newPlan = await duplicateLifePlan(id);

    logger.info('Life plan duplicated', { planId: id, newPlanId: newPlan.ID });

    return { 成功: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to duplicate life plan', {
      originalPlanId: id,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return { 成功: false, エラー: 'ライフプラン複製に失敗しました' };
  }
}

export async function ライフプラン一覧取得() {
  try {
    const accountId = await getAccountId();
    const plans = await ライフプランRepo.アカウント別取得(accountId);
    return plans;
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to fetch life plans', { error: message });
    throw err;
  }
}

export async function 予算セット設定(
  lifePlanId: string,
  budgetSetId: string | null
) {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    logger.debug('LifePlan: set budget set request', { lifePlanId, budgetSetId });

    // Verify ownership of life plan
    const { data: lifePlan } = await supabase
      .from('life_plans')
      .select('account_id')
      .eq('id', lifePlanId)
      .single();

    if (!lifePlan || lifePlan.account_id !== accountId) {
      throw new Error('アクセス権限がありません');
    }

    // If budgetSetId is provided, verify ownership
    if (budgetSetId) {
      const { data: budgetSet } = await supabase
        .from('budget_sets')
        .select('account_id')
        .eq('id', budgetSetId)
        .single();

      if (!budgetSet || budgetSet.account_id !== accountId) {
        throw new Error('アクセス権限がありません');
      }
    }

    const { error } = await supabase
      .from('life_plans')
      .update({ budget_set_id: budgetSetId })
      .eq('id', lifePlanId);

    if (error) throw error;

    logger.info('Budget set assigned to life plan', { lifePlanId, budgetSetId });

    revalidatePath(`/life-plans/${lifePlanId}/edit`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Failed to set budget set', { error: message });
    throw err;
  }
}
