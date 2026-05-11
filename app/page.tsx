import { getDbServerClient } from '@/lib/db';
import { fetchUserData } from '@/app/actions/data';
import type { 家族メンバー, ライフプラン, ライフイベント } from '@/types';
import { logger } from '@/lib/logger';

async function DataDisplay() {
  logger.debug('DataDisplay: start');

  const supabase = await getDbServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  logger.debug('DataDisplay: user auth check', { isAuthenticated: !!user });

  if (!user) {
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

  try {
    const data = await fetchUserData();
    familyMembers = data.familyMembers;
    lifePlans = data.lifePlans;
    lifeEvents = data.lifeEvents;
  } catch (err) {
    // Failed to fetch user data - show empty data
    logger.debug('DataDisplay: failed to fetch user data', {
      error: err instanceof Error ? err.message : String(err),
    });
    familyMembers = [];
    lifePlans = [];
    lifeEvents = [];
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
      </main>
    </div>
  );
}

export default async function Home() {
  return <DataDisplay />;
}
