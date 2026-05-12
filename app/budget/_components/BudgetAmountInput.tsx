'use client';

import { useActionState, useState, useTransition } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { 予算設定 } from '@/app/actions/budgets';
import { useToast } from '@/lib/hooks/useToast';

interface Props {
  budgetSetId: string;
  categoryId: string;
  categoryName: string;
  categoryColor?: string;
  defaultAmount: number | null;
  monthlyAmounts?: Record<string, number>;
}

const MONTHS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
];

export default function BudgetAmountInput({
  budgetSetId,
  categoryId,
  categoryName,
  categoryColor,
  defaultAmount,
  monthlyAmounts,
}: Props) {
  const [amount, setAmount] = useState(defaultAmount?.toString() || '');
  const [isMonthlyMode, setIsMonthlyMode] = useState(
    !!monthlyAmounts && Object.keys(monthlyAmounts).length > 0
  );
  const [monthlyValues, setMonthlyValues] = useState<Record<string, string>>(
    monthlyAmounts
      ? Object.fromEntries(
          Object.entries(monthlyAmounts).map(([key, val]) => [key, val.toString()])
        )
      : Object.fromEntries(MONTHS.map((_, i) => [(i + 1).toString(), '']))
  );
  const [isExpanded, setIsExpanded] = useState(false);
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
    if (isMonthlyMode) {
      form.set('月別金額', JSON.stringify(monthlyValues));
    } else {
      form.set('金額', amount);
    }
    startTransition(() => {
      formAction(form);
    });
  };

  const toggleMonthlyMode = () => {
    setIsMonthlyMode(!isMonthlyMode);
    setIsExpanded(false);
  };

  const handleMonthlyChange = (month: string, value: string) => {
    setMonthlyValues((prev) => ({
      ...prev,
      [month]: value,
    }));
  };

  return (
    <div className="space-y-2">
      <form action={formAction} className="flex items-center gap-2">
        <label className="flex-1 flex items-center gap-2 text-sm text-gray-700">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: categoryColor || '#808080' }}
          />
          {categoryName}
        </label>
        <div className="flex items-center gap-1">
          {!isMonthlyMode && (
            <>
              <span className="text-sm text-gray-600 w-8 text-black">月額</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={handleBlur}
                placeholder="0"
                min="0"
                step="1000"
                className="w-28 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-right text-black"
              />
              <span className="text-sm text-gray-600 w-8">円</span>
            </>
          )}
          {isMonthlyMode && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 text-sm text-primary hover:opacity-70 transition-opacity flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} />
                  月別設定
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  月別設定
                </>
              )}
            </button>
          )}
          <div className="flex gap-1 border border-gray-300 rounded">
            <button
              type="button"
              onClick={() => !isMonthlyMode || toggleMonthlyMode()}
              className={`px-3 py-1 text-xs font-medium rounded-l transition-colors ${
                !isMonthlyMode
                  ? 'bg-primary text-primary-text'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              一定
            </button>
            <button
              type="button"
              onClick={() => isMonthlyMode || toggleMonthlyMode()}
              className={`px-3 py-1 text-xs font-medium rounded-r transition-colors ${
                isMonthlyMode
                  ? 'bg-primary text-primary-text'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              月別
            </button>
          </div>
        </div>
      </form>

      {isMonthlyMode && isExpanded && (
        <div className="ml-5 grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded-md">
          {MONTHS.map((month, index) => (
            <div key={month} className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">{month}</label>
              <input
                type="number"
                value={monthlyValues[(index + 1).toString()] || ''}
                onChange={(e) => {
                  handleMonthlyChange((index + 1).toString(), e.target.value);
                }}
                onBlur={handleBlur}
                placeholder="0"
                min="0"
                step="1000"
                className="px-2 py-1 border border-gray-300 rounded text-sm text-right text-black focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
