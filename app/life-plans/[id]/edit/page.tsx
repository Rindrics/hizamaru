import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getDbServerClient } from '@/lib/db';
import { ライフプランRepo } from '@/lib/repositories';
import { ライフプラン更新, 予算セット一覧取得 } from '@/app/actions/lifePlans';
import LifePlanForm from '../../_components/LifePlanForm';
import IncomeSection from '../../_components/IncomeSection';
import BudgetSetSelector from '../../_components/BudgetSetSelector';
import type { 予算セット } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditLifePlanPage({ params }: Props) {
  const { id } = await params;

  const supabase = await getDbServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('account_id')
    .eq('id', user.id.toString())
    .single();

  if (!userData) {
    redirect('/login');
  }

  const plan = await ライフプランRepo.ID別取得(id);

  if (!plan || plan.アカウントID !== userData.account_id) {
    notFound();
  }

  // Fetch family members for this life plan
  const familyMembers =
    await ライフプランRepo.ライフプランID別家族メンバー取得(id);

  // Fetch income records and terms
  const { data: incomeRecords } = await supabase
    .from('income_records')
    .select('*')
    .eq('life_plan_id', id);

  const { data: incomeTerms } = await supabase.from('income_terms').select('*');

  // Fetch hobby activities and terms
  const { data: hobbyActivities } = await supabase
    .from('hobby_activities')
    .select('*')
    .eq('life_plan_id', id);

  const { data: hobbyActivityTerms } = await supabase
    .from('hobby_activity_terms')
    .select('*');

  // Fetch annual costs for hobby activities
  const { data: annualCosts } = await supabase
    .from('hobby_activity_annual_costs')
    .select('*');

  // Fetch budget sets
  let budgetSets: 予算セット[] = [];
  try {
    budgetSets = await 予算セット一覧取得();
  } catch (err) {
    // Log error but don't fail the page
  }

  const actionWithId = ライフプラン更新.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/life-plans"
            className="text-primary hover:text-primary-hover"
          >
            ← 一覧に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            ライフプラン「{plan.名前}」を編集
          </h1>

          <LifePlanForm action={actionWithId} defaultValues={plan} />

          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              予算設定
            </h2>
            <BudgetSetSelector
              lifePlanId={id}
              currentBudgetSetId={plan.予算セットID}
              budgetSets={budgetSets}
            />
          </div>

          <IncomeSection
            lifePlanId={id}
            familyMembers={familyMembers || []}
            incomeRecords={incomeRecords || []}
            incomeTerms={incomeTerms || []}
            hobbyActivities={hobbyActivities || []}
            hobbyActivityTerms={hobbyActivityTerms || []}
            annualCosts={annualCosts || []}
          />
        </div>
      </main>
    </div>
  );
}
