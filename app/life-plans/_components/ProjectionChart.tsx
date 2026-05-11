'use client';

import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ProjectionYear } from '@/lib/projections/types';
import { 年次予測計算 } from '@/app/actions/projections';
import { CHART_CONFIG, CHART_LEFT_MARGIN } from '../_constants/chartConfig';

interface Props {
  projections: ProjectionYear[];
  lifePlanId: string;
}

const {
  AGE_LABEL_WIDTH,
  YEAR_COLUMN_WIDTH,
  Y_AXIS_WIDTH,
  CHART_RIGHT_MARGIN,
  MIN_CHART_WIDTH,
  BAR_CATEGORY_GAP,
  BAR_GAP,
  CHART_MARGIN_TOP,
  CHART_MARGIN_BOTTOM,
} = CHART_CONFIG;

export default function ProjectionChart({
  projections: initialProjections,
  lifePlanId,
}: Props) {
  const [projections, setProjections] =
    useState<ProjectionYear[]>(initialProjections);
  const [years, setYears] = useState(60);
  const [inputYears, setInputYears] = useState('60');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleYearsChange = async (newYears: number) => {
    if (newYears < 1 || newYears > 100) {
      setInputYears(years.toString());
      return;
    }
    if (newYears === years) {
      return;
    }
    setYears(newYears);
    setIsLoading(true);
    try {
      const result = await 年次予測計算(lifePlanId, newYears);
      if (result.データ) {
        setProjections(result.データ);
      }
    } catch (err) {
      console.error('Failed to update projections:', err);
      setYears(years);
      setInputYears(years.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    const newYears = Number(inputYears);
    if (isNaN(newYears) || newYears < 1 || newYears > 100) {
      setInputYears(years.toString());
      return;
    }
    await handleYearsChange(newYears);
    setIsEditing(false);
  };

  if (projections.length === 0) {
    return null;
  }

  const data = projections.map((d) => ({
    ...d,
    hiddenIncome: Math.max(0, d.totalExpense - d.totalIncome),
  }));

  const members = projections[0]?.members || [];
  const timelineWidth = data.length * YEAR_COLUMN_WIDTH;
  const contentWidth = Math.max(
    MIN_CHART_WIDTH,
    AGE_LABEL_WIDTH + timelineWidth + CHART_RIGHT_MARGIN
  );
  const effectiveYearColumnWidth =
    (contentWidth - AGE_LABEL_WIDTH - CHART_RIGHT_MARGIN) / data.length;
  const ageGridColumns = `${AGE_LABEL_WIDTH}px repeat(${data.length}, ${effectiveYearColumnWidth}px) ${CHART_RIGHT_MARGIN}px`;
  const firstYear = data[0]?.year;
  const formatYearTick = (year: number | string) => {
    const numericYear = Number(year);
    const lastDigit = Math.abs(numericYear) % 10;

    if (numericYear === firstYear || lastDigit === 0 || lastDigit === 5) {
      return String(year);
    }

    return '';
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">計算期間:</label>
        {!isEditing ? (
          <>
            <span className="text-sm text-gray-900 font-medium">{years}年</span>
            <button
              onClick={() => {
                setInputYears(years.toString());
                setIsEditing(true);
              }}
              disabled={isLoading}
              className="text-primary hover:text-primary-hover inline-block p-1 disabled:opacity-50"
              title="編集"
            >
              <Edit2 size={18} />
            </button>
          </>
        ) : (
          <>
            <input
              id="years"
              type="number"
              min="1"
              max="100"
              value={inputYears}
              onChange={(e) => setInputYears(e.target.value)}
              disabled={isLoading}
              className="w-20 px-3 py-2 border border-primary rounded-md text-sm disabled:bg-gray-100"
              autoFocus
            />
            <span className="text-sm text-gray-600">年</span>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-3 py-2 bg-primary text-primary-text rounded-md text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
            >
              確定
            </button>
            {isLoading && (
              <span className="text-sm text-gray-500">更新中...</span>
            )}
          </>
        )}
      </div>

      {members.length > 0 && data.length > 0 && (
        <div className="overflow-x-auto">
          <div
            className="mb-2"
            style={{
              width: contentWidth,
            }}
          >
            {members.map((member) => (
              <div
                key={member.familyMemberId}
                className="grid"
                style={{ gridTemplateColumns: ageGridColumns }}
              >
                <div className="py-1 px-2 text-sm font-medium text-gray-900 text-left">
                  {member.name}
                </div>
                {data.map((yearData) => {
                  const memberData = yearData.members.find(
                    (m) => m.familyMemberId === member.familyMemberId
                  );
                  return (
                    <div
                      key={`${member.familyMemberId}-${yearData.year}`}
                      className="text-center text-[10px] py-1 px-0.5 text-gray-700"
                    >
                      {memberData?.age}
                    </div>
                  );
                })}
                <div aria-hidden="true" />
              </div>
            ))}
          </div>

          <ResponsiveContainer width={contentWidth} height={300}>
            <ComposedChart
              data={data}
              barCategoryGap={BAR_CATEGORY_GAP}
              barGap={BAR_GAP}
              margin={{
                top: CHART_MARGIN_TOP,
                right: CHART_RIGHT_MARGIN,
                left: CHART_LEFT_MARGIN,
                bottom: CHART_MARGIN_BOTTOM,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10 }}
                tickFormatter={formatYearTick}
                interval={0}
                width={30}
              />
              <YAxis tick={{ fontSize: 12 }} width={Y_AXIS_WIDTH} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                }}
              />
              <Bar
                dataKey="totalIncome"
                fill="var(--color-success)"
                isAnimationActive={false}
              />
              <Bar
                dataKey="totalExpense"
                fill="var(--color-primary)"
                isAnimationActive={false}
              />
              <Bar
                dataKey="hiddenIncome"
                fill="var(--color-danger)"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
