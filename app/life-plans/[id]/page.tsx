import { redirect } from 'next/navigation';
import { getDbServerClient } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ChevronLeft, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { 年次予測計算 } from '@/app/actions/projections';
import ProjectionChart from '../_components/ProjectionChart';

export const revalidate = 0;

export default async function LifePlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  // Fetch life plan
  const { data: lifePlan, error: planError } = await supabase
    .from('life_plans')
    .select('*')
    .eq('id', id)
    .eq('account_id', userData.account_id)
    .single();

  if (!lifePlan || planError) {
    logger.warn('Life plan not found or unauthorized', {
      planId: id,
      error: planError?.message,
    });
    redirect('/life-plans');
  }

  // Fetch life events
  const { data: lifeEvents } = await supabase
    .from('life_events')
    .select('*')
    .eq('life_plan_id', id)
    .order('event_year');

  // Fetch hobby activities
  const { data: hobbyActivities } = await supabase
    .from('hobby_activities')
    .select('*')
    .eq('life_plan_id', id);

  // Fetch hobby activity terms
  const { data: hobbyTerms } = await supabase
    .from('hobby_activity_terms')
    .select('*');

  // Fetch income records and terms
  const { data: incomeRecords } = await supabase
    .from('income_records')
    .select('*')
    .eq('life_plan_id', id);

  const { data: incomeTerms } = await supabase.from('income_terms').select('*');

  // Fetch projection data
  const projectionResult = await 年次予測計算(id);
  const projections = projectionResult.データ || [];
  logger.debug('Projection data fetched', {
    lifePlanId: id,
    success: projectionResult.成功,
    dataCount: projections.length,
    error: projectionResult.エラー,
  });

  // Build timeline events
  interface TimelineEvent {
    year: number;
    description: string;
    type: 'income' | 'hobby' | 'lifeEvent';
  }

  const timelineEvents: TimelineEvent[] = [];

  // Add income events
  if (incomeRecords) {
    incomeRecords.forEach((record) => {
      const terms =
        incomeTerms?.filter((t) => t.income_record_id === record.id) || [];
      terms.forEach((term) => {
        timelineEvents.push({
          year: term.start_year,
          description: `${record.name || '収入'}開始: 月給 ¥${(term.monthly_salary || 0).toLocaleString()}`,
          type: 'income',
        });
        if (term.end_year) {
          timelineEvents.push({
            year: term.end_year,
            description: `${record.name || '収入'}終了`,
            type: 'income',
          });
        }
      });
    });
  }

  // Add hobby activity events
  if (hobbyActivities) {
    hobbyActivities.forEach((activity) => {
      const terms =
        hobbyTerms?.filter((t) => t.hobby_activity_id === activity.id) || [];
      terms.forEach((term) => {
        timelineEvents.push({
          year: term.start_year,
          description: `${activity.name}開始: 月額 ¥${(term.monthly_fee || 0).toLocaleString()}`,
          type: 'hobby',
        });
        if (term.end_year) {
          timelineEvents.push({
            year: term.end_year,
            description: `${activity.name}終了`,
            type: 'hobby',
          });
        }
      });
    });
  }

  // Add life events
  if (lifeEvents) {
    lifeEvents.forEach((event) => {
      timelineEvents.push({
        year: event.event_year,
        description: `${event.event_type}: ¥${(event.home_price || 0).toLocaleString()}`,
        type: 'lifeEvent',
      });
    });
  }

  // Sort by year
  timelineEvents.sort((a, b) => a.year - b.year);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/life-plans"
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {lifePlan.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {lifePlan.description || '-'}
              </p>
            </div>
          </div>
          <Link
            href={`/life-plans/${lifePlan.id}/edit`}
            className="inline-flex items-center gap-2 bg-primary text-primary-text px-4 py-2 rounded-md hover:bg-primary-hover"
          >
            <Edit2 size={18} />
            編集
          </Link>
        </div>

        {lifePlan.is_active && (
          <div className="mb-6">
            <span className="inline-block bg-primary text-primary-text text-sm font-semibold px-3 py-1 rounded">
              メインプラン
            </span>
          </div>
        )}

        {projections.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              財務予測
            </h2>
            <ProjectionChart projections={projections} lifePlanId={id} />
          </div>
        )}

        {timelineEvents.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              イベントタイムライン
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      年
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      イベント
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      種類
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timelineEvents.map((event, idx) => (
                    <tr key={`${event.year}-${idx}`}>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {event.year}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {event.description}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            event.type === 'income'
                              ? 'bg-success/20 text-success'
                              : event.type === 'hobby'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-danger/20 text-danger'
                          }`}
                        >
                          {event.type === 'income'
                            ? '収入'
                            : event.type === 'hobby'
                              ? '習い事'
                              : 'イベント'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {timelineEvents.length === 0 && (
              <p className="text-gray-500">イベントが設定されていません</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
