import { getSupabaseServerClient } from '@/lib/supabase-server';
import { fetchDemoData, fetchUserData } from '@/app/actions/data';
import type { 家族メンバー, ライフプラン, ライフイベント } from '@/types';
import { logger } from '@/lib/logger';

async function DataDisplay({ showDemo: urlShowDemo }: { showDemo: boolean }) {
  logger.debug('DataDisplay: start', { urlShowDemo });

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  logger.debug('DataDisplay: user auth check', { isAuthenticated: !!user });

  // Get user's demo_mode preference if logged in
  let showDemo = urlShowDemo;
  if (user) {
    logger.debug('DataDisplay: fetching user demo_mode preference', {
      userId: user.id,
    });
    const { data: userData } = await supabase
      .from('users')
      .select('demo_mode')
      .eq('id', user.id.toString())
      .single();

    if (userData !== null) {
      showDemo = userData.demo_mode ?? urlShowDemo;
      logger.debug('DataDisplay: demo_mode preference loaded', {
        demoMode: showDemo,
      });
    }
  }

  if (!user && !showDemo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ようこそ、hizamaru へ
          </h1>
          <p className="text-gray-600 mb-8">
            データを表示するには
            <a href="/login" className="text-primary hover:opacity-90">
              ログイン
            </a>
            してください
          </p>
        </main>
      </div>
    );
  }

  let familyMembers: 家族メンバー[] = [];
  let lifePlans: ライフプラン[] = [];
  let lifeEvents: ライフイベント[] = [];

  if (showDemo) {
    const data = await fetchDemoData();
    familyMembers = data.familyMembers;
    lifePlans = data.lifePlans;
    lifeEvents = data.lifeEvents;
  } else {
    try {
      const data = await fetchUserData();
      familyMembers = data.familyMembers;
      lifePlans = data.lifePlans;
      lifeEvents = data.lifeEvents;
    } catch (err) {
      // User not authenticated or no data - show empty data
      logger.debug('DataDisplay: failed to fetch user data', {
        error: err instanceof Error ? err.message : String(err),
      });
      familyMembers = [];
      lifePlans = [];
      lifeEvents = [];
    }
  }

  const sampleFamilyMembers = familyMembers;
  const sampleLifePlans = lifePlans;
  const sampleLifeEvents = lifeEvents;
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ライフプラン */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ライフプラン
            </h2>
            <div className="space-y-3">
              {sampleLifePlans.map((plan) => (
                <div
                  key={plan.ID}
                  className="p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">{plan.名前}</h3>
                  <p className="text-sm text-gray-600">{plan.説明}</p>
                  {plan.有効フラグ && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-primary text-primary-text rounded">
                      メインシナリオ
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 家族メンバー */}
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              家族メンバー
            </h2>
            <div className="space-y-3">
              {sampleFamilyMembers.map((member) => (
                <div
                  key={member.ID}
                  className="p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">{member.名前}</h3>
                  <p className="text-sm text-gray-600">
                    {member.続柄} •{' '}
                    {member.生年月日.toLocaleDateString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ライフイベント */}
        <section className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ライフイベント
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    イベント名
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    種別
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    年
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    詳細
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sampleLifeEvents.map((event) => {
                  let eventName: string = event.イベント種別;
                  let details = '';

                  if (event.イベント種別 === '出産') {
                    const member = sampleFamilyMembers.find(
                      (m) => m.ID === event.家族メンバーID
                    );
                    eventName = `${member?.名前}誕生`;
                  } else if (event.イベント種別 === '住宅購入') {
                    details = `${event.住宅価格.toLocaleString()}円 • ${event.ローン返済年数}年ローン`;
                  }

                  return (
                    <tr key={event.ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {eventName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {event.イベント種別}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {event.イベント年}年
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const showDemo = params.demo === '1';

  return <DataDisplay showDemo={showDemo} />;
}
