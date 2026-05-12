import { redirect } from 'next/navigation';
import { getDbServerClient } from '@/lib/db';
import { logger } from '@/lib/logger';
import BudgetList from './_components/BudgetList';
import {
  予算カテゴリ一覧取得,
  予算セット一覧取得,
  予算取得,
} from '@/app/actions/budgets';
import type { 予算カテゴリ, 予算セット, 予算 } from '@/types';

export const revalidate = 0;

export default async function BudgetPage() {
  const supabase = await getDbServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  logger.debug('BudgetPage: user check', { isAuthenticated: !!user });

  if (!user) {
    logger.warn('BudgetPage: user not authenticated, redirecting to login');
    redirect('/login');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('account_id')
    .eq('id', user.id.toString())
    .single();

  if (!userData || userError) {
    logger.error('BudgetPage: user data not found', {
      userId: user.id,
      userError: userError?.message,
    });
    redirect('/login');
  }

  const accountId = userData.account_id;

  // Fetch budget categories and sets using server actions
  let categories: 予算カテゴリ[] = [];
  let budgetSets: (予算セット & { 予算: 予算[] })[] = [];

  try {
    categories = await 予算カテゴリ一覧取得();
    const sets = await 予算セット一覧取得();

    // For each set, fetch its budgets
    budgetSets = await Promise.all(
      sets.map(async (set) => {
        const amounts = await 予算取得(set.ID);
        return {
          ...set,
          予算: amounts,
        };
      })
    );
  } catch (err) {
    logger.error('BudgetPage: failed to fetch data', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">家計簿</h1>
        </div>

        <BudgetList
          categories={categories}
          budgetSets={budgetSets}
          accountId={accountId}
        />
      </main>
    </div>
  );
}
