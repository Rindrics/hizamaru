'use client';

import { useActionState } from 'react';

interface HobbyActivityTerm {
  id: string;
  hobby_activity_id: string;
  monthly_fee: number;
  start_year: number;
  end_year: number | null;
  created_at: string;
}

interface Props {
  action: (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ 成功?: boolean; エラー?: string } | null | undefined>;
  defaultValues?: HobbyActivityTerm;
}

export default function HobbyActivityTermForm({
  action,
  defaultValues,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 51 }, (_, i) => currentYear - 10 + i);

  return (
    <form action={formAction} className="space-y-4">
      {state?.エラー && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {state.エラー}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          月謝（円）
        </label>
        <input
          type="number"
          name="monthly_fee"
          required
          min="0"
          step="1000"
          defaultValue={defaultValues?.monthly_fee ?? ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            開始年
          </label>
          <select
            name="start_year"
            required
            defaultValue={defaultValues?.start_year ?? ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
          >
            <option value="">選択</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            終了年（任意）
          </label>
          <select
            name="end_year"
            defaultValue={defaultValues?.end_year ?? ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black"
          >
            <option value="">継続中</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
}
