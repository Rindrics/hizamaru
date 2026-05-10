'use server';

import {
  家族メンバーRepo,
  ライフプランRepo,
  ライフイベントRepo,
} from '@/lib/repositories';
import { getDbServerClient } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function fetchUserData() {
  logger.debug('fetchUserData: start');
  const startTime = Date.now();

  const supabase = await getDbServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn('fetchUserData: user not authenticated');
    throw new Error('User not authenticated');
  }

  logger.debug('fetchUserData: fetching user account', { userId: user.id });

  // Get user's account_id from the users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('account_id')
    .eq('id', user.id.toString())
    .single();

  if (userError || !userData) {
    logger.error('fetchUserData: failed to get user account', {
      userId: user.id,
      error: userError?.message,
    });
    throw new Error('Failed to get user account');
  }

  logger.debug('fetchUserData: fetching data', {
    accountId: userData.account_id,
  });

  try {
    const [familyMembers, lifePlans] = await Promise.all([
      家族メンバーRepo.アカウント別取得(userData.account_id),
      ライフプランRepo.アカウント別取得(userData.account_id),
    ]);

    const lifeEvents = await ライフイベントRepo.ライフプランID別取得(
      lifePlans.map((p) => p.ID)
    );

    const elapsed = Date.now() - startTime;
    logger.debug('fetchUserData: complete', { elapsed });

    return {
      familyMembers,
      lifePlans,
      lifeEvents,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    logger.error('fetchUserData: failed to fetch data', {
      error: errorMessage,
    });
    throw new Error(`Failed to fetch data: ${errorMessage}`);
  }
}
