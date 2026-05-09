'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { 家族メンバーRepo } from '@/lib/repositories';
import { logger } from '@/lib/logger';
import type { 家族メンバー続柄 } from '@/types';

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

export async function 家族メンバー追加(_prevState: unknown, formData: FormData) {
  try {
    const accountId = await getAccountId();
    const 名前 = formData.get('名前') as string;
    const 生年月日Str = formData.get('生年月日') as string;
    const 続柄 = formData.get('続柄') as 家族メンバー続柄;

    logger.debug('FamilyMember: add request', {
      accountId,
      名前,
      生年月日Str,
      続柄,
    });

    if (!名前 || !生年月日Str || !続柄) {
      return { 成功: false, エラー: '必須項目を入力してください' };
    }

    const 生年月日 = new Date(生年月日Str);
    const member = await 家族メンバーRepo.作成(accountId, 名前, 生年月日, 続柄);

    logger.info('Family member created', {
      memberId: member.ID,
      accountId,
    });

    redirect('/family');
  } catch (err) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to create family member', { error: message });
    return { 成功: false, エラー: message };
  }
}

export async function 家族メンバー更新(id: string, _prevState: unknown, formData: FormData) {
  try {
    const accountId = await getAccountId();
    const existing = await 家族メンバーRepo.ID別取得(id);

    if (!existing || existing.アカウントID !== accountId) {
      throw new Error('家族メンバーが見つかりません');
    }

    const 名前 = formData.get('名前') as string;
    const 生年月日Str = formData.get('生年月日') as string;
    const 続柄 = formData.get('続柄') as 家族メンバー続柄;

    if (!名前 || !生年月日Str || !続柄) {
      return { 成功: false, エラー: '必須項目を入力してください' };
    }

    const 生年月日 = new Date(生年月日Str);
    const member = await 家族メンバーRepo.更新(id, 名前, 生年月日, 続柄);

    logger.info('Family member updated', {
      memberId: member.ID,
      accountId,
    });

    redirect('/family');
  } catch (err) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to update family member', { error: message });
    return { 成功: false, エラー: message };
  }
}

export async function 家族メンバー削除(id: string) {
  try {
    const accountId = await getAccountId();
    const existing = await 家族メンバーRepo.ID別取得(id);

    if (!existing || existing.アカウントID !== accountId) {
      throw new Error('家族メンバーが見つかりません');
    }

    await 家族メンバーRepo.削除(id);

    logger.info('Family member deleted', {
      memberId: id,
      accountId,
    });

    redirect('/family');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Failed to delete family member', { error: message });
    redirect('/family');
  }
}
