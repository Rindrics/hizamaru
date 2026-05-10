import { redirect } from 'next/navigation';
import { getDbServerClient } from '@/lib/db';
import { ライフプランRepo } from '@/lib/repositories';
import { logger } from '@/lib/logger';
import LifePlanList from './_components/LifePlanList';

export const revalidate = 0;

export default async function LifePlansPage() {
  const supabase = await getDbServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  logger.debug('LifePlansPage: user check', { isAuthenticated: !!user });

  if (!user) {
    logger.warn('LifePlansPage: user not authenticated, redirecting to login');
    redirect('/login');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .eq('id', user.id.toString());

  logger.debug('LifePlansPage: user data fetch', {
    userId: user.id,
    userIdString: user.id.toString(),
    hasUserData: !!userData,
    dataLength: Array.isArray(userData) ? userData.length : 0,
    userError: userError?.message,
  });

  const userRecord = Array.isArray(userData) ? userData[0] : userData;

  if (!userRecord || userError) {
    logger.error('LifePlansPage: user data not found', {
      userId: user.id,
      userError: userError?.message,
    });
    redirect('/login');
  }

  let plans = [];
  try {
    plans = await ライフプランRepo.アカウント別取得(userRecord.account_id);
  } catch (err) {
    logger.error('LifePlansPage: failed to fetch life plans', {
      error: err instanceof Error ? err.message : String(err),
    });
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">ライフプラン管理</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <LifePlanList plans={plans} />
        </div>
      </main>
    </div>
  );
}
