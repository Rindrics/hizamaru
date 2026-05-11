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

interface Props {
  projections: ProjectionYear[];
}

export default function ProjectionChart({ projections }: Props) {
  if (projections.length === 0) {
    return null;
  }

  const data = projections.map((d) => ({
    ...d,
    hiddenIncome: Math.max(0, d.totalExpense - d.totalIncome),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={data}
        barCategoryGap="-100%"
        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12 }}
          width={30}
        />
        <YAxis tick={{ fontSize: 12 }} width={60} />
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
  );
}
