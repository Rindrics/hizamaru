import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { ライフプランRepo } from '@/lib/repositories';
import { ライフプラン更新 } from '@/app/actions/lifePlans';
import LifePlanForm from '../../_components/LifePlanForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditLifePlanPage({ params }: Props) {
  const { id } = await params;

  const supabase = await getSupabaseServerClient();
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
  const { data: familyMembers } = await supabase
    .from('life_plan_family_members')
    .select('*')
    .eq('life_plan_id', id);

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

          {/* Family Members Section */}
          <div className="mt-8 pt-8 border-t">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              家族メンバー
            </h2>
            {familyMembers && familyMembers.length > 0 ? (
              <div className="space-y-4">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.relationship}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ¥{member.income?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray-600">年収</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">家族メンバーが登録されていません</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
