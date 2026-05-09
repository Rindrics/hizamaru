'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { ライフプランRepo } from '@/lib/repositories';
import { logger } from '@/lib/logger';

async function getAccountId(): Promise<string> {
  const supabase = await getSupabaseServerClient();
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

    const plan = await ライフプランRepo.作成(accountId, 名前, 説明);

    logger.info('Life plan created', {
      planId: plan.ID,
      accountId,
    });

    redirect('/life-plans');
  } catch (err) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to create life plan', { error: message });
    return { 成功: false, エラー: message };
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
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to update life plan', { error: message });
    return { 成功: false, エラー: message };
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

    const newPlan = await ライフプランRepo.複製(id);

    logger.info('Life plan duplicated', { planId: id, newPlanId: newPlan.ID });

    return { 成功: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to duplicate life plan', { error: message });
    return { 成功: false, エラー: message };
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
