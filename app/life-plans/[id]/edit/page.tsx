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

  const actionWithId = ライフプラン更新.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/life-plans" className="text-primary hover:text-primary-hover">
            ← 一覧に戻る
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            ライフプラン「{plan.名前}」を編集
          </h1>

          <LifePlanForm action={actionWithId} defaultValues={plan} />
        </div>
      </main>
    </div>
  );
}
