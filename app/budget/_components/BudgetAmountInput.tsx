'use client';

import { useState, useTransition } from 'react';
import { ChevronDown, ChevronUp, X, Check } from 'lucide-react';
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
          Object.entries(monthlyAmounts).map(([key, val]) => [
            key,
            val.toString(),
          ])
        )
      : Object.fromEntries(MONTHS.map((_, i) => [(i + 1).toString(), '']))
  );
  const [initialMonthlyValues] = useState<Record<string, string>>(
    monthlyAmounts
      ? Object.fromEntries(
          Object.entries(monthlyAmounts).map(([key, val]) => [
            key,
            val.toString(),
          ])
        )
      : Object.fromEntries(MONTHS.map((_, i) => [(i + 1).toString(), '']))
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { error: showError, success } = useToast();

  const hasChanges =
    isMonthlyMode
      ? JSON.stringify(monthlyValues) !== JSON.stringify(initialMonthlyValues)
      : amount !== (defaultAmount?.toString() || '');

  // Debug log
  console.log(`[${categoryName}] hasChanges:`, {
    hasChanges,
    amount,
    defaultAmount,
    isMonthlyMode,
    monthlyValues,
    initialMonthlyValues,
  });

  const handleSave = () => {
    if (isMonthlyMode) {
      const hasValues = Object.values(monthlyValues).some((v) => v);
      if (!hasValues) return;
    } else {
      if (!amount) return;
    }

    startTransition(async () => {
      try {
        console.log('[BudgetAmountInput] Saving...');
        const form = new FormData();
        if (isMonthlyMode) {
          form.set('月別金額', JSON.stringify(monthlyValues));
        } else {
          form.set('金額', amount);
        }

        const result = await 予算設定(budgetSetId, categoryId, null, form);
        console.log('[BudgetAmountInput] Result:', result);
        if (result?.成功) {
          success('予算を設定しました', 1.0, 'completed');
        } else if (result?.エラー) {
          showError(result.エラー, 2.0);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        showError(`エラー: ${message}`, 2.0);
        console.error('Budget save error:', err);
      }
    });
  };

  const handleDiscard = () => {
    setAmount(defaultAmount?.toString() || '');
    setMonthlyValues(initialMonthlyValues);
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
      <div className="flex items-center gap-2">
        <label className="flex-1 flex items-center gap-2 text-sm text-gray-700">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: categoryColor || '#808080' }}
          />
          {categoryName}
        </label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {!isMonthlyMode && (
              <>
                <span className="text-sm text-gray-600 w-8 text-black">
                  月額
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1000"
                  disabled={isPending}
                  className="w-28 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-right text-black disabled:opacity-50"
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
                disabled={isPending}
                className={`px-3 py-1 text-xs font-medium rounded-l transition-colors disabled:opacity-50 ${
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
                disabled={isPending}
                className={`px-3 py-1 text-xs font-medium rounded-r transition-colors disabled:opacity-50 ${
                  isMonthlyMode
                    ? 'bg-primary text-primary-text'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                月別
              </button>
            </div>
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !hasChanges}
              className={`p-1 flex items-center gap-1 transition-all ${
                hasChanges
                  ? 'text-primary hover:opacity-70 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed'
              } disabled:opacity-50`}
              title="予算を確定"
            >
              <Check size={18} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isPending || !hasChanges}
              className={`p-1 flex items-center gap-1 transition-all ${
                hasChanges
                  ? 'text-gray-500 hover:text-gray-700 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed'
              } disabled:opacity-50`}
              title="変更を破棄"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

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
                placeholder="0"
                min="0"
                step="1000"
                disabled={isPending}
                className="px-2 py-1 border border-gray-300 rounded text-sm text-right text-black focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
