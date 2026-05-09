import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { 家族メンバーRepo } from '@/lib/repositories';
import { logger } from '@/lib/logger';
import FamilyMemberList from './_components/FamilyMemberList';

export default async function FamilyPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  logger.debug('FamilyPage: user check', { isAuthenticated: !!user });

  if (!user) {
    logger.warn('FamilyPage: user not authenticated, redirecting to login');
    redirect('/login');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id.toString());

  logger.debug('FamilyPage: user data fetch', {
    userId: user.id,
    userIdString: user.id.toString(),
    hasUserData: !!userData,
    dataLength: Array.isArray(userData) ? userData.length : 0,
    userError: userError?.message,
    rawData: userData,
  });

  const userRecord = Array.isArray(userData) ? userData[0] : userData;

  if (!userRecord || userError) {
    logger.error('FamilyPage: user data not found', {
      userId: user.id,
      userError: userError?.message,
    });
    redirect('/login');
  }

  let members = [];
  try {
    members = await 家族メンバーRepo.アカウント別取得(userRecord.account_id);
  } catch (err) {
    logger.error('FamilyPage: failed to fetch members', {
      error: err instanceof Error ? err.message : String(err),
    });
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">家族メンバー管理</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <FamilyMemberList
            members={members}
            accountId={userRecord.account_id}
          />
        </div>
      </main>
    </div>
  );
}
