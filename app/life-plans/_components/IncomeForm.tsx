'use client';

import { useActionState } from 'react';

interface IncomeRecord {
  id: string;
  life_plan_id: string;
  family_member_id: string;
  name: string | null;
  created_at: string;
  updated_at: string;
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

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-900"
        >
          表示名
          <span className="text-sm text-gray-500 font-normal ml-1">
            (オプション)
          </span>
        </label>
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={defaultValues?.name || ''}
          placeholder="例: 本業、副業、アルバイト"
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
