'use server';

import { getSupabaseServerClient } from '@/lib/supabase-server';
import { ライフプランRepo, 家族メンバーRepo, ライフプランファミリーメンバーRepo } from '@/lib/repositories';
import { logger } from '@/lib/logger';

/**
 * ライフプラン作成サービス
 * 責務：ライフプラン作成 + 初期データ（family members）のコピー
 */
export async function createLifePlan(
  accountId: string,
  name: string,
  description: string | null
) {
  const supabase = await getSupabaseServerClient();

  // Step 1: リポジトリでライフプランを作成
  const plan = await ライフプランRepo.作成(
    supabase,
    accountId,
    name,
    description
  );

  // Step 2: アカウントの家族メンバーをこのライフプランにコピー
  try {
    const familyMembers = await 家族メンバーRepo.アカウント別取得(accountId);
    if (familyMembers && familyMembers.length > 0) {
      const lifePlanFamilyMembers = familyMembers.map((member) => ({
        id: `lp_fm_${crypto.randomUUID()}`,
        life_plan_id: plan.ID,
        family_member_id: member.ID,
        name: member.名前,
        relationship: member.続柄,
        income: 0,
      }));

      await ライフプランファミリーメンバーRepo.複数作成(
        supabase,
        lifePlanFamilyMembers
      );
    }
  } catch (err) {
    // ファミリーメンバーのコピーに失敗しても、プラン作成は成功と見なす
    logger.warn('Failed to copy family members during plan creation', {
      planId: plan.ID,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return plan;
}

/**
 * ライフプラン複製サービス
 * 責務：ライフプラン複製 + 元のプランの関連データ（family members）をコピー
 */
export async function duplicateLifePlan(lifePlanId: string) {
  const supabase = await getSupabaseServerClient();

  // Step 1: リポジトリでライフプランを複製
  const newPlan = await ライフプランRepo.複製(supabase, lifePlanId);

  // Step 2: 元のプランの family members をこの複製プランにコピー
  try {
    const originalMembers =
      await ライフプランファミリーメンバーRepo.ライフプランID別取得(lifePlanId);
    if (originalMembers && originalMembers.length > 0) {
      const newMembers = originalMembers.map((member) => ({
        id: `lp_fm_${crypto.randomUUID()}`,
        life_plan_id: newPlan.ID,
        family_member_id: member.family_member_id,
        name: member.name,
        relationship: member.relationship,
        income: member.income,
      }));

      await ライフプランファミリーメンバーRepo.複数作成(supabase, newMembers);
    }
  } catch (err) {
    // ファミリーメンバーのコピーに失敗しても、プラン複製は成功と見なす
    logger.warn('Failed to copy family members during plan duplication', {
      originalPlanId: lifePlanId,
      newPlanId: newPlan.ID,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return newPlan;
}
