'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 予算セット設定 } from '@/app/actions/lifePlans';
import { useToast } from '@/lib/hooks/useToast';
import type { 予算セット } from '@/types';

interface Props {
  lifePlanId: string;
  currentBudgetSetId?: string;
  budgetSets: 予算セット[];
}

export default function BudgetSetSelector({
  lifePlanId,
  currentBudgetSetId,
  budgetSets,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const { success, error: showError } = useToast();
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const budgetSetId = event.target.value || null;

    startTransition(async () => {
      try {
        await 予算セット設定(lifePlanId, budgetSetId);
        success('予算セットを設定しました', 1.0, 'completed');
        setTimeout(() => router.refresh(), 1500);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        showError(`設定に失敗しました: ${message}`, 2.0);
      }
    });
  };

  return (
    <div className="mb-6">
      <label
        htmlFor="budget_set_id"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        予算セット
      </label>
      <select
        id="budget_set_id"
        value={currentBudgetSetId || ''}
        onChange={handleChange}
        disabled={isPending}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-black"
      >
        <option value="">選択なし</option>
        {budgetSets.map((set) => (
          <option key={set.ID} value={set.ID}>
            {set.名前}
          </option>
        ))}
      </select>
      <p className="mt-1 text-sm text-gray-500">
        このライフプランで使用する予算セットを選択します
      </p>
    </div>
  );
}
