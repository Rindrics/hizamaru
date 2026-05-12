'use client';

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
import {
  CHART_CONFIG,
  CHART_LEFT_MARGIN,
} from '@/app/life-plans/_constants/chartConfig';

interface LifePlanChartProps {
  projections: ProjectionYear[];
  height?: number;
}

export default function LifePlanChart({
  projections,
  height = 120,
}: LifePlanChartProps) {
  if (projections.length === 0) {
    return null;
  }

  const data = projections.map((d) => ({
    ...d,
    hiddenIncome: Math.max(0, d.totalExpense - d.totalIncome),
  }));

  return (
    <div className="mt-3 -mx-4 px-4">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          barCategoryGap={CHART_CONFIG.BAR_CATEGORY_GAP}
          barGap={CHART_CONFIG.BAR_GAP}
          margin={{
            top: CHART_CONFIG.CHART_MARGIN_TOP,
            right: CHART_CONFIG.CHART_RIGHT_MARGIN,
            left: CHART_LEFT_MARGIN,
            bottom: CHART_CONFIG.CHART_MARGIN_BOTTOM,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fontSize: 10 }} width={30} />
          <YAxis tick={{ fontSize: 10 }} width={CHART_CONFIG.Y_AXIS_WIDTH} />
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
            fillOpacity={0.3}
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
  );
}
