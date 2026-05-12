'use server';

import { getDbServerClient } from '@/lib/db';
import { logger } from '@/lib/logger';
import { calculateYearlyProjections } from '@/lib/projections/calculator';
import type { ProjectionInput, ProjectionYear } from '@/lib/projections/types';

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

export async function 年次予測計算(
  lifePlanId: string,
  targetYears: number = 60
): Promise<{ 成功?: boolean; エラー?: string; データ?: ProjectionYear[] }> {
  logger.debug('年次予測計算 called', { lifePlanId, targetYears });
  try {
    const accountId = await getAccountId();
    const isOwner = await verifyLifePlanOwnership(lifePlanId, accountId);

    if (!isOwner) {
      return { 成功: false, エラー: 'アクセス権限がありません' };
    }

    const supabase = await getDbServerClient();

    // Fetch life plan
    const { data: lifePlan } = await supabase
      .from('life_plans')
      .select('*')
      .eq('id', lifePlanId)
      .single();

    if (!lifePlan) {
      return { 成功: false, エラー: 'ライフプランが見つかりません' };
    }

    // Fetch family members for this plan
    const { data: familyMembers } = await supabase
      .from('life_plan_family_members')
      .select('family_member_id, name')
      .eq('life_plan_id', lifePlanId);

    if (!familyMembers || familyMembers.length === 0) {
      return { 成功: false, エラー: '家族メンバーが設定されていません' };
    }

    // Fetch base family member data for birth dates
    const { data: baseFamilyMembers } = await supabase
      .from('family_members')
      .select('id, name, birth_date')
      .in(
        'id',
        familyMembers.map((m) => m.family_member_id)
      );

    // Fetch income data
    const { data: incomeRecords } = await supabase
      .from('income_records')
      .select('*')
      .eq('life_plan_id', lifePlanId);

    const { data: incomeTerms } = await supabase
      .from('income_terms')
      .select('*');

    // Fetch hobby activities and terms
    const { data: hobbyActivities } = await supabase
      .from('hobby_activities')
      .select('*')
      .eq('life_plan_id', lifePlanId);

    const { data: hobbyTerms } = await supabase
      .from('hobby_activity_terms')
      .select('*');

    // Fetch annual costs
    const { data: annualCosts } = await supabase
      .from('hobby_activity_annual_costs')
      .select('*');

    // Fetch life events
    const { data: lifeEvents } = await supabase
      .from('life_events')
      .select('*')
      .eq('life_plan_id', lifePlanId);

    // Fetch budget data if budget set is assigned
    let budgetAmounts: Array<{
      category_id: string;
      category_name: string;
      amount: number;
    }> = [];

    if (lifePlan.budget_set_id) {
      const { data: budgets } = await supabase
        .from('budgets')
        .select(
          'budget_category_id, budget_categories(id, name), amount, monthly_amounts'
        )
        .eq('budget_set_id', lifePlan.budget_set_id);

      if (budgets) {
        budgetAmounts = budgets
          .map((b: Record<string, unknown>) => ({
            category_id: b.budget_category_id as string,
            category_name: (b.budget_categories as Record<string, unknown>)
              ?.name as string,
            amount: b.amount as number,
            monthly_amounts:
              (b.monthly_amounts as Record<string, number>) || undefined,
          }))
          .filter((b) => b.amount > 0);
      }
    }

    // Build projection input
    const baseYear = new Date().getFullYear();

    const projectionInput: ProjectionInput = {
      baseYear,
      targetAge: targetYears,
      familyMembers: baseFamilyMembers
        ? baseFamilyMembers.map((m) => ({
            id: m.id,
            name: m.name,
            birthDate: m.birth_date,
          }))
        : [],
      incomeData: incomeRecords
        ? incomeRecords
            .map((record) => {
              const recordTerms = incomeTerms
                ? incomeTerms.filter((t) => t.income_record_id === record.id)
                : [];

              return {
                familyMemberId: record.family_member_id,
                recordId: record.id,
                recordName: record.name,
                terms: recordTerms.map((t) => ({
                  startYear: t.start_year,
                  endYear: t.end_year,
                  monthlySalary: t.monthly_salary,
                  bonusMonths: t.bonus_months,
                  expectedRaiseRate: t.expected_raise_rate,
                })),
              };
            })
            .filter((r) => r.terms.length > 0)
        : [],
      hobbyExpenses: hobbyActivities
        ? hobbyActivities
            .map((activity) => {
              const activityTerms = hobbyTerms
                ? hobbyTerms.filter((t) => t.hobby_activity_id === activity.id)
                : [];

              return {
                familyMemberId: activity.family_member_id,
                activityName: activity.name || '習い事',
                terms: activityTerms.map((t) => ({
                  startYear: t.start_year,
                  endYear: t.end_year,
                  monthlyFee: t.monthly_fee,
                })),
              };
            })
            .filter((a) => a.terms.length > 0)
        : [],
      annualCosts: hobbyActivities
        ? hobbyActivities
            .map((activity) => {
              const activityCosts = annualCosts
                ? annualCosts.filter((c) => c.hobby_activity_id === activity.id)
                : [];

              return {
                familyMemberId: activity.family_member_id,
                activityName: activity.name || '習い事',
                costs: activityCosts.map((c) => ({
                  startYear: c.start_year,
                  endYear: c.end_year,
                  amount: c.amount,
                  timesPerYear: c.times_per_year || 1,
                })),
              };
            })
            .filter((a) => a.costs.length > 0)
        : [],
      lifeEvents: lifeEvents
        ? lifeEvents
            .filter((e) => e.family_member_id && e.event_year && e.home_price)
            .map((e) => ({
              familyMemberId: e.family_member_id,
              eventYear: e.event_year,
              eventType: e.event_type,
              cost: e.home_price || 0,
            }))
        : [],
      budgetData: budgetAmounts.map((b) => ({
        categoryId: b.category_id,
        categoryName: b.category_name,
        amount: b.amount,
        monthlyAmounts:
          (b.monthly_amounts as Record<string, number>) || undefined,
      })),
      initialAssets: 0,
    };

    const projections = calculateYearlyProjections(projectionInput);
    logger.debug('年次予測計算 completed', {
      lifePlanId,
      targetYears,
      projectionCount: projections.length,
    });

    return { 成功: true, データ: projections };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logger.error('Failed to calculate projections', {
      lifePlanId,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return {
      成功: false,
      エラー: '予測計算に失敗しました',
    };
  }
}
