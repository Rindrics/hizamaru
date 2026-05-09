import type { ライフプラン, 家族メンバー, ライフイベント } from '@/types';

// サンプルデータ
const sampleFamilyMembers: 家族メンバー[] = [
  {
    ID: 'izanagi',
    アカウントID: 'demo',
    名前: 'イザナギ',
    生年月日: new Date('1234-05-06'),
    続柄: 'husband',
    作成日: new Date(),
  },
  {
    ID: 'izanami',
    アカウントID: 'demo',
    名前: 'イザナミ',
    生年月日: new Date('1234-05-06'),
    続柄: 'wife',
    作成日: new Date(),
  },
  {
    ID: 'amaterasu',
    アカウントID: 'demo',
    名前: 'アマテラス',
    生年月日: new Date('2345-06-07'),
    続柄: '長女',
    作成日: new Date(),
  },
];

const sampleLifePlans: ライフプラン[] = [
  {
    ID: 'plan-1',
    アカウントID: 'demo',
    名前: '基本シナリオ',
    説明: '標準的なライフプラン',
    有効フラグ: true,
    作成日: new Date(),
    更新日: new Date(),
  },
  {
    ID: 'plan-2',
    アカウントID: 'demo',
    名前: 'シナリオ2',
    説明: '比較対象のライフプラン',
    有効フラグ: false,
    作成日: new Date(),
    更新日: new Date(),
  },
];

const sampleLifeEvents: ライフイベント[] = [
  {
    ID: 'event-1',
    ライフプランID: 'plan-1',
    イベント種別: '出産',
    イベント年: 2025,
    作成日: new Date(),
    更新日: new Date(),
    家族メンバーID: 'amaterasu',
  },
  {
    ID: 'event-2',
    ライフプランID: 'plan-1',
    イベント種別: '住宅購入',
    イベント年: 2026,
    作成日: new Date(),
    更新日: new Date(),
    住宅価格: 35000000,
    頭金: 7000000,
    ローン返済年数: 35,
    ローン利率: 0.02,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">hizamaru</h1>
          <p className="text-gray-600">ライフプランニングアプリ</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
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
                  let eventName = event.イベント種別;
                  let details = '';

                  if (event.イベント種別 === '出産') {
                    const member = sampleFamilyMembers.find(
                      (m) => m.ID === event.家族メンバーID
                    );
                    eventName = `${member?.名前}の誕生`;
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
