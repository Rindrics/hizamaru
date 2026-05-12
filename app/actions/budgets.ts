'use server';

import { revalidatePath } from 'next/cache';
import { getDbServerClient } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { 予算カテゴリ, 予算セット, 予算 } from '@/types';

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

function mapToBudgetCategory(record: Record<string, unknown>): 予算カテゴリ {
  return {
    ID: record.id as string,
    アカウントID: record.account_id as string,
    名前: record.name as string,
    デフォルト: (record.is_default as boolean) || false,
    色: (record.color as string) || '#808080',
    作成日: new Date(record.created_at as string),
  };
}

function mapToBudgetSet(record: Record<string, unknown>): 予算セット {
  return {
    ID: record.id as string,
    アカウントID: record.account_id as string,
    名前: record.name as string,
    作成日: new Date(record.created_at as string),
  };
}

function mapToBudget(record: Record<string, unknown>): 予算 {
  return {
    ID: record.id as string,
    予算セットID: record.budget_set_id as string,
    予算カテゴリID: record.budget_category_id as string,
    金額: record.amount as number,
    月別金額: (record.monthly_amounts as Record<string, number>) || undefined,
    作成日: new Date(record.created_at as string),
  };
}

// Budget Categories

export async function 予算カテゴリ一覧取得(): Promise<予算カテゴリ[]> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('account_id', accountId);

    if (error) throw error;
    return (data || []).map(mapToBudgetCategory);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Failed to fetch budget categories', { error: message });
    throw err;
  }
}

export async function 予算カテゴリ作成(
  _prevState: unknown,
  formData: FormData
): Promise<{ 成功?: boolean; エラー?: string }> {
  try {
    const accountId = await getAccountId();
    const 名前 = formData.get('名前') as string;
    const 色 = formData.get('色') as string;

    logger.debug('BudgetCategory: create request', { accountId, 名前, 色 });

    if (!名前) {
      return { 成功: false, エラー: 'カテゴリ名は必須です' };
    }

    const supabase = await getDbServerClient();
    const { error } = await supabase.from('budget_categories').insert({
      id: crypto.randomUUID(),
      account_id: accountId,
      name: 名前,
      color: 色 || '#808080',
      is_default: false,
    });

    if (error) throw error;

    logger.info('Budget category created', { accountId });
    revalidatePath('/budget');

    return { 成功: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to create budget category', { error: errorMessage });
    return { 成功: false, エラー: 'カテゴリの作成に失敗しました' };
  }
}

export async function 予算カテゴリ更新(
  id: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ 成功?: boolean; エラー?: string }> {
  try {
    const accountId = await getAccountId();
    const 名前 = formData.get('名前') as string;
    const 色 = formData.get('色') as string;

    logger.debug('BudgetCategory: update request', { id, 名前, 色 });

    if (!名前) {
      return { 成功: false, エラー: 'カテゴリ名は必須です' };
    }

    const supabase = await getDbServerClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('budget_categories')
      .select('account_id')
      .eq('id', id)
      .single();

    if (!existing || existing.account_id !== accountId) {
      return { 成功: false, エラー: 'アクセス権限がありません' };
    }

    const { error } = await supabase
      .from('budget_categories')
      .update({ name: 名前, color: 色 || '#808080' })
      .eq('id', id);

    if (error) throw error;

    logger.info('Budget category updated', { id });
    revalidatePath('/budget');

    return { 成功: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to update budget category', { error: errorMessage });
    return { 成功: false, エラー: 'カテゴリの更新に失敗しました' };
  }
}

export async function 予算カテゴリ削除(id: string): Promise<void> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    logger.debug('BudgetCategory: delete request', { id });

    // Verify ownership
    const { data: existing } = await supabase
      .from('budget_categories')
      .select('account_id')
      .eq('id', id)
      .single();

    if (!existing || existing.account_id !== accountId) {
      throw new Error('アクセス権限がありません');
    }

    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    logger.info('Budget category deleted', { id });
    revalidatePath('/budget');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Failed to delete budget category', { error: message });
    throw err;
  }
}

// Budget Sets

export async function 予算セット一覧取得(): Promise<予算セット[]> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    const { data, error } = await supabase
      .from('budget_sets')
      .select('*')
      .eq('account_id', accountId);

    if (error) throw error;
    return (data || []).map(mapToBudgetSet);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Failed to fetch budget sets', { error: message });
    throw err;
  }
}

