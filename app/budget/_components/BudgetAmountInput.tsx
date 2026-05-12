'use client';

import { useActionState, useState, useTransition } from 'react';
import { 予算設定 } from '@/app/actions/budgets';
import { useToast } from '@/lib/hooks/useToast';

interface Props {
  budgetSetId: string;
  categoryId: string;
  categoryName: string;
  categoryColor?: string;
  defaultAmount: number | null;
}

export default function BudgetAmountInput({
  budgetSetId,
  categoryId,
  categoryName,
  categoryColor,
  defaultAmount,
}: Props) {
  const [amount, setAmount] = useState(defaultAmount?.toString() || '');
  const { error: showError, success } = useToast();
  const [, startTransition] = useTransition();

  const actionWithParams = async (prevState: unknown, formData: FormData) => {
    const result = await 予算設定(budgetSetId, categoryId, prevState, formData);
    if (result?.成功) {
      success('予算を設定しました', 1.0, 'completed');
    } else if (result?.エラー) {
      showError(result.エラー, 2.0);
    }
    return result;
  };

  const [_state, formAction] = useActionState(actionWithParams, null);

  const handleBlur = () => {
    const form = new FormData();
    form.set('金額', amount);
    startTransition(() => {
      formAction(form);
    });
  };

  return (
    <form action={formAction} className="flex items-center gap-2">
      <label className="flex-1 flex items-center gap-2 text-sm text-gray-700">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: categoryColor || '#808080' }}
        />
        {categoryName}
      </label>
      <input
        type="number"
        name="金額"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onBlur={handleBlur}
        placeholder="0"
        min="0"
        className="w-28 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-right"
      />
      <span className="text-sm text-gray-600 w-8">円</span>
    </form>
  );
}
