'use client';

import { useActionState } from 'react';

interface Props {
  action: (
    prevState: unknown,
    formData: FormData
  ) => Promise<{ 成功?: boolean; エラー?: string } | null | undefined>;
  defaultValue?: string;
  defaultColor?: string;
  isEditing?: boolean;
}

export default function BudgetCategoryForm({
  action,
  defaultValue,
  defaultColor,
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
          カテゴリ名
        </label>
        <input
          type="text"
          id="名前"
          name="名前"
          defaultValue={defaultValue}
          placeholder="例: 食費、交際費"
          disabled={isPending}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-black"
          required
        />
      </div>

      <div>
        <label
          htmlFor="色"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          色
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            id="色"
            name="色"
            defaultValue={defaultColor || '#808080'}
            disabled={isPending}
            className="h-10 w-14 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            placeholder="#808080"
            defaultValue={defaultColor || '#808080'}
            onChange={(e) => {
              const colorInput = document.getElementById(
                '色'
              ) as HTMLInputElement;
              if (colorInput && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                colorInput.value = e.target.value;
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm text-black"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
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
            ? 'カテゴリを更新'
            : 'カテゴリを作成'}
      </button>
    </form>
  );
}
