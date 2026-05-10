'use client';

import { useActionState } from 'react';

interface IncomeRecord {
  id: string;
  monthly_salary: number;
  bonus_months: number;
  bonus_payment_months: string;
  expected_raise_rate: number;
  start_year: number;
  end_year: number | null;
}

interface Props {
  action: (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ 成功?: boolean; エラー?: string } | null | undefined>;
  defaultValues?: IncomeRecord;
}

export default function IncomeForm({ action, defaultValues }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);
  const currentYear = new Date().getFullYear();
  const minYear = 2020;
  const maxYear = currentYear + 50;

  return (
    <form action={formAction} className="space-y-6">
      {state?.エラー && (
        <div
          className="p-4 rounded-md"
          style={{
            backgroundColor: 'rgba(242, 131, 121, 0.1)',
            borderColor: 'var(--error)',
            borderWidth: '1px',
          }}
        >
          <p className="text-sm text-error">{state.エラー}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="start_year"
            className="block text-sm font-medium text-gray-900"
          >
            開始年度
          </label>
          <input
            type="number"
            name="start_year"
            id="start_year"
            defaultValue={defaultValues?.start_year || currentYear}
            min={minYear}
            max={maxYear}
            required
            disabled={isPending}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="end_year"
            className="block text-sm font-medium text-gray-900"
          >
            終了年度
            <span className="text-sm text-gray-500 font-normal ml-1">
              (オプション)
            </span>
          </label>
          <input
            type="number"
            name="end_year"
            id="end_year"
            defaultValue={defaultValues?.end_year || ''}
            min={minYear}
            max={maxYear}
            disabled={isPending}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="monthly_salary"
          className="block text-sm font-medium text-gray-900"
        >
          月給 (円)
        </label>
        <input
          type="number"
          name="monthly_salary"
          id="monthly_salary"
          defaultValue={defaultValues?.monthly_salary || ''}
          min="0"
          step="10000"
          required
          disabled={isPending}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="bonus_months"
          className="block text-sm font-medium text-gray-900"
        >
          ボーナス (月給の何ヶ月分)
        </label>
        <input
          type="number"
          name="bonus_months"
          id="bonus_months"
          defaultValue={defaultValues?.bonus_months || ''}
          min="0"
          max="12"
          step="0.5"
          required
          disabled={isPending}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          支給月
        </label>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const isChecked = defaultValues?.bonus_payment_months
              ?.split(',')
              .filter(Boolean)
              .includes(month.toString());
            return (
              <label
                key={month}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name="bonus_payment_month"
                  value={month}
                  defaultChecked={isChecked}
                  disabled={isPending}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{month}月</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="expected_raise_rate"
          className="block text-sm font-medium text-gray-900"
        >
          想定昇給率 (%)
        </label>
        <input
          type="number"
          name="expected_raise_rate"
          id="expected_raise_rate"
          defaultValue={
            defaultValues
              ? (defaultValues.expected_raise_rate * 100).toFixed(1)
              : '0'
          }
          min="0"
          max="100"
          step="0.1"
          required
          disabled={isPending}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-primary-text py-2 px-4 rounded-md hover:bg-primary-hover disabled:opacity-50 font-medium"
      >
        {isPending ? '処理中...' : '保存'}
      </button>
    </form>
  );
}
