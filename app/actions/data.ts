'use server';

import {
  家族メンバーRepo,
  ライフプランRepo,
  ライフイベントRepo,
} from '@/lib/repositories';

const DEMO_ACCOUNT_ID = 'demo-account';

export async function fetchDemoData() {
  try {
    const [familyMembers, lifePlans] = await Promise.all([
      家族メンバーRepo.アカウント別取得(DEMO_ACCOUNT_ID),
      ライフプランRepo.アカウント別取得(DEMO_ACCOUNT_ID),
    ]);

    const lifeEvents = await ライフイベントRepo.ライフプランID別取得(
      lifePlans.map((p) => p.ID)
    );

    return {
      familyMembers,
      lifePlans,
      lifeEvents,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Failed to fetch demo data:', errorMessage);
    throw new Error(`Failed to fetch demo data: ${errorMessage}`);
  }
}
