'use client';

import { useActionState } from 'react';

interface Props {
  action: (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ 成功?: boolean; エラー?: string } | null | undefined>;
  defaultValue?: string;
  isEditing?: boolean;
}

export default function BudgetSetForm({
  action,
  defaultValue,
  isEditing,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="名前"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          セット名
        </label>
        <input
          type="text"
          id="名前"
          name="名前"
          defaultValue={defaultValue}
          placeholder="例: 実績ベース、投資多め"
          disabled={isPending}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-black"
          required
        />
      </div>

      {state?.エラー && (
        <div className="p-3 rounded-md text-error bg-error/10">
          {state.エラー}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-primary-text py-2 rounded-md hover:bg-primary-hover disabled:opacity-50"
      >
        {isPending
          ? isEditing
            ? '更新中...'
            : '作成中...'
          : isEditing
            ? 'セットを更新'
            : 'セットを作成'}
      </button>
    </form>
  );
}