export async function 予算セット作成(
  _prevState: unknown,
  formData: FormData
): Promise<{ 成功?: boolean; エラー?: string; データ?: 予算セット }> {
  try {
    const accountId = await getAccountId();
    const 名前 = formData.get('名前') as string;

    logger.debug('BudgetSet: create request', { accountId, 名前 });

    if (!名前) {
      return { 成功: false, エラー: 'セット名は必須です' };
    }

    const supabase = await getDbServerClient();
    const id = crypto.randomUUID();

    const { data, error } = await supabase
      .from('budget_sets')
      .insert({
        id,
        account_id: accountId,
        name: 名前,
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('Budget set created', { budgetSetId: id, accountId });
    revalidatePath('/budget');

    return { 成功: true, データ: mapToBudgetSet(data) };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to create budget set', { error: errorMessage });
    return { 成功: false, エラー: 'セットの作成に失敗しました' };
  }
}

export async function 予算セット更新(
  id: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ 成功?: boolean; エラー?: string }> {
  try {
    const accountId = await getAccountId();
    const 名前 = formData.get('名前') as string;

    logger.debug('BudgetSet: update request', { id, 名前 });

    if (!名前) {
      return { 成功: false, エラー: 'セット名は必須です' };
    }

    const supabase = await getDbServerClient();

    // Verify ownership
    const { data: existing } = await supabase
      .from('budget_sets')
      .select('account_id')
      .eq('id', id)
      .single();

    if (!existing || existing.account_id !== accountId) {
      return { 成功: false, エラー: 'アクセス権限がありません' };
    }

    const { error } = await supabase
      .from('budget_sets')
      .update({ name: 名前 })
      .eq('id', id);

    if (error) throw error;

    logger.info('Budget set updated', { id });
    revalidatePath('/budget');

    return { 成功: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to update budget set', { error: errorMessage });
    return { 成功: false, エラー: 'セットの更新に失敗しました' };
  }
}

export async function 予算セット削除(id: string): Promise<void> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    logger.debug('BudgetSet: delete request', { id });

    // Verify ownership
    const { data: existing } = await supabase
      .from('budget_sets')
      .select('account_id')
      .eq('id', id)
      .single();

    if (!existing || existing.account_id !== accountId) {
      throw new Error('アクセス権限がありません');
    }

    const { error } = await supabase.from('budget_sets').delete().eq('id', id);

    if (error) throw error;

    logger.info('Budget set deleted', { id });
    revalidatePath('/budget');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Failed to delete budget set', { error: message });
    throw err;
  }
}

export async function 予算セット複製(
  id: string
): Promise<{ 成功?: boolean; エラー?: string }> {
  try {
    const accountId = await getAccountId();
    const supabase = await getDbServerClient();

    logger.debug('BudgetSet: duplicate request', { id });

    // Verify ownership and get source set
    const { data: sourceSet } = await supabase
      .from('budget_sets')
      .select('*')
      .eq('id', id)
      .single();

    if (!sourceSet || sourceSet.account_id !== accountId) {
      throw new Error('アクセス権限がありません');
    }

    // Get existing budgets
    const { data: sourceBudgets } = await supabase
      .from('budgets')
      .select('*')
      .eq('budget_set_id', id);

    // Create new set with copied name
    const newSetId = crypto.randomUUID();
    const { error: insertError } = await supabase.from('budget_sets').insert({
      id: newSetId,
      account_id: accountId,
      name: `${sourceSet.name}のコピー`,
    });

    if (insertError) throw insertError;

    // Copy budgets if they exist
    if (sourceBudgets && sourceBudgets.length > 0) {
      const budgetsToInsert = sourceBudgets.map((budget) => ({
        id: crypto.randomUUID(),
        budget_set_id: newSetId,
        budget_category_id: budget.budget_category_id,
        amount: budget.amount,
        monthly_amounts: (budget as Record<string, unknown>).monthly_amounts,
      }));

      const { error: budgetInsertError } = await supabase
        .from('budgets')
        .insert(budgetsToInsert);

      if (budgetInsertError) throw budgetInsertError;
    }

    logger.info('Budget set duplicated', { sourceId: id, newSetId });
    revalidatePath('/budget');

    return { 成功: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to duplicate budget set', { error: errorMessage });
    return { 成功: false, エラー: 'セットの複製に失敗しました' };
  }
}

// Budget Amounts

export async function 予算設定(
  budgetSetId: string,
  categoryId: string,
  _prevState: unknown,
  formData: FormData
): Promise<{ 成功?: boolean; エラー?: string }> {
  try {
    console.log('[予算設定] Start', { budgetSetId, categoryId });

    const accountId = await getAccountId();
    console.log('[予算設定] Got accountId', { accountId });

    const 金額Str = formData.get('金額') as string;
    const 月別金額Str = formData.get('月別金額') as string;
    console.log('[予算設定] FormData', { 金額Str, 月別金額Str });

    let 金額: number;
    let 月別金額: Record<string, number> | null = null;

    if (月別金額Str) {
      // 月別金額がある場合
      月別金額 = JSON.parse(月別金額Str);
      console.log('[予算設定] Monthly amounts', { 月別金額 });
      logger.debug('Budget: set request with monthly amounts', {
        budgetSetId,
        categoryId,
        月別金額,
      });

      // 月別金額から平均を計算（保存用）
      const values = Object.values(月別金額).filter((v) => v > 0);
      金額 =
        values.length > 0
          ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
          : 0;
      console.log('[予算設定] Calculated amount from monthly', { 金額 });
    } else {
      // 単一金額の場合
      金額 = parseInt(金額Str, 10);
      console.log('[予算設定] Single amount', { 金額 });
      logger.debug('Budget: set request', { budgetSetId, categoryId, 金額 });

      if (isNaN(金額) || 金額 < 0) {
        console.log('[予算設定] Invalid amount');
        return { 成功: false, エラー: '金額は正の数値を入力してください' };
      }
    }

    const supabase = await getDbServerClient();

    // Verify ownership of budget set
    const { data: budgetSet, error: budgetSetError } = await supabase
      .from('budget_sets')
      .select('account_id')
      .eq('id', budgetSetId)
      .single();

    console.log('[予算設定] Budget set lookup', { budgetSetId, budgetSet, budgetSetError });

    if (!budgetSet || budgetSet.account_id !== accountId) {
      console.log('[予算設定] Access denied', { has: !!budgetSet, matches: budgetSet?.account_id === accountId });
      return { 成功: false, エラー: 'アクセス権限がありません' };
    }

    // Check if budget already exists
    const { data: existing, error: existingError } = await supabase
      .from('budgets')
      .select('id')
      .eq('budget_set_id', budgetSetId)
      .eq('budget_category_id', categoryId)
      .single();

    console.log('[予算設定] Existing budget check', { existing, existingError });

    if (existing) {
      // Update existing
      console.log('[予算設定] Updating existing budget', { id: existing.id, 金額, 月別金額 });
      const { error } = await supabase
        .from('budgets')
        .update({
          amount: 金額,
          monthly_amounts: 月別金額,
        })
        .eq('id', existing.id);

      if (error) {
        console.error('[予算設定] Update error', error);
        throw error;
      }
      console.log('[予算設定] Update successful');
    } else {
      // Insert new
      const newId = crypto.randomUUID();
      console.log('[予算設定] Inserting new budget', { newId, budgetSetId, categoryId, 金額, 月別金額 });
      const { error } = await supabase.from('budgets').insert({
        id: newId,
        budget_set_id: budgetSetId,
        budget_category_id: categoryId,
        amount: 金額,
        monthly_amounts: 月別金額,
      });

      if (error) {
        console.error('[予算設定] Insert error', error);
        throw error;
      }
      console.log('[予算設定] Insert successful');
    }

    console.log('[予算設定] Revalidating path');
    logger.info('Budget set', {
      budgetSetId,
      categoryId,
      金額,
      月別金額: 月別金額 ? 'provided' : 'not provided',
    });
    revalidatePath('/budget');

    console.log('[予算設定] Complete');
    return { 成功: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    console.error('[予算設定] Error caught', { error: errorMessage, stack: err instanceof Error ? err.stack : undefined });
    logger.error('Failed to set budget', { error: errorMessage });
    return { 成功: false, エラー: '予算の設定に失敗しました' };
  }
}

export async function 予算取得(budgetSetId: string): Promise<予算[]> {
  try {
    const supabase = await getDbServerClient();

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('budget_set_id', budgetSetId);

    if (error) throw error;
    return (data || []).map(mapToBudget);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Failed to fetch budgets', { error: message });
    throw err;
  }
}
