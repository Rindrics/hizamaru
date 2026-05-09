'use client';

import { useActionState } from 'react';
import type { ライフプラン } from '@/types';

interface Props {
  action: (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ 成功?: boolean; エラー?: string } | null | undefined>;
  defaultValues?: ライフプラン;
}

export default function LifePlanForm({ action, defaultValues }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!e.currentTarget.名前.value) {
      e.preventDefault();
      return;
    }
  };

  return (
    <form action={formAction} className="space-y-6" onSubmit={handleSubmit}>
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
          htmlFor="名前"
          className="block text-sm font-medium text-gray-900"
        >
          ライフプラン名
        </label>
        <input
          type="text"
          name="名前"
          id="名前"
          defaultValue={defaultValues?.名前 || ''}
          required
          disabled={isPending}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="説明"
          className="block text-sm font-medium text-gray-900"
        >
          説明
        </label>
        <textarea
          name="説明"
          id="説明"
          defaultValue={defaultValues?.説明 || ''}
          disabled={isPending}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>

      {defaultValues && (
        <div className="flex items-center">
          <input
            type="checkbox"
            name="有効フラグ"
            id="有効フラグ"
            defaultChecked={defaultValues.有効フラグ}
            disabled={isPending}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label
            htmlFor="有効フラグ"
            className="ml-2 text-sm font-medium text-gray-900"
          >
            メインプランに設定
          </label>
        </div>
      )}

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
